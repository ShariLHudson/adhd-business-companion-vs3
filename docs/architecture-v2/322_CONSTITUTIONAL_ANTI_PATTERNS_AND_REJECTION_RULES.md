# 322 — Constitutional Anti-Patterns & Rejection Rules

## Automatic rejection conditions

Reject an implementation that introduces:

- duplicate canonical object identity
- second Work Type registry
- Blueprint-only runtime
- second route owner
- second Project system
- second Task system
- second relationship registry
- second context owner
- second certification authority
- copied Create content in Projects
- repeated known questions
- silent canonical updates
- unregistered outputs
- uncreatable promises
- cross-business leakage
- hard-coded competing catalogs
- authoritative data stored only in chat history
- destructive migration without rollback
- undocumented status variants
- hidden assumptions presented as facts

## Common anti-patterns

### UI-driven architecture

Creating a new data model because a new screen exists.

Correction:

Use a projection of canonical objects.

### Prefix duplication

Creating `BlueprintTask`, `EventTask`, or `ChamberTask`.

Correction:

Use Task plus typed relationships and source metadata.

### JSON graveyard

Saving unstructured JSON as permanent authoritative data.

Correction:

Use canonical fields, extensions, relationships, and explicit snapshots.

### Registry drift

Maintaining different lists in navigation, search, Chamber, and Business Estate.

Correction:

Generate all lists from one registry.

### Context echo

Copying Business Profile data into every Blueprint session.

Correction:

Reference canonical context and store only overrides or historical snapshots.

### Dual-write permanence

Writing to both old and new systems indefinitely.

Correction:

Use temporary migration adapters with exit criteria.

### Prompt-only implementation

Describing a workflow in prompts without runtime support.

Correction:

Map outputs, save destinations, objects, routes, and tests.

### Certification theater

Marking a feature complete because documentation exists.

Correction:

Require runtime evidence and automated tests.

## Rejection output

When rejecting an implementation, report:

- violated article
- affected owner
- duplicate or risk introduced
- correction required
- migration impact
- tests required
