# Strategy Chamber — Strategy Intelligence Phase 1

**Runtime:** `lib/strategyChamber/intelligence/`  
**Domain model:** `lib/strategyChamber/domainModel.ts`  
**Consumers:** `conversationGuidance`, `answerIntake`, `guidedJourney`, `continueYourJourney`, `StrategyChamberConversation`

## Naming boundary

| Module | Role |
|--------|------|
| `lib/strategyChamber/domainModel.ts` | Canonical Strategy Domain Model — shared vocabulary |
| `lib/strategyChamber/intelligence/` | Chamber **judgment** — questions, options, risk, readiness, handoffs |
| `lib/strategyIntelligence.ts` | Catalog **discoverability** — ADHD/business strategy search (unchanged) |

Do not create a folder at `lib/strategyIntelligence/` — it would collide with the catalog file import path.

## Strategy Domain Model

```
StrategicQuestion
  → StrategicJudgmentStage
  → StrategicInputClassification
  → EvidenceStrength
  → DecisionReadiness
  → StrategicDecision
  → HandoffContext
```

Every strategy type (Business, Pricing, Growth, Personal, etc.) uses this model. No parallel vocabularies.

## Judgment stages (backbone)

Not a forced wizard. Conversations progress through:

1. Clarify Question  
2. Understand Reality  
3. Gather Evidence  
4. Surface Assumptions  
5. Explore Options  
6. Evaluate Tradeoffs  
7. Choose Direction  
8. Test Confidence  
9. Prepare Handoff  
10. Review Results  

Runtime ids: `clarify_question` → `understand_reality` → `gather_evidence` → `surface_assumptions` → `explore_options` → `evaluate_tradeoffs` → `choose_direction` → `test_confidence` → `prepare_handoff` → `review_results`

Question priority 1–9 selects the next helpful turn within this backbone.

## Decision readiness

Readiness names what is blocking a good decision (or that judgment is complete):

- Problem Not Yet Clear  
- Reality Not Yet Understood  
- More Options Needed  
- Tradeoffs Not Evaluated  
- Risks Not Reviewed  
- Ready for Decision  
- Ready for Handoff  
- Decision Complete  

## Reversibility (canonical)

Used by risk assessment across Chamber:

Easily Reversible · Moderately Reversible · Difficult to Reverse · Effectively Irreversible

## Ownership

- Strategy Work Item store remains source of truth
- Intelligence is pure analysis (no second store, no Adaptive preference store)
- Adaptive Companion shapes presentation only (choice count, pacing, comparison style)

## Phase 1 strategy types

Business Direction · Growth · Pricing · Offer · Market/Customer · Capacity/Focus · Hiring/Delegation · Personal Direction · Pivot/Rethink · 90-Day

## Certification checklist

- [ ] One primary question per turn
- [ ] Opening statement is not copied into current reality
- [ ] Decision Record hidden until meaningful depth
- [ ] ≤3 meaningfully different options
- [ ] Growth is not the default conclusion
- [ ] “I don’t know” softens instead of repeating
- [ ] Continue Your Journey uses intelligence handoff when available
- [ ] Catalog `strategyIntelligence.ts` still resolves for StrategiesPanel search
- [ ] Stage / readiness / reversibility / input classification use domain model only

## Deferred

Chamber member knowledge pack · Board briefing UI injection · catalog rename · cloud sync · every strategy type beyond the ten
