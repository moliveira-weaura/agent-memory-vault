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

## Why Agent Memory Vault?

AI coding agents are powerful, but they forget durable context between sessions:

- project structure and conventions;
- safe commands and dangerous commands;
- architecture decisions;
- runbooks and incident learnings;
- environment observations;
- user/team preferences;
- what should never be persisted.

Agent Memory Vault gives that context a safe, local-first home. Instead of relying only on chat history, agents can work from reviewable Markdown memory that humans can inspect, edit, version, and open in Obsidian.

## Why teams adopt it

Agent Memory Vault turns scattered operational knowledge into reusable agent context. The value is not that it makes the model magically smarter; the value is that it prevents the agent from starting from zero every time.

| Team problem | How Agent Memory Vault helps |
|---|---|
| Agents repeatedly rediscover the same repository structure, commands, deploy flow, or environment details. | Store repository maps, runbooks, observations, and source-of-truth pointers once, then reuse them across sessions. |
| Prior decisions get lost in chat history or stay in someone’s head. | Capture decisions as reviewable Markdown records with links, status, and context. |
| Humans keep answering the same setup, access, deploy, or troubleshooting questions. | Move safe recurring answers into memory packs and runbooks that agents can consult before asking. |
| Agent output needs repeated correction because project conventions were missed. | Give the agent local conventions, runbooks, architecture notes, and source-truth rules before it acts. |
| Context does not survive handoffs between sessions or team members. | Use session notes, actions, observations, and decisions as durable handoff material. |
| Teams worry about agents saving the wrong thing. | Apply a Persistence Gate that refuses secrets and sensitive data, and stores only safe operational context. |

### Measurable adoption signals

Run a small pilot and compare similar tasks with and without Agent Memory Vault.

| Metric | Expected direction | Why it matters |
|---|---:|---|
| Context discovery time | Down | Less time spent finding files, conventions, deploy paths, accounts, clusters, or runbooks. |
| Prompts per task | Down | Fewer back-and-forth messages needed to reach useful output. |
| Repeated questions | Down | Agents stop asking for information that has already been captured safely. |
| Human corrections | Down | Fewer fixes caused by missing prior decisions or project conventions. |
| First-pass success rate | Up | More tasks are useful on the first serious attempt. |
| Knowledge reuse | Up | Existing decisions, runbooks, and observations are actively used instead of forgotten. |
| Onboarding speed | Up | New agents and team members can start from shared context instead of tribal knowledge. |

Simple ROI estimate:

```txt
hours saved per week = agent-assisted tasks per week × minutes saved per task ÷ 60
```

## What you get

- **Always-On Memory Gate** — lightweight relevance and persistence checks for every interaction.
- **Retrieval Gate** — read the right pack, notes, runbooks, decisions, and source-truth files before acting.
- **Persistence Gate** — save safe durable knowledge and refuse secrets or sensitive data.
- **Memory packs** — local/private knowledge domains for projects, companies, clients, environments, or workflows.
- **Graph-aware Markdown notes** — context, actions, decisions, observations, runbooks, notes, and sessions linked for humans and agents.
- **Source-of-truth rules** — memory guides the agent but code, configs, tests, schemas, and runtime facts win.

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

## Memory Gate — always-on

The Memory Gate is always on as a lightweight check.

For every interaction, perform two quick internal checks:

1. **Before acting:** is durable memory relevant to this task?
2. **Before finishing:** did this interaction produce safe durable knowledge that should be persisted or proposed?

If no durable memory is relevant, continue normally and do not mention memory unless the user asked. If durable memory is relevant, apply the Retrieval Gate and Persistence Gate below.

Every task that involves durable user, project, company, repository, integration, environment, action, runbook, decision, incident, troubleshooting, or shared operational context must pass through the full Memory Gate.

Detailed reference: `references/memory-gate.md`. User-facing setup guide: `../../docs/always-on-memory-gate.md`.

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

At the end of every interaction, run a lightweight persistence check. For relevant interactions, evaluate whether new or changed knowledge should be persisted.

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

Keep responses quiet when there is no memory action. Mention memory when notes were consulted, source-truth was checked, memory was saved, persistence approval is needed, or safety blocked persistence.

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

## Obsidian links and graph-aware writes

Use Obsidian wikilinks for relationships:

```md
[[packs/<pack>/20-context/project-context|Project Context]]
```

Rules:

- paths are relative to the vault root;
- omit `.md` extensions;
- use a readable alias after `|`;
- add `## Related` sections when a note connects to another user, project, runbook, action, decision, observation, or session.

When creating or updating notes inside `packs/<pack-slug>/`, preserve a useful Obsidian graph topology:

1. infer the pack slug from the path;
2. infer the note type from frontmatter `type` or the containing directory;
3. include `pack/<pack-slug>` and `agent-memory/<type>` tags;
4. link the note to the pack manifest;
5. link the note to the relevant type index when one exists;
6. add new notes to the relevant type index using Obsidian wikilinks;
7. keep durable relationships in `related_notes` frontmatter and/or `## Related`.

This graph-aware write standard must be defined by this skill, references, templates, and pack scaffolding. Do not rely on private/local packs or local observations to define global behavior.

## How to respond after using memory

Briefly mention:

- which notes were consulted;
- which source-of-truth files were used;
- any uncertainty, stale memory, or divergence.

Keep the response proportional to the user's request.
