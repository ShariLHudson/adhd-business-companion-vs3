# SPARK OS™ ENGINEERING SPECIFICATION

## Spec 007 — Context Strategy™ & Minimum Viable Context™

| Field | Value |
|-------|-------|
| **Spec Number** | 007 |
| **Spec Title** | Context Strategy™ & Minimum Viable Context™ |
| **Version** | 1.0 |
| **Status** | Core Runtime Engineering Specification |
| **Owner** | Spark OS™ |
| **Dependencies** | [003 – Business Brain™](./003-business-brain.md) · [004 – Spark Knowledge Model™](./004-spark-knowledge-model.md) · [006 – Spark Response Architecture™](./006-spark-response-architecture.md) |
| **Last Updated** | June 28, 2026 |

---

## Purpose

The **Context Strategy™** defines how Spark determines, retrieves, prioritizes, and manages contextual information required to generate exceptional responses.

Its purpose is to maximize response quality while **minimizing latency**.

Spark should retrieve only the information required for the current interaction.

Every unnecessary piece of context increases response time, computational cost, and reasoning complexity.

The goal is **intelligent context selection** — not maximum context retrieval.

---

## Mission

Load the **smallest** amount of information necessary to produce the best possible response.

Not more.

Not less.

---

## Core Principle

> **More context is not better.**
>
> **Relevant context is better.**

Spark should behave like an experienced entrepreneur who remembers exactly what matters — not someone trying to remember everything at once.

---

## Definition — Minimum Viable Context (MVC)

**Minimum Viable Context (MVC)** is the minimum collection of contextual information required to produce a trustworthy, personalized, and actionable response.

MVC is determined **dynamically** for every interaction.

No two requests necessarily require the same context.

**Pipeline home:** [006 – Spark Response Architecture](./006-spark-response-architecture.md) Stage 3 · Stage 5

**Implementation:** `lib/sparkContextStrategy/types.ts`

---

## Context Categories

Every piece of information belongs to one of **six categories**.

---

### Tier 1 — Immediate Context

**Always available.**

Includes:

- Current message
- Previous conversation turns
- Current workspace
- Current task
- Active Business Asset™

**Target retrieval:** Immediate

---

### Tier 2 — Relationship Context

Loaded when personalization is beneficial.

Includes:

- Communication preferences
- Working style
- Preferred response depth
- Learning preferences
- Executive Function preferences
- Accessibility preferences

**Target retrieval:** **< 50 ms**

---

### Tier 3 — Business Context

Loaded only when business reasoning is required.

Includes:

- Business Brain™
- Current offers
- Services
- Products
- Client avatars
- Pricing
- Business goals
- Active projects

**Target retrieval:** Parallel

---

### Tier 4 — Capability Context

Loaded when growth or coaching is involved.

Includes:

- Capability Graph™ *(planned)*
- Transformation Graph™ *(planned)*
- Momentum history
- Spark Card™ progress
- Guild progress

**Target retrieval:** On demand

---

### Tier 5 — Historical Context

Loaded only when needed.

Includes:

- Previous launches
- Historical Business Assets™
- Archived projects
- Gallery history
- Long-term reflections

**Target retrieval:** Deferred unless requested

---

### Tier 6 — Discovery Context

Optional. **Never required** for initial response.

Includes:

- Community
- Daily Discoveries
- Estate discoveries
- Inspiration
- Related members
- Future recommendations

Loaded only **after** the response if appropriate.

---

## Context Priority Rules

| Priority | Source |
|----------|--------|
| **1** | Current conversation |
| **2** | Current Business Asset™ |
| **3** | Current business goals |
| **4** | Relationship preferences |
| **5** | Relevant historical information |
| **6** | Everything else |

---

## Context Loading Rules

Spark should **never** load:

- The entire Business Brain™
- The entire Knowledge Graph™
- Every Business Asset™
- Entire conversation history
- Entire Gallery™
- Entire Capability Graph™
- Entire Transformation Graph™

