# Plan My Day Companion Experience Refinement

**Status:** Preview — do not deploy to production until authenticated review  
**Constraint:** Extends the existing complete workflow. Does **not** replace the planning engine.

## Open path (fixed)

Welcome Card / daily opening / generic Plan My Day opens use the **same** destination as Welcome Home → My Day → Plan My Day:

`openPlanAdaptSharedCore("plan")` → `PlanAdaptSharedWindow` → `PlanMyDayCompleteWorkflow`

Generic `openPlanMyDayCore()` (no item/area/rhythms deep link) now delegates to that shared path. Calendar/item deep links still open the Morning Room panel.

## Flow preserved

Today's List → Time / Energy / Motivation → Planning Style → Create Today's Plan → Today's Plan → Adapt My Day

## Owners

| Concern | Owner |
|--------|--------|
| Style recommendation (Gentle / Balanced / Focused) | `lib/planMyDay/companionPlanRefinement.ts` → `recommendPlanningStyle` |
| Most Important Task + why | `buildCompleteDayPlan` + `mitReason` |
| Priority bands | `priorityBandForTask` / `priorityBandLabel` |
| Dependencies | `detectDependencyHint` |
| Repeated avoidance | `buildAvoidanceOffer` (+ `planBehaviorLearning`) |
| Companion awareness | `companionAwarenessLines` |
| Effort bands | `effortBandFromMinutes` |
| Energy fit grouping | `taskEnergyFit` + UI in `PlanMyDayCompleteWorkflow` |
| Universal view architecture | `lib/presentation/universalViewArchitecture.ts` |
| View recommendation | `recommendPlanView` / `recommendUniversalView` |
| Gentle completion | `gentleCompletionAcknowledgement` via `planTaskCompletion.ts` |

## Spec 136

No named-expert attribution in member-facing Plan My Day copy.
