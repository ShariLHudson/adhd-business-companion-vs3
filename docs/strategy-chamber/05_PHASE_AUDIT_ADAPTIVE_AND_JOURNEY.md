# Strategy Chamber — Phase Audit (Adaptive + Live Journey)

**Date:** 2026-07-23  
**Phase:** Re-audit after foundation; Adaptive Companion contract; live guided journey scope  
**Rule:** Reuse before inventing. Keep `strategy-library` / `playbook` ids.

## 1. Current state (post-foundation)

| Area | Status |
|------|--------|
| Member label Strategy Chamber | Live (Guidance, signpost, panels) |
| Opening: 3 cards + Help Me Choose | Live |
| How This Helps | Live |
| Browse library (secondary) | Live — catalog preserved |
| `strategy_work_item` local V1 | Live |
| Decision Record UI | Live (often sparse until journey fills fields) |
| Continue Your Journey UI | Live — nav open only |
| Five thinking stages | Typed; stage not advanced by conversation |
| Typed handoff contracts | Builders exist; not wired end-to-end |
| Contribution returns | Type only |
| Adaptive presentation | Not Strategy-connected (prefs fragmented elsewhere) |

## 2. Reused components

- `StrategiesPanel` estate opening + chamber-entry
- `lib/strategyChamber/*` work item, decision, journey, contracts
- `ContinueYourJourney` + `StrategyDecisionRecord`
- Catalog paths behind Browse / apply / guided create
- Support Style (`lib/supportStyle`) for choice count / pacing signals
- Experience Controls (`lib/estate/experienceControlPrefs`) for motion / text size / sensory soften
- Adaptive response modes (`lib/adaptive-companion`) — situational modes, not a second preference bag
- Support Style temporary override pattern for session/turn presentation overrides

## 3. Duplicates avoided

- No second ADHD / dyslexia / autism Strategy Chamber
- No parallel accessibility store beside Experience Controls
- No second response-mode engine beside `lib/adaptive-companion`
- No rename of `strategy-library` / `playbook`
- No giant universal untyped work table (keep strategy work item + links)

## 4. Architecture decisions

1. **Canonical Adaptive Companion Intelligence** lives in `lib/adaptiveCompanionIntelligence/` as a **presentation resolver** that *reads* existing preference sources and optional explicit presentation prefs.
2. Strategy Chamber is the **first complete consumer**; other destinations stay fixed until adopted.
3. Guided journey advances `currentStage` / fills work-item fields in-panel (one question at a time by default).
4. Handoffs require member click (approval). Payload + connection recorded; Talk It Out consumes pending context.
5. Incomplete destinations must not pretend full bidirectional sync.

## 5. Deferred

- Observation-based permanent preference inference
- Full Board briefing UI injection beyond source-context hooks
- Cloud persistence / sync / conflict handling
- Every strategy family / framework knowledge pack
- Execution Manager live path
- Automatic Business Estate / calendar / reminder writes

## 6. Safe to implement now

- Adaptive preference types + resolver + session overrides + docs
- Strategy guided stage questions + resume summary
- Wire Continue Your Journey → approved handoff store + Talk It Out intake
- Contribution-return helper + tests
- Platform intelligence rules doc that points at existing constitutions

## 7. Shared contracts required

- `AdaptivePresentationContext` for handoffs (not full preference profile copy)
- Pending handoff envelope in session storage
- Existing connection + approval fields on `StrategyConnection`
