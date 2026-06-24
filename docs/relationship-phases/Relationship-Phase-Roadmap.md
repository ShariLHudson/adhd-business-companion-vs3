# Companion Relationship Phase Roadmap

**ADHD Business Ecosystem™ — Phases 1–11**

Canonical registry: `lib/companionRelationshipPhases.ts`  
Storage: client-side `localStorage` per phase module.

---

## Overview

The relationship phases model how the companion **learns, adapts, and deepens trust** with a user over time. They are not onboarding screens alone — they are intelligence layers that unlock progressively as evidence accumulates.

**Milestone language** comes from the registry taglines and milestone strings.

---

## Phase 1 — Initial Trust

| Field | Detail |
|-------|--------|
| **Purpose** | Establish trust through conversation before forms or feature tours. |
| **Primary outcome** | Milestone: *"You understand my business."* |
| **Activation** | Default until `isPhase1OnboardingComplete()` returns true. |
| **Status** | `active` |
| **Dependencies** | None |
| **Intelligence evolution** | Seeds relationship profile (win definition, business type, challenge, outcome); blocks auto workspace routing until complete. |
| **Module** | `lib/phase1Onboarding.ts` |

---

## Phase 2 — Progressive Discovery

| Field | Detail |
|-------|--------|
| **Purpose** | Learn how the user works while helping — observe, confirm, adapt. |
| **Primary outcome** | Milestone: *"You understand how I work."* |
| **Activation** | `isPhase2DiscoveryActive()` — true when Phase 1 is complete. |
| **Status** | `active` |
| **Dependencies** | Phase 1 complete |
| **Intelligence evolution** | ADHD patterns, learning style, energy windows, goals, challenges, resource preferences. |
| **Module** | `lib/phase2ProgressiveDiscovery.ts` |

---

## Phase 3 — Adaptive Relationship Intelligence

| Field | Detail |
|-------|--------|
| **Purpose** | Learn patterns and anticipate needs. |
| **Primary outcome** | Milestone: *"You understand my patterns."* |
| **Activation** | ≥5 sessions **or** ≥14 days together; plus (≥1 strong ADHD/predictive pattern **or** learning-style confidence ≥0.4). |
| **Status** | `active` |
| **Dependencies** | Phase 1 complete; Phase 2 state |
| **Intelligence evolution** | Predictive patterns, user operating manual, milestone tracking (`understand_patterns`, `help_before_ask`). |
| **Module** | `lib/phase3AdaptiveRelationship.ts` |

---

## Phase 4 — Business Operating Partner

| Field | Detail |
|-------|--------|
| **Purpose** | Help run the business, not just hold conversations. |
| **Primary outcome** | Milestone: *"You help me run my business."* |
| **Activation** | Phase 3 active; business context present; ≥30 days **or** ≥12 sessions. |
| **Status** | `active` |
| **Dependencies** | Phases 1–3 |
| **Intelligence evolution** | Business health dashboard, opportunity detection, operating partner hints. |
| **Module** | `lib/phase4BusinessOperatingPartner.ts` |

---

## Phase 5 — Companion Intelligence Ecosystem

| Field | Detail |
|-------|--------|
| **Purpose** | Adaptive intelligence that evolves with the user over years. |
| **Primary outcome** | Milestone: *"You help me become the person I want to become."* |
| **Activation** | Phase 4 active; ≥90 days **or** ≥20 sessions. |
| **Status** | `active` |
| **Dependencies** | Phases 1–4 |
| **Intelligence evolution** | Personal operating manual, growth signals, wisdom insights (partial Phase 9), legacy checkpoints, predictive opportunities. |
| **Module** | `lib/phase5CompanionIntelligenceEcosystem.ts` |

---

## Phase 6 — Companion Intelligence Network

| Field | Detail |
|-------|--------|
| **Purpose** | Connected intelligence across the entire ecosystem. |
| **Primary outcome** | Milestone: *"Everything I need seems connected."* |
| **Activation** | Phase 5 active; companion knowledge graph ≥4 nodes. |
| **Status** | `active` |
| **Dependencies** | Phase 5 |
| **Intelligence evolution** | Knowledge graph of projects, templates, saved work; asset reuse and discovery offers. |
| **Module** | `lib/phase6CompanionIntelligenceNetwork.ts` |

---

## Phase 7 — Business Intelligence Ecosystem

| Field | Detail |
|-------|--------|
| **Purpose** | Understand the business as a living system. |
| **Primary outcome** | Milestone: *"This companion understands my business."* |
| **Activation** | Phase 6 active; business depth (role/sells/primary offer); business knowledge graph ≥3 nodes. |
| **Status** | `active` |
| **Dependencies** | Phase 6 |
| **Intelligence evolution** | Offer, content, revenue, visibility, sales intelligence; strategic focus; business-stage recommendations. |
| **Module** | `lib/businessIntelligenceEcosystem.ts` |

---

## Phase 8 — Autonomous Preparation

