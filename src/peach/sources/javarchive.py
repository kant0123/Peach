"""JavArchive：FC2 下架作品的最后一档，也是 IV（イメージビデオ）在 DMM／r18 落空后的目录。

作品地址是 `/926949-FC2-PPV-4137487-<标题>-pn.html`：开头那串是站内文章号，商品号夹在标题里，
地址拼不出来，只能先问 `/search?q=<番号>` 再取作品页。搜索结果那一条只有标题和一张缩略图，
作品页才有标签、发行日、时长和真正的封面位，所以这一跳省不得。封面转存在 `javstore.net`
上，两个域算同一个来源；免登录可读，不带 Cookie，`robots.txt` 是全站放行。

同一个商品常有好几条：不同转存者各发一次，文章号、番号写法、标题和图都各存各的，先后没有
质量含义。第一条的图未必还在（2026-09-22 实测 `1436028` 的 `/641159-` 那条是 404，`/800025-`
那条有 1280×720），所以 `records()` 每一条都取、各交一份记录。

站上同样收 IV。DMM 的 GraphQL 目录（`sources/dmm.py`）只覆盖 PPV，`IMBD-214`、`JSSJ-077`、
`ENFD-5710` 这类在它上面零结果；r18.dev 也只收其中一部分。JavArchive 的作品页把 `商品番号`、
`ジャンル`、`発　売`、`出　演` 与 `メーカー` 都写在正文那块，正好补上标题、出演者、发行日、
厂牌和封面。按番号核过标题才收，避免把同号的另一部作品安上来。
"""
from __future__ import annotations

import re
import urllib.parse

from bs4 import BeautifulSoup

from ..catalog_rules import is_jav_code, normalise_code_key
from ..jav_cover_fetch import NotFound
from .base import FailureReason, Page, Session, SiteConfig, SiteRecord, SiteSource, SourceFailure
from .fc2 import (PAGE_LIMIT, canonical_code, fc2_record, runtime_minutes, strip_code, text_of, unrecognised,
                  video_id)

#: 转载站，标题由发布者写，封面是转存件，按社区来源登记。主机间隔用默认的 2 秒。
JAVARCHIVE = SiteConfig(name="javarchive", label="JavArchive", provider="javarchive-page",
                        base_url="https://javarchive.com", domains=("javarchive.com", "javstore.net"),
                        stage="community", page_limit=PAGE_LIMIT)
SEARCH_PATH = "/search?q={code}"

#: 站内作品地址的形状。搜索页的结果、侧栏的本周热门和归档菜单用的是同一种。
_LINK = re.compile(r'href="(/\d+-[^"]+\.html)"')
#: 作品页上封面的两个位置：`div.fisrst_sc` 里那张排前，schema.org 的 `image` 排后。
#: 认位置不认文件名——转存者的命名没有统一：`4137487pl.jpg` 沿用 FC2 自己的 `pl`/`ps`，
#: `FC2PPV-4030617.jpg` 与 `FC2PPV-4030617-2.jpg` 是他自己起的，`FC2PPV835964-2.jpg`
#: 连连字符都省了。按名字认的话后两种一张都取不到（2026-09-22 实测 4 部里 3 部如此）。
_COVER_SLOTS = ("div.fisrst_sc img[src]", 'img[itemprop="image"][src]')
#: 多帧拼成的长条预览，正文里叫 `Preview(ビデオのサムネイル)`，不是封面。
_PREVIEW = re.compile(r"_s\.(?:jpe?g|png)$", re.I)
#: 正文那块资料。FC2 转存页写中文标签，IV 页写日文；两套都要认，都只在 `div.news` 里搜：
#: head 的 `<meta name="description">` 里有同样的字样，值被站方截断成 `…｜S級...`，
#: 跟着一串属性和标签，当成资料取回来就是一条坏值。
_ROWS = {
    "genres": re.compile(r"(?:标签|ジャンル)\s*[:：]?\s*([^<]*)"),
    "release_date": re.compile(r"(?:日期|発\s*売)\s*[:：]?\s*(\d{4})[./-](\d{1,2})[./-](\d{1,2})"),
    "runtime": re.compile(r"(?:时长|収録時間)\s*[:：]?\s*([\d:]+)"),
    "performers": re.compile(r"出\s*演\s*[:：]?\s*([^<]*)"),
    "maker": re.compile(r"メーカー\s*[:：]?\s*([^<]*)"),
}
_GENRE_SEPARATOR = re.compile(r"[｜|／/]")
_PERSON_SEPARATOR = re.compile(r"[、,，／/]")


