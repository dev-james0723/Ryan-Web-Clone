#!/usr/bin/env python3
"""Re-fetch portfolio JPEGs from Adobe Express at max CDN size (4096)."""
import re
import subprocess
import sys
from pathlib import Path

BASE_PAGE = "https://new.express.adobe.com/webpage/ySrLPAc4K2iVb"
ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"


def main() -> int:
    r = subprocess.run(
        ["curl", "-sfL", BASE_PAGE],
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        print("curl failed", file=sys.stderr)
        return 1
    html = r.stdout
    pat = re.compile(r'href="(/webpage/ySrLPAc4K2iVb/resources/[^"]+size=1024)"')
    seen: list[str] = []
    for m in pat.finditer(html):
        u = m.group(1)
        if u not in seen:
            seen.append(u)
    names = ["hero.jpg"] + [f"ny{i:02d}.jpg" for i in range(1, 19)]
    names += [f"port{i:02d}.jpg" for i in range(1, 17)]
    names += [f"land{i:02d}.jpg" for i in range(1, 11)]
    names += [f"wild{i:02d}.jpg" for i in range(1, 11)]
    if len(seen) != len(names):
        print(f"URL count {len(seen)} != names {len(names)}", file=sys.stderr)
        return 1
    IMAGES.mkdir(parents=True, exist_ok=True)
    for path, name in zip(seen, names):
        url = "https://new.express.adobe.com" + path.replace("size=1024", "size=4096")
        out = IMAGES / name
        subprocess.run(["curl", "-sfL", url, "-o", str(out)], check=True)
        print(name, out.stat().st_size // 1024, "KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
