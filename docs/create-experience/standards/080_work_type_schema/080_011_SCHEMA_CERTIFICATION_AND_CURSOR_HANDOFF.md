# 080 — Schema Certification and Cursor Handoff

## Mission

Implement one authoritative Work Type registry and one Section Schema registry so every Full Workshop Map is generated from real, actionable definitions.

## Audit First

Identify:

- every currently supported createable work type;
- every current section list;
- hard-coded workshop maps;
- duplicate labels;
- missing Section IDs;
- display-only sections;
- sections without editors;
- work types with incomplete save behavior;
- completed sections that cannot reopen.

## Implementation Order

1. Create Work Type registry.
2. Create Section Schema registry.
3. Register Event first.
4. Generate Full Workshop Map from schema.
5. connect each section to 077 editor behavior.
6. connect assistance prompts.
7. connect status and persistence.
8. connect Project conversion.
9. add schema versioning.
10. certify Event end to end.
11. migrate additional work types.
12. remove hard-coded maps only after certification.

## Required Browser Certification

For every registered work type:

- Create New produces a Work ID.
- Full Workshop Map loads all expected sections.
- Every section opens.
- Not Started sections can begin.
- Complete sections can edit and reopen.
- Give Me Ideas is section-specific.
- I’m Not Sure is section-specific.
- Save and refresh preserve content.
- status updates on the map.
- Project conversion preserves source linkage.
- older schema versions continue to open.

## Release Gate

A work type is not active until its complete section map passes real-browser certification.
