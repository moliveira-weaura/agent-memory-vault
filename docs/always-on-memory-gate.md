# Always-On Memory Gate

Agent Memory Vault is designed to work without the user saying “save this to memory” every time.

The **Always-On Memory Gate** is a lightweight operating mode for agents: every interaction gets a quick memory relevance check before action and a quick persistence check before the final response.

It does not mean every task reads or writes memory. It means the agent must consciously decide whether memory is relevant.

## Why this matters

Users often provide durable context naturally, for example:

```txt
For repositories in this GitHub organization, always use this GitHub account.
```

```txt
This company maps to this GitHub org.
```

```txt
These AWS profiles are used for production, staging, and tools.
```

```txt
This runbook is the safe way to deploy this service.
```

Those facts are easy for an agent to answer and then forget. Always-On Memory Gate makes the agent check whether they should become durable memory.

## What “always-on” means

For every interaction, the agent performs two internal checks:

```txt
Before acting: Is durable memory relevant to this task?
Before finishing: Did this interaction produce safe durable knowledge?
```

If the answer is no, the agent continues normally.

If the answer is yes, the agent applies the full Memory Gate:

```txt
Retrieval Gate → Work → Persistence Gate
```

## Retrieval behavior

The agent must retrieve memory before acting when the prompt mentions or implies durable context such as:

- user/team preference;
- company, client, or project;
- repository or GitHub organization;
- environment, cluster, cloud account, or local machine setup;
- integration, deploy, incident, troubleshooting, or runbook;
- architecture, product, or technical decision;
- source-of-truth file or possible docs/code divergence.

If no pack exists and the task is likely to produce durable context, the agent should ask briefly whether to create one.

## Persistence behavior

The agent must run a persistence check before finishing every interaction.

Persist automatically when the information is:

- safe and non-sensitive;
- durable;
- operationally useful;
- clear;
- attributable to source truth, trusted source, or explicit user instruction;
- easy to place in an obvious note, runbook, action, observation, or decision.

Ask for short approval when the information is:

- useful but ambiguous;
- missing enough source context;
- conflicting with existing memory;
- changing a major procedure, decision, rule, or runbook;
- unclear in destination.

Never persist secrets or sensitive data.

## Response behavior

Always-On Memory Gate should not make every response noisy.

Use this rule:

| Situation | Response behavior |
|---|---|
| Memory consulted | Briefly mention notes/source-truth files consulted. |
| Memory saved | Briefly mention what was saved and where. |
| Approval needed | Ask the short persistence approval question. |
| No durable memory relevance | Do not mention memory unless the user asked. |
| Sensitive data detected | Warn, avoid repeating it, and do not persist it. |

## Short approval template

```txt
Posso salvar isso no memory?

- <1-3 bullets do que será salvo>
- Destino: <nota/runbook/decisão provável>
```

For runbooks:

```txt
Posso atualizar o runbook?

- <mudança objetiva>
- Destino: <runbook>
```

## Always-on snippet for agent instructions

Paste this into `AGENTS.md`, `CLAUDE.md`, OpenCode rules, or another agent instruction file:

```md
## Agent Memory Vault — Always-On Memory Gate

For every interaction, perform a lightweight Memory Gate check.

Before acting:
- If the task mentions or implies durable user, team, company, client, project, repository, integration, environment, action, decision, runbook, incident, troubleshooting, or shared operational context, read the relevant Agent Memory Vault pack before acting.
- Consult source-of-truth files when code, API behavior, configuration, deployment, runtime facts, or divergence matters.

Before finishing:
- Check whether the interaction produced safe durable knowledge.
- Persist automatically when it is safe, non-sensitive, durable, useful, clear, attributable, and has an obvious destination.
- Ask brief approval when it is ambiguous, high-impact, conflicting, or destination is unclear.
- Never persist secrets, credentials, tokens, private keys, sensitive customer data, or sensitive payloads.

Keep responses quiet when no memory action is needed. Mention memory only when consulted, saved, blocked by safety, or approval is needed.
```

## Minimal prompt for users

If an agent seems to miss memory, users can force the gate with:

```txt
Use Agent Memory Vault Always-On Memory Gate for this task. Consult relevant memory before acting and persist safe durable context at the end.
```

## Safety reminder

Always-On does not reduce the safety bar. It increases the number of checks.

Never store:

- secrets;
- tokens;
- passwords;
- private keys;
- credentials;
- full payment card numbers;
- sensitive customer data;
- sensitive real payloads.
