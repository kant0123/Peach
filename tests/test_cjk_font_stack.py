"""样式表里不再写死中文字体：汉字的字形由 `--cjk-ui` 按 `<html lang>` 选择。"""
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CjkFontStackTests(unittest.TestCase):
    def test_no_stylesheet_hardcodes_a_chinese_font(self):
        completed = subprocess.run(
            [sys.executable, "-X", "utf8", str(ROOT / "scripts" / "cjk_font_stack.py"), "--check"],
            capture_output=True, text=True, encoding="utf-8", check=False)
        self.assertEqual(completed.returncode, 0, f"这些样式表仍写死中文字体，运行 scripts/cjk_font_stack.py：\n{completed.stdout}")

    def test_japanese_ui_gets_japanese_fonts_before_chinese_ones(self):
        css = (ROOT / "frontend" / "src" / "react" / "base.css").read_text(encoding="utf-8")
        japanese = re.search(r":root:lang\(ja\)\s*\{[^}]*--cjk-ui:([^;]*);", css)
        self.assertIsNotNone(japanese)
        for family in ("Noto Sans JP", "Yu Gothic UI", "Meiryo UI"):
            self.assertIn(family, japanese.group(1))
        self.assertNotIn("YaHei", japanese.group(1))
        self.assertIn("var(--cjk-ui)", css.split(":root:lang(ja)")[0], "--font-inter 要带上 --cjk-ui")


if __name__ == "__main__":
    unittest.main()
