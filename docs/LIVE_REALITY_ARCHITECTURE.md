# Live Reality Architecture (Part 15)
## Dynamic Day Adaptation — Canonical Source of Truth

**Status:** Foundation implemented  
**Parent:** `LIVE_REALITY_ECOSYSTEM.md` · `DAILY_COMPANION_CYCLE_ARCHITECTURE.md` · `COMPANION_JOURNEY_EXPERIENCE_BIBLE.md`

---

## Core Principle

The morning plan is a **starting point**. Never a commitment.

Life changes. Energy changes. The Companion Brain continuously reasons from **current reality**.

---

## Architectural Rule

```
Reality signals → Companion Brain → Live judgment → All workspaces
```

| Layer | Location | Role |
|-------|----------|------|
| Reality inputs | Shape Today, plan items, focus, captures, … | User updates reality once |
| Brain | `lib/companionBrain/` | Single source of judgment |
| Live client | `lib/companionJudgmentClient/` | Re-evaluate, store, broadcast |
| Experiences | Plan My Day, Projects, Focus, … | Consume judgment; never reason |

**Shape Today is not a separate feature.** It is an input into the Companion Brain.

---

## Live Ecosystem Flow

1. User updates reality (e.g. Shape Today save → `saveDayState`)
2. `COMPANION_REALITY_UPDATED` event fires
3. `reEvaluateLiveJudgment()` gathers ecosystem memory and runs reasoning cycle
4. `COMPANION_JUDGMENT_UPDATED` broadcasts new judgment
5. Workspaces subscribed via `useLiveCompanionJudgment()` adapt automatically

No manual synchronization. No "also update Plan My Day."

---

## Reality Signal Sources (extensible)

| Source | Kind | Trigger |
|--------|------|---------|
| `shape-today` | `day-state` | `saveDayState()` |
| `clear-my-mind` | `capture` | Reality-relevant captures (`maybePublishCaptureReality`) |
| `my-thoughts` | `capture` | Future: thought captures |
| `plan-my-day` | `plan-items` | Future: plan mutations |
| `focus` | `focus-session` | Future: focus changes |
| `health`, `family`, `business`, `mood`, `capacity` | `generic` | Future signals |
| `unexpected-event` | `generic` | Future |

---

## Adaptation Communication

When meaningful shift detected (`detectMeaningfulShift`):

- Natural Shari language via `formatAdaptationMessage()`
- Never: "Plan Updated." / "Task Due." / "Incomplete."

Examples:
- *"I think today needs a little more breathing room."*
- *"I've moved a few things so you don't have to."*

---

## Preserve Agency

The companion may:
- Suggest
- Reorganize (e.g. park excess items — companion holds complexity)
- Simplify

The companion may **never** silently change:
- Goals
- Commitments
- Deadlines
- Promises

---

## Learning (Founder Intelligence)

`emitLiveAdaptationSignals()` records that **life changed** — not that plans failed.

Signals feed the Living Intelligence Graph for:
- Energy → planning patterns
- Recovery patterns
- Executive functioning habits
- Resilience

Wisdom, not surveillance.

---

## Implementation Map

| File | Purpose |
|------|---------|
| `lib/companionJudgmentClient/liveEcosystem.ts` | Orchestrator |
| `lib/companionJudgmentClient/liveJudgmentStore.ts` | Current judgment + events |
| `lib/companionJudgmentClient/useLiveCompanionJudgment.ts` | React subscription |
| `lib/companionJudgmentClient/adaptationMessage.ts` | Shari-voiced adaptation copy |
| `lib/companionJudgmentClient/detectMeaningfulShift.ts` | Noise vs meaningful change |
| `lib/companionJudgmentClient/gatherEcosystemMemory.ts` | Unified memory adapter |
| `components/companion/LiveEcosystemInit.tsx` | Boot listeners in companion layout |
| `lib/companionJudgmentClient/workspaceIntelligence.ts` | Consume/contribute registry |
| `lib/companionStore.ts` | `COMPANION_REALITY_UPDATED` on day-state save |
| `lib/companionJudgmentClient/realityFromCapture.ts` | Clear My Mind → Live Reality |

See `LIVE_REALITY_ECOSYSTEM.md` for how every workspace participates.

---

## Human Reality Test

After 8:00 AM the ecosystem must still feel alive.

The companion walks beside the user — not handing a frozen morning schedule.

That is accompaniment.
