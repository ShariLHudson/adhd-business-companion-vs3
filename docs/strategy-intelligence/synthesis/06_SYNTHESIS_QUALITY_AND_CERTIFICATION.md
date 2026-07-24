# Synthesis Quality and Certification

## Ready when the engine can

1. Identify one central domain  
2. Load one supporting domain only when it matters  
3. Combine expertise without visible complexity  
4. Remove duplicates  
5. Recognize legitimate conflicts  
6. Resolve using evidence, constraints, capacity, reversibility, and user priorities  
7. Produce one coherent strategic question  
8. Produce one next thinking gap  
9. Generate ≤3 integrated option patterns (engine finalizes options)  
10. Provide one unified recommendation  
11. Preserve epistemic safety and user confirmation  
12. Preserve Strategy Work Item as source of truth  
13. Preserve Shari’s warm voice  

## Test coverage

`lib/strategyChamber/intelligence/synthesis/strategySynthesis.phase5.test.ts`

Scenarios A–J: Pricing+Capacity, Growth+Pricing, Growth+Capacity, Growth+Market, Offer+Market, Hiring+Capacity, no secondary, low confidence, conflict, unified recommendation.

Also: budgets, dedupe, pair registry, domainModel regression, recommendation ≠ decision.

## Regression gate

- Phase 2 / Phase 3 Strategy tests green  
- Pricing 4B and Growth 4C green  
- Canonical `domainModel.ts` unions unchanged  
- Option readiness and next-thinking-move remain authoritative  

## Voice gate

Member-facing copy must pass the Shari test. Fail on module language, score talk, or multi-agent framing.
