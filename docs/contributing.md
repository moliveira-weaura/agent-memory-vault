# Contributing

See also: [[CONTRIBUTING|CONTRIBUTING]].

## What we welcome

- Improvements to the skill protocol.
- Better templates for memory packs.
- Validation tooling.
- Documentation and examples that do not include private data.
- Compatibility notes for more agent harnesses.

## What we do not accept

- Private company packs.
- Real secrets or credentials.
- Sensitive customer data.
- Raw production payloads.
- Vendor-specific confidential documentation copied into the repo.

## Public decision records

If a change affects public product behavior, agent protocol, documentation architecture, templates, validation, security posture, or contributor expectations, add or update a public decision record under `docs/decisions/`.

This is especially important when the rationale originated in a private/local memory pack: the open-source repository must contain a safe, generic version of the decision so users and contributors can understand it.

Decision records must not include private company/client context, secrets, credentials, sensitive payloads, or private memory pack details.

## Documentation style

- Keep language direct and practical.
- Prefer short examples.
- Use Obsidian wikilinks for vault notes.
- Keep public docs generic.

## Validation

Run:

```bash
python3 scripts/validate-vault.py
```

before opening a PR.
