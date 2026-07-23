# Strategy Chamber — Strategy Intelligence Phase 1

**Runtime:** `lib/strategyChamber/intelligence/`  
**Consumers:** `conversationGuidance`, `answerIntake`, `guidedJourney`, `continueYourJourney`, `StrategyChamberConversation`

## Naming boundary

| Module | Role |
|--------|------|
| `lib/strategyChamber/intelligence/` | Chamber **judgment** — questions, options, risk, readiness, handoffs |
| `lib/strategyIntelligence.ts` | Catalog **discoverability** — ADHD/business strategy search (unchanged) |

Do not create a folder at `lib/strategyIntelligence/` — it would collide with the catalog file import path.

## Ownership

- Strategy Work Item store remains source of truth
- Intelligence is pure analysis (no second store, no Adaptive preference store)
- Adaptive Companion shapes presentation only (choice count, pacing, comparison style)

## Stages (internal)

`understand_current_state` → `choose_direction` → `explore_options` → `evaluate_decision` → `handoff_direction`

Not a forced wizard. Question priority 1–9 selects the next helpful turn.

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

## Deferred

Chamber member knowledge pack · Board briefing UI injection · catalog rename · cloud sync · every strategy type beyond the ten
