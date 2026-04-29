# Structured Prompt Gate

The Structured Prompt Gate makes non-trivial AI-assisted work more governable, reviewable, and reusable.

Use it after Retrieval Gate and before execution.

```txt
Retrieval Gate → Structured Prompt Gate → Execution → Review → Persistence Gate
```

## When to use

Use this gate for work involving:

- code changes;
- API behavior;
- architecture;
- deployment;
- incident analysis;
- troubleshooting;
- runbook updates;
- decisions;
- security-sensitive flows;
- cross-cutting refactors;
- complex domain rules.

Skip it for simple Q&A, quick lookups, and low-risk one-off tasks.

## REASONS-lite canvas

Structure the task using:

### Requirements

What problem are we solving? What does done mean?

### Entities

What user, project, domain, files, systems, services, or data are involved?

### Approach

What strategy will satisfy the requirements?

### Structure

Where does the change fit? Which components, docs, runbooks, or memory notes are involved?

### Operations

What concrete steps should be performed?

### Norms

Which reusable conventions apply? Examples: naming, testing, commits, documentation, observability, accessibility, security practices.

### Safeguards

What must not be violated? Examples: no secrets, no unsafe commands, no contract changes without docs, no customer data exposure.

## Output style

Do not produce a large ceremony document unless the task requires it.

For most tasks, keep the canvas compact:

```txt
Requirements: ...
Entities: ...
Approach: ...
Structure: ...
Operations: ...
Norms: ...
Safeguards: ...
```

## Review rule

Before finishing, compare the result against the structured prompt:

- Were requirements met?
- Did operations complete?
- Were norms followed?
- Were safeguards respected?
- Did anything new need to be persisted?

If reality diverges from memory or the structured prompt, update memory/runbooks/decisions first or propose a concise update.
