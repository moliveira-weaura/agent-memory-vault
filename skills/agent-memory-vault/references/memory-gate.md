# Memory Gate

The Memory Gate is required for tasks involving durable user, project, company, repository, integration, environment, action, runbook, decision, incident, troubleshooting, or shared operational context.

## 1. Retrieval Gate — before responding or acting

Before responding, editing code, creating documentation, running impactful commands, or guiding a decision, the agent must check whether durable memory is relevant.

If relevant, the agent should:

1. identify mentioned or implied entities:
   - user/team preference;
   - project/company/client;
   - repository;
   - environment;
   - integration;
   - action;
   - decision;
   - runbook;
   - incident/troubleshooting;
2. choose the corresponding pack under `packs/`;
3. read the manifest, indexes, context packs, and related runbooks;
4. follow relevant wikilinks in indexes, `## Related`, and frontmatter;
5. consult source-of-truth files when code, API behavior, configuration, deployment, divergence, or possibly stale memory is involved;
6. answer while briefly citing consulted notes and source-of-truth files.

If no pack exists and durable context is likely, ask briefly whether to create a pack.

## 2. Persistence Gate — after relevant work

At the end of a relevant interaction, evaluate whether new or changed knowledge should be saved.

Default mode: **semi-automatic**.

The agent may persist automatically when the information is:

- safe and non-sensitive;
- durable and useful;
- operationally clear;
- attributable to a source-of-truth file, trusted source, or explicit user instruction;
- simple to record without ambiguity.

The agent must ask for short approval when:

- the information is useful but incomplete or ambiguous;
- the source is unclear;
- there is conflict with existing memory;
- the update changes an important procedure, decision, rule, or operational understanding;
- the best destination is unclear.

## 3. Gate decision table

| Situation | Action |
|---|---|
| Temporary, speculative, or low-value information | Do not persist |
| Safe, durable, clear information | Persist automatically |
| Useful but ambiguous/incomplete information | Ask for short approval |
| Procedure changed | Update or propose updating a runbook |
| Previous information is no longer valid | Mark `stale`/`deprecated` or record replacement |
| New technical/product decision | Create or propose a decision note |
| Useful troubleshooting learning | Update or create a runbook |
| Possible secret or sensitive data | Never persist |

## 4. Asking for approval

When asking whether to persist, use the user's current language when possible. Keep it short.

### English

```txt
Can I save this to memory?

- <1-3 bullets with what will be saved>
- Destination: <likely note/runbook/decision>
```

```txt
Can I update the runbook?

- <objective change>
- Destination: <runbook>
```

### Portuguese example

```txt
Posso salvar isso no memory?

- <1-3 bullets do que será salvo>
- Destino: <nota/runbook/decisão provável>
```

## 5. Avoid when asking for approval

Do not send:

- long explanations;
- large diffs;
- repeated context;
- long justification lists.

Send only:

1. what will be saved;
2. where it will be saved;
3. why it is useful, if it fits in one short sentence;
4. the approval question.

## 6. Safety

Never persist secrets, tokens, passwords, private keys, credentials, full payment card numbers, sensitive customer data, or sensitive real payloads.

Persist only safe operational context and pointers to approved secret stores or procedures.

## 7. Traceability

Every persistence action should record enough source context, such as:

- source-of-truth file consulted;
- explicit user instruction with date;
- official documentation;
- repository/file where the fact was verified.

If memory diverges from source truth, report the divergence and update or propose updating the memory.
