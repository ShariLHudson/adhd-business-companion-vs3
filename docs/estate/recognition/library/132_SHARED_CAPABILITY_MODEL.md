# 132_SHARED_CAPABILITY_MODEL

# Spark Estate™
## Shared Capability Model

**Series:** 131–140 Shared Capability Library  
**Depends on:** 131 Overview · 093 Companion Over Features  
**Rule:** Do not implement GPTs. Convert architecture into reusable capabilities.

---

## Purpose

Define the contract for every shared capability so skills can move freely across rooms, members, workflows, and future companions — while the member experiences **one Spark companion**.

---

## What a capability is

A **capability** is a reusable cognitive or relational skill Spark can apply.

It is **not**:
- A GPT
- A chat product
- A room
- A workspace panel
- A member-type silo

It **is**:
- Composable
- Context-aware
- Hidden behind the companion facade
- Reusable across Estate rooms and future surfaces

---

## Capability contract

Every capability must declare:

| Field | Meaning |
|-------|---------|
| `id` | Stable snake_case id |
| `officialName` | Member-safe label (never a GPT name) |
| `purpose` | One sentence — what this skill does |
| `coreQuestion` | The question this skill answers |
| `inputs` | What context it needs |
| `outputs` | What it produces for the companion |
| `composableWith` | Compatible capability ids |
| `roomHints` | Estate places that amplify it (optional) |
| `neverExposeAs` | Forbidden product names (GPTs, tool brands) |

---

## Master rule

**Spark composes. The member decides.**  
Capabilities suggest moves; they never force a workflow or open a separate “bot.”

---

## Anti-GPT law

1. Never route the member to a named GPT.
2. Never present a capability as a separate product.
3. Never require leaving the companion conversation to use a skill.
4. Surfaces (Create, Decision Compass, Vault) are **adapters**, not identities.

---

## Relationship to other registries

| Registry | Role |
|----------|------|
| `sparkSharedCapabilities` (this series) | Cognitive/relational skill library |
| `companionCapabilityRegistry` | App section / intervention routing |
| `estateBrain/capabilityRegistry` | Estate experience routing |
| `sparkRecognitionEngine` | Recognition lifecycle (consumes celebration/reflection) |

Shared capabilities **compose first**; other registries are optional adapters.
