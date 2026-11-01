"""IV（イメージビデオ）的作品资料：r18 的 actors 栏、JavArchive 的日文资料块与文件名末尾番号。"""
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing, contextmanager
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from peach.catalog_rules import release_code_from_filename_suffix
from peach.filename_metadata import infer
from peach.http import HttpResponse
from peach.iv_completion import (BATCH_LIMIT, TIME_BUDGET_SECONDS, _override,
                                 _record_matches, complete, complete_pending, identify)
from peach.library_processing import _path_has_prefix, _pending_ids
from peach.metadata_auto_apply import _group_identifies_code
from peach.sources import Page, R18DevSource
from peach.sources.javarchive import JavArchiveSource, _code_in_link, _search_links, links
from peach.sources.r18dev import with_japanese
from peach.wiki_keyword import SougouWikiSearch

IV_ARCHIVE_LINK = "/105865-imbd-214-%e5%88%9d%e5%86%99-%e4%bd%90%e3%80%85%e6%9c%a8%e6%a1%83%e8%8f%af-blu-ray%e7%89%88-pn.html"
IV_ARCHIVE_URL = "https://javarchive.com" + IV_ARCHIVE_LINK
IV_COVER = "https://img.javstore.net/images/2013/11/25/IMBD-214.jpg"


def iv_search_page(link=IV_ARCHIVE_LINK, heading="IMBD-214 初写 佐々木桃華 Blu-ray版"):
    return (
        '<div class="news_1n"><ul><li>'
        f'<a href="{link}" title="{heading}">{heading}</a>'
        '</li><li><a href="/other-imbd-2140" title="IMBD-2140">别的一部</a></li></ul></div>'
    )


def iv_archive_page(heading="IMBD-214 初写 佐々木桃華 Blu-ray版", cover=IV_COVER):
    return (
        '<div class="menudd"><h1>'
        f'<a href="{IV_ARCHIVE_LINK}" title="{heading}">{heading}</a>'
        '</h1></div>'
        '<div class="news"><div class="first_des">IMBD-214 初写 佐々木桃華 Blu-ray版</div>'
        '<div class="fisrst_sc">'
        f'<img src="{cover}" alt="{heading}" /></div>'
        '商品番号 IMBD-214 メディア ブルーレイ '
        'ジャンル アイドル／アイドル '
        '発　　売 2013.11.25 '
        '出　　演 佐々木桃華 '
        'メーカー：アイファクトリー '
        '<div class="downloads">https://example.invalid/file.mp4</div></div>'
    )


class R18DevActorsTests(unittest.TestCase):
    def test_combined_actors_fill_iv_performers_when_actresses_is_empty(self):
        raw = {"content_id": "n_641enfd5710", "title": "Hazuki Tokidoki Hare / Aya Hazuki",
               "actresses": [], "categories": [{"name": "Idol Video"}],
               "images": {"jacket_image": {
                   "large": " ",
                   "large2": "https://pics.dmm.co.jp/mono/movie/idol/n_641enfd5710/n_641enfd5710pl.jpg"}}}
        record = R18DevSource().parse(
            Page("https://r18.dev/videos/vod/movies/detail/-/dvd_id=ENFD-5710/json",
                 json.dumps(raw, ensure_ascii=False).encode()), "ENFD-5710")
        self.assertEqual(record.cover_urls,
                         ("https://pics.dmm.co.jp/mono/movie/idol/n_641enfd5710/n_641enfd5710pl.jpg",))
        combined = {"content_id": "n_641enfd5710", "title_ja": "葉月ときどき晴れ/葉月あや",
                    "actresses": [], "actors": [{"id": 240123, "name_kana": "はづきあや",
                                                 "name_kanji": "葉月あや"}],
                    "categories": [{"name_ja": "イメージビデオ"}]}
        found = with_japanese(record, combined)
        self.assertEqual([row["japanese_name"] for row in found.performers], ["葉月あや"])
        self.assertEqual(found.payload()["genres"], ["イメージビデオ"])


