# CURSOR SPEC — T-011 Spark Card™ Framework

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-011 |
| **Title** | Spark Card™ Framework |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Product & Experience |
| **Applies to** | Spark Card™ Library, Companion introductions, Create™, Momentum Builders™, Business Assets™, Gallery™, Guilds™, Daily Discoveries™ |
| **Related** | [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [T-012 Momentum Builders](./MOMENTUM_BUILDER_FRAMEWORK.md) · [T-015 Gallery](./GALLERY_FRAMEWORK.md) · [T-016 Daily Discoveries](./DAILY_DISCOVERIES_FRAMEWORK.md) · [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) · [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) · [T-009 Companion Relationship](./COMPANION_RELATIONSHIP_FRAMEWORK.md) · [004 – Spark Knowledge Model](../spark-intelligence-foundation/004-spark-knowledge-model.md) · [003 – Business Brain](../spark-intelligence-foundation/003-business-brain.md) · [002 – Business Assets](../spark-intelligence-foundation/002-business-asset-architecture.md) |

---

## Purpose

This specification defines the architecture for **Spark Cards™**.

Spark Cards™ are **not collectible rewards**.

They are **living pieces of entrepreneurial wisdom**.

Each card should make the entrepreneur **stronger**.

Over time, the Spark Card™ Library should become one of Spark's most valuable intellectual assets.

---

## Core Philosophy

Traditional learning gives people **information**.

Spark Cards™ create **understanding**.

Every card should answer one question:

> **"How does knowing this make me a better entrepreneur?"**

A card is successful only if the member can **immediately apply** what they learned.

---

## Spark Cards™ Are Living Knowledge

Spark Cards™ are not static.

They evolve as:

- the member grows
- the business changes
- new Business Assets™ are created
- the Guidance Engine™ learns
- AI knowledge evolves
- entrepreneurial experience increases

Cards should become **more valuable over time**.

---

## Every Card Must Answer Five Questions

### 1. What is it?

A clear explanation. No jargon. No unnecessary complexity.

### 2. Why does it matter?

Explain why this concept is important. Connect it to real entrepreneurial success.

### 3. How does it apply generally?

Show how entrepreneurs commonly use it. Provide practical business examples.

### 4. How does it apply to THIS business?

This is Spark's differentiator.

The **Business Brain™** should personalize the explanation using:

- current offers
- audience
- products
- Business Assets™
- goals
- brand voice

Every member should feel like the card was **written for them**.

### 5. What should I do next?

Every card ends with a **practical implementation**.

Never leave members inspired but unsure.

**Type:** `SparkCardFiveQuestions` in `lib/sparkCards/types.ts`

---

## Card Anatomy

Every Spark Card™ should contain:

| Field | Purpose |
|-------|---------|
| Title | Clear, timeless |
| Category | Knowledge domain |
| Capability Domain | What capability this strengthens |
| Difficulty Level | Progressive learning |
| Business Stage | Journey alignment (inferred, not gatekeeping) |
| Estimated Reading Time | EF-friendly skim |
| Explanation | What + why |
| Business Examples | General application |
| Personal Application | Brain-personalized section |
| Implementation | Concrete next step |
| Related Cards | Knowledge graph edges |
| Related Momentum Builder™ | Practice path |
| Related Business Assets™ | Asset context |
| Related Guild™ | Community depth |
| Related Gallery Memories™ | Transformation history |
| Related Daily Discoveries™ | Curiosity links |
| Reflection Question | Optional depth |
| Suggested Next Step | Never end without action |

**Type:** `SparkCardDefinition` in `lib/sparkCards/types.ts`

---

## Capability Connections

Every card strengthens one or more capabilities.

Examples: Decision Making · Marketing · Leadership · Executive Function · Pricing · Storytelling · Research · Branding · Innovation · AI Fluency

**No card exists without a capability purpose.**

---

## Card Categories

Examples include:

Marketing · Sales · Leadership · Communication · Strategy · Decision Making · Innovation · Finance · Operations · AI · Customer Psychology · Behavioral Economics · Negotiation · Productivity · Executive Function · Business History · Mental Models · Systems Thinking · Branding · Personal Growth

Future categories should **inherit this architecture**.

**Type:** `SparkCardCategory` in `lib/sparkCards/types.ts`

---

## Personalization™

Spark Cards™ should adapt automatically.

Instead of generic examples, use:

- Current Business Assets™
- Current audience
- Current projects
- Recent conversations
- Current goals
- Member experience level

The same card should feel **different for different members**.

Never expose "personalization engine" language in member UI.

---

## Progressive Learning

Cards should evolve.

| Early relationship | Later relationship |
|--------------------|------------------|
| Simple explanations | Advanced insights |
| Foundational examples | Connections and nuance |
| Single application | Trade-offs |

Members grow. Cards grow.

---

## Rare Discovery Cards™

Some Spark Cards™ should be discovered naturally.

Examples:

- Estate exploration
- Hidden Momentum moments
- Business anniversaries
- Special reflections
- Community contributions
- Historic business dates

Rare cards should celebrate **curiosity**.

**Never manipulate behavior.**

Aligns with [T-005 Pattern 12 — Curiosity](./EXPERIENCE_PATTERNS.md).

---

## Card Collections™

Members naturally build collections.

Examples: Marketing Mastery™ · Leadership Library™ · Decision Toolkit™ · Creative Thinking™ · Workshop Builder™ · Pricing™ · AI™ · Brand™ · Customer Experience™

Collections **organize knowledge**.

Not status.

---

## Business Asset Integration™

Spark Cards™ should naturally appear while building.

```
Creating a workshop
    ↓
Relevant Storytelling card

Creating pricing
    ↓
Pricing Psychology card

Building a website
    ↓
Customer Trust card
```

Knowledge appears **exactly when useful**.

---

## Momentum Builder™ Integration

```
Momentum Builder™
    ↓
Spark Card™
    ↓
Business Asset™
    ↓
Gallery™
    ↓
Guidance™
```

Momentum Builders™ **strengthen** understanding.

Spark Cards™ **deepen** understanding.

---

## Gallery Integration

Important Spark Cards™ become part of entrepreneurial history.

Example: *"This principle changed how you price your services."*

Gallery remembers **transformation**.

Not reading.

See [T-015 Gallery Framework](./GALLERY_FRAMEWORK.md).

---

## Companion Behavior

The Companion introduces cards **naturally**.

**Never:** "Here's another card."

**Instead:** "This idea reminds me of something that might help..."

Cards should feel **conversational**.

Passes [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) Shari test.

---

## Physical Collectible Vision™

Spark Cards™ should be beautiful enough that members may eventually choose to collect printed editions.

- Premium design
- Timeless typography
- Elegant illustrations
- No cartoon styling
- No game aesthetics

The **digital experience comes first**.

Physical collections become an optional extension of the Spark experience.

---

## Executive Function Standards

Cards should:

- Be easy to skim
- Use progressive disclosure
- Highlight practical actions
- Avoid overwhelming detail
- Allow deeper exploration

Knowledge should feel **approachable**.

---

## Journey Adaptation (T-010)

Spark Cards™ should **quietly recommend different knowledge** based on inferred journey stage.

| Stage | Card emphasis |
|-------|---------------|
| Dream | Exploration, confidence, possibility |
| Clarify | Audience, positioning, focus |
| Design | Planning, storytelling, structure |
| Build | Execution, consistency, EF |
| Launch | Marketing, sales, feedback |
| Grow | Operations, leadership, optimization |
| Multiply | Innovation, teaching, expansion |
| Legacy | Reflection, mentorship, impact |

Never announce stage. Adapt content and surfacing.

---

## Success Standard

Members should think:

- "I understand this."
- "I know how to use this."
- "I can apply this today."

**Not:** "That was interesting."

Understanding without application is **incomplete**.

---

## Long-Term Vision

Years from now, Spark Cards™ should become one of the world's richest entrepreneurial knowledge libraries.

Not because there are thousands of cards.

Because every card is:

- **Connected**
- **Personalized**
- **Actionable**
- **Transformational**

---

## Spark Card Specification Template

Every Spark Card™ must explicitly define:

| Field | Required |
|-------|----------|
| Capability Domain | Yes |
| Entrepreneurial Stage | Yes (journey alignment) |
| Business Asset™ Connections | When relevant |
| Momentum Builder™ Connections | When relevant |
| Guild™ Connections | When relevant |
| Gallery™ Opportunities | When relevant |
| Companion Introduction Strategy | Yes |
| Personalization Opportunities | Yes |
| Practical Implementation | Yes — always |

**Type:** `SparkCardSpec` in `lib/sparkCards/types.ts`

If a card cannot clearly strengthen entrepreneurial capability and improve a member's business, **it should not be created**.

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/spark-card-framework.mdc`

**Types:** `lib/sparkCards/types.ts`

**Knowledge ownership:** Spark Cards are experience knowledge + relationship knowledge — see [004 – Spark Knowledge Model](../spark-intelligence-foundation/004-spark-knowledge-model.md).

**Pipeline:** Card surfacing and personalized sections flow through [006 – Spark Response Architecture](../spark-intelligence-foundation/006-spark-response-architecture.md); Brain supplies personalization inputs only.

---

**Status:** Foundational v1.0
