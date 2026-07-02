# CURSOR SPEC — T-014 Ecosystem Connection Framework™

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-014 |
| **Title** | Ecosystem Connection Framework™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Companion™, Create™, Momentum Builders™, Spark Cards™, Business™, Gallery™, Estate™, Guilds™, Community™, Daily Discoveries™, Observatory™, Guidance™ |
| **Related** | [Spec 100 — Transformation Constitution](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) · [Spec 101 — Response Quality](./RESPONSE_QUALITY_FRAMEWORK.md) · [Spec 102 — Trust Experience](./TRUST_EXPERIENCE_FRAMEWORK.md) · [Spec 104 — Create Experience](./CREATE_EXPERIENCE_PHILOSOPHY.md) · [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) · [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) · [T-011 Spark Cards](./SPARK_CARD_FRAMEWORK.md) · [T-012 Momentum Builders](./MOMENTUM_BUILDER_FRAMEWORK.md) · [T-015 Gallery](./GALLERY_FRAMEWORK.md) · [T-016 Daily Discoveries](./DAILY_DISCOVERIES_FRAMEWORK.md) · [T-004 Create™ Philosophy](./CREATE_PHILOSOPHY.md) · [004 – Spark Knowledge Model](../spark-intelligence-foundation/004-spark-knowledge-model.md) |

---

## Purpose

This specification defines how **every major experience** inside Spark connects to every other experience.

Spark should **never** feel like separate modules.

It should feel like **one living entrepreneurial ecosystem**.

Members should naturally flow from one experience to another without feeling like they are switching applications.

---

## Core Philosophy

Nothing meaningful in Spark **stands alone**.

Every meaningful interaction should strengthen **at least one other part** of the ecosystem.

The value of Spark comes from the **relationships between experiences** — not the experiences themselves.

Aligns with [Spec 100](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) Connection Principle and [Spec 101](./RESPONSE_QUALITY_FRAMEWORK.md) Connection standard.

---

## The Connection Principle™

Every experience must answer:

> **What should naturally happen next?**

**Never** end an experience with a dead end.

Instead, gently offer the **next most valuable opportunity**.

---

## Connected Experience Model

Spark should function as a **living cycle**:

```
Question
    ↓
Guidance™
    ↓
Momentum Builder™
    ↓
Spark Card™
    ↓
Business Asset™
    ↓
Gallery™
    ↓
Reflection
    ↓
Capability Growth
    ↓
Guidance™ becomes smarter
```

Every completed experience **enriches** future experiences.

**Type:** `SparkConnectedExperienceCycleStage` in `lib/sparkEcosystemConnection/types.ts`

---

## Core Ecosystem Relationships

### Companion™

The Companion is the **front door**.

It introduces members to every other experience — naturally recommends Momentum Builders™, Spark Cards™, Guilds™, Business Assets™, Gallery™, Community™.

The Companion **never** feels like a menu. It feels like a **guide**.

**The Conversation Front Door™** ([Estate Intelligence](./ESTATE_INTELLIGENCE_FRAMEWORK.md)): if a member can accomplish something by talking to Spark, they should never have to hunt through the Estate to find it. Rooms deepen the experience; conversation is how they enter.

See [T-009 Companion Relationship](./COMPANION_RELATIONSHIP_FRAMEWORK.md) · [T-017 Estate Rooms](./ESTATE_ROOMS_FRAMEWORK.md).

---

### Momentum Builders™

Connect to: Spark Cards™ · Business Assets™ · Gallery™ · Guilds™ · Capability Graph™ · Reflection.

Builders create **momentum**. Other systems **deepen** it.

See [T-012 Momentum Builder Framework](./MOMENTUM_BUILDER_FRAMEWORK.md).

---

### Spark Cards™

Connect to: Momentum Builders™ · Business Assets™ · Gallery™ · Guilds™ · Community · Daily Discoveries™.

Cards create **understanding**. Builders create **practice**.

See [T-011 Spark Card Framework](./SPARK_CARD_FRAMEWORK.md).

---

### Create™

Every Business Asset™ should connect to: Spark Cards™ · Momentum Builders™ · Guidance™ · Gallery™ · Reflection · Business History™.

Create should **never** feel isolated.

See [Spec 104 Create™ Experience Philosophy](./CREATE_EXPERIENCE_PHILOSOPHY.md) · [T-004 Create™ Philosophy](./CREATE_PHILOSOPHY.md).

---

### Business™

Business Assets™ are the **center** of the member's entrepreneurial world.

Every major experience should strengthen an existing Business Asset **whenever possible**.

See [002 – Business Asset Architecture](../spark-intelligence-foundation/002-business-asset-architecture.md).

