<!--
Thanks for contributing to Agent Memory Vault.

Before submitting, please read:
- CONTRIBUTING.md
- SECURITY.md

Keep pull requests focused, public-safe, and easy to review.
-->

## Summary

<!-- What changed? Keep this concise. -->

## Motivation

<!-- Why is this change needed? What problem does it solve? -->

## Related issues or discussions

<!--
Use "Fixes #123" when this PR should close an issue.
Use "Relates to #123" when it is connected but should not close it.
Write "N/A" if there is no related issue or discussion.
-->

## Type of change

<!-- Check all that apply. -->

- [ ] Documentation
- [ ] Skill or agent protocol
- [ ] Memory pack template
- [ ] Validation or tooling
- [ ] Security, privacy, or safety improvement
- [ ] Bug fix
- [ ] Feature
- [ ] Maintenance or cleanup
- [ ] Breaking change

## What changed

<!--
Describe the implementation at a reviewer-friendly level.
For documentation changes, mention the pages or sections updated.
For behavior changes, mention the affected workflow.
-->

## How to test or review

<!--
List exact commands, manual steps, or docs pages reviewed.
If this is documentation-only, say how you checked links, examples, or wording.
-->

```bash
python3 scripts/validate-vault.py
```

## Security and privacy checklist

- [ ] This change is generic and safe for a public repository.
- [ ] No secrets, credentials, private keys, tokens, passwords, or sensitive payloads were added.
- [ ] No private company, client, customer, or personal sensitive context was added.
- [ ] Local/private memory packs remain excluded unless this PR intentionally adds a safe example pack.
- [ ] Any security-sensitive concern is documented without exposing exploit details or sensitive data.

## Vault and documentation checklist

- [ ] Obsidian wikilinks omit `.md` extensions.
- [ ] New or changed docs are linked from `README.md`, `DASHBOARD.md`, or another relevant index when useful.
- [ ] Templates, references, and examples remain generic and reusable.
- [ ] README, docs, or references were updated if behavior changed.
- [ ] `python3 scripts/validate-vault.py` passes.

## User impact

<!--
Does this change affect installation, pack structure, skill behavior, validation output, or documented workflows?
Write "None" if there is no user-facing impact.
-->

## Breaking changes or migration notes

<!--
Write "None" if not applicable.
If this is a breaking change, explain the required user action.
-->

## Screenshots, examples, or logs

<!-- Optional. Include only public-safe examples. -->

## Reviewer notes

<!--
Call out risks, trade-offs, follow-up work, or specific areas where reviewer feedback is requested.
-->
