# Spark Conversation Architecture — FROZEN

| Field | Value |
|-------|-------|
| **Milestone** | **Spark v3.0** — [Conversation Frozen](./SPARK_V3_0_CONVERSATION_FROZEN.md) |
| **Status** | **FROZEN** — architecture complete · **Observation Mode active** |
| **Date** | June 29, 2026 |
| **Branch** | `v3.0-conversation-frozen` |
| **Objective** | Observe · document · validate — not design |
| **Principle** | [The Member Wins™](./THE_MEMBER_WINS.md) |

---

## When specifications may change

These specifications may only change when **repeated testing demonstrates a measurably better member experience**.

They are **not** changed because they are easier to implement.

---

## What is frozen

From this point forward:

| Do not | Do |
|--------|-----|
| Redesign Spark | **Observe** real conversations |
| Redesign the UI | **Log** to [Conversation Learning Log](./CONVERSATION_LEARNING_LOG.md) |
| Introduce new workflows | **Track patterns** on [Evolution Board](./SPARK_EVOLUTION_BOARD.md) |
| Add features or new specs | **Validate** with CT tests + eight QA gates |
| Change prompts from one example | **Refine** only after [Rule of Three](./SPARK_OBSERVATION_MODE.md) |

**The conversation is the product.** Everything else supports the conversation.

**Future ideas:** [Parking Lot](./PARKING_LOT.md) — capture, do not build.

**Observation Mode:** [SPARK_OBSERVATION_MODE.md](./SPARK_OBSERVATION_MODE.md) — **active phase**

**Conversation Coach:** [SPARK_CONVERSATION_COACH.md](./SPARK_CONVERSATION_COACH.md) — Cursor's role

**Founder intelligence (future):** [SPARK_FOUNDER_DASHBOARD_FRAMEWORK.md](./SPARK_FOUNDER_DASHBOARD_FRAMEWORK.md) — not member-facing

**Every decision:** [The Member Wins™](./THE_MEMBER_WINS.md) — *Does this make life easier for the member?*

---

## Complete specification stack (105–119)

| ID | Spec |
|----|------|
| 105 | Spark Conversation Engine™ |
| 106 | Conversation Guardrails™ |
| 107 | Conversation State Machine™ |
| 108 | Environment Integration™ |
| 109 | Frosted Conversation Workspace™ |
| 110 | Conversation Completion™ |
| 111 | Spark Hospitality™ |
| 112 | Companion Memory & Context™ |
| 113 | Certainty Before Completion™ |
| 114 | Conversation Flow Engine™ |
| 116 | Conversation Gold Standards™ |
| 117 | Business Brain™ Memory & Retrieval |
| 118 | Hidden Work Engine™ (Iceberg) |
| 119 | Conversation Validation / Tests™ |

Spec 115 superseded by 116.

---

## Wisdom layer (120–130) — how Spark thinks

| ID | Spec |
|----|------|
| 120 | Wisdom Before Information™ |
| 121 | Hidden Intent Recognition™ |
| 122 | Insight Generation™ |
| 123 | Companion Judgment™ |
| 124 | Gentle Challenge™ |
| 125 | Conversation Synthesis™ |
| 126 | Opportunity Recognition™ |
| 127 | Mentor Moments™ |
| 128 | Thinking Pause™ |
| 129 | Future Benefit™ |
| 130 | The Wisdom Loop™ |
| 131 | Outcome Discovery™ |

**Principle:** [The Shari Principle™](./THE_SHARI_PRINCIPLE.md) · **Framework:** [SPARK_WISDOM_LAYER_FRAMEWORK.md](./SPARK_WISDOM_LAYER_FRAMEWORK.md) · **Runtime:** `lib/sparkWisdom/`

Specs 105–119 define what Spark does. Specs 120–131 define how Spark thinks before speaking.

---

## QA system (two layers)

| Layer | Spec | Role |
|-------|------|------|
| **Gold Standards** | 116 | What excellent looks like |
| **Conversation Validation** | 119 | Break the engine — eight QA gates |

---

## Final question (every conversation)

> **Would this member feel like they just spent twenty minutes with a thoughtful business companion — rather than operating an application?**

If no → do not add features. Improve the conversation. Test again.

---

## Cursor rules (enforced)

- `.cursor/rules/spark-observation-mode.mdc` — **active · always apply**
- `.cursor/rules/spark-conversation-coach.mdc` — **active · always apply**
- `.cursor/rules/the-member-wins.mdc`
- `.cursor/rules/spark-conversation-architecture-frozen.mdc`
- `.cursor/rules/conversation-tests.mdc`
- `.cursor/rules/conversation-gold-standards.mdc`
- `.cursor/rules/spark-wisdom-layer.mdc`

**Next phase:** apprenticeship — [Observation Mode](./SPARK_OBSERVATION_MODE.md). Spark is being **discovered**, not designed.

**Prototype surface:** [Spark Alpha™](./SPARK_ALPHA_FRAMEWORK.md) — `/spark-alpha`
