# Visual Thinking × Projects Intelligence Pilot Integration Standard™ (Build 11)

**Status:** Binding — Projects / Project Homes pilot only  
**Date:** 2026-07-24  
**Runtime:** `lib/projectsIntelligence/`  
**Shared engines:** Recommendation Intelligence · Generate-First · Presentation · Workspace Editing · Visual Thinking Service  
**Related:** [Learning Pilot](./VISUAL_THINKING_LEARNING_PILOT_INTEGRATION_STANDARD.md) · [Recommendation](./VISUAL_THINKING_RECOMMENDATION_INTELLIGENCE_STANDARD.md) · [Workspace Editing](./WORKSPACE_EDITING_AND_CO_CREATION_STANDARD.md) · [Integration](./VISUAL_THINKING_INTEGRATION_STANDARD.md)

---

## Mission

Prove that members can move naturally from Projects execution into Visual Thinking Studio for understanding — then return — without duplicating project information or turning Visual Thinking into a second project manager.

## Core belief

A project is more than a list of tasks. People need to understand the work before they can successfully execute the work. Projects manages the work. Visual Thinking Studio helps people see the work.

## Responsibility separation

| Owner | Owns |
|-------|------|
| **Projects** | Metadata, milestones/phases, tasks, subtasks, dependencies, dates, owners, priorities, status, progress, reminders, schedules |
| **Visual Thinking Studio** | Understanding, organization, visualization, relationship exploration, bottleneck/dependency analysis, alternate representations, workspace editing, annotations, questions, what-if exploration |
| **Recommendation Intelligence** | Usefulness, confidence, timing, suppression, explicit intent |

Visual Thinking Studio **never** becomes another project manager.

## Pilot boundaries

**In:** Projects / Project Homes ↔ Visual Thinking Studio.  
**Out:** Chamber-wide rollout, automatic execution writes, inventing a second task graph, silent dependency changes from visual moves.

## Canonical flow

```
Projects context (stuck / understand / blockers)
→ Shared Recommendation Assessment (optional invitation)
→ ProjectsVisualThinkingIntegrationRequest
→ Seeded Visual Thinking Studio (no “What project?”)
→ Analysis + co-creation on selected project context
→ Pending Changes (approval required)
→ VisualThinkingProjectsReturn → Project Homes resume
```

## Contracts

- `ProjectsSessionSnapshot` — scoped project execution context  
- `buildProjectsRecommendationContext` → shared Recommendation Intelligence  
- `ProjectsVisualThinkingIntegrationRequest` — handoff + seed summary  
- `WorkspaceProjectsContext` — Shari context inside VT  
- `ProjectPendingChange` — suggestions only until approved  
- `VisualThinkingProjectsReturn` — restore project / view / selection / filters / search  

## Supported purposes (internal)

`understand_execution` · `identify_dependencies` · `find_blockers` · `see_project_flow` · `organize_complex_work` · `clarify_phases` · `review_progress` · `identify_missing_work` · `understand_responsibilities` · `plan_next_steps` · `evaluate_risks` · `prepare_for_meeting` · `communicate_plan`

Do not expose technical view names unless helpful.

## Writeback rule (binding)

Visual Thinking never changes task dates, milestones, dependencies, owners, priorities, or project status without explicit approval.

- Visual move ≠ execution change  
- Suggestions become **Pending Changes**  
- User approves each writeback in Projects  
- `approveProjectPendingChange` returns `requiresProjectsApply: true` — this module never mutates the Projects store

## Recommendation behavior

- Value / project context first (except explicit visual intent)  
- Keywords alone never decide  
- Decline suppresses topic/session — not a permanent anti-visual preference  
- Example: “I’m stuck on this project.” → optional “A visual view may help show what is blocking…” with **Show Me Visually** / **Keep Working Here**

## Selected-object actions

Explain · Expand · Find Dependencies · Show Blockers · Research · Ask Board · Generate Alternatives · Simplify · Add Notes · Identify Risks · Find Missing Tasks · Suggest Next Steps · Show Related Work  

Scoped to selection via Workspace Editing.

## Analysis (best-effort)

Critical path approximation · dependency chains · circular dependencies · isolated tasks · large phases · execution risk notes · single points of failure · parallel opportunities  

When Projects does not yet persist first-class dependencies, use optional `dependencySignals` / `blockerSignals` — never invent durable execution data.

## Return

Returning restores project id/name, selected task, current view, scroll, filters, search, conversation id, and resume prompt. Opening Visual Thinking must not complete or reset the project.

## Connected Places

Project Homes Connected Place **Visual Thinking Studio** (`cartography`) is **active** when `onOpenVisualThinking` is wired.

## Failure & recovery

Broken handoff/generation → stay in Projects with a calm message and retry available. Never surface system errors in Estate chat.

## Tests

`lib/projectsIntelligence/projectsVisualThinkingPilot.test.ts` verifies:

- Context transfer · recommendation · explicit intent · analysis  
- Pending approval required · visual moves do not mutate execution  
- Return context preserved · decline suppression · invitation labels  

## Pilot success criteria

Projects remains authoritative for execution. Visual Thinking helps members see that execution. No duplicate projects/tasks. No silent execution changes. Context never lost. Member never rebuilds project information to open a visual.

## Next pilot recommendation

Broader Chamber member integrations only after authenticated browser validation of this Projects pilot.
