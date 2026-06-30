# SPEC 117 — Business Brain™ Memory & Retrieval

## Spark's Knowledge Architecture

| Field | Value |
|-------|-------|
| **Spec ID** | 117 |
| **Title** | Business Brain™ Memory & Retrieval |
| **Version** | 1.0 |
| **Status** | Foundational Knowledge Architecture |
| **Priority** | Critical — every intelligence system depends on this |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **User request** | Filed as **Spec 117** — [Spec 111](./SPARK_HOSPITALITY_FRAMEWORK.md) is Spark Hospitality™; [Spec 112](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md) is companion trust & permission |
| **Applies to** | Business Brain™, Memory Engine, Context Strategy, LIG, conversation recall, My Thoughts, Business Assets, every engine that reads or writes knowledge |
| **Related** | [003 – Business Brain](../spark-intelligence-foundation/003-business-brain.md) · [004 – Knowledge Model](../spark-intelligence-foundation/004-spark-knowledge-model.md) · [007 – Context Strategy](../spark-intelligence-foundation/007-context-strategy.md) · [008 – Memory Engine](../spark-intelligence-foundation/08-memory-engine.md) · [009 – Brain Lifecycle](../spark-intelligence-foundation/009-business-brain-lifecycle.md) · **[Spec 112 — Companion Memory & Context](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md)** · [002 – Business Assets](../spark-intelligence-foundation/002-business-asset-architecture.md) · `lib/sparkBusinessBrain/` · `lib/sparkCoreIntelligence/memoryEngine/` |

---

## Purpose

This is Spark's **knowledge architecture** — how business understanding is acquired, connected, organized, retrieved, deduplicated, patterned, and selectively forgotten.

It answers seven questions:

| # | Question |
|---|----------|
| 1 | How does Spark remember? |
| 2 | How does it connect ideas? |
| 3 | How does it organize without folders? |
| 4 | How does it retrieve naturally? |
| 5 | How does it avoid duplicates? |
| 6 | How does it recognize patterns? |
| 7 | How does it remember what matters while forgetting what doesn't? |

**Types:** `lib/sparkBusinessBrain/memoryRetrievalTypes.ts`

---

## Architecture Position

| Layer | Spec | Role |
|-------|------|------|
| OS identity | [003](../spark-intelligence-foundation/003-business-brain.md) | Brain remembers — does not decide, guide, or create |
| Knowledge taxonomy | [004](../spark-intelligence-foundation/004-spark-knowledge-model.md) | Nine knowledge categories, confidence, ownership |
| Lifecycle & versioning | [009](../spark-intelligence-foundation/009-business-brain-lifecycle.md) | Observed → Retired; phases; learning signals |
| Runtime categories | [008](../spark-intelligence-foundation/08-memory-engine.md) | Memory records, provenance, member control |
| Retrieval selection | [007](../spark-intelligence-foundation/007-context-strategy.md) | MVC — Brain stores; Strategy selects |
| **Knowledge architecture** | **117 (this)** | **How memory, connection, organization, retrieval, dedup, patterns, and forgetting work as one system** |
| Member trust & permission | [112](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md) | What members feel; when to ask; Memory Center |

**Spec 112 governs trust and permission.**  
**Spec 117 governs structure and mechanics.**

If they conflict on whether to persist something → **Spec 112 wins** (trust over architecture).

---

## Core Principle

> **The Business Brain is not a database.**
>
> It is a **living map** of how this business thinks, builds, decides, and evolves.

Members never manage folders.

Spark never dumps everything into one pile.

Knowledge **accumulates**, **connects**, **ages**, and **retires** — like a thoughtful partner who has been in the business for years.

**Type:** `BUSINESS_BRAIN_MEMORY_CORE_PRINCIPLE`

---

## 1. How Spark Remembers

### The Remembering Pipeline

Every potential memory passes through five gates before it becomes durable Business Brain knowledge:

```text
Signal detected (conversation, asset, capture, import)
    ↓
Trust gate (Spec 112 — should we remember at all?)
    ↓
Classification (Spark Knowledge Model category)
    ↓
Lifecycle assignment (Observed → … → Active)
    ↓
Connection (LIG edges, asset anchors, lineage)
    ↓
Permission (if required) → Verified / Active
```

