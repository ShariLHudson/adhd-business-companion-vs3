# SPARK OS™ ARCHITECTURE SPECIFICATION

## Spec 005 — Guidance Engine™

| Field | Value |
|-------|-------|
| **Spec Number** | 005 |
| **Spec Title** | Guidance Engine™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Intelligence Foundation |
| **Dependencies** | [001 – Spark Constitution™](./00-spark-constitution.md) · [002 – Business Asset Architecture™](./002-business-asset-architecture.md) · [003 – Business Brain™](./003-business-brain.md) · [004 – Spark Knowledge Model™](./004-spark-knowledge-model.md) |
| **Last Updated** | June 28, 2026 |

---

## Purpose

The **Guidance Engine™** is Spark's reasoning and recommendation system.

Its purpose is **not** to tell members what to do.

Its purpose is to help members make thoughtful decisions with less overwhelm.

The Guidance Engine continuously evaluates possibilities while preserving the member's ownership of every decision.

---

## Mission

Spark should help entrepreneurs **think more clearly**.

**Not think for them.**

The Guidance Engine exists to reduce decision fatigue while strengthening entrepreneurial judgment.

---

## Core Principle

> **Spark offers possibilities.**
>
> **Members make decisions.**

The Guidance Engine never removes ownership from the entrepreneur.

Aligns with Spark Constitution **Article VI** (teach principles, not just answers) and **Agency Principle** (platform architecture).

---

## Design Philosophy

Good guidance creates **confidence**.

Bad guidance creates **dependence**.

The Guidance Engine should always leave members feeling:

> *"I made a good decision."*

Not:

> *"The AI made the decision."*

---

## Responsibilities

The Guidance Engine is responsible for:

- Understanding goals
- Evaluating options
- Comparing trade-offs
- Identifying missing information
- Reducing overwhelm
- Prioritizing possibilities
- Sequencing work
- Recognizing dependencies
- Helping members think strategically
- Supporting decisions

It does **NOT** own memory.

It does **NOT** own conversations.

It does **NOT** own business knowledge.

| Owns | Does not own |
|------|----------------|
| Reasoning, recommendations, trade-off framing | [Business Brain™](./003-business-brain.md) — context |
| Possibility evaluation, sequencing | [Companion™](./02-conversation-engine.md) — communication |
| Strategic Knowledge™ synthesis (reads/writes via Brain) | [Create™](./05-intelligence-engine.md) — building |
| | [Experience Engine™](./07-estate-navigation.md) — delivery complexity |

---

## What The Guidance Engine Never Does

The Guidance Engine **never**:

- Commands
- Pressures
- Manipulates
- Creates urgency
- Creates guilt
- Creates fear of missing out
- Automatically executes major business decisions

The member always remains in control.

Aligns with Spark Constitution **Trust Principles** and Relationship Constitution (no shame, guilt, or pressure).

---

## Guidance Philosophy

Spark guides like an **experienced mentor**.

Not like a project manager.

Not like a checklist.

Not like an algorithm.

Recommendations should feel conversational, thoughtful, and supportive.

---

## Recommendation Framework

Whenever appropriate, recommendations should include:

| Element | Purpose |
|---------|---------|
| **Why this may help** | Understanding, not persuasion |
| **Expected benefits** | Clear value framing |
| **Possible trade-offs** | Honest decision support |
| **Estimated effort** | Cognitive load management |
| **Related Business Assets™** | Context from [002](./002-business-asset-architecture.md) |
| **Related Momentum Builders™** | Implementation path |
| **Related Spark Cards™** | Teaching hooks |
| **Relevant past experience** | Historical Knowledge™ from [004](./004-spark-knowledge-model.md) |
| **Alternative approaches** | Agency — member chooses |

The goal is **understanding** — not persuasion.

**Implementation shape:** `lib/sparkGuidanceEngine/types.ts` → `SparkGuidanceRecommendation`

---

## Decision Support

The Guidance Engine helps members answer questions like:

- What should I build first?
- Should I launch now or improve first?
- Which opportunity fits my goals?
- Which idea has the highest leverage?
- What am I overlooking?
- What connects to work I've already completed?

The Guidance Engine helps members **think**.

---

## Guidance Sources

The Guidance Engine may **draw from** (read-only):

| Source | Provides |
|--------|----------|
| [Business Brain™](./003-business-brain.md) | Business context |
| [Business Assets™](./002-business-asset-architecture.md) | Asset state, gaps, expansion |
| [Spark Knowledge Model™](./004-spark-knowledge-model.md) | Typed knowledge + confidence |
| Experience Engine™ | Delivery context (how much to show) |
| Gallery™ | Historical milestones |
| Momentum™ | Implementation signals |
| Spark Cards™ | Teaching concepts |
| Current conversations | Session intent |
| Goals · Projects · Business history | Operational context |
| Community insights | Aggregated patterns (no private asset exposure) |

The Guidance Engine does **not** own these systems.

It **reasons with** them.

---

## Cognitive Load Management

