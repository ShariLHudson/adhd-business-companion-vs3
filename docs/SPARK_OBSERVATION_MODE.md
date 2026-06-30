# Spark Observation Mode™

| Field | Value |
|-------|-------|
| **Status** | **Active** — Spark apprenticeship phase |
| **Date entered** | June 28, 2026 |
| **Principle** | [The Shari Principle™](./THE_SHARI_PRINCIPLE.md) · [The Member Wins™](./THE_MEMBER_WINS.md) |
| **Journal** | [CONVERSATION_LEARNING_LOG.md](./CONVERSATION_LEARNING_LOG.md) |
| **Evolution board** | [SPARK_EVOLUTION_BOARD.md](./SPARK_EVOLUTION_BOARD.md) |

---

## Architecture is complete

| Layer | Specs | Status |
|-------|-------|--------|
| Conversation Architecture | 105–119 | **Frozen** |
| Wisdom Layer | 120–131 | **Complete** |

**Do not add new features.**

**Do not add new specifications.**

**Do not redesign conversations.**

---

## Role change

| Before | Now |
|--------|-----|
| Architect | **Observer** |
| Designer | **Coach** |
| Builder | **Quality engineer** |

We are no longer asking: *"What should Spark do?"*

We are asking: *"What did Spark miss?"*

---

## Final principle

**Spark is no longer being designed.**

**Spark is being discovered.**

Protect the relationship. Everything else can evolve from evidence.

---

## New objective

Every improvement to Spark must come from **real conversations**, not assumptions.

| Every… | Is… |
|--------|-----|
| Live conversation | User research |
| Failure | A gift |
| Hesitation | A clue |

Sit quietly in the room. Watch Shari coach someone. Then write what you saw.

---

## After every conversation — eight review questions

### 1. Where did Spark genuinely help?

- Identify the **exact turn**
- Explain **why it worked**

### 2. Where did Spark miss an opportunity?

Not a wrong answer — a **missed opportunity**.

Examples: deeper question · coaching moment · synthesis · encouragement · hidden intent · Spark workspace · celebration · simplification

### 3. What was the member really trying to accomplish?

```
Surface request
    ↓
Hidden intent
    ↓
Desired future (hoped success)
    ↓
Actual transformation
```

### 4. What insight did Spark fail to notice?

Could Spark have recognized: a pattern · a fear · a strength · a recurring theme · a contradiction · an opportunity

### 5. What invisible work should Spark have prepared?

Without acting. Without asking. Simply preparing.

### 6. What should Spark remember?

Would this conversation improve future conversations?

If yes — what should be remembered?

### 7. Did Spark ever sound like software?

If yes — **rewrite only that response.**

### 8. What would Shari have done differently?

Not technically. **Humanly.**

### 9. Emotional blocker check (CT-05 Part B — procrastination / avoidance)

When the member couldn't start, procrastinated, or avoided something they already know how to do:

> **Did Spark reduce the emotional weight of the task before suggesting how to do it?**

If **no** — log as incomplete. Note whether Spark jumped to timers, tools, or planning too early.

Also note when Spark **correctly** honored a simple request (timer, print, vent) without over-therapizing.

### Archetype hypothesis (future — [Coaching Archetypes](./SPARK_COACHING_ARCHETYPES_EVOLUTION.md))

When reviewing, optionally tag which coaching stance Shari would recognize (e.g. Emotional Avoidance, Decision Overload, Quit Temptation). **Do not implement archetype routing yet** — log only, to build evidence for a future Wisdom Layer evolution.

### 10. Human voice check ([Spark Human Voice Rules](./SPARK_HUMAN_VOICE_RULES.md))

> Did this response sound like **Shari**, or like **AI-generated text**?

Flag `ai_voice_detected` when you see: markdown headings, "Great question!", "Let's dive in", essay-length frameworks, corporate filler, generic coaching voice.

Goal is authentic human voice — **not** tricking AI detectors.

---

## Conversation Improvement Rule

**Do not immediately change prompts.**

Wait until the same weakness appears in **at least three unrelated conversations**.

Only then propose a change.

Spark evolves from **recurring patterns**, not isolated examples.

---

## The Rule of Three™

Before changing Spark's behavior, verify:

> Has this issue appeared in **three or more** unrelated conversations?

| Count | Action |
|-------|--------|
| 1–2 | **Document** in [Learning Log](./CONVERSATION_LEARNING_LOG.md) · status **Observed** or **Watching** |
| 3+ | May propose change on [Evolution Board](./SPARK_EVOLUTION_BOARD.md) · status **Implement** (after approval) |
| Fixed + validated | **Resolved** |

Nothing gets implemented because it sounds good.

It gets implemented because **the evidence supports it**.

---

## Workflow

```
Live conversation
    ↓
Review (8 questions)
    ↓
Log entry → CONVERSATION_LEARNING_LOG.md
    ↓
If pattern repeats → SPARK_EVOLUTION_BOARD.md
    ↓
Rule of Three met + approved → minimal prompt/refinement change
    ↓
Re-validate (CT-11 + relevant tests)
    ↓
Resolved
```

---

## What is still allowed

- Run conversation tests (CT-01, CT-05, CT-09, CT-10, CT-11)
- Complete eight QA gate scorecards
- Document observations
- Rewrite **one failed turn** for learning (not ship)
- Tighten prompts **only** after Rule of Three + evolution board approval

## What is not allowed

- New features · new specs · new workflows · UI redesign
- Prompt changes from a single conversation
- Feature development disguised as "fixes"
- Falling back into architecture mode

---

## Cursor

- `.cursor/rules/spark-conversation-coach.mdc` — **primary role · always apply**
- `.cursor/rules/spark-observation-mode.mdc` — always apply
- Companion rules: [conversation-tests](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md) · [gold standards](./SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md) · [wisdom layer](./SPARK_WISDOM_LAYER_FRAMEWORK.md)

---

**Spark is entering apprenticeship. The members will teach us how Spark should grow.**

**Listen before changing. Observe before implementing. Refine only after repeated evidence.**