---

### Gallery™

Gallery is **never** simply history.

Gallery should influence: Guidance™ · Reflection · Momentum recommendations · Estate evolution · Anniversaries · Capability recognition.

Gallery **preserves transformation**.

See [T-015 Gallery Framework](./GALLERY_FRAMEWORK.md).

---

### Estate™

Estate should quietly celebrate growth — **not** with trophies.

With: new discoveries · changing seasons · hidden experiences · visual evolution.

Estate reflects the **entrepreneurial journey**. See [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) · [T-017 Estate Rooms](./ESTATE_ROOMS_FRAMEWORK.md).

---

### Guilds™

Guilds connect: Momentum Builders™ · Spark Cards™ · Business Assets™ · Community™ · Gallery™ · Reflection.

Guilds provide **long-term mastery**.

---

### Community™

Encourage: discussion · shared learning · Business Asset feedback · founder stories · collective wisdom.

**Never** popularity contests.

---

### Daily Discoveries™

Every Discovery should suggest: Spark Card™ · Momentum Builder™ · Business History story · Business Asset improvement · reflection.

Knowledge should **immediately become useful**.

See [T-016 Daily Discoveries Framework](./DAILY_DISCOVERIES_FRAMEWORK.md).

---

### Observatory™

Insights connect to: Create™ · Business Strategy™ · Spark Cards™ · Daily Discoveries™ · Momentum Builders™ · Business Assets™.

The future should **immediately become practical**.

---

## Gentle Guidance

Spark should **recommend**. **Never interrupt**.

| After | Example bridge |
|-------|----------------|
| Momentum Builder | "You may enjoy this Spark Card." |
| Create™ | "Would you like to strengthen this with a short Momentum Builder?" |
| Gallery | "Would you like to reflect on what you've learned since then?" |

Recommendations should feel **thoughtful**. Never promotional. Passes Shari test ([Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md)).

**Type:** `SparkGentleGuidanceBridge` in `lib/sparkEcosystemConnection/types.ts`

---

## No Dead Ends

Every major experience should end with **one thoughtfully chosen recommendation**.

**Never** display five competing actions.

The member should always know: **"What would help me most next?"**

Aligns with [Spec 103](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · [T-003](./UNIVERSAL_EXPERIENCE_STANDARDS.md) — max three choices; one primary action.

---

## Executive Function Standards

Connections should:

- Reduce decision fatigue
- Reduce searching
- Reduce remembering
- Reduce context switching

Spark **quietly carries** the member forward.

---

## Intelligent Recommendations

Connections should be personalized using:

- Business Brain™
- Current Business Assets™
- Entrepreneurial Journey Stage™ ([T-010](./FOUNDER_JOURNEY_FRAMEWORK.md))
- Capability Graph™
- Transformation Graph™
- Current priorities
- Recent conversations

Recommendations become **increasingly relevant** over time.

**Type:** `SparkEcosystemRecommendationSignals` in `lib/sparkEcosystemConnection/types.ts`

---

## Visual Consistency

Transitions between experiences should feel **seamless**.

Use: consistent layouts · language · navigation · visual rhythm.

Members should never feel like they entered a **different application**.

See [T-003 Universal Experience Standards](./UNIVERSAL_EXPERIENCE_STANDARDS.md).

---

## Success Standard

Members should naturally think:

- "I always know what to do next."
- "I don't have to search."
- "Everything connects."
- "Spark understands where I'm going."

---

## Long-Term Vision

Years from now, members should struggle to describe where one Spark experience **ends** and another **begins**.

The ecosystem should feel like **one continuous entrepreneurial journey**.

Every interaction quietly strengthens the next.

That continuity becomes one of Spark's defining **competitive advantages**.

---

## Ecosystem Connection Specification Template

Every future feature must explicitly document:

| Field | Required |
|-------|----------|
| Experiences that lead into it | Yes |
| Experiences it strengthens | Yes |
| Natural next recommendation | Yes — one primary |
| Business Assets™ supported | When relevant |
| Capability strengthened | Yes |
| Executive function reduction | Yes |

**Type:** `SparkEcosystemConnectionSpec` in `lib/sparkEcosystemConnection/types.ts`

If a feature cannot connect naturally into the Spark ecosystem, **redesign before implementation**.

Extends `SparkExperienceSpec` ([T-005](./EXPERIENCE_PATTERNS.md)) with full ecosystem edges.

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/ecosystem-connection-framework.mdc`

**Types:** `lib/sparkEcosystemConnection/types.ts`

**Pattern:** T-005 Pattern 10 — Connection is the default close of every experience flow.

---

**Status:** Foundational v1.0
