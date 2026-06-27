# Phase 4 — Business Operating Partner

**Registry ID:** `phase_4_business_operating_partner`  
**Module:** `lib/phase4BusinessOperatingPartner.ts`  
**Storage key:** `companion-phase4-business-partner-v1`  
**Status:** `active`

---

## Phase Name

Business Operating Partner

---

## Purpose

Help run the business, not just conversations — surface health, opportunities, and operating context.

Tagline: *"Help run the business, not just conversations."*

---

## User Experience

The user should feel:

- Shari understands business rhythm, not only emotions
- Opportunities and risks are named supportively, not as KPI shame
- Milestone: *"You help me run my business."*

---

## Intelligence Goal

Compose **business health** and **opportunity detection** from Business OS evaluation, projects, and confidence wins.

---

## Activation Requirements

`isPhase4BusinessOperatingPartnerActive(now)` requires **all**:

1. Phase 1 complete
2. Phase 3 active
3. Business context: Phase 2 `business.type` **or** ≥1 goal **or** `getBusinessProfile().role`
4. ≥**30** days **OR** ≥**12** sessions (`MIN_PHASE4_DAYS`, `MIN_PHASE4_SESSIONS`)

---

## Companion Behaviors

- `buildBusinessHealthDashboard()` — momentum, confidence, visibility, sales activity, follow-through narratives
- `detectBusinessOpportunities()` — from Business OS + stalled projects (>14 days quiet)
- `observePhase4BusinessTurn()` — tracks business-relevant turns
- `maybeBusinessPartnerInsight()` — contextual chat offers
- `phase4BusinessOperatingPartnerHintForChat()` — internal chat block
- `buildBusinessOperatingManual()` — how the business grows, struggles, focus areas

---

## Intelligence Collected

`Phase4BusinessPartnerState` plus derived dashboards:

- Business health meanings: `growing` | `stable` | `slowing`, etc.
- Opportunity records: id, label, reason, impact
- Business OS snapshot integration (`evaluateBusinessOS`)
- Project stall detection from `getProjects()`
- Confidence wins from `getRecentConfidenceWins()`

---

## Outputs

- Business Health Dashboard narrative
- Business Operating Manual for Getting To Know You panel
- Opportunity list for chat hints
- Prerequisite for Phase 5 long-horizon ecosystem intelligence

---

## Example Conversations

*Recovered from implementation behavior.*

**Health-aware nudge**

> **User:** I don't know if my business is actually moving forward.  
> **Shari:** Business load has felt [healthy/stable/strained] lately. [Opportunity or risk from OS snapshot if present.] Want to pick one lever that would matter most this week?

**Stalled project detection**

> **Shari:** Your **Workshop Launch** project has been quiet for a while. Would revisiting it — or consciously pausing it — help reduce mental load?

---

## Future Expansion Opportunities

Reserved for future specification:

- Deeper integration with `lib/ecosystem/` founder intelligence (separate phase system)
- Revenue tracking workspace (audit notes: not ported to companion-app)
