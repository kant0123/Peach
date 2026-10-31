"""从文件名与父目录读出作品线索：出演者、标题和番号。

发行目录常把资料写在名字上：`[佐々木麻衣] FIRST TOUCH`、`[山中真由美] かなえてあげる`、
`[JSSJ-077] 純粋少女JC`。这些线索只进候选，不直接写真相字段：文件名是用户自己的命名，
不是发行方口径，认错的成本由复核的人承担。

这里不查账本、不发请求，只做文本归一；番号判据仍由 `catalog_rules` 决定，避免出现
第二套「什么算番号」。
"""
from __future__ import annotations

import re
from pathlib import PureWindowsPath

from .catalog_rules import release_code_from_filename, release_code_from_filename_suffix

#: 名字开头的方括号、圆括号或【】块。作品目录常写成 `[出演者] 标题`。
_LEADING_BRACKET = re.compile(r"^\s*[\[\(【]([^\[\]\(\)【】]{1,80})[\]\)】]\s*(.+)$")
#: 多人并列的写法；`／` 与 `/` 在日文目录里同样常见。
_PERSON_SEPARATOR = re.compile(r"[、,，／/]")
_KANJI_KANA = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")
#: 方括号里常出现的分类、画质与厂牌标签；它们不是出演者。
_LABELS = frozenset({
    "----", "---", "--", "-", "中文字幕", "中字", "字幕", "無修正", "无码", "無碼", "破解", "流出",
    "素人", "单体", "單體", "合集", "精選", "精选", "高画质", "高畫質", "HD", "FHD", "SD", "4K",
    "1080p", "720p", "HEVC", "H264", "H265", "Blu-ray", "BD", "DVD", "VR", "IV", "アイドル",
    "イメージビデオ", "グラビア", "ギルド", "アイマックス", "ウーノ", "竹書房",
    "イーネット・フロンティア", "ラインコミュニケーションズ", "メディアブランド",
})
_LABELS_FOLDED = frozenset(label.casefold() for label in _LABELS)
_QUALITY_WORD = re.compile(
    r"(?i)(?<![A-Za-z0-9])(?:4k|2160p|1440p|1080p|720p|fhd|hd|sd|hevc|h\.?264|h\.?265|x264|x265|"
    r"blu-?ray|bd|dvd|uncensored|無修正|无码|無碼|破解|中文字幕|中字|字幕|完整版|合集)(?![A-Za-z0-9])")
_TAG_BLOCK = re.compile(r"[\[\(【][^\[\]\(\)【】]{0,24}[\]\)】]")
_TRAILING_NOISE = re.compile(r"(?i)[-_. ](?:co|merged|uncensored|leak|sample|trailer|preview|pv)$")
_SPACE = re.compile(r"\s+")


def _person(name: str) -> bool:
    """这一段像不像一个人的名字：有日文、没有数字和域名、不是分类标签。"""
    text = name.strip(" -_—")
    if not text or len(text) > 24 or text.casefold() in _LABELS_FOLDED:
        return False
    if not _KANJI_KANA.search(text):
        return False
    if re.search(r"\d|https?://|www\.|\.(?:com|net|org|tv|cc|me|info|asia|pw|la)\b", text, re.I):
        return False
    return True


def _people(value: str) -> list[str]:
    return [name for part in _PERSON_SEPARATOR.split(value) if (name := part.strip()) and _person(name)]


def _title(value: str) -> str:
    """片名：去掉画质、站名与分卷尾巴，留下可搜索的正文。"""
    text = _TAG_BLOCK.sub(" ", str(value or ""))
    text = _QUALITY_WORD.sub(" ", text)
    text = _TRAILING_NOISE.sub("", text.strip())
    text = re.sub(r"[_.]+", " ", text)
    text = _SPACE.sub(" ", text).strip(" -_—:：")
    return text


def _bracket_metadata(text: str) -> tuple[str, list[str]] | None:
    cleaned = re.sub(r"^[\s$'\"`]+", "", str(text or ""))
    match = _LEADING_BRACKET.match(cleaned)
    if not match:
        return None
    people = _people(match.group(1))
    if not people:
        return None
    title = _title(match.group(2))
    return title, people


def infer(name: str | None, path: str | None = None) -> dict | None:
    """文件名与父目录里的作品线索；没有可用资料返回 None。

    父目录先看：作品目录常是 `[出演者] 标题`，文件名反而只剩番号或下载器加的前缀。
    父目录给不出人时再看文件名。标题始终从同一个括号块后面取；块里没有人名就整块丢掉，
    `[----]`、`[中文字幕]` 这类占位符不会变成标题。
    """
    parsed = PureWindowsPath(str(path or name or ""))
    stem = PureWindowsPath(str(name or "")).stem
    parent = parsed.parent.name
    found: tuple[str, list[str]] | None = None
    for value in (parent, stem):
        found = _bracket_metadata(value)
        if found:
            break
    title = found[0] if found else _title(stem)
    people = found[1] if found else []
    code = (release_code_from_filename(name)
            or release_code_from_filename_suffix(name)
            or release_code_from_filename(parent)
            or release_code_from_filename_suffix(parent))
    if not title and not people:
        return None
    # 标题只剩番号、出演者或一个分类词时没有信息量，交回去只会让复核队列多一行。
    if title and (title.casefold() == (people[0].casefold() if people else "")
                  or title.casefold() in _LABELS_FOLDED):
        title = ""
    return {"title": title, "performers": people, "code": code or ""}