**Type:** `BusinessBrainRememberingPipelineStage`

### Learning Signals

Spark does **not** learn from a single utterance alone unless the member explicitly confirms.

| Signal | Weight |
|--------|--------|
| Member explicit statement | Strong |
| Member confirmation ("yes, remember that") | Strongest |
| Repeated consistent behavior | Medium |
| Business Asset created or completed | Medium |
| Reinforcing signals across conversations | Medium |
| Single casual mention | Weak — Observed only |

Aligns with [009 – Learning Rules](../spark-intelligence-foundation/009-business-brain-lifecycle.md).

### Provenance (Every Record)

Every memory carries **where it came from**:

| Provenance | Meaning |
|------------|---------|
| `member_stated` | Said once, not yet confirmed |
| `member_confirmed` | Member approved persistence |
| `observed` | Inferred from behavior |
| `imported` | External source with consent |

**Type:** `BusinessBrainMemoryProvenance`

### What Gets Written

| Write type | When |
|------------|------|
| **Proposal** | Candidate fact — may prompt member |
| **Confirmation** | Conflict or permission required |
| **Direct** | Member confirmed or high-trust asset event |
| **Archive** | Superseded — history preserved |
| **Retire** | Member deleted or explicitly ended |

Writes are **async** — never block the conversation ([008](../spark-intelligence-foundation/08-memory-engine.md)).

### Remembering vs. Recalling

| Remembering | Recalling |
|-------------|-----------|
| Write path — after turn | Read path — before response |
| Governed by lifecycle + trust | Governed by MVC + freshness |
| May require permission | Never asserts Observed as fact |

---

## 2. How Spark Connects Ideas

### Connection Model — Not Folders

Ideas connect through **relationships**, not directory trees.

Three connection layers:

```text
Layer 1 — Lineage (originatedFromId / originatedFromKind)
    "This marketing plan came from that thought."

Layer 2 — Living Intelligence Graph (connectionIds)
    "This offer relates to that audience, that workshop, that decision."

Layer 3 — Asset Anchors (businessAssetId / projectId)
    "This knowledge belongs to this living object."
```

**Type:** `BusinessBrainConnectionLayer`

### Edge Types (LIG)

| Edge | Example |
|------|---------|
| `evolved_from` | Thought → Project |
| `supports` | Research → Offer |
| `decided_in` | Conversation → Decision |
| `references` | Asset → Asset |
| `same_topic` | Soft semantic cluster |
| `supersedes` | New audience definition replaces old |
| `pattern_of` | Recurring observation (low assertiveness) |

**Type:** `BusinessBrainKnowledgeEdgeType`

### Connection Rules

| Do | Do not |
|----|--------|
| Connect when lineage is clear | Force every note into one hierarchy |
| Preserve evolution chains | Duplicate when object evolves |
| Let one idea have many relationships | Require member to file anything |
| Strengthen edges when reinforced | Expose graph complexity in UI |

Intelligence hooks: `IntelligenceReadyHooks` on every durable object (`lib/intelligence/intelligenceReadyTypes.ts`).

---

## 3. How Spark Organizes Without Folders

### Organization Philosophy

> Members think in **projects, ideas, and seasons** — not in nested folders.

Spark organizes knowledge through **four visible metaphors** and **one invisible graph**:

| Metaphor | What it is | Member sees |
|----------|------------|-------------|
| **Companion Boxes™** | Themed collections (My Thoughts) | Color, name, gentle grouping |
| **Business Assets™** | Living things being built | Workshop, offer, course, plan |
| **Projects** | Time-bounded work | Active · paused · complete |
| **Memory Center™** | Readable summary (Spec 112) | Business · projects · preferences |
| **Living Intelligence Graph** | Invisible relationship web | Nothing — Intelligence Paradox |

There is **no folder tree** in the knowledge architecture.

### Clustering Dimensions (Internal)

When Spark needs to "find related things," it clusters by:

