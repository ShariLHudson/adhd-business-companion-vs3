# Strategy Intelligence Phase 5 — Cross-Domain Synthesis Audit

**Branch:** `deploy/companion-app-v3`  
**Date:** 2026-07-23  
**Status:** Audit complete — synthesis layer additive on existing engine

## Verdict

Phase 4 Pricing and Growth domain packs and the Phase 1–3 shared judgment engine are in place. Cross-domain **synthesis was not implemented**. Secondary-domain helpers existed only for Growth and were **not wired** into the judgment turn. Phase 5 adds a thin synthesis layer — not a second engine, not a parallel registry.

## What already supports synthesis

| Capability | Status | Location |
|------------|--------|----------|
| Ranked multi-domain match | Partial — list unused for merge | `matchStrategyTypesFromText` / `matchDomainsForDecision` |
| Primary domain selection | Ready | `resolvePrimaryStrategyType` → `identifyStrategicQuestion` |
| Growth secondary suggestion | Partial — unwired | `suggestGrowthSecondaryDomain` |
| Domain contribution summary | Ready | `summarizeDomainContributions` |
| Shared judgment pipeline | Ready | `analyzeStrategyWorkItem` |
| Options / risks / experiments / recommendation | Ready | Phase 3 engine modules |
| Decision Record / handoff | Ready | `buildIntelligentDecisionRecord` / `recommendStrategicHandoff` |
| Adaptive Companion | Ready | presentation only |

## What can be reused

- Selection scoring and domain packs (Pricing, Growth, skeleton types)
- `summarizeDomainContributions` / `matchProblemDistinction`
- `pricingOptionPatterns` / `growthOptionPatterns` (bounded bias only)
- `StrategyJudgmentTurn` extension points (`activeDomain`, recommendation, options)
- Canonical unions: `StrategyTypeId`, `OptionPatternId`, `Reversibility` — **unchanged**

## Overlap and conflict surfaces

| Theme | Risk if naively merged |
|-------|------------------------|
| Retention / conversion | Both Pricing and Growth claim; need one binding constraint |
| Capacity + growth ask | Growth may expand while Capacity says stabilize |
| Revenue with volume | Growth must not default to more customers when Pricing is material |
| Single-winner registry | Pricing boost can steal primary from Growth without secondary |
| Handoff | Domain boundaries declarative only; synthesis must not auto-route |

## Smallest additive architecture

```
lib/strategyChamber/intelligence/synthesis/
  types.ts                      — contracts
  suggestSecondaryDomain.ts     — at most one secondary
  selectDomains.ts              — primary + optional secondary
  extractContributions.ts       — typed contributions from packs
  resolveConflicts.ts           — primary wins ties; conflict notes
  mergeContributions.ts         — dedupe + merge
  synthesizeStrategy.ts         — one coherent package
  synthesizeOptionCandidates.ts — bounded option bias
  index.ts
```

**Engine hooks (tiny):**
- `analyzeWorkItem.ts` — attach `domainSynthesis` / `secondaryDomain`
- `generateOptions.ts` — use synthesized candidate patterns when secondary present
- Optional recommendation bias from merged rules

**Must not:**
- Create a second judgment engine
- Load every related domain
- Expose “Pricing says…” / “Growth says…” in member copy
- Bypass readiness, confirmation, or Strategy Work Item
- Rename canonical domain-model unions

## Contract mapping to existing types

| Synthesis field | Existing type |
|-----------------|---------------|
| Domain ids | `StrategyTypeId` |
| Next thinking move | `NextThinkingMovePlan` |
| Options | `StrategicOption` |
| Risks | `RiskAssessment` (turn) / `StrategicRisk` (option) |
| Experiment | `StrategicExperiment` |
| Recommendation | `StrategicRecommendation` |
| Confidence | `MoveConfidence` (`low` \| `moderate` \| `high`) |

## Implementation order

1. Contracts + selection + secondary suggestion  
2. Contribution extract / merge / conflict resolution  
3. `synthesizeStrategy` + option-candidate helper  
4. Wire into `analyzeStrategyWorkItem` + `generateFullStrategicOptions`  
5. Tests for Pricing+Capacity, Growth+Pricing, Growth+Capacity, single-domain default  
6. Certification docs  

Offer / Hiring / Market packs remain skeleton contributors until their Phase 4 packs are completed — synthesis may still suggest them as secondary when language warrants.
