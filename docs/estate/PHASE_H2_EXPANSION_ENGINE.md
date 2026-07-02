# Phase H.2 — Estate Expansion & Ingestion System

| Field | Value |
|-------|-------|
| **Phase** | H.2 — How Spark Estate absorbs new ideas |
| **Status** | Complete |
| **Authority** | `lib/estate/estateExpansionEngine.ts` |
| **Canon** | `docs/estate/P0_CANON_ERRATA.md` · `SPARK_ESTATE_CANONICAL_REGISTRY.md` |
| **Date** | 2026-06-30 |

---

## Goal

Spark Estate must grow **intentionally**, not reactively. Phase H.2 defines how new concepts are classified **before** they become permanent rooms, collections, or objects.

**Out of scope (honored):** adding new rooms, UI changes, routing changes, automatic registry writes.

```
New idea (name + description + intent)
        ↓
  estateExpansionEngine.ts   ← Phase H.2 (this sprint)
        ↓
  Human approval + canon doc edit (Phase A registry)
        ↓
  Runtime registry sync (only after approval)
```

---

## Problem

Without an ingestion layer:

| Drift pattern | Risk |
|---------------|------|
| "wins room", "celebration variation" | Duplicate celebration systems |
| "gallery" | Overlaps Creative Studio + Portfolio |
| "quiet thinking space" | Overlaps Reading Nook + Conservatory |
| Decorative labels | Rooms without Estate meaning |
| Reactive code additions | Registry grows faster than canon |

---

## Solution

### `evaluateEstateExpansion(input)`

**File:** `lib/estate/estateExpansionEngine.ts`

**Input**

```typescript
{
  name: string;
  description?: string;
  userIntent?: string;
}
```

**Output**

```typescript
{
  classification:
    | "Living Place"
    | "Destination"
    | "Collection"
    | "Object"
    | "Reject / Not Needed";
  suggestedCanonicalName: string;
  aliases: string[];
  reasoning: string;                    // internal
  conflictsWithExisting: string[];        // official names + ids
  mergeRecommendation?: string;
  requiresHumanApproval: boolean;
}
```

**Helpers**

- `isEstateExpansionApproved(result)` — rare auto-pass (definitive P0 merges)
- `expansionRequiresMerge(result)` — true when merge into existing canon is required

---

## Classification rules

| Class | When |
|-------|------|
| **Living Place** | Passive emotional environment; conversation-first; no ritual grid |
| **Destination** | Structured experience — rituals, learning, celebration, tools |
| **Collection** | Growing memory structure — books, logs, archives |
| **Object** | Portable Estate item — Guidebook™, Key, Bell |
| **Reject / Not Needed** | Duplicate, decorative-only, or overlaps existing canon |

---

## Merge rules (binding examples)

| Proposed concept | Engine outcome |
|------------------|----------------|
| wins room | **Reject** → Celebration Room™ + Accomplishments Book™ |
| gallery | **Reject** → Creative Studio™ or Portfolio™ |
| portfolio room | **Collection** → merge into Portfolio™ |
| guidebook room | **Object** → portable Guidebook™, not a room |
| celebration garden (new room) | **Reject** → Celebration Room™ + Gardens™ |
| my thoughts room | **Reject** → Clear My Mind™ + Journal™ |
| reading nook library | **Reject** → keep Nook and Library separate (P0 §3) |
| quiet thinking space | **Living Place** → merge with Reading Nook / Conservatory |

---

## Anti-duplication rule

Never admit without merge review:

- Multiple rooms for the **same emotional purpose**
- Multiple **celebration** systems
- Multiple **memory** systems
- Multiple **learning** systems

Purpose clusters in code: celebration · learning · memory · restorative · creative.

---

## Governance rule

**New concepts do NOT automatically become rooms.**

1. Run `evaluateEstateExpansion`
2. If `requiresHumanApproval` → founder/canon review
3. Edit `SPARK_ESTATE_CANONICAL_REGISTRY.md` (Phase A)
4. Sync `canonicalEstatePlaces.ts`
5. Only then wire routing / media / shell

Definitive P0 duplicates (e.g. wins room, guidebook room) may set `requiresHumanApproval: false`.

---

## Evaluation priority

| Step | Action |
|------|--------|
| 1 | Definitive merge rules (P0 errata + known drift) |
| 2 | Restorative / quiet-thinking merge path |
| 3 | Registry alias collision → reject duplicate |
| 4 | Purpose cluster overlap → merge recommendation |
| 5 | Novel concept → classify + **always** require approval |
| — | Decorative-only → reject |

---

## Success tests (Phase H.2)

| Input | Expected |
|-------|----------|
| `wins room` | Merge Celebration Room + Accomplishments Book |
| `gallery` | Creative Studio or Portfolio — no new room |
| `new idea: quiet thinking space` | Merge Reading Nook / Conservatory |

**Tests:** `lib/estate/estateExpansionEngine.test.ts`

---

## Relationship to Phase H.1

| Layer | Role |
|-------|------|
| `estateIntentBridge.ts` | Member language → existing places |
| `estateExpansionEngine.ts` | **New** concepts → classify before canon |
| `canonicalEstateRegistry.ts` | Runtime truth **after** approval |

H.2 does **not** wire into production ingestion UI. It is the governance gate for future expansion work.

---

## Consumer guidance

```typescript
import { evaluateEstateExpansion } from "@/lib/estate/estateExpansionEngine";

const review = evaluateEstateExpansion({
  name: "wins room",
  description: "A place to see all my wins",
  userIntent: "celebrate progress",
});

// review.mergeRecommendation → Celebration Room + Accomplishments Book
// review.requiresHumanApproval → false (P0 definitive)
```

Never expose `reasoning` to members. Use Shari language when discussing merges.

---

## Files

| File | Role |
|------|------|
| `lib/estate/estateExpansionEngine.ts` | Implementation |
| `lib/estate/estateExpansionEngine.test.ts` | Success tests |
| `docs/estate/PHASE_H2_EXPANSION_ENGINE.md` | This document |

---

*Phase H.2 — the Estate grows on purpose. Ideas pass through the gate; canon stays coherent.*
