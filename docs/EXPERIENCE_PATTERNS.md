# CURSOR SPEC — T-005 Experience Patterns™

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-005 |
| **Title** | Experience Patterns™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Product & Experience |
| **Applies to** | All member-facing Spark experiences |
| **Related** | [T-003 Universal Experience Standards](./UNIVERSAL_EXPERIENCE_STANDARDS.md) · [T-004 Create™ Philosophy](./CREATE_PHILOSOPHY.md) · [T-006 Trust Experience](./TRUST_EXPERIENCE.md) · [T-007 Entrepreneurial Resilience](./ENTREPRENEURIAL_RESILIENCE.md) · [005 – Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) |

---

## Purpose

This specification defines the **reusable experience patterns** that every member-facing Spark experience must follow.

Instead of designing each feature independently, Spark should reuse a common set of interaction patterns.

This creates:

- Consistency
- Familiarity
- Trust
- Lower cognitive load
- Faster learning
- Stronger emotional continuity

Members should feel like they are moving through **one connected ecosystem** — not dozens of unrelated tools.

---

## Philosophy

Spark does not build features.

**Spark creates experiences.**

Experiences are built from **patterns**.

Patterns become the common language of the ecosystem.

Whether a member is using Create™, Momentum Builders™, Spark Cards™, Gallery™, Estate™, Guilds™, Community™, Daily Discoveries™… the **emotional rhythm** should feel familiar.

---

## The Twelve Patterns

**Implementation types:** `lib/sparkExperiencePatterns/types.ts`

---

### Pattern 1 — Discovery

#### Purpose

Help members notice something valuable.

Not by teaching.

By helping them **discover**.

#### Examples

- Daily Discovery™
- Spark Cards™
- Hidden Estate discoveries
- AI discoveries
- Business history
- Founder stories

The member should think:

> *"I didn't know that."*

Follow immediately with:

> *"Here's why it matters to your business."*

Never leave learning disconnected from application.

---

### Pattern 2 — Clarity

#### Purpose

Reduce confusion. Organize thinking.

#### Used by

- Create™
- Companion
- Decision Support
- Planning

The experience should: **Simplify · Organize · Prioritize · Summarize · Reduce overwhelm**

Every clarity experience ends with: **A clearer next step.**

---

### Pattern 3 — Creation

#### Purpose

Transform ideas into [Business Assets™](../spark-intelligence-foundation/002-business-asset-architecture.md).

Not documents. Members should feel like **builders**, not prompt engineers.

#### Typical flow

```
Idea → Conversation → Structure → Creation → Review → Business Asset™ → Reflection
```

See [T-004 Create™ Philosophy](./CREATE_PHILOSOPHY.md).

---

### Pattern 4 — Decision

#### Purpose

Support — not replace — decision making.

Spark **never** decides. Spark helps members think.

Decision experiences should provide: **Options · Trade-offs · Questions · Risks · Benefits · Reasoning**

The member always chooses.

**Full specification:** [T-008 Decision Experience Framework](./DECISION_EXPERIENCE_FRAMEWORK.md)

---

### Pattern 5 — Practice

#### Purpose

Strengthen entrepreneurial capability.

#### Used primarily by

- Momentum Builders™
- Guilds™
- Learning experiences

The focus is **improvement**. Not completion.

**Full specification:** [T-012 Momentum Builder Framework](./MOMENTUM_BUILDER_FRAMEWORK.md)

---

### Pattern 6 — Reflection

#### Purpose

Help learning become wisdom.

Reflection should be: **Short · Optional · Thoughtful · Never forced.**

#### Examples

- "What became clearer?"
- "What surprised you?"
- "What would you do differently?"
- "How could this strengthen your business?"

---

### Pattern 7 — Celebration

#### Celebrate

- Growth · Capability · Courage · Progress · Milestones · Business Assets™ · Returning after difficulty

#### Do not celebrate