class JavArchiveIvTests(unittest.TestCase):
    def test_a_generic_code_is_searched_and_its_iv_page_gives_the_metadata(self):
        source = JavArchiveSource()
        self.assertEqual(source.search_url("IMBD-214"), "https://javarchive.com/search?q=IMBD-214")
        self.assertEqual(links(iv_search_page(), "IMBD-214"), [IV_ARCHIVE_LINK])
        self.assertEqual(links(iv_search_page(), "IMBD-2140"), [])
        self.assertEqual(links(iv_search_page(), "ORETD-615"), [])

        found = source.parse(Page(IV_ARCHIVE_URL, iv_archive_page().encode()), "IMBD-214")
        self.assertEqual((found.code, found.source_url), ("IMBD-214", IV_ARCHIVE_URL))
        self.assertEqual(found.title, "初写 佐々木桃華 Blu-ray版")
        self.assertEqual([row["japanese_name"] for row in found.performers], ["佐々木桃華"])
        self.assertEqual((found.studio, found.release_date), ("アイファクトリー", "2013-11-25"))
        self.assertEqual(found.tags, ("アイドル",))
        self.assertEqual(found.cover_urls, (IV_COVER,))

    def test_a_heading_without_this_code_is_not_this_work(self):
        with self.assertRaises(Exception) as caught:
            JavArchiveSource().parse(Page(IV_ARCHIVE_URL, iv_archive_page(heading="IMBD-2140").encode()),
                                     "IMBD-214")
        self.assertEqual(str(caught.exception), "JavArchive 上没有这个商品")

    def test_quality_prefix_and_fullwidth_punctuation_do_not_hide_the_code(self):
        link = "/370246-fhd-abp-652-pn.html"
        self.assertEqual(_code_in_link(link), "ABP-652")
        page = (f"<div class='news_1n'><a href='{link}'>"
                "FHD abp-652 同棲してるボクの彼女は多重人格！？ VOL.02 あやみ旬果</a></div>")
        self.assertEqual(_search_links(page, "同棲してるボクの彼女は多重人格!？ VOL.02 あやみ旬果"),
                         [link])

    def test_keyword_results_ignore_the_popular_sidebar(self):
        page = ("<div class='news_1n'><a href='/105865-imbd-214-x-pn.html'>IMBD-214 初写 佐々木桃華</a></div>"
                "<div class='sidebar'><a href='/999-fc2-ppv-4998939-x-pn.html'>FC2 新作</a></div>")
        self.assertEqual(_search_links(page, "IMBD-214"), ["/105865-imbd-214-x-pn.html"])
        self.assertEqual(_search_links(page, "佐々木桃華"), ["/105865-imbd-214-x-pn.html"])
        self.assertEqual(_search_links(page, "存在しない"), [])


class FilenameMetadataTests(unittest.TestCase):
    def test_a_bracketed_performer_and_title_become_clues(self):
        found = infer("[佐々木麻衣] FIRST TOUCH.mkv",
                      "E:\\GLA\\01_IV\\[佐々木麻衣] FIRST TOUCH\\[佐々木麻衣] FIRST TOUCH.mkv")
        self.assertEqual(found["performers"], ["佐々木麻衣"])
        self.assertEqual(found["title"], "FIRST TOUCH")
        self.assertEqual(found["code"], "")
        prefixed = infer("$[あやみ旬果] 絶対的鉄板シチュエーション 2.MP4",
                         "I:\\コントロールパネル\\Video\\$[あやみ旬果] 絶対的鉄板シチュエーション 2\\"
                         "$[あやみ旬果] 絶対的鉄板シチュエーション 2.MP4")
        self.assertEqual(prefixed["performers"], ["あやみ旬果"])
        self.assertEqual(prefixed["title"], "絶対的鉄板シチュエーション 2")

    def test_several_performers_and_a_code_are_kept_separate(self):
        found = infer("[紗倉まな／古川いおり] SODstar 10 SEX AFTER PARTY 2019.MP4",
                      "I:\\コントロールパネル\\Video\\$[紗倉まな／古川いおり] SODstar 10 SEX AFTER PARTY 2019\\"
                      "[紗倉まな／古川いおり] SODstar 10 SEX AFTER PARTY 2019.MP4")
        self.assertEqual(found["performers"], ["紗倉まな", "古川いおり"])
        self.assertEqual(found["title"], "SODstar 10 SEX AFTER PARTY 2019")

    def test_a_missing_opening_bracket_still_gives_the_performer(self):
        found = infer("高杉麻里] 彼女がボンデージに着替えたら。Mな私とSな私…どっちの私が好き？.mp4")
        self.assertEqual(found["performers"], ["高杉麻里"])
        self.assertEqual(found["title"], "彼女がボンデージに着替えたら。Mな私とSな私…どっちの私が好き？")

    def test_placeholders_and_quality_tags_do_not_become_performers(self):
        for name in ("[----] 1pon-whole1.mp4", "[中文字幕] ABW-358.mp4", "[4K] title.mp4"):
            with self.subTest(name=name):
                found = infer(name, "I:\\library\\" + name)
                self.assertEqual(found["performers"], [], name)


