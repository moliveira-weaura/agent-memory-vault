# Structured Prompt-Driven Memory Workflows

Agent Memory Vault includes a lightweight Structured Prompt Gate inspired by structured prompt-driven development practices.

The goal is not to add ceremony to every task. The goal is to make non-trivial AI-assisted work more governable, reviewable, and reusable.

## When to use the Structured Prompt Gate

Use it for tasks involving:

- code changes;
- API behavior;
- architecture;
- deployment;
- incident analysis;
- troubleshooting;
- runbook changes;
- decisions;
- security-sensitive flows;
- cross-cutting refactors;
- complex domain rules.

Skip it for simple Q&A, quick lookups, and low-risk one-off tasks.

## REASONS-lite

The gate uses a compact structure:

- **Requirements** — what problem is being solved and what done means.
- **Entities** — key domain concepts, files, systems, actors, or data.
- **Approach** — the strategy.
- **Structure** — where the change fits.
- **Operations** — concrete steps.
- **Norms** — reusable standards and team conventions.
- **Safeguards** — non-negotiable boundaries and safety rules.

## Memory connection

The Structured Prompt Gate runs after Retrieval Gate and before execution:

```txt
Retrieval Gate → Structured Prompt Gate → Execution → Review → Persistence Gate
```

If reality diverges from the memory or prompt, update the memory/runbook/decision first or propose a concise update.
