# Visual Thinking Studio — Rename & Research-to-Result Completion Standard™ (Corrective Build 7.1)

**Status:** Binding corrective standard  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/` · Welcome Home / Estate navigation labels  
**Related:** Generate-First · Research Acquisition · Generation · Presentation · Workspace Foundation · Integration

---

## Official user-facing name

**Visual Thinking Studio**

Use this exact name in Welcome Home, Estate navigation, destination cards, headings, breadcrumbs, return actions, help, empty/loading states, buttons, tooltips, accessibility labels, search results, command confirmations, and saved-work labels.

### Suggested descriptions

- “Turn information, ideas, research, and plans into clear visual and written ways of understanding them.”
- “Explore, organize, and understand information through guides, reports, comparisons, processes, timelines, and visual thinking.”
- Welcome Home support line: “See ideas, research, plans, and information in the clearest way for you.”

Do not describe the destination as only a mapping room, cartography tool, mind-map builder, or diagram editor.

---

## Legacy internal compatibility

| Layer | Policy |
|-------|--------|
| User-facing name | **Visual Thinking Studio** |
| Module path | `lib/cartographersStudio/` may remain |
| Route / opener ids | `cartographers-studio`, `focus-studio`, `visual-focus` may remain |
| Background asset | `/backgrounds/cartoghraphers-studio-background.png` preserved |
| Persistence keys | Preserve unless a safe migration exists |
| UI leakage | Internal names must **not** appear in breadcrumbs, labels, or aria |

`CARTOGRAPHERS_STUDIO_OFFICIAL_NAME` is a compatibility alias that resolves to **Visual Thinking Studio**.

---

## Welcome Home menu

- Label: Visual Thinking Studio  
- One entry only (no Cartography + Visual Thinking Studio pair)  
- Opens existing destination (`cartographers-studio` opener)  
- Menu structure otherwise unchanged  

---

## Command aliases

Route to Visual Thinking Studio:

- take me / open Visual Thinking Studio  
- show me Visual Thinking  
- help me create a visual / understand this visually  
- open Cartography / take me to the Cartographer’s Studio (legacy)

User-facing response: **“I’m opening Visual Thinking Studio.”**

---

## Saved-work compatibility

User-facing labels: Previous Visual Thinking Work · Continue Previous Work · My Visual Thinking Work.

Do not rename underlying stored records destructively. Legacy Cartography work remains readable under Visual Thinking Studio.

---

## Requested-outcome contract

`VisualThinkingRequestedOutcome` (`visualThinkingRequestedOutcome.ts`) preserves:

- requested deliverable type & presentation  
- research / generation / visual / written requirements  
- completion & minimum substance criteria  
- partial / fallback allowances  

---

## Research-to-result pipeline

```
User Request
→ Authorization / Understanding / Experience
→ Knowledge Plan & Package
→ Research Gap Identification
→ Research Acquisition (stable or live when available)
→ Knowledge Package Update
→ Readiness Reassessment
→ Generation
→ Substance + Outcome Validation
→ Presentation Plan (requested primary when eligible)
→ Workspace Plan / Thinking Workspace
→ Visual Thinking Studio Result
```

Runtime orchestrator: `runVisualThinkingResearchToResult`.

**Non-negotiable:** A Research Plan, Knowledge Package, or outline alone never satisfies completion.

---

## Research normalization

Findings enter Knowledge Items with content, source, kind, confidence, freshness, verification, gap linkage, and uncertainties. Results must not remain isolated in a Research Plan.

Stable acquisition (`buildStableResearchFindingsForRequest`) covers known instructional domains (e.g. Loom/YouTube), CRM comparison seeds, timeline notes, Medicare report structure, and estate relationship signals. Live web connectors remain optional/provider-agnostic — when unavailable, do not claim research finished for freshness-sensitive topics without findings.

---

## Generation continuation

After successful acquisition:

- continue automatically  
- no second “Create it / Generate now” confirmation when the original request authorized creation  
- enrich generation with research-acquired content + instructional material  

---

## Visual & report building

- Requested maps/visuals must produce meaningful structure (not a lone central node).  
- Requested reports must include substantive sections, findings, and honest limitations.  
- Guides need real steps; comparisons need options/criteria; timelines need chronology.  
- Explicit requested output remains primary; supporting views stay secondary.  

---

## Completion assessment

`assessVisualThinkingOutcomeCompletion` — `requestedOutcomeSatisfied` must be true before a completed state is shown.

---

## Failure recovery

| Failure | Behavior |
|---------|----------|
| Research | Preserve request; incomplete; retry; do not claim complete |
| Generation | Preserve Knowledge Package; retry generation |
| Visual projection | Open written result; allow visual retry |
| Presentation | Safe structured/written default; preserve deliverable |

---

## Persistence & resume

Persist requested outcome, research, knowledge, generation, validation, presentation, workspace, failure stage. Resume from last incomplete stage without restarting successful research unless freshness requires it.

---

## Testing requirements

Cover Welcome Home rename, legacy aliases, Loom guide, CRM comparison, timeline, business map, report-primary, research-unavailable incomplete, and “plan alone ≠ complete”.

---

## Recommendation Intelligence dependency

[Recommendation Intelligence](./VISUAL_THINKING_RECOMMENDATION_INTELLIGENCE_STANDARD.md) must only recommend destinations that can produce substantive results under this standard. Optional recommendations require usefulness + readiness; explicit visual requests route directly.

## Core rules

1. The destination is called **Visual Thinking Studio**.  
2. When the user asks Spark Estate to research and build something, the platform must build it.  
3. Research is an input. The requested result is the outcome.  
4. Do not stop at planning, research, or an outline.
