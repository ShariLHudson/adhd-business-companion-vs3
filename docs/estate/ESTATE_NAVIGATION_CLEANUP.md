# Estate Navigation Cleanup

**Date:** 2026-07-09  
**Rule:** Every room has **one name · one ID · one route · one owner**.  
**Status:** Critical collisions cleaned; legacy ids remain as redirects only.

---

## Authority chain

| Layer | Owner module | Responsibility |
|-------|--------------|----------------|
| Identity | `canonicalEstateRegistry` / `canonicalEstatePlaces` | Official name + placeId |
| Redirects | `placeIdAliases` | Legacy id → canonical (never primary labels) |
| Routing | `estateRoutingRegistry` → `goToPlace` | Phrase / intent → placeId |
| Shell | `directory/shell` | placeId → AppSection |
| Mount | `estateMountRegistry` + CompanionPageClient | Which UI owns the experience |
| Canon table | `estateNavigationCanon.ts` | Audit table for critical rooms |

---

## Canonical rooms (cleaned)

| Official name | placeId | AppSection (route) | Owner | Legacy redirects |
|---------------|---------|--------------------|-------|------------------|
| Evidence Vault™ | `evidence-vault` | `evidence-bank` | collection | `evidence-bank` |
| Celebration Garden™ | `gardens` | `wins-this-week` | collection | `celebration-garden`, `wins-this-week` |
| Estate Gardens™ | `estate-gardens` | `home` | scene | — (separate from Garden) |
| Celebration Room™ | `celebration-room` | `growth-reports` | collection | `celebration-hall` |
| Hall of Accomplishments™ | `gallery-of-firsts` | `home` | presence | `hall-of-accomplishments` |
| Portfolio™ | `portfolio` | `growth-portfolio` | GrowthPortfolioPanel | `growth-portfolio` |
| Achievement Library™ | `library` | `growth-library` | collection | `achievement-library` |
| Journal Gazebo™ | `journal` | `growth-journal` | immersive | `journal-gazebo`, `growth-journal` |
| Greenhouse™ | `greenhouse` | `growth-greenhouse` | collection | `growth-greenhouse` |
| Momentum Institute™ | `momentum-institute` | `chamber-of-momentum` | workspace | study-hall, momentum-room |

---

## Collisions removed

| Problem | Fix |
|---------|-----|
| Hall → Portfolio (`growth-portfolio`) | Manifest + alias catalog → `home`; Portfolio mounts `GrowthPortfolioPanel` |
| Portfolio UI showed Achievement Library | Stop remapping `growth-portfolio` → `growth-library`; mount Portfolio panel |
| Estate Gardens ≡ Celebration Garden | Removed recognition/room equivalence; shell → `home` |
| Celebration Hall vs Celebration Room | Official name **Celebration Room™**; Hall is legacy alias only |
| Gardens name split (The Gardens / Celebration Garden) | Official **Celebration Garden™** |
| Decision engine stale ids (`pond`, `pool`, `hall-of-accomplishments`, `journal-gazebo`) | Canonical place ids |
| Guide: celebration-hall → hall-of-accomplishments | Decoupled; Hall guide tied to `gallery-of-firsts` |
| Library mount `menuActionId: portfolio` | Removed — Portfolio is its own mount |

---

## Non-equivalence (never merge)

- `gallery-of-firsts` ≠ `portfolio` / `library` / `the-gallery`
- `gardens` ≠ `estate-gardens`
- `celebration-room` ≠ `gallery-of-firsts`
- `evidence-vault` ≠ `confidence-vault`

---

## Remaining debt (not blocking)

- AppSection keys still use legacy vocabulary (`evidence-bank`, `wins-this-week`, `growth-reports`) — redirects only; rename in a later section-migration sprint.
- Collection framework keeps internal keys (`celebration-garden`, `celebration-hall`, `achievement-library`) mapped via `placeId`.
- Celebration Room guide spread still borrows Celebration Garden copy until a dedicated spread exists.
- Full retirement of `estateRoomRegistry` / `estateRoomAliasCatalog` after manifest is sole phrase source.

---

## Tests

- `lib/estate/estateNavigationCanon.test.ts`
- Updated shell expectations in `collectionShellNavigation.test.ts`
