# Phase 11 — Ecosystem Intelligence

**Registry ID:** `phase_11_ecosystem_intelligence`  
**Module:** `lib/ecosystemIntelligence.ts`  
**Storage key:** `companion-phase11-ecosystem-intelligence-v1`  
**Status:** `active`

---

## Phase Name

Ecosystem Intelligence™

---

## Purpose

Understand the **whole life system** — not just business. Life domains, capacity, energy, season, purpose, and cross-domain interconnections.

Tagline: *"Understand the whole life system."*  
Milestone: *"This companion understands my life, not just my business."*

Original specification (recovered from chat): answer *why* things are happening across business, energy, relationships, health, learning, purpose, and growth — not only *what* is happening.

---

## User Experience

The user should feel:

- Understood as a whole person whose business sits inside a life system
- Recommendations adapted to capacity — not hustle pressure when overloaded
- Harmony over balance — *"build a business that fits your life"*

Panel: **Ecosystem Intelligence™** in Getting To Know You when active.

---

## Intelligence Goal

Model **12 life domains**, infer **capacity** and **life season**, detect **interconnection chains**, and surface **whole-system insights**.

---

## Activation Requirements

`isPhase11EcosystemIntelligenceActive(now)` requires **all**:

1. Phase 7 active
2. ≥**4** life domains with `state !== "emerging"` (`MIN_DOMAIN_SIGNALS`)
3. ≥**2** interconnection chains in snapshot

**Phase resolver:** Phase 11 is the **highest** relationship phase when active — supersedes Phase 10 and Phase 7 in `getCurrentRelationshipPhase()`.

---

## Companion Behaviors

- `observeEcosystemIntelligenceTurn()` — domain mention tracking from user text
- `maybeEcosystemInsight()` — capacity, purpose, hustle, cross-domain triggers
- `adaptRecommendationToCapacity()` — softens recommendations when overloaded/recovery_needed/fragile_momentum
- `identifyRecoveryRecommendation()`, `identifyPurposeReconnection()`, `identifyCrossDomainInsight()`
- `phase11EcosystemIntelligenceHintForChat()` — internal chat block
- `recordEcosystemInsightShown()` — cooldown (`INSIGHT_COOLDOWN_MS` = 4 days)
- `formatEcosystemIntelligenceForPanel()` — domains, capacity, energy, season, purpose, chains

Life domains in code: business, energy, learning, relationships, health, mindset, purpose, environment, creativity, finance, time, personal_growth.

Capacity levels: high, moderate, recovery_needed, overloaded, hyperfocused, fragile_momentum.

---

## Intelligence Collected

`EcosystemIntelligenceState`:

- `domainMentions` — per-domain counts
- `chainsObserved`, `insightsOffered`, `lastInsightOfferAt`

`EcosystemIntelligenceSnapshot`:

- `domains[]` — state: strong | steady | strained | emerging
- `capacity`, `capacityNarrative`
- `energy` — physical, mental, emotional, creative, decision dimensions
- `season` — building | recovery | launch | learning | growth | maintenance | transition
- `purpose`, `interconnections[]`, `insights[]`, `harmonyNarrative`

Signal detection uses regex patterns on user text for domains (e.g., tired/burnout → energy, health/sick → health).

---

## Outputs

- Whole-life ecosystem panel
- Capacity-aware recommendation adaptation
- Chat insights on hustle, purpose, cross-domain connections
- Validation suite: capacity awareness, energy influence, cross-domain insight, recovery detection, purpose reconnection, whole-system accuracy

---

## Example Conversations

*Recovered from implementation behavior.*

**Capacity-aware pushback**

> **User:** I just need to work harder and hustle more this week.  
> **Shari:** [Capacity narrative.] The advice shifts when capacity is [overloaded/recovery needed]. A smaller step may fit better.

**Purpose reconnection**

> **User:** I've lost motivation — why am I even doing this?  
> **Shari:** Reconnecting to purpose: [purpose from onboarding/discovery]. (Only if that still resonates — you can correct me.)

**Cross-domain insight**

> **User:** I'm exhausted and my business feels stuck.  
> **Shari:** *(Interconnection chain linking energy strain to business friction — if ≥2 chains active.)*

---

## Future Expansion Opportunities

Reserved for future specification:

- Explicit Phase 11 relationship with Phase 9 wisdom (original roadmap narrative)
- Sync life-domain model to `lib/intelligence-layer/` master profile
- **Not to be confused with** `lib/ecosystem-intelligence/` vertical hub or Founder Ecosystem — separate modules per architecture doc