| Dimension | Use |
|-----------|-----|
| **Category** | Business Knowledge™, Asset Knowledge™, etc. ([004](../spark-intelligence-foundation/004-spark-knowledge-model.md)) |
| **Lifecycle stage** | Active vs. historical |
| **Freshness** | Current vs. aging |
| **Asset anchor** | What this knowledge serves |
| **Project scope** | What we're building right now |
| **Semantic proximity** | Topic similarity (future) |
| **Temporal season** | Launch period, quarter, chapter |

**Type:** `BusinessBrainOrganizationDimension`

### Companion Boxes vs. Brain Categories

| Companion Boxes | Business Brain categories |
|-----------------|---------------------------|
| Member-facing organization | Internal knowledge taxonomy |
| Emotional, visual, chosen | Structural, consistent, engine-readable |
| A thought can live in one box | A fact can connect to many edges |

Boxes are **how members browse**. Brain categories are **how Spark reasons**.

---

## 4. How Spark Retrieves Naturally

### Retrieval Philosophy

> Retrieval should feel like a partner who **already did the homework** — not like search results.

Natural recall means:

- Relevant facts surface **in conversation** — not as a memory dump
- Spark checks Brain **before re-asking**
- Only **MVC** loads per turn ([007](../spark-intelligence-foundation/007-context-strategy.md))
- Tone follows [Spec 112](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md) hospitality language

**Type:** `BUSINESS_BRAIN_NATURAL_RETRIEVAL_PRINCIPLE`

### Retrieval Stack

```text
Turn intent + active workspace + current asset
    ↓
Context Strategy — what context class is needed?
    ↓
Retrieval query — scoped bundle (not full Brain)
    ↓
Rank by: lifecycle stage × freshness × relevance × confidence
    ↓
MemoryRecallDecision → Conversation / Guidance / Create
```

**Type:** `BusinessBrainRetrievalQuery` · `BusinessBrainRetrievalBundle`

### Retrieval Priority (Lifecycle)

| Stage | Auto-retrieve |
|-------|---------------|
| Active · Mature | Yes — highest |
| Verified | Yes — high |
| Historical | When context references past |
| Candidate · Observed | No assertive recall |
| Archived | On member request only |
| Retired | Never auto |

From `BUSINESS_KNOWLEDGE_RETRIEVAL_PRIORITY` in `lib/sparkBusinessBrain/lifecycleTypes.ts`.

### Natural vs. Robotic Recall

| Natural (pass) | Robotic (fail) |
|----------------|----------------|
| "Last time we decided your workshop audience is nonprofit leaders." | "According to my records..." |
| "I thought this might save us a little time." | "I remembered that you..." |
| Soft confirmation when stale | Re-asking what Brain already knows |
| Honest gap when unknown | Invented history |

### Before Asking Any Question

Silently evaluate ([008](../spark-intelligence-foundation/08-memory-engine.md)):

| Question | Action |
|----------|--------|
| Do I already know this? | Recall — don't ask |
| Is it stale? | Confirm freshness |
| Would re-asking frustrate? | Confirm instead |
| Is confidence too low? | One gentle check |

---

## 5. How Spark Avoids Duplicates

### Duplicate Philosophy

> Same truth, one canonical home.  
> Same topic, many expressions — merged with care.

Duplicates are prevented at three levels:

### Level 1 — Entity Resolution

Before creating a new record, Spark checks:

| Check | Example |
|-------|---------|
| Same canonical key | `audience`, `brand_voice`, `primary_offer` |
| Same asset anchor | Workshop already exists |
| Same lineage parent | Thought already spawned this project |
| Semantic near-duplicate | "nonprofit leaders" vs. "nonprofit executives" |

**Type:** `BusinessBrainDuplicateCheck`

### Level 2 — Merge vs. Version

| Situation | Action |
|-----------|--------|
| Same fact, new phrasing | Strengthen confidence — don't fork |
| Business evolution | **Version** — new phase, old preserved ([009](../spark-intelligence-foundation/009-business-brain-lifecycle.md)) |
| Competing hypotheses | Hold both — confirm with member |
| True duplicate object | Merge proposal with member visibility |

**Never silently overwrite** significant business knowledge.

### Level 3 — Lineage, Not Copies

When a thought becomes a project becomes an asset:

```text
thought-abc  ──evolved_from──►  project-xyz  ──evolved_from──►  asset-123
```

Same lineage chain. **Not** three unrelated copies.

