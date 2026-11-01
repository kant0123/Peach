"""把既有补全没取到的作品，用文件名线索再拾一遍。

常规的 `library_processing` 按番号走来源链；没有番号、或链上全灭的作品就此结束。
本模块在它**之后**运行，只做两段：

1. 从文件名／父目录读番号、标题和出演者（`filename_metadata`）。没有番号时用
   JavArchive 按标题与出演者搜索，只采用严格匹配且唯一的一件。
2. 把找到的番号交回既有 `process_library`，在来源链里把 JavArchive 排在综合索引之前
   再取一次；候选合并、自动落库与封面都沿用既有处理。

新路径不混进常规链，常规补全的查询顺序与短路规则不变。写番号时保留
`auto:iv-completion-<批次>` 归属，同一批次可整批撤回。

第二趟不再按 id 从小到大固定取前一批：`_pending_ids` 按「缺标量且常规来源全灭」
优先排序，本模块再用 `state/iv-completion/attempts.json` 记住最近试过的行，跳过
没有变化的重复尝试，让每次都往未试过的行前进。`complete_pending` 可以脱离全馆处理
单独运行（CLI 与网页的「仅补全未取得的资料」），并按路径前缀收窄范围。
"""
from __future__ import annotations

import difflib
import json
import re
import sqlite3
import time
import unicodedata
from pathlib import Path

from filelock import FileLock, Timeout

from .catalog_rules import is_jav_code, normalise_code_key
from .field_owners import write_owned_fields
from .filename_metadata import infer
from .fsutil import atomic_write_text
from .jav_cover_fetch import DeadlineExceeded
from .metadata_routes import AMANE_OFFICIAL_STAGE, OFFICIAL_STAGE, classify, route_for_code
from .sources import Session
from .sources.javarchive import JavArchiveSource
from .wiki_keyword import SougouWikiSearch

SOURCE_PREFIX = "auto:iv-completion"
#: 一趟最多回填多少部。第二趟现在会跳过最近试过的行，120 部里绝大多数是新的。
BATCH_LIMIT = 120
#: 一趟最多花多少秒；到点停手，余下的下一趟接着做。
TIME_BUDGET_SECONDS = 900
#: JavArchive 关键词搜索最多看几条结果页。
SEARCH_LIMIT = 3
#: 同一行、同一组缺失字段，最近试过就跳过；来源会补录，7 天后照旧再问一次。
RETRY_AFTER_SECONDS = 7 * 24 * 3600
#: 失败（来源冷却、超时）只隔一天，冷却结束后还能自动续上。
FAILED_RETRY_AFTER_SECONDS = 24 * 3600
#: 文件名认不出番号、搜索也没有唯一结果的行，短期内重复搜索只是白花请求。
UNIDENTIFIED_RETRY_AFTER_SECONDS = 7 * 24 * 3600
#: 韩国 MIB、国产／欧美这些本来就不该问日本来源的行，记久一点。
UNSUPPORTED_RETRY_AFTER_SECONDS = 30 * 24 * 3600
ATTEMPTS_VERSION = 1
ATTEMPTS_LIMIT = 5000
ATTEMPTS_MAX_AGE = 30 * 24 * 3600
ATTEMPTS_FILENAME = "attempts.json"


def _normal(value: object) -> str:
    text = unicodedata.normalize("NFKC", str(value or "")).casefold()
    return re.sub(r"[^0-9a-z\u3040-\u30ff\u3400-\u9fff]+", "", text)


def _title_matches(clue: str, found: str) -> bool:
    """片名是否同一部：包含关系优先，长度接近时接受高相似度。"""
    left, right = _normal(clue), _normal(found)
    if not left or not right:
        return False
    if len(left) >= 4 and (left in right or right in left):
        return True
    return difflib.SequenceMatcher(None, left, right).ratio() >= 0.8


