#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""把账本里被换成中文的女优规范名恢复成日文名（ADR-0131）。

女优规范名用日文名：`纯白彩永` 恢复成 `純白彩永`，`逢泽美优` 恢复成 `逢沢みゆ`。中文写法
降为别名，搜索照样命中；界面的中文显示由 `performer_name_display` 按字形投影。

只用账本里已经留下的日文写法，不译、不猜。证据按顺序取第一个：

1. `name_localization.jp`：译名脚本写下的映射日文名（`localization-record`）；
2. `name_preference.previous_name`：自动（`auto:` 来源）改名前的规范名（`previous-name`）；
3. 别名来源 `kanji-simplification`：字形归一前的规范名，且与现名折成同一个字形
   （`kanji-original`）。

候选必须已经是这位女优的别名，且含汉字或假名。取不到证据的人记「未取得」，不动；
用户自己选定的名字（`user:`、`review:`）不动；目标名被别的女优占着只报告重名。

默认只产出复核 CSV；`--apply` 写真实 ledger 时必须同时提供 `--backup`。改名走
`prefer_entity_name`，同步作品署名与兼容标签，原中文名保留为别名。
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from peach.config import GENERATED_DIR
from peach.entities import normalize_entity_name, prefer_entity_name
from peach.kanji import fold_glyphs
from peach.review_csv import write_rows
from peach.scripting import add_ledger_write_args, counts_of, open_for_write, verify_after_write

NAME_SOURCE = "restore:japanese-name"
KANJI_ALIAS_SOURCE = "kanji-simplification"
#: 只有纯汉字的规范名才可能是中文写法；含假名的已经是日文，含拉丁字母的不在本脚本范围。
_HAN_ONLY = re.compile(r"[一-鿿·]+")
_JAPANESE = re.compile(r"[぀-ヿ一-鿿]")
#: 自己选定的名字。`prefer_entity_name` 用同一前缀区分人工与自动来源。
_PROTECTED = ("user:", "review:")

FIELDS = ("entity_id", "current_name", "target_name", "assets", "basis", "resolution", "action")


def _metadata(raw: object) -> dict:
    try:
        value = json.loads(raw or "{}")
    except (TypeError, ValueError):
        return {}
    return value if isinstance(value, dict) else {}


def _evidence(canonical: str, metadata: dict,
              aliases: dict[str, tuple[str, str]]) -> list[tuple[str, str]]:
    """按证据顺序给出 `(basis, 日文写法)`；写法须已是别名，且含汉字或假名。"""
    wanted: list[tuple[str, str]] = []
    localization = metadata.get("name_localization")
    if isinstance(localization, dict):
        wanted.append(("localization-record", str(localization.get("jp") or "")))
    preference = metadata.get("name_preference")
    # 只认自动改名（种子、译名脚本）留下的原名；本脚本自己的记录里原名是中文，不能再当日文用。
    if isinstance(preference, dict) and str(preference.get("source", "")).startswith("auto:"):
        wanted.append(("previous-name", str(preference.get("previous_name") or "")))
    folded = normalize_entity_name(fold_glyphs(canonical))
    wanted.extend(("kanji-original", spelling) for spelling, source in aliases.values()
                  if source == KANJI_ALIAS_SOURCE
                  and normalize_entity_name(fold_glyphs(spelling)) == folded)
    found = []
    for basis, name in wanted:
        key = normalize_entity_name(name)
        if key in aliases and _JAPANESE.search(name) and key != normalize_entity_name(canonical):
            found.append((basis, aliases[key][0]))
    return found


