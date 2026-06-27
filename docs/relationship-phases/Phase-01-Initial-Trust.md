# Phase 1 — Initial Trust

**Registry ID:** `phase_1_initial_trust`  
**Module:** `lib/phase1Onboarding.ts`  
**Storage key:** `companion-phase1-onboarding-v1`  
**Status:** `active`

---

## Phase Name

Initial Trust — First Conversation Experience

---

## Purpose

Establish trust through conversation rather than a profile form. The companion must understand enough to help before routing the user into workspaces or features.

Design intent from module header: *Understand → deliver value → memory seed → begin helping.*

---

## User Experience

The user should feel:

- Heard before being asked to learn the app
- That Shari cares about *their* win, not product mechanics
- Safe sharing business context in natural language
- Confirmation that the companion remembers what they said (*"Did I get that right?"*)

Opening message (from code): introduces Shari, promises progress without overwhelm, asks what would make the app a win.

---

## Intelligence Goal

Seed a **Phase 1 relationship profile** sufficient to personalize help and block premature feature routing.

Sub-phases in code: `opening` → `business` → `challenge` → `outcome` → `first_value` → `memory_seed` → `complete`.

---

## Activation Requirements

| State | Condition |
|-------|-----------|
| **Active** | `isPhase1OnboardingActive()` — `complete === false` |
| **Complete** | `isPhase1OnboardingComplete()` — `complete === true` |

Completion is driven by `applyPhase1OnboardingTurn()` through conversation turns (profile fields populated + memory seed flow).

**Routing guards while active:**

- `shouldDeferWorkspaceRoutingForPhase1()` — blocks automatic workspace routing
- `shouldBlockWorkspaceOpenForPhase1()` — blocks auto opens (not explicit user-initiated sidebar clicks per current implementation notes)
- `shouldSuppressWorkspaceCoachForPhase1()` — suppresses workspace coach auto-start

---

## Companion Behaviors

- Asks at most **4** assistant questions (`MAX_ONBOARDING_QUESTIONS`)
- Infers business type, audience, stage, challenge, emotional state, urgency from user messages
- Offers **first value resource** based on challenge: Clear My Mind, Decision Compass, Create, Plan My Day, or continued conversation
- Builds trust reflection and memory seed summary for confirmation
- Persists profile to business store and discovery answers on completion paths

---

## Intelligence Collected

`Phase1RelationshipProfile` fields:

- `winDefinition`, `businessType`, `audience`, `businessStage`
- `primaryChallenge`, `emotionalState`, `urgency`
- `immediateGoal`, `desiredOutcome`, `successDefinition`

Also tracks: `assistantQuestionsAsked`, `memorySeedConfirmed`, timestamps.

---

## Outputs

- Completed onboarding state → unlocks Phase 2 discovery
- `buildTrustReflection()` — empathetic mirror of user situation
- `buildMemorySeedSummary()` — bullet summary for confirmation
- `firstValueResourceForProfile()` — recommended first workspace/action
- `relationshipPhaseSummaryForChat()` includes phase 1 until complete

---

## Example Conversations

*Recovered from implementation behavior.*

**Opening**

> **Shari:** Hi, I'm Shari. My job is to help you make progress in your business without adding more overwhelm. You don't need to learn the app first. Let's start with you. What would make this app a win for you?  
> **User:** I need help staying consistent with marketing without burning out.

**Business context**

> **Shari:** Tell me a bit about your business — who do you help?  
> **User:** I'm a coach for overwhelmed entrepreneurs.

**Memory seed**

> **Shari:** Here's what I'm hearing so far:  
> • You run a coaching business.  
> • You help overwhelmed entrepreneurs.  
> • Consistency with marketing is your biggest challenge right now.  
> Did I get that right?

---

## Future Expansion Opportunities

Reserved for future specification:

- Dedicated markdown spec for Phase 1 prompt block (currently embedded in module)
- Explicit integration test for sidebar navigation during Phase 1
- Passing `lastActivity` into chat API for named resume (noted in `HANDOFF.md`)
