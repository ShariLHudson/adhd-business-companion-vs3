# Pricing Strategy Intelligence — Certification (Phase 4B)

**Suites:**  
- `lib/strategyChamber/intelligence/domains/pricing/pricingStrategy.phase4a.test.ts` (baseline)  
- `lib/strategyChamber/intelligence/domains/pricing/pricingStrategy.phase4b.test.ts` (full knowledge)  

**Regression:** full `lib/strategyChamber` suite must stay green.

## Certification criteria

Pricing Strategy is certified only when it can:

1. Identify when price is not the actual problem  
2. Distinguish value, positioning, scope, and sustainability  
3. Handle new and existing customers differently  
4. Surface assumptions safely  
5. Generate meaningfully different options (≤3)  
6. Include maintain-current-price as valid  
7. Evaluate trust and capacity  
8. Recommend testing when appropriate  
9. Avoid arbitrary formulas  
10. Avoid copying competitors as proof  
11. Preserve user agency  
12. Create a useful Decision Record path via shared engine  
13. Route detailed implementation appropriately (no auto-route)

## Scenario gates (A–L)

| # | Scenario | Pass when |
|---|----------|-----------|
| A | Should I raise membership price? | Domain detected; hidden questions; no auto-raise; maintain/test available |
| B | Members will leave if I charge more | Assumption/concern — not evidence; protect/test/staged paths |
| C | Not buying → lower price | Price not assumed cause; value/fit/audience explored |
| D | Doing too much for what I charge | Effort ≠ value; scope/simplify/test considered |
| E | What to charge for a new program | No formula certainty; pilot/test/delay allowed |
| F | Raise without upsetting current members | New vs existing / grandfather / tier paths |
| G | Always have to discount | Not auto-recommend discount; discount-removal experiment available |
| H | Competitor charges half | Observation not proof; comparable-offer questions |
| I | Add a premium tier | Meaningful differentiation; reject cosmetic % options |
| J | Hourly → packages | Structure options present |
| K | Offer annual pricing | Annual-option experiment; not forced |
| L | Underpriced, weak evidence | Maintain + test + delay valid |

## Contract gates

- [x] Pricing domain contract v2 complete (`useWhen` … `maintenanceNotes`)  
- [x] Pricing domain detection from pricing language  
- [x] Surface vs underlying question recognition  
- [x] Assumption handling (not treated as fact)  
- [x] Price not assumed cause of weak sales  
- [x] Customer value ≠ founder effort  
- [x] Competitor price not treated as proof  
- [x] Existing vs new customer effects  
- [x] ≤3 initial options, meaningfully different  
- [x] Maintain-current-price pattern available  
- [x] Test-first pattern available  
- [x] Customer trust + delivery capacity trade-offs  
- [x] Proportionate risk + reversibility (canonical union)  
- [x] Bounded experiment blueprints without Project creation  
- [x] Recommendation ≠ decision  
- [x] Routing boundaries for Finance, Marketing, Create, Projects, Board, Talk It Out, Calendar  
- [x] Adaptive Companion presentation-only notes  
- [x] `domainModel.ts` unions unchanged  

## Release note

Phase 4B certifies **full Pricing Strategy knowledge** on the existing Strategy Chamber architecture. Growth and later domains are separate milestones — do not begin automatically.
