# CURSOR SPEC — T-003 Universal Experience Standards™

| Field | Value |
|-------|-------|
| **Spec ID** | T-003 |
| **Title** | Universal Experience Standards™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Product & Experience |
| **Applies to** | All member-facing Spark systems |
| **Related** | [Spec 100 — Transformation Constitution](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) · **[Spec 103 — Universal Experience Standards Framework](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md)** · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) · [Spec 102 — Trust Experience](./TRUST_EXPERIENCE_FRAMEWORK.md) · [T-006 Trust Experience](./TRUST_EXPERIENCE.md) · [Create™ Philosophy (T-004)](./CREATE_PHILOSOPHY.md) · [Experience Patterns (T-005)](./EXPERIENCE_PATTERNS.md) · [Spark OS Spec 005 — Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) · [Spark OS Spec 007 — Context Strategy](../spark-intelligence-foundation/007-context-strategy.md) |

---

> **Parent spec:** [Spec 103 — Universal Experience Standards Framework™](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) is the core experience specification. This document (T-003) retains supplementary material — experience flow arc, primary action rule, max 3 choices, language rules, and nine-point release checklist.

## Purpose

Define the experience rules **every member-facing Spark system** must follow.

### Applies to

- Create™
- Momentum Builders™
- Spark Cards™
- Gallery™
- Estate™
- Guilds™
- Community™
- Daily Discoveries™
- Brain Break Lounge™
- Companion rooms and workspaces

---

## Core Experience Standard

Every Spark experience must feel:

| Quality |
|---------|
| Calm |
| Premium |
| Intentional |
| Connected |
| Encouraging |
| Useful |
| ADHD-friendly |
| Emotionally safe |
| Business-relevant |

---

## Visual Design Standard

### Spark must not feel

- Cartoonish
- Arcade-like
- Childish
- Cluttered
- Generic
- Dashboard-heavy
- Gimmicky

### Spark should feel

- Elegant
- Warm
- Refined
- Premium
- Spacious
- Calm
- Timeless
- Estate-like
- Editorial

### Use

- Refined typography
- Generous spacing
- Calm layouts
- Realistic environments
- Elegant cards
- Premium surfaces
- Subtle motion

### Avoid

- Playful icons as primary design
- Cartoon characters
- Loud colors
- Flashy animations
- Childish reward systems

---

## Experience Flow Pattern

Most experiences should follow this arc (see [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) for the twelve reusable patterns):

1. **Arrival**
2. **Orientation**
3. **Gentle invitation**
4. **Participation**
5. **Insight**
6. **Application**
7. **Reflection**
8. **Connection**
9. **Optional next step**

---

## Primary Action Rule

Each screen should have **one obvious primary action**.

Secondary actions are allowed but should not compete.

---

## Choice Limit Rule

Default to **no more than 3 choices** at once.

If more options exist, hide them behind:

- “More options”
- “Explore another path”
- “Show me more”

Aligns with Spark Constitution Article V (recommendations over overwhelming lists).

---

## Progressive Disclosure Rule

Do not show everything at once.

Reveal deeper information only when the member asks or when the moment requires it.

---

## Language Rules

- Use plain language
- Use short sections
- Avoid jargon unless explained
- Avoid pressure
- Avoid fake urgency
- Avoid guilt
- Avoid “streak” language

### Preferred tone

| Quality |
|---------|
| Grounded |
| Warm |
| Intelligent |
| Encouraging |
| Practical |

**Copy gate:** [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) — Shari test, never sound like software.

---

## Celebration Rules

Celebrate **growth**, not activity.

### Celebrate

- Clarity
- Courage
- Decisions
- Completed Business Assets™
- Thoughtful reflection
- Progress after difficulty
- Returning after absence

Do not over-celebrate tiny actions in a way that feels childish.

---

## Reflection Rules

Reflection should be **optional**, **brief**, and **meaningful**.

### Example prompts

- “What became clearer?”
- “What do you want to remember?”
- “Where could this help your business?”
- “What feels like the next small step?”

---

## Connection Requirement

Every experience should connect to at least one:

- Business Asset™
- Spark Card™
- Gallery memory
- Momentum capability
- Guild path
- Companion conversation
- Estate discovery
- Guidance suggestion

---

## Executive Function Rules

Experiences should reduce the need to:

- Remember
- Organize
- Sort
- Prioritize
- Choose from too many options
- Restart from scratch
- Explain context repeatedly

Aligns with [Context Strategy™](../spark-intelligence-foundation/007-context-strategy.md) — MVC, not maximum context.

---

## Experience Quality Checklist

Before approving any experience, confirm:

- [ ] Does this feel like Spark?
- [ ] Does it reduce overwhelm?
- [ ] Does it strengthen capability?
- [ ] Does it keep the member as hero?
- [ ] Does it connect to another system?
- [ ] Does it avoid clutter?
- [ ] Does it provide a clear next step?
- [ ] Does it avoid cartoon/game-like design?
- [ ] Would this still feel appropriate five years from now?

---

## Cursor Implementation Instruction

For any future component or screen, include this standard in the design prompt:

> Build this as part of Spark’s premium entrepreneurial estate experience. Avoid cartoon, arcade, dashboard, or generic AI app styling. Use calm spacing, refined language, low cognitive load, and clear connection to member growth.

**Cursor rule:** `.cursor/rules/universal-experience-standards.mdc`

**Framework types:** `lib/sparkUniversalExperience/types.ts` (Spec 103)

---

**Status:** Foundational v1.0