Instead:

> Retrieve only information **directly relevant** to the current request.

---

## Progressive Context Loading™

Context should load progressively.

```
Phase 1 — Required Context
        ↓
Phase 2 — Helpful Context
        ↓
Phase 3 — Enrichment Context
```

Only **Phase 1** blocks response generation.

Phases 2 and 3 may continue asynchronously.

Aligns with [006](./006-spark-response-architecture.md) Principle 6 — **Learning Never Blocks Helping™**.

---

## Predictive Context™

Spark may prepare context **before** it is requested.

**Example — editing a workshop, preload:**

- Workshop Business Asset™
- Previous edits
- Audience
- Related emails
- Marketing assets
- Brand voice

**Example — planning a launch, preload:**

- Current launch plan
- Client avatar
- Pricing
- Sales page
- Previous launch results

Predictive loading should always be **invisible**.

---

## Context Confidence™

Every context source should include a confidence score.

| Level | Meaning |
|-------|---------|
| **High** | Recently confirmed |
| **Medium** | Likely accurate |
| **Low** | Old or inferred |
| **Unknown** | Needs confirmation |

Confidence influences **reasoning** — not retrieval.

Maps to [004 – Spark Knowledge Model](./004-spark-knowledge-model.md) confidence taxonomy.

---

## Context Freshness™

Every stored context item has a freshness state.

| State | Meaning |
|-------|---------|
| **Current** | Recently verified |
| **Aging** | Likely still useful |
| **Historical** | Useful for reference |
| **Archived** | Rarely used |
| **Retired** | Never automatically surface |

Freshness affects **priority** — not availability.

[003 – Business Brain™](./003-business-brain.md) retains history; Context Strategy prioritizes freshness for retrieval.

---

## Context Budget™

Every response has a maximum context budget.

| Response depth | Context objects |
|----------------|-----------------|
| **Simple** | 2–5 |
| **Moderate** | 5–15 |
| **Complex strategy** | 15–30 |

Never retrieve unlimited context.

---

## Context Retrieval Rules™

Spark retrieves context in this order:

1. Current interaction
2. Active Business Asset™
3. Relationship context
4. Business Brain™
5. Capability context
6. Historical context
7. Discovery context

**Stop** retrieving once sufficient confidence has been achieved.

---

## Context Expiration™

Not all context should remain equally active forever.

Context should naturally move through lifecycle states:

```
Current → Active → Historical → Archived → Retired
```

The **Business Brain™** retains history.

The **Response Engine** prioritizes freshness.

---

## Engineering Constraints

The Context Strategy™ must:

- Never retrieve unnecessary information
- Support parallel retrieval
- Support predictive loading
- Support graceful degradation
- Support asynchronous enrichment
- Minimize latency
- Reduce token consumption
- Improve response accuracy

**Runtime alignment:** `lib/sparkTrustPerformance/fastIntent.ts` (classification) · `lib/sparkCoreIntelligence/memoryEngine/recall.ts` (scoped recall)

---

## Success Metrics

This specification is successful when:

- Members rarely repeat information
- Spark consistently remembers relevant details
- Responses remain fast even as Business Brain™ grows
- Context retrieval scales to decades of member history
- The Business Brain™ becomes deeper **without** becoming slower

---

## Constitutional Statement

> **Spark remembers with intention. Not volume.**

The value of memory is determined by **relevance**, not quantity.

Every piece of context should earn its place in the response.

---

## Related internal docs

- [006-spark-response-architecture.md](./006-spark-response-architecture.md) — Stages 3 & 5
- [003-business-brain.md](./003-business-brain.md) — storage; Brain retains, Strategy selects
- [004-spark-knowledge-model.md](./004-spark-knowledge-model.md) — confidence on knowledge
- [08-memory-engine.md](./08-memory-engine.md) — recall rules implementation
- `lib/sparkContextStrategy/types.ts` — tiers, phases, budgets, freshness

---

**Status:** Core Runtime Engineering Specification v1.0
