# Growth Strategy Intelligence — Certification (Phase 4C)

**Suite:** `lib/strategyChamber/intelligence/domains/growth/growthStrategy.phase4c.test.ts`  
**Regression:** Pricing Phase 4A/4B + Strategy Chamber suite must stay green.

## Certification criteria

Growth Strategy is certified only when it can:

1. Identify the type of growth actually needed  
2. Distinguish growth symptoms from constraints  
3. Recognize when acquisition is not the issue  
4. Assess readiness and capacity  
5. Consider retention, price, focus, offers, and delivery  
6. Generate meaningfully different growth paths (≤3)  
7. Support stabilization and maintaining current size  
8. Avoid defaulting to marketing tactics  
9. Identify healthy versus harmful growth  
10. Design bounded tests  
11. Preserve user agency  
12. Recommend without claiming the decision  
13. Route execution appropriately (no auto-route)

## Scenario gates (A–L)

| # | Scenario | Pass when |
|---|----------|-----------|
| A | I need more customers | Not auto-acquisition; capacity considered; no auto Marketing |
| B | I need more revenue | Volume vs price/retention/value; Pricing secondary possible |
| C | Stopped growing | Plateau/capacity/offer considered; no immediate pivot |
| D | Three new offers | Focus + maintenance; simplify/narrow |
| E | Lots of inquiries, cannot keep up | Capacity constraint; no more acquisition |
| F | Plenty of customers, low revenue | Not more customers by default |
| G | Expand into another market | Pilot / evidence / reversibility |
| H | Grow fast | Clarify why; readiness; no moralizing |
| I | Do not want bigger / feel I should | Maintain size valid |
| J | Hire before grow | Simplify/delegate/test; Hiring secondary |
| K | Customers do not stay | Retention before acquisition |
| L | Social growing, business not | Engagement ≠ buying proof |

## Contract gates

- [x] Growth domain contract v2 complete  
- [x] Domain detection from growth language  
- [x] Growth type identification  
- [x] Surface vs underlying questions  
- [x] Primary constraint selection  
- [x] No automatic acquisition recommendation  
- [x] No automatic Marketing handoff  
- [x] Growth readiness hints  
- [x] Capacity-aware options  
- [x] Maintain-current-size / stabilize-first / retention-first  
- [x] Pricing / Offer / Capacity as selective secondary domains  
- [x] ≤3 meaningfully different options  
- [x] Opportunity cost prompts  
- [x] Proportionate risk + reversibility  
- [x] Bounded experiment blueprints  
- [x] Revenue not sole success; social not buying proof  
- [x] Recommendation ≠ decision  
- [x] Adaptive Companion presentation-only  
- [x] `domainModel.ts` unions unchanged  

## Release note

Phase 4C certifies **full Growth Strategy knowledge** on the existing Strategy Chamber architecture. Offer Strategy and later domains are separate milestones — do not begin automatically.
