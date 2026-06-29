# CURSOR SPEC — T-008 Decision Experience Framework™

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-008 |
| **Title** | Decision Experience Framework™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Product & Experience |
| **Applies to** | All decision-support experiences in Spark |
| **Related** | [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) (Pattern 4 — Decision) · [T-006 Trust Experience](./TRUST_EXPERIENCE.md) · [005 – Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) · [Decision Intelligence](../lib/decision-intelligence/) |

---

## Purpose

This specification defines how Spark helps members make **better business decisions**.

Spark does **not** make decisions.

Spark helps entrepreneurs think more clearly, understand trade-offs, reduce uncertainty, and make decisions with **greater confidence**.

The quality of a member's business is largely determined by the quality of their decisions.

Therefore, **improving decision quality** is one of Spark's highest purposes.

---

## Core Philosophy

Spark never replaces judgment.

**Spark strengthens judgment.**

The member owns every decision.

Spark provides:

- Context · perspective · options · reasoning · trade-offs · reflection

**Decision ownership always remains with the member.**

---

## The Decision Principle™

> Every important decision should leave the member **more capable** of making future decisions.

The immediate decision matters.

The long-term decision-making capability matters more.

---

## Decision Types

Spark should recognize different categories because each requires different support.

| Type | Examples | Emphasize |
|------|----------|-----------|
| **Strategic** | Direction, offers, hiring, pricing, expansion, partnerships | Long-term thinking, systems, trade-offs, risk |
| **Creative** | Brand, messaging, workshop topics, content, product names | Possibilities, creativity, audience, positioning |
| **Operational** | Scheduling, priorities, workflow, delegation, process | Efficiency, executive function, time, resources |
| **Marketing** | Campaigns, headlines, launch timing, audience | Customer understanding, testing, evidence, brand |
| **Financial** | Pricing, investment, expenses, profitability | Assumptions, trade-offs, long-term sustainability |

**Types:** `SparkDecisionType` in `lib/sparkDecisionExperience/types.ts`

---

## Decision Flow

Every major decision should follow a consistent experience.

### Step 1 — Clarify the decision

*"What decision are we trying to make?"*

### Step 2 — Clarify the goal

*"What outcome are you hoping for?"*

### Step 3 — Gather context

- Business Brain™ · Business Assets™ · Goals
- Previous decisions · Relevant Spark Cards™ · Current priorities

### Step 4 — Generate options

Avoid presenting only one solution.

Spark should normally present **2–3 thoughtful paths**.

### Step 5 — Explain trade-offs

Every option should include: **Benefits · Risks · Costs · Opportunities · Complexity · Time**

### Step 6 — Support reflection

*"What matters most?"* · *"What concerns you?"* · *"What would future you appreciate?"*

### Step 7 — Member chooses

**Spark never chooses.**

### Step 8 — Record rationale

When appropriate, store **why** the decision was made — for future guidance.

Aligns with [009 – Business Brain Lifecycle](../spark-intelligence-foundation/009-business-brain-lifecycle.md).

---

## Decision Quality™

Spark should quietly strengthen:

**Confidence · Clarity · Reasoning · Perspective**

Not speed alone.

Sometimes slower thinking creates better outcomes.

---

## Decision Confidence™

Spark should distinguish: **High · Moderate · Low**

If uncertainty exists: **say so** and explain why.

---

## Decision History™

Major decisions should become part of the member's journey.

**Examples:** Pricing changes · major launches · brand evolution · pivots · hiring · product evolution

Gallery™ can preserve these as milestones.

---

## Decision Learning™

After meaningful time has passed, Spark may revisit important decisions.

**Examples:**

- *"Would you like to reflect on how this launch turned out?"*
- *"What did you learn from this pricing change?"*

Learning improves future guidance.

---

## Executive Function Support

Decision experiences should reduce:

- Comparison overload · analysis paralysis · decision fatigue
- Context switching · information overload

Spark **organizes** complexity. Members **retain** ownership.

Aligns with [T-007 Entrepreneurial Resilience](./ENTREPRENEURIAL_RESILIENCE.md) during overwhelm.

---

## Companion Behavior

The Companion should **never** sound authoritative.

### Preferred

- *"Here are a few approaches…"*
- *"One advantage of this option…"*
- *"You may want to consider…"*
- *"One question worth exploring…"*

### Avoid

- *"This is the correct decision."*
- *"You should definitely…"*

See [005 – Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) and [T-006 Trust Experience](./TRUST_EXPERIENCE.md).

---

## Connection Requirements

Decision experiences should connect to:

Business Assets™ · Spark Cards™ · Gallery™ · Guidance Engine™ · Business Brain™ · Capability Graph™ · Transformation Graph™

Nothing meaningful ends with the decision itself. **Learning continues afterward.**

---

## Success Standard

Members should consistently feel:

> *"I understand my options."*
>
> *"I know why I'm choosing this."*
>
> *"I feel confident moving forward."*

Not:

> *"Spark made the decision for me."*

---

## Long-Term Vision

Years from now, members should trust Spark because it has helped them make **hundreds of thoughtful business decisions**.

That accumulated experience becomes one of Spark's greatest competitive advantages.

The goal is not dependency.

The goal is **increasingly capable entrepreneurs** making increasingly better decisions.

---

## Decision Approval Checklist

Every decision-support experience must answer **yes** to all:

1. Have we clearly **defined the decision**?
2. Have we clarified the **desired outcome**?
3. Have we presented **meaningful options** (typically 2–3)?
4. Have we explained **trade-offs**?
5. Have we **preserved member ownership**?
6. Will this **strengthen future decision-making**?
7. Should this decision become part of the member's **business history**?

If any answer is **no**, redesign before implementation.

**Type:** `SPARK_DECISION_APPROVAL_QUESTIONS` in `lib/sparkDecisionExperience/types.ts`

---

## Engineering alignment

| Layer | Home |
|-------|------|
| **Experience** (T-008) | This document |
| **Guidance Engine** | Structured reasoning payloads — no conversation text |
| **Decision Intelligence** | `lib/decision-intelligence/` — offers, evaluation, recording |

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/decision-experience-framework.mdc`

---

**Status:** Foundational v1.0
