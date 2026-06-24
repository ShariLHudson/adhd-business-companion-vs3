# Phase 2 — Progressive Discovery

**Registry ID:** `phase_2_progressive_discovery`  
**Module:** `lib/phase2ProgressiveDiscovery.ts`  
**Storage key:** `companion-phase2-progressive-discovery-v1`  
**Status:** `active`

---

## Phase Name

Progressive Discovery™

---

## Purpose

Learn how the user works **while helping** — observe, confirm, adapt. Never interrogate.

Active continuously after Phase 1 completes. Invisible ongoing relationship building.

---

## User Experience

The user should feel:

- *"This app understands me more every day"* — NOT *"I'm still onboarding"*
- That discovery happens through normal use, not forms
- That preferences and patterns are remembered without repeated questions

Chat hint philosophy (from module): discovery is **invisible**.

---

## Intelligence Goal

Build a rich **progressive discovery state** that feeds all later phases: patterns, learning style, energy, goals, challenges, and resource effectiveness.

---

## Activation Requirements

| Function | Condition |
|----------|-----------|
| `isPhase2DiscoveryActive()` | `isPhase1OnboardingComplete()` |

Phase 2 does not have a separate upper bound — it remains active as the foundational observation layer while higher phases unlock.

**Relationship start date:** `firstSessionAt` in Phase 2 state — used by `daysSinceRelationshipStart()` for Phases 3+.

---

## Companion Behaviors

- `observePhase2DiscoveryTurn()` — extracts signals from each user message
- Seeds from Phase 1 profile on first access (`seedFromPhase1`)
- Tracks milestones: `understand_business`, `understand_goals`, `understand_challenges`, `understand_work_style`, `anticipate_help`
- Surfaces discovery profile in Getting To Know You panel
- Contributes to `relationshipPhaseSummaryForChat()` day count

---

## Intelligence Collected

`Phase2ProgressiveDiscoveryState` includes:

| Category | Fields |
|----------|--------|
| **Business** | type, primary offer, ideal client |
| **Goals** | goal entries with timestamps |
| **Challenges** | labeled challenges with count/lastSeen |
| **ADHD patterns** | `AdhdPatternId` entries (visibility resistance, follow-through, etc.) |
| **Learning style** | primary, secondary, confidence, signal counts |
| **Energy** | completions/overwhelm by morning/afternoon/evening, peak/low windows |
| **Resources** | helpful scores for Decision Compass, Clear My Mind, Create, etc. |
| **Strengths** | observed strength labels |
| **Sessions** | `sessionCount`, `firstSessionAt`, `lastSessionAt` |

---

## Outputs

- `buildWhatIveLearnedProfile()` — human-readable discovery summary
- `phase2ProgressiveDiscoveryHintForChat()` — internal chat guidance block
- Feeds Phase 3 pattern detection, Phase 4 business context, Phase 5+ long-horizon intelligence

---

## Example Conversations

*Recovered from implementation behavior.*

**Invisible pattern capture**

> **User:** I keep planning the launch but never posting anything.  
> *(System bumps `visibility_resistance` and `launch_avoidance` pattern counts — no explicit "onboarding question.")*

**Learning style inference**

> **User:** Can you show me a simple visual breakdown? That helps me decide.  
> *(Visual learning signal incremented; may become primary style over time.)*

**Energy observation**

> **User:** Mornings are when I actually finish things. Afternoons I crash.  
> *(Energy window data updated for peak/low inference.)*

---

## Future Expansion Opportunities

Reserved for future specification:

- Explicit user-facing milestone celebrations for Phase 2 milestones
- Sync discovery state to `lib/intelligence-layer/` master profile (architecture doc notes partial wiring)
