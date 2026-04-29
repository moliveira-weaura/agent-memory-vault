# AGENTS.md — Agent Memory Vault

This repository is an AI-first memory vault and skill package.

## What to do first

1. Read `skills/agent-memory-vault/SKILL.md`.
2. Treat the Memory Gate as always-on: before acting, check whether durable memory is relevant; before finishing, check whether safe durable knowledge should be persisted.
3. If the task involves a company, client, project, repository, integration, runbook, decision, incident, environment, or durable user context, apply the full Memory Gate.
4. Consult the relevant pack under `packs/<pack-slug>/` if one exists.
5. If no pack exists and the task produces durable context, ask briefly whether to create one.

## Important entrypoints

- Human dashboard: `DASHBOARD.md`
- Human README: `README.md`
- Skill: `skills/agent-memory-vault/SKILL.md`
- Always-On Memory Gate: `docs/always-on-memory-gate.md`
- Memory Gate: `skills/agent-memory-vault/references/memory-gate.md`
- Structured Prompt Gate: `skills/agent-memory-vault/references/structured-prompt-gate.md`
- Note templates: `skills/agent-memory-vault/templates/`

## Safety

Never store secrets, tokens, passwords, private keys, credentials, full payment card numbers, sensitive customer data, or sensitive real payloads in this repository.

Store only safe operational context and pointers to approved vaults/procedures.

## Always-On Memory Gate

For every interaction:

- Before acting: decide whether durable memory is relevant.
- Before finishing: decide whether safe durable knowledge should be persisted.
- Keep responses quiet when no memory action is needed.
- Mention memory when notes were consulted, knowledge was saved, approval is needed, or persistence was blocked for safety.

## Updating memory

Update or propose updates when there is durable knowledge:

- user/project/company context;
- environment observation;
- action performed;
- product or technical decision;
- business rule;
- architecture/deploy/integration change;
- docs-vs-code divergence;
- incident/troubleshooting learning;
- runbook-worthy procedure.

When creating or updating pack notes, keep writes graph-aware: add `pack/<slug>` and `agent-memory/<type>` tags, link to the pack manifest, link to the relevant type index, and update indexes with wikilinks.

## Mirroring private product decisions to open source

Private/local packs are ignored by Git. If a private memory decision affects public Agent Memory Vault behavior, protocol, docs, templates, validation, security posture, or contributor expectations, mirror it into the open-source repository as a safe public decision record under `docs/decisions/`.

Public decision records must be generic and must not include private company/client context, secrets, credentials, sensitive payloads, or private memory pack details.

Before committing, run:

```bash
python3 scripts/validate-vault.py
```
