# Visual Thinking Presentation Intelligence Standard

**Status:** Binding for Visual Thinking Studio Build 6  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingPresentationIntelligence.ts`  
**Session key:** `companion-visual-thinking-presentation-plan-v1`

---

## Mission

Determine how an approved result should be presented so the member can understand, edit, and use it easily.

This layer does **not** re-interpret goals, choose deliverables, perform research, recreate the Knowledge Package, or generate factual content.

---

## Canonical pipeline

```
VisualThinkingRequest
→ VisualThinkingUnderstanding
→ VisualThinkingExperiencePlan
→ VisualThinkingKnowledgePackage
→ VisualThinkingGenerationRun
→ VisualThinkingGeneratedDeliverables
→ VisualThinkingPresentationPlan
→ Presentation Workspace
```

Generated deliverables pass through Presentation Intelligence before the final review workspace.

---

## Presentation Plan model

`VisualThinkingPresentationPlan` — recommended and available presentations, exclusions with user-facing reasons, initial view, information density, progressive disclosure, navigation mode, visual/written recommendations, supporting order, overrides, content detail snapshot, completeness notice.

Statuses: `draft` · `ready` · `active` · `user_adjusted` · `archived` · `failed`

---

## Presentation types

`concise_reading` · `guided_reading` · `detailed_reading` · `step_by_step` · `checklist` · `process_flow` · `relationship_view` · `mind_map` · `timeline` · `decision_tree` · `comparison_view` · `report` · `sop` · `training_guide` · `action_plan` · `quick_reference` · `glossary` · `faq` · `user_led_canvas` · `split_view`

Technical IDs are never shown to members — use `presentationLabel()`.

---

## Eligibility

Pure `evaluatePresentationEligibility` / `listPresentationEligibilities` from structure signals (ordered steps, relationships, chronology, options/criteria, decision structure, glossary/FAQ, declinesMap).

Do not offer a presentation merely because its name exists in a menu. Do not invent missing structure.

---

## Initial selection

Normally aligns with the approved primary deliverable (e.g. step-by-step guide → step-by-step reading). Optional visual alternate stays secondary unless the plan or preference supports it.

---

## Visual recommendation

Metadata for future canvas: process · relationship · hierarchy · sequence · chronology · branching · comparison · cause_and_effect · journey · grouped_ideas · user_led.

No draggable canvas in this build. No map-type chooser.

---

## Written recommendation

concise · guided · detailed · reference · procedural · explanatory · instructional · comparative · executive · training — preserves approved depth.

---

## Information density

`low` · `balanced` · `high` — controls visibility only. Must not change underlying content depth (`contentDetailLevel`).

---

## Progressive disclosure

`start_with_summary` · `start_with_first_step` · `start_with_overview` · `start_with_primary_visual` · `reveal_by_section` · `reveal_by_phase` · `show_all`

Never hide warnings, placeholders, research gaps, or incompleteness notices.

---

## Primary and supporting

Primary remains dominant. Supporting appear as “Also available” / companion views — not equal competing cards. Do not auto-open every supporting deliverable.

---

## Show This Differently

Reveals only eligible alternate presentations, capped by Adaptive Companion (`limitVisibleChoices`). Progressive “Show more ways” when needed.

---

## Overrides

May change active presentation, density, disclosure, visual-first preference, supporting visibility, split view, expanded sections, selected supporting.

Must **not** modify Understanding, Experience Plan, Knowledge Package, or regenerate facts. Unsupported requests explain what is missing.

---

## Split view

Contract: side-by-side when wide; stacked switch under 768px; unavailable when structure cannot support it.

---

## Incomplete content

`awaiting_research` / `awaiting_user_input` / `partial` / `failed` → completeness notice; never styled as complete.

---

## User-led visual

Opens calm workspace shell (Add Idea · Ask Shari · Reorganize · Fit View · Open Previous Work) — not a completed map.

---

## Adaptive Companion

Influences density, disclosure, and how many alternates show. Must not remove approved content, reduce requested detail, hide gaps/warnings, or force visual/written presentation.

---

## Accessibility

Keyboard-accessible controls, focus-visible styles, semantic headings, readable contrast, large targets, screen-reader labels, reduced-motion support, no hover-only essentials.

---

## Persistence

Session-only: `companion-visual-thinking-presentation-plan-v1` — presentation state only.

---

## Future canvas compatibility

Plan carries visual structure, eligible modes, density, disclosure, grouping/sequence intent, and overrides for later layout — without node positioning in this build.

---

## Switching versus conversion

1. **Presentation switching** — same approved content already structured for another view.  
2. **Deliverable conversion** — new deliverable required (later).

This build supports switching only where eligible.

---

## Exclusions

Full draggable canvas · auto node positioning · live research · new factual content · full deliverable conversion · exports · print · cross-Estate handoffs · broad visual redesign outside the result workspace

---

## Build 7 recommendation

**Visual Canvas Foundation** — render an interactive (but calm) canvas from Presentation Plan visual metadata and Knowledge Package relationships, without changing goals, deliverables, or knowledge assembly.
