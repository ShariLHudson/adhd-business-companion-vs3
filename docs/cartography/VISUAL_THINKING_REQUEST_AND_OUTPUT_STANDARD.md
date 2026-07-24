# Visual Thinking Request & Output Standard

**Status:** Binding for Visual Thinking Studio Build 1 (request-first foundation)  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingRequest.ts`  
**UI:** `components/companion/cartographersStudio/VisualThinkingRequestPanel.tsx`  
**Background:** Existing Cartography room image (`CARTOGRAPHERS_STUDIO_BACKGROUND`) — retained

---

## Core mission

Visual Thinking Studio helps members see, understand, create, and work through ideas in ordinary language.

Members must never be required to understand map types, research methods, frameworks, or output formats before beginning.

This phase establishes intake only: capture the request, depth, and form preference — then confirm before any major generation.

### Relationship to Understanding + Orchestration

- **Build 1** captures the member’s request (`VisualThinkingRequest`).
- **Build 2** interprets goal, success, cognitive task, research need, and recommendations (`VisualThinkingUnderstanding`).
- **Build 3** turns understanding into an experience plan (`VisualThinkingExperiencePlan`).
- **Build 4** generates structured deliverables from a **confirmed** plan (`VisualThinkingGenerationRun`).

See: [Understanding](./VISUAL_THINKING_UNDERSTANDING_ENGINE_STANDARD.md) · [Orchestrator](./VISUAL_THINKING_EXPERIENCE_ORCHESTRATOR_STANDARD.md) · [Generation](./VISUAL_THINKING_GENERATION_ENGINE_STANDARD.md)

---

## Request understanding

From ordinary language, Spark forms a **provisional intent** (internal), such as:

- create a process · explain a topic · research a topic · organize ideas  
- compare options · make a decision · create a plan · build a checklist / SOP  
- create a visual · create a report · create a learning guide · user-led map creation  

Technical intent labels are not shown unless they help the member.

---

## Help depth

When the member already specifies detail (“every step,” “basics,” “expert-level report”), do **not** ask again.

When unclear, ask one question:

> How much help would feel useful?

Choices:

1. Just the essentials  
2. A clear guided version  
3. Detailed and thorough  
4. Help me choose  

Use Adaptive Companion reduced-choice presentation when available. Reduced choice affects **how many options are shown**, never intelligence depth.

---

## Output preference

Honor explicit formats (report, checklist, comparison, map, SOP, etc.).

When the member does not know, recommend **one primary** starting form, with optional supporting outputs only when genuinely useful.

Examples:

| Request | Primary | Supporting (optional) |
|---------|---------|------------------------|
| How do I create a Loom video? | Step-by-step guide | Process flow, checklist |
| Compare three CRM platforms | Comparison | Concise recommendation / action plan |
| How parts of my business connect | Visual relationship map | Written explanation |
| Research this topic deeply | Detailed report | Key findings aids |

Never force a map. Never force research. Never force several outputs.

---

## Recommendation behavior

Before major generation or research, show a short confirmation:

> Here’s what I think would help:  
> *…one concise paragraph…*

Actions:

- Yes, create this  
- Make it simpler  
- Add more detail  
- Choose a different format  

No long project specification.

---

## User control

Members may adjust without restarting intake:

- Too much / make it simpler  
- More detail  
- Just the report / no map  
- Show it visually too  
- Let me build it myself  
- Options first  

---

## User-led visual path

**Create My Own Visual** → ask what they want to map or organize.  
Do not ask for a map type first. Preserve the request; layout recommendation is a later build.

---

## Research-assisted path

**Research and Build It for Me** → ask what they want to learn, understand, or create.  
Infer topic, outcome, depth, and format when present; ask only what is missing.

---

## Adaptive Companion behavior

- `resolveAdaptivePresentation` / `limitVisibleChoices` cap visible depth choices  
- `fullDetailAvailable` remains true  
- Reduced-choice mode never assumes the member wants the shortest result  

---

## State model

`VisualThinkingRequest` fields:

`id` · `rawRequest` · `provisionalIntent` · `requestedDepth` · `requestedOutput` · `recommendedPrimaryOutput` · `recommendedSupportingOutputs` · `recommendationSummary` · `declinesMap` · `wantsVisualAlso` · `userConfirmed` · `entryPath` · `sourceContext` · `status`

Draft: session storage key `companion-visual-thinking-request-draft-v1` (temporary; no new durable DB schema in this phase).

---

## Exclusions (this phase)

Not built yet:

- Full map redesign  
- Live research / source gathering  
- Complete reports  
- Decision intelligence  
- Advanced visualizations  
- Destination handoffs  
- Full AI generation pipelines  

Existing maps and research records are not modified by this build.

---

## Next build

Build 2 (Understanding Engine) is documented separately.  
Build 3 should generate the confirmed primary result from the understanding contract (starting with step-by-step / report / user-led canvas shells) while keeping confirmation, corrections, and no-forced-map guarantees.
