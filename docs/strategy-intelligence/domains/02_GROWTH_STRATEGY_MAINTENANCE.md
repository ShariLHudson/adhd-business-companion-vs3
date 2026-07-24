# Growth Strategy Intelligence — Maintenance (Phase 4C)

**Pack:** `lib/strategyChamber/intelligence/domains/growth/`  
**Docs:** `02_GROWTH_STRATEGY.md` · `02_GROWTH_STRATEGY_CERTIFICATION.md`

## Principles

1. **Deepen from evidence** — Rule of Three before prompt or heuristic changes.  
2. **No second engine** — all judgment flows through the shared Strategy Chamber engine.  
3. **Canonical unions stay frozen** — do not extend `Reversibility` or `OptionPatternId` for Growth convenience.  
4. **Presentation ≠ reasoning** — Adaptive Companion notes never reduce diagnosis quality.  
5. **Next domain is separate** — Offer Strategy is a later milestone. Do not start it from Growth maintenance.

## Where to edit

| Change | File |
|--------|------|
| Knowledge fields, heuristics, patterns, blueprints | `growthDomain.ts` |
| Contract shape | `growthDomainContract.ts` (version bump) |
| Surface→underlying, constraints, readiness, helpers | `growthIntelligence.ts` |
| Registry bridge | `toStrategyType.ts` · `strategyTypes/growth.ts` |
| Option candidate wiring | `engine/generateOptions.ts` (thin adapter only) |
| Scenarios | `growthStrategy.phase4c.test.ts` |

## Safe additions

- Heuristics tied to repeated live patterns  
- Experiment blueprints with full fields (including capacityLimit)  
- Routing boundary notes (still permission-based)  
- Constraint / growth-type detection cues  
- Evidence discipline reject rules  

## Unsafe additions

- A separate growth scoring engine  
- Auto-acquisition or auto-Marketing recommendations  
- Channel-tactic option sets (“post more on…”)  
- Auto-create Project / campaign from experiments  
- Loading all secondary domains at once  
- Changing canonical domain model unions  

## Versioning

- Contract `version: 2` = Phase 4C full knowledge  
- Bump version when required fields or semantics change; update certification + tests together  

## Remaining gaps (known, acceptable)

- Industry growth benchmarks intentionally absent  
- Detailed campaign design lives in Marketing  
- Detailed offer architecture lives in Offer Strategy (next milestone)  
- Detailed hiring design lives in Hiring and Delegation  
