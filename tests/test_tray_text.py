"""托盘菜单的日语译文：只在日语构建里换，整句命中才换。"""
import os
import unittest
from unittest import mock

from peach import tray_text


class TrayTextTests(unittest.TestCase):
    def with_locale(self, value):
        tray_text.locale.cache_clear()
        patcher = mock.patch.dict(os.environ, {"PEACH_UI_LOCALE": value})
        patcher.start()
        self.addCleanup(patcher.stop)
        self.addCleanup(tray_text.locale.cache_clear)

    def test_japanese_build_translates_menu_labels_and_templates(self):
        self.with_locale("ja")
        self.assertEqual(tray_text.tr("退出 Peach"), "Peach を終了")
        self.assertEqual(tray_text.tr("状态：" + tray_text.tr("服务未运行")), "状態: サービス停止中")
        self.assertEqual(tray_text.tr("2 项提醒"), "2 件の通知")
        self.assertEqual(tray_text.tr("更新通道 · origin/master"), "更新チャンネル · origin/master")

    def test_unknown_text_is_kept(self):
        self.with_locale("ja")
        self.assertEqual(tray_text.tr("没有收录的句子"), "没有收录的句子")

    def test_simplified_chinese_is_untouched(self):
        self.with_locale("zh-CN")
        self.assertEqual(tray_text.tr("退出 Peach"), "退出 Peach")


if __name__ == "__main__":
    unittest.main()
