---
name: agent-memory-vault
description: A portable memory skill for AI coding agents that stores user context, actions, decisions, and environment observations in an Obsidian vault. Use when a task involves durable user/project/company context, repositories, environments, actions, decisions, runbooks, incidents, troubleshooting, or knowledge that may need to be retrieved or persisted safely.
---

# Agent Memory Vault

## Goal

Use Agent Memory Vault as a portable, local-first memory system for AI coding agents and humans.

This skill teaches the agent to:

- detect when durable context is relevant;
- retrieve memory from Obsidian-compatible packs;
- consult source-of-truth files before acting;
- apply safety rules before storing anything;
- persist or propose updates when new durable knowledge appears;
- keep runbooks, decisions, actions, observations, and session handoffs useful over time.

## Repository layout

The package root contains:

```txt
skills/agent-memory-vault/   # this skill
packs/                       # user-created memory packs
docs/                        # public documentation
DASHBOARD.md                 # human entrypoint
```

## Pack location

Memory packs live under:

```txt
../../packs/<pack-slug>
```

Resolve paths relative to this skill directory. If the expected path does not exist, locate the package root by finding a `package.json` with `name: "agent-memory-vault"`.

## Memory Gate — required

Every task that involves durable user, project, company, repository, integration, environment, action, runbook, decision, incident, troubleshooting, or shared operational context must pass through the Memory Gate.

Detailed reference: `references/memory-gate.md`.

### Retrieval Gate — before responding or acting

Before responding or acting:

1. Identify entities mentioned or implied:
   - user/team preference;
   - company/client/project;
   - repository;
   - environment;
   - integration;
   - action performed;
   - decision;
   - runbook;
   - incident/troubleshooting;
   - source-of-truth file.
2. Choose the relevant pack under `packs/`.
3. Read the pack manifest, indexes, context packs, and related runbooks.
4. Follow relevant Obsidian wikilinks in indexes, `## Related`, and frontmatter.
5. Consult source-of-truth files when code, API behavior, configuration, deployment, or a possible divergence is involved.
6. Briefly mention which notes and source-of-truth files were consulted.

If no pack exists but the task is likely to produce durable context, ask briefly whether to create one.

### Structured Prompt Gate — for non-trivial work

For non-trivial code, architecture, deployment, incident, troubleshooting, runbook, decision, or domain-rule work, use `references/structured-prompt-gate.md` before execution.

Use a compact REASONS-lite structure:

- Requirements
- Entities
- Approach
- Structure
- Operations
- Norms
- Safeguards

Skip this gate for simple Q&A, quick lookups, and low-risk one-off tasks.

### Persistence Gate — after relevant work

At the end of relevant interactions, evaluate whether new or changed knowledge should be persisted.

Default mode: **semi-automatic**.

The agent may persist automatically when the information is safe, non-sensitive, durable, operationally useful, clear, and attributable to a source-of-truth file, trusted source, or explicit user instruction.

Ask for short approval when there is ambiguity, insufficient source, conflict with existing memory, significant impact on a procedure/decision/rule, or uncertainty about the destination.

When asking for approval, use the user's current language when possible and be brief:

```txt
Can I save this to memory?

- <1-3 bullets with what will be saved>
- Destination: <likely note/runbook/ADR>
```

For runbooks:

```txt
Can I update the runbook?

- <objective change>
- Destination: <runbook>
```

Do not send long text, large diffs, or repeated context just to ask for persistence approval.

## Source-of-truth rules

Memory guides the agent but does not override source-of-truth files.

Preferred source hierarchy:

1. Real code, configuration, deployment manifests, tests, and runtime facts.
2. Formal contracts such as API specs and schemas.
3. Official project documentation.
4. Memory pack notes.
5. Session history.

If memory diverges from source truth, report the divergence and update or propose an update to memory.

## Safety rules

Never store:

- secrets;
- tokens;
- passwords;
- private keys;
- credentials;
- full payment card numbers;
- sensitive customer data;
- sensitive real payloads.

Store only safe operational context and pointers to approved secret stores or procedures.

## Obsidian links

Use Obsidian wikilinks for relationships:

```md
[[packs/<pack>/20-context/project-context|Project Context]]
```

Rules:

- paths are relative to the vault root;
- omit `.md` extensions;
- use a readable alias after `|`;
- add `## Related` sections when a note connects to another user, project, runbook, action, decision, or observation.

## How to respond after using memory

Briefly mention:

- which notes were consulted;
- which source-of-truth files were used;
- any uncertainty, stale memory, or divergence.

Keep the response proportional to the user's request.
