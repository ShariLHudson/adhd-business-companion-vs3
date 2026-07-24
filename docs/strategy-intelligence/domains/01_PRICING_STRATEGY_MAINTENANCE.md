# Pricing Strategy Intelligence — Maintenance (Phase 4B)

**Pack:** `lib/strategyChamber/intelligence/domains/pricing/`  
**Docs:** `01_PRICING_STRATEGY.md` · `01_PRICING_STRATEGY_CERTIFICATION.md`

## Principles

1. **Deepen from evidence** — evolve this pack from live Pricing conversations (Rule of Three). Do not change prompts from a single talk.  
2. **No second engine** — all judgment flows through the shared Strategy Chamber engine.  
3. **Canonical unions stay frozen** — do not extend `Reversibility`, `OptionPatternId`, or `domainModel` for Pricing convenience.  
4. **Presentation ≠ reasoning** — Adaptive Companion notes may change how options are shown, never the quality of diagnosis.  
5. **Next domain is separate** — Growth Strategy is a later milestone. Do not start it from Pricing maintenance.

## Where to edit

| Change | File |
|--------|------|
| Knowledge fields, heuristics, patterns, blueprints | `pricingDomain.ts` |
| Contract shape | `pricingDomainContract.ts` (version bump + migration notes) |
| Surface→underlying, evidence, offer shape helpers | `pricingIntelligence.ts` |
| Registry bridge | `toStrategyType.ts` · `strategyTypes/pricing.ts` |
| Scenarios | `pricingStrategy.phase4b.test.ts` |
| Member-facing doc | `01_PRICING_STRATEGY.md` |

## Safe additions

- New heuristics tied to repeated live patterns  
- New experiment blueprints with full fields  
- New routing boundary notes (still permission-based)  
- Offer-shape detection cues  
- Evidence discipline reject rules  

## Unsafe additions

- A separate pricing scoring/engine module  
- Auto-raise / auto-lower recommendations  
- Arbitrary pricing formulas as certainty  
- Competitor price as proof  
- Auto-create Project / Calendar / Create from experiments  
- Cosmetic option sets (percentage ladders)  
- Changing canonical domain model unions  

## Versioning

- Contract `version: 2` = Phase 4B full knowledge  
- Bump version when required fields or semantics change; update certification checklist and Phase 4B tests in the same change  

## Review cadence

- After any Pricing failure in Observation Mode → log Learning Log; do not patch until Rule of Three  
- After certification regressions → fix pack or helpers; keep Phase 4A suite green  
- Quarterly: skim success/stop/review triggers against live membership and service pricing talks  

## Remaining gaps (known, acceptable)

- Outcome-based pricing nuance is advisory only (never “always best”)  
- Industry-specific benchmarks are intentionally absent (would invent evidence)  
- Marketing copy templates live in Create, not here  
- Detailed margin models live in Finance, not here  
