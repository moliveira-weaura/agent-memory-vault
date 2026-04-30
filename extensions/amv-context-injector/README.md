# AMV Context Injector

Automatic context injection extension for [Agent Memory Vault](../../README.md).

## What it does

Bridges AMV's Markdown-first memory packs with pi's extension API to provide:

| Feature | Hook | Behavior |
|---|---|---|
| **Auto-injection** | `before_agent_start` | Reads active pack → searches for relevant memories → injects prioritized context into system prompt |
| **Semantic search** | `amv_search` tool | Search across pack files via qmd (keyword, semantic, deep) with grep fallback |
| **Session handoff** | `session_before_compact` | Captures recent conversation as an action note in the pack |
| **Pack detection** | `session_start` | Finds vault root and active pack, indexes with qmd if available |

## Context injection priority

When injecting pack context, sections are included in priority order with individual budgets:

| Priority | Section | Budget | Source |
|---|---|---|---|
| 1 (highest) | Pack manifest + indexes | 2,000 chars | `00-system/` |
| 2 | Context packs (source-of-truth) | 3,000 chars | `20-context/` |
| 3 | Search results | 2,500 chars | qmd or grep |
| 4 | Recent actions | 2,000 chars | `40-actions/` |
| 5 | Active decisions | 2,000 chars | `30-decisions/` |
| 6 (lowest) | Runbooks | 2,000 chars | `80-runbooks/` |

Total budget: **16,000 chars**. Lower-priority sections are trimmed first.

## Install

The extension is auto-discovered when agent-memory-vault is installed as a pi package.

### Manual testing

```bash
pi -e ./extensions/amv-context-injector
```

## Search modes

The `amv_search` tool supports three modes:

| Mode | Speed | When to use |
|---|---|---|
| `keyword` (default) | ~30ms | Specific terms, tags, note names |
| `semantic` | ~2s | Related concepts, different wording |
| `deep` | ~10s | When other modes miss results |

If **qmd** is not installed, falls back to grep-based keyword search (no semantic capability).

Install qmd: `brew install tobi/tap/qmd` or see [qmd docs](https://github.com/tobi/qmd).

## Development

```bash
cd extensions/amv-context-injector
npm install
bun test test/
```

## Architecture

```
session_start
  │
  ├─► findVaultRoot() → locate package.json with name "agent-memory-vault"
  ├─► detectActivePack() → find first pack with 00-system/ dir
  ├─► detectQmd() → check if qmd CLI is available
  └─► qmdEmbed() → index pack files (background, fire-and-forget)
      │
      ▼
before_agent_start (every user prompt)
  │
  ├─► qmdSearch(prompt) → semantic search for relevant memories (3 results)
  ├─► buildPackContext(packPath, searchResults) → prioritized sections
  └─► append to systemPrompt
      │
      ▼
session_before_compact (on compaction)
  │
  ├─► extract recent messages from branch
  ├─► buildSessionHandoff() → generate AMV action note
  └─► write to packs/<pack>/40-actions/
```
