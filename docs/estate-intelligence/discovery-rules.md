# Discovery Rules™

**How Discovery Key™ reads the Estate Intelligence System**

| | |
|---|---|
| **Status** | Foundational — rules active; library not populated |
| **Constitution** | [Discovery Key Constitution](./discovery-key/DiscoveryKey-Constitution.md) |
| **Library** | [discovery-library.json](./discovery-library.json) |

---

## Core rule

The Discovery Key™ never invents estate knowledge. It reads **Estate Intelligence registries** and presents **Discovery Notes** from `discovery-library.json` that reference real items.

---

## Status gate

| Status | Discovery Key behavior |
|--------|------------------------|
| **Live** | May appear in normal rotation |
| **Draft** | Internal only — never member-facing |
| **Future** | Never presented as available |
| **Hidden** | Special cases only — not default rotation |
| **Retired** | Never recommended |

**Truth principle:** A Discovery Note must not claim a feature exists unless the target registry item is **Live**.  
See [Discovery Key Constitution — Truth Principle](./discovery-key/DiscoveryKey-Constitution.md#truth-principle).

---

## Registry lookup order

When building or validating a Discovery Note:

1. Resolve `targetRegistry` + `targetId` in the appropriate JSON file
2. Confirm `status === "Live"`
3. Use `officialName` from [estate-vocabulary.md](./estate-vocabulary.md) — no invented synonyms
4. Resolve `navigationDestination` from `estate-routes.json` when a primary action is offered
5. Attach optional `foodForThought` — never require a response

---

## Discovery types

| Type | Registry source | Example |
|------|-----------------|---------|
| **Estate Discovery** | `estate-rooms.json` | Introduce a place |
| **Feature Discovery** | `estate-features.json` | Explain a capability |
| **Estate Story** | `estate-rooms.json` or narrative field | History and meaning |
| **Hidden Treasure** | Any registry | Seasonal or delightful |
| **Positive Personal Discovery** | Judgment layer + Live target | Encouraging pattern — optional |
| **New Possibility** | Live feature or room | Gentle suggestion |

---

## Navigation

If a Discovery Note mentions a room, tool, feature, setting, or activity:

- Include a clear **primary action** (`buttonText` / `primaryActionButtonText`)
- Navigate directly to `navigationDestination`
- Member must not search for something the Key just mentioned

Allowed button examples: Take Me There · Show Me How · Try It Now · Open This Room · Save for Later

---

## Visual placement

- Only **one** Discovery Key visible at a time
- Placement metadata lives in [room-placement-library.json](./room-placement-library.json)
- Key must feel part of the scene — not a floating app icon

---

## Personal discovery guardrails

Positive personal discoveries must be:

- Gentle and optional
- Never labeling or diagnostic
- Invitation to reflection — not homework

Banned patterns: procrastination labels · distraction accusations · "you failed to…"

Full guardrails: [Discovery Key Constitution](./discovery-key/DiscoveryKey-Constitution.md#personal-discovery-guardrails).

---

## Population policy

`discovery-library.json` remains **empty** until registry items are populated with Live entries. Do not seed discoveries that reference undefined targets.

---

## Consumers

| System | Reads |
|--------|-------|
| Discovery Key UI | `discovery-library.json` + placement library |
| Spark Companion | All registries for answers about the Estate |
| Momentum | `estate-features.json` · `estate-routes.json` |
| Onboarding | `estate-rooms.json` · vocabulary |
| Navigation | `estate-routes.json` |

All consumers obey the [Source of truth rule](./README.md#source-of-truth-rule).
