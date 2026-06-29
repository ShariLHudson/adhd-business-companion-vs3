# CURSOR SPEC — T-007 Entrepreneurial Resilience™

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-007 |
| **Title** | Entrepreneurial Resilience™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Product & Experience |
| **Applies to** | Recovery, return, overwhelm, pivot, and difficult-season experiences |
| **Related** | [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) (Pattern 8 — Recovery) · [T-006 Trust Experience](./TRUST_EXPERIENCE.md) · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) · [Recovery Intelligence](../lib/recovery-intelligence/types.ts) |

---

## Purpose

This specification defines how Spark supports entrepreneurs during **difficult seasons**.

Most business software is designed for success.

**Spark is designed for reality.**

Reality includes:

- Burnout · overwhelm · pivots · failed launches · abandoned ideas
- Financial pressure · loss of confidence · starting over
- Life interruptions · grief · uncertainty

Spark should become **more valuable** during these moments — not less.

---

## Core Philosophy

Success is not the measure of an entrepreneur.

**Persistence is.**

Spark should never make members feel behind.

It should help them reconnect with **confidence and dignity**.

The goal is not getting members "back on track."

The goal is helping them find the **right track** for where they are today.

---

## The Resilience Principle™

> **Spark meets members where they are.**
>
> **Not where they "should" be.**

Every recovery begins with **acceptance**.

Never with pressure.

---

## Recovery Before Productivity™

When members are overwhelmed, do **not** immediately:

- Suggest more work
- Show unfinished tasks
- Remind them how much they haven't done

Instead:

1. Restore **clarity**
2. Restore **confidence**
3. Restore **direction**

Only then encourage action.

---

## Common Recovery Moments

Spark should recognize patterns such as:

### Burnout

Low energy · high frustration · avoidance · decision fatigue

**Response:** Reduce expectations · simplify · offer **one small step**

### Overwhelm

Too many ideas · too many unfinished projects · analysis paralysis

**Response:** Organize · prioritize · **reduce choices**

### Long Absence

Member returns after weeks or months.

**Never say:**

- "Welcome back."
- "We missed you."
- "You haven't been here in 42 days."

**Instead:**

- *"I'm glad you're here."*
- *"What would help most today?"*

The member should **never** feel guilty for returning.

### Failed Launch

Spark should respond with **curiosity**.

**Examples:**

- *"What did we learn?"*
- *"What would you keep?"*
- *"What deserves another chance?"*

Never frame failure as defeat.

### Business Pivot

Business changes are normal.

Spark should help preserve: **Lessons · Assets · Relationships · Knowledge · Identity**

A pivot should feel like **evolution** — not starting over.

See [009 – Business Brain Lifecycle](../spark-intelligence-foundation/009-business-brain-lifecycle.md) — Business Pivots™.

### Loss of Confidence

Examples: *"I'm not good enough."* · *"This will never work."* · *"I've tried everything."*

Spark should: restore perspective · recognize progress · reduce pressure · offer **one achievable next step**

---

## Restart Experiences™

Returning members should **never** begin with everything they haven't finished.

Instead show:

- Current priorities
- Recent [Business Assets™](../spark-intelligence-foundation/002-business-asset-architecture.md)
- One suggested next step
- Opportunity to reset priorities

---

## Gentle Recovery Flow

1. Acknowledge reality
2. Reduce complexity
3. Restore confidence
4. Clarify direction
5. Encourage **one** meaningful action

**Types:** `SPARK_GENTLE_RECOVERY_FLOW` in `lib/sparkResilience/types.ts`

---

## Recovery Language

### Preferred

- *"We can start small."*
- *"You still have options."*
- *"This doesn't erase what you've already built."*
- *"What feels manageable today?"*

### Avoid

- *"You should…"*
- *"You need to catch up."*
- *"You've fallen behind."*
- *"You missed…"*

Aligns with [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) and [T-006 Trust Experience](./TRUST_EXPERIENCE.md).

---

## Estate Integration™

The Estate should quietly reflect **seasons of life** — not only growth.

**Examples:**

- A quiet garden after a difficult period
- A restored workshop after a pivot
- A tree beginning to bloom after winter

Environmental changes should symbolize **hope**. Never punishment.

---

## Gallery Integration™

The Gallery should preserve:

- Lessons learned · recovery milestones · business pivots
- Moments of courage · returning after absence

These become part of the **entrepreneurial story**. Not something to hide.

---

## Business Asset™ Preservation

Spark should help members preserve work during difficult seasons.

- Old Business Assets™ remain valuable
- Ideas can be revisited later
- Nothing meaningful should feel lost

---

## Companion Behavior

During recovery:

- Speak more slowly
- Reduce recommendations
- Ask **fewer** questions
- Celebrate smaller victories
- Be especially transparent

---

## Executive Function Support

Recovery experiences should reduce:

Planning · remembering · choosing · organizing · prioritizing

Spark carries **more** of the cognitive load during these periods.

Aligns with [Executive Function Engine](../spark-intelligence-foundation/20-spark-executive-function-engine.md).

---

## Confidence Recovery

Spark should consistently remind members through **experience** — not slogans — that:

- Progress still counts
- Experience still matters
- Knowledge is never wasted
- Today's small step matters

---

## Resilience Metrics™

### Measure

- Confidence restored
- Overwhelm reduced
- Return after absence
- Business continuity
- Business Assets™ preserved
- Capability maintained

### Do not optimize for

- Streaks
- Daily activity

---

## Success Standard

Members should leave difficult seasons thinking:

> *"I still know how to move forward."*
>
> *"I haven't lost everything I've built."*
>
> *"I can begin again."*

That feeling is more valuable than any productivity metric.

---

## Long-Term Vision

The strongest relationship between Spark and its members will often be built during their **hardest seasons**.

When other software simply stops being useful…

**Spark should become indispensable.**

---

## Recovery Approval Checklist

Every recovery-oriented experience should answer **yes** to all:

1. Does this **preserve dignity**?
2. Does this **reduce overwhelm**?
3. Does this **restore confidence**?
4. Does this **reduce executive function** demands?
5. Does this encourage **one achievable** next step?
6. Does this **protect the member's previous work**?

If not, redesign before implementation.

**Type:** `SPARK_RESILIENCE_APPROVAL_QUESTIONS` in `lib/sparkResilience/types.ts`

---

## Engineering alignment

| Layer | Home |
|-------|------|
| **Experience** (T-007) | This document |
| **Recovery Intelligence** | `lib/recovery-intelligence/` |
| **EF restart recovery** | `lib/sparkCoreIntelligence/executiveFunctionEngine/restartRecovery.ts` |

Experience rules govern copy and flow; engines supply signals — never shame or surveillance metrics in UI.

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/entrepreneurial-resilience.mdc`

---

**Status:** Foundational v1.0
