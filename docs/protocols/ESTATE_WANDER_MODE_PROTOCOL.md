# Estate Wander Mode Protocol

## Purpose

Casual exploration of Spark Estate™ from the Room chrome — not a replacement for conversation navigation.

## Placement

Inside the Room button dropdown under **Estate navigation** (not a separate top-bar button).

```
[ Garden Estate ▼ ]
  Experience controls
  …
  Estate navigation
    Back to Estate
    Wander
```

## Behavior

1. Choose another Live manifest place (random, avoiding recent).
2. Navigate via `runDirectEstateRoomNavigation`.
3. Media from `ESTATE_PLACE_MASTER_MANIFEST.json` via existing `getPlaceMedia()`.
4. Room display updates through normal estate visit state.

## Implementation

- `lib/estate/manifest/estateWanderMode.ts` — selection + `sessionStorage` recent history + `validateWanderPick`
- `components/companion/estate/EstateRoomExperienceMenu.tsx` — Room dropdown (experience + estate navigation)
- `EstateTopRightChrome` / `CompanionPageClient` — `onWander` handler

@see [ESTATE_ROOM_BUTTON_AND_WANDER_NAVIGATION_SPECIFICATION.md](ESTATE_ROOM_BUTTON_AND_WANDER_NAVIGATION_SPECIFICATION.md)

## Rules

- Manifest only (`navigable` + `status: Live`)
- No hardcoded room arrays
- Recent manifest place ids avoided; history clears when pool exhausted
- No error UI when no destination — remain in current room
