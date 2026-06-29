# SPARK OS™ ENGINEERING SPECIFICATION

## Spec 009 — Business Brain™ Lifecycle Architecture

| Field | Value |
|-------|-------|
| **Spec Number** | 009 |
| **Spec Title** | Business Brain™ Lifecycle Architecture |
| **Version** | 1.0 |
| **Status** | Core Runtime Engineering Specification |
| **Owner** | Spark OS™ |
| **Dependencies** | [003 – Business Brain™](./003-business-brain.md) · [004 – Spark Knowledge Model™](./004-spark-knowledge-model.md) · [007 – Context Strategy™](./007-context-strategy.md) · [008 – Interaction Contracts™](./008-interaction-contracts.md) |
| **Last Updated** | June 28, 2026 |

---

## Purpose

The **Business Brain™ Lifecycle Architecture** defines how Spark acquires, validates, organizes, evolves, versions, and retires business knowledge over the lifetime of the member relationship.

The Business Brain™ is **not** a database.

It is Spark's **continuously evolving understanding** of the member's business.

Its responsibility is to maintain an accurate, current, and explainable model of the business **without overwhelming** the response engine.

---

## Mission

Continuously improve Spark's understanding of the member's business while preserving historical context and maintaining response speed.

The Business Brain should become **wiser** over time — not simply **larger**.

---

## Core Principle

> **Spark does not remember everything equally.**
>
> **It remembers intentionally.**

Knowledge has value based on:

- Relevance
- Accuracy
- Freshness
- Confidence
- Frequency of use
- Relationship to current business goals

---

## Architectural Responsibilities

### The Business Brain™ owns

- Business identity
- Business structure
- Business relationships
- Active business understanding
- Historical business evolution
- Knowledge confidence
- Business reasoning context

### The Business Brain™ does NOT own

- Conversation
- Guidance
- Business Assets (storage)
- UI
- Response generation

See [008 – Interaction Contracts](./008-interaction-contracts.md).

---

## Business Knowledge Lifecycle™

Every piece of business knowledge moves through a defined lifecycle.

```text
Observed
    ↓
Candidate
    ↓
Verified
    ↓
Active
    ↓
Mature
    ↓
Historical
    ↓
Archived
    ↓
Retired
```

**Implementation:** `lib/sparkBusinessBrain/lifecycleTypes.ts`

---

## Stage Definitions

### Observed

Information has been detected. No assumptions are made.

| Field | Value |
|-------|-------|
| **Confidence** | Very low |
| **Example** | *"I might launch a coaching program."* |

### Candidate

Repeated or inferred information. Likely useful. Still unverified.

| Field | Value |
|-------|-------|
| **Confidence** | Low |

### Verified

Explicitly confirmed by the member or repeatedly validated through behavior.

| Field | Value |
|-------|-------|
| **Confidence** | High |

### Active

Currently relevant to the business. Frequently used. **High retrieval priority.**

### Mature

Stable business knowledge.

**Examples:** Mission · Brand · Core offer · Ideal client

These become **foundational** understanding.

### Historical

Previously important. Still valuable for reasoning. **Rarely** retrieved automatically.

### Archived

Inactive. Preserved. Never discarded. Available only when appropriate.

### Retired

Explicitly retired by the member. **Never** automatically influences responses. Remains available for historical reference.

---

## Knowledge Categories

Each category maintains its own lifecycle:

- Business Identity
- Business Model
- Offers · Products · Services
- Audience · Messaging · Pricing
- Goals · Projects · Processes
- Partnerships · Marketing · Sales · Operations
- Vision · Strategic Decisions · Lessons Learned
- Business Preferences

Maps to [004 – Spark Knowledge Model](./004-spark-knowledge-model.md) **Business Knowledge™**.

---

## Business Versioning™

The Business Brain **never overwrites** significant business changes.

Instead it creates **versions**.

**Example:**

```
2026 — Coach
    ↓
2028 — Software Company
    ↓
2031 — Education Platform
```

Spark understands all three.

- **Current reasoning** uses the latest version
- **Historical reasoning** can reference previous versions

---

