# Visual Thinking Generation Engine Standard

**Status:** Binding for Visual Thinking Studio Build 4  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingGenerationEngine.ts`  
**Canonical input:** confirmed `VisualThinkingExperiencePlan`  
**UI:** `VisualThinkingRequestPanel` review state after confirm

---

## Mission

Convert a **confirmed** experience plan into one or more structured, editable deliverables.

Create exactly what the plan requests — no more, no less.

---

## Canonical flow

```
VisualThinkingRequest
→ VisualThinkingUnderstanding
→ VisualThinkingExperiencePlan
→ VisualThinkingKnowledgePlan / KnowledgePackage
→ VisualThinkingGenerationRun
→ Generated Deliverables
→ VisualThinkingPresentationPlan
→ Presentation Workspace
```

| Layer | Owns |
|-------|------|
| Request | Capture |
| Understanding | Goal, success, tasks, research need |
| Orchestrator | Experience, deliverables, stages, interaction |
| Knowledge Intelligence | Structured, traceable Knowledge Package |
| **Generation Engine** | Structured content from the confirmed plan + Knowledge Package handoff |

Prefer generating from a **Knowledge Package** (via handoff) rather than disconnected raw inputs. See [VISUAL_THINKING_KNOWLEDGE_INTELLIGENCE_STANDARD.md](./VISUAL_THINKING_KNOWLEDGE_INTELLIGENCE_STANDARD.md).

The Generation Engine must **not** re-interpret goals, re-select experiences, invent deliverables, force visuals, perform live research, or fabricate current facts.

---

## Generation-run model

`VisualThinkingGenerationRun` tracks:

`id` · `planId` · `understandingId` · `requestId` · `status` · `currentStage` · `completedStages` · deliverable ids · `researchBlocked` · `researchBlockReason` · timestamps · `generationMode` · provenance · `errors` · `warnings` · `userFacingStatus`

Statuses: `ready` · `generating` · `awaiting_research` · `awaiting_user_input` · `review_ready` · `partial` · `completed` · `failed` · `cancelled`

---

## Deliverable model

`VisualThinkingGeneratedDeliverable`:

`type` · `role` (`primary` \| `supporting`) · `title` · `purpose` · `detailLevel` · `blocks` · `visualShell` · `editable` · `userEdited` · `status` · `sourceMode` · links · timestamps

---

## Content-block model

`VisualThinkingContentBlock` — stable ids, typed blocks (`heading`, `numbered_step`, `checklist_item`, `placeholder`, `process_node`, …), `userEdited` flag.

Prefer structured blocks over one large string.

---

## Supported generated deliverables

Primary foundation: step-by-step · checklist · report · SOP · training guide · concise explanation · comparison · action plan · user-led visual shell · process-flow / relationship / decision-tree / timeline shells

Supporting: only types listed on the confirmed plan (checklist, quick reference, common mistakes, glossary, FAQ, summary, examples, shells, …)

---

## Interaction styles

| Style | Behavior |
|-------|----------|
| `build_for_me` | Full safe first draft |
| `guide_me` | Partial structure + prompts (`awaiting_user_input` when incomplete) |
| `collaborate` | Initial draft with room for input |
| `let_me_build` | Editable shell only — never a completed map |

---

## Research blocking

When `researchStage === before_generation`:

- `status = awaiting_research`
- `researchBlocked = true`
- Safe outline / placeholders only
- No fabricated product steps, prices, regulations, medical/legal claims, or market facts

User-facing: *“I’m ready to build this once the research is gathered.”*

---

## Detail handling

Honor plan `detailLevel`: essentials · guided · detailed — without inventing unsupported facts.

---

## Editing & regeneration

Support edit / add / remove / reorder blocks; simplify & deepen deliverables; regenerate section while **preserving `userEdited` blocks by default**.

---

## Review state

Safe complete runs → `review_ready` with “Your first version is ready.”  
Supporting outputs remain secondary. No raw engine metadata in the UI.

---

## Partial completion

Failed supporting deliverables must not discard a successful primary. Use `partial` + warnings.

---

## Persistence

Session storage key: `companion-visual-thinking-generation-run-v1`  
No new durable DB schema in this build.

---

## Future AI compatibility

Presentation depends on the deliverable contract, not on whether content came from deterministic templates, AI, research, or the member.

Provenance: `generatedBy` · `generationVersion` · `sourceMode`

---

## Exclusions

Live research · citations · final canvas renderer · format conversion execution · cross-Estate handoffs · file export · DB migrations

---

## Knowledge handoff

Prefer consuming a Knowledge Package handoff (Build 5) rather than disconnected raw inputs. See [VISUAL_THINKING_KNOWLEDGE_INTELLIGENCE_STANDARD.md](./VISUAL_THINKING_KNOWLEDGE_INTELLIGENCE_STANDARD.md).

## Presentation handoff

Generated deliverables are passed to [Presentation Intelligence](./VISUAL_THINKING_PRESENTATION_INTELLIGENCE_STANDARD.md) before the final review workspace. Presentation chooses how content is shown — not what content is generated.

## Build 7 recommendation

Research Acquisition Engine (Build 9): [VISUAL_THINKING_RESEARCH_ACQUISITION_STANDARD.md](./VISUAL_THINKING_RESEARCH_ACQUISITION_STANDARD.md) — resolve Knowledge Package `external_research` gaps, then re-handoff to Generation via `knowledgeResearchSatisfied` — without choosing new deliverables or rewriting the Experience Plan.
