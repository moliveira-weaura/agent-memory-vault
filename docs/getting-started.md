# Getting Started

Agent Memory Vault can be used as both an Obsidian vault and an AI-agent skill package.

## AI-first install

The recommended quickstart is to ask your coding agent to install Agent Memory Vault for its own environment.

Copy this prompt into Claude Code, OpenCode, Pi, or another coding agent:

```txt
Install Agent Memory Vault for this agent environment.

Read and follow the AI-first installer guide:
https://raw.githubusercontent.com/weauratech/agent-memory-vault/main/docs/ai-first-install.md

Target this current environment first. If Pi is available, use the Pi package install. If this is Claude Code or OpenCode, clone the repository locally and wire the agent instruction file to read the Agent Memory Vault skill before durable-context work.

After installing, verify the skill is readable and respond with the welcome template from the installer guide.

Do not store secrets, credentials, private keys, sensitive customer data, or sensitive payloads.
```

Agent-readable guide: [`docs/ai-first-install.md`](ai-first-install.md).

## Manual install

### 1. Clone the repository

```bash
git clone https://github.com/weauratech/agent-memory-vault.git
cd agent-memory-vault
```

### 2. Open in Obsidian

Open this folder as an Obsidian vault and start at:

```txt
DASHBOARD.md
```

### 3. Install in Pi

```bash
pi install /path/to/agent-memory-vault
```

The package exposes the skill in:

```txt
skills/agent-memory-vault/SKILL.md
```

### 4. Create a memory pack

```bash
python3 scripts/new-pack.py my-project
python3 scripts/sync-obsidian-graph.py
```

This creates:

```txt
packs/my-project/
```

Start with:

```txt
packs/my-project/00-system/pi-agent/memory-manifest.md
```

### 5. Use the skill

Prompt your agent with:

```txt
Use agent-memory-vault before working on this context. Tell me which notes and source-of-truth files you consulted.
```

### 6. Validate before committing

```bash
python3 scripts/validate-vault.py
```

## Recommended workflow

1. Capture durable context in packs.
2. Keep secrets out.
3. Use runbooks for repeatable procedures.
4. Use decisions/ADRs for durable trade-offs.
5. Use session notes for handoffs.
6. Review memory changes like code.
