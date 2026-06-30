# SPEC 118 — Hidden Work Engine™ (The Iceberg)

## Everything Spark Quietly Does While the Member Simply Has a Conversation

| Field | Value |
|-------|-------|
| **Spec ID** | 118 |
| **Title** | Hidden Work Engine™ (The Iceberg) |
| **Version** | 1.0 |
| **Status** | Foundational Architecture — competitive advantage |
| **Priority** | Critical |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **User request** | Filed as **Spec 118** — [Spec 112](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md) is Companion Memory & Context™ |
| **Applies to** | Every conversation turn, frosted workspace session, Business Experience™, and async pipeline behind the companion |
| **Related** | **[Spec 111 — Spark Hospitality](./SPARK_HOSPITALITY_FRAMEWORK.md)** (Iceberg Principle™) · **[Spec 114 — Flow Engine](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md)** · **[Spec 117 — Business Brain Memory & Retrieval](./SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md)** · **[Spec 112 — Companion Memory](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md)** · **[Spec 109 — Frosted Workspace](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)** · **[Spec 116 — Gold Standards](./SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md)** · [006 – Response Architecture](../spark-intelligence-foundation/006-spark-response-architecture.md) · [008 – Interaction Contracts](../spark-intelligence-foundation/008-interaction-contracts.md) |

---

## Purpose

Define **everything Spark quietly does** while the member simply has a conversation.

This may become one of Spark's **greatest competitive advantages**.

The member never feels busy.

**Spark does.**

**Types:** `lib/sparkHiddenWorkEngine/types.ts`

---

## The Iceberg

```text
        ╱╲     ← ~10% visible: conversation, clarity, one next step
       ╱  ╲
      ╱    ╲   ← Hidden Work Engine (this spec)
     ╱──────╲
    ╱        ╲  organize · research · connect · draft · remember · scan
   ╱__________╲
```

| Surface (visible) | Submerged (hidden) |
|-------------------|-------------------|
| Shari's next response | Flow reasoning ([Spec 114](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md)) |
| One calm question or draft invitation | Brain retrieval ([Spec 117](./SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md)) |
| Frosted workspace when needed ([Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)) | Asset linking, research prep, opportunity scan |
| Member chooses what to do next | Autosave, indexing, LIG edges, win capture |

**Type:** `HIDDEN_WORK_ICEBERG_PRINCIPLE`

Philosophy originates in [Spec 111](./SPARK_HOSPITALITY_FRAMEWORK.md) Iceberg Principle™. **Spec 118 is the engine that runs the submerged 90%.**

---

## Core Principle

> **The member experiences clarity. Spark carries complexity.**

Hidden work must:

