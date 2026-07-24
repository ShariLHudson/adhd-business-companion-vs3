# Strategy Intelligence — Phase 4 Domain Intelligence

**Runtime:** `lib/strategyChamber/intelligence/strategyTypes/` · `domainIntelligence/`  
**Registry:** `listDomainIntelligenceModules()` · `resolveDomainForDecision()` · `getStrategyType()`  
**Engine:** same Phase 1–3 judgment pipeline — domains contribute knowledge, not a second engine

## Purpose

Instead of one generic strategy brain, Spark loads specialized domain intelligence based on what the member is trying to decide.

Same engine. Different knowledge.

## Domain modules (signature nine)

| Domain | StrategyTypeId | Core stance |
|--------|----------------|-------------|
| Pricing | `pricing` | Value before price; not only “raise it” |
| Growth | `growth` | Diagnose bottleneck; sometimes don’t grow yet |
| Offer | `offer` | Fit, simplify, retire, delivery burden |
| Market & Customer | `market_customer` | ICP, language, journey — not only awareness |
| Capacity & Focus | `capacity_focus` | Doing less; ADHD-aware open-loop reduction |
| Hiring & Delegation | `hiring_delegation` | Relief → simplify/automate → pilot → hire |
| Partnership | `partnership` | Pilot before commitment; exit paths |
| Pivot | `pivot_rethink` | Pivot is last resort; diagnose failure mode |
| Personal Direction | `personal_direction` | Seasons, pauses, energy fit, dignity |

Also registered (general shells): `business_direction`, `ninety_day`.

## What each domain contributes

- Signals (`entrySignals`)
- Questions (clarifying / current state / direction)
- Common assumptions
- Typical risks + common mistakes + warning signs
- Common experiments
- Trade-offs
- Capacity checks
- Recommended handoffs (Chamber / Board / destinations)
- Decision heuristics
- Problem distinctions (with preferred option patterns)

## Auto-load

1. Member language → `matchStrategyTypesFromText` / `resolveDomainForDecision`
2. `identifyStrategicQuestion` sets `strategyTypeId` + question type
3. `analyzeStrategyWorkItem` attaches `activeDomain` + `matchedProblemDistinction`
4. Options / risks / experiments / questions read from the loaded domain pack

## Partnership

New Phase 4 strategy type. Maps to `partnership_decision`. Prefer pilot / delay / decline-style paths before deep commitment.

## Strategic Memory (next milestone — not Phase 4)

Remembering past strategic reasoning (“last fall you decided not to raise price because…”) is **deferred**. Phase 4 only establishes domain packs and auto-load so future Strategic Memory can attach lessons to domains and decisions.

## Certification

- [ ] Nine signature domains registered with heuristics + distinctions
- [ ] Partnership type loads from partnership language
- [ ] Growth does not default to expand
- [ ] Pivot heuristics treat full pivot as last resort
- [ ] Capacity/Focus includes stop/simplify paths
- [ ] Hiring considers automate / simplify / contractor before hire
- [ ] `activeDomain` present on judgment turns when type resolves
- [ ] Phase 1–3 tests still pass (type count = 11)
