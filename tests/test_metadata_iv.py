"""IV（イメージビデオ）的作品资料：r18 的 actors 栏、JavArchive 的日文资料块与文件名末尾番号。"""
import json
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from peach.catalog_rules import release_code_from_filename_suffix
from peach.filename_metadata import infer
from peach.iv_completion import _override, _record_matches, complete, identify
from peach.library_processing import _pending_ids
from peach.sources import Page, R18DevSource
from peach.sources.javarchive import JavArchiveSource, _code_in_link, _search_links, links
from peach.sources.r18dev import with_japanese

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

    def test_the_separate_pass_adds_javarchive_without_touching_fc2(self):
        row = {"path": "E:\\GLA\\01_IV\\IMBD-214\\IMBD-214.mp4",
               "name": "IMBD-214.mp4", "studio": ""}
        overrides = _override("IMBD-214", row)
        self.assertIn("javarchive", overrides["censored"])
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
        self.assertEqual((stats["processed"], stats["applied"], stats["covers"]), (1, 2, 1))

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


if __name__ == "__main__":
    unittest.main()
