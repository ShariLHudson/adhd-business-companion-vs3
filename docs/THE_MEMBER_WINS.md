# The Member Wins™

## Permanent Architecture Principle

| Field | Value |
|-------|-------|
| **Name** | The Member Wins™ |
| **Status** | Permanent — precedes implementation convenience |
| **Applies to** | Every design decision, spec change, feature, prompt, and line of code |

---

## The question

Every design decision must answer:

> **Does this make life easier for the member?**

If the answer is no — or unclear — **redesign before implementing**.

---

## Precedence

**The Member Wins™** takes precedence over:

| Lower priority | Why it loses |
|----------------|--------------|
| Implementation convenience | Easier for engineers is not easier for members |
| Coding simplicity | Simpler code that burdens the member is wrong simplicity |
| Traditional software design | Dashboards, folders, settings, and feature sprawl are not the product |
| Developer velocity | Shipping fast the wrong thing harms trust |
| Technical elegance | Architecture serves the member — not the other way around |

When in conflict:

> **Member ease wins. Always.**

---

## Relationship to other principles

| Principle | Relationship |
|-----------|----------------|
| [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) | How the member **feels** — emotional authority |
| [Spec 111 — Spark Hospitality](./SPARK_HOSPITALITY_FRAMEWORK.md) | Emotional operating system |
| [Spec 100 — Transformation Constitution](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) | Why Spark exists — capability growth |
| [128 — Simplicity & Cognitive Load](./constitution/128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) | How ease is audited — every release must reduce cognitive effort |
| [131 — Create Intelligence & Intent](./constitution/131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md) | How Create understands goals — outcomes before artifacts; no “talk to the system” |
| [132 — Momentum Protection](./constitution/132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md) | How momentum is protected — never surprise; Ten-Second Rule; “I just kept working.” |
| [Architecture Freeze](./SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md) | Specs change only when testing proves better member experience |
| [Parking Lot](./PARKING_LOT.md) | Future ideas wait — current milestone serves the member **now** |

---

## Practical gate (before every change)

1. Name the member problem this solves
2. Ask: *Does this make life easier for the member?*
3. If yes → proceed within frozen architecture rules
4. If no → stop · park in [PARKING_LOT.md](./PARKING_LOT.md) or redesign
5. If "easier for us" → **The Member Wins™** blocks it

---

## Cursor

**Rule:** `.cursor/rules/the-member-wins.mdc` (always apply)

**Type:** `lib/sparkArchitecturePrinciples/memberWins.ts`

---

**Status:** Permanent v1.0
