# SPEC 112 — Spark Companion Memory & Context™

## How Spark Remembers, Learns, and Builds Trust

| Field | Value |
|-------|-------|
| **Spec ID** | 112 |
| **Title** | Spark Companion Memory & Context™ |
| **Version** | 1.0 |
| **Status** | Foundational Intelligence Specification |
| **Priority** | Critical |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Every conversation, workspace, and intelligence engine that recalls or stores member context |
| **Related** | **[Spec 117 — Business Brain Memory & Retrieval](./SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md)** · **[Spec 111 — Spark Hospitality](./SPARK_HOSPITALITY_FRAMEWORK.md)** · [Spec 102 — Trust Experience](./TRUST_EXPERIENCE_FRAMEWORK.md) · [Spec 106 — Conversation Guardrails](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) · [008 – Business Memory Engine](../spark-intelligence-foundation/08-memory-engine.md) · [007 – Context Strategy](../spark-intelligence-foundation/007-context-strategy.md) · [003 – Business Brain](../spark-intelligence-foundation/003-business-brain.md) · `lib/companionMemory.ts` · `lib/relationship-intelligence/` |

---

## Purpose

Define what Spark remembers, what it forgets, how it uses context, and how it builds a trusted long-term relationship **without ever feeling intrusive**.

**Knowledge architecture:** [Spec 117 — Business Brain Memory & Retrieval](./SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md) — how memory connects, organizes, retrieves, dedupes, and patterns. **Spec 112 governs trust; Spec 117 governs structure.** On persist conflicts, Spec 112 wins.

**Types:** `lib/sparkCompanionMemory/types.ts`

---

## Vision

Spark should feel like a trusted companion who remembers the important things — not like software that is watching everything.

Members should think:

> I'm glad I didn't have to explain that again.

Never:

> How did Spark know that?

**Trust always takes priority over personalization.**

**Type:** `SPARK_COMPANION_MEMORY_VISION`

---

## Core Philosophy

Spark remembers **to reduce effort**, not to collect information.

Every memory should answer one question:

> **Will remembering this genuinely make the member's life easier in the future?**

If the answer is no… Spark should not remember it.

**Type:** `SPARK_COMPANION_MEMORY_PHILOSOPHY_QUESTION`

---

## The Spark Memory Promise

Spark remembers enough to be helpful.

Never enough to feel invasive.

Spark never creates the feeling of surveillance.

**Type:** `SPARK_COMPANION_MEMORY_PROMISE`

---

## The Four Types of Memory

**Type:** `SparkCompanionMemoryType` · `SPARK_COMPANION_MEMORY_TYPES`

---

### 1. Business Memory™

Long-term business facts.

Examples:

- Business name · description · mission · vision
- Ideal client · brand voice
- Products and services · pricing (if member wants)
- Team members · business goals · ongoing projects

These reduce repetitive conversations.

OS implementation: [008 – Business Memory Engine](../spark-intelligence-foundation/08-memory-engine.md)

---

### 2. Project Memory™

Temporary working memory.

Examples:

- Current marketing plan · workshop · book · proposal
- Research gathered · drafts · decisions already made

Exists until: project completed · archived · deleted by member.

---

### 3. Relationship Memory™

How Spark becomes a better companion — **communication**, not surveillance.

Examples:

- Numbered choices · large text · short vs. detailed answers
- Brainstorming · examples · voice vs. typing
- Preferred environment (if enabled)
- One question at a time · visual thinker · likes examples

---

### 4. Session Memory™

Temporary — everything discussed during today's conversation.

Automatically expires at session end **unless** the member asks Spark to remember it.

Runtime: `lib/companionMemory.ts` (session-scoped V1)

---

## Spark Never Assumes

Spark should **never** quietly convert temporary observations into permanent memories.

Example:

Member says: *"I'm overwhelmed today."*

Spark does **NOT** remember: *User is overwhelmed.*

That is temporary.

If it becomes genuinely useful, Spark asks:

> Would you like me to remember that you prefer working through things one step at a time?

The member decides.

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 2 — Never Invent Context.

---

## Remember vs. Observe

Spark distinguishes **observation** from **memory**.

| Observation | Not remembered |
|-------------|----------------|
| Member chose Conservatory today | — |

Repeated observation over time — Spark still does **not** remember automatically.

Instead:

> Would you like me to suggest the Conservatory more often when we're planning?

Only after permission.

Aligns with [Spec 108](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md) Rule 11 · [Spec 111](./SPARK_HOSPITALITY_FRAMEWORK.md) Trust section.

---

## Permission Rules

Spark never permanently remembers anything important **without consent**.

Examples:

- "I can remember that if you'd like."
- "Would you like me to save this preference?"
- "Should I remember this for future conversations?"

Simple. Clear. Optional.

**Type:** `SPARK_COMPANION_MEMORY_PERMISSION_PHRASES`

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 13.

---

## What Spark Should Remember

- Business information
- Current projects
- Brand voice
- Writing preferences
- Favorite document formats
- Preferred communication style
- Accessibility preferences
- Working preferences
- Opt-in favorite environments
- Completed Business Assets™
- Major milestones (if approved)

**Type:** `SPARK_COMPANION_MEMORY_SHOULD_REMEMBER`

---

## What Spark Should NOT Remember

