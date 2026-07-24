# Visual Thinking Recommendation Intelligence Standard™ (Build 8)

**Status:** Binding shared recommendation standard  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingRecommendationIntelligence.ts`  
**Related:** [Integration](./VISUAL_THINKING_INTEGRATION_STANDARD.md) · [Generate-First](./VISUAL_THINKING_GENERATE_FIRST_STANDARD.md) · [Rename & Research-to-Result](./VISUAL_THINKING_STUDIO_RENAME_AND_RESEARCH_COMPLETION_STANDARD.md) · [Workspace Editing & Co-Creation](./WORKSPACE_EDITING_AND_CO_CREATION_STANDARD.md) · [Learning Pilot](./VISUAL_THINKING_LEARNING_PILOT_INTEGRATION_STANDARD.md)

**Learning consumer:** Learning builds `VisualThinkingRecommendationContext` via `buildLearningRecommendationContext` and must not invent a parallel recommender.

---

## Mission

Determine when Visual Thinking would **genuinely** improve understanding, planning, learning, comparison, decision-making, or execution — then offer it optionally, calmly, and without making the member remember to visit Visual Thinking Studio.

## Sequencing dependency

Do not use Recommendation Intelligence until:

- Destination is named **Visual Thinking Studio** (Welcome Home included)  
- Research-and-build produces substantive requested results  
- Empty / request-echo results fail substance validation  

Recommendation must route into a **working** Visual Thinking experience.

## Core principle

Recommend only when another representation would materially improve the member’s ability to understand, remember, compare, decide, organize, or act.

Do **not** recommend because the feature exists, a keyword appeared, a map is technically eligible, or the platform wants promotion.

## Shari behavior

1. Understand the request  
2. Provide initial value  
3. Notice helpful structure  
4. Offer Visual Thinking naturally  
5. Continue normally if declined  

Never interrupt the first moment of asking with an unnecessary choice (unless the member explicitly requested a visual).

## Canonical flow

```
Conversation / Estate Experience
→ Understanding + useful initial response
→ Recommendation Assessment + suppression check
→ Optional invitation (or skip)
→ Accept / Decline
→ VisualThinkingIntegrationRequest
→ Existing Visual Thinking pipeline
→ Substantive result → Thinking Workspace
→ Return to source
```

Explicit visual intent skips the optional invitation and authorizes handoff immediately.

## Recommendation model

Canonical runtime type: `VisualThinkingRecommendationDecision`

Includes: source ids, topic key, goal, cognitive task, recommended flag, confidence, usefulness score (internal), purpose, preferred/alternate presentations, factors, reasons, cautions, timing, user-facing message, actions, explicit/accepted/declined flags, suppression flags, status, readiness, assessment version.

**Statuses:** assessed · not_recommended · ready_to_offer · offered · accepted · declined · suppressed · expired · failed

Confidence and scores are never shown to members.

## Visual purposes

Cognitive purposes (not map-type menus): understand_relationships · understand_sequence · understand_hierarchy · understand_chronology · compare_options · understand_a_system · see_the_whole · clarify_dependencies · explore_cause_and_effect · support_a_decision · plan_execution · reinforce_learning · organize_complex_information · identify_gaps · review_progress · communicate_to_others

## Factors & keyword limits

Assess structure: concept count, relationships, groups, process length, branches, options/criteria, chronology, hierarchy, dependencies, decision complexity, information volume, confusion, teaching need, EF/working-memory load, preferences, prior usefulness, device, context, and whether a substantive visual can be built.

**Keywords may contribute evidence. They must not control the decision.**

Example: “Compare these two sentences” → usually no.  
“Help me understand how my offers, audiences, marketing, and projects connect” → likely yes, even without the word “map.”

## Confidence policy

| Confidence | Optional offer |
|------------|----------------|
| very_high / high | May recommend when timing is appropriate |
| medium | Secondary action only — do not interrupt |
| low / none | Do not recommend |

Explicit visual intent bypasses this threshold.

## Usefulness scoring

Internal dimensions: understandingBenefit · cognitiveLoadReduction · actionabilityBenefit · memoryBenefit · comparisonBenefit · communicationBenefit · representationFit · interruptionCost · visualComplexityCost · sourceReadiness · contentReadiness → net score.

High theoretical benefit cannot overcome insufficient content readiness.

## Substantive-visual readiness

`VisualThinkingRecommendationReadiness` — eligible only when structure and knowledge (or authorized research) can produce more than an empty canvas, central node, meaningless connectors, outline-as-map, placeholders, or request echo.

## Explicit visual intent

Detects phrases such as show me visually, make a visual, map this, create a timeline, open Visual Thinking Studio, lay this out visually, help me see the whole picture.

**“Show me” alone is not always authorization** (e.g. “Show me the steps…”).

On explicit intent: no recommendation card, no map-type menu, preserve source context, continue generate-first pipeline.

## Initial value & timing

Optional recommendations appear **after** useful help, unless explicit or the experience is already choosing a representation.

Timings: immediate_explicit · after_initial_value · after_structure_emerges · after_confusion_signal · before_complex_detail · during_review · secondary_action_only · do_not_offer

Prefer one well-timed invitation.

## Invitation UI contract

One natural sentence · Show Me Visually · Keep Going Here · optional Not During This Topic.

No map menus, IDs, confidence %, promotional cards, or internal scores.

## Acceptance / decline / suppression

**Accept:** create integration request, preserve goal/progress/return, continue automatically, no restating, no second creation confirm, no map-type question.

**Keep Going Here:** stay; suppress same topic recommendation; no permanent anti-visual preference.

**Not During This Topic:** suppress for topic.

**Stop suggesting visuals:** broader preference via Adaptive Companion / preference events; explicit requests still work.

Re-eligibility when topic changes, content becomes materially more complex, or the member explicitly asks.

## Adaptive Companion

May influence confidence, timing, written-vs-visual emphasis, density, card vs secondary action, recent decline count.

Must not: force visuals, suppress explicit requests, repeatedly promote, remove written experience, infer understanding from opening a visual, permanently label “visual learner,” or assume ADHD means always prefer visuals.

## Source context & integration request

`VisualThinkingRecommendationContext` — scoped signals only (not entire libraries).

`VisualThinkingIntegrationRequest` — adapts into existing Visual Thinking Request / Service handoff. Does **not** bypass the pipeline.

## Return context & writeback boundary

Every handoff preserves source-aware return. Recommendation Intelligence does not own writebacks; source integration contracts decide what may be offered back, with confirmation for content/execution changes.

## Failures & recovery

Assessment failure → continue source, no broken card.  
Open failure → preserve source, natural recovery message.  
Insufficient structure → no fake map; continue gathering or ask one necessary question.

## Accessibility & narrow screen

Keyboard actions, visible focus, semantic status, large targets, no color-only meaning. Compact invitation on narrow screens; mobile-appropriate presentations; clear Return.

## Observability & quality audit

Internal events: assessed · offered · accepted · declined · suppressed · explicit · workspace opened/abandoned · helpful feedback · return · alternate view.

Dev-only audit projection: recommended, confidence, purpose, timing, factors, suppression, readiness, blocked reasons — never in production UI.

## Exclusions

No full Chamber rollout, per-destination duplicate engines, keyword-only routing, forced navigation, new map menus, new generation/research engines, writeback automation, permanent learner labels, or platform-wide pop-ups.

## Next pilot recommendation

Validate through **one** focused source-experience pilot (recommended: Learning Chamber or Projects dependency view) before broader rollout.

## Core belief

Visual Thinking should enter because it helps — not because Spark Estate has a visual feature to promote. Give value first. When accepted, take them there without making them repeat themselves or manage the platform.