def _cast_matches(clue: list[str], record: dict) -> bool:
    wanted = []
    for name in clue:
        for part in re.split(r"[\s、,，／/]+", str(name)):
            normalized = _normal(part)
            if normalized:
                wanted.append(normalized)
    if not wanted:
        return True
    found = []
    for row in record.get("actresses") or []:
        if not isinstance(row, dict):
            continue
        name = re.sub(r"^(?:出\s*演(?:者)?|者)\s*[:：]\s*", "", str(row.get("japanese_name") or ""))
        if normalized := _normal(name):
            found.append(normalized)
    if not found:
        # 搜索结果页常只把出演者写在标题里，正文没填「出演」；标题里能对上也算证据。
        title = _normal(record.get("title"))
        return any(name in title for name in wanted)
    return any(name and (name in other or other in name) for name in wanted for other in found)


def _record_matches(clue: dict, record: dict) -> bool:
    title = str(clue.get("title") or "")
    performers = list(clue.get("performers") or [])
    if not title and not performers:
        return False
    if title and not _title_matches(title, record.get("title") or ""):
        return False
    return _cast_matches(performers, record)


def _queries(clue: dict) -> list[str]:
    """最多两种搜法：先片名（更具体），没有片名或片名搜不到再用第一位出演者。"""
    title = " ".join(str(clue.get("title") or "").split())
    people = [str(name).strip() for name in clue.get("performers") or [] if str(name).strip()]
    found = [title] if title else []
    if people:
        found.append(people[0])
    return list(dict.fromkeys(found))[:2]


def identify(provider, clue: dict, *, deadline=None, wiki: SougouWikiSearch | None = None) -> str:
    """用 JavArchive／総合Wiki 的关键词搜索把文件名线索收敛成一个番号；不唯一就返回空串。"""
    if not clue or clue.get("code"):
        return str(clue.get("code") or "")
    codes: list[str] = []
    session = Session(provider.transport, deadline)
    queries = _queries(clue)
    for query in queries:
        try:
            records = JavArchiveSource().search_records(query, session=session, limit=SEARCH_LIMIT)
        except Exception:  # noqa: BLE001 - 单条搜索失败不阻断其他写法
            continue
        for record in records:
            payload = record.payload()
            if _record_matches(clue, payload) and record.code not in codes:
                codes.append(record.code)
        if codes:
            break
    if len(codes) != 1 and wiki is not None and wiki.available:
        for query in queries:
            for payload in wiki.search(query):
                if _record_matches(clue, payload) and payload["code"] not in codes:
                    codes.append(payload["code"])
            if len(codes) == 1:
                break
    return codes[0] if len(codes) == 1 else ""


def _sougou_wiki(config) -> SougouWikiSearch:
    """総合Wiki 的浏览器取页器；浏览器起不来时 `available` 为假，不阻断补全。"""
    return SougouWikiSearch(config.directory("state") / "browser" / "sougouwiki")


def _close_quietly(value) -> None:
    if value is None:
        return
    try:
        value.close()
    except Exception:  # noqa: BLE001 - 关闭失败不该盖住本趟统计
        pass


def _row(connection: sqlite3.Connection, asset_id: int) -> dict | None:
    row = connection.execute(
        "SELECT a.id,a.path,a.name,a.code,a.studio,a.creator,a.release_date,a.catalog_title,"
        " (SELECT group_concat(e.canonical_name) FROM asset_entity ae"
        "  JOIN entity e ON e.id=ae.entity_id"
        "  WHERE ae.asset_id=a.id AND e.kind='performer') AS performers,"
        " (SELECT group_concat(t.tag) FROM asset_tag t"
        "  WHERE t.asset_id=a.id AND t.tag NOT LIKE '演员:%') AS tags"
        " FROM asset a WHERE a.id=? AND a.medium='video' AND a.disposal IS NULL",
        (int(asset_id),)).fetchone()
    return dict(row) if row is not None else None


