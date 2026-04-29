#!/usr/bin/env python3
"""Generate Obsidian Graph View color groups for memory packs."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRAPH_PATH = ROOT / ".obsidian" / "graph.json"

PACK_COLORS = [
    0x4C78A8,  # blue
    0x9D755D,  # brown
    0x59A14F,  # green
    0xF28E2B,  # orange
    0xB07AA1,  # purple
    0x76B7B2,  # cyan
    0xE15759,  # red
    0xEDC948,  # yellow
]

TYPE_GROUPS = [
    ('path:"20-context"', 0x4C78A8),
    ('path:"30-projects"', 0x76B7B2),
    ('path:"40-actions"', 0x59A14F),
    ('path:"50-decisions"', 0xB07AA1),
    ('path:"60-observations"', 0xEDC948),
    ('path:"70-runbooks" OR path:"80-runbooks"', 0xF28E2B),
    ('path:"80-sessions"', 0xE15759),
]

DEFAULT_GRAPH = {
    "collapse-filter": False,
    "search": "",
    "showTags": False,
    "showAttachments": False,
    "hideUnresolved": False,
    "showOrphans": True,
    "collapse-color-groups": False,
    "colorGroups": [],
    "collapse-display": True,
    "showArrow": False,
    "textFadeMultiplier": 0,
    "nodeSizeMultiplier": 1,
    "lineSizeMultiplier": 1,
    "collapse-forces": True,
    "centerStrength": 0.518713248970312,
    "repelStrength": 10,
    "linkStrength": 1,
    "linkDistance": 250,
    "scale": 1,
    "close": False,
}


def color(rgb: int) -> dict[str, int]:
    return {"a": 1, "rgb": rgb}


def pack_slugs() -> list[str]:
    packs_dir = ROOT / "packs"
    if not packs_dir.exists():
        return []
    return [p.name for p in sorted(packs_dir.iterdir()) if p.is_dir() and not p.name.startswith(".")]


def pack_groups() -> list[dict[str, object]]:
    groups = []
    for index, slug in enumerate(pack_slugs()):
        groups.append({
            "query": f'path:"packs/{slug}"',
            "color": color(PACK_COLORS[index % len(PACK_COLORS)]),
        })
    return groups


def type_groups() -> list[dict[str, object]]:
    return [{"query": query, "color": color(rgb)} for query, rgb in TYPE_GROUPS]


def load_graph() -> dict[str, object]:
    if not GRAPH_PATH.exists():
        return dict(DEFAULT_GRAPH)
    try:
        return json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {GRAPH_PATH}: {exc}") from exc


def build_groups(mode: str) -> list[dict[str, object]]:
    if mode == "packs":
        return pack_groups()
    if mode == "types":
        return type_groups()
    if mode == "hybrid":
        return pack_groups() + type_groups()
    raise SystemExit(f"Unsupported mode: {mode}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mode",
        choices=["packs", "types", "hybrid"],
        default="packs",
        help="Color groups to generate. Default: packs.",
    )
    args = parser.parse_args()

    GRAPH_PATH.parent.mkdir(parents=True, exist_ok=True)
    graph = load_graph()
    graph["colorGroups"] = build_groups(args.mode)
    graph["collapse-color-groups"] = False

    GRAPH_PATH.write_text(json.dumps(graph, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {GRAPH_PATH.relative_to(ROOT)} with {len(graph['colorGroups'])} {args.mode} color groups.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
