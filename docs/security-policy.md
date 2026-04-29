# Security Policy

Agent Memory Vault is designed for safe operational memory, not for secrets.

## Never store

- secrets;
- tokens;
- passwords;
- private keys;
- credentials;
- full payment card numbers;
- sensitive customer data;
- sensitive real payloads;
- confidential third-party information you are not allowed to share.

## Store safe pointers instead

Instead of storing a secret, store a safe pointer:

```md
Credentials live in the approved team password manager under: <safe reference name>.
```

Do not include the credential value.

## Persistence Gate

The skill must refuse to persist sensitive data. If sensitive content appears in a prompt or file, the agent should:

1. avoid repeating it;
2. warn the user;
3. suggest rotation/removal if it was exposed;
4. store only a safe operational note if useful.

## Public repository checklist

Before publishing:

```bash
python3 scripts/validate-vault.py
rg -i "secret|token|password|credential|private key|api_key|akia" .
```

Review matches manually. Some matches in docs are expected because they describe prohibited terms.
