# Safety Rules

Never store:

- secrets;
- tokens;
- passwords;
- private keys;
- credentials;
- full payment card numbers;
- sensitive customer data;
- sensitive real payloads;
- confidential third-party information you are not allowed to store.

Store only safe operational context and pointers to approved secret stores or procedures.

## If sensitive data appears

1. Do not repeat it unnecessarily.
2. Do not write it to memory.
3. Warn the user.
4. Suggest rotation/removal when exposure is possible.
5. Persist only a safe note if it helps future work, without the sensitive value.
