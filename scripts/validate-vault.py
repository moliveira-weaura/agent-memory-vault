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


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


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


def check_sensitive(path: Path, text: str) -> None:
    # Docs intentionally mention prohibited words. Only fail high-confidence secret-like patterns.
    for pattern in SENSITIVE_PATTERNS:
        for match in pattern.finditer(text):
            ERRORS.append(f"{rel(path)}: possible sensitive value matched pattern: {match.group(0)[:40]}...")


def check_private_terms(path: Path, text: str) -> None:
    # Allow this validator file to mention old terms so it can guard against regressions.
    if rel(path) == "scripts/validate-vault.py":
        return
    lowered = text.lower()
    for term in OLD_PRIVATE_TERMS:
        if term in lowered:
            ERRORS.append(f"{rel(path)}: contains private/old project term: {term}")


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
