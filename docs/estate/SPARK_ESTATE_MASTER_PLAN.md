# Spark Estate™ — Master Plan & Architecture Review

| Field | Value |
|-------|-------|
| **Status** | **Authoritative** for naming, routing, mounts, and intent (Phase 1+) |
| **Supersedes** | Ad-hoc naming in `docs/ESTATE_ROOM_REGISTRY.md` for new work |
| **Does not supersede** | Constitution · Bible · Living in Spark Estate |
| **Phase** | 1 — additive foundation (2026) |
| **Code** | `lib/estate/placeIdAliases.ts` · `estateMountRegistry.ts` · `estateMemberNeedIndex.ts` · `estateTurn.ts` |

---

## Purpose

This document is the **single architectural reference** for how Spark Estate grows:

- What to name things
- How rooms mount
- How conversation understands natural language
- What must **not** be renamed without migration
- In what order to migrate safely

**Product philosophy is unchanged:** conversation first, place second, workspace third (Spec 108). Members never need to learn official room names.

---

## Executive architecture (target state)

```
Member language
    → evaluateEstateTurn()           [Phase 1: need index]
    → resolveEstatePlace()           [Phase C: exact / object / activity / suggest]
    → goToPlace(placeId)             [Phase C: navigation law]
    → estateMountRegistry            [Phase 1: tier + component]
    → Experience (Tier A) or Collection Engine (Tier B)
```

**Three immutable truths per room:**

1. **`placeId`** — canonical, never renamed (`journal`, `greenhouse`, …)
2. **`MemberNeed`** — why the member spoke (`express`, `restore`, `prove`, …)
3. **`experienceTier`** — how it mounts (`immersive` | `collection` | `scene-only` | `transition`)

Everything else (`growth-journal`, `achievement-library`, `gazebo-journal-background.png`) is an **alias or legacy surface** with a sunset plan.

---

## What is excellent — never change

| Asset | Why |
|-------|-----|
| Conversation-first law | Competitive moat; Spec 105–108 |
| `goToPlace(placeId)` | Single navigation primitive; preserves conversation |
| `resolveEstatePlace` priority | Feelings → suggestion, never forced |
| `canonicalEstateRegistry` (42 places) | World model, not a menu |
| `estatePlaceMedia` | Asset authority keyed by placeId |
| Collection framework | Config + adapter + shared engine |
| Journal Gazebo Tier A pattern | Experience over settings |
| Frozen conversation architecture | Observe and refine, not redesign |
| Intelligence-ready object lineage | Backend compounds; surface calm |

---

## Phase 1 deliverables (implemented)

| Module | Role |
|--------|------|
| `placeIdAliases.ts` | `PLACE_ID_ALIASES` + `resolvePlaceId()` — additive legacy → canonical |
| `estateMountRegistry.ts` | `placeId` → `appSection` → `experienceTier` → `shellComponent` |
| `estateMemberNeedIndex.ts` | Need taxonomy + natural phrase rules |
| `estateTurn.ts` | `evaluateEstateTurn()` — tests + future orchestrator |
| `estateTurn.test.ts` | Phrase regression matrix |

**Not changed in Phase 1:** Companion mounts, storage keys, routes, assets, legacy registry, Journal Gazebo visuals.

---

## Naming standard (every future room)

| Layer | Convention | Example |
|-------|------------|---------|
| Public name | Title Case + ™ in copy | Journal Gazebo™ |
| **`placeId`** | `kebab-case`, **immutable** | `journal` |
| AppSection | `{placeId}` or legacy alias table | `growth-journal` → alias → `journal` |
| Background | `public/backgrounds/{placeId}-background.png` | `journal-gazebo-background.png` (target) |
| Ambience | `public/audio/{placeId}-{layer}.mp3` | `journal-gazebo-water.mp3` — see [Estate Ambient Sound System](./ESTATE_AMBIENT_SOUND_SYSTEM.md) |
| Component folder | `components/{placeId}/` | `components/journal-gazebo/` |
| Shell component | `{PascalCase}Room.tsx` | `JournalGazeboRoom.tsx` (future) |
| Lib module | `lib/{camelCase}/` | `lib/journalGazebo/` |
| CSS BEM | `.{placeId}` | `.journal-gazebo` |
| Storage | `companion-{placeId}-{purpose}-v{N}` | `companion-journal-gazebo-configs-v1` |
| Knowledge doc | `docs/estate/{placeId}.md` | `docs/estate/journal.md` |

