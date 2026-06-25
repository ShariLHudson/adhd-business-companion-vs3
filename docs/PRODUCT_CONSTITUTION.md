# Product Constitution™

**P0.58 — Permanent governing document for the ADHD Business Ecosystem™**

This is **not** a feature. It is the foundation that every future screen, workflow, intelligence module, conversation, and UX decision must comply with.

**Purpose:** Prevent design drift as the ecosystem grows.

**Authority:** Before activating Companion Brain™ Intelligence or implementing new features, every screen must pass certification through Gate 10. This document governs all compliance decisions.

**Related:** [Development Governance](./DEVELOPMENT_GOVERNANCE.md) · [Screen Certification](./SCREEN_CERTIFICATION.md) · [UX Punch List](./UX_PUNCH_LIST.md) · [Reminder Chat Intake](./REMINDER_CHAT_INTAKE.md)

---

## 1. Companion Constitution™

The user is always in control. The companion exists to **guide—not control**—the conversation.

| Rule | Requirement |
|------|-------------|
| Topic freedom | The user may change topics at any time |
| No traps | The companion never traps a conversation |
| No permanent blocks | No workflow can permanently block unrelated requests |
| Pause | Guided conversations may be paused |
| Resume | Guided conversations may be resumed later |
| Abandon | Guided conversations may be abandoned safely |
| Memory without nagging | The companion remembers unfinished work without repeatedly interrupting the user |
| No repeat questions | Never ask the same question after a valid answer was received |
| Clean completion | Every guided workflow must clear its awaiting-answer state when complete |

---

## 2. UX Constitution™

Every screen should reduce cognitive load.

| Rule | Requirement |
|------|-------------|
| Progressive disclosure | First — not last |
| Primary action | One primary action per screen |
| Expansion | One expanded section/card at a time unless multiple open sections provide clear value |
| How To Use | Begins collapsed |
| Empty states | Always explain what to do next |
| Clicks | Minimize |
| Duplicates | Remove duplicate controls |
| Wording | Remove unnecessary wording |
| Clutter | Remove visual clutter before adding features |
| Consistency | More important than novelty |

---

## 3. ADHD Constitution™

Every screen should support executive functioning.

Ask on every screen:

- Is the next step obvious?
- Can the user become overwhelmed?
- Does the page reduce decision fatigue?
- Does it encourage action?
- Can the page be simplified further?

The companion should help users **move forward**—not simply organize information.

---

## 4. Emotional Safety Constitution™

The emotional experience is as important as functionality.

**Never:**

- Shame
- Guilt
- Pressure
- Criticize
- Overwhelm
- Fabricate encouragement

**Always:**

- Remain calm
- Remain factual
- Use evidence-based encouragement
- Celebrate genuine progress
- Ask permission before emotionally sensitive insights

Confidence reminders must always come from **real user history**.

---

## 5. Intelligence Constitution™

Every screen contributes to the Companion Brain™.

| Rule | Requirement |
|------|-------------|
| Structure | Store structured data whenever possible |
| Relationships | Preserve relationships between objects |
| Time | Capture timestamps |
| Provenance | Record data sources (manual, AI, Google, import, etc.) |
| Duplication | Avoid duplicate information |
| Explainability | Intelligence should explain itself |
| Traceability | Suggestions should be traceable to evidence |
| Visibility | Intelligence remains mostly invisible unless it meaningfully helps |

---

## 6. Navigation Constitution™

Navigation should feel predictable everywhere.

| Rule | Requirement |
|------|-------------|
| Back | Always returns to the previous meaningful screen |
| Open / Close | Behave consistently |
| Search | Behaves consistently |
| Dropdowns | Behave consistently |
| Print / Export | Behave consistently |
| Settings | One interaction model |
| Google | One interaction model |

The user should never wonder where they will end up.

---

## 7. Workflow Constitution™

Every workflow should feel complete.

Where appropriate, every workflow must support:

- Create · Edit · Save · Delete · Archive · Restore
- Search · Sort · Filter
- Print · Export
- Google integration

**No dead ends.**

---

# Conversation Governance™

Every **guided conversation** (chat intake, builder kickoff, multi-step offers, etc.) must pass all seven scenarios below.

Use this checklist when certifying Chat™, Reminder Center™ chat intake, Create discovery, Visual Thinking guidance, Outcome Goals coaching flows, and any new guided workflow.

## Scenario 1 — Happy Path

User answers each question in sequence. Flow completes successfully.

## Scenario 2 — Skip Ahead

User provides multiple answers in one message.

**Example:** `Remind me to drink water weekdays at 10, 1 and 5.`

The companion extracts all available information without asking unnecessary questions.

## Scenario 3 — Interrupt

User changes topics mid-workflow.

**Example:** Reminder intake → `Tell me a joke.`

**Expected:** Reminder flow pauses. New request completes. Reminder may be resumed later.

## Scenario 4 — Correction

User changes an earlier answer.

**Example:** `Actually make that weekends.`

The workflow **updates** instead of restarting.

## Scenario 5 — Cancel

User abandons the workflow.

**Example:** `Never mind.`

The workflow exits cleanly. **No lingering awaiting-answer state.**

## Scenario 6 — Resume

User returns later.

**Example:** `Let's finish that reminder.`

The companion restores the draft naturally.

## Scenario 7 — Natural Language

The companion understands conversational answers—not exact keywords.

**Examples that must resolve equivalently where applicable:**

- Every workday
- Monday through Friday
- Business days
- Weekdays
- m-f / mon-fri

---

# Future Development Rule

Before implementing **any** new feature, ask:

1. **Does it violate the Product Constitution™?**
2. **Does it make the experience simpler?**
3. **Does it help the user make a better decision, reduce overwhelm, or move their business forward?**

If the answer to any of these is **no**, redesign the feature before implementation.

Full product-thinking standard: [Development Governance™](./DEVELOPMENT_GOVERNANCE.md) (12 rules + final principle).

---

# Long-Term Goal

The ADHD Business Ecosystem™ should not feel like dozens of separate tools.

It should feel like **one calm, intelligent companion** with a consistent personality, predictable behavior, and growing understanding of the user's business and journey.

The Product Constitution™ is the permanent foundation that keeps every future feature aligned with that vision.

---

# Compliance quick reference

| Constitution | Certification gate | Primary doc section |
|--------------|-------------------|---------------------|
| Companion | Gate 10 + Chat/guided flows | §1, Conversation Governance |
| UX | Gates 3, 6 + Gate 10 | §2 |
| ADHD | Gate 4 + Gate 10 | §3 |
| Emotional Safety | Gate 5 + Gate 10 | §4 |
| Intelligence | Gate 9 + Gate 10 | §5 |
| Navigation | Gate 2 + Gate 10 | §6 |
| Workflow | Gate 1 + Gate 10 | §7 |

Screen certification details: [SCREEN_CERTIFICATION.md](./SCREEN_CERTIFICATION.md)