`originatedFromId` + `originatedFromKind` on every enrichable object.

### Duplicate Failure Modes

| Failure | Prevention |
|---------|------------|
| Two audience definitions | Conflict resolution + confirm |
| Same workshop in Projects twice | Asset anchor dedup |
| Repeated capture of same idea | Soft merge into existing thought |
| Brain drift from Assets | Asset is source of truth for asset knowledge |

---

## 6. How Spark Recognizes Patterns

### Pattern Philosophy (Ethical Foundation)

> Patterns are **observations** — never conclusions about the member.

Spark may notice:

- Recurring challenges (overwhelm before launches)
- Emerging strengths (clear positioning after coaching sessions)
- Seasonal rhythms (Q4 planning, summer slowdown)
- Successful strategies (what worked last launch)
- Knowledge gaps (frequently revisited questions)

Spark must **not**:

- Label identity ("you always procrastinate")
- Predict failure
- Shame or score
- Surface patterns without relevance to current moment

**Type:** `BUSINESS_BRAIN_PATTERN_ETHICS`

### Pattern Record Shape

Patterns are **separate** from facts — lower assertiveness, higher humility:

```ts
type BusinessBrainPatternObservation = {
  id: string;
  patternKind: BusinessBrainPatternKind;
  confidence: "tentative" | "emerging" | "consistent";
  evidenceObjectIds: string[];  // lineage to observations
  lifecycleStage: "observed" | "candidate";  // never auto-Active
  memberConfirmed: boolean;
  lastSurfacedAt?: string;  // avoid nagging
};
```

**Type:** `BusinessBrainPatternKind` · `BusinessBrainPatternObservation`

### Pattern Kinds

| Kind | Example observation |
|------|---------------------|
| `recurring_challenge` | Pricing conversations often coincide with launch stress |
| `emerging_strength` | Messaging clarity improved after audience workshops |
| `seasonal_rhythm` | Planning intensity rises in September |
| `strategy_signal` | Webinar → email sequence worked in last launch |
| `knowledge_gap` | Ideal client definition still unsettled |

### When Patterns Surface

| Surface | Do not surface |
|---------|----------------|
| Member is stuck on related topic | Unprompted pattern lectures |
| Gentle support opportunity | "I noticed you always..." |
| After member confirms interest | Dashboards of behaviors |

Aligns with [Spec 111 Hospitality](./SPARK_HOSPITALITY_FRAMEWORK.md) — meet people where they are.

---

## 7. Remembering What Matters, Forgetting What Doesn't

### Selective Memory Philosophy

> Spark becomes **wiser** — not **larger**.

Value of knowledge = f(relevance, accuracy, freshness, confidence, use frequency, goal alignment)

From [009](../spark-intelligence-foundation/009-business-brain-lifecycle.md).

### The Forgetting Spectrum

| Action | When | Member experience |
|--------|------|-------------------|
| **Ignore** | Session chatter, transient emotion | Nothing stored |
| **Decay** | Candidate never reinforced | Fades from candidacy |
| **Archive** | Completed project, old launch | Available if asked |
| **Historical** | Superseded but valuable | Version chain preserved |
| **Retire** | Member deleted or ended | Gone from active recall |

**Type:** `BusinessBrainForgettingAction`

### What Never Becomes Durable (Spec 112)

- Temporary emotions · daily moods
- Arguments · embarrassing moments
- Health · politics · religion · family (unless requested)
- Anything that would surprise the member later

### Freshness Model

| Freshness | Retrieval weight |
|-----------|-------------------|
| `current` | Highest |
| `recent` | High |
| `aging` | Confirm before assert |
| `historical` | Context-dependent |
| `archived` | On request |

**Type:** `BusinessKnowledgeFreshness` in `lifecycleTypes.ts`

### Aging Rules

| Category | Typical aging |
|----------|---------------|
| Active project | Fresh until complete |
| Quarterly goal | Archive when superseded |
| Launch plan | Historical after launch |
| Brand voice | Mature — slow aging |
| Session context | Expires at session end |

### Wisdom Metric

Success is **not** record count.

Success is:

- Fewer repeated questions
- Faster relevant recall
- Smaller MVC bundles over time (better selection)
- Member trust intact

