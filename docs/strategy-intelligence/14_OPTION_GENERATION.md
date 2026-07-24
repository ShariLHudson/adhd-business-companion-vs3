# Option Generation

**Runtime:** `generateOptions.ts` · `optionCatalog.ts` · `validateOptionDiversity.ts` · `patternLabels.ts`  
**Contracts:** `optionContract.ts` (`StrategicOption`) · `types.ts` (`OptionPatternId`)  
**Gate:** `assessOptionReadiness.ts` (authoritative)

## Principle

Present fewer options, but make each one meaningfully different, honest about trade-offs, and connected to a realistic next step.

## Contract

`StrategicOption` extends persisted `StrategyOption` with:

- summary, rationale, optionPattern (internal)
- benefits, tradeoffs, risksDetailed, assumptions
- capacityRequirements, opportunityCosts, reversibility
- protects / delaysOrPrevents, experiment, confidence
- possibleNextDestination (recommend only — never auto-transfer)

Member-facing titles come from warm language. **Never expose `OptionPatternId` values in UI copy** (`optionPatternMemberLabel`).

## Patterns (internal)

Canonical patterns include continue, improve, narrow, simplify, expand, test, delay, pause, stop, stabilize, partner, delegate, automate, protect_current_base, serve_different_audience, staged_transition, increase_price, restructure_price, add_value, and related forms.

Legacy aliases (`raise_price`, `raise_value`, `protect_base`, `different_market`) normalize to canonical ids.

## Generation rules

- At most **three** initial options
- Each must answer the strategic question, fit goals/constraints/capacity, avoid invented facts
- Surface primary trade-off, key assumption, reversibility, smallest useful test when relevant
- Reject cosmetic variants, execution steps, growth-as-default, capacity-blind paths, duplicates of rejected options

## Readiness

Do **not** generate when readiness is `too_early` or `needs_*`.  
Light path: easily reversible experiments may proceed with less information.  
Do not bypass readiness merely because the member asks “What should I do?”

## Valid non-expansion paths

Waiting, simplifying, stopping, keeping the current direction, staging, and protecting what works remain valid when they fit.
