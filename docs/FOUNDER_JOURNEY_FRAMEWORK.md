# CURSOR SPEC — T-010 Founder Journey Framework™

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-010 |
| **Title** | Founder Journey Framework™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Product & Experience |
| **Applies to** | Companion, Guidance, Create™, Momentum, Spark Cards, Guilds, Estate — all journey-adaptive experiences |
| **Related** | [T-009 Companion Relationship](./COMPANION_RELATIONSHIP_FRAMEWORK.md) · [T-011 Spark Cards](./SPARK_CARD_FRAMEWORK.md) · [T-012 Momentum Builders](./MOMENTUM_BUILDER_FRAMEWORK.md) · [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) · [002 – Business Assets](../spark-intelligence-foundation/002-business-asset-architecture.md) · [005 – Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) |

---

## Purpose

This specification defines how Spark **adapts** as entrepreneurs evolve throughout their business journey.

Spark should not treat every entrepreneur the same.

The needs of someone with an idea are fundamentally different from someone scaling a successful business.

The Companion, Guidance Engine™, Create™, Momentum Builders™, Spark Cards™, Guilds™, and Estate™ should all **quietly adapt** based on where the member is in their entrepreneurial journey.

The goal is not to categorize members.

The goal is to **meet them where they are**.

---

## Core Philosophy

Entrepreneurship is not a destination.

It is a **continuous journey of growth**.

Spark should evolve with the entrepreneur.

Not require the entrepreneur to adapt to Spark.

---

## Journey Principle™

> Spark should always understand two things:
>
> **Where the member is today.**
>
> **What the most helpful next stage could be.**

Spark **never pushes**.

It **guides**.

---

## Entrepreneurial Journey Stages™

These are **not rigid labels**.

Members may move forward, backward, or revisit earlier stages.

Spark should adapt naturally.

| Stage | Focus | Spark priorities |
|-------|-------|------------------|
| **1 Dream™** | Ideas, possibilities, vision, curiosity | Encourage exploration · reduce fear · build confidence · avoid overwhelming planning |
| **2 Clarify™** | Direction, audience, offers, purpose | Clarify · organize · simplify · challenge assumptions |
| **3 Design™** | Business Assets™, brand, messaging, systems | Create™ · structure · decision support |
| **4 Build™** | Execution, implementation, momentum | Momentum Builders™ · EF support · asset completion · progress |
| **5 Launch™** | Visibility, marketing, sales, feedback | Marketing guidance · launch support · reflection · Gallery |
| **6 Grow™** | Optimization, delegation, scaling, leadership | Strategy · operations · decision support · automation |
| **7 Multiply™** | Expansion, teaching, influence, IP | Create™ · Guilds™ · mentoring · advanced strategy |
| **8 Legacy™** | Reflection, contribution, mentorship, impact | Gallery · Community · teaching · Estate evolution |

**Types:** `EntrepreneurialJourneyStage` in `lib/sparkFounderJourney/types.ts`

---

## Stage Details

### Dream™ — Member questions

*"Could I actually do this?"* · *"Where do I begin?"* · *"What business fits me?"*

### Clarify™ — Member questions

*"What exactly am I building?"* · *"Who am I helping?"* · *"What problem do I solve?"*

### Design™ — Member questions

*"What needs to exist?"* · *"How should this work?"*

### Build™ — Member questions

*"How do I keep moving?"* · *"What should I work on next?"*

### Launch™ — Member questions

*"How do I get customers?"* · *"What should I improve?"*

### Grow™ — Member questions

*"How do I grow sustainably?"* · *"What deserves more attention?"*

### Multiply™ — Member questions

*"What else becomes possible?"* · *"How do I multiply my impact?"*

### Legacy™ — Member questions

*"What do I want to leave behind?"* · *"How can I help others succeed?"*

---

## Journey Is Not Linear

Members may:

```
Launch → Pivot → Clarify → Build → Launch again
```

Spark should **never** imply failure.

The journey naturally **loops**.

Aligns with [009 – Business Brain Lifecycle](../spark-intelligence-foundation/009-business-brain-lifecycle.md) — Business Pivots™.

---

## Stage Detection™

Spark should infer stages using:

- Business Assets™ · goals · current projects · conversation
- Business Brain™ · guidance history

**Never** require members to manually choose a stage.

**Technical note:** Founder ecosystem uses `lib/ecosystem/journey/founderJourneyEngine.ts` (idea → scaling) for operator analytics — member experience stages (Dream → Legacy) are the **experience vocabulary**; map signals quietly, never expose rigid labels in UI.

---

## Adaptive Experiences™

Every major Spark experience should quietly adapt:

| System | Adapts |
|--------|--------|
| **Create™** | Different guidance depth |
| **Momentum Builders™** | Different capabilities — [T-012](./MOMENTUM_BUILDER_FRAMEWORK.md) |
| **Spark Cards™** | Different knowledge — [T-011](./SPARK_CARD_FRAMEWORK.md) |
| **Community™** | Different discussions |
| **Estate™** | Entrepreneur's season |

---

## Guidance Adaptation™

| Stage | Guidance emphasis |
|-------|-------------------|
| Dream™ | Exploration |
| Build™ | Execution |
| Grow™ | Optimization |
| Legacy™ | Impact |

Same Companion. **Different priorities.**

---

## Capability Emphasis™

| Stage | Capabilities emphasized |
|-------|----------------------|
| Dream™ | Creativity · curiosity · confidence |
| Clarify™ | Strategic thinking · customer understanding · communication |
| Design™ | Planning · storytelling · business design |
| Build™ | Executive function · focus · consistency |
| Launch™ | Marketing · sales · decision making |
| Grow™ | Leadership · operations · financial thinking |
| Multiply™ | Innovation · delegation · systems thinking |
| Legacy™ | Mentorship · reflection · influence · teaching |

---

## Estate Integration™

The Estate should quietly **evolve** with the journey.

Not because members leveled up.

Because their entrepreneurial journey evolved.

The environment should feel like it **grows with them**.

---

## Gallery Integration™

Gallery becomes the **visual history** of the entrepreneurial journey:

Dreams · launches · pivots · growth · milestones · legacy

---

## Companion Behavior™

The Companion should recognize the member's season.

**Not announce it.**

Quietly adapt.

| Stage | Tone shift |
|-------|------------|
| Dream™ | More encouragement |
| Build™ | More accountability (gentle) |
| Grow™ | More strategic questioning |
| Legacy™ | More reflective conversation |

---

## Success Standard

Members should consistently feel:

> *"Spark understands where I am."*
>
> *"I don't feel rushed."*
>
> *"The guidance fits what I'm trying to accomplish."*
>
> *"It feels like Spark grows with me."*

---

## Long-Term Vision

Years from now, entrepreneurs should look back through Spark and see the evolution of both:

**Their business.**

**And themselves.**

Spark becomes the **living history** of their entrepreneurial journey.

---

## Journey Experience Template

Every future experience should identify:

| Field | Required |
|-------|----------|
| Current journey stage(s) | Yes (inferred, not forced UI) |
| Capabilities emphasized | Yes |
| Business Assets™ supported | Yes |
| Guidance adaptations | Yes |
| Community opportunities | When relevant |
| Gallery connections | When relevant |
| Estate evolution | When relevant |

**Type:** `SparkJourneyExperienceSpec` in `lib/sparkFounderJourney/types.ts`

The journey should always feel **personal, flexible, and encouraging**.

Never linear. Never judgmental.

Always centered on helping members become **increasingly capable entrepreneurs**.

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/founder-journey-framework.mdc`

---

**Status:** Foundational v1.0
