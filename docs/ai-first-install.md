# AI-First Install

This guide is written for the user's AI coding agent.

Your job: install **Agent Memory Vault** for the user's current agent environment, then return the welcome response template at the end of this document.

Supported targets:

- Pi
- Claude Code
- OpenCode

If the environment is not one of those targets, install the repository locally and wire the current agent's instruction file to read `skills/agent-memory-vault/SKILL.md` before durable-context work.

## Installation rules

1. Do not store secrets, credentials, private keys, sensitive customer data, or sensitive payloads.
2. Prefer a local, user-owned installation path.
3. Do not overwrite existing instruction files without preserving their content.
4. If a command or instruction-file path is uncertain, inspect the environment first and explain the safe fallback.
5. After installation, verify that the skill file exists and can be read.

## Repository

```txt
https://github.com/weauratech/agent-memory-vault
```

Skill file:

```txt
skills/agent-memory-vault/SKILL.md
```

Recommended local path if cloning is needed:

```txt
~/.agent-memory-vault
```

## Step 1 — Detect the target

Detect which environment you are running in:

- If `pi` is available, prefer the Pi package install.
- If running in Claude Code, install by cloning the repo and updating a Claude-readable instruction file.
- If running in OpenCode, install by cloning the repo and updating an OpenCode-readable instruction file.
- If multiple targets are present, choose the one matching the active agent session.

Useful checks:

```bash
command -v pi || true
command -v claude || true
command -v opencode || true
pwd
```

## Step 2 — Install

### Option A — Pi

Use the Pi package install:

```bash
pi install git:https://github.com/weauratech/agent-memory-vault
pi list
```

Verify that `agent-memory-vault` appears in the installed package list.

### Option B — Claude Code

Clone or update the repository:

```bash
if [ -d "$HOME/.agent-memory-vault/.git" ]; then
  git -C "$HOME/.agent-memory-vault" pull --ff-only
else
  git clone https://github.com/weauratech/agent-memory-vault.git "$HOME/.agent-memory-vault"
fi
```

Then wire Claude Code to read the skill before durable-context work.

Preferred project-level instruction file:

```txt
CLAUDE.md
```

If `CLAUDE.md` exists, append a short section only if an Agent Memory Vault section is not already present. If it does not exist, create it.

Suggested snippet:

```md
## Agent Memory Vault

Before work involving durable user, project, company, repository, integration, environment, action, runbook, decision, incident, troubleshooting, or shared operational context, read:

`~/.agent-memory-vault/skills/agent-memory-vault/SKILL.md`

Use its Memory Gate:

1. Retrieval Gate before acting.
2. Source-of-truth check when behavior matters.
3. Persistence Gate after relevant work.

Never persist secrets or sensitive data.
```

### Option C — OpenCode

Clone or update the repository:

```bash
if [ -d "$HOME/.agent-memory-vault/.git" ]; then
  git -C "$HOME/.agent-memory-vault" pull --ff-only
else
  git clone https://github.com/weauratech/agent-memory-vault.git "$HOME/.agent-memory-vault"
fi
```

Then wire OpenCode to read the skill before durable-context work.

Preferred project-level instruction file:

```txt
AGENTS.md
```

If the current project already uses another OpenCode instruction path, use that path instead. If `AGENTS.md` exists, append a short section only if an Agent Memory Vault section is not already present. If it does not exist, create it.

Suggested snippet:

```md
## Agent Memory Vault

Before work involving durable user, project, company, repository, integration, environment, action, runbook, decision, incident, troubleshooting, or shared operational context, read:

`~/.agent-memory-vault/skills/agent-memory-vault/SKILL.md`

Use its Memory Gate:

1. Retrieval Gate before acting.
2. Source-of-truth check when behavior matters.
3. Persistence Gate after relevant work.

Never persist secrets or sensitive data.
```

## Step 3 — Verify

Verify the skill file is present:

```bash
test -f "$HOME/.agent-memory-vault/skills/agent-memory-vault/SKILL.md" && echo "Skill file found"
```

For Pi installs, also verify through Pi:

```bash
pi list | grep -i agent-memory-vault || true
```

Read the skill file before claiming success:

```bash
sed -n '1,120p' "$HOME/.agent-memory-vault/skills/agent-memory-vault/SKILL.md"
```

If installed through Pi without a local clone, inspect the installed package path shown by `pi list` and read `skills/agent-memory-vault/SKILL.md` from that package path.

## Step 4 — Optional first pack

If the user wants a first memory pack and the repository is available locally, create one:

```bash
cd "$HOME/.agent-memory-vault"
python3 scripts/new-pack.py my-project
```

Do not create a pack automatically unless the user asked for it or the current task clearly needs durable project memory.

## Response template

After installation and verification, respond using this structure:

```txt
✅ Agent Memory Vault installed.

Welcome to durable agent memory.

Target: <Pi | Claude Code | OpenCode | Other>
Skill source: <installed package path or local clone path>
Instruction file updated: <path or "not needed for Pi">
Verification: <what you checked>

What is active now:
- Retrieval Gate before durable-context work.
- Source-of-truth check when code/config/API behavior matters.
- Persistence Gate after relevant work.
- Secrets and sensitive data will not be persisted.

Next step:
Tell me the project, company, client, or workflow you want a memory pack for, or say: "create my first memory pack".
```

If installation could not be completed, explain exactly what failed, what you already checked, and the safest next command for the user to run.
