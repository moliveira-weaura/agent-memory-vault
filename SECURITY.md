# Security Policy

## Supported versions

The `main` branch is the active development line until the project publishes versioned releases.

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities or accidental sensitive data exposure.

Use GitHub private vulnerability reporting if enabled, or contact the maintainers through the repository's security contact once published.

## Sensitive data policy

Agent Memory Vault must never store:

- secrets;
- tokens;
- passwords;
- private keys;
- credentials;
- full payment card numbers;
- sensitive customer data;
- sensitive real payloads.

If sensitive data is accidentally committed:

1. Stop using the exposed secret immediately.
2. Rotate/revoke it at the source.
3. Remove it from the repository and history before publishing or distributing.
4. Document only safe pointers to approved secret stores or procedures.

## Maintainer guidance

Before making this repository public, run:

```bash
python3 scripts/validate-vault.py
rg -i "secret|token|password|credential|private key|api_key|akia|<old-private-term>" .
```

Review any matches manually.
