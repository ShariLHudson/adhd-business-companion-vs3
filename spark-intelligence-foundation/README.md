# Spark Intelligence Foundation

**Internal engineering project — not user-facing.**

This folder is the source of truth for how **Spark** thinks, responds, routes conversations, learns users, activates business disciplines, and supports both members and the founder.

## What lives here

| Document | Domain |
|----------|--------|
| [00-spark-constitution.md](./00-spark-constitution.md) | Non-negotiable principles and identity |
| [002-business-asset-architecture.md](./002-business-asset-architecture.md) | **Business Asset System™** — central organizing structure of Spark OS |
| [003-business-brain.md](./003-business-brain.md) | **Business Brain™** — long-term business memory layer (remembers, does not decide) |
| [004-spark-knowledge-model.md](./004-spark-knowledge-model.md) | **Spark Knowledge Model™** — nine knowledge categories, confidence, ownership |
| [005-guidance-engine.md](./005-guidance-engine.md) | **Guidance Engine™** — reasoning and recommendations; member owns decisions |
| [006-spark-response-architecture.md](./006-spark-response-architecture.md) | **Spark Response Architecture™** — runtime pipeline; nervous system of Spark OS |
| [007-context-strategy.md](./007-context-strategy.md) | **Context Strategy™ & MVC** — intelligent context selection; Stage 3 detail |
| [008-interaction-contracts.md](./008-interaction-contracts.md) | **Interaction Contracts™** — system ownership, inputs/outputs, forbidden interactions |
| [009-business-brain-lifecycle.md](./009-business-brain-lifecycle.md) | **Business Brain™ Lifecycle** — acquire, validate, version, retire knowledge |
| [01-spark-objective-engine.md](./01-spark-objective-engine.md) | Outcome detection — first stage of every interaction |
| [02-conversation-engine.md](./02-conversation-engine.md) | Conversation creation — dialogue, modes, momentum |
| [03-intent-router.md](./03-intent-router.md) | Intent detection and workspace routing |
| [04-communication-intelligence.md](./04-communication-intelligence.md) | Per-member communication profile and adaptation |
| [05-intelligence-engine.md](./05-intelligence-engine.md) | Central orchestration — disciplines, research, unified reasoning |
| [06-discipline-orchestrator.md](./06-discipline-orchestrator.md) | Business discipline assembly — one unified expertise voice |
| [07-estate-navigation.md](./07-estate-navigation.md) | Room, workspace, and companion-led navigation |
| [08-memory-engine.md](./08-memory-engine.md) | Business Memory — categories, confidence, privacy, recall |
| [09-spark-performance-routing-engine.md](./09-spark-performance-routing-engine.md) | Ingress routing, lazy load, response time budgets |
| [10-spark-response-evaluation-engine.md](./10-spark-response-evaluation-engine.md) | Final QA gate — evaluate and revise before delivery |
| [11-spark-focus-objective-lock-engine.md](./11-spark-focus-objective-lock-engine.md) | Objective lock, anti-drift, scope control across turns |
| [12-spark-response-intelligence-engine.md](./12-spark-response-intelligence-engine.md) | Pre-compose analysis + pre-send QA |
| [13-spark-cognitive-orchestration-engine.md](./13-spark-cognitive-orchestration-engine.md) | **Spark OS coordinator** — 8-step think-first pipeline |
| [14-spark-trust-performance-engine.md](./14-spark-trust-performance-engine.md) | **Highest priority** — correct, fast, helpful, trustworthy |
| [15-spark-core-conversation-engine.md](./15-spark-core-conversation-engine.md) | **Core Intelligence v1** — conversation engine implementation |
| [16-spark-core-reasoning-engine.md](./16-spark-core-reasoning-engine.md) | **Core Intelligence v1** — reasoning engine implementation |
| [17-spark-core-trust-performance-engine.md](./17-spark-core-trust-performance-engine.md) | **Core Intelligence v1** — trust & performance engine |
| [18-spark-core-memory-personalization-engine.md](./18-spark-core-memory-personalization-engine.md) | **Core Intelligence v1** — memory & personalization engine |
| [19-spark-core-executive-discipline-orchestrator.md](./19-spark-core-executive-discipline-orchestrator.md) | **Core Intelligence v1** — executive discipline orchestrator |
| [20-spark-executive-function-engine.md](./20-spark-executive-function-engine.md) | **Executive Function Engine** — quiet cognitive load support |
| [disciplines/](./disciplines/) | Per-discipline system instructions and rules |
| [founder/](./founder/) | Founder intelligence, analytics, and operator systems |

## Relationship to production code

- **Status:** Draft scaffolding + Spark OS libs (`sparkTrustPerformance`, `sparkCognitiveOrchestration`, `sparkResponseIntelligence`, `sparkCoreIntelligence`).
- **Not wired:** Companion UI and chat routes do not call Spark OS pipeline yet.
- **Future:** Wire `runSparkResponseIntelligence()` into companion judgment / prompt pipeline per [006 – Spark Response Architecture](./006-spark-response-architecture.md).

## Reading order

1. Constitution → **Business Asset Architecture** → **Business Brain** → **Spark Knowledge Model** → **Guidance Engine** → **Spark Response Architecture** → Trust & Performance / Cognitive Orchestration / Response Intelligence (runtime detail)
2. Performance & Routing → Objective Engine → Focus & Objective Lock → Conversation Engine
2. Intelligence Engine (orchestration) → Communication Intelligence → Response Evaluation
3. Intent Router → Estate Navigation
4. Memory Engine → Discipline Orchestrator
5. Disciplines and Founder overlays as needed

## Related internal docs

- `docs/RELATIONSHIP_CONSTITUTION.md`
- `docs/UNIVERSAL_EXPERIENCE_STANDARDS.md` (T-003 — member-facing UX)
- `docs/CREATE_PHILOSOPHY.md` (T-004 — Create™ entrepreneurial transformation)
- `docs/EXPERIENCE_PATTERNS.md` (T-005 — twelve experience patterns)
- `docs/TRUST_EXPERIENCE.md` (T-006 — trust as experience)
- `docs/ENTREPRENEURIAL_RESILIENCE.md` (T-007 — difficult seasons)
- `docs/DECISION_EXPERIENCE_FRAMEWORK.md` (T-008 — decision support)
- `docs/COMPANION_RELATIONSHIP_FRAMEWORK.md` (T-009 — relationship evolution)
- `docs/FOUNDER_JOURNEY_FRAMEWORK.md` (T-010 — entrepreneurial journey stages)
- `lib/intelligence/INTELLIGENCE_REGISTRY.md`
- `lib/characterOfShari/CONSTITUTION.md`
- `AGENTS.md` (companion architecture)

---

**Status:** Draft
