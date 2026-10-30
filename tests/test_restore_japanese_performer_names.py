"""女优规范名恢复成日文名：证据顺序、人工保护、重名、别名保留与作品署名同步。"""
import contextlib
import csv
import io
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from peach.entities import normalize_entity_name, prefer_entity_name
from scripts.restore_japanese_performer_names import NAME_SOURCE, collect, main
from support.ledger import fresh_ledger


class RestoreJapanesePerformerNameTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name).resolve()
        self.db = fresh_ledger(self.root)
        self.con = sqlite3.connect(self.db)
        self.con.row_factory = sqlite3.Row
        self.addCleanup(self.tmp.cleanup)
        self.addCleanup(self.con.close)

    def person(self, name, *aliases, metadata=None):
        self.con.execute(
            "INSERT INTO entity(kind,canonical_name,normalized_name,metadata_json,created_at,updated_at)"
            " VALUES('performer',?,?,?,'t','t')",
            (name, normalize_entity_name(name), json.dumps(metadata or {}, ensure_ascii=False)))
        entity_id = int(self.con.execute("SELECT last_insert_rowid()").fetchone()[0])
        for alias, source in aliases:
            self.con.execute(
                "INSERT INTO entity_alias(entity_id,alias,normalized_alias,source,confidence)"
                " VALUES(?,?,?,?,1.0)", (entity_id, alias, normalize_entity_name(alias), source))
        self.con.commit()
        return entity_id

    def work(self, entity_id, name):
        self.con.execute("INSERT INTO asset(location,path,name,medium) VALUES('local',?,?,'video')",
                         (f"R:\\{entity_id}.mp4", f"{entity_id}.mp4"))
        asset_id = int(self.con.execute("SELECT last_insert_rowid()").fetchone()[0])
        self.con.execute("INSERT INTO asset_entity(asset_id,entity_id,role,source) VALUES(?,?,'performer','test')",
                         (asset_id, entity_id))
        self.con.execute("INSERT INTO asset_tag(asset_id,tag,source) VALUES(?,?,'test')", (asset_id, f"演员:{name}"))
        self.con.commit()
        return asset_id

    def rows(self):
        return {row["entity_id"]: row for row in collect(self.con)}

    def name_of(self, entity_id):
        return self.con.execute("SELECT canonical_name FROM entity WHERE id=?", (entity_id,)).fetchone()[0]

    def test_kanji_only_name_returns_to_the_original_glyphs(self):
        entity_id = self.person("纯白彩永", ("純白彩永", "kanji-simplification"))
        row = self.rows()[entity_id]
        self.assertEqual((row["action"], row["target_name"], row["basis"]), ("restore", "純白彩永", "kanji-original"))

    def test_translated_name_returns_to_the_recorded_japanese_name(self):
        entity_id = self.person(
            "逢泽美优", ("逢沢みゆ", "avdb-actor-mapping@x"),
            metadata={"name_localization": {"jp": "逢沢みゆ", "zh_cn": "逢泽美优"}})
        row = self.rows()[entity_id]
        self.assertEqual((row["action"], row["target_name"], row["basis"]), ("restore", "逢沢みゆ", "localization-record"))

    def test_name_before_an_automatic_rename_is_restored(self):
        entity_id = self.person("天使萌", ("天使もえ", "r18:performer"))
        prefer_entity_name(self.con, entity_id, "天使もえ", source="auto:seed@old")
        prefer_entity_name(self.con, entity_id, "天使萌", source="auto:seed@old")
        row = self.rows()[entity_id]
        self.assertEqual((row["action"], row["target_name"], row["basis"]), ("restore", "天使もえ", "previous-name"))

    def test_a_name_the_user_chose_is_kept(self):
        entity_id = self.person("天使萌", ("天使もえ", "r18:performer"))
        prefer_entity_name(self.con, entity_id, "天使萌", source="user:preferred-name")
        self.assertEqual(self.rows()[entity_id]["action"], "keep-user-choice")

    def test_no_recorded_japanese_name_is_reported_as_not_obtained(self):
        entity_id = self.person("三上悠亚")
        row = self.rows()[entity_id]
        self.assertEqual((row["action"], row["target_name"]), ("keep-unresolved", "三上悠亚"))
        self.assertIn("未取得", row["resolution"])

    def test_a_japanese_name_that_is_not_an_alias_is_never_invented(self):
        entity_id = self.person("逢泽美优", metadata={"name_localization": {"jp": "逢沢みゆ"}})
        self.assertEqual(self.rows()[entity_id]["action"], "keep-unresolved")

    def test_two_different_names_on_the_same_evidence_level_are_not_guessed(self):
        entity_id = self.person("泽井真", ("澤井真", "kanji-simplification"), ("沢井真", "kanji-simplification"))
        self.assertEqual(self.rows()[entity_id]["action"], "keep-ambiguous")

    def test_a_target_name_owned_by_another_performer_is_a_conflict(self):
        entity_id = self.person("纯白彩永", ("純白彩永", "kanji-simplification"))
        owner = self.person("純白彩永")
        rows = self.rows()
        self.assertEqual(rows[entity_id]["action"], "conflict")
        self.assertIn(str(owner), rows[entity_id]["resolution"])

    def test_names_with_kana_or_latin_are_out_of_scope(self):
        kana = self.person("逢沢みゆ")
        latin = self.person("Mio Hayakawa")
        self.assertNotIn(kana, self.rows())
        self.assertNotIn(latin, self.rows())

    def test_dry_run_writes_only_the_review_file(self):
        entity_id = self.person("纯白彩永", ("純白彩永", "kanji-simplification"))
        csv_path = self.root / "restore.csv"
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(main(["--db", str(self.db), "--review-csv", str(csv_path)]), 0)
        self.assertEqual(self.name_of(entity_id), "纯白彩永")
        with csv_path.open(encoding="utf-8-sig", newline="") as handle:
            self.assertEqual([row["action"] for row in csv.DictReader(handle)], ["restore"])

    def test_apply_requires_a_backup(self):
        self.person("纯白彩永", ("純白彩永", "kanji-simplification"))
        with contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit):
            main(["--db", str(self.db), "--apply", "--review-csv", str(self.root / "restore.csv")])

    def test_apply_restores_the_name_keeps_the_chinese_alias_and_syncs_work_tags(self):
        entity_id = self.person("纯白彩永", ("純白彩永", "kanji-simplification"))
        asset_id = self.work(entity_id, "纯白彩永")
        backup = self.root / "pre.db"
        with contextlib.redirect_stdout(io.StringIO()):
            code = main(["--db", str(self.db), "--apply", "--backup", str(backup),
                         "--review-csv", str(self.root / "restore.csv")])
        self.assertEqual(code, 0)
        self.assertTrue(backup.is_file())
        with sqlite3.connect(self.db) as check:
            self.assertEqual(check.execute("SELECT canonical_name FROM entity WHERE id=?", (entity_id,)).fetchone()[0], "純白彩永")
            self.assertEqual(check.execute("SELECT tag FROM asset_tag WHERE asset_id=?", (asset_id,)).fetchone()[0], "演员:純白彩永")
            aliases = dict(check.execute("SELECT alias,source FROM entity_alias WHERE entity_id=?", (entity_id,)))
        self.assertEqual(aliases.get("纯白彩永"), NAME_SOURCE)
        with sqlite3.connect(backup) as before:
            self.assertEqual(before.execute("SELECT canonical_name FROM entity WHERE id=?", (entity_id,)).fetchone()[0], "纯白彩永")

    def test_a_second_apply_changes_nothing(self):
        entity_id = self.person("纯白彩永", ("純白彩永", "kanji-simplification"))
        with contextlib.redirect_stdout(io.StringIO()):
            main(["--db", str(self.db), "--apply", "--backup", str(self.root / "pre1.db"),
                  "--review-csv", str(self.root / "restore.csv")])
            main(["--db", str(self.db), "--apply", "--backup", str(self.root / "pre2.db"),
                  "--review-csv", str(self.root / "restore.csv")])
        self.assertEqual(self.name_of(entity_id), "純白彩永")
        self.assertEqual(
            self.con.execute("SELECT count(*) FROM entity_alias WHERE entity_id=?", (entity_id,)).fetchone()[0], 2)


if __name__ == "__main__":
    unittest.main()
