# Source of Truth Rules

Memory helps agents work, but memory is not always the final authority.

## Hierarchy

1. Real code, configuration, deployment manifests, tests, and runtime facts.
2. Formal contracts such as OpenAPI files, schemas, and protocol specs.
3. Official project documentation.
4. Memory pack notes.
5. Session history and chat context.

## Rule

If memory diverges from source truth:

1. report the divergence;
2. follow source truth for the current task;
3. update or propose updating memory.

## Freshness

If a note is not `freshness: current`, warn the user and verify against source truth before relying on it for important decisions.
