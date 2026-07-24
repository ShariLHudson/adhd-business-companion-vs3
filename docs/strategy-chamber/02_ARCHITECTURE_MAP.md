# Strategy Chamber — Architecture Map

## Current → updated components

| Current | Updated role |
|---------|----------------|
| `strategy-library` destination | Keep id; label **Strategy Chamber** |
| `playbook` AppSection | Keep id (compat); display name Strategy Chamber |
| `StrategiesPanel` | Opening becomes Strategy Chamber entrance; library hubs progressive |
| `StrategyLibraryEstatePanel` | Estate shell for Strategy Chamber |
| `lib/strategyLibrary/estateCopy.ts` | Chamber titles, How This Helps, entry cards |
| `lib/strategyChamber/*` **(new)** | Work item, stages, families, decision record, journey, contracts |
| `ContinueYourJourney` **(new)** | Shared next-step recommendations (≤1 primary + ≤2 secondary) |
| `strategyConnections.ts` | Keep; journey component recommends before connecting |
| Catalog / apply / guided create | Retain behind entry paths |

## Data entities

```
strategy_work_item          — one shared strategic work record per conversation/thread
strategy_connections        — links to Chamber, Board, Create, Projects, etc.
userStrategies (legacy)     — saved catalog strategies; linked, not duplicated
```

## Routes / state

```
Guidance → strategy-library → openStrategyLibraryCore → playbook
  → StrategyLibraryEstatePanel → StrategiesPanel (estate)
      → entry choice → create/update strategy_work_item
      → existing views (recommended | new | saved | strategy detail)
```

## Source-of-truth ownership

| Concern | Owner |
|---------|--------|
| Strategic question, options, chosen direction, rationale | Strategy Chamber (`strategy_work_item`) |
| Finished creative assets | Create |
| Project execution | Projects |
| Board contributions | Board session |
| Talk It Out reflection | Talk It Out session |
| Calendar events / PMD / Rhythms | Their stores (after approval) |
| Business Estate profile | Business Estate (after approval) |

## Handoff flow

```
Strategy Chamber decision clear
  → ContinueYourJourney (1 recommended + ≤2 options)
  → member chooses
  → connection contract builds payload
  → destination opens with context
  → contribution summary returns to strategy_connections
  → strategy_work_item updated (never duplicated)
```

## Judgment stages (Strategy Domain Model)

| Stage id | User language |
|----------|----------------|
| `clarify_question` | Clarify Question |
| `understand_reality` | Understand Reality |
| `gather_evidence` | Gather Evidence |
| `surface_assumptions` | Surface Assumptions |
| `explore_options` | Explore Options |
| `evaluate_tradeoffs` | Evaluate Tradeoffs |
| `choose_direction` | Choose Direction |
| `test_confidence` | Test Confidence |
| `prepare_handoff` | Prepare Handoff |
| `review_results` | Review Results |

Not forced as a wizard. Progress when useful. Canonical types: `lib/strategyChamber/domainModel.ts`.