def _missing(row: dict) -> list[str]:
    from .library_processing import COLLECTED_FIELDS, COLUMN_OF
    return [field for field in COLLECTED_FIELDS if not row.get(COLUMN_OF.get(field, field))]


def _override(code: str, row: dict) -> dict[str, tuple[str, ...]] | None:
    """这一行的来源链：IV 先问 JavArchive，其余类型官方在前、JavArchive 次之。

    有码行的 `makers`、`prestige` 等经 amane 桥，准备桥要先建/校验一套独立运行环境；
    IV 的番号几乎不在片商官网目录里，为了一个问不出东西的档把整趟堵在准备阶段不划算。
    有码行去掉这几档、把 JavArchive 提到最前，再落到 r18dev、DMM 与综合索引；其他类型
    保持官方、JavArchive、综合索引的顺序。候选的结算顺序仍由 `metadata_policy` 决定，
    不随查询顺序变。
    """
    kind = classify(code, row.get("path"), row.get("name"), row.get("studio"))
    if kind in ("kmib", "other", "unknown", "fc2"):
        return None
    chain = route_for_code(code, row.get("path"), row.get("name"), row.get("studio"))
    if not chain:
        return None
    if kind == "censored":
        rest = tuple(source for source in chain
                     if source not in AMANE_OFFICIAL_STAGE and source != "javarchive")
        return {kind: ("javarchive", *rest)}
    if "javarchive" in chain:
        return {kind: chain}
    official = tuple(source for source in chain if source in OFFICIAL_STAGE)
    rest = tuple(source for source in chain if source not in OFFICIAL_STAGE)
    return {kind: (*official, "javarchive", *rest)}


def _attempts_path(config) -> Path:
    return config.directory("state") / "iv-completion" / ATTEMPTS_FILENAME


def _load_attempts(path: Path) -> dict:
    """读试过的行；坏文件当成空的，下一次整份重写。"""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {"version": ATTEMPTS_VERSION, "assets": {}}
    if not isinstance(data, dict) or data.get("version") != ATTEMPTS_VERSION:
        return {"version": ATTEMPTS_VERSION, "assets": {}}
    assets = data.get("assets")
    return {"version": ATTEMPTS_VERSION, "assets": assets if isinstance(assets, dict) else {}}


