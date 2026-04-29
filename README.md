<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/card-file-box_1f5c3-fe0f.png" width="120" alt="Card file box emoji" />
</p>

<h1 align="center">Agent Memory Vault</h1>

<p align="center">
  <strong>Give coding agents durable, safe, local-first memory.</strong>
</p>

<p align="center">
  <a href="https://github.com/weauratech/agent-memory-vault/stargazers"><img src="https://img.shields.io/github/stars/weauratech/agent-memory-vault?style=flat&color=yellow" alt="Stars"></a>
  <a href="https://github.com/weauratech/agent-memory-vault/commits/main"><img src="https://img.shields.io/github/last-commit/weauratech/agent-memory-vault?style=flat" alt="Last Commit"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/weauratech/agent-memory-vault?style=flat" alt="License"></a>
  <a href="package.json"><img src="https://img.shields.io/github/package-json/v/weauratech/agent-memory-vault?style=flat" alt="Version"></a>
</p>

<p align="center">
  <a href="#why-agent-memory-vault">Why</a> •
  <a href="#before--after">Before/After</a> •
  <a href="#5-minute-quickstart">Quickstart</a> •
  <a href="#always-on-memory-gate">Always-On</a> •
  <a href="#core-concepts">Concepts</a> •
  <a href="#safety-model">Safety</a> •
  <a href="#documentation">Docs</a>
</p>

---

Agent Memory Vault is an open-source, AI-first memory system for coding agents and humans. It combines an **Obsidian-compatible vault**, a **portable agent skill**, **memory pack templates**, and **validation tooling** so agents can retrieve, use, and safely update durable context.

Instead of relying only on chat history, agents can work from reviewable, version-controlled Markdown memory.

```txt
Every prompt → Memory relevance check → Work → Persistence check → Safe memory update when useful
```

## Why Agent Memory Vault?

AI coding agents are powerful, but they forget durable context between sessions:

- project structure and conventions;
- safe commands and dangerous commands;
- architecture decisions;
- runbooks and incident learnings;
- environment observations;
- user/team preferences;
- what should never be persisted.

Agent Memory Vault gives that context a safe home.

## Before / After

<table>
<tr>
<td width="50%">

### Without durable memory

Agent starts from chat history and repository files only.

- Re-discovers the same context repeatedly.
- Misses prior decisions.
- Asks again for known procedures.
- May trust stale notes over source truth.
- Has no standard persistence gate.

</td>
<td width="50%">

### With Agent Memory Vault

Agent follows a repeatable memory protocol.

- Reads relevant pack context first.
- Checks source-of-truth files.
- Uses runbooks and decisions.
- Saves useful learnings safely.
- Refuses secrets and sensitive data.

</td>
</tr>
</table>

**Same repository. Better continuity. Safer memory.**

## What It Is

| Piece | What it does |
|---|---|
| **Obsidian vault** | Human-readable Markdown memory with wikilinks. |
| **Agent skill** | Teaches agents when and how to retrieve, evaluate, and persist memory. |
| **Memory packs** | Local/private knowledge domains for projects, companies, clients, environments, or workflows. |
| **Templates** | Starting points for context, actions, decisions, observations, runbooks, notes, and sessions. |
| **Validation** | Lightweight checks for vault hygiene, wikilinks, frontmatter, and sensitive-value patterns. |

## Always-On Memory Gate

Agent Memory Vault is meant to detect durable context automatically. Users should not need to say “save this to memory” every time.

Always-On Memory Gate means the agent performs two lightweight checks on every interaction:

```txt
Before acting: is durable memory relevant?
Before finishing: did this produce safe durable knowledge?
```

If the answer is no, the agent stays quiet. If the answer is yes, it retrieves relevant memory, checks source truth when needed, and saves or proposes safe durable updates.

Examples of context the agent should catch automatically:

- “This GitHub organization maps to this company.”
- “Always use this GitHub account for this org.”
- “These AWS profiles belong to this environment.”
- “This is the safe runbook for deploys.”

See [`docs/always-on-memory-gate.md`](docs/always-on-memory-gate.md).

## 5-Minute Quickstart

Agent Memory Vault is **AI-first**: the easiest install path is to ask your coding agent to install it for itself.

### Option A: Install with skills.sh

Use the generic `skills` CLI:

```bash
npx skills add weauratech/agent-memory-vault --skill agent-memory-vault
```

Global/non-interactive install:

```bash
npx skills add weauratech/agent-memory-vault --skill agent-memory-vault --global --yes
```

See [`docs/skills-sh.md`](docs/skills-sh.md) for verification and release notes.

