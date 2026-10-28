"""托盘菜单的日语译文。

托盘是 Python 原生菜单，读不到浏览器里的 `peach.locale`。语言由构建时写进包根
`build-info.json` 的 `locale` 决定（`scripts/build_ja_installer.ps1` 以 `VITE_DEFAULT_LOCALE=ja`
构建时写入），环境变量 `PEACH_UI_LOCALE` 可以覆盖，方便不打包时验证。

简体中文原文就是键：整句命中才换，带 `{名}` 的键匹配一段可变文字。没有译文的句子原样保留。
"""
from __future__ import annotations

import json
import os
import re
import sys
from functools import lru_cache
from pathlib import Path

_CATALOG: dict[str, str] = {
    "打开 Peach": "Peach を開く",
    "重新打开设置页": "設定ページを開き直す",
    "配置 Peach": "Peach を設定",
    "状态：{value}": "状態: {value}",
    "地址：{value}": "アドレス: {value}",
    "查看完整配置": "設定をすべて表示",
    "同步开发进度": "開発の進捗を同期",
    "同步数据库": "データベースを同期",
    "由本机接管数据库写入": "このパソコンでデータベースの書き込みを引き継ぐ",
    "重启服务": "サービスを再起動",
    "查看日志": "ログを表示",
    "导出诊断报告": "診断レポートを書き出す",
    "版本与更新": "バージョンと更新",
    "检查更新": "更新を確認",
    "退出 Peach": "Peach を終了",
    "等待完成首次设置": "初回セットアップの完了待ち",
    "运行中": "実行中",
    "部分服务异常": "一部のサービスに異常",
    "服务未运行": "サービス停止中",
    "{value} 项提醒": "{value} 件の通知",
    "正常": "正常",
    "异常": "異常",
    "正常（{value}）": "正常（{value}）",
    "异常（{value}）": "異常（{value}）",
    "更新通道 · GitHub 测试版": "更新チャンネル · GitHub テスト版",
    "本地开发版 · 未配置更新源": "ローカル開発版 · 更新元は未設定",
    "已配置更新源 · 未跟踪分支": "更新元を設定済み · ブランチ未追跡",
    "更新通道 · {value}": "更新チャンネル · {value}",
}

_TEMPLATES = [
    (re.compile("^" + "(.+?)".join(re.escape(part) for part in re.split(r"\{value\}", key)) + "$"), text)
    for key, text in _CATALOG.items() if "{value}" in key
]


@lru_cache(maxsize=1)
def locale() -> str:
    override = os.environ.get("PEACH_UI_LOCALE")
    if override:
        return override
    if getattr(sys, "frozen", False):
        try:
            payload = json.loads((Path(getattr(sys, "_MEIPASS", "")) / "build-info.json").read_text(encoding="utf-8"))
            return str(payload.get("locale") or "zh-CN")
        except (OSError, ValueError, AttributeError):
            return "zh-CN"
    return "zh-CN"


def tr(text: str) -> str:
    """日语界面时把一句托盘文案换成译文；其它语言与没有译文的句子原样返回。"""
    if locale() != "ja":
        return text
    exact = _CATALOG.get(text)
    if exact is not None:
        return exact
    for pattern, translated in _TEMPLATES:
        match = pattern.match(text)
        if match:
            return translated.replace("{value}", match.group(1))
    return text
