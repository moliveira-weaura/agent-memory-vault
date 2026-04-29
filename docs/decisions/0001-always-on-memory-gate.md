# 0001 — Always-On Memory Gate

## Status

Accepted

## Context

Agent Memory Vault exists so coding agents can use durable, safe, reviewable memory instead of relying only on chat history.

The original Memory Gate required agents to retrieve relevant memory before durable-context work and evaluate persistence after relevant work. In practice, users often provide durable context without explicitly saying “save this to memory”. If an agent treats memory as opt-in only, useful context can be answered once and then lost.

Examples of durable context users may provide naturally:

- which GitHub account to use for an organization;
- which AWS profiles map to environments;
- which repository is the source of truth for a product;
- which runbook should be followed for deployments;
- which decision changed an operational procedure.

The product needs a clearer behavior contract: agents should perform a lightweight memory relevance check automatically, while avoiding noisy responses when no memory action is needed.

## Decision

Agent Memory Vault treats the Memory Gate as **always-on**.

For every interaction, the agent performs two lightweight checks:

```txt
Before acting: is durable memory relevant?
Before finishing: did this produce safe durable knowledge?
```

If durable memory is relevant, the agent applies the full Memory Gate:

```txt
Retrieval Gate → Work → Persistence Gate
```

If no durable memory is relevant, the agent continues normally and does not mention memory unless the user asked.

The agent should persist automatically only when the information is:

- safe and non-sensitive;
- durable;
- operationally useful;
- clear;
- attributable to source truth, trusted source, or explicit user instruction;
- easy to place in an obvious note, runbook, action, observation, or decision.

The agent should ask brief approval when the information is ambiguous, high-impact, conflicting, insufficiently sourced, or unclear in destination.

The agent must never persist secrets, credentials, tokens, private keys, sensitive customer data, or sensitive payloads.

## Consequences

### Benefits

- Users do not need to say “save this to memory” every time.
- Durable operational context is less likely to be lost.
- Memory retrieval and persistence become part of normal agent hygiene.
- The behavior is easier to install as an always-on instruction in agent rule files.

### Trade-offs

- Agents must avoid adding noisy “no memory updates” messages to every response.
- Agents must distinguish between durable context and temporary conversation details.
- Persistence still requires strict safety checks to avoid storing sensitive data.

## Public implementation

This decision is reflected in:

- `docs/always-on-memory-gate.md`
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/ai-first-install.md`
- `docs/getting-started.md`
- `skills/agent-memory-vault/SKILL.md`
- `skills/agent-memory-vault/references/memory-gate.md`
- `skills/agent-memory-vault/references/update-protocol.md`

## Related

- `docs/always-on-memory-gate.md`
- `skills/agent-memory-vault/SKILL.md`
- `skills/agent-memory-vault/references/memory-gate.md`
- `skills/agent-memory-vault/references/update-protocol.md`