class FilenameSuffixTests(unittest.TestCase):
    def test_an_iv_code_at_the_end_or_in_brackets_is_read(self):
        for name, code in (
            ("[icao.me]佐々木桃華 IMBD-214.mp4", "IMBD-214"),
            ("[icao.me]佐々木桃華 IMBD-214-trailer.mp4", "IMBD-214"),
            ("Konoha57_1219-ICDV-30159.mp4", "ICDV-30159"),
            ("[JSSJ-077] 純粋少女.mp4", "JSSJ-077"),
            ("(IV) 教えてラフランス (佐々木麻衣) [ギルド] GUILD-083.mp4", "GUILD-083"),
            ("GJOS-020-2.mp4", "GJOS-020"),
        ):
            with self.subTest(name=name):
                self.assertEqual(release_code_from_filename_suffix(name), code)

    def test_creator_serials_and_title_numbers_are_not_codes(self):
        for name in ("rei_mk01.mp4", "himesaki01.mp4", "Berry 15.mp4", "MARE 18.mp4",
                     "Morning ABP-123 talk.mp4"):
            with self.subTest(name=name):
                self.assertIsNone(release_code_from_filename_suffix(name), name)

    def test_the_parent_directory_supplies_a_code_the_filename_hides(self):
        from peach.library_processing import _local_release_code
        row = {"code": "", "name": "'Konoha57_1219-ICDV-30159.mp4",
               "path": "E:\\GLA\\01_IV\\ICDV-30159\\'Konoha57_1219-ICDV-30159.mp4"}
        self.assertEqual(_local_release_code(row), "ICDV-30159")


