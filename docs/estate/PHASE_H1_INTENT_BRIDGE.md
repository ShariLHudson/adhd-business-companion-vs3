# Phase H.1 — Estate Intent Bridge

| Field | Value |
|-------|-------|
| **Phase** | H.1 — Natural language → Estate place understanding |
| **Status** | Complete |
| **Authority** | `lib/estate/estateIntentBridge.ts` |
| **Registry** | `lib/estate/canonicalEstateRegistry.ts` (places only) |
| **Date** | 2026-06-30 |

---

## Goal

Spark Estate must understand **how people actually speak** — not only exact place IDs and registry aliases.

Phase H.1 adds an **understanding layer** between member language and canonical places. It does **not** navigate, change UI, or replace `goToPlace`.

```
Member language + emotional intent
        ↓
  estateIntentBridge.ts   ← Phase H.1 (this sprint)
        ↓
  Consumers (future): resolveEstatePlace, conversation, Shari copy
        ↓
  goToPlace (only when confidence ≥ 0.7 and member intent warrants move)
```

**Out of scope (honored):** new features, UI changes, routing changes, new places outside the canonical registry.

---

## Problem

Before H.1, resolution leaned on:

- Exact canonical place IDs
- Registry aliases
- Direct `goToPlace` calls

Failures members feel:

| Member says | Gap |
|-------------|-----|
| "I need somewhere quiet" | No emotional → place bridge |
| "take me somewhere peaceful" | Ambiguous without tone mapping |
| "I'm overwhelmed" | No confident restorative mapping |
| "the plant place" | Partial alias mismatch |

---

## Solution

### `resolveEstateIntent(input)`

**File:** `lib/estate/estateIntentBridge.ts`

**Input**

```typescript
{
  text: string;
  currentPlaceId?: string | null; // preserve stay-here when no move intent
}
```

**Output**

```typescript
{
  primaryPlaceId: string | null;   // set only when confidence ≥ 0.7
  suggestedPlaceIds: string[];     // max 3, canonical ids only
  confidence: number;              // 0–1
  reasoning: string;               // internal — not member-facing
}
```

**Helpers**

- `ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE` — `0.7`
- `mayAutoRouteFromEstateIntent(result)` — gate for consumers before `goToPlace`

---

## Priority order

| Priority | Source | Auto-route? |
|----------|--------|-------------|
| 1 | Exact canonical match (registry id / full alias) | Yes when confidence ≥ 0.7 |
| 2 | Alias substring in utterance (registry) | Yes when confidence ≥ 0.7 |
| 3 | Descriptive phrase lexicon ("plant place", "book corner") | Yes when confidence ≥ 0.7 |
| 4 | Activity intent ("want to learn", "want to celebrate") | Usually suggest; celebrate may reach 0.72 |
| 5 | Emotional intent (overwhelmed, stressed, curious…) | **Suggest only** — confidence capped below 0.7 |
| 6 | Uncertain / no match | **Never silent** — gentle orientation suggestions |

---

## Emotional mapping (canon)

| Signal | Suggested places (up to 3) |
|--------|----------------------------|
| overwhelmed | Reading Nook, Conservatory, Back Deck |
| stressed | Greenhouse, Garden Path, Reading Nook |
| curious | Momentum Institute, Observatory |
| celebratory | Celebration Room, Accomplishments Book, Gardens |
| reflective | Reading Nook, Apple Orchard, Journal |
| creative | Creative Studio, Portfolio |
| rest | Back Deck, Reading Nook, Porch Swing |
| quiet | Reading Nook, Conservatory, Peaceful Places |

---

## Rules (binding)

1. **Never force** a destination when `confidence < 0.7`
2. **Always allow stay here** — emotional matches return `primaryPlaceId: null`
3. **Never override** current place unless member language requests a move
4. **Never invent** places — every id must exist in `canonicalEstateRegistry`
5. **Not a chatbot classifier** — this is Estate understanding, not a generic NLU tool
6. **Never fail silently** — uncertain utterances still return 1–3 gentle suggestions

---

## Success tests (Phase H.1)

| Utterance | Expected behavior |
|-----------|-------------------|
| "I need somewhere quiet" | Suggest quiet places; no auto-route |
| "I feel overwhelmed" | Suggest Reading Nook, Conservatory, Back Deck |
| "I want to think" | Suggest thinking places; no auto-route |
| "take me to the plant place" | Primary `greenhouse`; confidence ≥ 0.7 |
| "I want to celebrate something" | Celebration Room first in suggestions |
| "I don't know where to go" | Orientation suggestions; reasoning explains uncertainty |

**Tests:** `lib/estate/estateIntentBridge.test.ts`

---

## Relationship to Phase C

| Layer | Role |
|-------|------|
| `estateIntentBridge.ts` | **Understanding** — intent, emotion, descriptive language |
| `resolveEstatePlace.ts` | **Resolution policy** — navigation vs suggestion (unchanged in H.1) |
| `goToPlace.ts` | **Navigation primitive** — place change only |

H.1 does **not** wire the bridge into `resolveEstatePlace` yet. That integration is a future phase when observation validates mappings.

---

## Consumer guidance

```typescript
import {
  resolveEstateIntent,
  mayAutoRouteFromEstateIntent,
} from "@/lib/estate/estateIntentBridge";

const intent = resolveEstateIntent({
  text: memberMessage,
  currentPlaceId: currentCanonicalPlaceId,
});

if (mayAutoRouteFromEstateIntent(intent)) {
  // Consumer may call goToPlace(intent.primaryPlaceId) — with conversation permission
} else if (intent.suggestedPlaceIds.length) {
  // Offer 1–3 places gently; staying is always valid
}
```

Member-facing copy must pass the Shari test — never expose `reasoning` or sound like software.

---

## Files

| File | Role |
|------|------|
| `lib/estate/estateIntentBridge.ts` | Implementation |
| `lib/estate/estateIntentBridge.test.ts` | Success tests |
| `docs/estate/PHASE_H1_INTENT_BRIDGE.md` | This document |

---

*Phase H.1 — understanding only. The Estate learns how members speak before it moves them.*
