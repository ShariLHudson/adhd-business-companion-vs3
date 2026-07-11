# 138_CAPABILITY_COMPOSITION_ENGINE

# Spark Estate™
## Capability Composition Engine

**Series:** 131–140  
**Depends on:** 132 Model · 133–137 capability specs

---

## Purpose

Compose multiple shared capabilities into one companion response path — dynamically, based on member context.

The member should never see a menu of GPTs or skill products.

---

## Composition principles

1. **One companion voice** — composed skills speak as Spark.
2. **Primary + support** — one lead capability; zero or more supports.
3. **Context wins** — room, recognition flow, and member request shape the stack.
4. **Member override** — explicit requests re-order the stack immediately.
5. **No GPT fan-out** — never suggest “open X GPT.”

---

## Composition stack

```
primaryCapability
  + supportingCapabilities[]
  → companionMoves[]
  → optionalAdapters[]   // Create panel, Decision Compass, Vault — never identities
```

---

## Selection order

1. Explicit member request (“help me decide”, “brainstorm”, “celebrate this”)
2. Active recognition flow / visual_room context
3. Intent signals in the utterance
4. Default: stay in conversation (no forced capability)

---

## Compatibility

Only compose capabilities listed in each other’s `composableWith` (or declared recipes).

Forbidden mixes (examples):
- Celebration + hard Create push in the same breath
- Research deep-dive while preserve-first recognition owns the turn (defer research)

---

## Recipes (v1)

| Recipe id | Primary | Supports | When |
|-----------|---------|----------|------|
| `decide_and_plan` | decision_making | planning | Stuck between options and needs next steps |
| `unstuck` | problem_solving | reflection, planning | Overwhelm / stuck language |
| `create_with_intent` | content_creation | brainstorming, strategy | Drafting with unclear angle |
| `learn_and_apply` | learning | research, planning | Wants to understand then act |
| `notice_and_honor` | celebration | reflection | Win / milestone language |
| `sort_the_pile` | organization | planning, reflection | Brain dump / too much |

---

## Output contract

Composition returns:
- `primaryId`
- `supportIds`
- `reason`
- `companionPromptHint` — guidance for Spark’s reply (not shown as UI chrome)
- `forbiddenExposures` — GPT/product names to avoid
- `optionalAdapter` — null or soft adapter hint (member must confirm)
