# Spark Performance & Routing Engine™

**v1.0 — Fast, focused, minimum necessary intelligence.**

| Field | Value |
|-------|-------|
| **Priority** | Ingress — classifies every request before full pipeline activation |
| **Governed by** | [Spark Constitution™](./00-spark-constitution.md) |
| **Coordinates with** | [Intent Router](./03-intent-router.md) · [Intelligence Engine](./05-intelligence-engine.md) |
| **Status** | Draft v1.0 |

---

## Purpose

The Spark Performance & Routing Engine™ makes Spark feel **exceptionally fast, responsive, and intelligent**.

It ensures Spark performs **only the work necessary** for each request — never activating the entire intelligence system every time.

Members should experience Spark as immediate, focused, and highly responsive.

**Performance is a core product feature** — not merely a technical optimization.

---

## Mission

Spark should **respect the member's time**.

The fastest **useful** answer is better than the slowest perfect answer.

Deep reasoning occurs **only when it genuinely improves the outcome**.

---

## Core Principle

> Not every request requires every intelligence module.

Spark activates **only the systems required** for the member's objective.

---

## Routing Philosophy

Every request is **classified before processing**. Classification produces a `RoutingPlan` that gates module activation, time budget, and research depth.

### Route types

| Route | Typical triggers |
|-------|------------------|
| **Navigation** | Open room, go to journal, settings, explicit UI intent |
| **Conversation** | General dialogue, unclear objective, relationship continuity |
| **Planning** | Priorities, schedules, decisions, roadmaps |
| **Create** | Build artifact, copy, campaign, asset |
| **Research** | Facts, market, competitors, verification |
| **Learning** | Explain concept, framework, how-to |
| **Support** | Overwhelm, exhaustion, emotional load, encouragement |
| **Celebration** | Wins, milestones, recognition |
| **Memory** | Recall, timeline, evidence, story retrieval |
| **Administration** | Account, billing, permissions (role-gated) |
| **Settings** | Preferences, profile, communication controls |
| **Background Task** | Long-running research, reports, scans |

**Rule:** Activate the **minimum** number of systems necessary. Additional modules may join **later in the thread** if the conversation requires them — not preemptively.

```ts
type RoutingPlan = {
  primaryRoute: RouteType;
  secondaryRoutes?: RouteType[];
  modulesToActivate: ModuleActivation;
  researchLevel: ResearchLevel; // 1–5
  responseTimeBudgetMs: number;
  allowDeepThinking: boolean;
  allowBackgroundTasks: boolean;
  estatePreload?: EstateRoomId[];
  parallelGroups: string[][];
  engineVersion: "1.0";
};

type ModuleActivation = {
  objectiveEngine: boolean | "lightweight";
  conversationEngine: boolean;
  communicationIntelligence: boolean | "profileOnly";
  memoryEngine: boolean | "cacheOnly";
  intelligenceEngine: boolean | "shallow" | "full";
  disciplineOrchestrator: string[]; // discipline ids; empty = none
  researchLab: boolean;
  boardReview: boolean;
};
```

---

## Smart Routing Examples

### Example A — Open journal

**Member:** *"Open my journal."*

| Activate | Do NOT activate |
|----------|-----------------|
| Navigation | Marketing |
| Memory (journal context) | Sales |
| Estate → Journal / White Gazebo | Research |
| | Finance |
| | Creative |
| | Strategy |
| | Full Intelligence Engine |

**Response target:** &lt; 1 second.

---

### Example B — Overwhelmed

**Member:** *"I'm overwhelmed."*

| Activate | Defer unless conversation requires |
|----------|-----------------------------------|
| Objective Engine | Research |
| Conversation Engine | Finance |
| Communication Intelligence (Support tone) | Marketing |
| Support route | Sales |
| Focus / Recovery signals | Disciplines |

**Response target:** 1–3 seconds. No discipline lazy-load.

---

### Example C — Six-month marketing campaign

**Member:** *"Help me build a six-month marketing campaign."*

| Activate | Conditional |
|----------|-------------|
| Objective Engine | Research **only** if current market data improves answer |
| Conversation Engine | |
| Marketing | |
| Wordsmith | |
| Strategy | |
| Creative Direction | |
| Intelligence Engine (full) | |
| Response evaluation | |

**Response target:** 2–5 seconds initial; research Level 4+ may extend with progressive response.

---

## Response Time Goals

