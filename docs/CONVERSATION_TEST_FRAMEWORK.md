# Conversation Test Framework — Spark V4 Permanent Evaluation

| Field | Value |
|-------|-------|
| **Status** | V4 foundation — extends Spec 119 |
| **Mandate** | **Break the engine.** Never declare "Passed." |
| **Parent** | [SPARK_V4_ARCHITECTURE.md](./SPARK_V4_ARCHITECTURE.md) |
| **Frozen base** | [Spec 119](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md) |
| **Scorecard** | [SCORECARD_TEMPLATE.md](./conversation-tests/SCORECARD_TEMPLATE.md) |

---

## Purpose

V3 validated that **conversation quality methodology works**.

V4 expands it into a **permanent evaluation framework** covering:

- Human companion quality (frozen eight gates)
- AI orchestration quality (routing, speed, accuracy)
- Discovery quality (suggestions, invitations)
- Pre-delivery scoring (every response)

> **Every conversation should receive a quality score before delivery.**

---

## Two evaluation modes

| Mode | When | Audience |
|------|------|----------|
| **Pre-delivery (automated)** | Every Spark response, runtime | OS 010 + V4 extensions |
| **Post-conversation (human)** | CT tests, Observation Mode | Founder, coaches, QA |

Both use aligned dimensions. Pre-delivery is the **speed gate**; post-conversation is the **truth gate**.

---

## Layer 1 — Frozen eight QA gates (Spec 119)

**Mandatory for every human test run.** Do not skip.

| Gate | Name | Output |
|------|------|--------|
| 1 | Conversation Quality | 10 categories × 1–10 |
| 2 | Hospitality™ (111) | 5 pass/fail |
| 3 | Cognitive Load | 🟢 🟡 🔴 |
| 4 | Iceberg (118) | Submerged work + permission |
| 5 | Relief Test™ | Increased / unchanged / decreased |
| 6 | Future Me Test™ | Tomorrow easier? |
| 7 | Spark Question™ | Software or Shari? |
| 8 | Shari Over-the-Shoulder | Warmth, pace, trust, ADHD |

**Living tests:** `docs/conversation-tests/ct-01.md` … `ct-11.md`

**Gold Standards:** `docs/conversation-gold-standards/`

---

## Layer 2 — V4 extended dimensions

Added for orchestration, discovery, and systems evaluation.

### 9. Objective accuracy

| Check | Question |
|-------|----------|
| Factual claims | Verifiable or qualified? |
| Business advice | Appropriate to stated context? |
| Hallucination | Invented features, memory, or assets? |
| Confidence match | Uncertainty stated when needed? (102) |

**Failure type:** `objective_inaccuracy` · `hallucinated_context`

### 10. Emotional intelligence

| Check | Question |
|-------|----------|
| Emotion read | Overwhelm, excitement, fear recognized? |
| Pace match | Rushed or patronizing? |
| Safety | Shame, guilt, surveillance avoided? |
| Recovery | T-007 honored on hard days? |

**Failure type:** `emotional_mismatch`

### 11. Routing & orchestration (internal)

| Check | Question |
|-------|----------|
| Route fit | Right capability class for request? |
| Depth earned | Deep reasoning only when needed? |
| Latency | Felt immediate for simple turns? |
| Fallback | Graceful when provider fails? |

**Failure type:** `routing_mismatch` · `latency_violation`

*Never shown to members — founder/dev panel only.*

### 12. Suggestions & discovery

| Check | Question |
|-------|----------|
| One primary | Max one main suggestion? |
| Max three choices | T-003 respected? |
| Discoverability | Capability offered through conversation? |
| Permission | No auto-open features? |
| Overwhelm | Feature dump avoided? |

**Failure type:** `discovery_overwhelm` · `unsolicited_navigation`

### 13. Memory & Brain

| Check | Question |
|-------|----------|
| Retrieval before re-ask | Brain checked? (117) |
| Permission | Permanent memory proposed, not taken? |
| Hospitality recall | "Last time we…" not "My database…" |
| Wrong memory | Invented or stale recall? |

**Failure type:** `memory_violation` · `missing_retrieval`

### 14. Executive function support

| Check | Question |
|-------|----------|
| Next step obvious | Primary rule (109)? |
| Decision load | Fewer decisions after turn? |
| Momentum | Clear path forward? |
| Input visible | Chat always reachable? |

**Failure type:** `ef_friction`

### 15. Speed & responsiveness

| Tier | Target (felt) |
|------|----------------|
| Instant dialogue | < 2s to first token |
| Guided | < 8s |
| Strategic | Acknowledge + async if longer |

**Failure type:** `perceived_slowness`

### 16. Conversation continuity

| Check | Question |
|-------|----------|
| Thread coherence | Topic carried forward? |
| Environment move | Conversation preserved? (108) |
| Return greeting | No reset after absence? (T-007) |
| Wisdom synthesis | Due insights surfaced? (122) |

**Failure type:** `continuity_break`

### 17. AI voice detection

| Check | Question |
|-------|----------|
| Shari test | Would Shari say this aloud? |
| Banned patterns | Headings, essay voice, fillers? |
| Software voice | Error/success transactional language? |

**Failure type:** `ai_voice_detected`

