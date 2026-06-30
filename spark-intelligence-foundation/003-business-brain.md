# SPARK OS™ ARCHITECTURE SPECIFICATION

## Spec 003 — Business Brain™

| Field | Value |
|-------|-------|
| **Spec Number** | 003 |
| **Spec Title** | Business Brain™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Intelligence Foundation |
| **Dependencies** | [001 – Spark Constitution™](./00-spark-constitution.md) · [002 – Business Asset Architecture™](./002-business-asset-architecture.md) |
| **Last Updated** | June 28, 2026 |

---

## Purpose

The **Business Brain™** is Spark's long-term business memory.

Its purpose is to continuously understand the member's business so members rarely need to repeat themselves.

The Business Brain does **not** generate content.

It **remembers**.

It **organizes**.

It **connects**.

It continuously builds understanding over time.

---

## Mission

Entrepreneurs should spend their time building businesses — not repeatedly explaining them.

The Business Brain reduces repetitive thinking by preserving business knowledge and making it available whenever needed.

---

## Core Principle

> **The Business Brain remembers.**
>
> It does not decide.
>
> It does not guide.
>
> It does not create.

Those responsibilities belong to other systems.

The Business Brain exists to provide **trusted business context**.

---

## Philosophy

Every meaningful interaction should leave Spark with a better understanding of the member's business.

Knowledge should accumulate naturally.

Members should almost never feel like they are "feeding the AI."

Instead, Spark quietly learns through normal use.

---

## Responsibilities

The Business Brain is responsible for maintaining knowledge about:

- Business identity
- Business goals
- Products
- Services
- Offers
- Programs
- Courses
- Workshops
- Client avatars
- Brand voice
- Pricing
- Marketing strategy
- Business terminology
- Important relationships
- [Business Assets™](./002-business-asset-architecture.md)
- Projects
- Past launches
- Current priorities
- Lessons learned
- Business decisions
- Preferred workflows
- Preferred communication style
- Relevant historical context

---

## What The Business Brain Does NOT Do

The Business Brain **never**:

- Writes content
- Makes recommendations
- Determines next actions
- Changes the interface
- Communicates directly with members

Those responsibilities belong elsewhere.

| System | Responsibility |
|--------|----------------|
| **Guidance Engine™** | Recommendations, next possibilities |
| **Companion™** | Member-facing communication |
| **Create™** | Content and asset generation |
| **Experience Engine™** | Interface complexity |
| **Cognitive Orchestration** | Think-first response planning |

---

## Business Memory Principles

Knowledge should be:

| Quality |
|---------|
| Persistent |
| Organized |
| Connected |
| Searchable |
| Expandable |
| Contextual |
| Business-focused |

Members should not need to remember where information lives.

**Spark should know.**

---

## Relationship to Business Assets™

Business Assets are the things the member builds.

The Business Brain **understands** those assets.

For every Business Asset, the Brain may know:

- Purpose
- Audience
- Current stage
- Related assets
- History
- Strengths
- Weaknesses
- Open questions
- Dependencies
- Associated conversations
- Gallery milestones
- Spark Cards applied
- Momentum Builders completed
- Version history
- Future opportunities

See [002 – Business Asset Architecture™](./002-business-asset-architecture.md).

---

## Learning Philosophy

The Business Brain learns **gradually**.

- Prefer **observation** over interrogation.
- Whenever possible, **infer** rather than ask.
- If Spark already knows the answer, it should **not** ask again.
- Questions should only be asked when knowledge is genuinely missing or uncertain.

Aligns with Spark Constitution **Article II** (never assume when clarification is needed) and **Article I** (understand before responding).

---

## Confidence Levels

Not all knowledge is equally certain.

The Business Brain should internally distinguish between:

| Level | Meaning |
|-------|---------|
| **Confirmed** | Member explicitly stated it |
| **Observed** | Repeatedly demonstrated through usage |
| **Inferred** | Reasonably concluded from multiple signals |
| **Possible** | A low-confidence assumption requiring future confirmation |

Future systems may use these confidence levels when deciding whether clarification is needed.

Maps to [004 – Spark Knowledge Model™](./004-spark-knowledge-model.md): `Possible` ≡ `Hypothesis`.

Lifecycle stages: [009 – Business Brain Lifecycle](./009-business-brain-lifecycle.md).

