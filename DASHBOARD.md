# Agent Memory Vault Dashboard

Welcome to **Agent Memory Vault** — a portable memory skill for AI coding agents that stores user context, actions, decisions, and environment observations in an Obsidian vault.

## Start here

- [[README|README]]
- [[docs/getting-started|Getting Started]]
- [[docs/always-on-memory-gate|Always-On Memory Gate]]
- [[docs/memory-packs|Memory Packs]]
- [[docs/security-policy|Security Policy]]
- [[docs/contributing|Contributing]]
- [[skills/agent-memory-vault/SKILL|Skill — agent-memory-vault]]

## Core references

- [[docs/always-on-memory-gate|Always-On Memory Gate]]
- [[skills/agent-memory-vault/references/memory-gate|Memory Gate]]
- [[skills/agent-memory-vault/references/retrieval-protocol|Retrieval Protocol]]
- [[skills/agent-memory-vault/references/update-protocol|Update Protocol]]
- [[skills/agent-memory-vault/references/structured-prompt-gate|Structured Prompt Gate]]
- [[skills/agent-memory-vault/references/source-of-truth-rules|Source of Truth Rules]]
- [[skills/agent-memory-vault/references/safety-rules|Safety Rules]]

## Current packs

This starter repository intentionally ships with **no private/company memory packs**.

Create your first pack with:

```bash
python3 scripts/new-pack.py my-company
python3 scripts/sync-obsidian-graph.py
```

Then open:

```txt
packs/my-company/00-system/pi-agent/memory-manifest.md
```

## Checklist for a new pack

- [ ] Create `packs/<pack>/00-system/pi-agent/memory-manifest.md`.
- [ ] Create `packs/<pack>/00-system/pi-agent/retrieval-protocol.md`.
- [ ] Create `packs/<pack>/00-system/pi-agent/resource-map.md`.
- [ ] Create indexes in `packs/<pack>/00-system/indexes/`.
- [ ] Add at least one context pack.
- [ ] Add runbooks when repeatable operational procedures appear.
- [ ] Add decisions/ADRs when durable decisions are made.
- [ ] Use Obsidian wikilinks without `.md` extensions.
- [ ] Run `python3 scripts/validate-vault.py`.

## Safety reminder

Never store secrets, tokens, passwords, private keys, credentials, full payment card numbers, sensitive customer data, or sensitive real payloads.
