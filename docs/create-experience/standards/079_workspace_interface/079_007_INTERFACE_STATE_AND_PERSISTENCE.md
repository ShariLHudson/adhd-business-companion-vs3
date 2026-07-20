# 079 — Interface State and Persistence

## Purpose

Define which interface states may persist and which must be recomputed.

## Persistable Preferences

May include:

- preferred map view;
- collapsed groups;
- last open panel;
- editor mode;
- zoom level;
- low-energy mode;
- accessibility preferences.

## Work-Specific State

May include:

- last open Section ID;
- scroll position;
- cursor position;
- open panel;
- map filter;
- draft recovery state.

## Authoritative State

The following must come from the durable work record:

- Work ID;
- Section ID;
- section content;
- status;
- version;
- completion state;
- permissions;
- linked Projects;
- save result.

Local UI state may never override authoritative work state.

## Stale State

On return:

1. load authoritative work;
2. compare recovery state;
3. resolve conflicts;
4. restore safe interface state;
5. announce any discrepancy.

## Cross-Device Return

A member opening the same work on another device should receive:

- latest durable content;
- current status;
- current version;
- last meaningful stopping note when available.

Device-specific cursor and panel state may remain local.
