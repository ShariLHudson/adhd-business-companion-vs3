# SPARK OS™ ARCHITECTURE SPECIFICATION

## Spec 004 — Spark Knowledge Model™

| Field | Value |
|-------|-------|
| **Spec Number** | 004 |
| **Spec Title** | Spark Knowledge Model™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Intelligence Foundation |
| **Dependencies** | [001 – Spark Constitution™](./00-spark-constitution.md) · [002 – Business Asset Architecture™](./002-business-asset-architecture.md) · [003 – Business Brain™](./003-business-brain.md) |
| **Last Updated** | June 28, 2026 |

---

## Purpose

This specification defines the **types of knowledge** that exist within Spark OS™.

The purpose of this model is to ensure every intelligence system understands information **consistently**.

Spark should never treat all information equally.

Different kinds of knowledge have different purposes, different lifecycles, different confidence levels, and different owners.

This specification creates **one common language** for every future intelligence system.

---

## Mission

Knowledge is one of Spark's greatest assets.

Spark should continuously organize knowledge so members never need to remember where information belongs.

Instead Spark understands **what** information is, **why** it matters, and **how** it connects.

---

## Core Principle

> **Knowledge is not data.**

Knowledge is meaningful information that helps members build their business.

Every piece of knowledge should eventually connect to one or more [Business Assets™](./002-business-asset-architecture.md).

---

## Knowledge Categories

Spark recognizes multiple kinds of knowledge.

Each serves a different purpose.

---

### 1. Business Knowledge™

Information about the member's business.

**Examples**

- Business name
- Mission
- Vision
- Offers
- Products
- Services
- Pricing
- Ideal client
- Brand voice
- Business goals
- Business terminology
- Business processes

This knowledge changes slowly.

It becomes part of the [Business Brain™](./003-business-brain.md).

---

### 2. Asset Knowledge™

Knowledge belonging to a specific Business Asset.

**Examples**

- Workshop objectives
- Course modules
- Book chapters
- Marketing campaign goals
- Sales page messaging
- Presentation notes
- Testimonials
- Supporting documents
- Dependencies

Asset Knowledge **grows with the asset**.

---

### 3. Member Knowledge™

Information about how the member prefers to work.

**Examples**

- Preferred communication style
- Writing preferences
- Favorite workflows
- Decision style
- Learning preferences
- Working habits
- Preferred pace
- Creative process

This knowledge helps personalize Spark.

---

### 4. Historical Knowledge™

Knowledge about what has happened.

**Examples**

- Past launches
- Completed projects
- Previous versions
- Business milestones
- Lessons learned
- Gallery memories
- Previous decisions

Historical knowledge should **rarely be deleted**.

It becomes part of the member's entrepreneurial story.

---

### 5. Relationship Knowledge™

Knowledge about how things connect.

**Examples**

- Workshop supports Course
- Course generates Membership
- Lead Magnet feeds Funnel
- Client Avatar relates to Offer
- Spark Cards connected to Business Asset
- Momentum Builder teaches related skill

Relationship knowledge creates **context**.

**Experience specs:** [T-011 Spark Card Framework](../docs/SPARK_CARD_FRAMEWORK.md) · [T-012 Momentum Builder Framework](../docs/MOMENTUM_BUILDER_FRAMEWORK.md)

---

### 6. Strategic Knowledge™

Higher-level thinking.

**Examples**

- Competitive advantages
- Long-term goals
- Expansion opportunities
- Growth strategies
- Risks
- Trade-offs
- Strategic priorities

Strategic Knowledge changes more frequently than Business Knowledge.

---

### 7. Reflection Knowledge™

Member-created thinking.

**Examples**

- Journal entries
- Capture Moments
- Lessons learned
- Ideas
- Observations
- Questions
- Wins
- Failures

Reflection Knowledge often becomes Strategic Knowledge later.

---

### 8. Experience Knowledge™

Knowledge about how Spark should interact.

**Examples**

- Member feels overwhelmed today
- Member has low energy
- Member prefers one question at a time
- Member likes brainstorming
- Member prefers visual explanations

