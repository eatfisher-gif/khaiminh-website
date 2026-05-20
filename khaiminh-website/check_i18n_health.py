#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path


FILES = ["i18n/tw.json", "i18n/vn.json", "i18n/en.json"]


def walk(node, prefix=""):
    if isinstance(node, dict):
        for key, value in node.items():
            next_prefix = f"{prefix}.{key}" if prefix else key
            yield from walk(value, next_prefix)
    elif isinstance(node, list):
        for i, value in enumerate(node):
            yield from walk(value, f"{prefix}[{i}]")
    elif isinstance(node, str):
        yield prefix, node


def main():
    problems = []
    for rel in FILES:
        path = Path(rel)
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            problems.append((rel, "<json>", f"JSON parse error: {exc}"))
            continue

        for key, value in walk(data):
            if "\ufffd" in value or re.search(r"\?{2,}", value):
                problems.append((rel, key, value))

    if problems:
        print("i18n health check: FAILED")
        for rel, key, value in problems:
            print(f"- {rel} :: {key} :: {value}")
        return 1

    print("i18n health check: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