class FilenameCompletionTests(unittest.TestCase):
    def test_a_no_code_row_with_a_local_cover_is_still_pending(self):
        row = {"id": 860, "name": "[北野のぞみ 北野のぞみ] 北野のぞみの、いっぱいコスって萌えてイこう！.mkv",
               "path": "I:\\library\\[北野のぞみ] 北野のぞみの、いっぱいコスって萌えてイこう！\\"
                       "[北野のぞみ 北野のぞみ] 北野のぞみの、いっぱいコスって萌えてイこう！.mkv"}
        pending = _pending_ids([(row, "", [], 1, ["catalog_title", "performers"])], Path("C:\\covers"))
        self.assertEqual(pending, [860])

    def test_a_code_written_by_the_second_pass_identifies_the_group(self):
        target = {
            "code": "ABP-279",
            "name": "[北野のぞみ 北野のぞみ] 北野のぞみの、いっぱいコスって萌えてイこう！.mkv",
            "path": "I:\\library\\[北野のぞみ] 北野のぞみの、いっぱいコスって萌えてイこう！\\"
                    "[北野のぞみ 北野のぞみ] 北野のぞみの、いっぱいコスって萌えてイこう！.mkv",
            "field_owners": '{"code": "auto:iv-completion-iv-20261101-t150746"}',
        }
        self.assertTrue(_group_identifies_code("ABP-279", [target]))

    def test_the_separate_pass_puts_javarchive_first_and_skips_amane_official(self):
        row = {"path": "E:\\GLA\\01_IV\\IMBD-214\\IMBD-214.mp4",
               "name": "IMBD-214.mp4", "studio": ""}
        overrides = _override("IMBD-214", row)
        chain = overrides["censored"]
        self.assertEqual(chain[0], "javarchive")
        self.assertFalse({"makers", "prestige", "faleno", "dahlia", "mgstage"} & set(chain))
        amateur = _override("SIRO-1234", row)
        self.assertLess(amateur["amateur"].index("mgstage"),
                        amateur["amateur"].index("javarchive"))
        self.assertIsNone(_override("FC2-PPV-4137487", row))
        self.assertIsNone(_override("YUJ-103", row))

    def test_auto_apply_identity_reads_a_code_at_the_end_of_the_name(self):
        from peach.metadata_auto_apply import _filename_carries_code
        self.assertTrue(_filename_carries_code("IMBD-214", "[icao.me]佐々木桃華 IMBD-214-trailer.mp4"))
        self.assertTrue(_filename_carries_code("JSSJ-077", "[JSSJ-077] 純粋少女.mp4"))

    def test_the_second_pass_reuses_the_existing_pipeline_with_an_override(self):
        class Connection:
            def execute(self, *_args, **_kwargs):
                return self

            def fetchone(self):
                return {"id": 7, "path": "E:\\GLA\\01_IV\\IMBD-214\\IMBD-214.mp4",
                        "name": "IMBD-214.mp4", "code": "IMBD-214", "studio": "",
                        "creator": "", "release_date": ""}

        class Database:
            db_path = Path("ledger.db")

            @contextmanager
            def read_connection(self):
                yield Connection()

            def write_transaction(self):
                raise AssertionError("code already present")

        class Provider:
            transport = object()

            def close(self):
                pass

        with tempfile.TemporaryDirectory() as directory:
            calls = []

            def fake_process(*_args, **kwargs):
                calls.append(kwargs)
                return {"auto_applied": 2, "covers": 1}

            config = SimpleNamespace(directory=lambda name: Path(directory) / name)
            with patch("peach.library_processing.LibraryMetadataProvider", return_value=Provider()), \
                    patch("peach.library_processing.process_library", side_effect=fake_process):
                stats = complete(config, Database(), Path("candidates"), Path("covers"), [7])
        self.assertEqual(calls[0]["asset_ids"], [7])
        self.assertIn("javarchive", calls[0]["route_overrides"]["censored"])
        self.assertFalse(calls[0]["recheck_existing"])
        self.assertEqual((stats["processed"], stats["applied"], stats["covers"]), (1, 2, 1))

    def test_scalar_gaps_come_before_cover_only_and_tags_only(self):
        rows = [
            ({"id": 5, "name": "ABP-001.mp4", "path": "E:\\a\\ABP-001.mp4", "studio": ""},
             "ABP-001", [], 0, ["tags"]),
            ({"id": 4, "name": "ABP-002.mp4", "path": "E:\\a\\ABP-002.mp4", "studio": ""},
             "ABP-002", [], 0, []),
            ({"id": 3, "name": "IMBD-003.mp4", "path": "E:\\a\\IMBD-003.mp4", "studio": ""},
             "IMBD-003", [], 0, ["title", "performers"]),
            ({"id": 2, "name": "[出演者] タイトル.mp4", "path": "E:\\a\\[出演者] タイトル.mp4", "studio": ""},
             "", [], 0, ["title"]),
        ]

        def settled(path):
            return Path(path).stem == "ABP-001"

        with patch("peach.library_processing.cover_settled", side_effect=settled):
            pending = _pending_ids(rows, Path("C:\\covers"))
        self.assertEqual(pending, [3, 2, 4])

    def test_javarchive_comes_before_the_community_stage(self):
        row = {"path": "E:\\GLA\\01_IV\\IMBD-214\\IMBD-214.mp4",
               "name": "IMBD-214.mp4", "studio": ""}
        chain = _override("IMBD-214", row)["censored"]
        self.assertEqual(chain[0], "javarchive")
        self.assertLess(chain.index("r18dev"), chain.index("avbase"))
        self.assertLess(chain.index("javarchive"), chain.index("avbase"))

    def test_a_recent_attempt_is_skipped_until_the_row_changes_or_retry(self):
        class Connection:
            def execute(self, *_args, **_kwargs):
                return self

            def fetchone(self):
                return {"id": 7, "path": "E:\\GLA\\01_IV\\IMBD-214\\IMBD-214.mp4",
                        "name": "IMBD-214.mp4", "code": "IMBD-214", "studio": "",
                        "creator": "", "release_date": "", "catalog_title": "",
                        "performers": "", "tags": ""}

        class Database:
            db_path = Path("ledger.db")

            @contextmanager
            def read_connection(self):
                yield Connection()

        class Provider:
            transport = object()

            def close(self):
                pass

        with tempfile.TemporaryDirectory() as directory:
            calls = []

            def fake_process(*_args, **kwargs):
                calls.append(kwargs)
                return {"auto_applied": 1, "covers": 0}

            config = SimpleNamespace(directory=lambda name: Path(directory) / name)
            with patch("peach.library_processing.LibraryMetadataProvider", return_value=Provider()), \
                    patch("peach.library_processing.process_library", side_effect=fake_process):
                first = complete(config, Database(), Path("candidates"), Path("covers"), [7])
                second = complete(config, Database(), Path("candidates"), Path("covers"), [7])
                third = complete(config, Database(), Path("candidates"), Path("covers"), [7], retry=True)
        self.assertEqual((first["processed"], second["processed"], third["processed"]), (1, 0, 1))
        self.assertEqual(second["skipped_recent"], 1)
        self.assertEqual(len(calls), 2)

    def test_skipped_recent_rows_do_not_fill_the_per_run_limit(self):
        rows = {
            1: {"id": 1, "path": "E:\\GLA\\ABP-001\\ABP-001.mp4", "name": "ABP-001.mp4",
                "code": "ABP-001", "studio": "", "creator": "", "release_date": "",
                "catalog_title": "", "performers": "", "tags": ""},
            2: {"id": 2, "path": "E:\\GLA\\ABP-002\\ABP-002.mp4", "name": "ABP-002.mp4",
                "code": "ABP-002", "studio": "", "creator": "", "release_date": "",
                "catalog_title": "", "performers": "", "tags": ""},
        }

        class Connection:
            params = ()

            def execute(self, _sql, params=()):
                self.params = params
                return self

            def fetchone(self):
                return rows.get(int(self.params[0]))

        class Database:
            db_path = Path("ledger.db")

            @contextmanager
            def read_connection(self):
                yield Connection()

        class Provider:
            transport = object()

            def close(self):
                pass

        with tempfile.TemporaryDirectory() as directory:
            calls = []

            def fake_process(*_args, **kwargs):
                calls.append(kwargs["asset_ids"])
                return {"auto_applied": 0, "covers": 0}

            config = SimpleNamespace(directory=lambda name: Path(directory) / name)
            with patch("peach.library_processing.LibraryMetadataProvider", return_value=Provider()), \
                    patch("peach.library_processing.process_library", side_effect=fake_process):
                complete(config, Database(), Path("candidates"), Path("covers"), [1, 2], limit=1)
                second = complete(config, Database(), Path("candidates"), Path("covers"), [1, 2], limit=1)
        self.assertEqual(calls, [[1], [2]])
        self.assertEqual((second["processed"], second["skipped_recent"]), (1, 1))

    def test_path_prefix_ignores_case_and_separator(self):
        self.assertTrue(_path_has_prefix("E:\\GLA\\01_IV\\IMBD-214\\IMBD-214.mp4", "e:/gla/01_iv"))
        self.assertFalse(_path_has_prefix("E:\\GLA\\02\\x.mp4", "E:\\GLA\\01_IV"))
        self.assertTrue(_path_has_prefix("anything", ""))

    def test_complete_pending_returns_without_asking_when_nothing_is_pending(self):
        config = SimpleNamespace()
        database = SimpleNamespace(db_path=Path("ledger.db"))
        with patch("peach.library_processing.pending_completion_ids", return_value=[]):
            stats = complete_pending(config, database, Path("candidates"), Path("covers"))
        self.assertEqual((stats["pending"], stats["processed"], stats["stopped"]), (0, 0, "empty"))

    def test_only_a_unique_title_and_performer_match_is_accepted(self):
        clue = {"title": "初写 佐々木桃華", "performers": ["佐々木桃華"], "code": ""}
        record = {"title": "初写 佐々木桃華 Blu-ray版", "actresses": [{"japanese_name": "佐々木桃華"}]}
        self.assertTrue(_record_matches(clue, record))
        self.assertFalse(_record_matches(clue, {**record, "title": "別の作品"}))
        self.assertFalse(_record_matches(clue, {**record, "actresses": [{"japanese_name": "別人"}]}))

    def test_the_search_result_is_used_only_when_one_work_matches(self):
        clue = {"title": "初写 佐々木桃華", "performers": ["佐々木桃華"], "code": ""}

        class Provider:
            transport = object()

        class Record:
            code = "IMBD-214"

            def payload(self):
                return {"title": "初写 佐々木桃華 Blu-ray版",
                        "actresses": [{"japanese_name": "佐々木桃華"}]}

        class Other(Record):
            code = "IMBD-999"

        with patch("peach.iv_completion.JavArchiveSource") as source:
            source.return_value.search_records.return_value = [Record()]
            self.assertEqual(identify(Provider(), clue), "IMBD-214")
            source.return_value.search_records.return_value = [Record(), Other()]
            self.assertEqual(identify(Provider(), clue), "")


