"""素人系総合 Wiki 的关键词搜索：浏览器取页，读作品表里的番号、标题与出演者。

直连与模拟浏览器指纹都回 403；站方只放行过验证的浏览器。取页沿用
`browser_transport` 的本机 Chrome／Edge，验证与 Cookie 都由浏览器自己过。
搜索结果页只是目录，真正的作品行在链接到的厂牌页上；`SeesaaSource.rows()` 读的就是
那张 `NO / TITLE / ACTRESS / RELEASE` 表。
"""
from __future__ import annotations

from pathlib import Path

from bs4 import BeautifulSoup

from .browser_transport import BrowserTransport, find_browser
from .http import HttpRequest, HttpResponse, body_text
from .sources import Page
from .sources.seesaa import SeesaaSource

#: 一次搜索最多读几条结果页；综合 Wiki 的搜索结果页很多是人物页，作品行只在前几页。
SEARCH_PAGES = 6
#: 单页上限；真实厂牌页几十 KB，4 MiB 是余量。
PAGE_LIMIT = 4 * 1024 * 1024
#: 浏览器取一页的等待上限。验证页需要人点时由 `browser_transport` 自己弹窗。
TIMEOUT = 60.0


class SougouWikiSearch:
    """一批共用一个浏览器；没有 Chrome／Edge 或启动失败时 `available` 为假。"""

    def __init__(self, profile: Path, *, transport=None):
        self.profile = Path(profile)
        self.executable = None if transport is not None else find_browser()
        self.transport = transport
        if self.transport is None and self.executable:
            self.transport = BrowserTransport(self.executable, self.profile)

    @property
    def available(self) -> bool:
        return self.transport is not None

    def close(self) -> None:
        close = getattr(self.transport, "close", None)
        if callable(close):
            close()

    def _page(self, url: str) -> Page | None:
        if self.transport is None:
            return None
        try:
            response: HttpResponse = self.transport(HttpRequest("GET", url, {}), TIMEOUT, PAGE_LIMIT)
        except Exception:  # noqa: BLE001 - 浏览器退出、验证不过都只是这一条搜索没有结果
            return None
        if response.status != 200 or not response.body:
            return None
        return Page(response.url or url, response.body)

    def search(self, query: str) -> list[dict]:
        """关键词 → 作品行；返回 `code`、`title`、`actresses` 三项。"""
        query = str(query or "").strip()
        if not query or self.transport is None:
            return []
        source = SeesaaSource()
        directory = self._page(source.search_url(query))
        if directory is None:
            return []
        soup = BeautifulSoup(body_text(directory.body, default="euc_jp"), "html.parser")
        links = []
        for anchor in soup.select(".result-box .body h3 a[href]"):
            try:
                links.append(source.page_url(anchor["href"]))
            except (KeyError, ValueError):
                continue
        found: list[dict] = []
        seen: set[str] = set()
        for url in list(dict.fromkeys(links))[:SEARCH_PAGES]:
            page = self._page(url)
            if page is None:
                continue
            for record in source.rows(page):
                if not record.code or record.code in seen:
                    continue
                seen.add(record.code)
                found.append({
                    "code": record.code,
                    "title": record.title,
                    "actresses": [dict(person) for person in record.performers],
                    "source_url": record.source_url,
                })
        return found