## Confidence Model™

Every knowledge object has a confidence score.

Confidence is determined by:

- Explicit confirmation
- Repeated behavior
- Business Asset references
- Frequency
- Recency
- Consistency

Confidence influences **reasoning** — it never deletes knowledge.

---

## Freshness Model™

Knowledge also has freshness.

| State | Retrieval impact |
|-------|------------------|
| **Current** | Highest priority |
| **Recent** | High priority |
| **Aging** | Medium priority |
| **Historical** | Low automatic priority |
| **Archived** | On request only |

Freshness determines **retrieval priority** — not storage.

Aligns with [007 – Context Strategy](./007-context-strategy.md) `SparkContextFreshness`.

---

## Conflict Resolution™

When conflicting information exists:

1. Do **not** overwrite immediately
2. Create **competing hypotheses**
3. Request confirmation only when necessary
4. Maintain **version history**
5. Never destroy previous business understanding

---

## Knowledge Aging™

Knowledge naturally ages.

| Knowledge type | Aging rate |
|----------------|------------|
| Active launch plans | Fast |
| Mission statement | Slow |
| Current pricing | Medium |
| Historical projects | → Historical |

Spark automatically adjusts **retrieval priority**.

---

## Business Pivots™

A pivot creates a new **business phase**.

The Business Brain:

- Preserves previous phase
- Creates a new phase
- Links relationships
- Maintains continuity

Spark understands **"What changed?"** rather than assuming everything changed.

---

## Knowledge Relationships™

Every knowledge object connects through the [Spark Knowledge Graph™](./008-interaction-contracts.md#spark-knowledge-graph).

**Example chain:**

```
Offer → Audience → Marketing Assets → Sales Assets → Projects → Gallery Memories → Strategic Decisions
```

Nothing exists in isolation.

---

## Learning Rules™

The Business Brain **never** learns from a single interaction alone unless explicitly confirmed.

Learning requires one or more of:

- Member confirmation
- Repeated behavior
- Business Asset creation
- Project completion
- Multiple reinforcing signals

This protects **accuracy**.

---

## Retrieval Rules™

The Business Brain retrieves:

1. **Current** knowledge first
2. **Verified** knowledge second
3. **Historical** knowledge only when relevant
4. **Archived** knowledge only on request
5. **Retired** knowledge **never** automatically

**Selection policy:** [007 – Context Strategy](./007-context-strategy.md) — MVC, not full Brain load.

---

## Performance Constraints

The Business Brain must:

- Scale to decades of business history
- Support millions of knowledge objects
- Retrieve only relevant context
- Maintain **sub-second** retrieval
- Never require loading the complete Business Brain

---

## Engineering Constraints

The Business Brain must always support:

| Capability |
|------------|
| Versioning |
| Confidence |
| Freshness |
| Relationships |
| Explainability |
| Parallel retrieval |
| Graceful degradation |
| Asynchronous updates |

**Runtime:** `lib/sparkCoreIntelligence/memoryEngine/` · `lib/sparkBusinessBrain/lifecycleTypes.ts`

---

## Success Metrics

The Business Brain is successful when:

- Members rarely need to repeat business information
- Spark correctly adapts to business evolution
- Historical knowledge remains available without slowing responses
- Contradictory information is handled gracefully
- The Business Brain grows in **wisdom** rather than **size**

---

## Constitutional Statement

> The Business Brain™ exists to understand the business **as it evolves** — not to preserve a static snapshot.

Knowledge is living.

Understanding is continuous.

Every interaction should make the Business Brain wiser while preserving the member's trust.

---

## Related internal docs

- [003-business-brain.md](./003-business-brain.md) — OS role (remembers, does not decide)
- [004-spark-knowledge-model.md](./004-spark-knowledge-model.md)
- [007-context-strategy.md](./007-context-strategy.md)
- [008-interaction-contracts.md](./008-interaction-contracts.md)
- [08-memory-engine.md](./08-memory-engine.md)
- `lib/sparkBusinessBrain/lifecycleTypes.ts`

---

**Status:** Core Runtime Engineering Specification v1.0
