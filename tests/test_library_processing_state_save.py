"""处理状态文件被轮询读取时，保存不能因一次占用而失败。"""
import json
import tempfile
import threading
import time
import unittest
from pathlib import Path

from peach.library_processing import _save


class StateSaveTests(unittest.TestCase):
    def test_save_waits_for_a_reader_to_let_go_of_the_state_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "state" / "library-processing.json"
            _save(path, {"status": "running", "n": 1})
            opened = threading.Event()

            def read_slowly():
                # 不带 FILE_SHARE_DELETE 的打开：Windows 上此时 os.replace 目标会 PermissionError。
                with path.open("rb"):
                    opened.set()
                    time.sleep(1.0)

            reader = threading.Thread(target=read_slowly)
            reader.start()
            self.assertTrue(opened.wait(5))
            _save(path, {"status": "running", "n": 2})
            reader.join()
            self.assertEqual(json.loads(path.read_text(encoding="utf-8"))["n"], 2)
            self.assertEqual([item.name for item in path.parent.iterdir()], ["library-processing.json"])


if __name__ == "__main__":
    unittest.main()
