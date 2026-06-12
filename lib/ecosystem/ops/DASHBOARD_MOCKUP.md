# Operational Dashboard — visual mockup (Phase 6)

ASCII layout of the panels rendered by `components/companion/OperationalDashboard.tsx`.
Everything is derived from the event stream → intelligence → board → execution plan.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Founder Board                                                           │
│  Most active advisor: Productivity                                      │
├────────────────────────────────────────────────────────────────────────┤
│  ⚠ NEEDS ATTENTION                                                      │
│  • "Send client deliverable" is past its due date — do the 2-min        │
│    version now, or reschedule it honestly.                              │
│  • No sales activity in the last two weeks — message one warm lead.     │
└────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────┐   ┌───────────────────────────────────┐
│  TOP PRIORITIES BY ADVISOR    │   │  ACTIVE PROJECTS                  │
│                               │   │                                   │
│  PRODUCTIVITY                 │   │  ADHD App                50%      │
│  • Block 60 min for the       │   │  ███████████░░░░░░░░░             │
│    Sales Funnel   [med]       │   │  Next: Draft welcome email        │
│            [Done] [Skip]      │   │                                   │
│                               │   │  Launch Course           33%      │
│  SALES                        │   │  ██████░░░░░░░░░░░░░░             │
│  • Message one warm lead      │   │                                   │
│    today          [low]       │   │  Weekly Newsletter     STALLED    │
│            [Done] [Skip]      │   │  ████████████████████  (red)      │
│                               │   │                                   │
│  WELLNESS                     │   └───────────────────────────────────┘
│  • Make today smaller — one   │
│    focused block  [low]       │   ┌───────────────────────────────────┐
│            [Done] [Skip]      │   │  RISKS (productivity & wellness)  │
└───────────────────────────────┘   │  [high] Overwhelm came up several │
                                     │         times this week           │
┌───────────────────────────────┐   │  [med]  "Weekly Newsletter" has   │
│  OPPORTUNITIES (CEO & mktg)   │   │         gone quiet                │
│  💡 Group coaching cohort     │   │  [med]  6 tasks are still open    │
│     idea            (idea)    │   └───────────────────────────────────┘
│  💡 Partner with a            │
│     productivity newsletter   │
└───────────────────────────────┘
```

## Panels

1. **Alerts strip** — high-severity risks + anything overdue, pulled from the
   intelligence Risk Engine. Red border, always at the top.
2. **Top priorities by advisor** — the execution plan grouped by owning advisor,
   each step showing an effort badge and **Done / Skip** buttons. Status persists
   via `founderActivityTracker` (localStorage), so it survives reloads.
3. **Active projects** — progress bars from the dashboard data layer's
   `progressEstimate`; stalled projects render red with a "Stalled" chip.
4. **Risks** — severity-colored list (productivity/wellness framing).
5. **Opportunities** — CEO/Marketing ideas from the intelligence layer.

## Sync model

`OperationalDashboard` recomputes intelligence → board → execution plan from
events on every change, and reconciles the plan against the tracker
(`syncPlan` keeps prior Done/Skip statuses). Marking an item Done updates the
tracker immediately; feeding the same events into Shari's chat keeps her
conversational guidance aligned with what's on the board.
