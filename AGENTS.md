# AGENTS.md — Agent Memory Vault

This repository is an AI-first memory vault and skill package.

## What to do first

1. Read `skills/agent-memory-vault/SKILL.md`.
2. If the task involves a company, client, project, repository, integration, runbook, decision, incident, environment, or durable user context, apply the Memory Gate.
3. Consult the relevant pack under `packs/<pack-slug>/` if one exists.
4. If no pack exists and the task produces durable context, ask briefly whether to create one.

## Important entrypoints

- Human dashboard: `DASHBOARD.md`
- Human README: `README.md`
- Skill: `skills/agent-memory-vault/SKILL.md`
- Memory Gate: `skills/agent-memory-vault/references/memory-gate.md`
- Structured Prompt Gate: `skills/agent-memory-vault/references/structured-prompt-gate.md`
- Pack template: `skills/agent-memory-vault/templates/pack/`

## Safety

Never store secrets, tokens, passwords, private keys, credentials, full payment card numbers, sensitive customer data, or sensitive real payloads in this repository.

Store only safe operational context and pointers to approved vaults/procedures.

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

Before committing, run:

```bash
python3 scripts/validate-vault.py
```
