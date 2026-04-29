#!/usr/bin/env python3
"""Create a new Agent Memory Vault pack."""
from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TODAY = date.today().isoformat()


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise SystemExit(f"Refusing to overwrite existing file: {path}")
    path.write_text(content, encoding="utf-8")


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Usage: python3 scripts/new-pack.py <pack-slug>")
        return 2

    slug = slugify(argv[1])
    if not slug:
        print("Invalid pack slug")
        return 2

    pack = ROOT / "packs" / slug
    if pack.exists():
        print(f"Pack already exists: {pack}")
        return 1

    title = slug.replace("-", " ").title()

    dirs = [
        "00-system/pi-agent",
        "00-system/indexes",
        "00-system/local",
        "10-user",
        "20-context",
        "30-projects",
        "40-actions",
        "50-decisions",
        "60-observations",
        "70-runbooks",
        "80-sessions",
    ]
    for d in dirs:
        (pack / d).mkdir(parents=True, exist_ok=True)

    write(pack / "00-system/pi-agent/memory-manifest.md", f"""---
type: system
id: system.{slug}.memory-manifest
title: {title} Memory Manifest
status: active
source_of_truth: true
freshness: current
last_reviewed: {TODAY}
tags:
  - agent-memory/system
  - pack/{slug}
---

# {title} Memory Manifest

This pack stores safe durable context for `{slug}`.

## Pack root

`packs/{slug}`

## Entry order

1. `00-system/pi-agent/retrieval-protocol.md`
2. `00-system/pi-agent/resource-map.md`
3. `00-system/local/resource-map.local.md`, if it exists
4. Relevant indexes in `00-system/indexes/`
5. Related context packs, runbooks, decisions, actions, observations, and sessions
6. Source-of-truth files when code, API behavior, configuration, deployment, or real behavior matters

## Indexes

- [[packs/{slug}/00-system/indexes/context-index|Context Index]]
- [[packs/{slug}/00-system/indexes/project-index|Project Index]]
- [[packs/{slug}/00-system/indexes/action-index|Action Index]]
- [[packs/{slug}/00-system/indexes/decision-index|Decision Index]]
- [[packs/{slug}/00-system/indexes/observation-index|Observation Index]]
- [[packs/{slug}/00-system/indexes/runbook-index|Runbook Index]]
- [[packs/{slug}/00-system/indexes/session-index|Session Index]]

## Safety

Never store secrets, tokens, passwords, private keys, credentials, full payment card numbers, sensitive customer data, or sensitive real payloads.
""")

    write(pack / "00-system/pi-agent/retrieval-protocol.md", f"""---
type: system
id: system.{slug}.retrieval-protocol
title: Retrieval Protocol
status: active
source_of_truth: true
freshness: current
last_reviewed: {TODAY}
tags:
  - agent-memory/retrieval
  - pack/{slug}
---

# Retrieval Protocol

Before working on `{slug}`, read the manifest, resource map, relevant indexes, related notes, and source-of-truth files.

Follow the global skill protocol in [[skills/agent-memory-vault/SKILL|Skill — agent-memory-vault]].
""")

    write(pack / "00-system/pi-agent/resource-map.md", f"""---
type: system
id: system.{slug}.resource-map
title: Resource Map
status: active
source_of_truth: true
freshness: current
last_reviewed: {TODAY}
tags:
  - agent-memory/resources
  - pack/{slug}
---

# Resource Map

Document safe pointers to source-of-truth resources.

## Repositories

| Name | Local path placeholder | Context |
|---|---|---|
| <repo-name> | `<LOCAL_PATH>/<repo-name>` | <What this repo contains> |

## Documentation

| Context | Source-of-truth pointer |
|---|---|
| <context> | <file/path/url without secrets> |

## Local overrides

Personal machine paths may be stored in `00-system/local/resource-map.local.md`, which is ignored by Git.
""")

    indexes = {
        "context-index.md": "Context Index",
        "project-index.md": "Project Index",
        "action-index.md": "Action Index",
        "decision-index.md": "Decision Index",
        "observation-index.md": "Observation Index",
        "runbook-index.md": "Runbook Index",
        "session-index.md": "Session Index",
    }
    for filename, heading in indexes.items():
        write(pack / "00-system/indexes" / filename, f"""---
type: index
id: index.{slug}.{filename[:-3]}
title: {heading}
status: active
source_of_truth: true
freshness: current
last_reviewed: {TODAY}
tags:
  - agent-memory/index
  - pack/{slug}
---

# {heading}

| Note | Use |
|---|---|
| <Add wikilink> | <Purpose> |
""")

    write(pack / "20-context/context-pack.md", f"""---
type: context-pack
id: context.{slug}
title: Context Pack — {title}
status: active
source_of_truth: false
freshness: current
last_reviewed: {TODAY}
related_notes:
  - "[[packs/{slug}/00-system/pi-agent/memory-manifest|{title} Memory Manifest]]"
  - "[[packs/{slug}/00-system/indexes/context-index|Context Index]]"
tags:
  - pack/{slug}
  - agent-memory/context-pack
---

# Context Pack — {title}

## Summary

<Add safe high-signal context here.>

## Read first

- [[packs/{slug}/00-system/pi-agent/memory-manifest|{title} Memory Manifest]]

## Related

- Pack: [[packs/{slug}/00-system/pi-agent/memory-manifest|{title} Memory Manifest]]
- Index: [[packs/{slug}/00-system/indexes/context-index|Context Index]]
""")

    print(f"Created pack: packs/{slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
