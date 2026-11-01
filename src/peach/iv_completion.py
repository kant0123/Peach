"""把既有补全没取到的作品，用文件名线索再拾一遍。

常规的 `library_processing` 按番号走来源链；没有番号、或链上全灭的作品就此结束。
本模块在它**之后**运行，只做两段：

1. 从文件名／父目录读番号、标题和出演者（`filename_metadata`）。没有番号时用
   JavArchive 按标题与出演者搜索，只采用严格匹配且唯一的一件。
2. 把找到的番号交回既有 `process_library`，在来源链末尾追加 JavArchive 再取一次；
   候选合并、自动落库与封面都沿用既有处理。

新路径不混进常规链，常规补全的查询顺序与短路规则不变。写番号时保留
`auto:iv-completion-<批次>` 归属，同一批次可整批撤回。
"""
from __future__ import annotations

import difflib
import re
import sqlite3
import time
import unicodedata
from pathlib import Path

from .catalog_rules import is_jav_code, normalise_code_key
from .field_owners import write_owned_fields
from .filename_metadata import infer
from .jav_cover_fetch import DeadlineExceeded
from .metadata_routes import classify, route_for_code
from .sources import Session
from .sources.javarchive import JavArchiveSource

SOURCE_PREFIX = "auto:iv-completion"
#: 一趟最多回填多少部；剩下的下一趟接着做，避免一个后台任务跑成无界扫描。
BATCH_LIMIT = 30
#: JavArchive 关键词搜索最多看几条结果页。
SEARCH_LIMIT = 3


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
    wanted = [_normal(name) for name in clue if _normal(name)]
    if not wanted:
        return True
    found = [_normal(row.get("japanese_name")) for row in record.get("actresses") or []
             if isinstance(row, dict)]
    if not found:
        # 搜索结果页常只把出演者写在标题里，正文没填「出演」；标题里能对上也算证据。
        title = _normal(record.get("title"))
        return any(name and name in title for name in wanted)
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


def identify(provider, clue: dict, *, deadline=None) -> str:
    """用 JavArchive 的关键词搜索把文件名线索收敛成一个番号；不唯一就返回空串。"""
    if not clue or clue.get("code"):
        return str(clue.get("code") or "")
    codes: list[str] = []
    session = Session(provider.transport, deadline)
    for query in _queries(clue):
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
    return codes[0] if len(codes) == 1 else ""


def _row(connection: sqlite3.Connection, asset_id: int) -> dict | None:
    row = connection.execute(
        "SELECT id,path,name,code,studio,creator,release_date FROM asset "
        "WHERE id=? AND medium='video' AND disposal IS NULL", (int(asset_id),)).fetchone()
    return dict(row) if row is not None else None


def _override(code: str, row: dict) -> dict[str, tuple[str, ...]] | None:
    kind = classify(code, row.get("path"), row.get("name"), row.get("studio"))
    if kind in ("kmib", "other", "unknown", "fc2"):
        return None
    chain = route_for_code(code, row.get("path"), row.get("name"), row.get("studio"))
    if not chain:
        return None
    return {kind: (*chain, "javarchive") if "javarchive" not in chain else chain}


def complete(config, database, candidate_root, cover_root, asset_ids, *,
             report=lambda **values: None, active=lambda: True,
             batch_id: str | None = None, limit: int = BATCH_LIMIT) -> dict:
    """对一批未取得资料的作品跑第二趟；返回本趟统计。

    `asset_ids` 是通常处理结束后仍缺标题／出演者／封面的资产。番号能从文件名或
    JavArchive 搜索确认的才继续；其余保持现状，不生成猜测。
    """
    from .library_processing import METADATA_STAGE, process_library

    batch = (batch_id or time.strftime("iv-%Y%m%d-t%H%M%S")).lower()
    owner = f"{SOURCE_PREFIX}-{batch}"
    stats = dict(attempted=0, identified=0, processed=0, applied=0, covers=0, skipped=0, failed=0)
    provider = None
    try:
        from .library_processing import LibraryMetadataProvider
        provider = LibraryMetadataProvider(config.directory("secrets"), tools_root=config.directory("tools"))
        for asset_id in list(asset_ids)[:max(0, int(limit))]:
            if not active():
                break
            stats["attempted"] += 1
            with database.read_connection() as connection:
                row = _row(connection, int(asset_id))
            if row is None:
                stats["skipped"] += 1
                continue
            clue = infer(row.get("name"), row.get("path")) or {}
            code = (normalise_code_key(row.get("code")) if row.get("code") else "") or clue.get("code") or ""
            if not code:
                code = identify(provider, clue)
                if not code:
                    stats["skipped"] += 1
                    continue
                try:
                    with database.write_transaction() as connection:
                        written = write_owned_fields(connection, [int(asset_id)], {"code": code},
                                                     owner, require_empty=True)
                except (ValueError, sqlite3.Error):
                    stats["failed"] += 1
                    continue
                if "code" in written.written:
                    stats["identified"] += 1
                elif code != normalise_code_key(row.get("code")):
                    stats["skipped"] += 1
                    continue
            if not is_jav_code(code):
                stats["skipped"] += 1
                continue
            overrides = _override(code, row)
            if overrides is None:
                stats["skipped"] += 1
                continue
            report(stage="补全未取得的资料", current_action="iv_completion",
                   current_asset_id=int(asset_id), current_asset_name=Path(str(row.get("name") or "")).name)
            state_file = config.directory("state") / "iv-completion" / f"{asset_id}.json"
            state_file.parent.mkdir(parents=True, exist_ok=True)
            try:
                result = process_library(
                    config, database.db_path, candidate_root, cover_root,
                    database=database, asset_ids=[int(asset_id)], stage=METADATA_STAGE,
                    route_overrides=overrides, recheck_existing=True,
                    job_id=f"{batch}-{asset_id}", state_file=state_file,
                    active=active, report=lambda value, asset_id=asset_id, row=row: report(**{
                        "stage": value.get("stage") or "补全未取得的资料",
                        "current_action": value.get("current_action") or "iv_completion",
                        "current_asset_id": int(asset_id),
                        "current_asset_name": Path(str(row.get("name") or "")).name,
                    }))
            except DeadlineExceeded:
                stats["failed"] += 1
                continue
            except Exception:  # noqa: BLE001 - 单部失败保留其他部的结果
                stats["failed"] += 1
                continue
            stats["processed"] += 1
            stats["applied"] += int(result.get("auto_applied") or 0)
            stats["covers"] += int(result.get("covers") or 0)
    except Exception:  # noqa: BLE001 - 后段补全失败不能让前一趟的成功结果回滚
        stats["failed"] += 1
    finally:
        if provider is not None and hasattr(provider, "close"):
            provider.close()
    return stats
