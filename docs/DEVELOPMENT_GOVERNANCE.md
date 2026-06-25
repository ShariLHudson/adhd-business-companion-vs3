# Development Governance™

**ADHD Business Ecosystem™ — Product-thinking standard**

## Purpose

The ADHD Business Ecosystem™ is no longer a collection of features. It is a **living companion platform**.

This document defines how future development decisions should be made so the product remains cohesive as it grows.

This is **not** a coding standard. It is a **product-thinking standard**.

**Governing law:** [Product Constitution™](./PRODUCT_CONSTITUTION.md) — what must comply  
**Execution process:** [Screen Certification](./SCREEN_CERTIFICATION.md) — how screens become complete  
**Living tracker:** [UX Punch List](./UX_PUNCH_LIST.md) — polish + Future Opportunities per screen

---

## Rule #1 — The Companion Comes First

Never ask: *"What feature should we build?"*

Always ask: *"What would the companion naturally do?"*

The user should experience **one intelligent companion**—not dozens of disconnected tools.

Every new capability should strengthen that relationship.

---

## Rule #2 — Solve Problems, Not Screens

A screen is only a container. The goal is to solve the user's problem.

| Screen | Underlying problem |
|--------|-------------------|
| Goal screen | Confidence they're making progress |
| Reminder screen | Remember important things at the right time |

Always design around the **underlying problem**.

---

## Rule #3 — Simplicity Wins

Whenever adding something new, ask: **Can this remove something else?**

- If a feature requires explanation → simplify it
- If two features overlap → merge them
- If information is duplicated → remove it

Every release should feel **lighter**—not heavier.

Aligns with [UX Constitution™](./PRODUCT_CONSTITUTION.md#2-ux-constitution) and [Rule #5](#rule-5--one-source-of-truth) below.

---

## Rule #4 — Every Screen Must Teach the Companion

Every interaction should create **structured knowledge**.

Ask:

- What did we learn?
- Can this help the user later?
- Can it improve future recommendations?
- Can it connect to another part of the ecosystem?

If not, consider whether the interaction should be redesigned.

Aligns with [Intelligence Constitution™](./PRODUCT_CONSTITUTION.md#5-intelligence-constitution) and [Future Intelligence Readiness](./SCREEN_CERTIFICATION.md#9-future-intelligence-readiness).

---

## Rule #5 — One Source of Truth

Information should exist **only once**.

- Projects should not duplicate Goals
- Goals should not duplicate Growth
- Growth should not duplicate Portfolio

Everything should **reference shared data** rather than creating copies.

---

## Rule #6 — Intelligence is Earned

Never generate insights because AI can.

Generate insights **only when:**

- Confidence is high
- Evidence exists
- Timing is appropriate
- The user benefits

**Silence is often better than unnecessary advice.**

Aligns with [Emotional Safety Constitution™](./PRODUCT_CONSTITUTION.md#4-emotional-safety-constitution) — no fabricated encouragement.

---

## Rule #7 — Celebrate Progress with Evidence

Never use generic encouragement. Use **real accomplishments**.

Examples:

- "You've completed 18 projects."
- "You've created 240 reusable business assets."
- "You've helped 36 clients."
- "You've built 14 frameworks."

Evidence creates confidence.

---

## Rule #8 — Preserve User Trust

Never surprise the user. The companion should always be **explainable**.

The user should understand:

- Why something happened
- Why something was suggested
- Where the information came from

Transparency builds trust.

Aligns with [Companion Constitution™](./PRODUCT_CONSTITUTION.md#1-companion-constitution) and Intelligence traceability.

---

## Rule #9 — Design for Growth

Every feature should answer: **How will this work when the user has:**

- 500 reminders?
- 1,000 projects?
- 5,000 content assets?
- 10 years of history?

Avoid designs that only work for empty states.

---

## Rule #10 — Future-Proof Every Decision

Before closing any development task, document **Future Opportunities**:

What future intelligence could build on this work?

Examples: pattern detection · business analytics · confidence reminders · opportunity detection · automation · personalized recommendations

**Do not build these immediately. Capture the opportunity.**

Record in [UX_PUNCH_LIST.md](./UX_PUNCH_LIST.md) under the relevant screen.

---

## Rule #11 — Certification Before Expansion

**No new feature work begins until the current screen passes certification.**

Features do not become complete because the code works.

They become complete because users can use them **confidently and naturally**.

See [Screen Certification Sprint™](./SCREEN_CERTIFICATION.md) — all **10 gates** including [Constitution Compliance™](./SCREEN_CERTIFICATION.md#10-constitution-compliance).

---

## Rule #12 — Version 1.0 Goal

Version 1.0 is not about having the most features.

Version 1.0 succeeds when users say:

> *"I've never used software that understands how my brain works."*

That is the benchmark every development decision should support.

---

## Final Principle

Whenever there is uncertainty, ask one question:

> **Will this help the user make a better decision, feel more confident, or move their business forward with less overwhelm?**

- **Yes** → it belongs in the ADHD Business Ecosystem™
- **No** → redesign it before building it

This principle is also the [Future Development Rule](./PRODUCT_CONSTITUTION.md#future-development-rule) in the Product Constitution™.

---

## How the governance documents work together

| Document | Role | When to use |
|----------|------|-------------|
| **Development Governance™** (this file) | Decision-making — *how to think* before building | Starting any task, feature pitch, or sprint |
| **Product Constitution™** | Compliance — *what must be true* | Certifying screens, reviewing UX, guided conversations |
| **Screen Certification** | Process — *how screens become complete* | Finishing a screen, before moving to the next |
| **UX Punch List** | Tracker — *what's left + future breadcrumbs* | Daily polish, capturing Future Opportunities |

**Companion Brain™ Intelligence** activates only after:

1. Every screen in the certification order is marked **COMPLETE**, and  
2. The [Product Constitution™](./PRODUCT_CONSTITUTION.md) is in force, and  
3. [Development Governance™](./DEVELOPMENT_GOVERNANCE.md) guides all new work.

---

## Quick checklist (before any dev task)

1. What would the **companion naturally do**? (Rule #1)
2. What **problem** are we solving—not which screen? (Rule #2)
3. Can we **remove** something instead of adding? (Rule #3)
4. What **structured knowledge** does this create? (Rule #4)
5. Is this a **duplicate** of existing data? (Rule #5)
6. Is intelligence **earned** here—or premature? (Rule #6)
7. Is encouragement **evidence-based**? (Rule #7)
8. Is the behavior **explainable**? (Rule #8)
9. Does it scale to **years of use**? (Rule #9)
10. **Future Opportunities** captured? (Rule #10)
11. Is the **current screen certified** before expanding? (Rule #11)