**Rule:** Register the room once in canonical registry. Aliases live in `PLACE_ID_ALIASES` only — never fork a second placeId.

### Journal Gazebo reference implementation

| Layer | Value |
|-------|-------|
| placeId | `journal` |
| Public name | Journal Gazebo™ |
| experienceTier | `immersive` |
| shellComponent | `JournalGazeboExperience` |
| AppSection (legacy) | `growth-journal` |
| collectionRoomId | `journal` |

---

## Conversation routing standard

### The Spark Need → Place Law™

```
1. LISTEN     — conversation-only? → stay
2. EXACT      — named place / alias? → goToPlace
3. OBJECT     — "my accomplishments book" → place
4. ACTIVITY   — "clear my mind" → place + optional workspace
5. NEED       — classify → ranked places (evaluateEstateTurn)
6. SUGGEST    — max 3 places, invitation (Spec 108)
7. STAY       — uncertain → remain
```

### Need taxonomy

| Need | Member language | Primary places |
|------|-----------------|----------------|
| `express` | write, journal, get this out | `journal`, `creative-studio` |
| `reflect` | process, think through | `journal`, `clear-my-mind` |
| `restore` | peaceful, quiet, calm, overwhelmed | `greenhouse`, `seat-at-pond`, `tea-room` |
| `celebrate` | finished, proud, shipped | `celebration-room`, `gardens`, `library` |
| `prove` | evidence, proof, hard things | `evidence-vault`, `library` |
| `capture` | don't forget, save this | `journal`, `evidence-vault` |
| `learn` | course, teach me | `momentum-institute`, `library` |
| `create` | make something, plant an idea | `creative-studio`, `greenhouse` |
| `plan` | priorities, plan my day | `observatory`, `momentum-builder` |
| `play` | swim, games, recharge | `game-room` (pool interim) |

### Mode rules

| Mode | When | Auto-nav? |
|------|------|-----------|
| `none` | No match / conversation-only | No |
| `suggest` | Feeling / ambiguous need | No — menu ≤3 |
| `invite` | Clear need, Tier A/B room | No — Spark invites |
| `go` | Explicit place / activity | Yes (via `goToPlace`) |

### Phrase matrix (Phase 1 tests)

| Phrase | need | mode | primary place |
|--------|------|------|----------------|
| I want to write | express | invite | journal |
| I need somewhere peaceful | restore | suggest | greenhouse, seat-at-pond, tea-room |
| Let's go swimming | play | invite | game-room (interim) |
| I finished my course | celebrate | invite | celebration-room |
| I don't want to forget today | capture | suggest | journal, evidence-vault |
| I need proof I can do hard things | prove | invite | evidence-vault |

**Add one row to `estateTurn.test.ts` before shipping any new room.**

---

## Registry standard

### One registry, three views

| View | Source | Purpose |
|------|--------|---------|
| **Canon** | `canonicalEstatePlaces.ts` + Constitution | Place identity, feelings, aliases |
| **Mount** | `estateMountRegistry.ts` | UI tier + component |
| **Intent** | `estateMemberNeedIndex.ts` | Need → phrase → place |

Legacy `estateRoomRegistry.ts` remains read-only adapter until codegen replaces manual edits.

### Required fields when adding a place

- `id` (placeId), `officialName`, `category`, `primaryFeeling`
- `aliases[]` (colloquial + legacy)
- `backgroundImage`, `status`
- Row in `estateMountRegistry`
- Phrase rules in `estateMemberNeedIndex` (if member-addressable)
- `goToPlace.test.ts` + `estateTurn.test.ts` entries

---

## Folder / component standard

