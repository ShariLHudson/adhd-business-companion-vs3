# Phase 8 — Autonomous Preparation

**Registry ID:** `phase_8_autonomous_preparation`  
**Module:** `lib/autonomousPreparation.ts`  
**Storage key:** `companion-phase8-autonomous-preparation-v1`  
**Registry status:** `future`  
**Implementation status:** Module + tests exist; **not wired to chat, panel, or phase resolver**

---

## Phase Name

Autonomous Preparation™

---

## Purpose

Prepare before the user asks. **Not** autonomous action, not an agent running wild — the user remains in control.

Module header: *Prepare before the user asks. Never execute, send, publish, or decide.*

Philosophy (from original specification, recovered from chat): **Companion prepares. User chooses.**

---

## User Experience

The user should feel:

- Relevant resources assembled before they have to hunt
- Clarity without loss of control — permission prompts, not auto-execution
- Milestone: *"Work is ready when you arrive."*

---

## Intelligence Goal

Detect what the user is likely to need and package **preparation kits** from existing ecosystem assets.

---

## Activation Requirements

`isPhase8AutonomousPreparationActive(now)` requires **all**:

1. Phase 7 active
2. `buildPreparedKits(now).length` ≥ **2** (kits with readiness ≠ `emerging`)

**Not in `getCurrentRelationshipPhase()` today** — registry marks phase as `future`.

---

## Companion Behaviors

*Implemented in module; chat integration reserved.*

| Function | Behavior |
|----------|----------|
| `prepareConversationContext()` | Conversation preparation kit |
| `prepareDecisionBrief()` | Decision support kit |
| `prepareLaunchKit()` | Launch preparation |
| `prepareContentIdeas()` | Content ideation kit |
| `prepareSalesCallKit()` | Sales call preparation |
| `prepareReEntryBrief()` | Return-after-absence brief |
| `detectOpportunityReadiness()` | Opportunity preparation |
| `maybeAutonomousPreparationOffer()` | Permission-based chat offer (not wired to CPC) |
| `phase8AutonomousPreparationHintForChat()` | Chat hint block (not wired to CPC) |
| `formatPreparedWorkspaceForPanel()` | Panel display (not wired to panel) |

Offer cooldown: `OFFER_COOLDOWN_MS` (5 days).

---

## Intelligence Collected

`AutonomousPreparationState`:

- `topicMentions` — recurring topic counts
- `lastPreparationOfferAt`, `lastReEntryAt`
- `metrics` — preparedViewed, preparedUsed, offersShown, offersAccepted, reEntryBriefsShown

Kit types: `PreparationKit` with category, items, `permissionPrompt`, readiness (`ready` | `partial` | `emerging`).

---

## Outputs

- Preparation kits across 8 categories
- `buildBusinessReadiness()` — launch, sales, visibility, content, offer narratives
- Validation helpers in tests: workshop launch, discovery call, content, re-entry, decision, opportunity

---

## Example Conversations

*Recovered from implementation behavior (module logic; not yet live in CompanionPageClient).*

**Re-entry brief**

> **Shari:** Welcome back — here's what was in motion when you left: [Project X], [open decision]. Want to pick up one thread, or start fresh?

**Launch preparation**

> **User:** I'm thinking about launching the workshop next month.  
> **Shari:** I can pull together what you already have for this launch — outline, audience notes, prior content. Want to see the prep kit before you decide anything?

---

## Future Expansion Opportunities

Reserved for future specification:

- Wire to `CompanionPageClient.tsx` and `GettingToKnowYouPanel.tsx`
- Insert Phase 8 into `getCurrentRelationshipPhase()` between Phase 7 and Phase 10
- Change registry `status` from `future` to `active` when wired
- Morning briefing integration with Phase 12 Founder Command Center (`lib/ecosystem/commandCenter/`) — separate phase system
