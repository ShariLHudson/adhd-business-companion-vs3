# 076 — Persistence Standard

## 1. Purpose
Guarantee durable, truthful, recoverable storage for every Universal Creation work item.

## 2. Source of Truth
The authoritative database is the source of truth.

LocalStorage, browser memory, React state, and cached records are support layers only.

## 3. Persistence Contract

```text
validate
→ authorize
→ write
→ verify
→ version
→ acknowledge
```

## 4. Required Persisted Entities

- Work identity
- workspace metadata
- sections
- section order
- content
- lifecycle
- status
- versions
- research accepted into work
- comments
- review states
- relationships
- Project links
- publication links
- archive/delete state

## 5. Save States

```ts
type SaveState =
  | "clean"
  | "dirty"
  | "saving"
  | "saved"
  | "retrying"
  | "failed"
  | "conflict";
```

## 6. Autosave
Autosave must:

- debounce
- preserve user typing
- batch safely
- write to authoritative storage
- verify completion
- avoid duplicate records
- update save state truthfully
- retain unsaved buffer during failure

## 7. Manual Save
Manual Save uses the same mutation service as autosave.

It may create a named checkpoint when requested.

## 8. Read-Back Verification
Critical writes should verify:

- Work ID
- persistence version
- updated timestamp
- expected mutation

A client-side optimistic update alone is insufficient for final “Saved.”

## 9. Local Recovery Buffer
A local buffer may preserve unsaved work during:

- network loss
- tab crash
- transient API failure

The member must be told when content is not yet durable.

## 10. Offline Behavior
When offline:

- allow safe local editing when supported
- label state clearly
- queue mutations
- reconcile on reconnect
- prevent false saved state
- detect conflicts

## 11. Versioning
Material changes create version history according to the Versioning Standard.

At minimum:

- approval
- whole-work rewrite
- import
- conversion
- research insertion
- manual checkpoint
- restore

## 12. Delete
Deletion is soft by default.

Permanent deletion requires:

- explicit action
- confirmation
- authorization
- related-record handling
- audit event

## 13. Archive
Archive preserves all content and lineage.

## 14. Relationship Persistence
Linked derivatives must store relationship type and source Work ID.

## 15. Migration
Schema changes must preserve:

- old work readability
- Work IDs
- lineage
- versions
- resume
- title
- classification

## 16. Failure Messages
Good:

> “That didn’t save successfully. Your latest text is still here, but it has not reached durable storage yet.”

Bad:

> “Saved” after local cache only.

## 17. Certification
Prove:

- initial creation persists
- edits persist
- refresh restores
- resume restores
- offline state is truthful
- conflict is detected
- archive/restore works
- delete/restore works
- no duplicate records
- localStorage warning is hidden when authoritative save succeeds