This knowledge belongs primarily to the **Experience Engine™**.

---

### 9. System Knowledge™

Knowledge used internally.

**Examples**

- Confidence scores
- Inference history
- Knowledge sources
- Connection strength
- Usage frequency
- Retrieval priority

Members should **rarely** see this directly.

---

## Knowledge Ownership

Each category has a **primary owner**.

| Category | Primary owner |
|----------|---------------|
| **Business Knowledge™** | Business Brain™ |
| **Asset Knowledge™** | Business Assets™ |
| **Member Knowledge™** | Business Brain™ · Communication Intelligence |
| **Historical Knowledge™** | Gallery™ · Business Brain™ |
| **Relationship Knowledge™** | Knowledge Graph™ (Living Intelligence Graph) |
| **Strategic Knowledge™** | Business Brain™ · Guidance Engine™ | [005-guidance-engine.md](./005-guidance-engine.md) |
| **Reflection Knowledge™** | Growth™ · Companion™ |
| **Experience Knowledge™** | Experience Engine™ |
| **System Knowledge™** | Internal Architecture |

**Rule:** Every category has one primary owner. No duplicated ownership.

Secondary systems may **read** knowledge; only the primary owner **writes** canonical records for that category.

---

## Knowledge Confidence

Knowledge may exist at different confidence levels.

| Level | Meaning |
|-------|---------|
| **Confirmed** | Explicitly provided by the member |
| **Observed** | Repeated through behavior |
| **Inferred** | Reasonably concluded |
| **Hypothesis** | Possible but unconfirmed |

Confidence should influence whether future systems ask for clarification or proceed with stated assumptions.

Aligns with [003 – Business Brain™](./003-business-brain.md) confidence model (`Possible` → `Hypothesis` in this spec).

**Implementation:** `lib/sparkKnowledgeModel/types.ts` · [08-memory-engine.md](./08-memory-engine.md) provenance fields

---

## Knowledge Evolution

Knowledge is expected to change.

Spark should preserve history whenever practical.

- The **latest** information becomes active.
- **Previous** information remains available for context.

Entrepreneurs evolve.

Spark should evolve with them.

---

## Knowledge Relationships

Knowledge should never become isolated.

Every meaningful piece of knowledge should connect to:

- Business Assets™
- Goals
- Projects
- Gallery memories
- Spark Cards™
- Momentum Builders™
- Business Brain™
- Companion conversations

This interconnected model allows Spark to think **contextually** rather than searching isolated records.

Use `connectionIds` and `originatedFromId` / `originatedFromKind` per `IntelligenceReadyHooks`.

---

## Design Principles

Knowledge should always be:

| Quality |
|---------|
| Connected |
| Persistent |
| Meaningful |
| Contextual |
| Searchable |
| Expandable |
| Transparent |
| Respectful of member ownership |

---

## Things This Specification Does Not Define

This specification does **not** define:

- Conversation behavior
- Recommendations
- Guidance logic
- Database implementation
- Search algorithms
- AI prompts

Those belong to later specifications.

---

## Success Criteria

This specification is successful when:

1. Every intelligence system shares a common understanding of knowledge.
2. Knowledge remains organized rather than fragmented.
3. Information becomes easier to reuse over time.
4. Spark continuously strengthens context instead of accumulating disconnected facts.
5. Members experience Spark as understanding their business rather than remembering isolated details.
6. The Spark Knowledge Model™ becomes the **common language** that allows every intelligence system to collaborate effectively.

---

## Related internal docs

- [002-business-asset-architecture.md](./002-business-asset-architecture.md)
- [003-business-brain.md](./003-business-brain.md)
- [08-memory-engine.md](./08-memory-engine.md)
- [005-guidance-engine.md](./005-guidance-engine.md)
- `lib/sparkKnowledgeModel/types.ts` — canonical category and confidence enums
- `lib/intelligence/intelligenceReadyTypes.ts` — lineage and LIG hooks
- `lib/intelligence/INTELLIGENCE_REGISTRY.md`

---

**Status:** Foundational v1.0
