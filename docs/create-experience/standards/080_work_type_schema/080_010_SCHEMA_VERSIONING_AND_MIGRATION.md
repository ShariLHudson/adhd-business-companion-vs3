# 080 — Schema Versioning and Migration

## Purpose

Protect existing member work when a Work Type schema evolves.

## Rules

- Existing Work IDs retain their content.
- New schema versions must not reset section statuses.
- New optional sections may be added without blocking completion.
- New required sections require an explicit migration message.
- Removed sections must be archived, not destroyed.
- Renamed sections retain Section IDs where meaning remains the same.
- Split or merged sections require lineage mapping.

## Migration Record

Each migration must include:

- source schema version;
- target schema version;
- added sections;
- removed sections;
- renamed sections;
- content transformations;
- member decisions required;
- rollback plan;
- certification.

## Opening Older Work

The platform must open older work safely, explain meaningful schema changes, and allow the member to continue without rebuilding prior content.
