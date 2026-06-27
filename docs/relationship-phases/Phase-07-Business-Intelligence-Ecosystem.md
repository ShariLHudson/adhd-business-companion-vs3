# Phase 7 — Business Intelligence Ecosystem

**Registry ID:** `phase_7_business_intelligence_ecosystem`  
**Module:** `lib/businessIntelligenceEcosystem.ts`  
**Storage key:** `companion-phase7-business-intelligence-v1`  
**Status:** `active`

---

## Phase Name

Business Intelligence Ecosystem

---

## Purpose

Understand the business as a living system — offers, content, revenue signals, visibility, sales patterns, and strategic focus.

Tagline: *"Understand the business as a living system."*

---

## User Experience

The user should feel:

- Shari grasps how their business grows, struggles, and where focus matters
- Insights are plain language, not dashboard metrics
- Milestone: *"This companion understands my business."*

Panel: **Business Intelligence Ecosystem** in Getting To Know You.

---

## Intelligence Goal

Build a **business intelligence snapshot** and **business knowledge graph** (≥3 nodes) from OS evaluation, projects, saved work, and conversation signals.

---

## Activation Requirements

`isPhase7BusinessIntelligenceEcosystemActive(now)` requires **all**:

1. Phase 6 active
2. Business depth: `getBusinessProfile().sells` **or** `.role` **or** Phase 2 `business.primaryOffer`
3. `buildBusinessKnowledgeGraph(now).nodes.length` ≥ **3** (`MIN_BUSINESS_GRAPH_NODES`)

---

## Companion Behaviors

- `maybeBusinessIntelligenceInsight()` — contextual insights with cooldown (`INSIGHT_COOLDOWN_MS` = 4 days)
- Specialized detectors: offer confusion, revenue opportunity, content reuse, visibility bottleneck, sales avoidance
- `businessStageAwareRecommendation()` — stage-specific guidance (startup → pivot)
- `buildBusinessIntelligenceSnapshot()` — composite snapshot for panel
- `phase7BusinessIntelligenceHintForChat()` — chat guidance
- `observePhase7BusinessIntelligenceTurn()` — turn observation

---

## Intelligence Collected

Snapshot includes (from `buildBusinessIntelligenceSnapshot`):

- Offer intelligence, content intelligence, revenue intelligence
- Visibility and sales analysis
- Business bottleneck, opportunities, strategic focus
- Business knowledge graph nodes/edges
- Business OS snapshot (`evaluateBusinessOS`)

Phase 7 state tracks insight offers and domain signals in localStorage.

---

## Outputs

- Business intelligence panel markdown
- Chat insights (offer simplification, revenue, content reuse, visibility, sales support)
- **Gateway phase** for Phases 8, 10, and 11 (all require Phase 7 active in code)
- Feeds `autonomousPreparation.ts` and `transformationIntelligence.ts`

---

## Example Conversations

*Recovered from implementation behavior.*

**Offer confusion**

> **User:** I have too many offers and I'm confusing myself.  
> **Shari:** You have several offers in motion ([labels]). Would simplifying help — only if you want to explore that?

**Stage-aware focus**

> **Shari:** In growth stage, visibility and consistent lead flow deserve attention. Focus now: [strategic focus from snapshot].

**Sales avoidance**

> **User:** I hate selling — I just want to help people.  
> **Shari:** *(Sales intelligence pattern `sales_avoidance` — supportive move, no pressure to sell.)*

---

## Future Expansion Opportunities

Reserved for future specification:

- Deeper revenue intelligence (self-reported only per architectural guardrails)
- Integration with Founder Ecosystem Phase 4 intelligence engine (`lib/ecosystem/intelligence/`)