---

## System Boundaries

### Business Brain Memory DOES

| Responsibility |
|----------------|
| Store and evolve business knowledge |
| Connect objects via LIG and lineage |
| Propose writes with governance |
| Supply MVC bundles to other systems |
| Detect duplicates and conflicts |
| Hold tentative pattern observations |
| Archive and retire with history |

### Business Brain Memory DOES NOT

| Forbidden | Owner |
|-----------|-------|
| Generate member-facing copy | Companion™ |
| Recommend next actions | Guidance Engine™ |
| Decide for the member | Member |
| Speak in UI directly | Companion™ |
| Load entire Brain per turn | Context Strategy™ |
| Bypass permission (Spec 112) | — |

[008 – Interaction Contracts](../spark-intelligence-foundation/008-interaction-contracts.md)

---

## Pipeline Position

```text
Member turn
    ↓
Performance & Routing (cache)
    ↓
Business Brain Retrieval (Spec 117) ──► MVC bundle
    ↓
Conversation Engine / Flow Engine / Guidance / Create
    ↓
Member response
    ↓
[Async] Remembering pipeline (Spec 117) ──► proposals · connections · patterns
    ↓
LIG enrichment (future engines)
```

---

## Member Control

All durable knowledge remains:

| Control | Requirement |
|---------|-------------|
| **Review** | Memory Center™ readable sections |
| **Edit** | Member authority overrides Brain |
| **Delete / retire** | Hard or soft per policy |
| **Disable** | Stop new writes |
| **Export** | Portable on request |

Transparency creates trust — not surveillance ([008](../spark-intelligence-foundation/08-memory-engine.md) · Spec 112).

---

## Intelligence-Ready Requirements

Every durable knowledge object:

- `id`, `createdAt`, `updatedAt`
- `originatedFromId`, `originatedFromKind`
- `connectionIds` for LIG
- `intelligenceMeta` per engine — **not** bulk-exposed in UI
- `lifecycleStage`, `freshness`, `provenance`, `confidence`

Register in `lib/intelligence/INTELLIGENCE_REGISTRY.md` when adding categories.

---

## Success Criteria

| # | Criterion |
|---|-----------|
| 1 | Members rarely repeat business facts |
| 2 | Related ideas stay connected without manual filing |
| 3 | No folder-management burden |
| 4 | Recall feels natural — not robotic or surveillance-like |
| 5 | Duplicates merge or version — not multiply |
| 6 | Patterns support gently — never label or shame |
| 7 | Brain grows in wisdom, not noise |
| 8 | Every engine reads consistent knowledge shape |

**Type:** `BUSINESS_BRAIN_MEMORY_SUCCESS_CRITERIA`

---

## Implementation Map

| Concern | Home |
|---------|------|
| Lifecycle stages | `lib/sparkBusinessBrain/lifecycleTypes.ts` |
| Knowledge architecture types | `lib/sparkBusinessBrain/memoryRetrievalTypes.ts` |
| Runtime memory engine | `lib/sparkCoreIntelligence/memoryEngine/` |
| MVC selection | `lib/sparkContextStrategy/types.ts` |
| Knowledge taxonomy | `lib/sparkKnowledgeModel/types.ts` |
| Companion trust layer | `lib/sparkCompanionMemory/types.ts` |
| LIG edges | `lib/arrivalIntelligence/livingIntelligenceGraph.ts` |
| Hidden work execution | `lib/sparkHiddenWorkEngine/types.ts` (Spec 118) |

**Not fully wired to production.** Spec 117 is the blueprint Cursor compares against when memory behavior is wrong.

---

## Related Specs

| Spec | Relationship |
|------|--------------|
| **003** | OS role — remembers, does not decide |
| **004** | What kinds of knowledge exist |
| **007** | How much to retrieve (MVC) |
| **008** | Memory Engine implementation detail |
| **009** | Lifecycle, versioning, learning signals |
| **112** | Trust, permission, Memory Center — wins on persist conflicts |
| **116** | Gold standards show memory behavior in real conversations |
| **118** | Hidden Work Engine executes `brain_*` workers async — submerged 90% |

---

**Status:** Foundational v1.0
