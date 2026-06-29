# Spark Business Memory Engine™

**v1.0 — Remember what matters; forget what adds noise.**

| Field | Value |
|-------|-------|
| **Priority** | Context layer — consulted by Objective, Intelligence, Conversation, and Estate modules |
| **Governed by** | [Spark Constitution™](./00-spark-constitution.md) · Trust Principles |
| **OS architecture** | [003 – Business Brain™](./003-business-brain.md) — this engine implements Brain memory rules |
| **Lifecycle** | [009 – Business Brain Lifecycle](./009-business-brain-lifecycle.md) — stages, versioning, retrieval |
| **Knowledge model** | [004 – Spark Knowledge Model™](./004-spark-knowledge-model.md) — Business Knowledge™ category |
| **Context strategy** | [007 – Context Strategy™ & MVC](./007-context-strategy.md) — scoped retrieval; Brain stores, Strategy selects |
| **Separate from** | [Communication Intelligence](./04-communication-intelligence.md) — reference profile, do not duplicate |
| **Founder scope** | [`founder/`](./founder/) — never mixed with member memory |
| **Status** | Draft v1.0 |

---

## Purpose

The Spark Business Memory Engine™ remembers **only** information that genuinely helps members make progress over time.

Spark does **not** attempt to remember everything.

Spark remembers information that:

- Reduces repetition
- Improves recommendations
- Personalizes conversations
- Strengthens the relationship

Business Memory exists to make **every future conversation more valuable than the last**.

---

## Mission

Members should never feel like they are **starting over**.

Spark should gradually become a **trusted business partner** that remembers what matters.

---

## Core Principle

| Remember | Forget / exclude |
|----------|------------------|
| Information that improves future conversations | Noise |
| Confirmed, useful facts | Temporary chatter |
| | Speculation and assumptions |

**Memory should reduce work — not create it.**

---

## Memory Categories

Business Memory organizes into **separate categories**. Each has its own confidence level, update rules, and expiration policy.

```ts
type MemoryCategory =
  | "business_profile"
  | "projects"
  | "goals"
  | "communication_profile_ref"
  | "preferences"
  | "relationships"
  | "business_knowledge"
  | "wins"
  | "challenges";

type BusinessMemoryRecord = {
  id: string;
  category: MemoryCategory;
  key: string;
  value: unknown;
  confidence: MemoryConfidence;
  provenance: "member_stated" | "member_confirmed" | "observed" | "imported";
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  archivedAt?: string;
  intelligenceHooks?: IntelligenceReadyHooks;
};
```

---

### Business Profile

| Remember |
|----------|
| Business name, type, industry |
| Products, services, offers, memberships, courses |
| Audience, mission, vision, brand positioning |
| Business stage, years in business |
| Primary goals, current priorities |

---

### Projects

| Remember |
|----------|
| Active, completed, paused projects |
| Status, milestones, deadlines |
| Associated documents, related conversations |

Spark should always know **what the member is currently building**.

---

### Goals

| Remember |
|----------|
| Quarterly and annual goals |
| Personal, business, learning, marketing, revenue goals |

Reference goals when **relevant** — not every turn.

---

### Communication Profile

**Receive data from [Communication Intelligence](./04-communication-intelligence.md).**

| Reference only (do not duplicate store) |
|----------------------------------------|
| Preferred tone, response length |
| Learning style, decision style |
| Pacing, vocabulary, preferred formats |

Business Memory holds a **`communicationProfileRef`** (pointer + cache metadata). Communication Intelligence remains **source of truth** for style preferences.

---

### Preferences

| Remember |
|----------|
| Favorite Estate rooms, workflows, templates |
| Favorite Smart Cards, planning style, reports |
| Automations, dashboards |

---

### Relationships

| Remember |
|----------|
| Clients, partners, employees, team members |
| Important contacts |
| Family — **only** when member intentionally shares information that affects business conversations |

---

### Business Knowledge

| Remember |
|----------|
| Products discussed, pricing decisions |
| Marketing strategies, brand voice, sales processes |
| Offers, launch plans, recurring workflows |
| Frequently used frameworks |

**Goal:** Avoid asking the same foundational questions repeatedly.

---

### Wins

| Remember |
|----------|
| Launches, sales, milestones, achievements |
| Business anniversaries, completed goals, celebrations |

Spark celebrates progress **naturally** (Constitution Article VIII) — not performatively.

---

### Challenges

Remember **recurring** challenges (patterns, not verdicts):

| Examples |
|----------|
| Procrastination, overwhelm, decision fatigue |
| Marketing struggles, pricing concerns |
| Delegation, confidence, time management |

Spark **gently recognizes** patterns. **Never shame** the member.

Challenges are observations for support — not labels of identity.

---

## Memory Rules

Spark must:

| Do | Do not |
|----|--------|
| Remember only what improves future conversations | Remember temporary conversational details |
| Store with reasonable confidence | Remember speculative information |
| Confirm conflicts with member | Remember assumptions |
| Archive when stale | Infer facts into memory |
| Tag provenance on every record | Bulk-expose raw memory in UI |

Aligns with Constitution Article II: **recall ≠ assumption**.

---

## Memory Confidence

Every memory record carries confidence:

| Level | Meaning | Use in conversation |
|-------|---------|-------------------|
| **Observed** | Seen once or weak signal | Do not assert; may soft-check |
| **Confirmed** | Member confirmed or repeated consistently | Recall gently |
| **High Confidence** | Durable, member-verified or many consistent signals | Reference naturally |
| **Archived** | Historical; not current default | Only when member asks about past |
| **Needs Confirmation** | Conflict or staleness suspected | Confirm before assert |

Spark should **occasionally verify** important memories — invitation tone, not audit.

