# 077 — Data Model and Runtime Contracts

## Work Section

```ts
type WorkSection = {
  sectionId: string;
  workId: string;
  type: string;
  title: string;
  description?: string;
  order: number;
  status:
    | "not_started"
    | "in_progress"
    | "needs_review"
    | "complete_for_now"
    | "skipped_for_now"
    | "blocked"
    | "archived";
  content: unknown;
  version: number;
  completedAt?: string;
  reopenedAt?: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
  required: boolean;
  dependencies?: string[];
};
```

## Open Section Command

```ts
type OpenSectionCommand = {
  workId: string;
  sectionId: string;
  source: "workshop_map" | "previous_next" | "project" | "search" | "resume";
};
```

## Save Section Command

```ts
type SaveSectionCommand = {
  workId: string;
  sectionId: string;
  expectedVersion: number;
  content: unknown;
  requestedStatus?: WorkSection["status"];
};
```

## Required Events

- `work.section.opened`
- `work.section.edit.started`
- `work.section.save.requested`
- `work.section.saved`
- `work.section.save_failed`
- `work.section.completed`
- `work.section.reopened`
- `work.section.skipped`
- `work.section.status_changed`
- `work.map.opened`

## Runtime Rule

The map and editor must read from the same authoritative section record.

No local display-only status model may exist.
