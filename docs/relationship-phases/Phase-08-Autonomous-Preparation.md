# Phase 8 — Autonomous Preparation

**Registry ID:** `phase_8_autonomous_preparation`  
**Module:** `lib/autonomousPreparation.ts`  
**Storage key:** `companion-phase8-autonomous-preparation-v1`  
**Registry status:** `active`  
**Implementation status:** Wired — chat, panel, resolver, tests

---

## Phase Name

Autonomous Preparation™

---

## Purpose

Prepare before the user asks. **Not** autonomous action, not an agent running wild — the user remains in control.

Module header: *Prepare before the user asks. Never execute, send, publish, or decide.*

Philosophy: **Companion prepares. User chooses.**

---

## User Experience

The user should feel:

- Relevant resources assembled before they have to hunt
- Clarity without loss of control — permission prompts, not auto-execution
- Milestone: *"Work is ready when you arrive."*

**Panel:** Getting To Know You shows **Prepared For You** via `formatPreparedWorkspaceForPanel()` when Phase 8 is active (human label — not "Phase 8").

---

## Intelligence Goal

Detect what the user is likely to need and package **preparation kits** from existing ecosystem assets.

---

## Activation Requirements

`isPhase8AutonomousPreparationActive(now)` requires **all**:

1. Phase 7 active
2. `buildPreparedKits(now).length` ≥ **2** (kits with readiness ≠ `emerging`)

**Resolver:** Consulted in `getCurrentRelationshipPhase()` after Phase 9 and before Phase 7.

---

## Companion Behaviors

| Function | Behavior |
|----------|----------|
| `prepareConversationContext()` | Conversation preparation kit |
| `prepareDecisionBrief()` | Decision support kit |
| `prepareLaunchKit()` | Launch preparation |
| `prepareContentIdeas()` | Content ideation kit |
| `prepareSalesCallKit()` | Sales call preparation |
| `prepareReEntryBrief()` | Return-after-absence brief |
| `detectOpportunityReadiness()` | Opportunity preparation |
| `maybeAutonomousPreparationOffer()` | Permission-based chat offer |
| `observeAutonomousPreparationTurn()` | Turn observation |
| `phase8AutonomousPreparationHintForChat()` | Chat hint block |
| `formatPreparedWorkspaceForPanel()` | Panel display |

Offer cooldown: `OFFER_COOLDOWN_MS` (5 days).

**Wiring:** `CompanionPageClient.tsx` — observe turn, maybe offer, record shown, chat hint (after Phase 7, before Phase 9).

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
- Validation: `lib/AutonomousPreparationValidation.test.ts`
- Resolver test: `lib/companionRelationshipPhases.test.ts`

---

## Example Conversations

**Re-entry brief**

> **Shari:** Welcome back — here's what was in motion when you left: [Project X], [open decision]. Want to pick up one thread, or start fresh?

**Launch preparation**

> **User:** I'm thinking about launching the workshop next month.  
> **Shari:** I can pull together what you already have for this launch — outline, audience notes, prior content. Want to see the prep kit before you decide anything?

---

## Architecture

- **ADR:** `docs/adr/ADR-009-wire-phase-8.md`
- **Resolver order:** `docs/adr/ADR-011-relationship-phase-resolver-order.md`
