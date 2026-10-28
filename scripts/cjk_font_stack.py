"""把样式表里写死的中文字体（微软雅黑、苹方）换成 `var(--cjk-ui)`，由 `:lang()` 决定实际字体。

`web/board.css` 定义两套值：简体中文用雅黑与苹方，日语界面用 Noto Sans JP、游ゴシック、メイリオ、ヒラギノ。
这样日语文字不再落到中文字形上。重复运行是幂等的，已替换的文件不再改动。

    python scripts/cjk_font_stack.py          替换并打印改动的文件
    python scripts/cjk_font_stack.py --check  只检查，仍有写死的中文字体就以非零退出
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOLDERS = (ROOT / "web" / "css", ROOT / "frontend" / "src")
FILES = (ROOT / "web" / "board.css",)
QUOTE = r"""['"]"""
PATTERN = re.compile(
    rf"{QUOTE}Microsoft YaHei UI{QUOTE}"
    rf"(?:\s*,\s*{QUOTE}Microsoft YaHei{QUOTE})?"
    rf"(?:\s*,\s*{QUOTE}PingFang SC{QUOTE})?")


def stylesheets():
    for folder in FOLDERS:
        yield from folder.rglob("*.css")
    yield from FILES


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed = []
    for path in sorted(set(stylesheets())):
        text = path.read_text(encoding="utf-8")
        # `--cjk-ui` 自己的定义（简体中文那一套）要保留原样。
        replaced = "".join(
            line if line.lstrip().startswith("--cjk-ui:") else PATTERN.sub("var(--cjk-ui)", line)
            for line in text.splitlines(keepends=True))
        if replaced != text:
            changed.append(path.relative_to(ROOT).as_posix())
            if not args.check:
                path.write_text(replaced, encoding="utf-8", newline="")
    for name in changed:
        print(name)
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    sys.exit(main())
