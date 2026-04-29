# 0002 — skills.sh Distribution Channel

## Status

Accepted

## Context

Agent Memory Vault is a portable agent skill. Users should be able to install it with common agent-skill tooling, not only through Pi-specific installation or manual repository cloning.

The public skills.sh ecosystem provides a generic CLI:

```bash
npx skills add <owner>/<repo>
```

The Agent Memory Vault repository already exposes the skill in a compatible location:

```txt
skills/agent-memory-vault/SKILL.md
```

The skills CLI can discover the skill from the GitHub repository and list it as `agent-memory-vault`.

## Decision

Agent Memory Vault will treat skills.sh / the `skills` CLI as a public distribution channel.

The public install command to document and promote is:

```bash
npx skills add weauratech/agent-memory-vault --skill agent-memory-vault
```

Documentation should include:

- install commands;
- discovery verification;
- release checklist;
- safety reminders;
- explanation that normal skills.sh visibility is driven by installs through the CLI rather than a separate manual submission form.

## Consequences

### Benefits

- Agent Memory Vault becomes easier to install across multiple coding agents.
- The project can be discovered by users browsing skills.sh.
- The install path is not tied to a single agent harness.
- Public documentation now explains how to verify skills CLI compatibility.

### Trade-offs

- skills.sh ranking/search visibility may depend on aggregate CLI install volume and indexing latency.
- The project must keep `SKILL.md` metadata stable and compatible with the skills CLI.
- Release hygiene matters more because users may install directly from the public GitHub repository.

## Public implementation

This decision is reflected in:

- `docs/skills-sh.md`
- `README.md`
- `DASHBOARD.md`
- `CHANGELOG.md`
- `package.json`

## Related

- `docs/skills-sh.md`
- `skills/agent-memory-vault/SKILL.md`
- `package.json`
