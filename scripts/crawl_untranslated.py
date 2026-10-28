"""日语界面巡回：在临时演示库上起服务，逐页找出仍是简体中文的文字。

源码检查（`frontend/scripts/scan-untranslated.mjs`）看不到服务端返回的文案、`web/index.html`
写死的提示和拼出来的句子，所以这里直接看渲染结果。演示库、服务与 Chrome 复用
`tests/test_web_e2e.py` 的准备，数据全在临时目录；巡回本身是 `frontend/scripts/crawl-untranslated.mjs`。

    python scripts/crawl_untranslated.py                 打印并写出报告
    python scripts/crawl_untranslated.py --check         对照基线，A 级有新增就失败
    python scripts/crawl_untranslated.py --update-baseline   把当前的 A 级与确认过的 B 级记为基线
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
BASELINE = FRONTEND / "scripts" / "dom-untranslated-baseline.txt"
REPORT = ROOT / "build" / "i18n-crawl" / "report.json"


def load_e2e():
    """复用冒烟测试那一套演示库与服务的准备，不另写一份。"""
    tests = ROOT / "tests"
    sys.path.insert(0, str(tests))
    sys.path.insert(0, str(ROOT / "src"))
    spec = importlib.util.spec_from_file_location("peach_e2e_for_crawl", tests / "test_web_e2e.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def crawl() -> dict:
    e2e = load_e2e()
    cls = e2e.WebE2ESmokeTests
    try:
        cls.setUpClass()
    except unittest.SkipTest as skipped:
        raise SystemExit(f"前提不满足：{skipped}")
    try:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        env = dict(os.environ, PEACH_E2E_ORIGIN=cls.origin, PEACH_E2E_CHROME=cls.chrome, PEACH_CRAWL_OUT=str(REPORT))
        completed = subprocess.run(
            [cls.node, "scripts/crawl-untranslated.mjs"], cwd=str(FRONTEND), env=env,
            stdout=subprocess.PIPE, text=True, encoding="utf-8", errors="replace", timeout=1500, check=False)
        print(completed.stdout.strip())
        if completed.returncode != 0:
            raise SystemExit("巡回失败：详见上方的 stderr")
    finally:
        cls.tearDownClass()
    return json.loads(REPORT.read_text(encoding="utf-8"))


def baseline_keys() -> set[str]:
    return set(BASELINE.read_text(encoding="utf-8").splitlines()) - {""} if BASELINE.is_file() else set()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="A 级有基线之外的新增就以非零退出")
    parser.add_argument("--update-baseline", action="store_true", help="把当前结果记为基线")
    args = parser.parse_args()
    report = crawl()
    rows = report["rows"]
    keys = {f"{row['tier']}\t{row['text']}" for row in rows}
    if args.update_baseline:
        BASELINE.write_text("\n".join(sorted(keys)) + "\n", encoding="utf-8")
        print(f"基线已更新：{len(keys)} 条")
        return 0
    fresh = [row for row in rows if f"{row['tier']}\t{row['text']}" not in baseline_keys()]
    for tier, title in (("A", "A 级（简体中文独有的字，一定是漏译）"), ("B", "B 级（只有汉字，需人看一眼）")):
        group = [row for row in fresh if row["tier"] == tier]
        print(f"\n== {title}：{len(group)} 件")
        for row in group:
            print(f"- {row['text']}  [{'/'.join(row['kinds'])}]  {', '.join(row['routes'])}")
    return 1 if args.check and any(row["tier"] == "A" for row in fresh) else 0


if __name__ == "__main__":
    raise SystemExit(main())