One of the primary responsibilities of the Guidance Engine is reducing executive function demands.

It should minimize:

- Decision fatigue
- Choice overload
- Context switching
- Repeated planning
- Unnecessary complexity

When several good options exist, Spark should narrow them to a **small number** of thoughtful possibilities.

Never present dozens of choices unless explicitly requested.

Aligns with Spark Constitution **Article V** (recommendations instead of overwhelming lists) and **Article III** (one thoughtful question).

Integrates with [Executive Function Engine](./20-spark-executive-function-engine.md) for load detection — Guidance **reasons**; EF **supports** quietly.

---

## Progressive Guidance™

The amount of guidance should adapt.

| Member stage | Guidance style |
|--------------|----------------|
| **New entrepreneurs** | More explanation |
| **Experienced entrepreneurs** | Shorter recommendations |
| **Advanced entrepreneurs** | Strategic discussions |

Spark grows with the member.

---

## Recommendation Timing

Guidance should arrive when it is **useful**.

- Not immediately.
- Not constantly.
- Not after every action.

Members should never feel interrupted.

The best recommendation is often the one offered at **exactly the right moment**.

---

## Opportunity Recognition

The Guidance Engine should recognize opportunities such as:

- Asset expansion
- Skill development
- Missing business components
- Related creations
- Potential improvements
- Natural next steps
- Cross-connections
- Long-term leverage

Recommendations should feel **insightful** rather than automated.

Connects to [Asset Expansion](./002-business-asset-architecture.md#asset-expansion) — surface thoughtfully, never auto-generate everything.

---

## Relationship to Create™

The Guidance Engine does **not** create content.

Instead it helps determine:

- What should be created
- What should be improved
- What already exists
- What may be missing

**Create™** performs the building.

**Guidance** determines thoughtful direction.

**Create philosophy:** [T-004](../docs/CREATE_PHILOSOPHY.md) — intent before output, Business Assets™, transformation over text generation.

**Decision experience:** [T-008](../docs/DECISION_EXPERIENCE_FRAMEWORK.md) — options and trade-offs; member owns every decision.

---

## Relationship to Experience Engine™

| Engine | Decides |
|--------|---------|
| **Experience Engine™** | How guidance should be **delivered** |
| **Guidance Engine™** | What guidance should be **delivered** |

These responsibilities must remain **separate**.

---

## Relationship to Companion™

| Engine | Role |
|--------|------|
| **Companion™** | Communicates |
| **Guidance Engine™** | Reasons |

The Companion should never appear to "think."

The Guidance Engine should never appear to "talk."

Together they create **one seamless conversation**.

Implementation: Guidance produces structured recommendation payloads; Companion/Cognitive Orchestration composes member-facing language per [006 – Spark Response Architecture](./006-spark-response-architecture.md) Stages 6–9.

---

## Relationship to Business Brain™

| System | Role |
|--------|------|
| **Business Brain™** | Knows |
| **Guidance Engine™** | Reasons |

Business Brain provides **context**.

Guidance transforms context into **possibilities**.

Guidance **reads** Brain; it does not duplicate memory storage.

Context **selection** is governed by [007 – Context Strategy™](./007-context-strategy.md) — Brain stores; Strategy retrieves MVC only.

---

## Architectural Law

> **The Guidance Engine should never attempt to be the smartest voice in the room.**

Its purpose is to help the member think more clearly.

That distinction defines the role of guidance throughout Spark OS™.

---

## Things This Specification Does Not Define

This specification does **not** define:

- Conversation style
- Interface design
- Memory ownership
- Asset storage
- Task execution
- Emotional adaptation
- Workflow orchestration
- Implementation details

Those are defined by later specifications.

**Related runtime (partial):** [Cognitive Orchestration](./13-spark-cognitive-orchestration-engine.md) · [Discipline Orchestrator](./06-discipline-orchestrator.md) · [Reasoning Engine](./16-spark-core-reasoning-engine.md)

---

## Success Criteria

This specification is successful when:

1. Members experience less decision fatigue.
2. Recommendations feel timely.
3. Suggestions feel thoughtful.
4. Members remain confident in their own decisions.
5. Spark feels like an experienced strategic thinking partner.
6. The Guidance Engine quietly strengthens entrepreneurial judgment **without taking control**.

---

## Related internal docs

- [002-business-asset-architecture.md](./002-business-asset-architecture.md)
- [003-business-brain.md](./003-business-brain.md)
- [004-spark-knowledge-model.md](./004-spark-knowledge-model.md)
- [06-discipline-orchestrator.md](./06-discipline-orchestrator.md)
- [13-spark-cognitive-orchestration-engine.md](./13-spark-cognitive-orchestration-engine.md)
- [008-interaction-contracts.md](./008-interaction-contracts.md) — owns strategic reasoning only; forbidden to generate conversation
- `lib/sparkGuidanceEngine/types.ts` — recommendation framework types
- `lib/intelligence/INTELLIGENCE_REGISTRY.md`

---

**Status:** Foundational v1.0
