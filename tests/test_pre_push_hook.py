"""pre-push 钩子：不向上游推送，也不推送 master。"""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / "scripts" / "githooks" / "pre-push"
SHELL = shutil.which("sh")
ZERO = "0" * 40


@unittest.skipUnless(SHELL, "需要 POSIX sh")
class PrePushHookTests(unittest.TestCase):
    def push(self, remote: str, url: str, *refs: str) -> subprocess.CompletedProcess:
        lines = "".join(f"refs/heads/work abc123 {ref} {ZERO}\n" for ref in refs)
        return subprocess.run([SHELL, str(HOOK), remote, url], input=lines, capture_output=True,
                              text=True, encoding="utf-8", check=False)

    def test_pushing_to_the_upstream_is_refused(self):
        for remote, url in (("origin", "https://github.com/peach-mitao/peach.git"),
                            ("fork", "git@github.com:peach-mitao/peach.git"),
                            ("origin", "DISABLED"), ("upstream", "https://example.test/x.git")):
            with self.subTest(remote=remote, url=url):
                result = self.push(remote, url, "refs/heads/agent/claude/work")
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertIn("拒绝推送", result.stderr)

    def test_pushing_master_to_any_remote_is_refused(self):
        result = self.push("mirror", "https://example.test/mine.git", "refs/heads/master")
        self.assertEqual(result.returncode, 1)
        self.assertIn("master", result.stderr)

    def test_a_private_remote_may_receive_other_branches(self):
        result = self.push("mirror", "https://example.test/mine.git", "refs/heads/agent/claude/work")
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
