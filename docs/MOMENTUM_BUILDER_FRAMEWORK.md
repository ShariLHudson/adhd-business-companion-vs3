# CURSOR SPEC — T-012 Momentum Builder™ Framework

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-012 |
| **Title** | Momentum Builder™ Framework |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Product & Experience |
| **Applies to** | Momentum Builder™ Library, Capability Graph™, Business Assets™, Spark Cards™, Gallery™, Guilds™, Estate™, Community™ |
| **Related** | [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [T-011 Spark Cards](./SPARK_CARD_FRAMEWORK.md) · [T-016 Daily Discoveries](./DAILY_DISCOVERIES_FRAMEWORK.md) · [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) · [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) · [T-007 Entrepreneurial Resilience](./ENTREPRENEURIAL_RESILIENCE.md) · [002 – Business Assets](../spark-intelligence-foundation/002-business-asset-architecture.md) · [003 – Business Brain](../spark-intelligence-foundation/003-business-brain.md) |

---

## Purpose

This specification defines the master framework for **Momentum Builders™**.

Momentum Builders™ are **not games**.

They are short, engaging entrepreneurial experiences designed to **strengthen real business capabilities**.

Their purpose is not entertainment.

Their purpose is **transformation through practice**.

Every Momentum Builder™ should leave members **more capable** than when they started.

---

## Core Philosophy

Entrepreneurs don't improve by consuming more information.

They improve by **practicing better thinking**.

Momentum Builders™ provide that practice.

Every Builder should answer one question:

> **"How will this make the member a stronger entrepreneur?"**

---

## Definition

A Momentum Builder™ is:

A **short (2–10 minute)** guided entrepreneurial experience that strengthens one or more capabilities while creating momentum toward **real-world business progress**.

Builders should feel:

- engaging
- rewarding
- intelligent
- practical
- low pressure

**Never:**

- childish
- arcade-like
- repetitive
- manipulative
- disconnected from business

---

## Primary Objectives

Every Momentum Builder™ should accomplish **at least one** of:

| Objective |
|-----------|
| Strengthen thinking |
| Increase confidence |
| Practice decision-making |
| Reduce executive function load |
| Improve creativity |
| Teach entrepreneurial principles |
| Improve Business Assets™ |
| Generate useful insights |
| Build momentum |

---

## Builder Categories

| Category | Examples |
|----------|----------|
| **Strategic Thinking** | Opportunity Spotting™ · Second-Order Thinking™ · Business Trade-Offs™ · Pattern Recognition™ |
| **Decision Making** | Executive Decisions™ · Pricing Challenge™ · Risk Explorer™ · Priority Compass™ |
| **Marketing** | Headline Makeover™ · Offer Positioning™ · Audience Match™ · Value Proposition™ |
| **Sales** | Sales Conversation™ · Objection Practice™ · Discovery Questions™ · Negotiation™ |
| **Creativity** | Constraint Challenge™ · Innovation Sprint™ · Idea Evolution™ · Reframe Exercise™ |
| **Executive Function** | Prioritization™ · Focus Sprint™ · Mental Decluttering™ · Decision Sorting™ · Planning Practice™ |
| **Leadership** | Difficult Conversation™ · Delegation Practice™ · Leadership Reflection™ · Influence Builder™ |
| **AI Fluency** | Prompt Improvement™ · AI Evaluation™ · Workflow Design™ · Automation Thinking™ |

**Type:** `MomentumBuilderDomain` in `lib/sparkMomentumBuilders/types.ts`

---

## Builder Structure

Every Momentum Builder™ follows this pattern:

```
Arrival
    ↓
Context
    ↓
Challenge
    ↓
Practice
    ↓
Insight
    ↓
Reflection
    ↓
Business Application
    ↓
Capability Growth
    ↓
Connection
```

Aligns with [T-005 Pattern 5 — Practice](./EXPERIENCE_PATTERNS.md) and Experience Flow stages.

**Type:** `MomentumBuilderFlowStage` in `lib/sparkMomentumBuilders/types.ts`

---

## Real Business Connection

Every Builder must connect to something **real**.

Examples: Current Business Asset™ · current goal · marketing campaign · offer · workshop · client · sales process

**Never** create abstract exercises that cannot be applied.

---

## Time Philosophy

**Default:** 2–10 minutes.

Members should complete a Builder during coffee breaks, waiting rooms, lunch, travel, or between meetings.

Small investments. Meaningful returns.

---

## Difficulty Levels

Instead of Easy / Medium / Hard, use:

| Level | Emphasis |
|-------|----------|
| **Explore™** | Introduction |
| **Practice™** | Guided repetition |
| **Apply™** | Real business context |
| **Master™** | Nuance and trade-offs |

The emphasis is **growth**. Not performance.

**Type:** `MomentumBuilderGrowthLevel` in `lib/sparkMomentumBuilders/types.ts`

---

## No Winning

Momentum Builders™ should **rarely have winners**.

Instead celebrate:

- Insights
- Improved thinking
- New perspectives
- Capability growth
- Business application

**Learning is the reward.**

---

## Reflection

Every Builder ends with **one thoughtful question**.

Examples:

- "What surprised you?"
- "How could this improve your business?"
- "What would you do differently?"
- "What opportunity did you notice?"

Reflection converts activity into **learning**.

---

## Business Asset™ Integration

```
Momentum Builder™
    ↓
Current Business Asset™
```

Examples:

| Builder | Asset |
|---------|-------|
| Pricing Builder™ | Current Offer™ |
| Headline Builder™ | Current Website™ |
| Storytelling Builder™ | Workshop™ |

Members **immediately apply** what they practiced.

---

## Spark Card™ Integration

```
Momentum Builder™
    ↓
Relevant Spark Card™
```

Example: Negotiation Builder™ → Negotiation Psychology™ Spark Card™

The Builder creates **curiosity**. The Card **deepens** understanding.

See [T-011 Spark Card Framework](./SPARK_CARD_FRAMEWORK.md).

---

## Gallery Integration

Gallery records:

- Capability growth
- Business breakthroughs
- Creative insights
- Decision milestones

**Not** scores. **Not** completion. **Transformation.**

See [T-015 Gallery Framework](./GALLERY_FRAMEWORK.md).

---

## Guild Integration

```
Marketing Builder™ → Marketing Guild™
Leadership Builder™ → Leadership Guild™
```

Guilds provide **long-term mastery**. Builders provide **practice**.

---

## Community Integration

Occasionally members may **choose** to share insights, approaches, creative solutions, or lessons learned.

**Never** rankings. **Never** leaderboards.

Learning remains **collaborative**.

---

## Estate Integration

Hidden discoveries may occasionally appear during Builders:

- Rare Spark Card™
- Historical entrepreneur
- Seasonal discovery
- Gallery memory
- Observatory insight

Delightful — **never manipulative**. Aligns with T-005 Pattern 12 — Curiosity.

---

## Capability Tracking

Every Builder strengthens one or more capabilities.

Examples: Decision Making · Executive Function · Communication · Marketing · Leadership · Creativity · Confidence · Innovation · Business Strategy

The **Capability Graph™** quietly records growth.

---

## Executive Function Standards

Momentum Builders™ should:

- Reduce overwhelm
- Provide immediate structure
- Require very little setup
- Allow pausing and returning
- Never punish interruptions
- Support ADHD-friendly interaction

---

## Emotional Experience

Members should finish thinking:

- "That was worth my time."
- "I learned something useful."
- "I want to apply this."
- "I'm becoming a better entrepreneur."

**Not:** "I won." · "I earned points."

---

## Journey Adaptation (T-010)

Builders should **quietly emphasize different capabilities** by inferred journey stage.

| Stage | Builder emphasis |
|-------|------------------|
| Dream | Exploration, confidence, creativity |
| Clarify | Strategic thinking, audience, positioning |
| Design | Planning, storytelling, structure |
| **Build** | **EF, focus, consistency, execution** |
| Launch | Marketing, sales, feedback practice |
| Grow | Leadership, operations, optimization |
| Multiply | Innovation, teaching, delegation |
| Legacy | Reflection, mentorship, influence |

Never announce stage. Adapt surfacing and challenge context.

---

## Success Standard

The ideal Momentum Builder™ creates **three outcomes**:

1. **Immediate insight**
2. **Real-world business application**
3. **Long-term entrepreneurial capability**

If all three occur, the Builder succeeds.

---

## Long-Term Vision

Over time, Spark should include hundreds of Momentum Builders™.

Yet every one should feel like part of the same coherent **transformation system**.

The library should become one of the world's richest collections of **entrepreneurial practice** experiences.

Members return not because they chase rewards — but because every Builder genuinely helps them **think better**.

---

## Momentum Builder Specification Template

Every Momentum Builder™ must explicitly define:

| Field | Required |
|-------|----------|
| Primary Capability Domain | Yes |
| Secondary Capability Domain | Optional |
| Entrepreneurial Journey Stage(s) | Yes |
| Business Asset™ Connection | Yes |
| Spark Card™ Connection | When relevant |
| Guild™ Connection | When relevant |
| Gallery Opportunity | When relevant |
| Reflection Question | Yes |
| Practical Business Application | Yes |
| Executive Function Support Strategy | Yes |
| Estimated Completion Time | Yes |

**Type:** `MomentumBuilderSpec` in `lib/sparkMomentumBuilders/types.ts`

If a Builder cannot clearly improve entrepreneurial capability and connect back into the Spark ecosystem, **it should not be built**.

---

## Implementation Note — V1 vs Framework

Current production catalog (`lib/momentumBuilders/`) serves **EF-focused resets** (energy, refocus, calm) — a valid subset under Executive Function domain.

New entrepreneurial-practice Builders should implement **this framework** and extend the catalog without game/arcade patterns.

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/momentum-builder-framework.mdc`

**Types:** `lib/sparkMomentumBuilders/types.ts` (framework) · `lib/momentumBuilders/types.ts` (V1 catalog runtime)

**Learning chain:** Momentum Builder™ → Spark Card™ → Business Asset™ → Gallery™ → Guidance™

---

**Status:** Foundational v1.0
