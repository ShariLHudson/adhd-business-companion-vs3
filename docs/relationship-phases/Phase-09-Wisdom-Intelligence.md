# Phase 9 — Wisdom Intelligence

**Registry ID:** `phase_9_wisdom_intelligence`  
**Dedicated module:** **Not found**  
**Partial implementation:** `lib/phase5CompanionIntelligenceEcosystem.ts` (Wisdom Engine™)  
**Registry status:** `future`  
**Implementation status:** Partial only — no activation gate, no chat wiring, not in phase resolver

---

## Phase Name

Wisdom Intelligence™

---

## Purpose

Long-horizon wisdom — what has **actually worked for this person**, not generic expert advice.

Registry tagline: *"Long-horizon wisdom."*  
Registry milestone: *"Wisdom over time."*

Original specification (recovered from chat, not in repo): transform conversations, decisions, projects, strategies, successes, failures, and patterns into **practical personal wisdom**.

---

## User Experience

The user should feel:

- Advice is specific to their history, not recycled frameworks
- The companion learns what repeatedly helps *them*
- Wisdom accumulates quietly over months/years

**Current panel behavior:** When Phase 5 is active, Getting To Know You shows **Wisdom Engine™** via `formatWisdomEngineForDisplay()` — personal insights from `wisdomInsights[]`.

---

## Intelligence Goal

Develop a **wisdom layer** distinct from memory and analytics — actionable lessons with evidence levels.

**Reserved for future specification:** dedicated `wisdomIntelligence.ts` module and `isPhase9WisdomIntelligenceActive()` gate.

---

## Activation Requirements

| Item | Status |
|------|--------|
| `isPhase9WisdomIntelligenceActive()` | **Not found in codebase** |
| Registry | `status: "future"` |
| Phase resolver | **Not consulted** |

**Recovered from implementation behavior:** Wisdom insights are recorded when Phase 5 is active via `observePhase5EcosystemTurn()` — not gated on a Phase 9 flag.

---

## Companion Behaviors

*Partial — via Phase 5 module today.*

| Behavior | Source |
|----------|--------|
| Record wisdom from interventions | `recordWisdomFromInterventions()` |
| Record lesson patterns from user text | `observePhase5EcosystemTurn()` |
| Display wisdom list | `formatWisdomEngineForDisplay()` |
| Wisdom insight types | `source: "pattern" \| "intervention" \| "outcome" \| "lesson"` |
| Confidence levels | `early` \| `growing` \| `strong` |

**Not implemented:** dedicated chat hints, dedicated panel gate, phase-specific observation loop.

---

## Intelligence Collected

`WisdomInsight` (in Phase 5 state):

```typescript
{
  text: string;
  source: "pattern" | "intervention" | "outcome" | "lesson";
  confidence: "early" | "growing" | "strong";
  recordedAt: string;
}
```

Stored in `Phase5EcosystemState.wisdomInsights` (max ~25 entries, recovered from implementation).

---

## Outputs

- Wisdom Engine™ panel section (when Phase 5 active)
- `founderMetrics.wisdomInsightsRecorded` counter

**Reserved for future specification:**

- Standalone wisdom snapshot builder
- Chat reflections citing wisdom with evidence
- Validation test suite (`WisdomIntelligenceValidation.test.ts`)

---

## Example Conversations

*Recovered from implementation behavior (Phase 5 wisdom recording).*

**Lesson capture**

> **User:** I learned that batching content on Sunday mornings actually works for me — I shipped three posts.  
> *(Wisdom entry with source `lesson`, confidence `early`.)*

**Pattern-based wisdom**

> *(After repeated visibility wins — wisdom entry from pattern with confidence `growing`.)*

**Panel display**

> ## Wisdom Engine™  
> _Personal wisdom — specific to you, not generic advice._  
> • Short focused sessions beat long planning blocks for you.  
> • Decision Compass helped when options felt equal-weighted.

---

## Future Expansion Opportunities

Reserved for future specification (from original Phase 9 prompt, not yet implemented):

- Create `lib/wisdomIntelligence.ts` with dedicated state and activation
- Wisdom validation framework (accuracy, evidence requirements)
- Wire chat hints and phase resolver between Phase 8 and Phase 10
- Elevate wisdom out of Phase 5 to avoid conflating ecosystem growth with wisdom maturity
- Integration with `lib/companionInterventionLearning.ts` outcome attribution
