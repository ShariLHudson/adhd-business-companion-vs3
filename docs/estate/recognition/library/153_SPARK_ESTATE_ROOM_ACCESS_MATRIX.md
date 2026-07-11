# 153_SPARK_ESTATE_ROOM_ACCESS_MATRIX

# Spark Estate™
## Room Access Matrix

**Status:** Filled from live companion-app audit (2026-07-09)  
**Mode:** Documentation / architecture — no feature work in this pass  
**Related:** [VAULT_HALL_NAVIGATION_AUDIT.md](../../VAULT_HALL_NAVIGATION_AUDIT.md) · [152_WANDER_ROOM_NAME_AND_ROUTE_FIX.md](./152_WANDER_ROOM_NAME_AND_ROUTE_FIX.md) · [151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md)

---

## Purpose

Define every approved way a member can discover, enter, and return to every Spark Estate™ room.

Every room should have a clear, intentional access strategy.  
No room should be hidden or require developer knowledge to reach.

This document records **current reality** (what works today), not the target state. Gaps are marked so Estate Directory / access work can close them deliberately.

---

## Legend

| Mark | Meaning |
|------|---------|
| **Y** | Works today for a typical member |
| **P** | Partial — works in some paths, mislabeled, or weak discovery |
| **N** | Does not work / not built / not discoverable |

---

## Access Methods

| Method | Description | Current platform status |
|--------|-------------|-------------------------|
| Wander | Browse visually through estate locations | Live+navigable only (`getWanderableManifestPlaces`) |
| Welcome Home | Direct access from Welcome Home experience | Signposts / Grow hub — not a full room directory |
| Chat Suggestion | Spark recommends the room naturally | Recognition, estate intelligence, collection offers |
| Direct Command | Member says "Take me to…" | Manifest aliases + `evaluateEstatePlaceTurn` |
| Search | Search by room name or purpose | How Do I / help — incomplete room coverage |
| Estate Map | Interactive estate map | **Prototype only** (`/estate-map-prototype`) — not in `/companion` |
| Menu | Navigation menu | Profile menu = Conversations / Settings / Profile / Logout only |
| Auto Route | Spark routes from intent without naming the room | Recognition, create, capture flows |
| Related Room | Enter from another room | Invitation catalog / related_places (uneven) |
| Favorites | Member bookmarks room | API exists; **no member UI** |
| Recent Rooms | Recently visited list | Wander sessionStorage only; **no list UI** |

---

## Room Matrix (current)

| Room | Wander | Welcome | Chat | Direct | Search | Map | Menu | Auto | Related | Favorites | Recent |
|------|:------:|:-------:|:----:|:------:|:------:|:---:|:----:|:----:|:-------:|:---------:|:------:|
| Evidence Vault™ | N | P | Y | Y | P | N | N | Y | P | N | P |
| Hall of Accomplishments™ | Y | P | P | P | P | N | N | P | Y | N | P |
| Celebration Garden™ | Y | P | Y | Y | P | N | N | Y | Y | N | P |
| Celebration Hall | Y | N | Y | Y | P | N | N | Y | N | N | P |
| Legacy Studio™ | N | N | Y | N | N | N | N | Y | P | N | P |
| Chamber of Momentum™ | Y | P | Y | Y | P | N | N | P | Y | N | P |
| Creative Studio | Y | P | Y | Y | Y | N | P | Y | Y | N | P |
| Estate Library | Y | P | Y | P | P | N | N | P | Y | N | P |
| Journal Gazebo | Y | Y | Y | Y | Y | N | N | Y | Y | N | P |
| Discovery Room | Y | N | P | Y | P | N | N | N | N | N | P |
| Writing Room | Y | N | N | P | N | N | N | N | N | N | P |

---

## Place identity (for implementers)

| Room | Place id | Section / shell | Manifest status |
|------|----------|-----------------|-----------------|
| Evidence Vault™ | `evidence-vault` | `evidence-bank` | **Draft** (blocks Wander) |
| Hall of Accomplishments™ | `portfolio` | `growth-portfolio` | Live (panel title still Portfolio™) |
| Celebration Garden™ | `gardens` | `wins-this-week` | Live |
| Celebration Hall | `celebration-room` | `growth-reports` | Live |
| Legacy Studio™ | `legacy-studio` | recognition / `home` | Not a full Live wander place |
| Chamber of Momentum™ | `momentum-institute` | `chamber-of-momentum` | Live |
| Creative Studio | `creative-studio` | `content-generator` | Live |
| Estate Library | `library` | `growth-library` | Live |
| Journal Gazebo | `journal` | `growth-journal` | Live |
| Discovery Room | `discovery-room` | `home` (scene-heavy) | Live |
| Writing Room | `writing-room` | `home` | Live (alias collision with Decision Compass) |

