# Pricing Strategy Intelligence — Certification (Phase 4A)

**Suite:** `lib/strategyChamber/intelligence/domains/pricing/pricingStrategy.phase4a.test.ts`  
**Regression:** full `lib/strategyChamber` suite must stay green (Phase 3 baseline 105+)

## Scenario gates

| # | Scenario | Pass when |
|---|----------|-----------|
| 1 | Membership price increase | Explores what changed; distinguishes finance vs value/positioning; new vs existing; allows limited test; does not auto-recommend raise |
| 2 | Fear of churn | Classified as assumption/concern; not treated as evidence; evidence asked; new-customer test or tier considered |
| 3 | Weak conversion → lower price | Does not assume price is cause; explores positioning/fit/trust/audience/sales; lower price is one option, not default |
| 4 | Delivery burden | Distinguishes customer value from founder effort; scope/packaging/boundaries/delegation/price considered; capacity checked |
| 5 | New offer pricing | Clarifies outcome/audience/delivery/positioning/validation; no arbitrary formula; pilot/founding test allowed |
| 6 | Existing customers | Grandfather / staged / new-member / tier / notice considered; trust matters; no single automatic answer |
| 7 | Discount dependence | Feeling vs evidence; sales process and value communication examined; boundaries/packaging before another discount |

## Contract gates

- [ ] Pricing domain detection from pricing language  
- [ ] Surface vs underlying question recognition  
- [ ] Assumption handling (not treated as fact)  
- [ ] Price not assumed cause of weak sales  
- [ ] Customer value ≠ founder effort  
- [ ] Existing vs new customer effects  
- [ ] ≤3 initial options, meaningfully different  
- [ ] Maintain-current-price pattern available  
- [ ] Test-first pattern available  
- [ ] Customer trust + delivery capacity trade-offs  
- [ ] Proportionate risk + reversibility  
- [ ] Bounded experiments without Project creation  
- [ ] Recommendation ≠ decision  
- [ ] Routing boundaries for Finance, Marketing, Create, Projects, Board, Talk It Out, Calendar  
- [ ] `domainModel.ts` unions unchanged  

## Release note

Phase 4A certifies **Pricing only**. Growth and later domains are separate milestones.