---

## Updating Memory

When new information **conflicts** with existing memory:

1. **Do not** immediately overwrite
2. **Confirm** with the member

**Example:**

> *"I noticed you mentioned a different target audience than before. Would you like me to update your Business Profile?"*

On confirm → update with `provenance: member_confirmed`, raise confidence.  
On decline → keep prior; log conflict deferred.

---

## Memory Expiration

Some information expires. Spark **archives** rather than deletes whenever possible.

| Often expires / archives |
|--------------------------|
| Temporary projects |
| Old goals (superseded) |
| Past launches |
| Archived products |

`expiresAt` / `archivedAt` on records; retrieval defaults to active set unless context requires history.

---

## Privacy & Member Control

Members always remain in control.

| Capability | Requirement |
|------------|-------------|
| **Review** memory | Readable summary per category |
| **Edit** memory | Member authority overrides inferred values |
| **Delete** memory | Hard delete or archive per policy |
| **Disable** memory | Spark stops new writes; recall policy configurable |
| **Export** memory | Portable export on request |

**Transparency required.** Memory creates **trust — not surveillance**.

Members should feel **supported, never monitored**.

---

## Founder Memory

**Separate Founder Memory from Member Memory** — hard isolation.

Founder Memory stores (operator scope only):

| Domain |
|--------|
| Product ideas, Spark roadmap |
| Future Lab discoveries |
| Competitive observations |
| Engineering decisions |
| Estate ideas |
| Knowledge Library development |

**Never mix** with member conversations or member-facing recall.

Spec: [`founder/`](./founder/) · role-gated storage and retrieval.

---

## Estate Integration

Business Memory **quietly supports** every Estate room:

| Room | Memory support |
|------|----------------|
| **Creative Studio** | Brand voice, visual preferences |
| **Strategy Room** | Goals, priorities, business profile |
| **Observatory** | Research history, patterns |
| **Celebration Garden** | Wins, milestones |
| **Memory Conservatory** | Timelines, evidence, story assets |
| **White Gazebo** | Reflections, journal continuity |
| **Research Lab** | Prior missions, sources |
| **Operations Office** | Workflows, active projects |

Member should **not repeat** information Spark already knows — unless confirming freshness.

---

## Internal Evaluation (Before Asking)

Before asking a question, silently ask:

| Question | If yes |
|----------|--------|
| Do I already know this? | Use memory; don't ask |
| Has the member answered this before? | Reference or confirm freshness |
| Would asking again create frustration? | Confirm instead of re-ask |
| Would confirming be better than asking? | Soft confirmation |

Feeds [Objective Engine](./01-spark-objective-engine.md) Step 5 and [One Question Rule™](./02-conversation-engine.md).

```ts
type MemoryRecallDecision = {
  shouldAsk: boolean;
  shouldConfirm: boolean;
  recalledFacts: BusinessMemoryRecord[];
  staleFacts: BusinessMemoryRecord[];
  missingFacts: string[];
};
```

---

## Recall in Conversation

| Pass | Fail |
|------|------|
| Gentle, relevant acknowledgment | *"I noticed you logged in 5 days in a row"* |
| Honest gaps | Invented history |
| Provenance-aware | False certainty from stale memory |
| Shari test | Surveillance tone |

Never overstate what Spark knows (Constitution Trust Principles).

---

## Pipeline Position

```
Member input
    ↓
Performance & Routing (memory cache read)
    ↓
Business Memory Engine™ → MemoryRecallDecision + context bundle
    ↓
Objective Engine / Intelligence Engine / Conversation Engine
    ↓
[After turn] Memory write pipeline (async, non-blocking)
    ↓
Intelligence-ready enrichment (LIG, narrative — future)
```

Writes do **not** block response delivery. Failed writes retry; never lose member trust on latency.

---

## Relationship to Other Modules

| Module | Boundary |
|--------|----------|
| **Communication Intelligence** | Owns style profile; Memory references only |
| **Focus & Objective Lock** | Thread objective separate from durable business memory |
| **Intelligence Engine** | Queries memory; does not write without governance |
| **Performance & Routing** | Cache accelerates reads; Memory is source of truth |
| **Response Evaluation** | Flags invented or unstated memory claims |

---

## Intelligence-Ready Architecture

All durable memory objects use `IntelligenceReadyHooks`:

- `id`, `createdAt`, `updatedAt`
- `originatedFromId`, `originatedFromKind` (conversation, capture, room)
- `connectionIds` for Living Intelligence Graph
- `intelligenceMeta` for per-engine enrichments — not bulk-exposed in UI

Register categories in `lib/intelligence/INTELLIGENCE_REGISTRY.md` when implementing.

---

## Success Metric

The Business Memory Engine succeeds when members consistently think:

| Thought |
|---------|
| *"Spark remembers the important things."* |
| *"I don't have to repeat myself."* |
| *"It understands my business."* |
| *"It gets more helpful every month."* |

Memory creates **trust — not surveillance**.

---

## Implementation Notes

- **Not wired to production.** v1.0 is specification only.
- Implement as `queryBusinessMemory(context)` + `proposeMemoryWrites(turn)` + `confirmMemoryUpdate()`.
- Map to companion store, thought objects, growth/evidence rooms, arrival intelligence.
- Red-team: false recall, stale audience, conflicting pricing, family data boundaries.
- GDPR: export, delete, disable on account actions.
- Session-only memory (ephemeral) separate from Business Memory categories.

---

## Future Expansion

- Narrative chaptering across years
- Pattern intelligence on challenges (observe, never conclude)
- Shared memory for future team seats (explicit consent)
- Memory-informed arrival intelligence

---

**Status:** Draft v1.0
