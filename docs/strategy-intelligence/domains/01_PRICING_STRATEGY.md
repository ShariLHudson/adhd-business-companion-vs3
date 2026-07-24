# Pricing Strategy Intelligence — Domain Pack (Phase 4A)

**Runtime:** `lib/strategyChamber/intelligence/domains/pricing/`  
**Registry bridge:** `strategyTypes/pricing.ts` → shared `StrategyTypeContract`  
**Engine:** Phase 1–3 judgment pipeline (no separate pricing engine)  
**Canonical model:** `lib/strategyChamber/domainModel.ts` — unchanged

## Scope

Help members decide whether and how to:

- Raise, lower, or maintain price  
- Restructure packaging / tiers  
- Move between monthly and annual  
- Price new offers  
- Treat new vs existing customers differently  
- Reduce discount dependence  
- Test before full implementation  

Does **not** assume higher price is always better. Distinguishes pricing from value, positioning, fit, awareness, conversion, retention, delivery, capacity, cash pressure, offer complexity, and discount dependence.

## Ownership

Pricing Strategy owns the **strategic pricing decision**. After direction is clear, route to:

| Destination | When |
|-------------|------|
| Finance / Business Estate | Cost, margin, cash-flow, forecast detail |
| Marketing | Pricing communication and positioning assets |
| Create | Pricing pages, notices, scripts, offer documents |
| Projects | Coordinated implementation |
| Calendar | Transition and review dates |
| Board | High-impact or difficult-to-reverse changes |
| Talk It Out | Fear or identity conflict blocking judgment |

## Signals

Entry language: price, pricing, raise/lower fee, membership price, discount, premium, tier, bundle, grandfather, annual/monthly, underpriced/overpriced, charge more/less.

## Hidden / underlying questions

Surface: “Should I raise my price?” may mean underpricing, unsustainable economics, value increase, delivery burden, wrong audience, package too broad, need fewer better-fit customers, positioning solved by price, tier vs base change, new-customer-only change, or insufficient evidence to change anything.

## Evidence discipline

Ask only context that could change the decision (current price, what changed, demand, retention, capacity, new vs existing, discounts). Never a long intake form. Do not invent market evidence.

## Assumptions (examples)

Customers will leave · lower price creates sales · competitors set the price · more features justify higher price · higher price fixes profitability · existing must match new · discounts are required · audience cannot afford · price is why conversion is weak · higher price must mean more founder work.

Treat as assumptions until supported.

## Option patterns

At most three meaningfully different initial options. Prefer patterns such as: maintain · new customers only · staged raise · premium tier · simplify and hold · increase value first · restructure packaging · replace discounts with boundaries · limited test · annual option · delay until a condition. Never three percentage variants.

## Trade-offs

Select dimensions that matter: revenue, profit, trust, acquisition, retention, capacity, expectations, accessibility, positioning, complexity, energy, support burden, cash timing, flexibility, implementation difficulty.

## Risks

Material risks only, calm language: confusion, churn, weak value communication, raised expectations, complexity, discount exceptions, existing-customer resentment, thin evidence, unsustainably low, too high for positioning, delaying a needed change.

## Reversibility

Distinguish new-customer tests and pilots (often easily reversible) from existing-member and public repositioning changes (deeper review).

## Experiments

Bounded tests with assumption, action, scope, duration/review, evidence, success signal, stop signal, decision that follows. **Never** auto-create a Project.

## Quality rules

Reject guidance that assumes higher is always better, uses only competitor pricing, equates founder effort with customer value, ignores customer impact or capacity, invents evidence, auto-recommends discounts, bypasses option readiness, or marks a recommendation as confirmed.

## Maintenance

Deepen this pack from live Pricing conversations. Do not grow into a second engine. Next domain after certification: Growth Strategy (separate milestone).
