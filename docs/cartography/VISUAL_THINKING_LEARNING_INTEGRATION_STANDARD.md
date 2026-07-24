# Visual Thinking × Learning Intelligence Integration Standard™ (Build 9 Pilot)

**Status:** Binding pilot standard — Learning Chamber Member only  
**Date:** 2026-07-24  
**Runtime:** `lib/learningIntelligence/` · shared pipeline via `lib/cartographersStudio/visualThinkingService.ts`  
**Related:** [VISUAL_THINKING_INTEGRATION_STANDARD.md](./VISUAL_THINKING_INTEGRATION_STANDARD.md) · [VISUAL_THINKING_GENERATE_FIRST_STANDARD.md](./VISUAL_THINKING_GENERATE_FIRST_STANDARD.md) · [VISUAL_THINKING_WORKSPACE_FOUNDATION_STANDARD.md](./VISUAL_THINKING_WORKSPACE_FOUNDATION_STANDARD.md) · [VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md](./VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md) · [LEARNING_INTELLIGENCE.md](../momentum-institute/LEARNING_INTELLIGENCE.md)

---

## Mission

Prove that another Spark Estate experience can:

1. Recognize when visual thinking would improve understanding  
2. Offer it naturally (or honor an explicit request)  
3. Pass established Learning context into the shared Visual Thinking pipeline  
4. Return the member to Learning without duplicating content or losing progress  

Learning teaches. Visual Thinking helps the member see. Neither duplicates the other.

---

## Pilot boundaries

**In scope:** Learning Chamber Member as the first consumer.

**Out of scope for this pilot:**

- Platform-wide Chamber rollout  
- Learning-local map / diagram engines  
- New curriculum architecture  
- Automatic mastery scoring from visual interaction  
- Automatic note writebacks without approval  
- Export, printing, multiplayer  
- Cross-member routing beyond Learning ↔ Visual Thinking  

Do not begin a second Chamber integration until this pilot is validated.

---

## Responsibility separation

| Owner | Owns |
|-------|------|
| **Learning** | Learning request understanding, learning goal, learner level, progression, teaching, reinforcement |
| **Visual Thinking** | Whether knowledge supports a visual, eligible representation, request context, presentation, Thinking Workspace, alternate eligible views |

Do not duplicate Learning Intelligence inside Visual Thinking.  
Do not duplicate Visual Thinking logic inside Learning.

---

## Canonical flow

```
Learning Conversation
→ Learning Understanding
→ Learning Experience Plan
→ Visual-Thinking Recommendation Assessment
→ User Accepts or Declines (or explicit visual request)
→ LearningVisualThinkingIntegrationRequest
→ VisualThinkingService / shared pipeline
→ Thinking Workspace
→ VisualThinkingLearningReturn
```

---

## Integration request

Contract: `LearningVisualThinkingIntegrationRequest`  
(`lib/learningIntelligence/visualThinkingIntegration.ts`)

Must include established Learning context — not only the original user message:

- topic, learning goal, success definition  
- learner knowledge level, requested depth  
- learning stage / mode  
- current explanation  
- scoped approved knowledge item ids + items  
- source references  
- suggested visual purpose / presentation  
- recommendation reason  
- explicit vs accepted flags  
- return context  
- `integrationVersion: "learning-vt-pilot-1"`

---

## Learning visual purposes

Purposes guide representation. They are not member-facing technical map names:

`understand_relationships` · `understand_sequence` · `understand_hierarchy` · `understand_chronology` · `compare_concepts` · `see_the_whole` · `learn_a_process` · `reinforce_memory` · `review_key_ideas` · `identify_gaps` · `follow_learning_progression`

---

## Recommendation assessment

Pure function: `assessLearningVisualThinkingRecommendation(...)`

Returns `LearningVisualThinkingRecommendation` with usefulness scoring, timing, Shari-voice invitation, and suppressibility.

**Recommend when** structure suggests material learning gain (multi-concept relationships, long sequences, comparisons, hierarchy, confusion, etc.).

**Do not recommend when** the ask is a simple fact, structure is thin, a visual would decorate without helping, the member declined for this topic/lesson, emotional support is primary, or Learning has not yet offered any value.

Usefulness > keywords.

---

## Explicit visual requests

`detectsExplicitLearningVisualRequest(text)`

Examples that authorize immediately: “show me visually”, “make a visual”, “map this”, “diagram this”, “turn this into a timeline”, “help me see the big picture”.

**Not automatic authorization alone:** “Show me the steps…” (Scenario C) — Learning may still recommend a process visual after explaining.

On explicit request: no recommendation card, no second intake, proceed through shared pipeline. If the requested representation is ineligible, Visual Thinking explains naturally and offers the nearest eligible view.

---

## Recommendation timing

Appropriate after a short explanation, when relationships/comparisons become complex, on confusion, before a long sequence, or on review.

