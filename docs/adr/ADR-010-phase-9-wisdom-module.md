# ADR-010: Create Relationship Phase 9 — Wisdom Intelligence™

**Status:** Accepted (implemented 2026-06-24)

## Context

Wisdom Intelligence was specified as Relationship Phase 9 but only partially existed inside `lib/phase5CompanionIntelligenceEcosystem.ts` (`wisdomInsights`, Wisdom Engine™ panel). There was no dedicated activation gate, observation loop, or chat integration. Wisdom could display under Phase 5 without evidence thresholds appropriate for long-horizon insight.

## Decision

Create `lib/wisdomIntelligence.ts` with conservative evidence gates:

- `isPhase9WisdomIntelligenceActive()` — requires Phase 7, meaningful history (≥60 days or ≥15 sessions), ≥2 strong patterns, ≥3 wisdom items with ≥1 growing+
- Turn observation merges Phase 5 wisdom signals, lessons, intervention effectiveness, and pattern wisdom
- Permission-based reflections via `maybeWisdomReflection()` — practical tone, no architecture exposure
- Chat hints, panel section ("Personal Wisdom"), and resolver integration
- Phase 5 Wisdom Engine panel hidden when Phase 9 is active to avoid duplicate surfaces
- Validation suite: `lib/WisdomIntelligenceValidation.test.ts`

## Consequences

- Wisdom elevates out of Phase 5-only display when evidence warrants
- Weak or single-conversation data returns inactive — no fabricated certainty
- User-facing copy stays human and practical; no "Phase 9" or "Wisdom Intelligence" labels in UI

## Files changed

- `lib/wisdomIntelligence.ts` (new)
- `lib/WisdomIntelligenceValidation.test.ts` (new)
- `lib/companionRelationshipPhases.ts`
- `app/companion/CompanionPageClient.tsx`
- `components/companion/GettingToKnowYouPanel.tsx`
- `lib/companionRelationshipPhases.test.ts`
- `docs/relationship-phases/Phase-09-Wisdom-Intelligence.md`
- `docs/relationship-phases/README.md`
- `docs/relationship-phases/Relationship-Phase-Roadmap.md`
- `docs/relationship-phases/RELATIONSHIP-PHASE-CONSTITUTION.md`
