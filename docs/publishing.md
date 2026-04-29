# Publishing Guide

## GitHub description

Use this short description:

```txt
A portable memory skill for AI coding agents that stores user context, actions, decisions, and environment observations in an Obsidian vault.
```

## Suggested topics

```txt
ai-agents, coding-agents, obsidian, memory, pi-package, agent-skills, developer-tools
```

## Before making the repository public

1. Confirm no private packs were copied.
2. Run validation:

```bash
python3 scripts/validate-vault.py
```

3. Search for private/sensitive terms:

```bash
rg -i "<old-private-term>|secret|token|password|credential|private key|api_key|akia" .
```

4. Review all matches manually.
5. Confirm `package.json` has:

```json
"name": "agent-memory-vault",
"private": false
```

6. Confirm `LICENSE` is present.
7. Create the GitHub repository with no old history.
8. Push this clean repository.

## Suggested first release

Tag:

```bash
git tag v0.1.0
git push origin main --tags
```

Release title:

```txt
Agent Memory Vault v0.1.0
```

Release notes:

```txt
Initial open-source release with a portable memory skill, starter vault, templates, validation tooling, and documentation.
```