Never as the first response unless the member explicitly asked for a visual.

---

## No-repeat behavior

| Action | Effect |
|--------|--------|
| **Keep Learning Here** | Stay in Learning; suppress same topic recommendation for the session |
| **Not During This Lesson** | Suppress optional visuals for the remainder of the learning session |

A single decline is **not** a permanent global anti-visual preference.

Session keys: `companion-learning-vt-session-v1`

---

## Context preservation & adapter

`createVisualThinkingContextFromLearning(...)` prepares:

- `VisualThinkingRequestContext`  
- scoped knowledge (≤16 items, deduped, purpose-filtered)  
- seed request text (goal + explanation + key points)  
- `VisualThinkingServiceHandoff` to `visual_thinking_studio`  

The shared pipeline remains authoritative. The adapter does not bypass Generate-First, Presentation, or Workspace guards.

---

## Knowledge reuse

- Preserve authoritative Learning content, source references, confidence/verification  
- Include unresolved questions when relevant  
- Distinguish verified vs generated explanation  
- Never pass the entire Learning library  

---

## Generate-first handoff

On accept or explicit request:

- Continue automatically  
- No second creation confirmation  
- No restating known topic/detail  
- Research only when required and supported  
- Comply with [VISUAL_THINKING_GENERATE_FIRST_STANDARD.md](./VISUAL_THINKING_GENERATE_FIRST_STANDARD.md)

---

## Learning-state preservation

Before opening Visual Thinking, preserve session id, lesson position, topic, completed steps, open explanation, notes, progress, and return route.

Opening Visual Thinking must **not** mark the lesson complete, reset conversation, lose notes, duplicate progress, or restart the topic.

---

## Return-to-Learning handoff

Contract: `VisualThinkingLearningReturn`

Restores the correct session and resume point. Example voice:

> Welcome back. You were looking at how the four Medicare parts work together. Would you like to continue with enrollment timing, or review one of the parts first?

Supporting actions may include: Return to Lesson · Open Written Explanation · Review What I Learned · Ask Shari About This.

Return key: `companion-learning-vt-return-v1`

---

## Insight writebacks

User-created notes, questions, connections, gaps, examples, and confusion marks may be offered back with **explicit approval**:

- Add to learning notes  
- Ask in Learning  
- Use as next learning question  
- Keep only in the visual  

Never auto-write user visual organization as factual knowledge.

---

## Progress and mastery boundaries

Visual activity may contribute only when meaningful (reviewed major concepts, completed walkthrough, compared required options, answered reflection).

**Never** treat opening, moving nodes, zoom, or presentation changes as mastery proof. Do not mark mastery automatically.

---

## Adaptive Companion

May observe flexible preference events (accept/decline/explicit/open/return/helpful). Must not stereotype (“visual learner”), force visuals, repeatedly interrupt, remove written explanations, or claim visual use proves understanding.

Uses existing VT preference architecture (`companion-visual-thinking-preference-v1`) plus Learning session suppression — no competing store.

---

## Failures and recovery

If Visual Thinking cannot open: preserve Learning, natural recovery message, no internal errors.

If structure is insufficient: keep guided explanation; do not invent meaningless nodes.

Partial substantive visuals may open with honest local incompleteness notices.

---

## Navigation

Always provide source-aware paths: Return to Learning · Written explanation · Ask Shari · Visual Thinking overview.

Do not rely on a generic back that can land in the wrong Estate place.

---

## Observability

Internal events (not member-facing): recommendation assessed/shown/accepted/declined, explicit request, handoff, workspace open/fail, return, writeback offered/approved, repeated recommendation suppressed.

Key: `companion-learning-vt-observability-v1`

---

## Accessibility

Invitation projection (`projectLearningVisualInvitation`) provides keyboard-accessible actions, semantic region/status text, large targets, no color-only meaning. On return, focus should move to the resumed Learning heading or prompt when UI is wired.

---

## Persistence

Persist source Learning session, conversation, visual workspace id, return destination, session declines, current presentation, approved writebacks — following repository session patterns. No disconnected duplicate sessions.

---

## Exclusions

See Pilot boundaries. No second Chamber consumer in this build.

---

## Pilot success criteria

- Recommendations only when useful  
- Decline continues Learning without repeat nagging  
- Accept/explicit handoffs do not re-intake  
- Substantive visual content opens via shared pipeline  
- Return restores the same Learning position  
- Questions can return to Learning; writebacks need approval  
- No duplicate Learning/visual systems  
- Existing Visual Thinking behavior remains intact  

---

## Recommendation for the next integration

After Learning pilot validation: **Projects** (execution / dependency visuals) or **Business Estate** (system relationships) — both already listed as `VisualThinkingService` callers and benefit from the same optional, dismissible, context-preserving pattern.

---

## Core belief

Learning should teach. Visual Thinking should help the user see. The member should move between them without repeating themselves, losing progress, or managing platform architecture.