### Option B: Ask your agent to install it

Copy this prompt into Claude Code, OpenCode, Pi, or another coding agent:

```txt
Install Agent Memory Vault for this agent environment.

Read and follow the AI-first installer guide:
https://raw.githubusercontent.com/weauratech/agent-memory-vault/main/docs/ai-first-install.md

Target this current environment first. If Pi is available, use the Pi package install. If this is Claude Code or OpenCode, clone the repository locally and wire the agent instruction file to read the Agent Memory Vault skill before durable-context work.

After installing, verify the skill is readable and respond with the welcome template from the installer guide.

Do not store secrets, credentials, private keys, sensitive customer data, or sensitive payloads.
```

### What your agent will do

| Target | Install behavior |
|---|---|
| **Pi** | Installs the package with `pi install git:https://github.com/weauratech/agent-memory-vault`. |
| **Claude Code** | Clones the repo locally and wires `CLAUDE.md` to read `skills/agent-memory-vault/SKILL.md`. |
| **OpenCode** | Clones the repo locally and wires `AGENTS.md` or the active OpenCode instruction file to read the skill. |

The agent will verify the install and return a welcome message like:

```txt
✅ Agent Memory Vault installed.

Welcome to durable agent memory.

Target: <Pi | Claude Code | OpenCode | Other>
Skill source: <installed package path or local clone path>
Instruction file updated: <path or "not needed for Pi">
Verification: <what was checked>
```

### Want to install manually?

Pi one-liner:

```bash
pi install git:https://github.com/weauratech/agent-memory-vault
```

Local clone:

```bash
git clone https://github.com/weauratech/agent-memory-vault.git
cd agent-memory-vault
```

Create your first memory pack and optionally sync local Obsidian Graph View color groups:

```bash
python3 scripts/new-pack.py my-project
python3 scripts/sync-obsidian-graph.py
```

Then start at:

```txt
packs/my-project/00-system/pi-agent/memory-manifest.md
```

Open the repo in Obsidian and start at [`DASHBOARD.md`](DASHBOARD.md).

## What You Get

| Feature | Included |
|---|:---:|
| Pi skill package | Yes |
| Obsidian-compatible vault | Yes |
| Local/private memory packs | Yes |
| Pack scaffolding script | Yes |
| Graph-aware Markdown templates | Yes |
| Optional Obsidian Graph View sync | Yes |
| Always-On Memory Gate | Yes |
| Retrieval Gate | Yes |
| Persistence Gate | Yes |
| Structured Prompt Gate | Yes |
| Source-of-truth rules | Yes |
| Sensitive-data safety rules | Yes |
| Lightweight validation script | Yes |

## Core Concepts

### Memory Packs

A pack is a folder of related memory, usually for a project, company, client, domain, environment, or workflow.

```txt
packs/<pack>/
  00-system/       # manifests, protocols, indexes, resource maps
  10-user/         # safe user/team preferences and working agreements
  20-context/      # project/company/domain context packs
  30-projects/     # repositories and project maps
  40-actions/      # notable actions performed
  50-decisions/    # ADRs and durable decisions
  60-observations/ # environment observations and facts
  70-runbooks/     # repeatable procedures
  80-sessions/     # session handoffs
```

By default, this repository ignores `packs/*` in Git. Your private/company memory stays local unless you intentionally change that behavior.

### Memory Gate

The skill uses an always-on, two-part Memory Gate:

1. **Retrieval Gate** — before acting, identify relevant entities, choose the right pack, read manifests/indexes/context/runbooks, follow wikilinks, and consult source truth.
2. **Persistence Gate** — before finishing, decide whether new knowledge should be saved, proposed for approval, or ignored.

Always-on does not mean every response becomes noisy. The agent mentions memory when it consulted notes, saved knowledge, needs approval, or blocked persistence for safety.

### Structured Prompt Gate

For non-trivial work, the skill can organize execution with a compact REASONS-style structure:

| Step | Meaning |
|---|---|
| Requirements | What problem is being solved? |
| Entities | What people, projects, files, systems, or data are involved? |
| Approach | What strategy will satisfy the requirements? |
| Structure | Where does the change fit? |
| Operations | What concrete steps should happen? |
| Norms | Which conventions apply? |
| Safeguards | What must not be violated? |

### Source of Truth

Memory is guidance, not final authority.

Preferred hierarchy:

1. Real code, configuration, deployment manifests, tests, and runtime facts.
2. Formal contracts such as API specs and schemas.
3. Official project documentation.
4. Memory pack notes.
5. Session history.

If memory diverges from source truth, follow source truth and update or propose updating memory.

## What Should Be Stored?

