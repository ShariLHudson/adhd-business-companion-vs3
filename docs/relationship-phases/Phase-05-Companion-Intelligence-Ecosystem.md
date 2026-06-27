# Phase 5 — Companion Intelligence Ecosystem

**Registry ID:** `phase_5_companion_intelligence_ecosystem`  
**Module:** `lib/phase5CompanionIntelligenceEcosystem.ts`  
**Storage key:** `companion-phase5-intelligence-ecosystem-v1`  
**Status:** `active`

---

## Phase Name

Companion Intelligence Ecosystem

---

## Purpose

Adaptive intelligence that evolves with the user over years — personal growth, legacy checkpoints, and long-horizon memory beyond day-to-day business operations.

Tagline: *"Adaptive intelligence that evolves with the user over years."*

---

## User Experience

The user should feel:

- Known as a whole person building toward who they want to become
- That wins and lessons accumulate into a personal story
- Milestone: *"You help me become the person I want to become."*

Panel sections when active: Personal Operating Manual, Wisdom Engine, What We've Built Together (includes legacy intelligence).

---

## Intelligence Goal

Sustain **multi-year memory**, **business evolution stage**, **growth signals**, **wisdom insights**, and **legacy checkpoints** (365/730/1095/1825 day marks).

**Note:** Phase 5 currently hosts **partial Phase 9 Wisdom Intelligence** via `wisdomInsights` and `formatWisdomEngineForDisplay()`.

---

## Activation Requirements

`isPhase5CompanionIntelligenceEcosystemActive(now)` requires **all**:

1. Phase 1 complete
2. Phase 4 active
3. ≥**90** days **OR** ≥**20** sessions (`MIN_PHASE5_DAYS`, `MIN_PHASE5_SESSIONS`)

---

## Companion Behaviors

- `observePhase5EcosystemTurn()` — growth signals, wisdom entries, business stage inference, multi-year memory
- `maybePredictiveOpportunityOffer()` — topic-based opportunity prompts (workshop, launch, offer) with cooldown
- `maybeLegacyCheckpoint()` — annual/multi-year reflection offers
- `buildPersonalOperatingManual()` — learning, decisions, confidence, momentum, friction
- `buildLegacyIntelligence()` — relationship days, sessions, confidence wins, narrative
- `phase5CompanionIntelligenceEcosystemHintForChat()` — chat guidance block

---

## Intelligence Collected

`Phase5EcosystemState`:

| Field | Description |
|-------|-------------|
| `businessStage` | `BusinessEvolutionStage` (startup → pivot) |
| `growthSignals` | visibility, confidence, completion, etc. |
| `multiYearMemory` | typed memory entries |
| `wisdomInsights` | text, source, confidence, recordedAt |
| `opportunityMentions` | topic mention counts |
| `legacyCheckpointsShown` | 365/730/1095/1825 flags |
| `founderMetrics` | observation counters |

---

## Outputs

- Personal Operating Manual (panel)
- Wisdom Engine display (panel) — *partial Phase 9*
- Legacy intelligence narrative and checkpoints
- Predictive opportunity offers in chat
- Feeds Phase 6 knowledge graph nodes (projects, saved work, templates)

---

## Example Conversations

*Recovered from implementation behavior.*

**Growth signal capture**

> **User:** I'm confident and proud — I finally finished and posted the workshop content.  
> *(Growth signals for visibility, confidence, follow-through incremented.)*

**Opportunity offer**

> **Shari:** You've mentioned workshops several times recently. Would you like to start outlining one?

**Legacy checkpoint (≥365 days)**

> **Shari:** We've worked together across [N] sessions. You've recorded [N] meaningful wins. [Legacy narrative.] Want to reflect on how far you've come?

---

## Future Expansion Opportunities

Reserved for future specification:

- Extract Wisdom Engine into dedicated Phase 9 module
- Wire wisdom insights to intervention learning outcomes (`lib/companionInterventionLearning.ts`)