**Authority:** [SPARK_HUMAN_VOICE_RULES.md](./SPARK_HUMAN_VOICE_RULES.md)

---

## Pre-delivery scoring pipeline (V4 target)

Extends [10 Response Evaluation Engine](../spark-intelligence-foundation/10-spark-response-evaluation-engine.md):

```
Draft response (from orchestration layer)
    ↓
Automated lint — voice rules, banned phrases
    ↓
Dimension scorers (subset by route)
    ↓
Weighted composite score 0–100
    ↓
≥ threshold → deliver
< threshold → rewrite once → re-score → else safe fallback
    ↓
Member sees only final Spark response
```

### Composite weights (default)

| Dimension | Weight |
|-----------|--------|
| Conversation quality + hospitality | 25% |
| Objective accuracy | 15% |
| Emotional intelligence | 15% |
| EF support | 15% |
| Memory/Brain | 10% |
| Discovery/suggestions | 10% |
| Voice (not AI) | 10% |

Routing and speed scored separately for ops — not blocking unless extreme.

### Delivery threshold

| Score | Action |
|-------|--------|
| ≥ 85 | Deliver |
| 70–84 | One internal rewrite |
| < 70 | Safe fallback + log for Observation |

Thresholds tuned from CT evidence — not arbitrary.

---

## Primary test suite (V4)

Run regularly — especially after orchestration changes:

| Test | Focus | V4 dimensions emphasized |
|------|-------|--------------------------|
| CT-01 | Marketing plan | Accuracy, creation timing, voice |
| CT-05 | I don't know | EF, emotional intelligence |
| CT-09 | Draft review | Permission, iceberg |
| CT-10 | Retrieval | Memory, Brain, accuracy |
| CT-11 | Hidden intent | Wisdom, emotional intelligence |
| **CT-12** *(proposed)* | Welcome Home first session | Discovery, overwhelm, belonging |
| **CT-13** *(proposed)* | Discovery Key unlock | Discovery, permission |
| **CT-14** *(proposed)* | Research request | Routing, accuracy, speed |

CT-12–14 documented in Phase 2 — not blocking V4.0.

---

## Scorecard template (V4 extension)

Use [SCORECARD_TEMPLATE.md](./conversation-tests/SCORECARD_TEMPLATE.md) for Gates 1–8.

Add section for V4 dimensions:

```markdown
## V4 Extended Dimensions

| Dimension | Pass? | Score | Notes |
|-----------|:-----:|:-----:|-------|
| Objective accuracy | | /10 | |
| Emotional intelligence | | /10 | |
| Routing (internal) | | /10 | |
| Discovery & suggestions | | /10 | |
| Memory & Brain | | /10 | |
| Executive function | | /10 | |
| Speed (felt) | | /10 | |
| Continuity | | /10 | |
| AI voice | | Y/N | |

**Pre-delivery composite (if available):** __ / 100
```

---

## Observation Mode integration

After every live conversation ([SPARK_OBSERVATION_MODE.md](./SPARK_OBSERVATION_MODE.md)):

1. Run eight review questions
2. Note V4 dimension failures
3. Log to [CONVERSATION_LEARNING_LOG.md](./CONVERSATION_LEARNING_LOG.md)
4. **Rule of Three** before prompt/code changes
5. Propose on [SPARK_EVOLUTION_BOARD.md](./SPARK_EVOLUTION_BOARD.md) only after 3+ unrelated occurrences

---

## CI / automation roadmap

| Stage | Automation |
|-------|------------|
| M1 | Voice lint — banned phrases (`lib/humanConversation/sparkHumanVoice.ts`) |
| M2 | CT fixture runner — scripted turns |
| M3 | Pre-delivery scorer — blocking low composites |
| M4 | Routing telemetry — latency + fallback alerts |
| M5 | Nightly CT-01 + CT-11 smoke |

**Never** auto-ship prompt changes from CI alone — human Shari gate remains.

---

## Failure response protocol

1. Identify **exact turn**
2. Classify **failure type** (from tables above)
3. **Rewrite one response only** — not whole conversation
4. Reference nearest **Gold Standard**
5. Log pattern — watch for Rule of Three
6. **Do not** add features to fix philosophy failures

---

## Final questions (every evaluation)

| Question | Source |
|----------|--------|
| Companion for 20 minutes — or operating software? | Spec 119 |
| Would Shari be proud of this conversation? | Conversation Coach |
| Did quality of **next decision** improve? | Spec 100 |
| Pre-delivery score ≥ threshold? | V4 pipeline |

---

## Related documents

| Doc | Role |
|-----|------|
| [SPARK_CONVERSATION_TESTS_FRAMEWORK.md](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md) | Frozen Spec 119 |
| [SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md](./SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md) | What excellence looks like |
| [SPARK_OBSERVATION_MODE.md](./SPARK_OBSERVATION_MODE.md) | Live conversation logging |
| [10 Response Evaluation](../spark-intelligence-foundation/10-spark-response-evaluation-engine.md) | OS evaluation engine |
| [AI_CAPABILITY_MATRIX.md](./AI_CAPABILITY_MATRIX.md) | Routing context for Gate 11 |

---

## Constitutional reminder

The conversation is the product.

V4 adds orchestration and discovery **in service of** that product — never as a replacement for warmth, permission, and trust.
