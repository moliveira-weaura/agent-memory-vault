# skills.sh Submission Notes

This project is intended to be publishable as an agent skill package.

## Skill name

```txt
agent-memory-vault
```

## Short description

```txt
A portable memory skill for AI coding agents that stores user context, actions, decisions, and environment observations in an Obsidian vault.
```

## What the skill does

- Detects when durable context is relevant.
- Retrieves memory from local Obsidian-compatible packs.
- Applies source-of-truth and safety rules.
- Evaluates whether new information should be persisted.
- Helps agents maintain runbooks, decisions, actions, observations, and session handoffs.

## Safety posture

The skill explicitly refuses to persist secrets, credentials, private keys, tokens, full payment card numbers, sensitive customer data, or sensitive production payloads.

## Suggested categories

- AI coding agents
- Memory
- Developer productivity
- Obsidian
- Documentation
