# Spark Intelligence Foundation

**Internal engineering project — not user-facing.**

This folder is the source of truth for how **Spark** thinks, responds, routes conversations, learns users, activates business disciplines, and supports both members and the founder.

## What lives here

| Document | Domain |
|----------|--------|
| [00-spark-constitution.md](./00-spark-constitution.md) | Non-negotiable principles and identity |
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
- **Future:** Wire `runSparkResponseIntelligence()` into companion judgment / prompt pipeline.

## Reading order

1. Constitution → **Trust & Performance Engine** → Cognitive Orchestration → Response Intelligence → sub-engines
2. Performance & Routing → Objective Engine → Focus & Objective Lock → Conversation Engine
2. Intelligence Engine (orchestration) → Communication Intelligence → Response Evaluation
3. Intent Router → Estate Navigation
4. Memory Engine → Discipline Orchestrator
5. Disciplines and Founder overlays as needed

## Related internal docs

- `docs/RELATIONSHIP_CONSTITUTION.md`
- `lib/intelligence/INTELLIGENCE_REGISTRY.md`
- `lib/characterOfShari/CONSTITUTION.md`
- `AGENTS.md` (companion architecture)

---

**Status:** Draft
