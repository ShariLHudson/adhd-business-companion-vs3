# Strategy Chamber — Connection Contracts

**Runtime:** `lib/strategyChamber/connectionContracts.ts`  
**Rule:** Strategy Chamber owns the decision record. Destinations contribute with approval. Never mint a second `strategy_work_item`.

| Destination | Contract type | Approval required |
|-------------|---------------|-------------------|
| Chamber | `ChamberStrategyBrief` → `StrategyContributionReturn` | Yes before opening with context |
| Board | `BoardStrategyBriefing` → contribution return | Yes |
| Talk It Out | `TalkItOutStrategyContext` | Soft offer; no force-route |
| Create | `CreateStrategyHandoff` | Yes before creating asset |
| Projects | `ProjectStrategyHandoff` | Yes; never silent new project |
| Execution Manager | `ExecutionManagerHandoff` | Yes |
| Calendar | `CalendarStrategyHandoff` | Yes — no auto events |
| Plan My Day | `PlanMyDayStrategyHandoff` (few actions) | Yes |
| Rhythms / Reminders | `RhythmReminderHandoff` | Yes |
| Journal / Evidence | `JournalEvidenceHandoff` | Yes |
| Business Estate | `BusinessEstateProposedUpdate` (`applyWithoutApproval: false`) | Always |
| Celebration | `CelebrationHandoff` (`optional: true`) | Preference-aware |

`assertApproved({ memberApproved: true })` must pass before mutating another destination.