| Request class | Target | Notes |
|---------------|--------|-------|
| **Navigation** | &lt; 1 s | Cache + preload; no LLM if pure nav |
| **Simple conversation** | 1–3 s | Shallow intelligence path |
| **Business planning** | 2–5 s | Disciplines as needed |
| **Deep research** | 5–15 s | Progressive streaming; never frozen UI |
| **Founder research missions** | Background | Never block conversation |

Budgets are **targets**, not excuses for low quality. If budget cannot be met without violating Spark Standard, prefer progressive response over silence.

---

## Progressive Responses

Spark must **never appear frozen**.

For longer operations:

1. **Immediately** acknowledge the request
2. **Confirm** understanding (brief)
3. **Indicate** what Spark is doing (calm, human — not software progress bars unless UI warrants)
4. **Stream** results as soon as meaningful content exists

Members always feel **progress is being made**.

```ts
type ProgressiveResponse = {
  immediateAck: string;
  understandingConfirm?: string;
  workingIndicator?: string;
  streamEnabled: boolean;
  backgroundTaskId?: string;
};
```

Aligns with Relationship Constitution — never sound like *"Processing…"* or *"Failed"*.

---

## Lazy Loading

Disciplines **never load automatically**.

| Rule | Example |
|------|---------|
| Activate on routing plan only | Marketing not loaded during Support route |
| No preemptive Finance | Unless financial considerations affect recommendation |
| No preemptive Research | Basic planning does not spawn Research Lab |
| Estate preload ≠ full discipline load | Preload warms cache; orchestration still lazy |

[Discipline Orchestrator](./06-discipline-orchestrator.md) receives explicit activation list from this engine — empty list means no discipline packs loaded.

---

## Background Processing

Long-running tasks continue **independently**. Member continues using Spark.

| Background task examples |
|--------------------------|
| Market research |
| Competitor analysis |
| Trend reports |
| Founder Observatory scans |
| Knowledge Library updates |
| Smart Card generation |
| Business reports |

**Rules:**

- `allowBackgroundTasks: true` on routing plan
- Notify on completion; do not block next turn
- Results attach to memory / research library when done
- Conversation thread stays responsive

---

## Intelligent Caching

Cache frequently used information to avoid rebuilding stable context:

| Cache domain |
|--------------|
| Business profile |
| Products, services, offers |
| Communication profile |
| Current projects |
| Goals |
| Templates |
| Knowledge collections |
| Estate preferences |

**Rules:**

- Invalidate on explicit member edit or detected material change
- Tag `cacheHit` in audit logs for performance monitoring
- Memory Engine remains source of truth — cache is read acceleration, not replacement
- Never serve stale financial or legal facts without freshness check

---

## Estate Preloading

When a member **enters** an Estate room, preload only systems **commonly used there** — warm cache, not full pipeline.

| Room | Preload (warm) |
|------|----------------|
| **Creative Studio** | Marketing, Wordsmith, Creative Direction, Templates, Brand voice |
| **Strategy Room** | Strategy, Finance, Research, Decision frameworks |
| **Observatory** | Research, Trend analysis, Future Lab, Founder systems (role-gated) |
| **Celebration Garden** | Achievements, Milestones, Momentum |
| **Memory Conservatory** | Timeline, Evidence, Journal, Story Library |
| **White Gazebo** | Journal, Reflection, Communication profile (gentle tone) |
| **Research Lab** | Research, Knowledge Library |
| **Operations Office** | Operations, Automation |
| **Library** | Learning, Knowledge collections |

Preload does **not** auto-run Intelligence Engine or Board Review. Entry navigation route still targets &lt; 1 s where possible.

---

## Deep Thinking Rule

Before activating extensive reasoning, internally ask:

> **Will additional reasoning materially improve the answer?**

| Answer | Action |
|--------|--------|
| **No** | Respond immediately on shallow path |
| **Yes** | Continue deeper reasoning within budget; use progressive response if over budget |

Maps to `allowDeepThinking` and `intelligenceEngine: "shallow" | "full"` on routing plan.

Momentum before perfection (Constitution, Conversation Engine) — performance engine enforces it at ingress.

---

## Research Levels

Use the **lowest level** that genuinely improves the recommendation.

