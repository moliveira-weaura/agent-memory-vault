# Memory Packs

A memory pack is a folder containing durable context for a project, company, client, user workflow, environment, or domain.

## Create a pack

```bash
python3 scripts/new-pack.py my-project
```

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
      decision-index.md
      runbook-index.md
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

## Obsidian links

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