def _number(wanted: str) -> re.Pattern:
    """按数字边界认商品号：`4137487` 不能命中 `41374870`，站上两个号真的都有。"""
    return re.compile(rf"(?<!\d){re.escape(wanted)}(?!\d)")


def catalog_code(code: str | None) -> str:
    """账本番号 → 站上搜索的写法；认不出返回空串。

    FC2 商品号保留 `FC2-PPV-` 前缀；其余按 `normalise_code_key` 归一。带分段后缀的 FC2
    番号（`FC2-PPV-3312576-1`）不是商品号，交空串——搜索会命中整份合集，封面套给每一段。
    """
    found = video_id(code)
    if found:
        return canonical_code(found)
    text = str(code or "").strip()
    if not text or text.upper().startswith("FC2"):
        return ""
    normalized = normalise_code_key(text)
    return normalized if is_jav_code(normalized) else ""


def code_pattern(code: str | None) -> re.Pattern | None:
    """标题、地址里认这个番号的写法；允许站上省略或补零的差异。"""
    wanted = catalog_code(code)
    if not wanted:
        return None
    if wanted.startswith("FC2-PPV-"):
        return _number(wanted.removeprefix("FC2-PPV-"))
    shape = re.fullmatch(r"(\d{3})?([A-Z]+)-(\d+)([A-Z]{0,2})", wanted)
    if shape:
        prefix, letters, digits, suffix = shape.groups()
        return re.compile(
            rf"(?<![A-Z0-9]){re.escape(prefix or '')}{re.escape(letters)}"
            rf"[-_ ]?0*{int(digits)}{re.escape(suffix)}(?![A-Z0-9])", re.I)
    return re.compile(rf"(?<![A-Z0-9]){re.escape(wanted)}(?![A-Z0-9])", re.I)


def links(html: str | bytes, code: str) -> list[str]:
    """搜索结果里这个番号的每一条站内地址，按站上的先后；没有回空表。

    搜索页的结果、侧栏的本周热门和归档菜单用的是同一种地址形状，所以只认地址里带着
    这个番号的那条。FC2 按商品号的数字边界比；IV 按字母段与数字一起比，`IMBD-2140`
    不是 `IMBD-214`。
    """
    pattern = code_pattern(code)
    if pattern is None:
        return []
    text = html.decode("utf-8", "replace") if isinstance(html, bytes) else str(html)
    return list(dict.fromkeys(href for href in _LINK.findall(text)
                              if pattern.search(urllib.parse.unquote(href))))


def _until_next_label(value: str) -> str:
    """一格的值到下一个标签或 `<br>` 为止；合成的无 `<br>` 页也不能把下一格吃进来。"""
    return re.split(r"\s*(?:商品番号|メディア|ジャンル|発\s*売|出\s*演|メーカー|各データ)\s*[:：]?",
                    str(value or ""), maxsplit=1)[0].strip()


def _rows(soup: BeautifulSoup) -> dict:
    """正文那块资料：标签、发行日、时长、出演与厂牌。哪一样没填就回这一样的空值。

    只在 `div.news` 里搜。整页搜的话 head 里那条 `<meta name="description">` 会先命中：
    站方把同一段话截断成 `…｜S級...` 写进 `content`，取回来的是半截标签加一串属性。
    """
    block = soup.select_one("div.news")
    if block is None:
        return {"genres": [], "release_date": "", "runtime": "", "performers": [], "maker": ""}
    text = str(block)
    tags = _ROWS["genres"].search(text)
    sold = _ROWS["release_date"].search(text)
    runtime = _ROWS["runtime"].search(text)
    cast = _ROWS["performers"].search(text)
    maker = _ROWS["maker"].search(text)
    # 站上用全角竖线与斜线分隔；转存者留空时那一行写成 `--`，当成一个标签就入了库。
    names = [name.strip() for name in _GENRE_SEPARATOR.split(_until_next_label(tags.group(1)))] if tags else []
    people = [name.strip() for name in _PERSON_SEPARATOR.split(_until_next_label(cast.group(1)))] if cast else []
    return {
        "genres": list(dict.fromkeys(name for name in names if name and name != "--")),
        "release_date": "-".join(f"{int(part):02d}" if index else part
                                 for index, part in enumerate(sold.groups())) if sold else "",
        "runtime": runtime.group(1) if runtime else "",
        "performers": list(dict.fromkeys(name for name in people if name and name != "--")),
        "maker": _until_next_label(maker.group(1)) if maker else "",
    }


