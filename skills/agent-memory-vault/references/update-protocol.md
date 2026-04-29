# Update Protocol

This protocol is the update side of the Persistence Gate.

## Default autonomy

Default mode: **semi-automatic**.

The agent may persist automatically when the information is safe, non-sensitive, durable, useful, clear, and attributable to a source-of-truth file, trusted source, or explicit user instruction.

Ask for short approval when there is ambiguity, insufficient source, conflict with existing memory, significant impact on a procedure/decision/rule, or uncertainty about the destination.

## When to update

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
5. Update indexes when needed, using Obsidian wikilinks.
6. Add/update `## Related` with wikilinks when useful.
7. Update `last_reviewed`.
8. Ensure there are no secrets or sensitive data.

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
