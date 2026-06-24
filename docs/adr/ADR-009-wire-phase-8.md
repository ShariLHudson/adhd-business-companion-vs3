# ADR-009: Wire Relationship Phase 8 — Autonomous Preparation™

**Status:** Accepted (implemented 2026-06-24)

## Context

`lib/autonomousPreparation.ts` was fully implemented with validation tests but was not integrated into the companion turn loop, chat hints, Getting To Know You panel, or `getCurrentRelationshipPhase()`. Registry marked Phase 8 as `future` despite module completion. Users could qualify for preparation kits without the resolver reflecting Phase 8.

## Decision

Wire Autonomous Preparation using the same pattern as Phases 7, 10, and 11:

- Set registry `status` to `active` in `lib/companionRelationshipPhases.ts`
- Insert `isPhase8AutonomousPreparationActive()` into `getCurrentRelationshipPhase()` after Phase 9 check and before Phase 7
- In `CompanionPageClient.tsx`: `observeAutonomousPreparationTurn`, `maybeAutonomousPreparationOffer`, `recordPreparationOfferShown`, `phase8AutonomousPreparationHintForChat`
- In `GettingToKnowYouPanel.tsx`: "Prepared For You" section via `formatPreparedWorkspaceForPanel()` when Phase 8 active
- Preparation remains permission-based — no auto-execution

## Consequences

- Phase 8 resolves when Phase 7 is active and ≥2 non-emerging prepared kits exist
- Chat hints stack after Phase 7 and before Phase 9
- Panel shows preparation workspace when active
- Phase 8 can supersede Phase 7 in resolver display (highest qualifying phase wins)

## Files changed

- `lib/companionRelationshipPhases.ts`
- `app/companion/CompanionPageClient.tsx`
- `components/companion/GettingToKnowYouPanel.tsx`
- `lib/companionRelationshipPhases.test.ts`
- `docs/relationship-phases/Phase-08-Autonomous-Preparation.md`
- `docs/relationship-phases/README.md`
- `docs/relationship-phases/Relationship-Phase-Roadmap.md`
- `docs/relationship-phases/RELATIONSHIP-PHASE-CONSTITUTION.md`
