# SPARK OS™ ENGINEERING SPECIFICATION

## Spec 008 — Interaction Contracts™

| Field | Value |
|-------|-------|
| **Spec Number** | 008 |
| **Spec Title** | Interaction Contracts™ |
| **Version** | 1.0 |
| **Status** | Core Runtime Engineering Specification |
| **Owner** | Spark OS™ |
| **Dependencies** | [003 – Business Brain™](./003-business-brain.md) · [002 – Business Asset Architecture™](./002-business-asset-architecture.md) · [005 – Guidance Engine™](./005-guidance-engine.md) · [006 – Spark Response Architecture™](./006-spark-response-architecture.md) · [007 – Context Strategy™](./007-context-strategy.md) |
| **Last Updated** | June 28, 2026 |

---

## Purpose

The **Interaction Contracts™** define the responsibilities, boundaries, inputs, outputs, and communication rules for every core intelligence system inside Spark OS™.

The purpose of this specification is to **eliminate ambiguity**.

- Every intelligence system should own **one** responsibility.
- No responsibility should have **multiple** owners.
- Every interaction between systems should be **explicit**.

This specification becomes the architectural contract that keeps Spark coherent as it grows.

---

## Mission

Every system should know:

- What it **owns**
- What it **never** owns
- What information it **consumes**
- What information it **publishes**
- What systems it **may** communicate with
- What systems it **must never** bypass

Spark grows through **disciplined collaboration** between systems — not overlapping responsibilities.

---

## Architectural Rule

> A system owns exactly **one** primary responsibility.

If multiple systems appear to own the same responsibility, the architecture should be **redesigned**.

---

## Communication Rule

Systems communicate only through **published contracts**.

Systems never directly manipulate another system's internal state.

This preserves modularity, explainability, and long-term maintainability.

**Implementation:** `lib/sparkInteractionContracts/types.ts` · Signal bus · typed publish/consume payloads

---

## Core Runtime Systems

| System | Spec |
|--------|------|
| Business Brain™ | [003](./003-business-brain.md) |
| Business Assets™ | [002](./002-business-asset-architecture.md) |
| Guidance Engine™ | [005](./005-guidance-engine.md) |
| Experience Engine™ | *TBD — Experience Engine spec* |
| Spark Knowledge Graph™ | LIG · `connectionIds` |
| Memory Architecture™ | [008-memory-engine](./08-memory-engine.md) · [007-context](./007-context-strategy.md) |
| Response Orchestrator™ | [006](./006-spark-response-architecture.md) |
| Companion™ | [02-conversation-engine](./02-conversation-engine.md) |
| Signal Bus™ | `lib/intelligence-layer/signalStore` |

---

## Business Brain™

### Owns

Understanding the member's business.

Maintains:

- Business identity
- Offers, services, products
- Goals, projects
- Business history
- Relationships between business concepts

### Consumes

- Business Assets™ (metadata)
- Signals
- Member updates
- Memory proposals

### Publishes

- Business Context
- Business Relationships
- Business Facts
- Confidence Levels

### Never owns

- Conversation
- UI
- Response generation
- Decision making
- Emotional adaptation

---

## Business Assets™

### Owns

The structured collection of everything created for the business.

Examples: marketing, SOPs, websites, courses, emails, frameworks, presentations, documents, images, videos, products.

### Consumes

- Member creations
- Create™
- Imports
- Business Brain references

### Publishes

- Current Assets
- Relationships
- Versions
- Metadata

### Never owns

- Reasoning
- Guidance
- Conversation

---

## Guidance Engine™

### Owns

**Strategic reasoning.**

Determines: recommendations, priorities, trade-offs, next possibilities, decision support.

### Consumes

- Business Brain™
- Business Assets™
- Experience Engine™ (delivery context only)
- Knowledge Graph™
- Relationship Memory™
- Capability information

### Publishes

- Structured Guidance
- Decision Options
- Recommended Actions
- Reasoning Metadata
- Confidence

### Never owns

- Conversation
- Business Memory (storage)
- Business Assets (storage)
- UI

**Types:** `lib/sparkGuidanceEngine/types.ts`

---

## Experience Engine™

### Owns

**Experience adaptation.**

Determines: information density, pace, tone adjustments, executive function support, emotional adaptation, progressive disclosure.

### Consumes

- Signals
- Relationship preferences
- Conversation state
- Guidance (what to deliver — not why)
- Member preferences

### Publishes

- Experience Directives
- Presentation Rules
- Cognitive Load adjustments
- Accessibility adaptations

### Never owns

- Business reasoning
- Asset creation
- Knowledge storage

