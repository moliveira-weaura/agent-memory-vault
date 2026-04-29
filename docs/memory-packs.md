# Memory Packs

A memory pack is a folder containing durable context for a project, company, client, user workflow, environment, or domain.

## Create a pack

```bash
python3 scripts/new-pack.py my-project
```

## Git behavior

The public starter repository ignores `packs/*` by default. This keeps personal or company memory local and prevents accidental commits to the open-source repository.

If you intentionally want to version a pack in your own private repository, adjust `.gitignore` before adding it.

## Recommended structure

```txt
packs/<pack>/
  00-system/
    pi-agent/
      memory-manifest.md
      retrieval-protocol.md
      resource-map.md
    indexes/
      context-index.md
      project-index.md
      action-index.md
      decision-index.md
      observation-index.md
      runbook-index.md
      session-index.md
  10-user/
  20-context/
  30-projects/
  40-actions/
  50-decisions/
  60-observations/
  70-runbooks/
  80-sessions/
```

## What belongs in memory

Good candidates:

- durable user preferences;
- project conventions;
- repository maps;
- architecture decisions;
- recurring commands;
- runbooks;
- environment observations;
- incident learnings;
- source-of-truth pointers.

Bad candidates:

- secrets;
- credentials;
- private keys;
- sensitive customer data;
- raw production payloads;
- temporary speculation;
- information you cannot safely publish or share with intended collaborators.

## Obsidian links and graph-friendly writes

Use wikilinks relative to the vault root:

```md
[[packs/<pack>/20-context/project-context|Project Context]]
[[packs/<pack>/70-runbooks/deploy|Deploy Runbook]]
```

Rules:

- omit `.md` extensions;
- use a human-readable alias after `|`;
- add `## Related` sections where useful;
- keep indexes linked with wikilinks.

Agent Memory Vault writes should be graph-aware by default. New or updated pack notes should:

- include `pack/<pack>` and `agent-memory/<type>` tags;
- link to the pack manifest;
- link to the relevant type index when one exists;
- be added to the relevant type index;
- keep durable relationships in `related_notes` frontmatter and/or `## Related`.

This makes Obsidian Graph View useful through portable Markdown instead of relying only on local Obsidian settings.

To optionally generate local Graph View color groups from existing packs, run:

```bash
python3 scripts/sync-obsidian-graph.py
```

Use `--mode types` or `--mode hybrid` to color by note type or both packs and types.

## Frontmatter

Recommended frontmatter:

```yaml
---
type: context-pack
id: context.example
status: active
source_of_truth: false
freshness: current
last_reviewed: 2026-04-29
tags:
  - agent-memory/context
---
```

## Freshness values

- `current`: reviewed and safe to use.
- `stale`: probably outdated; verify before use.
- `unknown`: no guarantee of validity.
- `deprecated`: do not use as current truth.

## Source of truth

Memory is usually guidance, not the final authority. When behavior matters, source-of-truth files win: code, tests, API specs, official docs, configs, deployment manifests, or explicit user decisions.
