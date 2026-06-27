# Phase 9 — Wisdom Intelligence

**Registry ID:** `phase_9_wisdom_intelligence`  
**Dedicated module:** `lib/wisdomIntelligence.ts`  
**Storage key:** `companion-phase9-wisdom-intelligence-v1`  
**Partial legacy:** `lib/phase5CompanionIntelligenceEcosystem.ts` (Wisdom Engine — hidden when Phase 9 active)  
**Registry status:** `active`  
**Implementation status:** Dedicated module wired — chat, panel, resolver, tests

---

## Phase Name

Wisdom Intelligence

---

## Purpose

Long-horizon wisdom — what has **actually worked for this person**, not generic expert advice.

Registry tagline: *"Long-horizon wisdom."*  
Registry milestone: *"Wisdom over time."*

Turns repeated experience into earned insight: lessons learned, repeated patterns, avoided traps, future-self guidance, hard-won strengths, recurring business/life wisdom.

Tone: practical and human — not mystical, preachy, clinical, or generic.

---

## User Experience

The user should feel:

- Advice is specific to their history, not recycled frameworks
- The companion learns what repeatedly helps *them*
- Wisdom accumulates quietly over months/years

**Panel:** Getting To Know You shows **Personal Wisdom** via `formatWisdomIntelligenceForPanel()` when Phase 9 is active. Phase 5 Wisdom Engine is suppressed when Phase 9 is active.

---

## Intelligence Goal

Develop a **wisdom layer** distinct from memory and analytics — actionable lessons with evidence levels and conservative activation.

---

## Activation Requirements

`isPhase9WisdomIntelligenceActive(now)` requires **all**:

1. Phase 7 active
2. Meaningful relationship history: ≥60 days **or** ≥15 sessions
3. ≥2 strong patterns (`countStrongPatterns`)
4. ≥3 wisdom items with ≥1 at `growing` or `strong` confidence

No activation from a single conversation. Weak evidence returns inactive.

**Resolver:** Consulted in `getCurrentRelationshipPhase()` after Phase 10 and before Phase 8.

---

## Companion Behaviors

| Function | Behavior |
|----------|----------|
| `isPhase9WisdomIntelligenceActive()` | Conservative activation gate |
| `observeWisdomIntelligenceTurn()` | Record lessons, traps, patterns from user text |
| `maybeWisdomReflection()` | Permission-based chat reflection |
| `recordWisdomReflectionShown()` | Cooldown tracking |
| `phase9WisdomIntelligenceHintForChat()` | Internal chat hint block |
| `buildWisdomIntelligenceSummary()` | Snapshot builder |
| `formatWisdomIntelligenceForPanel()` | Panel display |

Reflection cooldown: `REFLECTION_COOLDOWN_MS` (5 days).

**Wiring:** `CompanionPageClient.tsx` — observe turn, maybe reflection, record shown, chat hint (after Phase 8, before Phase 10).

---

## Intelligence Collected

`WisdomItem` kinds: `lesson_learned`, `repeated_pattern`, `avoided_trap`, `future_self`, `hard_won_strength`, `recurring_advice`

Confidence: `early` | `growing` | `strong`

Merges Phase 5 `wisdomInsights`, intervention effectiveness, and pattern wisdom.

---

## Outputs

- Personal Wisdom panel section
- Permission-based chat reflections
- Validation: `lib/WisdomIntelligenceValidation.test.ts`
- Resolver test: `lib/companionRelationshipPhases.test.ts`

---

## Example Conversations

**Lesson reflection**

> **Shari:** You've learned that pushing harder usually backfires when your energy is low. (Only if that still fits — correct me if not.)

**Pattern wisdom**

> **Shari:** A pattern I've noticed is that clarity comes after you talk it out, not before.

**Past experience**

> **Shari:** This sounds like one of those moments where your past experience may already have the answer.

---

## Avoid in user-facing copy

- "As your Wisdom Intelligence…"
- "Phase 9 says…"
- "Based on your intelligence layer…"
- "You always…" / "You never…"

---

## Architecture

- **ADR:** `docs/adr/ADR-010-phase-9-wisdom-module.md`
- **Resolver order:** `docs/adr/ADR-011-relationship-phase-resolver-order.md`
