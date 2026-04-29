# Decision Records

This directory contains public decision records for Agent Memory Vault.

Decision records capture product, architecture, protocol, documentation, template, validation, and contributor-facing decisions that affect the open-source project.

They are intentionally generic and safe for public readers.

## Why this exists

Agent Memory Vault can be used with private/local memory packs. Those packs are useful for local operations, but they are ignored by Git by default and are not visible to open-source users or contributors.

When a private/local memory decision affects the public product, it must be mirrored here as a sanitized public decision record.

## Rules

Public decision records must:

- explain the context and decision clearly;
- include status and consequences;
- link only to public repository files or public documentation;
- avoid private pack paths as required context;
- avoid private company, client, customer, or personal sensitive details;
- never include secrets, credentials, tokens, private keys, sensitive payloads, or sensitive customer data.

## Format

Use this structure:

```md
# 0000 — Decision title

## Status

Proposed | Accepted | Superseded | Deprecated

## Context

What problem or trade-off led to this decision?

## Decision

What did we decide?

## Consequences

### Benefits

- ...

### Trade-offs

- ...

## Related

- `path/to/public-file.md`
```

## Records

| Decision | Status | Summary |
|---|---|---|
| [0001 — Always-On Memory Gate](0001-always-on-memory-gate.md) | Accepted | Agents perform lightweight memory relevance and persistence checks on every interaction. |
