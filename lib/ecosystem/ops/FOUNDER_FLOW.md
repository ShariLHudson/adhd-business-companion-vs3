# Founder Workflow — conversation ⇄ dashboard (implementation map)

The multi-project flow, and the exact pieces that already power each step.
Conversation and dashboard read the **same** underlying actions, so they stay
in sync.

| Step | Founder prompt | Shari response | Dashboard update | Powered by |
|---|---|---|---|---|
| 1 | "What should I focus on first today?" | Surfaces top 3 advisor-flagged tasks, asks which first | Highlights top 3 with priority markers; all at 0% | `buildExecutionPlan()` → top steps by priority; `stepsByAdvisor()` for the per-advisor grouping; prompt rule "FOUNDER BOARD FLOW" |
| 2 | "Let's start with the email sequence." | Names the project; lists next steps; offers to break it down | Task expands; progress bar **0/3** | `breakdownStep(step)` → tailored micro-steps (email → draft / review / schedule); `planProgress()` |
| 3 | "I drafted the email." | "Step 1 complete. Next: review… 1/3 done." | Progress bar → **33%** | `completeNextStep(plan)` (or `microActionStore.completeNext(id)`); `nextStepLabel()`; `planProgress().fraction` |
| 4 | "Any advice on the subject line?" | Offers 3 options, asks to pick or brainstorm | Sidebar suggestions linked to the task | Ordinary chat — the micro-plan keeps its state; the active plan is `microActionStore.active()` |
| 5 | "I picked option 2 and scheduled." | "Email sequence complete. Next: review pitch deck." | Task complete; bar full; next task highlighted | final `completeNextStep` → `plan.status === "complete"`; next item from `buildExecutionPlan()` order |
| 6 | "What's my overall progress today?" | "1 of 3 high-priority done… you're on track." | Visual summary: completed / in-progress / blocked across projects | `dailySummary(highPrioritySteps, doneStepIds, blockedCount, activePlans)`; `OperationalDashboard` panels |

## Guarantees this flow gives

- **Conversational + actionable** — Shari surfaces priorities, breaks tasks into
  2–4 steps, and narrates N/M progress (the FOUNDER BOARD FLOW prompt rule).
- **Real-time dashboard** — every confirmation updates the persistent
  `MicroActionStore` / `FounderActivityTracker` (localStorage), and the dashboard
  recomputes from the same data.
- **Advisor recommendations always visible & trackable** — `buildExecutionPlan`
  + `stepsByAdvisor` keep them on screen with Done/Skip.
- **Step-by-step micro-actions** — `breakdownStep` + `completeNextStep` track
  progress visually (0/3 → 33% → complete).

## To make it *live* in the app (small wiring, currently co-edited area)

1. Emit events from existing actions: `eventStore.emit(ev.taskCompleted(...))`, etc.
2. On a focus/board view, render `<OperationalDashboard founderId={...} />`.
3. In the chat handler, when Shari recognizes a step confirmation, call
   `microActionStore.completeNext(activePlanId)` and surface
   `planProgress()` in her reply — that's the conversation⇄dashboard sync point.