### Experience tiers

| Tier | When | Pattern |
|------|------|---------|
| **A — immersive** | Flagship hospitality | `components/{placeId}/` + ceremony |
| **B — collection** | Browse / capture / save | `EstateCollectionRoomEngine` |
| **C — scene-only** | Atmosphere while chatting | Full-bleed + conversation |
| **D — transition** | Hallways, map | No persistent objects |

**Journal Gazebo™** is the reference Tier A room.

---

## PLACE_ID_ALIASES (additive only)

Location: `lib/estate/placeIdAliases.ts`

- Maps `growth-journal` → `journal`, `evidence-bank` → `evidence-vault`, etc.
- **Never delete** keys without a sunset period and storage migration.
- `resolvePlaceId()` chains safely (max 8 hops).
- `resolveCanonicalPlaceId()` delegates here.

---

## Migration priorities

### Critical (before next flagship room)

| # | Item |
|---|------|
| C1 | This document as naming/routing authority |
| C2 | Wire `evaluateEstateTurn` per [ESTATE_TURN_ORCHESTRATION_PLAN.md](./ESTATE_TURN_ORCHESTRATION_PLAN.md) — shadow → task lock → handoff |
| C3 | Extract Companion mounts → read `estateMountRegistry` |
| C4 | Intent phrase regression suite in CI |

### High (4–8 weeks)

| # | Item |
|---|------|
| H1 | Intelligence `entryId` → `placeId` alignment |
| H2 | Background filename fallbacks (`gazebo-journal-*` → `journal-gazebo-*`) |
| H3 | `experienceTier` on all canonical places |
| H4 | Retire duplicate regex in `estateRoomRouting.ts` |
| H5 | Fix mount path parity in CompanionPageClient |

### Medium (2–3 months)

| # | Item |
|---|------|
| M1 | Codegen legacy registry from canonical |
| M2 | Unified collection storage + migration readers |
| M3 | `goToPlace` as sole navigation entry |
| M4 | Register `swimming-pool` canonical place |

### Low

| # | Item |
|---|------|
| L1 | AppSection rename `growth-journal` → `journal-gazebo` |
| L2 | Delete legacy registry |
| L3 | Semantic intent assist (optional V2) |

---

## Safest migration order

```
Phase 0 — Document (this file)
Phase 1 — Additive modules (DONE)
Phase 2 — Orchestrator wires evaluateEstateTurn; legacy matchers delegate
Phase 3 — Companion reads estateMountRegistry
Phase 4 — Assets + docs align to placeId
Phase 5 — Storage migrations (one key per PR)
Phase 6 — Remove legacy aliases (telemetry-confirmed)
```

**PR rule:** one layer per PR — never route + storage + asset in one merge.

---

## Testing strategy

```bash
npx vitest run lib/estate/estateTurn.test.ts
npx vitest run lib/estate/goToPlace.test.ts
npx vitest run lib/estate/collectionFramework/registry.test.ts
```

Manual: Journal Gazebo first visit → gift → write (experience regression).

---

## Cursor automation policy

| Safe for Cursor | Manual approval required |
|-----------------|--------------------------|
| Internal imports, phrase rules, mount rows | Public names, trademarks |
| Additive aliases | Storage key renames |
| Test fixtures | AppSection renames |
| Extract mount table | Asset deletes |

---

## Related documents

- [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md) — place canon (markdown)
- [PHASE_C_GOTOPLACE_REPORT.md](./PHASE_C_GOTOPLACE_REPORT.md) — navigation primitive
- [PHASE_B_RUNTIME_REGISTRY_REPORT.md](./PHASE_B_RUNTIME_REGISTRY_REPORT.md) — 42 vs 27 inventory
- [ESTATE_COLLECTIONS_PLAYBOOK.md](./ESTATE_COLLECTIONS_PLAYBOOK.md) — collection rooms

**Deprecated for new work:** `docs/ESTATE_ROOM_REGISTRY.md` (legacy 25-room catalog).

---

*Spark is not building navigation. Spark is building understanding — then hospitality.*