class CompletionTailBudgetTests(unittest.TestCase):
    """整库补全要接着跑完整条队列：只取前 120 部时，后面的既有影片永远轮不到。

    `作品情報のみ補完` 与 `补全已入库影片` 是在补存量，单部重新采集能补上的那一部
    也必须在这一趟里被轮到；日常增量同步只发现新增文件，保留原来的小尾巴。
    """

    def _start(self, body, pending=(1, 2, 3), stage_result=None):
        from peach import web_library_processing
        from support.ledger import fresh_ledger
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            media = root / "media"
            media.mkdir()
            (root / "database").mkdir()
            db = fresh_ledger(root / "database")
            video = media / "ABC-001.mp4"
            video.write_bytes(b"video")
            with closing(sqlite3.connect(db)) as connection, connection:
                connection.execute(
                    "INSERT INTO asset(id,location,path,name,medium,code) VALUES(1,'local',?,?,'video','ABC-001')",
                    (str(video), video.name))
            config = SimpleNamespace(configured=True, locations={"local": (str(media),)},
                                     directory=lambda name: root / name)
            contract = SimpleNamespace(
                db_path=db, candidate_root=root / "generated", cover_root=root / "covers",
                cache_bust=lambda: None, database=Mock(),
                library_processing_job=SimpleNamespace(
                    snapshot=lambda: None,
                    start=lambda work, restart, initial, recovery: (work("job"), initial)[1],
                    update=lambda job_id, **values: None))
            result = {"status": "complete", "iv_pending_ids": list(pending), **(stage_result or {})}
            with patch.object(web_library_processing.settings_file, "active", return_value=config), \
                    patch.object(web_library_processing, "process_library", return_value=result), \
                    patch.object(web_library_processing, "complete", return_value={"processed": len(pending)}) as tail:
                web_library_processing.w_library_processing(contract, body)
        return tail.call_args.kwargs

    def test_the_whole_library_metadata_run_drains_the_completion_queue(self):
        budget = self._start({"stage": "metadata"})
        self.assertEqual((budget["limit"], budget["time_budget"]), (0, None))

    def test_the_whole_library_collect_run_drains_the_completion_queue(self):
        budget = self._start({"stage": "collect"})
        self.assertEqual((budget["limit"], budget["time_budget"]), (0, None))

    def test_a_selected_asset_run_keeps_the_short_tail(self):
        budget = self._start({"stage": "metadata", "asset_ids": [1]})
        self.assertEqual((budget["limit"], budget["time_budget"]), (BATCH_LIMIT, TIME_BUDGET_SECONDS))

    def test_daily_incremental_sync_keeps_the_short_tail(self):
        budget = self._start({"incremental": True})
        self.assertEqual((budget["limit"], budget["time_budget"]), (BATCH_LIMIT, TIME_BUDGET_SECONDS))

    def test_stopping_the_task_stops_the_completion_queue(self):
        from peach.processing_control import control_for
        from peach.web_library_processing import _tail_active
        with tempfile.TemporaryDirectory() as directory:
            config = SimpleNamespace(directory=lambda name: Path(directory) / name)
            control = control_for(config)
            control.select_job("job")
            active = _tail_active(config, lambda: True)
            self.assertTrue(active())
            control.request("cancel", "job")
            self.assertFalse(active())

    def test_the_queue_reports_its_own_progress_and_clears_the_stale_deadline(self):
        """队列接着跑时按它自己的总数报进度；上一段的截止点留着会让卡片一开跑就显示卡住。"""
        from peach.web_library_processing import _tail_report
        updates = []
        job = SimpleNamespace(update=lambda job_id, **values: updates.append(values))
        _tail_report(job, "job")(stage="补全未取得的资料", current_action="iv_completion",
                                 current_asset_id=7, current_asset_name="A.mp4",
                                 iv_checked=2, iv_total=9)
        self.assertEqual((updates[0]["checked"], updates[0]["total"]), (2, 9))
        self.assertIsNone(updates[0]["current_deadline_at"])
        self.assertIn("last_progress_at", updates[0])
        self.assertIn("current_started_at", updates[0])


