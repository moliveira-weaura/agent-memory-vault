# Contributing to Agent Memory Vault

Thanks for considering a contribution.

## Ground rules

- Keep the project generic and reusable.
- Do not add private company, client, customer, or personal sensitive context.
- Do not add secrets, tokens, passwords, private keys, credentials, full payment card numbers, or sensitive payloads.
- Prefer small, focused pull requests.
- Use clear Markdown and Obsidian wikilinks when linking vault notes.

## Development setup

```bash
git clone https://github.com/weauratech/agent-memory-vault.git
cd agent-memory-vault
python3 scripts/validate-vault.py
```

## Pull request checklist

- [ ] The change is generic and safe for a public repository.
- [ ] No secrets or sensitive data were added.
- [ ] Obsidian wikilinks omit `.md` extensions.
- [ ] New docs are linked from `DASHBOARD.md` or relevant indexes.
- [ ] `python3 scripts/validate-vault.py` passes.
- [ ] The README or docs were updated if behavior changed.

## Commit style

Use concise conventional-style commits when practical:

```txt
feat: add pack creation script
fix: correct safety wording
docs: improve getting started guide
```

## Reporting security issues

Please do not open public issues for security vulnerabilities or accidental sensitive data exposure. See `SECURITY.md`.
