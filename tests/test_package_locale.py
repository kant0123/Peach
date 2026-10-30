"""派生分支打包语言（`scripts/package_locale.ps1`）的实际执行：没显式指定时按日语构建、打完包按源语言重建回去。

用一个假 npm 记下每次构建时看到的 `VITE_DEFAULT_LOCALE`，不真正跑前端构建。
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "package_locale.ps1"
PWSH = shutil.which("pwsh")

FAKE_NPM = """
Add-Content -LiteralPath $env:FAKE_NPM_LOG -Value ('build:' + $env:VITE_DEFAULT_LOCALE)
exit ([int]$env:FAKE_NPM_EXIT)
"""


@unittest.skipIf(PWSH is None, "本机没有 pwsh，跳过实际执行 package_locale.ps1")
class PackageLocaleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        self.npm = self.root / "npm.ps1"
        self.npm.write_text(FAKE_NPM, encoding="utf-8")
        self.log = self.root / "npm.log"

    def tearDown(self):
        self.temp.cleanup()

    def run_steps(self, steps: str, *, locale: str | None = None, npm_exit: int = 0) -> dict:
        """点源脚本后执行 `steps`，返回 JSON 结果与假 npm 的构建记录。"""
        env = {key: value for key, value in os.environ.items() if key != "VITE_DEFAULT_LOCALE"}
        env.update(FAKE_NPM_LOG=str(self.log), FAKE_NPM_EXIT=str(npm_exit))
        if locale is not None:
            env["VITE_DEFAULT_LOCALE"] = locale
        command = (f". '{SCRIPT}'\n$Npm = '{self.npm}'\n$Front = '{self.root}'\n$Out = [ordered]@{{}}\n"
                   f"{steps}\n$Out.env = $env:VITE_DEFAULT_LOCALE\n$Out | ConvertTo-Json -Compress")
        result = subprocess.run([PWSH, "-NoProfile", "-NonInteractive", "-Command", command],
                                capture_output=True, text=True, encoding="utf-8", env=env, timeout=60)
        self.assertEqual(result.returncode, 0, result.stderr)
        builds = self.log.read_text(encoding="utf-8").split() if self.log.exists() else []
        return {**json.loads(result.stdout.strip().splitlines()[-1]), "builds": builds}

    def test_an_unspecified_locale_packages_japanese_and_rebuilds_the_source_bundle_once(self):
        outcome = self.run_steps(
            "$Out.locale = Invoke-PackageFrontendBuild $Npm $Front\n"
            "$Out.during = $env:VITE_DEFAULT_LOCALE\n"
            "Restore-SourceFrontendBuild $Npm $Front\nRestore-SourceFrontendBuild $Npm $Front")
        self.assertEqual(outcome["locale"], "ja")
        self.assertIsNone(outcome["during"], "打包语言不能留在调用方的会话里")
        self.assertEqual(outcome["builds"], ["build:ja", "build:"])
        self.assertIsNone(outcome["env"])

    def test_an_explicit_locale_is_packaged_as_is_and_left_to_the_caller(self):
        for locale in ("zh-CN", "ja"):
            with self.subTest(locale=locale):
                self.log.unlink(missing_ok=True)
                outcome = self.run_steps(
                    "$Out.locale = Invoke-PackageFrontendBuild $Npm $Front\nRestore-SourceFrontendBuild $Npm $Front",
                    locale=locale)
                self.assertEqual(outcome["locale"], locale)
                self.assertEqual(outcome["builds"], [f"build:{locale}"])
                self.assertEqual(outcome["env"], locale)

    def test_a_failed_build_throws_without_leaving_the_package_locale_behind(self):
        outcome = self.run_steps(
            "try { Invoke-PackageFrontendBuild $Npm $Front | Out-Null; $Out.thrown = $false }"
            " catch { $Out.thrown = $true; $Out.message = \"$_\" }",
            npm_exit=1)
        self.assertTrue(outcome["thrown"])
        self.assertIn("Frontend bundle build failed", outcome["message"])
        self.assertIsNone(outcome["env"])


if __name__ == "__main__":
    unittest.main()
