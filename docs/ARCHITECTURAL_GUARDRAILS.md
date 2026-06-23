# Architectural Guardrails
## ADHD Business Ecosystem™ — Implementation Authority

**Version:** 1.0  
**Status:** Canonical for all feature work. Subordinate only to `docs-companion-intelligence/21_Companion_Constitution.md`.

When a feature request conflicts with this document, **these guardrails win**.

---

## 1. Product identity

The ADHD Business Ecosystem™ is a **Companion Intelligence™ platform**.

It helps users:
- Make better decisions
- Reduce overwhelm
- Take meaningful action

It is **not**:
- A traditional task manager
- A project management platform
- A CRM
- A financial / accounting system
- A productivity dashboard or endless list collector

**Relationship and decision support first. Tools support the relationship.**

---

## 2. Workspace boundaries (do not blend)

| Workspace | Purpose | Must not become |
|-----------|---------|-----------------|
| **Clear My Mind™** | Capture competing attention | A sorted backlog |
| **Projects** | Multi-step work over time | Today's task list |
| **Goals** | Define measurable outcomes | A task dump or KPI dashboard |
| **Plan My Day™** | Choose what fits **today's** reality | Long-term storage, Done column graveyard |
| **Adapt My Day™** | Current capacity & energy | One-time check-in only |
| **Founder Intelligence™** | Learn patterns; supportive insights | Judgment, scorekeeping, shame |

Each workspace has **one job**. Do not merge storage, columns, or mental models across them.

---

## 3. Plan My Day™ rules

- Answers: *"What is realistic for me today?"*
- **Starts fresh daily** (Chat Workspace → New Day's Chat — not archive managers).
- Flow: Considering Today → Today's Focus → In Progress → Complete → History.
- **Complete** = save history + analytics + learning → **remove from active board**.
- **No permanent Done column.**
- Kanban: centered header/entry; **wider board** below for readable columns.
- Items may originate from Clear My Mind, Projects, calendar, ideas, companion suggestions, optional carry-forward — but the board must not become a dumping ground.

---

## 4. Goals rules

Goals are **outcome-focused**, not vague intentions.

Each goal includes:
1. Goal statement  
2. Success metric  
3. Target value  
4. Deadline  
5. Definition of done  

Goals support the question: *"Am I spending time on activities that support the outcome I chose?"*

Goals are **not**:
- Task lists
- Project backlogs
- Habit trackers with guilt metrics

**Revenue goals:** self-reported progress only (`+$250`). No accounting, invoicing, banking, expense tracking, or P&L in the companion UX.

---

## 5. Companion Intelligence™ rules

Learn from behavior (complete, postpone, defer, avoid, succeed) — surface **supportive, non-judgmental** observations.

Good: *"You've moved marketing items aside a few times this week — want to pick one smaller piece for today?"*

Bad: Productivity scores, red/yellow KPIs, shame language, nagging every turn.

Prefer **chat hints** and light context over new dashboards.

---

## 6. Cognitive load limits

From the Constitution — enforce in UI:
- **At most three meaningful choices** per screen when possible.
- Conversation first; do not auto-open workspaces without consent.
- One owner per turn in chat.
- Do not add fields, columns, or menus that turn a daily workspace into a configuration panel.

---

## 7. Forbidden feature patterns

Do **not** implement without explicit product-owner approval:

- Permanent Done / Archive / Clear Completed columns in Plan My Day™
- Blending Projects into Plan My Day as default storage
- User-facing financial management (ledger, invoices, bank sync)
- CRM pipelines, deal stages, contact scoring
- Automatic task creation from chat without consent
- Multiple competing surfaces in one turn
- Vague goals chips as a substitute for structured outcomes

---

## 8. Adapt My Day™ integration

Adapt My Day™ stays linked to Plan My Day™.

Prompt for reality mismatch only when **meaningful** (workload, capacity, heavy commitments) — not after every add.

Options: **Keep Current Reality** / **Update Today's Reality**.

Adapt My Day lives in the **top menu**, not buried inside Plan My Day.

---

## 9. Implementation checklist

Before shipping a feature, confirm:

- [ ] Which workspace owns this? (Only one.)
- [ ] Does it increase cognitive load or blur boundaries?
- [ ] Does it turn the product into a list manager?
- [ ] Is consent required before action?
- [ ] Are insights supportive, not punitive?
- [ ] Does copy match daily-decision vs long-term-planning framing?

---

## 10. Related documents

- `docs-companion-intelligence/21_Companion_Constitution.md`
- `docs-companion-intelligence/00_Companion_Operating_System_v1.md`
- `lib/appFeatureKnowledge.ts` (how-to truth)
