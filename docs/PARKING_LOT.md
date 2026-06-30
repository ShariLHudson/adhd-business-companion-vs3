# Parking Lot

## Future ideas — captured, not built

| Field | Value |
|-------|-------|
| **Purpose** | Capture every idea outside the **current milestone** |
| **Rule** | **Nothing in this lot is implemented** until the current milestone is complete |
| **Principle** | [The Member Wins™](./THE_MEMBER_WINS.md) — current milestone serves members **now** |

---

## Why this exists

Good ideas arrive constantly. Building them mid-milestone creates feature creep, splits focus, and delays the member experience we promised.

The Parking Lot ensures:

- **No idea is lost**
- **No idea derails the current milestone**
- Cursor and humans have one place to defer — not forget

---

## Current milestone (active)

**Spark Observation Mode™** — Apprenticeship

Architecture (105–119) and Wisdom Layer (120–131) are **complete**. No new specs or features.

| In scope | Parked |
|----------|--------|
| Live conversations as user research | New features |
| [Learning Log](./CONVERSATION_LEARNING_LOG.md) after every conversation | New specifications |
| [Evolution Board](./SPARK_EVOLUTION_BOARD.md) — Rule of Three | UI redesign |
| Run [Wisdom Validation Gate](./WISDOM_LAYER_VALIDATION_GATE.md) when testing | Prompt changes from single examples |
| `/spark-alpha` for conversation observation | Feature development |

**Mode:** [SPARK_OBSERVATION_MODE.md](./SPARK_OBSERVATION_MODE.md) · **Coach:** [SPARK_CONVERSATION_COACH.md](./SPARK_CONVERSATION_COACH.md) · **Freeze:** [SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md](./SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md)

**Hold rule:** Document first. Implement only after **three unrelated conversations** show the same pattern — and evolution board approval.

**Founder-only (future):** [Spark Founder Dashboard™](./SPARK_FOUNDER_DASHBOARD_FRAMEWORK.md) — aggregates observation data; not a member feature; build when log volume justifies it.

Update this section when the milestone changes.

---

## How to use

### Adding an idea

```markdown
### [Short title] — YYYY-MM-DD
- **Idea:** …
- **Why it matters:** …
- **Member Wins check:** Does this make life easier? (yes/no/unclear)
- **Suggested spec/home:** …
- **Added by:** …
```

### Before implementing anything from the lot

1. Is the **current milestone** complete? If no → **do not implement**
2. Does it pass [The Member Wins™](./THE_MEMBER_WINS.md)?
3. Does it require spec changes? Only if [freeze rules](./SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md) allow (measurably better member experience via testing)

---

## Parked ideas

### Spark Founder Dashboard™ — 2026-06-28

- **Idea:** Founder-only analytics — top patterns, stuck points, hidden intents, hoped futures, workspace suggestions, "felt like Shari" scores, evolution board trends
- **Why it matters:** Guides Spark evolution with evidence instead of intuition; does not change member experience
- **Member Wins check:** yes (indirect — better coaching of Spark)
- **Suggested spec/home:** [SPARK_FOUNDER_DASHBOARD_FRAMEWORK.md](./SPARK_FOUNDER_DASHBOARD_FRAMEWORK.md)
- **Tags:** founder · intelligence
- **Build gate:** After Observation Mode produces meaningful log volume; explicit founder approval

*Add more entries below.*

### Coaching Archetypes™ — 2026-06-28

- **Idea:** Classify conversations by reusable coaching stance (Decision Overload, Emotional Avoidance, Quit Temptation, etc.) instead of growing phrase matchers
- **Why it matters:** Consistency, lower maintenance, matches how Shari naturally coaches across different words
- **Member Wins check:** yes (indirect — more Shari-like consistency)
- **Suggested spec/home:** [SPARK_COACHING_ARCHETYPES_EVOLUTION.md](./SPARK_COACHING_ARCHETYPES_EVOLUTION.md)
- **Tags:** wisdom layer · observation · future
- **Build gate:** Documented only · tag archetypes in Learning Log during Observation Mode · Rule of Three + Evolution Board before any runtime change

### (template)

```markdown
### [Title] — YYYY-MM-DD
- **Idea:** …
- **Why it matters:** …
- **Member Wins check:** yes / no / unclear
- **Suggested spec/home:** …
- **Tags:** feature · room · …
```

---

## Categories (optional tags)

Use tags when filing: `feature` · `room` · `integration` · `intelligence` · `ux` · `founder` · `community` · `content`

---

**Rule for Cursor:** If the user asks for something not in the current milestone, **add it here** and **do not implement** unless they explicitly override the milestone gate.
