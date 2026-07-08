# Estate Manifest Runtime Dependency Report

**Phase 1 audit** — consumers of scattered Estate navigation / media sources before manifest runtime integration.

**Manifest source of truth:** `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json`  
**Runtime reader:** `lib/estate/manifest/estatePlaceMasterManifest.ts`

Generated: 2026-07-08

---

## Executive summary

Estate place identity, aliases, backgrounds, and routing were spread across **6+ layers**. Phase 2–7 wire the manifest reader as the **first** resolver for aliases, intent tags, ambiguity menus, and primary media — with legacy adapters retained until verified.

---

## Primary legacy sources (do not delete yet)

| File | Responsibility | Manifest replacement |
|------|----------------|----------------------|
| `lib/estate/canonicalEstatePlaces.ts` | Canonical place records, aliases, feelings | `getPlaceById()`, manifest `places[]` |
| `lib/estate/canonicalEstateRegistry.ts` | Registry API, integrity checks | Still used for subspaces/objects; places sync from manifest over time |
| `lib/estate/estateRoomAliasCatalog.ts` | Member-facing alias catalog | `findPlaceByAlias()`, manifest `aliases[]` |
| `lib/estate/estateRoomAliasRegistry.ts` | Exact/bounded alias resolution | Manifest-first in `resolveEstateRoomAliasExact/Bounded` |
| `lib/estate/estatePlaceMedia.ts` | Background + ambience maps | `getPlaceMedia()` → `primary_image`, `video` |
| `lib/estate/estateRoutingRegistry.ts` | Ambiguity groups, routing decisions | `getNavigationOptions()`, `resolveManifestNavigation()` |
| `lib/estate/placeIdAliases.ts` | Legacy id redirects | `removed_places[]`, `merged_into_place_id` |

---

## Routing & navigation consumers

| File | Uses |
|------|------|
| `lib/estate/resolveEstatePlace.ts` | `resolveEstateRoutingDecision`, canonical registry, KB bridge |
| `lib/estate/estatePlaceNavigation.ts` | Alias registry, clusters, `resolveEstatePlace` |
| `lib/estate/goToPlace.ts` | Canonical place → visit command |
| `lib/estate/estateDestinationResolver.ts` | Clusters + alias hints |
| `lib/estate/estatePlaceClusters.ts` | Feeling/vague routing (not replaced by manifest) |
| `lib/estate/estateDirectRoomResolve.ts` | Direct section overrides |
| `lib/estate/estateRoomRouting.ts` | Section routing |
| `lib/estate/estateTurn.ts` | Turn orchestration |
| `lib/estate/estateChatNavigation.ts` | Chat PATH B |
| `lib/estate/directory/shell.ts` | Directory shell, section overrides |
| `lib/estateNavigationIntelligence/bridge.ts` | KB `estate-aliases.json` bridge |
| `lib/intentRoutingIntelligence.ts` | Cross-intent routing |
| `lib/frictionlessActionLayer.ts` | Quick actions |

---

## Media & assets consumers

| File | Uses |
|------|------|
| `lib/estate/directory/media.ts` | `resolveCanonicalPlaceBackground` |
| `lib/estate/estateRoomAssets.ts` | Room background by id |
| `lib/estate/estateArrivalExperience.ts` | Arrival plates |
| `lib/estate/estatePlaceSceneViews.ts` | Scene view backgrounds |
| `lib/oceanConservatory/media.ts` | Hardcoded aquarium video (homestead overlap) |
| `lib/companionHomestead/homesteadRoomRegistry.ts` | Homestead sunroom video |
| `data/estateGuideSpreads/*.ts` | Guide spread images per place |

---

## Knowledge base & docs (reference, not runtime primary)

| Path | Role |
|------|------|
| `docs/estate-knowledge-base/estate-aliases.json` | KB alias compile input |
| `docs/estate-knowledge-base/estate-locations.json` | Location metadata |
| `docs/estate-knowledge-base/estate-assets.json` | Asset ownership audit |
| `docs/estate/ESTATE_ROOM_REGISTRY.json` | Generator input for manifest |
| `scripts/generate-estate-place-master-manifest.mjs` | Manifest generator |

---

## Navigation flow (after integration)

```
User language
    ↓
strip navigation verbs
    ↓
Ambiguity groups (getNavigationOptions) — never guess
    ↓
Manifest alias match (findPlaceByAlias)
    ↓
Manifest intent tags (findPlacesByIntent)
    ↓
Legacy alias registry (fallback)
    ↓
Canonical registry / KB bridge
    ↓
Legacy place id → route / goToPlace
```

Media:

```
place id → getPlaceMedia() → primary_image / video from manifest
         → legacy CANONICAL_PLACE_BACKGROUNDS fallback (ambience unchanged)
```

---

## Wired in this pass

- `lib/estate/manifest/estatePlaceMasterManifest.ts` — reader API
- `lib/estate/manifest/manifestNavigationGroups.ts` — ambiguity groups
- `lib/estate/estateRoomAliasRegistry.ts` — manifest-first alias resolution
- `lib/estate/estatePlaceMedia.ts` — manifest-first backgrounds + video
- `lib/estate/estateRoutingRegistry.ts` — manifest navigation + ambiguity
- `lib/estate/manifest/estateManifestNavigation.test.ts` — protocol regression tests

---

## Remaining migration (post-verify)

1. Subspaces/objects (`canonicalEstateSubplaces.ts`) → extend manifest or linked manifest file
2. `house-possibility-*` treehouse places → add to manifest `places[]`
3. KB bridge → read manifest instead of `estate-aliases.json`
4. Remove `CANONICAL_PLACE_BACKGROUNDS` duplicate entries once disk assets match manifest filenames
5. Homestead / oceanConservatory hardcoded videos → `getPlaceMedia()`

---

## Regression test matrix (Phase 6)

| Phrase | Expected |
|--------|----------|
| `take me to butterflies` | Butterfly House™ (`butterfly-house`) |
| `take me to aquarium` | Aquarium Room™ (`conservatory`) |
| `take me to the fish` | Aquarium Room™ |
| `take me to personal library` | Personal Library™ |
| `take me to observatory` | Choice list (≥2 observatory-related places) |

Run: `npx vitest run lib/estate/manifest/estateManifestNavigation.test.ts`
