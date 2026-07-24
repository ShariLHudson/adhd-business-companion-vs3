# Visual Thinking Experience Orchestrator Standard

**Status:** Binding for Visual Thinking Studio Build 3  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingExperienceOrchestrator.ts`  
**Canonical input:** `VisualThinkingUnderstanding` (Build 2)  
**UI projection:** `VisualThinkingRequestPanel` via `projectExperiencePlanPreview`

---

## Mission

Transform a confirmed understanding of the member’s goal into the **best experience plan** — not the final artifact.

The Orchestrator answers:

1. What experience would help most?
2. What primary deliverable fits that experience?
3. Which supporting pieces meaningfully improve success?
4. In what order should work happen?
5. Where does research sit (if anywhere)?
6. How should Spark interact (build / guide / collaborate / let them build)?

**Understand first → experience → deliverables → order → only then generate.**

---

## Dependency requirement

`VisualThinkingUnderstanding` is the canonical input contract.

The Orchestrator consumes:

- `primaryGoal` · `secondaryGoals`
- `intendedOutcome` · `successDefinition`
- `cognitiveTasks`
- `userKnowledgeLevel`
- `requestedDepth` · `effectiveDepth`
- `creationMode`
- `researchNeed`
- `recommendedPrimaryOutput` · `recommendedSupportingOutputs`
- explicit exclusions (`declinesMap`, build-myself)
- Adaptive Companion presentation preferences

It must **not** re-interpret the raw request for goals, cognitive tasks, research need, or knowledge level.  
Re-interpretation happens only when the member corrects understanding (Understanding Engine), after which the Orchestrator builds a **new plan** from the updated understanding.

---

## Experience model

`VisualThinkingExperiencePlan` includes:

`id` · `understandingId` · `primaryExperience` · `primaryDeliverable` · `supportingDeliverables` · `experienceOrder` · `generationStages` · `researchStage` · `interactionStyle` · `editingMode` · `reviewPoints` · `handoffTargets` · `estimatedComplexity` · `estimatedTime` · `userOverrides` · `convertibleTo` · `status`

---

## Primary experiences

Recommend **one**:

Learning · Research · Understanding · Organization · Comparison · Decision Support · Planning · Creation · Teaching · Troubleshooting · Documentation · Exploration · Visual Thinking

Mapped from Understanding goals / experience fields — never from a member-facing “pick a map type” menu.

---

## Deliverable selection

**One** primary deliverable from Understanding’s recommended primary output (mapped into Orchestrator vocabulary).

Supporting deliverables only when Understanding already recommended them (or the member adds them via override).  
Do not invent extras because they exist in the catalog.

Explicit exclusions win:

- No map → strip visual/map deliverables  
- Build myself → blank editable space only; no finished supporting set  

---

## Research position

| Understanding `researchNeed` | Plan `researchStage` |
|------------------------------|----------------------|
| `required` | `before_generation` |
| `optional` | `during_generation` |
| `not_needed` / `unclear` | `not_at_all` |
| any + `let_me_build` | `not_at_all` |

No live research in this build.

---

## Interaction styles

| Creation mode | Interaction style |
|---------------|-------------------|
| `build_for_me` | `build_for_me` |
| `guide_me` | `guide_me` |
| `build_myself` | `let_me_build` |
| `unspecified` | `collaborate` |

---

## Generation stages

Ordered plan only (no execution yet), for example:

`research` → `organize` → `create_primary` → `create_supporting` → `review` → `return_to_user`

User-led path:

`prepare_user_led_canvas` → `review` → `return_to_user`

---

## Editing mode & output switching

Every plan anticipates future artifact ops:

editing · expansion · simplification · replacement · reordering · conversion

`convertibleTo` lists future switch targets (architecture only — no conversion engine yet).

---

## User overrides

Plan-level overrides update the plan **without** rebuilding Understanding:

- primary experience / deliverable  
- supporting set  
- detail  
- interaction style  
- research position  

Natural-language goal corrections still go through the Understanding Engine, then re-orchestration.

---

## Handoffs

Future targets (not implemented): Projects · Create · Board · Chamber Members · Business Estate · Knowledge Library · Journal.

Plans may list suggested targets; nothing is handed off in this build.

---

## Architecture boundaries

| Layer | Owns |
|-------|------|
| Understanding Engine | Goal, success, tasks, research need, knowledge, output recommendations |
| **Experience Orchestrator** | Experience plan, stages, interaction, switching contract |
| Generation Engine | Creating artifacts from a confirmed plan — see [VISUAL_THINKING_GENERATION_ENGINE_STANDARD.md](./VISUAL_THINKING_GENERATION_ENGINE_STANDARD.md) |
| Research Engine (later) | Live research |
| Canvas Engine (later) | Map / visual editing |

Keep orchestration independent from generation, research, and canvas.

---

## Adaptive Companion

May reduce how many supporting deliverables are visible.  
Must not reduce requested depth, change the goal, or force a format.

---

## Limitations

- No generation, research, canvas, or report rendering  
- Deterministic mapping from Understanding fields  
- Handoffs and conversion are contracts only  

---

## Next build

Build 4 (Generation Engine) is documented separately.  
Build 5 should resolve research-blocked runs and deepen generation quality without changing plan ownership.
