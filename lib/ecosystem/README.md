# Founder Ecosystem — Phase 1: Event Tracking Engine

An append-only, event-sourced backend for founder intelligence. **Every founder
action is captured as an event.** Records (Project, Task, Document, …) are the
materialized state those events mutate; dashboards, reports, and Phase 2+
intelligence are **derived from the event stream, never from manual input.**

```
Founder action ──▶ event appended ──▶ (state updated) ──▶ metrics/dashboards derived
                         │
                         └──▶ subscribe() ──▶ Phase 2: Shari suggestions, live UI
```

## Files

| File                 | Responsibility |
|----------------------|----------------|
| `models.ts`          | Object definitions: Founder, Project, Task, Document, Decision, Opportunity, PainPoint |
| `events.ts`          | `EventType` union, `FounderEvent` shape, typed `ev.*` builders |
| `eventStore.ts`      | Append-only store + pluggable `EventSink` (memory / localStorage / future DB) + query + `subscribe()` |
| `metrics.ts`         | `computeDashboard(events)` — all metrics derived from the stream |
| `index.ts`           | Barrel export |
| `example-session.json` | One founder session (placeholder data) |

## What gets captured (event types)

Projects (`project.created|updated|stage_changed|completed`), Tasks
(`task.created|updated|completed`), Documents (`document.created|exported`),
Focus (`focus.started|completed`), Time Blocks (`timeblock.created|completed`),
Workspaces (`workspace.opened|closed` — supports multiple simultaneous
workspaces via `refs.workspace` + `workspaceContext`), Coaching
(`chat.coaching`), and the intelligence nouns surfaced in-session
(`decision.created`, `opportunity.created`, `painpoint.observed`). Assisted
actions are first-class (`assisted_action.offered|accepted`).

Every event logs: **timestamp** (`ts`), **event type** (`type`), **associated
objects** (`refs`), **optional user message** (`userMessage`, chat context), and
**workspace context** (`workspaceContext`) when applicable, plus an open
`data` payload for type-specific fields (durations, export provider, etc.).

## Usage

```ts
import { eventStore, ev, computeDashboard } from "@/lib/ecosystem";

// Capture (call these from the app's existing actions — non-invasive):
eventStore.emit(ev.projectCreated("founder-001", "proj-100", "ADHD Sales Funnel"));
eventStore.emit(ev.taskCompleted("founder-001", "task-200", "proj-100"));
eventStore.emit(ev.focusCompleted("founder-001", 25, "proj-100"));
eventStore.emit(ev.documentExported("founder-001", "doc-500", "google-doc", url));

// Derive a dashboard purely from events:
const snapshot = computeDashboard(eventStore.query({ founderId: "founder-001" }));

// Phase 2 hook — react to new events without polling:
const stop = eventStore.subscribe((e) => {
  if (e.type === "painpoint.observed") {/* Shari may surface a suggestion */}
});
```

### Swapping persistence (no shape changes)

```ts
import { EventStore } from "@/lib/ecosystem";
class RestEventSink implements EventSink {
  append(e) { void fetch("/api/events", { method: "POST", body: JSON.stringify(e) }); }
  all() { /* hydrate from server */ return []; }
}
export const eventStore = new EventStore(new RestEventSink());
```

## Initial dashboard metrics (all computed from events)

`computeDashboard()` returns these today:

- **Active Projects** — `project.created` − `project.completed`
- **Tasks completed** — today / this week (`task.completed`)
- **Focus minutes this week** — sum of `focus.completed.actualMinutes`
- **Documents created** + **Exports by provider** (Google Doc/Sheet/Form, PDF, print, copy)
- **Open Decisions** — `decision.created` − decisions marked "made"
- **Opportunities** — count of `opportunity.created`
- **Top Pain Points** — `painpoint.observed` aggregated by text, ranked by occurrences
- **Active days this week** + **Workspace usage** breakdown (which workspaces get opened)
- **Coaching interactions** — count of `chat.coaching`

Natural next metrics (still pure derivations): momentum streak, completion rate,
time-to-first-action per session, project velocity (tasks completed / week),
decision dwell time (created → made), and pain-point trendlines.

## Founder intelligence views these feed (Phase 2)

Founder Dashboard · Top Challenges / Pain Points · Active Projects · Open
Decisions · Opportunities — each is a query + reduction over the same stream.

## Future-integration hooks (already in the model)

- **Google Docs / Sheets / Forms sync** — `document.source` + `document.exported`
  events carry the provider and `location` (the Google file URL); a sync worker
  can subscribe and reconcile.
- **Assisted actions** ("Help me draft this") — `assisted_action.offered/accepted`
  events, ready to power success-rate analytics.
- **Event-driven suggestions from Shari** — `subscribe()` lets a Phase 2 engine
  watch the stream (e.g. repeated `painpoint.observed` → suggest a strategy or a
  saved "reset sequence").

## Design constraints honored

- **No UI** — pure backend/event model.
- **Placeholder data only** in the example (`Robin Maple` / `Maple Studio`).
- **Modular** — adapters, builders, and metrics are independent; Phase 2
  intelligence layers add files without changing the event shape.