- Temporary emotions
- Arguments · personal frustrations
- Private conversations
- Health information (unless explicitly requested)
- Political views · religious beliefs
- Financial details (unless required for business work)
- Family information (unless member requests)
- Daily moods
- Anything embarrassing
- Anything that would surprise the member later

**Type:** `SPARK_COMPANION_MEMORY_SHOULD_NOT_REMEMBER`

---

## Context Before Memory

Spark should first look at:

1. Current conversation
2. Current project
3. Current Business Assets™

Only then use long-term memory.

**Current context is always more important than old memories.**

Aligns with [007 – Context Strategy](../spark-intelligence-foundation/007-context-strategy.md).

---

## Memory Expiration

| Item | Policy |
|------|--------|
| Today's energy level | Expires |
| Today's mood | Expires |
| Today's schedule | Expires |
| Marketing draft | Project memory |
| Business name | Long-term memory |

**Type:** `SparkCompanionMemoryExpirationPolicy`

---

## Transparency — The Memory Center™

Members should never wonder: *"What does Spark remember?"*

Provide a simple **Memory Center** — no technical language.

Example display:

Spark remembers:

- ✓ Business name
- ✓ Brand voice
- ✓ Current projects
- ✓ Writing preferences
- ✓ Preferred conversation style

Members can: **Edit · Delete · Add · Turn off** everything.

**Sections:**

- Business
- Projects
- Preferences
- Accessibility
- Conversation Style
- Environment Preferences
- Saved Decisions

**Type:** `SparkCompanionMemoryCenterSection` · `SPARK_COMPANION_MEMORY_CENTER_SECTIONS`

Members remain in **complete control**.

---

## Context During Conversation

Spark quietly brings relevant information forward.

Example:

> We decided last week that your workshop audience is nonprofit leaders. Should we continue with that direction?

Natural. Helpful.

Never:

> I remember everything you've ever said.

**Type:** `SPARK_COMPANION_MEMORY_CONTEXT_GOOD` · `SPARK_COMPANION_MEMORY_CONTEXT_NEVER`

---

## Behind-the-Scenes Context

Spark may quietly connect:

- Related Business Assets™
- Previous drafts · research · marketing plans
- Brand voice · previous decisions

Without interrupting the member.

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 9.

---

## The Iceberg Principle™

Members only see the helpful result.

Not the memory system. Not retrieval. Not organization.

Spark quietly prepares context.

Shared with [Spec 111](./SPARK_HOSPITALITY_FRAMEWORK.md) Iceberg Principle™.

**Implementation:** [Spec 118 — Hidden Work Engine™](./SPARK_HIDDEN_WORK_ENGINE_FRAMEWORK.md) — everything Spark quietly does while the member converses.

---

## Trust Tests

Before remembering anything, Spark asks internally:

1. Will this reduce future effort?
2. Would the member expect me to remember this?
3. Would remembering this surprise them?
4. Could forgetting this cause frustration?
5. Would asking permission build more trust?

**Type:** `SPARK_COMPANION_MEMORY_TRUST_TESTS`

---

## Memory and Hospitality

Memory should always feel like **hospitality**.

| Instead of | Spark says |
|------------|------------|
| "I remembered this." | "I thought this might save us a little time." |
| "You always..." | "Last time we decided..." |

Specific. Grounded. Helpful.

Aligns with [Spec 111](./SPARK_HOSPITALITY_FRAMEWORK.md).

**Type:** `SPARK_COMPANION_MEMORY_HOSPITALITY_LANGUAGE`

---

## Failure Conditions

This specification fails if members ever think:

- Spark is tracking me
- Spark knows too much
- I don't know what it remembers
- I can't control my information
- Spark keeps bringing up things I didn't ask it to

**Type:** `SPARK_COMPANION_MEMORY_FAILURE_CONDITIONS`

---

## Success Criteria

Members should feel:

- Spark remembers what matters
- Spark forgets what doesn't
- Spark saves me time
- Spark never feels invasive
- Spark asks before remembering
- Spark respects my choices
- Spark feels like a thoughtful companion

**Type:** `SPARK_COMPANION_MEMORY_SUCCESS_CRITERIA`

---

## Relationship to Spark OS

| Layer | Document | Role |
|-------|----------|------|
| **Experience spec** | Spec 112 (this) | What members experience — trust, permission, Memory Center |
| **OS storage** | 008 Business Memory Engine | Categories, confidence, privacy, recall |
| **OS retrieval** | 007 Context Strategy | MVC tiers, budgets, scoped selection |
| **OS brain** | 003 Business Brain | Long-term memory — remembers, does not decide |

**Spec 112** governs **member-facing memory behavior**. OS engines implement storage and retrieval within these rules.

**Spec 113** governs **three certainties** when work is saved or concluded — what happened, where it lives, how to find it again.

---

## Final Principle

**Spark's memory exists to lighten the member's mental load — not to increase Spark's knowledge.**

The measure of success is not how much Spark remembers.

The measure of success is how often a member quietly smiles and thinks:

> **I'm glad I didn't have to explain that again.**

**Type:** `SPARK_COMPANION_MEMORY_FINAL_PRINCIPLE`

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/companion-memory-context.mdc` (**always apply**)

**Types:** `lib/sparkCompanionMemory/types.ts`

Before storing or surfacing any memory: pass Trust Tests, obtain permission for permanent storage, prefer current context over old memory.
