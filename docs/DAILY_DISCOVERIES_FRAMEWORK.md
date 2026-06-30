# CURSOR SPEC — T-016 Daily Discoveries™ Framework

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-016 |
| **Title** | Daily Discoveries™ Framework |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Daily Discoveries™, Companion™, Observatory™, Business History™, Spark Cards™, Momentum Builders™, Gallery™, Guilds™, Business Assets™, Grow™ |
| **Related** | [Spec 100 — Transformation Constitution](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) · [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) · [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) · [T-011 Spark Cards](./SPARK_CARD_FRAMEWORK.md) · [T-012 Momentum Builders](./MOMENTUM_BUILDER_FRAMEWORK.md) · [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [T-015 Gallery](./GALLERY_FRAMEWORK.md) · [003 – Business Brain](../spark-intelligence-foundation/003-business-brain.md) · [005 – Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) |

---

## Purpose

This specification defines the philosophy and architecture of Daily Discoveries™.

Daily Discoveries™ are **not** daily tips.

They are carefully curated moments of entrepreneurial insight designed to expand the member's thinking, spark curiosity, and strengthen capability.

Every Discovery should answer one question:

> **"How will this make me think differently about my business today?"**

---

## Core Philosophy

Most entrepreneurs consume enormous amounts of information.

Very little becomes transformation.

Daily Discoveries™ are intentionally:

- Small
- Meaningful
- Memorable
- Immediately useful

**Quality over quantity.**

**Depth over volume.**

**Curiosity over consumption.**

---

## Mission

Every day Spark should help members discover something **remarkable**.

Not because they need more information.

Because remarkable ideas create remarkable businesses.

---

## Discovery Principle™

Every Discovery must satisfy three conditions.

| Condition | Requirement |
|-----------|-------------|
| **Learn** | Introduce something genuinely valuable |
| **Connect** | Explain why it matters |
| **Apply** | Help the member immediately use it |

If one of these is missing, it is **not** a Spark Discovery.

**Type:** `DiscoveryPrinciple` in `lib/sparkDailyDiscoveries/types.ts`

---

## Discovery Categories™

Spark should rotate naturally between categories.

| Category | Focus |
|----------|-------|
| **Entrepreneur Stories™** | People behind remarkable businesses — lessons, not biographies |
| **This Day in Business™** | Launches · breakthroughs · market shifts · failures |
| **Mental Models™** | First principles · inversion · compounding · systems thinking |
| **Marketing Psychology™** | Buying behavior · trust · pricing · positioning · decision science |
| **AI & Technology™** | Breakthroughs · workflows · tools · trends — always practical |
| **Innovation™** | Inventions · creative problem solving · unexpected ideas |
| **Customer Understanding™** | Behavior · motivation · communication · trust · relationships |
| **Leadership™** | Communication · culture · delegation · influence |
| **Research Spotlight™** | Business research · behavioral science · EF · productivity |
| **Hidden Connections™** | Unexpected relationships between two ideas — memorable bridges |

**Type:** `DiscoveryCategory` in `lib/sparkDailyDiscoveries/types.ts`

---

## Discovery Structure™

Every Discovery follows the same rhythm.

| Stage | Content |
|-------|---------|
| **Remarkable Idea** | Introduce the concept |
| **Why It Matters** | Explain significance |
| **Business Connection** | Relate it to entrepreneurship |
| **Personal Connection** | Connect to **this** member's business (Brain · Assets · goals) |
| **Suggested Action** | One practical application |
| **Related Experiences** | Momentum Builder · Spark Card · Guild · Business Asset · Gallery · Observatory |

The Discovery **never stands alone**.

**Type:** `DiscoveryStructureStage` · `DiscoveryRelatedExperience` in `lib/sparkDailyDiscoveries/types.ts`

---

## Personalization

The same Discovery should feel different for different members.

**Examples:**

- A coach
- An author
- A consultant
- A software founder

Each receives examples relevant to **their** business.

Business Brain™ supplies context — Discovery composes member-facing language through Companion (Spark OS invariant).

---

## Rotation Philosophy

Daily Discoveries™ should feel **surprising**.

Avoid repeating the same category.

Vary naturally across:

- Business · History · Psychology · Innovation · AI · Leadership · Creativity · Research · Patterns

**Type:** `DiscoveryRotationDimension` in `lib/sparkDailyDiscoveries/types.ts`

---

## Curiosity Before Instruction

Spark should **not** lecture.

It should create curiosity.

The member should think:

> *"I've never looked at it that way."*

---

## Reflection™

Every Discovery ends with **one** thoughtful question.

**Examples:**

- *How could this influence your business?*
- *Where have you seen this before?*
- *What assumption might this challenge?*

Reflection transforms information into insight.

**Type:** `DISCOVERY_REFLECTION_PROMPT_EXAMPLES` in `lib/sparkDailyDiscoveries/types.ts`

---

## Observatory Integration

Some Discoveries originate from the Observatory™.

**Examples:**

- AI breakthroughs
- Technology trends
- Market changes
- Emerging business ideas

The future becomes **immediately practical**.

See [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · Observatory section.

---

## Business History Integration

Historical moments naturally become Discoveries.

**Examples:**

- The launch of the first spreadsheet
- The birth of Amazon
- The invention of Post-it Notes
- The first TED Conference

The **lesson** matters more than the date.

---

## Spark Card™ Integration

Every Discovery should connect to one or more Spark Cards™.

Discovery creates **curiosity**.

Spark Cards™ **deepen** understanding.

See [T-011 Spark Card Framework](./SPARK_CARD_FRAMEWORK.md).

---

## Momentum Builder™ Integration

When appropriate:

```
Discovery
    ↓
Momentum Builder™
```

Members immediately **practice** the concept.

See [T-012 Momentum Builder Framework](./MOMENTUM_BUILDER_FRAMEWORK.md).

---

## Gallery Integration

Only **exceptional** Discoveries become Gallery memories.

**Example:** *"This insight changed how you priced your services."*

Gallery preserves **transformation**.

Not reading history.

See [T-015 Gallery Framework](./GALLERY_FRAMEWORK.md).

---

## Companion Behavior

The Companion introduces Discoveries **naturally**.

**Examples:**

- *"Something fascinating came across the Observatory today…"*
- *"This reminded me of something relevant to your business…"*
- *"This business story has surprising similarities to your current project…"*

**Never:**

- *"Here is today's tip."*

Passes [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) Shari test.

**Type:** `DISCOVERY_COMPANION_INTRO_EXAMPLES` in `lib/sparkDailyDiscoveries/types.ts`

---

## Executive Function Standards

Daily Discoveries™ should:

- Take 2–5 minutes
- Be easy to read
- Be memorable
- Reduce overwhelm
- Encourage curiosity

**Not** information overload.

---

## Success Standard

Members should consistently think:

- *"I learned something remarkable."*
- *"I understand why it matters."*
- *"I know how to use it."*
- *"I want to keep exploring."*

**Type:** `DiscoverySuccessSignal` in `lib/sparkDailyDiscoveries/types.ts`

---

## Long-Term Vision

Years from now, Daily Discoveries™ should become one of the most **anticipated** parts of Spark.

Not because members feel obligated.

Because every day they expect to encounter an idea that changes how they think.

Daily Discoveries™ become **daily entrepreneurial nourishment**.

---

## Daily Discovery Specification Template

Every Discovery must explicitly define:

| Field | Required |
|-------|----------|
| Discovery Category | Yes |
| Entrepreneurial Capability Strengthened | Yes |
| Business Brain™ Personalization | Yes |
| Business Asset™ Connections | When relevant |
| Spark Card™ Connections | When relevant |
| Momentum Builder™ Connections | When relevant |
| Guild™ Connections | When relevant |
| Gallery Opportunity | When exceptional (T-015 gate) |
| Reflection Question | Yes |
| Practical Business Application | Yes |

If a Discovery cannot change how the member **thinks** or **acts**, it should not be published.

**Type:** `SparkDailyDiscoverySpec` in `lib/sparkDailyDiscoveries/types.ts`

---

## OS vs Experience Layer

| Layer | Role |
|-------|------|
| **Daily Discoveries™ Framework (T-016)** | What makes a Discovery worthy — Learn · Connect · Apply |
| **Business Brain™** | Personalization inputs — never generates member copy |
| **Ecosystem Connection (T-014)** | Discovery never stands alone — related experiences |
| **V1 environmental hospitality** | `lib/companionEnvironmentIntelligence/dailyDiscovery.ts` — estate ambience signals (distinct from T-016 product) |

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/daily-discoveries-framework.mdc`

**Framework types:** `lib/sparkDailyDiscoveries/types.ts`

Before publishing any Discovery, verify all three Discovery Principle conditions and the specification template. Curiosity over consumption — always.

---

**Status:** Foundational v1.0
