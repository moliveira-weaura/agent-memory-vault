# Update Protocol

This protocol is the update side of the Persistence Gate.

## Always-on persistence check

Run a lightweight persistence check before the final response of every interaction.

If no safe durable knowledge was introduced or changed, do nothing and keep the response quiet unless the user asked about memory. If safe durable knowledge appears, apply this update protocol.

## Default autonomy

Default mode: **semi-automatic**.

The agent may persist automatically when the information is safe, non-sensitive, durable, useful, clear, and attributable to a source-of-truth file, trusted source, or explicit user instruction.

Ask for short approval when there is ambiguity, insufficient source, conflict with existing memory, significant impact on a procedure/decision/rule, or uncertainty about the destination.

## When to update

The agent should detect these cases automatically; the user should not need to say “save this to memory.”

Update memory when there is:

- durable user or team preference;
- project/company/domain context;
- environment observation;
- action performed that matters later;
- technical or product decision;
- business rule;
- architecture/deploy/integration change;
- docs-vs-code divergence;
- incident/troubleshooting learning;
- new runbook;
- changed procedure;
- outdated information to mark as `stale` or `deprecated`.

## How to update

1. Identify the right note or create a new one from templates.
2. Cite source truth or record that the source was explicit user instruction.
3. If a procedure changed, update the existing runbook when the destination is clear; otherwise ask for short approval.
4. If old information is no longer valid, mark `freshness: stale`/`deprecated` or record replacement.
5. Apply the graph-aware write standard below.
6. Update `last_reviewed`.
7. Ensure there are no secrets or sensitive data.

## Graph-aware write standard

When creating or updating notes inside `packs/<pack-slug>/`, make the note useful in Obsidian Graph View without depending on local/private packs or Obsidian-only settings.

Infer:

- pack slug from `packs/<pack-slug>/`;
- note type from frontmatter `type` or the containing directory;
- type index from `00-system/indexes/<type>-index.md` when it exists.

For new durable memory notes:

1. ensure `tags` contains `pack/<pack-slug>`;
2. ensure `tags` contains `agent-memory/<type>`;
3. add a durable wikilink to the pack manifest;
4. add a durable wikilink to the relevant type index when one exists;
5. add the new note to the relevant type index using an Obsidian wikilink;
6. keep `related_notes` frontmatter and `## Related` focused on durable relationships;
7. keep all wikilinks vault-relative and omit `.md` extensions.

For updates to existing notes, preserve existing relationships and add missing pack/type tags, manifest links, index links, and index entries when doing so is safe and unambiguous.

## Asking for approval

Use the user's current language when possible and be brief.

```txt
Can I save this to memory?

- <1-3 bullets with what will be saved>
- Destination: <likely note/runbook/decision>
```

For runbooks:

```txt
Can I update the runbook?

- <objective change>
- Destination: <runbook>
```

Do not send long explanations or large diffs just to ask for persistence approval.

## Response noise control

- Mention memory when you saved something, need approval, consulted notes, found stale/divergent memory, or blocked persistence for safety.
- Do not add “no memory updates” to every response by default.
- If the user explicitly asks whether memory was used, explain the decision briefly.
