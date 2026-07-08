# Estate Wander Mode Protocol

## Purpose

Casual exploration of Spark Estate™ from the Room chrome — not a replacement for conversation navigation.

## Placement

Under the current room name in `EstateRoomExperienceMenu`:

```
Butterfly House™
      Wander
```

## Behavior

1. Choose another Live manifest place (random, avoiding recent).
2. Navigate via `runDirectEstateRoomNavigation`.
3. Media from `ESTATE_PLACE_MASTER_MANIFEST.json` via existing `getPlaceMedia()`.
4. Room display updates through normal estate visit state.

## Implementation

- `lib/estate/manifest/estateWanderMode.ts` — selection + `sessionStorage` recent history
- `components/companion/estate/EstateRoomExperienceMenu.tsx` — Wander button
- `EstateTopRightChrome` / `CompanionPageClient` — `onWander` handler

## Rules

- Manifest only (`navigable` + `status: Live`)
- No hardcoded room arrays
- Recent manifest place ids avoided; history clears when pool exhausted
- No error UI when no destination — remain in current room
