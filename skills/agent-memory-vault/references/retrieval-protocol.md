# Retrieval Protocol

This protocol is the Retrieval Gate of Agent Memory Vault.

## When to apply

Apply before responding or acting when the prompt involves durable user, project, company, repository, integration, environment, action, decision, runbook, session, deploy, incident, troubleshooting, or shared operational context.

## Steps

1. Identify entities: user/team preference, company/client/project, repository, integration, environment, action, decision, runbook, session, incident, or troubleshooting.
2. Choose the relevant pack under `packs/`.
3. Read the pack manifest.
4. Read `resource-map.md` and local overrides, if present.
5. Read relevant indexes.
6. Read related context packs and runbooks.
7. Follow relevant Obsidian wikilinks in indexes, `## Related`, and frontmatter.
8. For code, API, configuration, deployment, real behavior, divergence, or possibly stale context, consult source-of-truth files.
9. Answer while briefly citing notes and source-of-truth files consulted.
10. At the end, run the Persistence Gate.

Reference: `memory-gate.md`.
