#!/usr/bin/env python3
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CASES_DIR = ROOT / "assets" / "img" / "cases"
MANIFEST_PATH = ROOT / "assets" / "case-manifest.json"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def sort_key(path: Path):
    stem = path.stem
    if stem.isdigit():
        return (0, int(stem), path.name.lower())
    match = re.search(r"(\d+)", stem)
    if match:
        return (1, int(match.group(1)), path.name.lower())
    return (2, stem.lower(), path.name.lower())


def build_manifest():
    payload = {}
    if not CASES_DIR.exists():
        return payload

    for category_dir in sorted([p for p in CASES_DIR.iterdir() if p.is_dir()], key=lambda p: p.name.lower()):
        images = [p for p in category_dir.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS]
        if not images:
            continue

        images.sort(key=sort_key)
        payload[category_dir.name] = {
            "images": [f"assets/img/cases/{category_dir.name}/{img.name}" for img in images]
        }

    return payload


def main():
    manifest = build_manifest()
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {MANIFEST_PATH}")
    print(f"Categories: {len(manifest)}")


if __name__ == "__main__":
    main()

