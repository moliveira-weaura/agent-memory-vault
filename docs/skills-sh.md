# Publishing on skills.sh

Agent Memory Vault is installable through the [`skills`](https://github.com/vercel-labs/skills) CLI and can appear on [skills.sh](https://skills.sh) through normal CLI installation telemetry.

## Status

```txt
Skill name: agent-memory-vault
Source: https://github.com/weauratech/agent-memory-vault
Install status: installable with npx skills add
```

## Install

Recommended install command:

```bash
npx skills add weauratech/agent-memory-vault --skill agent-memory-vault
```

Install globally and skip prompts:

```bash
npx skills add weauratech/agent-memory-vault \
  --skill agent-memory-vault \
  --global \
  --yes
```

Install for a specific supported agent:

```bash
npx skills add weauratech/agent-memory-vault \
  --skill agent-memory-vault \
  --agent claude-code \
  --yes
```

```bash
npx skills add weauratech/agent-memory-vault \
  --skill agent-memory-vault \
  --agent opencode \
  --yes
```

## Verify discovery

List skills available in this repository:

```bash
npx --yes skills add weauratech/agent-memory-vault --list
```

Expected result:

```txt
Found 1 skill
Available Skills
  agent-memory-vault
```

## Verify local installation

Install into a temporary test directory instead of your active project:

```bash
tmpdir="$(mktemp -d)"
cd "$tmpdir"
npx skills add weauratech/agent-memory-vault \
  --skill agent-memory-vault \
  --agent claude-code \
  --yes
find . -maxdepth 4 -type f | sort
```

Confirm that the installed files include `agent-memory-vault` and `SKILL.md` for the target agent.

## How listing works

There is no separate manual submission step for a normal GitHub-hosted skill.

According to the public skills.sh docs and FAQ, skills appear through anonymous aggregated telemetry when users install with the skills CLI:

```bash
npx skills add <owner>/<repo>
```

For this project, promote:

```bash
npx skills add weauratech/agent-memory-vault --skill agent-memory-vault
```

After installs occur, skills.sh can index/rank the skill based on aggregate CLI installation counts. Search and leaderboard visibility may lag because of cache, indexing, or low install volume.

## Skill metadata

The skills CLI reads the skill from:

```txt
skills/agent-memory-vault/SKILL.md
```

The frontmatter should stay valid:

```yaml
---
name: agent-memory-vault
description: A portable memory skill for AI coding agents that stores user context, actions, decisions, and environment observations in an Obsidian vault. Use when a task involves durable user/project/company context, repositories, environments, actions, decisions, runbooks, incidents, troubleshooting, or knowledge that may need to be retrieved or persisted safely.
---
```

## Release checklist

Before promoting a release through skills.sh:

1. Validate the vault:

   ```bash
   python3 scripts/validate-vault.py
   ```

2. Verify skills CLI discovery:

   ```bash
   npx --yes skills add weauratech/agent-memory-vault --list
   ```

3. Review public files for sensitive data:

   ```bash
   rg -i "secret|token|password|credential|private key|api_key|akia" .
   ```

   Documentation may mention these words as examples. Actual secret values are not acceptable.

4. Confirm `packs/*` remains ignored unless an example pack is intentionally published.

5. Commit and push docs/skill changes.

6. Create and push a Git tag when cutting a public release:

   ```bash
   git tag -a v0.2.0 -m "v0.2.0"
   git push origin v0.2.0
   ```

## Safety posture

The skill explicitly refuses to persist:

- secrets;
- credentials;
- private keys;
- tokens;
- full payment card numbers;
- sensitive customer data;
- sensitive production payloads.

Agent Memory Vault stores safe operational context and pointers to approved procedures, not secret values.

## Related

- [`README.md`](../README.md)
- [`docs/ai-first-install.md`](ai-first-install.md)
- [`docs/always-on-memory-gate.md`](always-on-memory-gate.md)
- [`docs/decisions/0002-skills-sh-distribution.md`](decisions/0002-skills-sh-distribution.md)
- [`skills/agent-memory-vault/SKILL.md`](../skills/agent-memory-vault/SKILL.md)