| Level | Source | When |
|-------|--------|------|
| **1** | Internal knowledge only | Simple asks, high cache hit |
| **2** | Knowledge Library | Frameworks, canonical business knowledge |
| **3** | Business Disciplines | Domain reasoning required |
| **4** | Current research | Facts, market, verification needed |
| **5** | Founder Research Mission | Deep, background, high-stakes |

Escalate levels only when routing plan or Intelligence Engine confidence requires it — never default to Level 5.

---

## Parallel Processing

Whenever possible, execute concurrently:

| Parallel group A (ingress) |
|----------------------------|
| Route classification |
| Lightweight objective detection |
| Memory cache read |
| Communication profile read |

| Parallel group B (when full path) |
|-----------------------------------|
| Objective Engine (full) |
| Conversation mode selection |
| Estate context load |

**Avoid sequential processing** when parallel execution is safe and does not race on incomplete objective.

Implementation: `parallelGroups` on `RoutingPlan` for orchestrator schedulers.

---

## Performance Monitoring

Track internally (founder / engineering — never member-facing dashboards by default):

| Metric |
|--------|
| Average response time by route type |
| Slowest modules per route |
| Most frequently activated disciplines |
| Average routing depth (module count) |
| Clarification frequency |
| Research frequency by level |
| User satisfaction signals (implicit: continuation, abandonment) |
| Abandoned conversations mid-wait |
| Repeated requests (same objective — proxy for miss) |

Feed into routing policy tuning and discipline lazy-load thresholds.

---

## Performance Standards

Spark should **never** feel:

| Anti-pattern |
|--------------|
| Slow |
| Frozen |
| Uncertain (without honest transparency) |
| Overly complicated |

Members should **consistently** feel:

| Target feeling |
|----------------|
| Spark responds immediately |
| Spark thinks intelligently |
| Spark stays focused |
| Extra time only when deeper thinking adds value |

---

## Pipeline Position

```
Member input
    ↓
Spark Constitution™ (policy)
    ↓
Spark Performance & Routing Engine™  ← this module → RoutingPlan
    ↓
[Parallel] Memory cache · Communication profile · Lightweight objective skim
    ↓
Spark Objective Engine™ (full or lightweight per plan)
    ↓
Spark Conversation Engine™ (if activated)
    ↓
Spark Intelligence Engine™ (shallow or full per plan)
    ↓
Communication Intelligence™ (if activated)
    ↓
Spark Response Evaluation Engine™ (final QA gate)
    ↓
Estate Navigation / Background tasks
    ↓
Member-facing response (progressive if needed)
```

**Boundary with [Intent Router](./03-intent-router.md):**

| Engine | Owns |
|--------|------|
| **Performance & Routing** | Which modules run, time budget, research level, lazy load, cache, preload |
| **Intent Router** | Workspace / Estate destination, companion-led navigation targets |

Both consume the same utterance; Performance & Routing runs first and constrains cost. Intent Router refines *where* when route includes Navigation or Estate.

---

## Evaluation Checklist

Before executing routing plan:

| Question | Required |
|----------|----------|
| Is this the minimum module set for the objective? | Yes |
| Does response time budget match route class? | Yes |
| Are deferred disciplines truly unnecessary now? | Yes |
| Is research level no higher than needed? | Yes |
| Will member see progress if over budget? | Yes |
| Does shallow path still pass Spark Standard? | Yes |

---

## Success Metric

The Performance & Routing Engine succeeds when members consistently say:

| Statement |
|-----------|
| *"Spark feels incredibly fast."* |
| *"It never wastes my time."* |
| *"It always seems to know exactly how much thinking is needed."* |
| *"It feels responsive without sacrificing quality."* |

Performance is a **defining competitive advantage** — equal in importance to intelligence, design, and usability.

---

## Implementation Notes

- **Not wired to production.** v1.0 is specification only.
- Implement as `evaluatePerformanceRouting(input: RequestIngress): RoutingPlan`.
- Align with `lib/intentRoutingIntelligence.ts`, `lib/companionIntelligenceRouter.ts`, streaming response infrastructure.
- Navigation-only paths should bypass LLM when deterministic routing suffices.
- Register metrics hooks for founder intelligence (aggregated).
- QA: enforce routing examples A–C as regression fixtures.

---

## Future Expansion

- Per-member performance preferences (e.g. always prefer depth for strategy)
- Edge deployment / regional latency budgets
- Predictive preload from arrival intelligence
- Auto-downgrade modules under load without member-visible degradation of trust

---

**Status:** Draft v1.0
