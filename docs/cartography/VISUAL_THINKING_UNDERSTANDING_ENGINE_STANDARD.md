# Visual Thinking Understanding Engine Standard

**Status:** Binding for Visual Thinking Studio Build 2  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingUnderstanding.ts`  
**Request capture (Build 1):** `lib/cartographersStudio/visualThinkingRequest.ts`  
**UI projection:** `VisualThinkingRequestPanel` via `projectUnderstandingPreview`

---

## Mission

Sit between the user’s request and any recommended result.  
Interpret the real objective, success, cognitive task, knowledge, depth, creation mode, and research need — then recommend the smallest useful combination of experiences and outputs.

**Goal-first, not artifact-first.**

---

## Goal-first model

User request → understand objective → define success → identify cognitive task → estimate knowledge gap → determine help level → recommend experience + result → confirm or change.

Do not jump from keywords to artifact types.

---

## Success definitions

Infer what successful completion looks like for *this* request.  
Do not invent high-stakes outcomes the user did not imply.

---

## Cognitive tasks

Internal tasks may include: learn, understand, organize, research, compare, decide, create, plan, teach, explain, troubleshoot, evaluate, sequence, connect, apply.

Choose one primary task when possible. Never show technical task labels in the UI.

---

## Knowledge-level inference

Values: beginner · developing · experienced · advanced · mixed · unknown  

Estimate only with evidence. Preserve `unknown` when unsure. No quizzes.

---

## Depth

Reuse Build 1 depth: essentials · guided · detailed · help_choose  

Do not re-ask when already clear in the request.

---

## Creation mode

- `build_for_me`  
- `guide_me`  
- `build_myself`  
- `unspecified`  

`build_myself` must not recommend a completed generated result.

---

## Research need

- `not_needed` · `optional` · `required` · `unclear`  

This build only classifies need and reason. No live research. No fabricated findings.

---

## Primary experience

Teaching · research · guided creation · user-led creation · visual organization · comparison · decision support · planning · process development · explanation · troubleshooting  

Experience ≠ output (e.g. teaching → step-by-step guide).

---

## Output recommendations

One primary output. Supporting outputs optional and secondary.  
Honor explicit preferences and exclusions (especially no-map).  
Never force maps, research, supporting deliverables, or decision answers.

---

## Assumptions

Record meaningful assumptions. Do not silently convert them into facts.  
If an assumption materially changes the result, mention it briefly or ask one clarification.

---

## Clarification policy

Ask only when needed to avoid the wrong result.  
At most one question. Never ask what is already answered.

Generate-first (6.6): teach / show me how / learn how / create / research / compare authorize `build_for_me`. Researchable gaps must not become user questions. See [VISUAL_THINKING_GENERATE_FIRST_STANDARD.md](./VISUAL_THINKING_GENERATE_FIRST_STANDARD.md).

---

## Confidence

Internal: low · medium · high  

Low confidence ≠ many questions. Ask at most the most useful one — or recommend and proceed.

---

## User control

Users may change goal interpretation, outcome, depth, primary/supporting outputs, research inclusion, and creation mode without losing the original raw request.

---

## Adaptive Companion

May reduce visible choice load and shape presentation.  
Must not reduce requested depth, change the goal, or force a format.

---

## Architecture boundaries

| Layer | Owns |
|-------|------|
| Build 1 request | Capture, draft, depth question, entry paths |
| Understanding Engine | Goal, success, tasks, research need, recommendations |
| Preview projection | Member-facing copy only |
| React panel | Presentation + controls |

Pure functions and typed contracts. Keyword helpers are deterministic for tests; a later AI layer can produce the same `VisualThinkingUnderstanding` shape.

Provenance fields: `interpretedBy` · `interpretationVersion` · `userAdjusted`

---

## Future AI compatibility

UI and generation depend on the canonical contract, not on whether interpretation came from deterministic logic, AI, user edits, or a hybrid.

---

## Exclusions

Not in this build: live research, source collection, full generation of reports/processes/maps, map canvas redesign, strategy/project handoffs, DB migrations, broad Cartography renaming.

---

## Downstream

- Build 3 — [Experience Orchestrator](./VISUAL_THINKING_EXPERIENCE_ORCHESTRATOR_STANDARD.md)  
- Build 5 — [Knowledge Intelligence](./VISUAL_THINKING_KNOWLEDGE_INTELLIGENCE_STANDARD.md)  
- Build 4 — [Generation Engine](./VISUAL_THINKING_GENERATION_ENGINE_STANDARD.md)  
- Build 6 — [Presentation Intelligence](./VISUAL_THINKING_PRESENTATION_INTELLIGENCE_STANDARD.md)  

Knowledge, Generation, and Presentation must not re-run Understanding logic.