- Clicks · Daily streaks · Tiny actions · Artificial achievements

Celebration should feel **earned**.

---

### Pattern 8 — Recovery

#### Purpose

Support members during: burnout · overwhelm · long absences · failed launches · pivots · discouragement

Recovery should **restore confidence before productivity**.

Spark first helps members breathe. Then helps them move.

**Full specification:** [T-007 Entrepreneurial Resilience](./ENTREPRENEURIAL_RESILIENCE.md)

---

### Pattern 9 — Guidance

#### Purpose

Provide direction without taking control.

Guidance always includes: **Options · Reasoning · Trade-offs · Next steps**

Members remain in charge.

---

### Pattern 10 — Connection

#### Purpose

Strengthen ecosystem relationships.

Every experience should naturally connect to something else.

#### Example chains

```
Spark Card™ → Momentum Builder™
Business Asset™ → Gallery™
Discovery™ → Guild™
Create™ → Community
```

Nothing meaningful should end in isolation.

---

### Pattern 11 — Legacy

#### Purpose

Help members see how far they've come.

#### Examples

- Gallery™
- Business anniversaries
- Milestones
- Past launches
- Lessons learned
- Growth over time

Legacy builds **confidence**.

---

### Pattern 12 — Curiosity

#### Purpose

Encourage exploration without pressure.

#### Examples

- Hidden Estate discoveries
- Rare Spark Cards™
- Unexpected insights
- Founder stories
- Historical business moments

Curiosity should feel **delightful**. Never manipulative.

---

## Pattern Flow

Most Spark experiences should follow this rhythm:

```
Arrival
    ↓
Orientation
    ↓
Participation
    ↓
Insight
    ↓
Application
    ↓
Reflection
    ↓
Connection
    ↓
Growth
```

Not every experience requires every stage.

But every experience should feel **complete**.

Aligns with [T-003](./UNIVERSAL_EXPERIENCE_STANDARDS.md) Experience Flow Pattern.

---

## Executive Function Standards

Every experience pattern should:

| Reduce | Increase |
|--------|----------|
| Memory demands | Clarity |
| Planning effort | Confidence |
| Decision fatigue | Capability |
| Context switching | |
| Unnecessary choices | |

---

## Pattern Selection Rules

Select the **smallest number of patterns** necessary.

Do not combine multiple complex patterns into one experience unless there is a compelling reason.

**Simple experiences are generally better.**

---

## Experience Consistency Rule

Members should never have to learn a different interaction style for each area of Spark.

The interaction patterns become the **invisible language** of the platform.

That familiarity reduces cognitive load and builds trust over time.

---

## Long-Term Vision

As Spark grows to hundreds of experiences, members should still feel:

> *"I already know how this works."*

Not because the screens are identical.

Because the **experience patterns** remain consistent across the entire ecosystem.

---

## Experience Specification Template

Every future experience specification must explicitly identify:

| Field | Required |
|-------|----------|
| Primary Experience Pattern | Yes |
| Secondary Pattern (if needed) | Optional |
| Entrepreneurial Capability strengthened | Yes |
| Business Asset™ connection | Yes |
| Gallery connection (if applicable) | When relevant |
| Spark Card™ connection (if applicable) | When relevant |
| Executive Function support | Yes |

If an experience cannot be described using one or more of these patterns, **redesign it before implementation**.

**Type:** `SparkExperienceSpec` in `lib/sparkExperiencePatterns/types.ts`

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/experience-patterns.mdc`

When designing any member-facing experience, name the primary pattern(s) in the PR or spec header before building UI.

**Related:** [T-011 Spark Card Framework](./SPARK_CARD_FRAMEWORK.md) · [T-012 Momentum Builder Framework](./MOMENTUM_BUILDER_FRAMEWORK.md) — Pattern 10 Connection chain and rare discovery (Pattern 12).

---

**Status:** Foundational v1.0
