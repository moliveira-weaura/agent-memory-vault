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
