"""样式表里不再写死中文字体：汉字的字形由 `--cjk-ui` 按 `<html lang>` 选择。"""
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


if __name__ == "__main__":
    unittest.main()
