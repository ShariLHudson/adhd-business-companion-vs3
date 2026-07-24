# Visual Thinking Knowledge Intelligence Standard

**Status:** Binding for Visual Thinking Studio Build 5  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingKnowledgeIntelligence.ts`  
**Session key:** `companion-visual-thinking-knowledge-package-v1`

---

## Mission

Determine what knowledge is available, what is missing, how it should be organized, and what structured **Knowledge Package** the Generation Engine may safely use.

Research is one way to acquire missing knowledge — not the whole architecture.

---

## Canonical pipeline

```
VisualThinkingRequest
→ VisualThinkingUnderstanding
→ VisualThinkingExperiencePlan
→ VisualThinkingKnowledgePlan
→ VisualThinkingKnowledgePackage
→ VisualThinkingGenerationRun
→ Generated Deliverables
→ VisualThinkingPresentationPlan
→ Presentation Workspace
```

The Knowledge Intelligence Engine must **not** re-interpret goals, choose new deliverables, change the experience plan, or regenerate content.

---

## Knowledge Plan model

`VisualThinkingKnowledgePlan` — purpose, required/optional areas, approved/excluded source kinds, research priority, freshness/evidence requirements, organization strategy, gaps, status, provenance.

Statuses: `draft` · `ready` · `awaiting_sources` · `awaiting_research` · `assembling` · `package_ready` · `blocked` · `failed`

---

## Knowledge Package model

`VisualThinkingKnowledgePackage` — items, groups, relationships, source references, gaps, conflicts, uncertainties, assumptions, coverage, readiness, blocked reasons.

Presentation-independent: report, checklist, SOP, training guide, or visual can share one package.

---

## Knowledge item model

Typed items (`fact`, `step`, `assumption`, `unresolved_gap`, …) with source refs, confidence, freshness, verification status, importance, sequence.

Assumptions and inferred items are never treated as verified facts.

---

## Source references

`VisualThinkingKnowledgeSourceReference` with source kinds including `user_request`, `user_supplied_text`, `understanding_outcome`, `experience_plan`, `external_research`, and other Estate kinds reserved for later connectors.

Do not claim a source was accessed when it was not.

---

## Gaps, freshness, evidence

Gaps record missing areas with resolution types: user input · existing source · external research · clarification · optional omission.

Freshness: timeless · stable · recent · current · unknown  
Evidence: none · helpful · expected · required

---

## Organization & relationships

Strategies: sequence · relationships · comparison criteria · learning progression · topic groups · …

Semantic relationships (`follows`, `depends_on`, …) are not canvas edges.

---

## Deduplication, conflicts, uncertainty

Material duplicates merge while preserving source refs.  
Conflicts stay separate with an open conflict record.  
Uncertainty records track unknown freshness and inferred items.

---

## Readiness

`not_ready` · `structure_ready` · `partial_ready` · `full_ready`

`readyForGeneration` is true for structure/partial/full when a safe generation scope is clear.

---

## Generation Engine handoff

`VisualThinkingGenerationHandoff` supplies package id, readiness, approved items, unresolved gaps, sources, conflicts, uncertainties, assumptions, safe generation scope, blocked areas, and user-provided steps.

Generation must fill only safe sections and keep placeholders for blocked areas.

---

## Creation modes

| Mode | Behavior |
|------|----------|
| build_for_me | Assemble available knowledge; identify gaps |
| guide_me | Focused missing-information questions |
| collaborate | Partial package + high-value contribution points |
| let_me_build | Lightweight knowledge shell |

---

## Adaptive Companion

May limit how many gap questions are shown.  
Must not hide required gaps, remove conflicts, or falsely increase readiness.

---

## Persistence

Session-only: `companion-visual-thinking-knowledge-package-v1`  
No new durable DB schema in this build.

---

## AI compatibility

Pure functions + typed contracts. Later hybrid assembly (deterministic, AI, connectors, research) must produce the same package shape.

---

## Exclusions

Live web research · crawling · citation fetching · broad connectors · canvas rendering · presentation switching · exports · handoffs

---

## Presentation handoff

Generated deliverables pass through [Presentation Intelligence](./VISUAL_THINKING_PRESENTATION_INTELLIGENCE_STANDARD.md) (Build 6) before the review workspace. Presentation must not recreate or mutate the Knowledge Package.

## Build 7 recommendation

**Research Acquisition Engine** — resolve `external_research` gaps by gathering approved sources into the same Knowledge Package contract, then re-assess readiness without changing the experience plan.