def collect(connection: sqlite3.Connection) -> list[dict[str, object]]:
    """审计全部纯汉字规范名的女优，返回可重放的恢复计划。"""
    connection.row_factory = sqlite3.Row
    aliases: dict[int, dict[str, tuple[str, str]]] = defaultdict(dict)
    for row in connection.execute("SELECT entity_id,alias,source FROM entity_alias ORDER BY rowid"):
        aliases[int(row["entity_id"])].setdefault(
            normalize_entity_name(str(row["alias"])), (str(row["alias"]), str(row["source"])))
    names = {str(row["normalized_name"]): int(row["id"]) for row in connection.execute(
        "SELECT id,normalized_name FROM entity WHERE kind='performer'")}
    entities = connection.execute(
        "SELECT e.id,e.canonical_name,e.metadata_json,"
        " (SELECT count(DISTINCT ae.asset_id) FROM asset_entity ae WHERE ae.entity_id=e.id) assets"
        " FROM entity e WHERE e.kind='performer' ORDER BY e.id").fetchall()
    rows: list[dict[str, object]] = []
    for entity in entities:
        canonical = str(entity["canonical_name"])
        if not _HAN_ONLY.fullmatch(canonical):
            continue
        entity_id = int(entity["id"])
        metadata = _metadata(entity["metadata_json"])
        row: dict[str, object] = {
            "entity_id": entity_id, "current_name": canonical, "target_name": canonical,
            "assets": int(entity["assets"]), "basis": "", "resolution": "", "action": ""}
        rows.append(row)
        preference = metadata.get("name_preference")
        if isinstance(preference, dict) and str(preference.get("source", "")).startswith(_PROTECTED):
            row.update(resolution="用户选定的名字", action="keep-user-choice")
            continue
        candidates = _evidence(canonical, metadata, aliases[entity_id])
        if not candidates:
            row.update(resolution="未取得：账本里没有留存的日文写法", action="keep-unresolved")
            continue
        # 证据按顺序取第一档；同一档里写法不同就不猜。
        basis = candidates[0][0]
        targets = {name for found, name in candidates if found == basis}
        row.update(basis=basis)
        if len(targets) > 1:
            row.update(resolution="同一档证据有多个日文写法", action="keep-ambiguous")
            continue
        target = targets.pop()
        owner = names.get(normalize_entity_name(target))
        row.update(target_name=target)
        if owner is not None and owner != entity_id:
            row.update(resolution=f"目标名已被实体 {owner} 占用", action="conflict")
        else:
            row.update(resolution="恢复日文规范名", action="restore")
    return rows


def apply_rows(connection: sqlite3.Connection, rows: list[dict[str, object]]) -> dict[str, int]:
    counts: Counter[str] = Counter()
    for row in rows:
        if row["action"] != "restore":
            continue
        result = prefer_entity_name(
            connection, int(row["entity_id"]), str(row["target_name"]), source=NAME_SOURCE)
        if result["changed"]:
            counts["renamed"] += 1
            counts["actor_tags_rewritten"] += int(result["flat_rewritten"])
    return dict(counts)


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    write_rows(path, FIELDS, rows, fill_missing=True)


#: 本脚本自己关心的口径；基础计数由 `scripting.counts_of` 给。
EXTRA_COUNTS = {
    "performer": "SELECT count(*) FROM entity WHERE kind='performer'",
    "asset_tag": "SELECT count(*) FROM asset_tag",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="把中文女优规范名恢复成账本里留存的日文名")
    add_ledger_write_args(parser)
    parser.add_argument(
        "--review-csv", type=Path,
        default=GENERATED_DIR / "performer-japanese-name-restore.csv")
    return parser


def run(args: argparse.Namespace) -> int:
    connection = open_for_write(args)
    try:
        rows = collect(connection)
        write_csv(args.review_csv, rows)
        print(f"已审计纯汉字规范名的 performer {len(rows)} 位；复核 CSV：{args.review_csv}")
        print("  动作分布：", dict(Counter(str(row["action"]) for row in rows)))
        stuck = [row for row in rows if row["action"] in {"conflict", "keep-ambiguous"}]
        for row in stuck:
            print(f"  待裁决：{row['entity_id']} {row['current_name']} -> "
                  f"{row['target_name']}（{row['resolution']}）")
        if not args.apply:
            print("  未写 ledger（加 --apply --backup 才写）")
            return 1 if stuck else 0

        print(f"  已备份到 {args.backup}")
        before = counts_of(connection, EXTRA_COUNTS)
        with connection:
            changed = apply_rows(connection, rows)
        after = counts_of(connection, EXTRA_COUNTS)
        integrity, foreign_keys = verify_after_write(connection)
        print("  写入结果：", changed)
        for key in before:
            print(f"    {key}: {before[key]} -> {after[key]}")
        print(f"  integrity_check={integrity}；foreign_key_check={foreign_keys}")
        return 1 if integrity != "ok" or foreign_keys or stuck else 0
    finally:
        connection.close()


def main(argv: list[str] | None = None) -> int:
    return run(build_parser().parse_args(argv))


if __name__ == "__main__":
    raise SystemExit(main())