class SougouWikiKeywordTests(unittest.TestCase):
    def _transport(self, table_html, *, status=200):
        search = ('<div class="result-box"><div class="body"><h3>'
                  '<a href="/w/sougouwiki/d/ABP-279">ABP-279</a></h3></div></div>')

        def fetch(request, timeout, max_bytes):
            body = ("<meta charset='utf-8'>" +
                    (search if "search?keywords" in request.url else table_html)).encode("utf-8")
            return HttpResponse(status, {"content-type": "text/html; charset=utf-8"}, body, request.url)

        return fetch

    def test_browser_search_reads_the_work_table(self):
        table = ('<div id="page-body"><div class="user-area"><table id="works">'
                 '<tr><th>NO</th><th>PHOTO</th><th>TITLE</th><th>ACTRESS</th><th>RELEASE</th></tr>'
                 '<tr><td><a href="https://example.test/abp279">ABP-279</a></td><td></td>'
                 '<td>北野のぞみの、いっぱいコスって萌えてイこう！</td>'
                 '<td><a href="/w/sougouwiki/d/kitano">北野のぞみ</a></td><td>2014-04-01</td></tr>'
                 '</table></div></div>')
        wiki = SougouWikiSearch(Path("C:\\unused"), transport=self._transport(table))
        found = wiki.search("北野のぞみの、いっぱいコスって萌えてイこう！")
        self.assertEqual([row["code"] for row in found], ["ABP-279"])
        self.assertEqual(found[0]["title"], "北野のぞみの、いっぱいコスって萌えてイこう！")
        self.assertEqual(found[0]["actresses"], [{"japanese_name": "北野のぞみ"}])

    def test_identify_uses_the_wiki_when_javarchive_has_nothing(self):
        table = ('<div id="page-body"><div class="user-area"><table>'
                 '<tr><th>NO</th><th>TITLE</th><th>ACTRESS</th></tr>'
                 '<tr><td>ABP-279</td><td>北野のぞみの、いっぱいコスって萌えてイこう！</td>'
                 '<td><a href="/w/sougouwiki/d/kitano">北野のぞみ</a></td></tr>'
                 '</table></div></div>')
        wiki = SougouWikiSearch(Path("C:\\unused"), transport=self._transport(table))
        provider = SimpleNamespace(transport=self._transport("<html></html>"))
        clue = {"title": "北野のぞみの、いっぱいコスって萌えてイこう！",
                "performers": ["北野のぞみ"], "code": ""}
        self.assertEqual(identify(provider, clue, wiki=wiki), "ABP-279")


if __name__ == "__main__":
    unittest.main()