**UX standards:** [Spec 103 Universal Experience Standards](../docs/UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · [T-003](../docs/UNIVERSAL_EXPERIENCE_STANDARDS.md) · [T-005 Experience Patterns](../docs/EXPERIENCE_PATTERNS.md)

---

## Spark Knowledge Graph™

### Owns

**Relationships.**

Connects: business, assets, capabilities, gallery, Spark Cards™, community, goals, projects.

### Consumes

- Published metadata from all systems (never raw private stores)

### Publishes

- Relationship maps
- Connection queries
- Context links

### Never owns

- Business facts
- Responses
- Conversation

**Runtime:** Living Intelligence Graph · `connectionIds` on `IntelligenceReadyHooks`

---

## Memory Architecture™

### Owns

**Memory lifecycle.**

Determines: storage, freshness, archiving, retrieval rules, versioning.

### Consumes

- Signals
- Member edits
- Background learning events (Stage 10)

### Publishes

- Recall bundles
- Freshness state
- Archive transitions

### Never owns

- Reasoning
- Guidance
- Conversation

**Specs:** [08-memory-engine](./08-memory-engine.md) · [007-context-strategy](./007-context-strategy.md)

---

## Response Orchestrator™

### Owns

**Runtime execution.**

Determines: which systems activate, context retrieval, pipeline execution, parallel processing, response flow.

### Consumes

- Member request
- Ingress classification
- MVC plan

### Publishes

- Pipeline state
- Activation map
- Orchestration completion events

### Never owns

- Business knowledge
- Guidance reasoning
- Experience rules
- Conversation text

**Runtime:** [006](./006-spark-response-architecture.md) · `lib/sparkTrustPerformance/` · `lib/sparkCognitiveOrchestration/`

---

## Companion™

### Owns

**Communication.**

Transforms structured reasoning into natural conversation.

Responsible for: voice, clarity, encouragement, Trust Experience™, executive-function friendly communication, natural language.

### Consumes

- Guidance (structured)
- Experience directives
- Business context (read-only slices)
- Reasoning metadata

### Publishes

- Member-facing responses

### Never owns

- Reasoning
- Business knowledge (storage)
- Memory (storage)
- Guidance (generation)

---

## Signal Bus™

### Owns

**System communication.**

- Receives published events
- Routes events
- Supports asynchronous updates
- **Never blocks** runtime responses

### Consumes

- Published events from all systems

### Publishes

- Routed signals to subscribers

### Never owns

- Business facts
- Member-facing copy

**Runtime:** `lib/intelligence-layer/signalStore` · `intelligence-signal` kind

---

## Runtime Communication Rules

```
Business Brain™
    → publishes
        ↓
Knowledge Graph™
        ↓
Guidance Engine™
        ↓
Experience Engine™
        ↓
Companion™
```

**Only the Companion communicates directly with the member.**

Background: Signal Bus™ carries async events; Stage 10 learning never blocks Stages 1–9.

---

## Forbidden Interactions

| System | Must never |
|--------|------------|
| **Business Brain™** | Communicate directly with UI |
| **Companion™** | Modify Business Brain™ internal state |
| **Experience Engine™** | Perform business reasoning |
| **Guidance Engine™** | Generate conversation text |
| **Business Assets™** | Determine recommendations |
| **Knowledge Graph™** | Own business facts |

**Pipeline constraint:** [006](./006-spark-response-architecture.md) — no feature bypasses Response Architecture.

---

## Conflict Resolution

If two systems appear responsible for the same task:

1. **Stop** implementation
2. Review Interaction Contracts™
3. Redesign ownership
4. **Never** duplicate responsibilities

---

## Engineering Constraints

Every future Spark OS™ system must define **before implementation**:

| Field | Required |
|-------|----------|
| Primary responsibility | Yes |
| Inputs | Yes |
| Outputs | Yes |
| Published events | Yes |
| Consumed events | Yes |
| Latency expectations | Yes |
| Failure behavior | Yes |
| Ownership boundaries | Yes |

**Template:** `SparkInteractionContract` in `lib/sparkInteractionContracts/types.ts`

---

## Success Metrics

This specification is successful when:

- No duplicate responsibilities exist
- Engineers can identify system ownership immediately
- Runtime orchestration remains simple
- New systems integrate without architectural drift
- Spark remains maintainable as it grows

---

## Constitutional Statement

> Every intelligence system exists to perform **one** responsibility exceptionally well.

Spark achieves intelligence through **disciplined collaboration**, not overlapping capabilities.

---

## Related internal docs

- [006-spark-response-architecture.md](./006-spark-response-architecture.md)
- [007-context-strategy.md](./007-context-strategy.md)
- `lib/sparkInteractionContracts/types.ts`
- `lib/intelligence/INTELLIGENCE_REGISTRY.md`

---

**Status:** Core Runtime Engineering Specification v1.0
