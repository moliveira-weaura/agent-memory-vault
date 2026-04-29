#!/usr/bin/env python3
"""Lightweight validation for Agent Memory Vault."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []
WARNINGS: list[str] = []

OLD_PRIVATE_TERMS: list[str] = []

SENSITIVE_PATTERNS = [
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    re.compile(r'(?i)(password|passwd|pwd)\s*[:=]\s*[^\s`\'\"]+'),
    re.compile(r'(?i)(api[_-]?key|secret|token)\s*[:=]\s*[^\s`\'\"]+'),
]

TYPE_INDEXES = {
    "action": "action-index",
    "context": "context-index",
    "context-pack": "context-index",
    "decision": "decision-index",
    "observation": "observation-index",
    "project": "project-index",
    "repo": "project-index",
    "repository": "project-index",
    "runbook": "runbook-index",
    "session": "session-index",
}


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def parse_frontmatter(text: str) -> dict[str, object]:
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}

    data: dict[str, object] = {}
    current_list: str | None = None
    for line in text[4:end].splitlines():
        if not line.strip():
            continue
        if line.startswith("  - ") and current_list:
            value = line[4:].strip().strip('"')
            data.setdefault(current_list, [])
            assert isinstance(data[current_list], list)
            data[current_list].append(value)
            continue
        current_list = None
        if ":" not in line:
            continue
        key, raw_value = line.split(":", 1)
        key = key.strip()
        value = raw_value.strip()
        if value:
            data[key] = value.strip('"')
        else:
            data[key] = []
            current_list = key
    return data


def check_wikilinks(path: Path, text: str) -> None:
    for match in re.finditer(r"\[\[([^\]]+)\]\]", text):
        target = match.group(1)
        if ".md" in target:
            ERRORS.append(f"{rel(path)}: wikilink should omit .md extension: {match.group(0)}")


def check_frontmatter(path: Path, text: str) -> None:
    if not str(path).endswith(".md"):
        return
    if rel(path).startswith(("README", "LICENSE", "CHANGELOG", "CONTRIBUTING", "SECURITY", "CODE_OF_CONDUCT", "AGENTS", "CLAUDE", "DASHBOARD", "docs/", "skills/")):
        return
    if rel(path).startswith("packs/") and not text.startswith("---\n"):
        ERRORS.append(f"{rel(path)}: pack notes should start with frontmatter")


def allowed_sensitive_false_positive(match_text: str) -> bool:
    normalized = match_text.lower().replace("=", ":", 1)
    if ":" not in normalized:
        return False
    key, value = normalized.split(":", 1)
    key = key.strip()
    value = value.strip().strip('"\'.,;:()[]{}')

    # Common GitHub Actions permission values, e.g. `token: write`, are not secrets.
    if key == "token" and value in {"read", "write", "none", "read-all", "write-all"}:
        return True
    return False


def check_sensitive(path: Path, text: str) -> None:
    # Docs intentionally mention prohibited words. Only fail high-confidence secret-like patterns.
    for pattern in SENSITIVE_PATTERNS:
        for match in pattern.finditer(text):
            if allowed_sensitive_false_positive(match.group(0)):
                continue
            ERRORS.append(f"{rel(path)}: possible sensitive value matched pattern: {match.group(0)[:40]}...")


def check_private_terms(path: Path, text: str) -> None:
    # Allow this validator file to mention old terms so it can guard against regressions.
    if rel(path) == "scripts/validate-vault.py":
        return
    lowered = text.lower()
    for term in OLD_PRIVATE_TERMS:
        if term in lowered:
            ERRORS.append(f"{rel(path)}: contains private/old project term: {term}")


def pack_slug(path: Path) -> str | None:
    parts = path.relative_to(ROOT).parts
    if len(parts) < 3 or parts[0] != "packs":
        return None
    return parts[1]


def check_graph_topology(path: Path, text: str) -> None:
    slug = pack_slug(path)
    if not slug or not path.name.endswith(".md"):
        return
    if "/_templates/" in f"/{rel(path)}" or "/00-system/" in f"/{rel(path)}":
        return

    fm = parse_frontmatter(text)
    note_type = str(fm.get("type", "")).strip()
    if note_type == "index":
        return
    tags = fm.get("tags", [])
    if not isinstance(tags, list):
        tags = []

    if f"pack/{slug}" not in tags:
        WARNINGS.append(f"{rel(path)}: graph topology should include tag pack/{slug}")
    if note_type and f"agent-memory/{note_type}" not in tags:
        WARNINGS.append(f"{rel(path)}: graph topology should include tag agent-memory/{note_type}")

    manifest_link = f"[[packs/{slug}/00-system/pi-agent/memory-manifest"
    if manifest_link not in text:
        WARNINGS.append(f"{rel(path)}: graph topology should link to the pack manifest")

    index_name = TYPE_INDEXES.get(note_type)
    if index_name and (ROOT / "packs" / slug / "00-system" / "indexes" / f"{index_name}.md").exists():
        index_link = f"[[packs/{slug}/00-system/indexes/{index_name}"
        if index_link not in text:
            WARNINGS.append(f"{rel(path)}: graph topology should link to {index_name}")


def main() -> int:
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if ".git" in path.parts:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        check_wikilinks(path, text)
        check_frontmatter(path, text)
        check_sensitive(path, text)
        check_private_terms(path, text)
        check_graph_topology(path, text)

    if WARNINGS:
        print("Warnings:")
        for warning in WARNINGS:
            print(f"- {warning}")

    if ERRORS:
        print("Errors:")
        for error in ERRORS:
            print(f"- {error}")
        return 1

    print("Agent Memory Vault validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
