# Architectural Guardrails
## ADHD Business Ecosystem™ — Implementation Authority

**Version:** 1.0  
**Status:** Canonical for all feature work. Subordinate only to `docs-companion-intelligence/21_Companion_Constitution.md`.

When a feature request conflicts with this document, **these guardrails win**.

---

## 1. Product identity

The ADHD Business Ecosystem™ is a **Companion Intelligence platform**.

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
| **Clear My Mind** | Capture competing attention | A sorted backlog |
| **Projects** | Multi-step work over time | Today's task list |
| **Goals** | Define measurable outcomes | A task dump or KPI dashboard |
| **Plan My Day** | Choose what fits **today's** reality | Long-term storage, Done column graveyard |
| **Adapt My Day** | Current capacity & energy | One-time check-in only |
| **Founder Intelligence** | Learn patterns; supportive insights | Judgment, scorekeeping, shame |

Each workspace has **one job**. Do not merge storage, columns, or mental models across them.

---

## 3. Plan My Day rules

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

## 5. Companion Intelligence rules

Learn from behavior (complete, postpone, defer, avoid, succeed) — surface **supportive, non-judgmental** observations.

Good: *"You've moved marketing items aside a few times this week — want to pick one smaller piece for today?"*

Bad: Productivity scores, red/yellow KPIs, shame language, nagging every turn.

Prefer **chat hints** and light context over new dashboards.

### Visual Thinking intelligence surfaces

Visual Thinking tools are **not standalone file tools**. They are **intelligence surfaces** owned by Companion Intelligence.

Every map, canvas, framework, and future visual workspace must:

1. Start with understanding  
2. Ask clarifying questions when needed  
3. Build structure from the user's situation  
4. Generate visual output  
5. Generate insights  
6. Generate recommendations  
7. Capture learning signals  
8. Feed Founder Intelligence  
9. Improve future recommendations  

**Layer ownership**

| Layer | Role |
|-------|------|
| Companion Intelligence | Owns the experience — purpose, clarification, framework choice |
| Thinking framework | Structures the user's situation (Mind Map, Business Canvas, etc.) |
| Visual output | Map layer — renders thinking, not the product itself |
| Insights & recommendations | Intelligence panel — the insight is the product |
| Learning & analytics | `lib/visualFocus/companionIntelligence/` → signal bus → Founder Intelligence |

**Predefined structure exception:** Business Canvas requires nine sections. Other frameworks should emerge from the user's situation unless the framework itself requires fixed sections.

**Future surfaces** (register in `VISUAL_THINKING_FRAMEWORK_REGISTRY`, implement without pipeline rewrite): Living Canvas, What-If Analysis, Business Simulations, Opportunity Mapping, Board of Directors Intelligence, Predictive Business Guidance.

Canonical implementation: `lib/visualFocus/companionIntelligence/`.

---

## 6. Future-first architecture (Companion Intelligence Ecosystem)

**Core principle:** Build simple user experiences. Build powerful architecture underneath.

Users experience simplicity, clarity, guidance, and momentum. The system maintains intelligence, memory, relationships, learning, analytics, and pattern recognition.

### Three-layer design rule

Every major feature must answer:

| Layer | Question | Example (Business Canvas) |
|-------|----------|----------------------------|
| **User value** | What problem does this solve today? | Helps users understand how their business works |
| **Intelligence value** | What can the ecosystem learn? | Audience, revenue, offer, marketing, relationship patterns |
| **Future value** | What future systems become possible? | Living Canvas, What-If Analysis, Ripple Effects, BoD Analysis |

### Companion Intelligence pipeline

```
User Situation → Understanding → Clarification → Pattern Recognition
→ Framework Selection → Visual / Interactive Experience → Insights
→ Recommendations → Learning Signals → Future Intelligence
```

The intelligence layer owns the experience. Tools visualize thinking; intelligence is the product.

### Intelligence analytics (not just usage)

Track pattern categories: Founder Decision, Momentum, Overwhelm, Business Growth, Planning, Content Creation, Execution, Energy, Confidence, Opportunity.

### Learning signals

Every major system must produce learning signals (see `ECOSYSTEM_MAJOR_SYSTEMS` in `lib/companionIntelligenceEcosystem/systems.ts`).

### Founder Intelligence & Board of Directors

Founder Intelligence learns how the user thinks, plans, decides, grows, and what creates friction vs momentum.

Future Board of Directors systems draw from user data, patterns, decisions, Business Canvas data, Visual Thinking data, projects, and goals.

### Building rule

Do **not** build future features now. Build today's features so future features are possible.

### Final test (before any major feature)

1. What value does this create today?  
2. What intelligence does this capture?  
3. What future systems could use this?

Use `evaluateFutureFirstFeature()` + `validateCapabilityDesign()` + `runVision2029Test()`.

Canonical module: `lib/companionIntelligenceEcosystem/`.

---

## 7. Cognitive load limits

From the Constitution — enforce in UI:
- **At most three meaningful choices** per screen when possible.
- Conversation first; do not auto-open workspaces without consent.
- One owner per turn in chat.
- Do not add fields, columns, or menus that turn a daily workspace into a configuration panel.

---

## 8. Forbidden feature patterns

Do **not** implement without explicit product-owner approval:

- Permanent Done / Archive / Clear Completed columns in Plan My Day
- Blending Projects into Plan My Day as default storage
- User-facing financial management (ledger, invoices, bank sync)
- CRM pipelines, deal stages, contact scoring
- Automatic task creation from chat without consent
- Multiple competing surfaces in one turn
- Vague goals chips as a substitute for structured outcomes

---

## 9. Adapt My Day integration

Adapt My Day stays linked to Plan My Day.

Prompt for reality mismatch only when **meaningful** (workload, capacity, heavy commitments) — not after every add.

Options: **Keep Current Reality** / **Update Today's Reality**.

Adapt My Day lives in the **top menu**, not buried inside Plan My Day.

---

## 10. Implementation checklist

Before shipping a feature, confirm:

- [ ] Which workspace owns this? (Only one.)
- [ ] Does it increase cognitive load or blur boundaries?
- [ ] Does it turn the product into a list manager?
- [ ] Is consent required before action?
- [ ] Are insights supportive, not punitive?
- [ ] Does copy match daily-decision vs long-term-planning framing?
- [ ] Does `evaluateFutureFirstFeature()` pass (user, intelligence, future value)?

---

## 11. Related documents

- `docs-companion-intelligence/21_Companion_Constitution.md`
- `docs-companion-intelligence/00_Companion_Operating_System_v1.md`
- `lib/appFeatureKnowledge.ts` (how-to truth)
- `lib/companionIntelligenceEcosystem/` (future-first three-layer rule)
