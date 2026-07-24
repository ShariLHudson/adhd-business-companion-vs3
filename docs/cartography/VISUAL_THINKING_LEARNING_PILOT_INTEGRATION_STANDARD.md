# Visual Thinking × Learning Intelligence Pilot Integration Standard™ (Build 10)

**Status:** Binding — Learning Chamber Member pilot only  
**Date:** 2026-07-24  
**Runtime:** `lib/learningIntelligence/learningVisualThinkingPilot.ts` · `visualThinkingIntegration.ts`  
**Shared engines:** Recommendation Intelligence · Generate-First · Presentation · Workspace Editing  
**Related:** [Learning Integration (prior)](./VISUAL_THINKING_LEARNING_INTEGRATION_STANDARD.md) · [Recommendation](./VISUAL_THINKING_RECOMMENDATION_INTELLIGENCE_STANDARD.md) · [Workspace Editing](./WORKSPACE_EDITING_AND_CO_CREATION_STANDARD.md) · [Integration](./VISUAL_THINKING_INTEGRATION_STANDARD.md)

---

## Mission

Prove end-to-end that a member can learn in Learning, receive useful teaching, move naturally into Visual Thinking Studio when another representation would help, work with the result, and return to the exact Learning place — without repeating themselves or losing progress.

## Pilot boundaries

**In:** Learning Chamber Member only.  
**Out:** Projects, Business Estate, platform-wide Chamber rollout, Learning-local map engines, automatic mastery, automatic note writebacks, multiuser.

## Prerequisites

Visual Thinking Studio naming · research-to-result · Recommendation Intelligence · Workspace Editing & Co-Creation · source-aware return · user-edit protection.

## Responsibility separation

| Owner | Owns |
|-------|------|
| **Learning** | Pedagogy, goal, depth, sequencing, explanation, progress rules |
| **Visual Thinking Studio** | Representation, workspace, editing, alternate views |
| **Recommendation Intelligence** | Usefulness, confidence, timing, suppression, explicit intent |

Learning must not choose technical map types. Visual Thinking must not replace teaching.

## Canonical flow

```
Learning Request → Understanding → Teaching value
→ Recommendation Context → Shared Recommendation Assessment
→ Optional invitation OR explicit handoff
→ LearningVisualThinkingIntegrationRequest (v2)
→ Shared Visual Thinking pipeline
→ Substance validation → Presentation → Thinking Workspace
→ Co-creation / Ask in Learning / note offers
→ VisualThinkingLearningReturn → Learning resume
```

## Contracts

- `LearningVisualThinkingIntegrationRequestV2` — scoped Learning context + supporting written explanation  
- `buildLearningRecommendationContext` → shared `VisualThinkingRecommendationContext`  
- `WorkspaceLearningContext` — Shari context inside VT  
- `VisualThinkingLearningQuestionHandoff` — Ask in Learning  
- `VisualThinkingLearningReturnV2` — resume without restart  
- `LearningNoteWritebackOffer` — approval required  

## Recommendation behavior

Uses **shared** Recommendation Intelligence. Learning supplies pedagogy context and lesson/topic suppression only.

- Value first (except explicit visual intent)  
- Keywords alone never decide  
- Empty / central-node results must not open  
- Declines suppress topic/lesson; not permanent anti-visual preference  

## Supporting written view

Written Learning explanation remains available inside Visual Thinking (`Open Written Explanation`, `Return to Lesson`).

## Selected-object learning actions

Explain · Simplify · Example · Connections · Compare · Teach step · Ask question · Research · What’s missing · Add to Learning Notes (approval) · Ask in Learning  

Scoped to selection via Workspace Editing.

## Ask in Learning / writebacks

Questions return with selected context — no retyping.  
Notes/insights require approval before Learning records change.

## Progress boundaries

Opening, moving, zooming, changing layout/representation **never** count as mastery.  
Use existing Learning progress rules for genuine evidence only.

## Failure & recovery

Broken recommendation → continue Learning.  
Handoff/generation failure → preserve lesson; natural message; retry available.  
Return failure → use preserved session/route.

## Accessibility

Semantic invitation · keyboard actions · focus to workspace heading on open · focus to Learning resume on return · narrow-screen Return remains visible.

## Pilot success criteria

Useful teaching before optional invite · shared pipeline used · substantive open · written support available · scoped co-creation · Ask in Learning works · return resumes position · no duplicate sessions · no silent writebacks · tests pass.

## Next pilot recommendation (Build 11)

**Projects dependency / blockage view** — implemented as [VISUAL_THINKING_PROJECTS_PILOT_STANDARD.md](./VISUAL_THINKING_PROJECTS_PILOT_STANDARD.md) (`lib/projectsIntelligence/`).

## Core belief

Learning helps the member understand. Visual Thinking helps them see. One companion, two complementary ways — never a map catalog between them.