---

## Audit Questions (per room)

| Room | First-time findable? | Spark recommend? | Direct command? | Search finds? | Visible nav path? | Easy return? | Already-here OK? |
|------|:--------------------:|:----------------:|:---------------:|:-------------:|:-----------------:|:------------:|:----------------:|
| Evidence Vault™ | N | Y | Y | P | P | Y | Y |
| Hall of Accomplishments™ | P | P | P | P | P | Y | Y |
| Celebration Garden™ | P | Y | Y | P | P | Y | Y |
| Celebration Hall | N | Y | Y | P | N | Y | Y |
| Legacy Studio™ | N | Y | N | N | N | P | P |
| Chamber of Momentum™ | P | Y | Y | P | P | Y | Y |
| Creative Studio | P | Y | Y | Y | P | Y | Y |
| Estate Library | P | Y | P | P | P | Y | Y |
| Journal Gazebo | **Y** | Y | Y | Y | **Y** | Y | Y |
| Discovery Room | N | P | Y | P | N | Y | P |
| Writing Room | N | N | P | N | N | Y | P |

### Notes on audit columns

- **First-time findable:** Can a new member discover it without knowing the name? Only Journal Gazebo clearly passes via Grow / Reflect hub.
- **Easy return:** Growth back labels, Wander “another room,” invitation closers — generally yes when already in a room shell.
- **Already-here:** Gated by `visual_room` (`canClaimAlreadyHere`). Works when place arrival syncs visual; weaker for scene-only / home-section rooms.

---

## Gap summary (why the matrix fails success criteria)

| Gap | Impact |
|-----|--------|
| Evidence Vault **Draft** | No Wander; first-time discovery fails |
| No production **Estate Map** | Map column all N |
| Profile **Menu** hides room actions | Menu column almost all N |
| **Favorites / Recent** have no UI | Columns N / P only |
| Hall panel still titled **Portfolio™** | Direct/chat/search feel inconsistent |
| Writing Room ↔ Decision Compass alias collision | Direct command unreliable |
| Legacy Studio recognition-only | No Wander / Direct / Search |
| Celebration Hall & Discovery Room | Live + Wander but weak Welcome / Menu / Related |

---

## Success Criteria (target — not yet met)

Every major room should support at least:

- Direct Command — **mostly Y; Legacy Studio N; Writing Room P; Hall P**
- Chat Suggestion — **mostly Y; Writing Room N; Hall/Discovery P**
- Search — **mostly P; Legacy / Writing N**
- Wander or Estate Map — **Wander Y for most Live rooms; Vault N; Map N for all**
- Easy Return — **mostly Y**

**No room should exist without a discoverable path** — currently violated for Evidence Vault (first-time), Legacy Studio, Writing Room, Celebration Hall, Discovery Room.

---

## Recommended access strategy (aligns with Vault/Hall audit)

**One Estate Directory** as the intentional Menu / Welcome path for every major room:

1. Archives: Evidence Vault™ · Hall of Accomplishments™ · Celebration Garden™ · Celebration Hall · Legacy Studio™  
2. Create & Reflect: Journal Gazebo · Estate Library · Creative Studio · Writing Room · Discovery Room  
3. Focus: Chamber of Momentum™  

Then: make Evidence Vault **Live** when ready for Wander; unify aliases; match panel titles to official names; ship Favorites / Recent only after Directory exists.

**Do not implement until this matrix is accepted as the access contract.**

---

## Key files

| Concern | Path |
|---------|------|
| Manifest / Wander gate | `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json`, `lib/estate/manifest/estateWanderMode.ts` |
| Direct command | `lib/estate/estatePlaceNavigation.ts`, `lib/estate/estateRoomAliasRegistry.ts` |
| Visible menu | `lib/estateMenu/menuConfig.ts` |
| Recognition auto-route | `lib/sparkRecognitionEngine/routing.ts` |
| Already-here | `lib/estate/roomAwareness/` |
| Map prototype | `components/prototype/estateMap/`, `next.config.ts` redirects |
| Prior audit | `docs/estate/VAULT_HALL_NAVIGATION_AUDIT.md` |
