# Visual Thinking Presentation Intelligence Standard

**Status:** Binding for Visual Thinking Studio Build 6  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingPresentationIntelligence.ts`  
**Session key:** `companion-visual-thinking-presentation-plan-v1` (session-only)

---

## Mission

Determine how an approved result should initially be shown so the member can understand, edit, and use it easily.

Presentation Intelligence does **not**:

- reinterpret the request or change the goal  
- choose new deliverables  
- perform research or change the Knowledge Package  
- generate new factual content  
- force a visual or written presentation  

It chooses the clearest **eligible** presentation of content that already exists.

---

## Canonical pipeline

```
VisualThinkingRequest
→ VisualThinkingUnderstanding
→ VisualThinkingExperiencePlan
→ VisualThinkingKnowledgePlan
→ VisualThinkingKnowledgePackage
→ VisualThinkingGenerationRun
→ VisualThinkingGeneratedDeliverables
→ VisualThinkingPresentationPlan
→ Presentation Workspace
```

Generated deliverables pass through Presentation Intelligence before the final review workspace.

---

## Presentation Plan model

`VisualThinkingPresentationPlan` includes:

- identity links (`requestId`, `understandingId`, `experiencePlanId`, `knowledgePackageId`, `generationRunId`)  
- `primaryDeliverableId` / `supportingDeliverableIds`  
- `recommendedPresentation` · `availablePresentations` · `excludedPresentations`  
- `activePresentation` · `initialView`  
- `informationDensity` · `progressiveDisclosure` · `navigationMode`  
- `visualRecommendation` (`VisualThinkingVisualRecommendation`) · `writtenRecommendation`  
- `supportingPresentationOrder` · `selectedSupportingDeliverableId`  
- `expandedSectionIds` · `collapsedSectionIds`  
- `splitView` · `splitViewEligible`  
- `userOverrides` · `userAdjusted` · `contentDetailLevel` · `completenessNotice`  

Statuses: `draft` · `ready` · `active` · `user_adjusted` · `archived` · `failed`

---

## Presentation types

Internal IDs (never shown raw to members):

`concise_reading` · `guided_reading` · `detailed_reading` · `step_by_step` · `checklist` · `process_flow` · `relationship_view` · `grouped_ideas` · `mind_map` · `timeline` · `decision_tree` · `comparison_view` · `report` · `sop` · `training_guide` · `action_plan` · `quick_reference` · `glossary` · `faq` · `user_led_canvas` · `split_view`

Use `presentationLabel()` for member-facing names.

---

## Eligibility rules

Pure `evaluatePresentationEligibility` / `listPresentationEligibilities` from structure that **actually exists**:

| View | Requires |
|------|----------|
| Process / step / SOP | Ordered steps or process nodes |
| Checklist | Checklist-compatible / actionable blocks |
| Relationship / mind map / grouped ideas | Entities + semantic relationships |
| Timeline | Chronology evidence (not ordinary numbered steps alone) |
| Decision tree | Decision question / branches |
| Comparison | ≥2 options + criterion |
| Report | Explanatory sections or summary |
| User-led canvas | `let_me_build` / user-led shell |
| Split view | Written + visual-ready structure; not when `declinesMap` |

Do not invent missing structure.

---

## Initial-presentation selection

Normally reflects the approved primary deliverable. Supporting visuals stay secondary — never silently replace a written primary with a map because a shell exists.

---

## Written recommendations

`concise` · `guided` · `detailed` · `instructional` · `procedural` · `explanatory` · `comparative` · `executive` · `reference` · `training`

Changes how content is revealed — not the underlying approved content.

---

## Visual recommendations

`VisualThinkingVisualRecommendation` carries structure metadata for a future canvas:

`structure` · `sourceDeliverableId` · `sourceBlockIds` · `sourceKnowledgeItemIds` · grouping / relationship / hierarchy / sequence intent · density · progressive disclosure · `eligible` · `exclusionReason`

No layout coordinates in this build. Suppressed when no-map.

---

## Information density

`low` · `balanced` · `high` — visibility only. Must not change requested detail, Knowledge Package, generated blocks, warnings, or gaps. Collapsed blocks remain preserved (`preservedBlockIds`).

---

## Progressive disclosure

`start_with_summary` · `start_with_overview` · `start_with_first_step` · `start_with_primary_visual` · `reveal_by_section` · `reveal_by_phase` · `reveal_by_group` · `show_all`

Never hide warnings, research requirements, incompleteness, required questions, conflicts, or important uncertainties.

---

## Primary and supporting behavior

Primary remains dominant. Supporting appear as “Also available” / companion views — not equal cards; not all auto-opened.

---

## Show This Differently

Eligible alternates only, Adaptive-capped. Progressive “Show more ways” when needed.

---

## Switching versus conversion

- **Presentation switching** — same approved content already supports another view (`classifyPresentationRequest` → `presentation_switch`).  
- **Deliverable conversion** — would create a new artifact. Not performed; member may see: *“This would create a new version rather than simply changing the view.”*

---

## Presentation overrides

May change active presentation, density, disclosure, visual-first preference, supporting selection, expanded/collapsed sections, split view.

Must **not** modify Understanding, Experience Plan, Knowledge Package, generated facts, or the approved deliverable set.

---

## Split view

Optional. Wide screens may use side-by-side; under 768px switch between views. Requires `splitViewEligible`.

---

## Incomplete-result behavior

| Run state | Presentation |
|-----------|--------------|
| Awaiting research | Safe outline + verified-info notice |
| Awaiting user input | Structure + one focused question path |
| Partial | Complete vs incomplete labeled honestly |
| Failed supporting | Preserve successful primary |
| Failed primary | Clear recovery — do not imply full success |

---

## Editing separation

Presentation actions update the Presentation Plan. Content actions (`applyBlockEdit`, simplify/deepen) update generated deliverables. Switching views must not regenerate facts.

---

## User-led visual shell

Calm shell: Add Idea · Ask Shari · Reorganize · Fit View · Open Previous Work — not a completed map; no technical map-type menu.

---

## Adaptive Companion

Influences density, disclosure, and visible alternate count. Must not remove approved content, reduce depth, hide gaps/warnings/conflicts, force visual/written, or mark partial work complete.

---

## Accessibility

Semantic headings · keyboard controls · focus-visible · logical tab order · large targets · readable contrast · screen-reader labels · reduced motion · no hover-only essentials · no color-only meaning · responsive narrow screens.

---

## Persistence

Session-only key `companion-visual-thinking-presentation-plan-v1` — presentation state only. Not a competing persistence system.

---

## Architecture boundaries

Pure functions outside React: plan creation · eligibility · recommendations · density · disclosure · overrides · persistence · UI projection.

Same Presentation Plan supports content from deterministic, AI, research-assisted, user-led, imported, or Estate sources.

---

## Future canvas compatibility

Plan visual metadata feeds later Interactive Visual Canvas without changing goals, deliverables, or knowledge assembly.

---

## Exclusions

Full draggable canvas · auto graph layout · live research · citations · new factual generation · complete deliverable conversion · exports · print · cross-Estate writebacks · broad route renaming

---

## Build 7 recommendation

**Interactive Visual Canvas Foundation** — render a calm interactive canvas from `VisualThinkingVisualRecommendation` + Knowledge Package relationships / generated visual shells, without changing goals, deliverables, or knowledge assembly. Research Acquisition remains a parallel knowledge-side build.
