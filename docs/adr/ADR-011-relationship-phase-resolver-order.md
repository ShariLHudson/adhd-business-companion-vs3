# ADR-011: Relationship Phase Resolver Order (Phases 8–9)

**Status:** Accepted (implemented 2026-06-24)

## Context

`getCurrentRelationshipPhase()` previously evaluated `11 → 10 → 7 → 6 → …`, permanently skipping Phases 8 and 9 even when their activation gates were met. Narrative roadmap order is 1 → 2 → … → 11, but the resolver intentionally returns the **highest** qualifying phase when multiple gates are true.

## Decision

Update resolver to consult all eleven phases in descending order:

```
11 (Ecosystem) → 10 (Transformation) → 9 (Wisdom) → 8 (Autonomous Preparation)
→ 7 (Business) → 6 (Network) → 5 (Companion Ecosystem) → 4 → 3 → 2 → 1
```

**Semantics:**

- When Phases 8–11 all qualify, Phase 11 wins (whole-life supersedes transformation, wisdom, and preparation)
- Phases 8 and 9 are no longer skipped when gates are met
- Lower phases remain reachable in tests via isolated fixtures or gate-specific mocks where higher phases would otherwise dominate

## Consequences

- Resolver aligns with roadmap numbering; no permanent 7 → 10 jump
- Phase 10 and Phase 11 tests may need fixture isolation when both could qualify (e.g. mock Phase 11 inactive when testing Phase 10 resolver)
- `companionRelationshipPhases.test.ts` covers resolver returns for Phases 8, 9, 10, and 11

## Files changed

- `lib/companionRelationshipPhases.ts`
- `lib/companionRelationshipPhases.test.ts`
- `docs/relationship-phases/Relationship-Phase-Roadmap.md`
- `docs/relationship-phases/README.md`
- `docs/relationship-phases/RELATIONSHIP-PHASE-CONSTITUTION.md`
