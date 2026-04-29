# CLAUDE.md — Agent Memory Vault

When using Claude Code in this repository, start with:

1. `AGENTS.md`
2. `skills/agent-memory-vault/SKILL.md`
3. The relevant pack under `packs/`, if one exists.

Use the Always-On Memory Gate:

- Before acting, check whether durable memory is relevant.
- Before finishing, check whether safe durable knowledge should be persisted.
- Apply the full Memory Gate when working with durable user, company, project, repository, decision, runbook, incident, or environment context.
- Keep responses quiet when no memory action is needed.
- Mention memory when notes were consulted, knowledge was saved, approval is needed, or persistence was blocked for safety.

Do not store secrets or sensitive data in this repository.