| Field | Detail |
|-------|--------|
| **Purpose** | Prepare before the user asks — user remains in control. |
| **Primary outcome** | Milestone: *"Work is ready when you arrive."* |
| **Activation** | Phase 7 active; ≥2 prepared kits with readiness ≠ `emerging`. |
| **Status** | `active` |
| **Dependencies** | Phase 7 |
| **Intelligence evolution** | Preparation kits (conversation, decision, launch, content, sales, re-entry, opportunity); business readiness. |
| **Module** | `lib/autonomousPreparation.ts` |
| **UI** | Chat hints, "Prepared For You" panel section |
| **Tests** | `AutonomousPreparationValidation.test.ts`, `companionRelationshipPhases.test.ts` |

---

## Phase 9 — Wisdom Intelligence

| Field | Detail |
|-------|--------|
| **Purpose** | Long-horizon wisdom — what actually works for this person. |
| **Primary outcome** | Milestone: *"Wisdom over time."* |
| **Activation** | Phase 7 active; ≥60 days or ≥15 sessions; ≥2 strong patterns; ≥3 wisdom items (≥1 growing+). |
| **Status** | `active` |
| **Dependencies** | Phase 7 (narrative after Phase 8 in roadmap; resolver checks 9 before 8) |
| **Intelligence evolution** | Lessons, patterns, traps, future-self guidance, hard-won strengths; merges Phase 5 wisdom signals. |
| **Module** | `lib/wisdomIntelligence.ts` |
| **UI** | Chat hints, "Personal Wisdom" panel section |
| **Tests** | `WisdomIntelligenceValidation.test.ts`, `companionRelationshipPhases.test.ts` |

---

## Phase 10 — Legacy & Transformation Intelligence

| Field | Detail |
|-------|--------|
| **Purpose** | Understand long-term change — transformation, not activity metrics. |
| **Primary outcome** | Milestone: *"I've changed more than I realized."* |
| **Activation** | Phase 7 active; ≥90 relationship days; origin goals; ≥2 then/now comparisons with evidence; ≥2 evidenced then/now; ≥1 pattern evolution; ≥1 strength; ≥1 business legacy item. |
| **Status** | `active` |
| **Dependencies** | Phase 7 (not Phase 9 in resolver) |
| **Intelligence evolution** | Origin snapshot, then/now, pattern evolution, strengths, confidence/business legacy, identity shifts, annual review. |
| **Module** | `lib/transformationIntelligence.ts` |

---

## Phase 11 — Ecosystem Intelligence

| Field | Detail |
|-------|--------|
| **Purpose** | Understand the whole life system — not just business. |
| **Primary outcome** | Milestone: *"This companion understands my life, not just my business."* |
| **Activation** | Phase 7 active; ≥4 life domains with state ≠ `emerging`; ≥2 interconnection chains. |
| **Status** | `active` |
| **Dependencies** | Phase 7 |
| **Intelligence evolution** | Life domains, capacity, energy, season, purpose, cross-domain insights; capacity-aware recommendations. |
| **Module** | `lib/ecosystemIntelligence.ts` |

---

## Phase resolution order

`getCurrentRelationshipPhase()` evaluates **highest applicable phase first**:

```
11 (Ecosystem) → 10 (Transformation) → 9 (Wisdom) → 8 (Autonomous Preparation)
→ 7 (Business) → 6 (Network) → 5 (Companion Ecosystem) → 4 → 3 → 2 → 1
```

When multiple phases qualify, the **highest** number wins (e.g. Phase 11 supersedes Phase 10). Narrative roadmap order is 1–11; resolver reflects maturity ceiling, not chronological step.

**ADR:** `docs/adr/ADR-011-relationship-phase-resolver-order.md`

---

## Intelligence stack evolution (summary)

```
Trust & context (1–2)
    → Patterns & anticipation (3)
        → Business partnership (4)
            → Long-horizon personal ecosystem (5)
                → Connected assets (6)
                    → Business as living system (7)
                        → [8: Prepare ahead] [9: Wisdom]
                            → Transformation narrative (10)
                                → Whole-life system (11)
```

---

## Tests

| Phase | Test file |
|-------|-----------|
| Registry / resolution | `lib/companionRelationshipPhases.test.ts` |
| 1 | `lib/phase1Onboarding.test.ts` |
| 2 | `lib/phase2ProgressiveDiscovery.test.ts` |
| 3 | `lib/phase3AdaptiveRelationship.test.ts` |
| 4 | `lib/phase4BusinessOperatingPartner.test.ts` |
| 5 | `lib/phase5CompanionIntelligenceEcosystem.test.ts` |
| 6 | `lib/phase6CompanionIntelligenceNetwork.test.ts` |
| 7 | `lib/BusinessIntelligenceValidation.test.ts` |
| 8 | `lib/AutonomousPreparationValidation.test.ts` |
| 9 | *None* |
| 10 | `lib/TransformationIntelligenceValidation.test.ts` |
| 11 | `lib/EcosystemIntelligenceValidation.test.ts` |
