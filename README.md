# Agent Memory Vault

> A portable memory skill for AI coding agents that stores user context, actions, decisions, and environment observations in an Obsidian vault.

Agent Memory Vault is an open-source, AI-first memory system for coding agents and humans. It combines:

1. **An Obsidian vault** for human-readable memory.
2. **A portable agent skill** that teaches AI coding agents how to retrieve, evaluate, and safely update that memory.
3. **Memory pack templates** for projects, companies, clients, environments, decisions, runbooks, sessions, and observations.

It is designed to help agents stop relying only on chat history and instead use durable, reviewable, version-controlled context.

## Why this exists

AI coding agents are more useful when they remember durable context:

- how a project is structured;
- which commands are safe to run;
- what decisions were made;
- what runbooks exist;
- what changed in an environment;
- what the user prefers;
- what should never be persisted.

Agent Memory Vault gives that memory a safe structure.

## What it stores

Agent Memory Vault is intended for **safe operational context**, such as:

- project context;
- user preferences that are safe to remember;
- environment observations;
- actions performed;
- decisions and ADRs;
- runbooks;
- troubleshooting notes;
- source-of-truth pointers;
- session handoffs.

It must **not** store secrets or sensitive data.

## Repository status

This repository is intentionally shipped with no private/company packs. It is a clean starter vault.

Create your own packs under:

```txt
packs/<pack-slug>/
```

## Install as a Pi package

From a local clone:

```bash
pi install /path/to/agent-memory-vault
```

From GitHub after publishing:

```bash
pi install git:https://github.com/<owner>/agent-memory-vault
```

## Open as an Obsidian vault

1. Open Obsidian.
2. Choose **Open folder as vault**.
3. Select the `agent-memory-vault` folder.
4. Start at `DASHBOARD.md`.

## Create your first memory pack

```bash
python3 scripts/new-pack.py my-project
```

Then edit:

```txt
packs/my-project/00-system/pi-agent/memory-manifest.md
```

## Core concepts

### Memory packs

A pack is a folder of related memory, usually for a project, company, client, or domain.

Typical structure:

```txt
packs/<pack>/
  00-system/       # manifests, protocols, indexes, ontology
  10-user/         # safe user/team preferences and working agreements
  20-context/      # project/company/domain context packs
  30-projects/     # repositories and project maps
  40-actions/      # notable actions performed
  50-decisions/    # ADRs and durable decisions
  60-observations/ # environment observations and facts
  70-runbooks/     # repeatable procedures
  80-sessions/     # session handoffs
```

### Memory Gate

The skill uses a Memory Gate:

1. **Retrieval Gate** — before acting, consult relevant memory.
2. **Persistence Gate** — after relevant work, decide whether new knowledge should be saved, proposed, or ignored.

### Structured Prompt Gate

For non-trivial tasks, the skill can organize work using a lightweight REASONS-style structure:

- Requirements
- Entities
- Approach
- Structure
- Operations
- Norms
- Safeguards

This makes agent work more reviewable and less ad hoc.

## Safety rule

Never store:

- secrets;
- tokens;
- passwords;
- private keys;
- credentials;
- full payment card numbers;
- sensitive customer data;
- sensitive real payloads.

Store only safe context and pointers to approved secret stores or procedures.

## Validate the vault

```bash
python3 scripts/validate-vault.py
```

## Documentation

- `docs/getting-started.md`
- `docs/memory-packs.md`
- `docs/security-policy.md`
- `docs/contributing.md`
- `skills/agent-memory-vault/SKILL.md`

## Contributing

Contributions are welcome. See `CONTRIBUTING.md` and `docs/contributing.md`.

## License

MIT. See `LICENSE`.