def _strip_title_code(title: str, code: str) -> str:
    """标题开头那截番号剥掉；站上有 `IMBD-214 初写…` 与 `[JSSJ-077] 純粋…` 两种写法。"""
    if code.startswith("FC2-PPV-"):
        return strip_code(title, code.removeprefix("FC2-PPV-"))
    pattern = code_pattern(code)
    if pattern is None:
        return title
    return re.sub(rf"^\s*(?:\[|【)?\s*(?:{pattern.pattern})\s*(?:\]|】)?\s*[-—:：]?\s*", "", title,
                  count=1, flags=re.I).strip()


def _code_in_link(link: str) -> str:
    """站内作品地址里的番号：`/105865-imbd-214-…`、`/926949-FC2-PPV-4137487-…`。"""
    text = urllib.parse.unquote(str(link or ""))
    fc2 = re.search(r"(?i)/\d+-fc2[-_]?(?:ppv)?[-_]?(\d{5,8})(?=[-_.])", text)
    if fc2:
        return normalise_code_key(f"FC2-PPV-{fc2.group(1)}")
    matched = re.search(r"(?i)/\d+-([a-z]{2,8})-(\d{2,5})(?=[-_.])", text)
    if not matched:
        return ""
    code = normalise_code_key(f"{matched.group(1)}-{matched.group(2)}")
    return code if is_jav_code(code) else ""


def _search_links(html: str, query: str) -> list[str]:
    """关键词搜索页里与查询词都沾边的作品地址。

    站上的搜索页在没有命中时仍会列出热门与侧栏作品；不过滤就会把那些 FC2 的标题当成
    「IMBD-214 的搜索结果」。每个空白分隔的词都要出现在地址或链接文字里，才当作命中。
    """
    tokens = [token.casefold() for token in str(query or "").split() if len(token) >= 2]
    if not tokens:
        return []
    soup = BeautifulSoup(html, "html.parser")
    found = []
    for anchor in soup.select("a[href]"):
        link = str(anchor.get("href") or "").strip()
        if not re.fullmatch(r"/\d+-.+\.html", link):
            continue
        hay = " ".join((urllib.parse.unquote(link), anchor.get_text(" ", strip=True),
                        str(anchor.get("title") or ""))).casefold()
        if all(token in hay for token in tokens) and link not in found:
            found.append(link)
    return found