<table>
<tr>
<td width="50%">

### Good memory

- Project context
- Safe user/team preferences
- Repository maps
- Source-of-truth pointers
- Actions performed
- Decisions and ADRs
- Runbooks
- Troubleshooting notes
- Environment observations
- Session handoffs

</td>
<td width="50%">

### Never store

- Secrets
- Tokens
- Passwords
- Private keys
- Credentials
- Full payment card numbers
- Sensitive customer data
- Sensitive production payloads
- Confidential third-party data you cannot store

</td>
</tr>
</table>

> [!IMPORTANT]
> Agent Memory Vault is for safe operational context, not secret management. Store pointers to approved secret stores or procedures, never the secret values themselves.

## Repository Layout

```txt
agent-memory-vault/
  DASHBOARD.md                         # Obsidian entrypoint
  README.md                            # GitHub/public entrypoint
  AGENTS.md                            # Agent-facing repository instructions
  docs/                                # Human documentation
  packs/                               # User-created packs; ignored by Git by default
  scripts/
    new-pack.py                        # Create a new memory pack
    sync-obsidian-graph.py             # Generate local Obsidian graph color groups
    validate-vault.py                  # Validate vault hygiene
  skills/agent-memory-vault/
    SKILL.md                           # Main agent skill
    references/                        # Memory Gate, safety, source-truth, update protocols
    templates/                         # Action, context, decision, observation, runbook, session templates
```

## Using It With an Agent

After installing the Pi package, ask your agent to use the skill before durable-context work:

```txt
Use agent-memory-vault before working on this context. Tell me which notes and source-of-truth files you consulted.
```

The agent should:

1. identify the relevant project/company/domain;
2. read the corresponding pack;
3. consult source-of-truth files when behavior matters;
4. complete the task;
5. evaluate whether useful new knowledge should be persisted;
6. write memory notes with pack/type tags, manifest links, type-index links, and updated indexes.

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/ai-first-install.md`](docs/ai-first-install.md) | Agent-readable installer guide for Pi, Claude Code, OpenCode, and other agents. |
| [`docs/skills-sh.md`](docs/skills-sh.md) | Installing and promoting Agent Memory Vault through skills.sh / the `skills` CLI. |
| [`docs/getting-started.md`](docs/getting-started.md) | First setup and basic workflow. |
| [`docs/always-on-memory-gate.md`](docs/always-on-memory-gate.md) | How agents detect and persist durable context without being explicitly asked each time. |
| [`docs/decisions/README.md`](docs/decisions/README.md) | Public decision records for product, protocol, documentation, and contributor-facing decisions. |
| [`docs/memory-packs.md`](docs/memory-packs.md) | Pack structure, wikilinks, frontmatter, freshness, and source truth. |
| [`docs/security-policy.md`](docs/security-policy.md) | Safe persistence and sensitive-data rules. |
| [`docs/structured-prompt-driven-development.md`](docs/structured-prompt-driven-development.md) | Structured Prompt Gate and REASONS-lite workflow. |
| [`docs/contributing.md`](docs/contributing.md) | Contribution guidance. |
| [`skills/agent-memory-vault/SKILL.md`](skills/agent-memory-vault/SKILL.md) | Main agent behavior contract. |

## Safety Model

Agent Memory Vault follows three core rules:

1. **Memory does not override source truth.** Code, configs, tests, schemas, and official docs win.
2. **Sensitive data is refused.** Secrets, credentials, and sensitive payloads must not be persisted.
3. **Persistence is gated.** Agents save only safe, durable, useful, clear, attributable knowledge; ambiguous or high-impact changes require approval.

Before publishing or sharing a vault, run:

```bash
python3 scripts/validate-vault.py
rg -i "secret|token|password|credential|private key|api_key|akia" .
```

Review matches manually. Documentation may mention prohibited terms as examples; actual secret values are not acceptable.

## Repository Status

This repository is intentionally shipped with no private/company packs. It is a clean starter vault.

Create your own packs under:

```txt
packs/<pack-slug>/
```

Because `packs/*` is ignored by default, personal or company memory is not accidentally committed to the public repository. If you intentionally want to version a pack, adjust `.gitignore` in your own fork or private repository first.

## Contributing

Contributions are welcome.

Good contributions include:

- clearer skill protocols;
- safer templates;
- better validation tooling;
- documentation improvements;
- generic examples that do not include private data;
- compatibility notes for more agent harnesses.

Before opening a PR:

```bash
python3 scripts/validate-vault.py
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/contributing.md`](docs/contributing.md).

## License

MIT. See [`LICENSE`](LICENSE).