**Implementation note:** Runtime confidence and provenance enums live in [08-memory-engine.md](./08-memory-engine.md) and `lib/sparkCoreIntelligence/memoryEngine/`.

---

## Knowledge Evolution

Business knowledge changes.

The Business Brain should allow knowledge to evolve **without losing history**.

**Examples:**

- Brand messaging changes
- Target audience changes
- Products evolve
- Offers are retired
- Pricing changes

Old knowledge should not simply disappear.

**Historical context remains valuable.**

---

## Retrieval Philosophy

The Business Brain should retrieve information **before** asking members to provide it again.

**Examples:**

- Current offer
- Existing workshop
- Brand colors
- Preferred tone
- Ideal client
- Mission statement
- Recent projects
- Business Assets

The goal is **reducing repetitive thinking**.

---

## Relationship to Other Systems

| System | Uses Business Brain for |
|--------|-------------------------|
| **Guidance Engine™** | Thoughtful possibilities grounded in context | [005-guidance-engine.md](./005-guidance-engine.md) |
| **Experience Engine™** | Complexity adjustment |
| **Companion™** | Natural, context-aware communication |
| **Create™** | Asset building with business awareness |
| **Gallery™** | Milestones that enrich understanding |
| **Spark Cards™** | Links to relevant business knowledge |
| **Momentum Builders™** | Implementation signals that strengthen understanding |
| **Estate™** | Long-term entrepreneurial growth reflection |

The Business Brain is a **read context layer** for these systems — not a voice or decision maker.

---

## Privacy Principle

The Business Brain exists to serve the member.

- Members **own** their business knowledge.
- Spark does **not** claim ownership of business intelligence.
- Knowledge should remain **transparent, editable, and removable** by the member.

**Trust is essential.**

Aligns with Spark Constitution **Trust Principles** and founder/member memory separation in [08-memory-engine.md](./08-memory-engine.md).

---

## Future Expansion

The Business Brain may eventually recognize:

- Patterns
- Repeated obstacles
- Emerging strengths
- Skill development
- Business evolution
- Seasonal trends
- Successful strategies
- Knowledge gaps

Without requiring additional effort from the member.

Pattern recognition remains **observation** — not conclusion for the member (Ethical Foundation).

---

## Things This Specification Does Not Define

This specification does **not** define:

- Artificial intelligence models
- Conversation behavior
- Recommendations
- Task management
- Executive function adaptation
- Emotional adaptation
- User interface
- Database implementation

Those belong to later specifications.

**Implementation detail:** [08-memory-engine.md](./08-memory-engine.md) (categories, recall rules, member control) · [18-spark-core-memory-personalization-engine.md](./18-spark-core-memory-personalization-engine.md) (runtime engine) · `lib/sparkCoreIntelligence/memoryEngine/`

---

## Success Criteria

This specification is successful when:

1. Members rarely repeat business information.
2. Spark consistently understands business context.
3. Business knowledge becomes richer over time.
4. Other systems retrieve reliable business information without unnecessary questioning.
5. Members experience Spark as **remembering** rather than merely responding.
6. The Business Brain becomes the **trusted memory layer** of Spark OS™.

---

## Related internal docs

- [002-business-asset-architecture.md](./002-business-asset-architecture.md) — what the Brain understands
- [004-spark-knowledge-model.md](./004-spark-knowledge-model.md) — Business Knowledge™ and confidence taxonomy
- [005-guidance-engine.md](./005-guidance-engine.md) — Strategic Knowledge™ co-owner; reasons, does not remember
- [007-context-strategy.md](./007-context-strategy.md) — MVC retrieval; Brain stores, Strategy selects
- [009-business-brain-lifecycle.md](./009-business-brain-lifecycle.md) — lifecycle, versioning, retrieval rules
- [08-memory-engine.md](./08-memory-engine.md) — Business Memory Engine (implementation)
- **[Spec 117 — Business Brain Memory & Retrieval](../docs/SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md)** — knowledge architecture (connect, organize, retrieve, dedupe, pattern, forget)
- [18-spark-core-memory-personalization-engine.md](./18-spark-core-memory-personalization-engine.md) — Core Intelligence runtime
- [04-communication-intelligence.md](./04-communication-intelligence.md) — communication profile (referenced, not duplicated)
- `lib/intelligence/INTELLIGENCE_REGISTRY.md` — object × engine registry

---

**Status:** Foundational v1.0
