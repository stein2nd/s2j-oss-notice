#!/usr/bin/env python3
"""Vendor onot-compatible SPDX license-list-data from a local onot checkout."""

from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE = (
    Path(__file__).resolve().parent.parent.parent
    / "onot"
    / "src"
    / "onot"
    / "license"
    / "data"
    / "licenses.json"
)
OUT = ROOT / "src" / "license" / "data" / "licenses.json"


def main() -> int:
    source = Path(os.environ.get("ONOT_LICENSES_JSON", DEFAULT_SOURCE))
    if not source.is_file():
        print(f"error: license bundle not found: {source}", file=sys.stderr)
        print(
            "Set ONOT_LICENSES_JSON or clone onot beside this repo, then re-run.",
            file=sys.stderr,
        )
        return 1
    OUT.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, OUT)
    print(f"synced {source} -> {OUT} ({OUT.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())