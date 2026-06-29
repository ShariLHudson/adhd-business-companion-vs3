# Spark Trust & Performance Engine™

**Spark OS — highest-priority engineering system. Nothing matters more.**

| Field | Value |
|-------|-------|
| **Priority** | **Absolute** — supersedes feature work when in conflict |
| **Governed by** | [Spark Constitution™](./00-spark-constitution.md) |
| **Implementation** | `lib/sparkTrustPerformance/` |
| **Wraps** | [Cognitive Orchestration](./13-spark-cognitive-orchestration-engine.md) · [Performance & Routing](./09-spark-performance-routing-engine.md) · [Response Evaluation](./10-spark-response-evaluation-engine.md) |
| **Status** | Draft v1.0 |

---

## Primary Mission

Every response must be:

| # | Standard |
|---|----------|
| 1 | **Correct** |
| 2 | **Fast** |
| 3 | **Helpful** |
| 4 | **Trustworthy** |

If these four are not met, **no additional features matter**.

---

## The Golden Rule

| Never |
|-------|
| Sacrifice response quality for additional features |
| Sacrifice speed for unnecessary complexity |
| Activate intelligence that is not required |

---

## Response Pipeline

### STEP 1 — Determine intent immediately

**Target: &lt; 100 ms** (ingress classification — no LLM)

Output: `intentLabel`, `complexityLevel`, `modulesToActivate`

### STEP 2 — Determine response complexity

| Level | Class | Minimum intelligence |
|-------|-------|----------------------|
| **1** | Simple answer | Knowledge / quick path |
| **2** | Business guidance | Targeted disciplines |
| **3** | Creative collaboration | Creative + Wordsmith |
| **4** | Executive reasoning | Strategy + Finance + Leadership |
| **5** | Deep research | Observatory / Research Lab |

**Only activate minimum intelligence required.**

Delegates depth to [Performance & Routing](./09-spark-performance-routing-engine.md) research levels.

---

## Performance Targets

| Stage | Target |
|-------|--------|
| Intent detection | &lt; 100 ms |
| First token | &lt; 750 ms |
| Simple responses (L1) | ~1 s |
| Normal responses (L2–3) | 2–4 s |
| Deep reasoning (L4–5) | Stream immediately — **never frozen UI** |

---

## Discipline Activation

Never activate all executive disciplines.

| Request type | Activate |
|--------------|----------|
| Simple definition | Knowledge Engine only |
| Marketing question | Marketing + Wordsmith |
| Business strategy | Strategy + Finance + Leadership |
| Research | Observatory / Research |
| Large creative project | Creative + Wordsmith + Marketing |

Additional disciplines **only when confidence requires**.

---

## Background Processing

While member reads, preload (non-blocking):

- Likely follow-up questions
- Related Smart Cards
- Likely Estate destinations
- Relevant knowledge
- Warm frequently used services

Spec only in v1 — hooks on `TrustPerformancePlan.backgroundPreload`.

---

## Cache Strategy

Cache until regeneration required:

- Definitions, frameworks, mental models
- Business history (via [Business Memory](./08-memory-engine.md))
- Frequently requested knowledge

`cachePolicy: regenerate | hit` on ingress.

---

## Objective Lock

Once objective understood ([Focus & Objective Lock](./11-spark-focus-objective-lock-engine.md)):

- Never drift
- Never advertise unrelated features
- Never over-answer
- **Complete objective first** — expansion optional

---

## Trust Rules

| If uncertain | Do |
|--------------|-----|
| Say so | Never invent |
| | Never guess |

Separate in reasoning and copy when material:

- **Facts**
- **Reasoning**
- **Recommendations**
- **Assumptions**

---

## Quality Gate

Before every response:

| Question |
|----------|
| Did I answer the correct question? |
| Did I remain on objective? |
| Can this response be shorter? |
| Can it be clearer? |
| Can it be faster? |
| Would I trust this answer if I were the member? |

If **no** → rewrite before sending.

Implemented in `runTrustQualityGate()`.

---

## Absolute Priority

Every engineering decision must improve **at least one** of:

- Correctness
- Speed
- Trust
- Focus

If it improves **none** of these → **do not build it yet**.

---

## Architecture

```
Member message
    ↓
Spark Trust & Performance Engine™  ← ingress (<100ms intent + complexity)
    ↓
Cognitive Orchestration / Performance Routing
    ↓
[Composition]
    ↓
Spark Trust & Performance Engine™  ← quality gate (egress)
    ↓
Member response (+ background preload)
```

---

## Success Metric

Members describe Spark as:

**Fast · Reliable · Helpful · Accurate · Natural · Trustworthy**

Spark feels like the smartest person in the room — **without making the member feel less intelligent**.

---

**Status:** Draft v1.0
