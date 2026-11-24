#!/usr/bin/env python3
"""Sync docs/status.md product-goal line with the §100% checklist ([x]/[ ] counts)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATUS = ROOT / "docs" / "status.md"

CHECKLIST_START = "## 100% 完了条件チェックリスト"
CHECKLIST_END = "## ゲート外・任意"
ITEM_RE = re.compile(r"^\* \[(x| )\]", re.MULTILINE)
GOAL_RE = re.compile(
    r"(\*\*プロダクトゴール \(L3\):\*\* チェックリスト )\*\*\d+項目中\d+項目\*\* = \*\*\d+%\*\*",
)


def main() -> int:
    text = STATUS.read_text(encoding="utf-8")
    start = text.find(CHECKLIST_START)
    end = text.find(CHECKLIST_END)
    if start < 0 or end < 0:
        print("error: checklist section not found", file=sys.stderr)
        return 1

    section = text[start:end]
    done = len(re.findall(r"^\* \[x\]", section, flags=re.MULTILINE))
    open_ = len(re.findall(r"^\* \[ \]", section, flags=re.MULTILINE))
    total = done + open_
    percent = round(done * 100 / total) if total else 0

    replacement = (
        f"**プロダクトゴール (L3):** チェックリスト **{total}項目中{done}項目** = **{percent}%**"
    )
    if not GOAL_RE.search(text):
        print("error: product goal line not found", file=sys.stderr)
        return 1

    new_text = GOAL_RE.sub(replacement, text, count=1)

    snapshot_re = re.compile(
        r"(\*\*プロダクトゴール \(L3全体\):\*\* チェックリスト )\*\*\d+%\*\*",
    )
    new_text = snapshot_re.sub(f"\\g<1>**{percent}%**", new_text, count=1)

    if new_text != text:
        STATUS.write_text(new_text, encoding="utf-8")
        print(f"updated: {done}/{total} = {percent}%")
    else:
        print(f"ok: {done}/{total} = {percent}%")

    return 0 if open_ == 0 and percent == 100 else 1


if __name__ == "__main__":
    raise SystemExit(main())