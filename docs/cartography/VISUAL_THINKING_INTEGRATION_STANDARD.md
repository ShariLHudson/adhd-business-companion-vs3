# Visual Thinking Integration Standard™

**Status:** Binding platform integration standard  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingService.ts`  
**Related:** Generate-First · Presentation · Workspace Foundation · Experience Standard

---

## Mission

Visual Thinking Studio is no longer only a destination.

It is a **platform cognitive ability** available to every Spark Estate experience — Companion, Chamber Members, Board, Projects, Business Estate, and future intelligence — without each implementing maps or diagrams independently.

---

## Core philosophy

Members should never have to think: “I should go build a map.”

Spark Estate may recognize when visual thinking would improve understanding and offer:

> “I think seeing this visually would make it much easier to understand.”

The recommendation is **optional**. The member remains in control.

---

## Service

`VisualThinkingService` (and pure helpers beside it) lets any experience request:

- visual explanation  
- process visualization  
- comparison visualization  
- relationship visualization  
- timeline visualization  
- learning visualization  
- decision visualization  
- execution visualization  

Callers do not need to know how Visual Thinking works internally.

---

## Contracts

### `VisualThinkingRequestContext`

May include: `sourceExperience`, `sourceCompanion`, conversation summary, primary goal, current task, Knowledge Package, generated deliverable, Presentation Plan, preferred presentation/capability, user preferences, reason for recommendation, structural counts (concepts, relationships, steps, options, criteria), and free-text signals.

### `VisualThinkingRecommendation`

`shouldRecommend`, confidence, capability, preferred presentation, reason, invitation copy, primary/keep action labels, `optional: true`, `dismissible: true`, scoring factors.

### `VisualThinkingServiceHandoff`

Caller, capability, preferred presentation, artifact ids (Knowledge Package / Presentation / deliverable), seed request text, destination `visual_thinking_studio`, preservation flags. Never recreates knowledge.

---

## Supported callers

Business Estate · Projects · Learning · Marketing · Leadership · Momentum · Innovation · Events · Strategy · Finance · Board of Directors · Executive Office · Founder Studio · General Chat · Chamber Members · Visual Thinking Studio itself

---

## Recommendation engine

`shouldRecommendVisualThinking(context)`

Considers triggers (compare, map, relationship, timeline, decision, walk me through, help me understand, …), concept/relationship/process/comparison complexity, executive-function load, Adaptive Companion presentation prefs, and remembered visual preferences.

**Usually yes:** business systems, complex processes, relationship analysis, multi-variable decisions.  
**Usually no:** simple questions, pure legal definitions, checklist-only asks.

Never auto-launches Visual Thinking.

---

## User experience pattern

Example (Learning):

> This lesson has several connected ideas. Would seeing them visually help?

Actions: **Open Visual Thinking** · **Keep Reading**

Never force transition.

---

## Caller examples

| Caller | May request |
|--------|-------------|
| Board | Decision, risk/tradeoff, relationships, timeline, dependencies |
| Projects | Execution map, milestones, dependencies, critical path |
| Business Estate | Business model, systems, journeys, offer relationships, workflows |
| Marketing | Campaign flow, customer journey, funnel, launch timeline |
| Learning | Concept maps, learning progression, relationship diagrams |
| General Chat | Visual explanation, comparison, decision support, planning |

---

## Workspace handoff

```
Knowledge Package
→ Presentation Plan
→ Thinking Workspace
```

Do not recreate information. Existing packages and plans travel by id via the service handoff.

---

## No duplication

No Chamber Member creates its own:

- mind maps  
- process diagrams  
- relationship maps  
- comparison engines  
- timeline engines  

Everything routes through Visual Thinking.

`assertNoDuplicateVisualThinkingEngines()` documents this platform rule for tests and audits.

---

## Permissions

Recommendations are:

- optional  
- dismissible  
- rememberable  
- respectful of member preference  

---

## Persistence

Session key: `companion-visual-thinking-preference-v1`

Tracks open / dismiss / checklist-open signals and derives a soft profile (`likes_visual`, `rarely_uses_visuals`, `prefers_written`, `often_opens_checklist`, …) for Adaptive Companion later.

Adaptive Companion may influence whether/how strongly a visual is suggested. It must not force visuals or hide required content.

---

## Learning Intelligence pilot (first consumer)

**Standard:** [VISUAL_THINKING_LEARNING_INTEGRATION_STANDARD.md](./VISUAL_THINKING_LEARNING_INTEGRATION_STANDARD.md)  
**Runtime:** `lib/learningIntelligence/`

Learning is the first Estate pilot consumer of this service.

| Layer | Owns |
|-------|------|
| **Learning** | Pedagogy — request understanding, goal, learner level, progression, teaching |
| **Visual Thinking** | Representation — eligibility, presentation, Thinking Workspace |

Clarifications for all callers (proven in the Learning pilot):

- Explicit visual requests bypass optional recommendation cards and authorize handoff  
- Optional recommendations must be useful, dismissible, and non-repeating for the same topic/session  
- Source experience state must always be preserved; return is source-aware  
- Callers adapt context into `VisualThinkingRequestContext` — they do not fork engines  

Do not begin a second Chamber Member integration until the Learning pilot is validated.

---

## Future integrations

- Conversational invitation surfaces in each caller UI (Learning invitation projection first)  
- Durable preference store (beyond session) when Spec 112 paths allow  
- Estate Brain capability registration pointing at this service  
- Next candidates after Learning validation: Projects · Business Estate  

Those builds consume this service — they do not fork new visual engines.

---

## Core belief

Visual Thinking Studio is not merely a room.

It is one of the core cognitive abilities of Spark Estate. Every intelligent experience should be able to borrow that ability whenever it genuinely helps the member think more clearly.