class JavArchiveSource(SiteSource):
    DEFAULT = JAVARCHIVE

    def search_url(self, code: str) -> str:
        """这个番号在 JavArchive 上的搜索地址；认不出番号时回空串。"""
        wanted = catalog_code(code)
        return (self.config.base_url + SEARCH_PATH.format(code=urllib.parse.quote(wanted))
                if wanted else "")

    def work_url(self, link: str) -> str:
        """站内地址 → 作品页。地址里的标题有的已编码、有的是原字，拼之前统一编一遍。"""
        return self.config.base_url + urllib.parse.quote(link, safe="/%")

    def search(self, code: str, *, session: Session) -> list[str]:
        url = self.search_url(code)
        if not url:
            raise unrecognised()
        return links(session.get(url, config=self.config).body, code)

    def query_url(self, query: str) -> str:
        """按关键词搜作品（出演者、片名）；`search_url` 只按番号搜。"""
        text = " ".join(str(query or "").split())
        return (self.config.base_url + SEARCH_PATH.format(code=urllib.parse.quote(text))
                if text else "")

    def search_records(self, query: str, *, session: Session, limit: int = 8) -> list[SiteRecord]:
        """关键词搜索的前几条作品页，各按地址里的番号解析成记录。

        站上不按番号给出搜索结果时，地址仍带着番号与标题（`/105865-imbd-214-…-pn.html`）。
        从地址里取番号，再走同一个 `parse`，核不过就跳过。返回条数按 `limit` 收口，
        调用方拿它做唯一匹配，不拿整页结果当候选池。
        """
        url = self.query_url(query)
        if not url:
            return []
        found: list[SiteRecord] = []
        with self.holding(session):
            body = session.get(url, config=self.config).body
            for link in _search_links(body.decode("utf-8", "replace"), query):
                code = _code_in_link(link)
                if not code:
                    continue
                try:
                    found.append(self.parse(session.get(self.work_url(link), config=self.config), code))
                except NotFound:
                    continue
                if len(found) >= max(1, int(limit)):
                    break
        return found

    def _missing(self) -> SourceFailure:
        return SourceFailure(FailureReason.NOT_FOUND, f"{self.config.label} 上没有这个商品")

    def fetch(self, code: str, *, session: Session) -> Page:
        """搜索结果里排第一的那条作品页。要每一条的用 `records()`。"""
        found = self.search(code, session=session)
        if not found:
            raise self._missing()
        return session.get(self.work_url(found[0]), config=self.config)

    def parse(self, page: Page, code: str) -> SiteRecord:
        """作品页 → 记录；对不上番号归 `not_found`。

        这一档给标题、封面，以及正文那块资料里转存者填了的标签、发行日和时长。填不填是他的
        自由：2026-09-22 实测 4 部里只有 `4030617` 三样齐全（10 个标签、2023/11/21、50:03），
        另外三部那一块整个空着。卖家和商品说明站上没有，正文余下几段是转载来的网盘链接，
        一概不取。封面比官方存储那份原图差一档，所以这一档排在 fc2cmadb 后面。

        IV 页写日文标签 `ジャンル`、`発　売`、`出　演`、`メーカー`，和 FC2 的中文标签同处
        `div.news`；`_rows` 两套都认，这里对非 FC2 番号把它们投影成出演者、发行日、厂牌。

        封面两个图位都收，去重后 `div.fisrst_sc` 那张排前：实测它是作品自己的封面，schema.org 的
        `image` 常是同一张的另一版本。`_s.jpg` 结尾的排除掉，那是正文里标着 `Preview` 的多帧长条拼图。

        标题以站内 `<h1>` 为准，开头那截番号剥掉，留着就把番号写进了标题。`<h1>` 里认不出这个
        番号就当没有这一页——搜索结果挑错条、或者站点改版换了结构，两种都不该把别的片的标题安上来。
        """
        wanted = catalog_code(code)
        pattern = code_pattern(code)
        if not wanted or pattern is None:
            raise unrecognised()
        soup = BeautifulSoup(page.text, "html.parser")
        heading = soup.select_one("h1")
        title = text_of(heading)
        if not title or not pattern.search(title):
            raise self._missing()
        link = heading.select_one("a[href]")
        covers = []
        for slot in _COVER_SLOTS:
            for picture in soup.select(slot):
                url = str(picture.get("src") or "").strip()
                if url and not _PREVIEW.search(url) and url not in covers:
                    covers.append(url)
        rows = _rows(soup)
        source_url = urllib.parse.urljoin(self.config.base_url, link["href"]) if link else ""
        if wanted.startswith("FC2-PPV-"):
            return fc2_record(
                self.config, wanted.removeprefix("FC2-PPV-"), source_url,
                title=strip_code(title, wanted.removeprefix("FC2-PPV-")), release_date=rows["release_date"],
                runtime=runtime_minutes(rows["runtime"]), tags=rows["genres"], cover_urls=covers)
        return SiteRecord(
            source=self.config.name, provenance=self.config.provider, code=wanted, source_url=source_url,
            title=_strip_title_code(title, wanted),
            performers=tuple({"japanese_name": name, "profile_source": self.config.name}
                             for name in rows["performers"]),
            studio=rows["maker"], release_date=rows["release_date"],
            runtime=runtime_minutes(rows["runtime"]), tags=tuple(rows["genres"]),
            cover_urls=tuple(covers),
            extra={"content_id": "", "description": "", "seller_url": ""})

    def records(self, code: str, *, session: Session) -> list[SiteRecord]:
        """搜索命中的每一条作品页各交一份记录。某一条 404 或对不上就跳过，一条都没有归 `not_found`。"""
        found = []
        with self.holding(session):
            for link in self.search(code, session=session):
                try:
                    found.append(self.parse(session.get(self.work_url(link), config=self.config), code))
                except NotFound:
                    continue
                except SourceFailure as failure:
                    if failure.kind != "not_found":
                        raise
        if not found:
            raise self._missing()
        return found
