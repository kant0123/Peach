"""pre-push 钩子：只推送到 https://github.com/kant0123/Peach.git。"""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / "scripts" / "githooks" / "pre-push"
SHELL = shutil.which("sh")
ZERO = "0" * 40
OWN = "https://github.com/kant0123/Peach.git"


@unittest.skipUnless(SHELL, "需要 POSIX sh")
class PrePushHookTests(unittest.TestCase):
    def push(self, remote: str, url: str, *refs: str) -> subprocess.CompletedProcess:
        lines = "".join(f"refs/heads/work abc123 {ref} {ZERO}\n" for ref in refs)
        return subprocess.run([SHELL, str(HOOK), remote, url], input=lines, capture_output=True,
                              text=True, encoding="utf-8", errors="replace", check=False)

    def test_the_own_repository_receives_any_branch_including_main(self):
        for url in (OWN, OWN.removesuffix(".git")):
            for ref in ("refs/heads/main", "refs/heads/agent/claude/work", "refs/tags/v1.0.0"):
                with self.subTest(url=url, ref=ref):
                    result = self.push("kant0123", url, ref)
                    self.assertEqual(result.returncode, 0, result.stderr)

    def test_every_other_remote_is_refused(self):
        for remote, url in (("origin", "https://github.com/peach-mitao/peach.git"),
                            ("fork", "git@github.com:peach-mitao/peach.git"),
                            ("origin", "DISABLED-no-push-to-upstream"),
                            ("mirror", "https://example.test/mine.git"),
                            ("kant0123", "https://github.com/kant0123/Other.git"),
                            ("kant0123", "https://github.com/someone/Peach.git")):
            with self.subTest(remote=remote, url=url):
                result = self.push(remote, url, "refs/heads/agent/claude/work")
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertIn("拒绝推送", result.stderr)
                self.assertIn(OWN, result.stderr)


if __name__ == "__main__":
    unittest.main()