def _save_attempts(path: Path, attempts: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    atomic_write_text(path, json.dumps(attempts, ensure_ascii=False, sort_keys=True))


def _signature(row: dict, code: str, missing: list[str]) -> dict:
    return {"code": str(code or ""), "name": str(row.get("name") or ""),
            "missing": sorted({str(field) for field in missing})}


def _retry_after(outcome: str) -> int:
    return {"processed": RETRY_AFTER_SECONDS,
            "failed": FAILED_RETRY_AFTER_SECONDS,
            "unidentified": UNIDENTIFIED_RETRY_AFTER_SECONDS,
            "unsupported": UNSUPPORTED_RETRY_AFTER_SECONDS}.get(outcome, RETRY_AFTER_SECONDS)


def _attempt_at(entry: object) -> float:
    try:
        return float(entry.get("at") or 0) if isinstance(entry, dict) else 0.0
    except (TypeError, ValueError):
        return 0.0


def _is_fresh(entry: object, signature: dict, *, now: float, retry: bool) -> bool:
    if retry or not isinstance(entry, dict):
        return False
    if entry.get("signature") != signature:
        return False
    return now - _attempt_at(entry) < _retry_after(str(entry.get("outcome") or "processed"))


def _remember(attempts: dict, asset_id: int, outcome: str, signature: dict) -> None:
    attempts["assets"][str(int(asset_id))] = {
        "at": time.time(), "outcome": outcome, "signature": signature}


def _prune_attempts(attempts: dict, now: float) -> None:
    assets = attempts["assets"]
    for key, entry in list(assets.items()):
        if now - _attempt_at(entry) > ATTEMPTS_MAX_AGE:
            del assets[key]
    if len(assets) > ATTEMPTS_LIMIT:
        newest = sorted(assets.items(), key=lambda item: _attempt_at(item[1]),
                        reverse=True)[:ATTEMPTS_LIMIT]
        attempts["assets"] = dict(newest)


def complete(config, database, candidate_root, cover_root, asset_ids, *,
             report=lambda **values: None, active=lambda: True,
             batch_id: str | None = None, limit: int = BATCH_LIMIT,
             time_budget: float | None = TIME_BUDGET_SECONDS, retry: bool = False) -> dict:
    """对一批未取得资料的作品跑第二趟；返回本趟统计。

    `asset_ids` 是通常处理结束后仍缺标题／出演者／封面的资产，按 `_pending_ids` 的优先级
    排好。番号能从文件名或 JavArchive 搜索确认的才继续；其余保持现状，不生成猜测。

    `retry` 为真时忽略 `state/iv-completion/attempts.json` 里的近期记录；用户明确重试
    或改了文件名/缺失字段时也照常重试（见 `_is_fresh`）。
    """
    from .library_processing import LibraryMetadataProvider, METADATA_STAGE, process_library

    batch = (batch_id or time.strftime("iv-%Y%m%d-t%H%M%S")).lower()
    owner = f"{SOURCE_PREFIX}-{batch}"
    ids = list(asset_ids)
    total = len(ids)
    stats = dict(attempted=0, identified=0, processed=0, applied=0, covers=0, skipped=0,
                 skipped_recent=0, failed=0, remaining=total, stopped="")
    attempts_path = _attempts_path(config)
    attempts_path.parent.mkdir(parents=True, exist_ok=True)
    lock = FileLock(str(attempts_path) + ".lock", timeout=0)
    try:
        lock.acquire()
    except Timeout:
        stats["stopped"] = "locked"
        return stats
    attempts = _load_attempts(attempts_path)
    provider = None
    wiki = _sougou_wiki(config)
    deadline = time.monotonic() + time_budget if time_budget else None
    budget = max(0, int(limit))
    try:
        try:
            provider = LibraryMetadataProvider(config.directory("secrets"),
                                               tools_root=config.directory("tools"))
            # 跳过的近期记录不占本趟名额：否则每次都会被同一批已试过的行挡在前面，
            # 后面的行永远轮不到。
            for asset_id in ids:
                if not active():
                    stats["stopped"] = "cancelled"
                    break
                if deadline is not None and time.monotonic() >= deadline:
                    stats["stopped"] = "budget"
                    break
                with database.read_connection() as connection:
                    row = _row(connection, int(asset_id))
                if row is None:
                    stats["skipped"] += 1
                    continue
                clue = infer(row.get("name"), row.get("path")) or {}
                code = (normalise_code_key(row.get("code")) if row.get("code")
                        else "") or clue.get("code") or ""
                missing = _missing(row)
                signature = _signature(row, code, missing)
                if _is_fresh(attempts["assets"].get(str(int(asset_id))), signature,
                             now=time.time(), retry=retry):
                    stats["skipped_recent"] += 1
                    continue
                if budget and stats["attempted"] >= budget:
                    stats["stopped"] = "limit"
                    break
                stats["attempted"] += 1
                if not code:
                    code = identify(provider, clue, wiki=wiki)
                    if not code:
                        stats["skipped"] += 1
                        _remember(attempts, asset_id, "unidentified", signature)
                        continue
                    try:
                        with database.write_transaction() as connection:
                            written = write_owned_fields(connection, [int(asset_id)], {"code": code},
                                                         owner, require_empty=True)
                    except (ValueError, sqlite3.Error):
                        stats["failed"] += 1
                        _remember(attempts, asset_id, "failed", signature)
                        continue
                    if "code" in written.written:
                        stats["identified"] += 1
                        signature = _signature(row, code, missing)
                    elif code != normalise_code_key(row.get("code")):
                        stats["skipped"] += 1
                        _remember(attempts, asset_id, "unidentified", signature)
                        continue
                if not is_jav_code(code):
                    stats["skipped"] += 1
                    _remember(attempts, asset_id, "unsupported", signature)
                    continue
                overrides = _override(code, row)
                if overrides is None:
                    stats["skipped"] += 1
                    _remember(attempts, asset_id, "unsupported", signature)
                    continue
                report(stage="补全未取得的资料", current_action="iv_completion",
                       current_asset_id=int(asset_id),
                       current_asset_name=Path(str(row.get("name") or "")).name,
                       iv_checked=stats["attempted"], iv_total=total)
                state_file = config.directory("state") / "iv-completion" / f"{asset_id}.json"
                state_file.parent.mkdir(parents=True, exist_ok=True)
                try:
                    result = process_library(
                        config, database.db_path, candidate_root, cover_root,
                        database=database, asset_ids=[int(asset_id)], stage=METADATA_STAGE,
                        route_overrides=overrides, recheck_existing=False,
                        job_id=f"{batch}-{asset_id}", state_file=state_file,
                        active=active, report=lambda value, asset_id=asset_id, row=row: report(**{
                            "stage": value.get("stage") or "补全未取得的资料",
                            "current_action": value.get("current_action") or "iv_completion",
                            "current_asset_id": int(asset_id),
                            "current_asset_name": Path(str(row.get("name") or "")).name,
                        }))
                except DeadlineExceeded:
                    stats["failed"] += 1
                    _remember(attempts, asset_id, "failed", signature)
                    continue
                except Exception:  # noqa: BLE001 - 单部失败保留其他部的结果
                    stats["failed"] += 1
                    _remember(attempts, asset_id, "failed", signature)
                    continue
                stats["processed"] += 1
                stats["applied"] += int(result.get("auto_applied") or 0)
                stats["covers"] += int(result.get("covers") or 0)
                _remember(attempts, asset_id, "processed", signature)
        except Exception:  # noqa: BLE001 - 后段补全失败不能让前一趟的成功结果回滚
            stats["failed"] += 1
    finally:
        try:
            _prune_attempts(attempts, time.time())
            _save_attempts(attempts_path, attempts)
        except OSError:
            # 记不上不影响已经写进账本的结果；下次会当成没试过，最多多问一次。
            pass
        if provider is not None and hasattr(provider, "close"):
            try:
                provider.close()
            except Exception:  # noqa: BLE001 - 关闭连接失败不该盖住本趟统计
                pass
        _close_quietly(wiki)
        lock.release()
    stats["remaining"] = max(0, total - stats["attempted"] - stats["skipped_recent"])
    return stats


def complete_pending(config, database, candidate_root, cover_root, *, asset_ids=None,
                     path_prefix: str | None = None, limit: int = 500,
                     time_budget: float | None = 1800, retry: bool = False,
                     report=lambda **values: None, active=lambda: True) -> dict:
    """只跑文件名补全：不扫描、不读本地资料，先由账本算出该补哪些行。

    与全馆处理末尾的第二趟共用 `complete`，所以候选、自动落库、封面和试过记录都是
    同一套；反复执行会跳过最近试过且没有变化的行。
    """
    from .library_processing import pending_completion_ids
    pending = pending_completion_ids(config, database.db_path, cover_root,
                                     asset_ids=asset_ids, path_prefix=path_prefix)
    if not pending:
        return dict(attempted=0, identified=0, processed=0, applied=0, covers=0, skipped=0,
                    skipped_recent=0, failed=0, remaining=0, pending=0, stopped="empty")
    stats = complete(config, database, candidate_root, cover_root, pending,
                     report=report, active=active, limit=limit, time_budget=time_budget,
                     retry=retry)
    stats["pending"] = len(pending)
    stats["remaining"] = max(0, len(pending) - stats["attempted"] - stats["skipped_recent"])
    return stats
