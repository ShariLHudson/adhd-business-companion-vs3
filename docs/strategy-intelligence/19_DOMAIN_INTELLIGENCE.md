# Strategy Intelligence — Phase 4 Domain Intelligence

**Runtime:** `lib/strategyChamber/intelligence/strategyTypes/` · `domainIntelligence/`  
**Registry:** `DOMAIN_INTELLIGENCE_BUILD_ORDER` · `listDomainIntelligenceModules()` · `resolveDomainForDecision()`  
**Engine:** same Phase 1–3 judgment pipeline — domains contribute knowledge, not a second engine

## Purpose

Instead of one generic strategy brain, Spark loads specialized domain intelligence based on what the member is trying to decide.

Same engine. Different knowledge.

## Build order (canonical)

1. Pricing  
2. Growth  
3. Offer  
4. Customer and Market  
5. Capacity and Focus  
6. Hiring and Delegation  
7. Partnership  
8. Pivot or Rethink  
9. Personal Direction  
10. Business Direction  
11. 90-Day Strategy  

Runtime ids: `pricing` → `growth` → `offer` → `market_customer` → `capacity_focus` → `hiring_delegation` → `partnership` → `pivot_rethink` → `personal_direction` → `business_direction` → `ninety_day`

## What each domain contributes (binding checklist)

| Contribution | Contract field |
|--------------|----------------|
| Domain-specific entry signals | `entrySignals` |
| Hidden underlying questions | `hiddenUnderlyingQuestions` |
| Evidence needed | `evidencePrompts` |
| Common false assumptions | `commonAssumptions` |
| Option patterns | `optionPatterns` |
| Material trade-offs | `commonTradeoffs` |
| Risk patterns | `commonRisks` |
| Capacity checks | `capacityChecks` |
| Experiments | `experimentPatterns` |
| Recommendation rules | `recommendationRules` (+ structured `decisionHeuristics`) |
| Handoff boundaries | `handoffBoundaries` (+ `handoffDestinations`) |

Also present: problem distinctions, warning signs, common mistakes, guiding principles.

Accessor: `summarizeDomainContributions(domain)`.

## Auto-load

1. Member language → `matchStrategyTypesFromText` / `resolveDomainForDecision`  
2. `identifyStrategicQuestion` sets `strategyTypeId` + question type  
3. `analyzeStrategyWorkItem` attaches `activeDomain` + `matchedProblemDistinction`  
4. Clarifying turns may surface `hiddenUnderlyingQuestions`  
5. Option scoring respects `recommendationRules` (recommendation ≠ decision)  
6. Risks / experiments / trade-offs read from the loaded domain pack  

## Core stances (examples)

| Domain | Stance |
|--------|--------|
| Pricing | Value before price; not only “raise it” |
| Growth | Diagnose bottleneck; sometimes don’t grow yet |
| Offer | Fit, simplify, retire, delivery burden |
| Market & Customer | ICP, language, journey — not only awareness |
| Capacity & Focus | Doing less; ADHD-aware open-loop reduction |
| Hiring & Delegation | Relief → simplify/automate → pilot → hire |
| Partnership | Pilot before commitment; exit paths |
| Pivot | Last resort; diagnose failure mode first |
| Personal Direction | Seasons, pauses, energy fit, dignity |
| Business Direction | Name what you will not pursue |
| 90-Day | One outcome + explicit not-pursuing list |

## Strategic Memory (next milestone — not Phase 4)

Remembering past strategic reasoning across seasons is **deferred**. Phase 4 establishes domain packs and auto-load so future Strategic Memory can attach lessons to domains and decisions.

## Certification

- [x] Eleven domains in build order with full contribution checklist  
- [x] Partnership type loads from partnership language  
- [x] Growth does not default to expand  
- [x] Pivot heuristics treat full pivot as last resort  
- [x] Capacity/Focus includes stop/simplify paths  
- [x] Hiring considers automate / simplify / contractor before hire  
- [x] `activeDomain` present on judgment turns when type resolves  
- [x] Hidden questions + recommendation rules + handoff boundaries populated  
- [ ] Phase 1–3 tests still pass (type count = 11)  