- **Never** make the member feel they are managing Spark
- **Never** block the conversation waiting for background jobs
- **Never** announce bureaucracy ("Processing your request…", "Organizing files…")
- **Always** respect permission before surfacing prepared work ([Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 5)

**Type:** `HIDDEN_WORK_CORE_PRINCIPLE`

Aligns with Intelligence Paradox (AGENTS.md) — backend may be complex; frontend stays calm.

---

## Architecture Position

| Layer | Spec | Role |
|-------|------|------|
| Emotional promise | [111](./SPARK_HOSPITALITY_FRAMEWORK.md) | Members see ~10%; clarity not complexity |
| Turn reasoning | [114](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md) | What member needs now — triggers hidden work |
| Trust & memory permission | [112](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md) | What may be remembered — gates memory-class work |
| Knowledge writes & retrieval | [117](./SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md) | Brain updates are a **category** of hidden work |
| **Hidden execution** | **118 (this)** | **Queue, run, and govern all submerged work** |
| QA reference | [116](./SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md) | Each turn documents hidden work performed |

**Spec 106 wins on conflict** — hidden work never bypasses guardrails.

---

## What Hidden Work Is

Hidden work is **any productive action Spark performs that the member did not ask to manage**.

While the member is talking, Spark may quietly:

| Work | Example |
|------|---------|
| **Organize Business Assets™** | Link new messaging to existing offer asset |
| **Prepare research** | Gather sources while member clarifies audience |
| **Connect related projects** | LIG edge: this workshop ↔ last year's launch |
| **Identify opportunities** | Soft signal: member mentioned podcast — note for later |
| **Remember wins** | Capture milestone when member shares a launch (with permission) |
| **Update Business Brain™** | Propose audience refinement after confirmed direction |
| **Draft ideas** | Prepare messaging draft — **not shown until permission** |
| **Prepare social posts** | Draft variants in background after clarity reached |
| **Identify missing information** | Gap list: pricing unknown, channel unset — informs next question |
| **Retrieve context** | MVC bundle before responding — member never sees the query |
| **Autosave & index** | Persist conversation artifacts without interrupting |
| **Anticipate next step** | Pre-stage environment or asset template — invite only when ready |

**Type:** `HiddenWorkCategory`

---

## What Hidden Work Is NOT

| Not hidden work | Why |
|-----------------|-----|
| Member-facing recommendations | Guidance Engine™ |
| Shari's spoken response | Companion™ |
| Showing a draft without permission | Guardrails violation |
| Progress dashboards, task lists | Violates calm surface |
| "I'm working on that for you" narration | Software voice — fails Shari test |
| Surveillance-style tracking | Spec 112 forbidden |

---

## The Hidden Work Pipeline

Every turn may enqueue zero or many work items. **Response always ships first.**

```text
Member message arrives
    ↓
[Sync] Flow Engine + recall + response generation
    ↓
Member sees Shari's response (never delayed for hidden work)
    ↓
[Async] Hidden Work Engine — enqueue from turn analysis
    ↓
Workers execute by category (parallel where safe)
    ↓
Outcomes: ready · needs_permission · deferred · failed_silent
    ↓
Next turn or completion may surface outcomes (with permission gates)
```

**Type:** `HiddenWorkPipelineStage`

Aligns with [006 – Response Architecture](../spark-intelligence-foundation/006-spark-response-architecture.md) — learning and memory writes never block helping.

---

## Work Item Lifecycle

```text
detected
    ↓
queued
    ↓
running
    ↓
completed | needs_permission | deferred | cancelled | failed_silent
```

| Status | Meaning |
|--------|---------|
| `detected` | Turn analysis identified opportunity — not yet queued |
| `queued` | Accepted; waiting for worker |
| `running` | In progress (member unaware) |
| `completed` | Done; outcome stored; may inform next turn |
| `needs_permission` | Result ready — must not surface until member approves |
| `deferred` | Missing confidence or dependency — retry later |
| `cancelled` | Member changed direction; discard quietly |
| `failed_silent` | Log internally; never alarm member |

**Type:** `HiddenWorkItemStatus`

---

## Work Categories (Complete Taxonomy)

**Type:** `HiddenWorkCategory` · `HIDDEN_WORK_CATEGORIES`

### Memory & Brain

| Category | Hidden action | Gated by |
|----------|---------------|----------|
| `brain_retrieve` | MVC recall before respond | 117 · 007 |
| `brain_propose_write` | Candidate memory after turn | 112 · 117 |
| `brain_connect` | LIG edge between objects | 117 |
| `win_capture` | Milestone / celebration evidence | 112 permission |

### Assets & Organization

| Category | Hidden action |
|----------|---------------|
| `asset_organize` | Tag, link, stage Business Asset™ |
| `asset_create_prep` | Pre-stage template — not visible until invited |
| `project_connect` | Link utterance to active project slot |
| `autosave` | Persist draft / conversation artifact |

### Thinking & Creation Prep

| Category | Hidden action |
|----------|---------------|
| `research_prep` | Gather sources, outline, notes |
| `draft_prep` | Messaging, doc, email, post variants |
| `content_prep` | Social posts, captions — permission before show |
| `gap_analysis` | Missing info inventory for Flow Engine |

### Intelligence (observe — never conclude)

| Category | Hidden action |
|----------|---------------|
| `opportunity_scan` | Tentative opportunity signal — low assertiveness |
| `pattern_observe` | Pattern candidate — never label member |
| `anticipate_next` | Pre-stage environment or tool — invite only |

---

## Trigger Rules — When to Run Hidden Work

After each member turn, silently evaluate:

| Question | If yes |
|----------|--------|
| Would this reduce repetition later? | `brain_propose_write`, `asset_organize` |
| Did member choose research or create mode? | `research_prep`, `draft_prep` |
| Is there an active project or asset anchor? | `project_connect`, `autosave` |
| Did member share a win or milestone? | `win_capture` (permission path) |
| Is confidence high enough to draft? | `draft_prep` → `needs_permission` |
| Is critical info still missing? | `gap_analysis` → informs next question only |
| Would surfacing work add cognitive load now? | **Defer** — hospitality first |

**Type:** `HIDDEN_WORK_TRIGGER_QUESTIONS`

Flow Engine ([114](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md)) supplies `intent`, `mode`, `confidence` — Hidden Work Engine consumes them; does not override them.

---

## Visibility Rules

### Default: Invisible

Member sees **nothing** about hidden work unless:

1. Member explicitly chose an action that implies work ("research this", "draft something")
2. Frosted workspace reveals prepared artifact **after permission** ([Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md))
3. Completion certainties reference saved work ([Spec 113](./SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md)) — outcome, not process

### Never Show

| Anti-pattern | Why |
|--------------|-----|
| Spinners for background organization | Member feels they wait on software |
| "I'm organizing your assets" | Software voice |
| To-do lists of what Spark did | Busy-ness transferred to member |
| Percent complete | Gamification of labor |
| Failed job errors in conversation | Breaks trust — fail silent, retry |

### May Show (Calm)

| Pattern | When |
|---------|------|
| Frosted draft panel | After permission to review |
| "I put together a starting point — want to look?" | Permission invitation |
| Research summary card | Member chose research |
| Three certainties at completion | What was saved — not how |

**Type:** `HiddenWorkVisibility`

---

## Permission Gates

Prepared work **never** appears without consent.

| Work outcome | Gate |
|--------------|------|
| Draft ready | "Want to take a look?" |
| Memory persist | Spec 112 permission phrases |
| Win saved to Gallery | Soft confirm if not explicit |
| New asset created | Invite review — not auto-open |
| Opportunity surfaced | Only when member is exploring growth — never cold |

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 5 · [Spec 113](./SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md).

---

## Cancellation & Direction Changes

When the member changes topic or says "actually…":

1. **Cancel** in-flight draft prep for obsolete direction
2. **Defer** research that no longer applies
3. **Do not** mention cancelled work
4. **Never** guilt ("We already started…")

Hidden work serves the **current** conversation — not sunk cost.

---

## Relationship to Business Brain™ (Spec 117)

| Brain concern | Hidden work role |
|---------------|------------------|
| Retrieve before re-ask | `brain_retrieve` — sync slice of hidden work |
| Propose writes async | `brain_propose_write` — after response |
| Connect ideas | `brain_connect` — LIG edges |
| Avoid duplicates | Workers check entity resolution before create |
| Pattern observe | `pattern_observe` — never member-facing labels |

Brain stores wisdom. Hidden Work Engine **executes** the submerged operations that keep Brain current.

---

## Relationship to Gold Standards (Spec 116)

Every gold-standard turn includes a **Hidden work** section.

That section is the **QA trace** for this spec:

```markdown
**Hidden work**
- Link utterance to project memory: "App marketing — clarity focus"
- Queue: draft_prep (deferred — confidence medium)
- brain_retrieve: prior brand voice (none found)
```

When Cursor gets conversation wrong, diff hidden work:

- Was work **missing** that should have run?
- Was work **surfaced** too early?
- Did work **block** the response?
- Did work **violate** permission or hospitality?

---

## System Boundaries

### Hidden Work Engine DOES

| Responsibility |
|----------------|
| Enqueue and run async productive work |
| Govern visibility and permission gates |
| Cancel obsolete work silently |
| Feed outcomes to Flow Engine / Completion |
| Log failures internally — never alarm member |
| Keep member cognitive load at zero for submerged labor |

### Hidden Work Engine DOES NOT

| Forbidden | Owner |
|-----------|-------|
| Speak to member | Companion™ |
| Decide recommendations | Guidance Engine™ |
| Bypass memory trust gates | Spec 112 |
| Block response delivery | Response Architecture |
| Expose raw queues in UI | Experience Engine™ |

[008 – Interaction Contracts](../spark-intelligence-foundation/008-interaction-contracts.md)

---

## Failure Modes (Compare When Wrong)

| Failure | Gold-standard fix |
|---------|-------------------|
| Member waits on spinner | Ship response first; work async |
| "I'm saving / organizing…" | Remove narration; work invisible |
| Draft appears uninvited | `needs_permission` gate |
| Member overwhelmed by notifications | Defer all non-essential surfacing |
| Duplicate assets created | `asset_organize` + entity resolution (117) |
| Memory saved without consent | Route through 112 trust gate |
| Hidden work list shown in UI | Intelligence Paradox violation |

---

## Success Criteria

| # | Criterion |
|---|-----------|
| 1 | Member never feels busy managing Spark |
| 2 | Conversation never blocks on background work |
| 3 | Prepared work surfaces only with permission |
| 4 | Brain, assets, and projects stay organized without folders |
| 5 | Research and drafts feel "ready when you are" |
| 6 | Wins and connections accumulate quietly |
| 7 | Gold-standard hidden-work traces match runtime behavior |
| 8 | Competitive feel: *"Spark just handles things"* — not *"Spark showed me its homework"* |

**Type:** `HIDDEN_WORK_SUCCESS_CRITERIA`

---

## Implementation Map

| Concern | Home |
|---------|------|
| Work taxonomy & queue types | `lib/sparkHiddenWorkEngine/types.ts` |
| Turn triggers | Consumes `lib/sparkConversationFlowEngine/types.ts` |
| Memory writes | `lib/sparkCoreIntelligence/memoryEngine/` via `brain_*` workers |
| Brain architecture | `lib/sparkBusinessBrain/memoryRetrievalTypes.ts` |
| Frosted reveal | `lib/sparkFrostedConversationWorkspace/types.ts` |
| Gold-standard traces | `docs/conversation-gold-standards/*.md` |

**Not fully wired to production.** Spec 118 is the blueprint for the iceberg — compare gold standards when submerged work is wrong.

---

## Final Principle

> **Looks incredibly simple. Works incredibly hard.**

The member talks.

Spark carries the rest — in silence, with permission, until clarity is ready to share.

**Type:** `HIDDEN_WORK_FINAL_PRINCIPLE`

---

**Status:** Foundational v1.0
