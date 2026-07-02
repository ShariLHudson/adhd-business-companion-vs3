# Estate Arrival Experience™

Members should **feel** they walked into a room — not loaded a page.

## Sequence

1. Fade the outgoing room (veil)
2. Load the new room scene
3. Fade in room title (e.g. **Momentum Institute™**)
4. Fade in one-line motto (e.g. *"Developing Better Entrepreneurs."*)
5. Hold **2 seconds**, then title fades — room remains

## Shari

Shari **never** speaks during the arrival animation. After `ESTATE_ARRIVAL_COMPLETE`, she offers a room-aware greeting from `estateArrivalExperience.ts`.

## Ambience

Each room may start a loop from `estateRoomAmbience.ts` (respects `prefers-reduced-motion`).

## Room memory

`roomVisitMemory` on Estate Memory™ tracks:

- `lastRoomId`
- `favoriteRoomIds`
- `visitCounts`
- `lastUnfinishedActivity`

## Implementation

| Piece | Path |
|-------|------|
| Config | `lib/estate/estateArrivalExperience.ts` |
| Session events | `lib/estate/estateArrivalSession.ts` |
| Overlay UI | `components/companion/estate/EstateArrivalOverlay.tsx` |
| Host | `components/companion/estate/EstateArrivalHost.tsx` |
| CSS | `app/companion/estate-arrival.css` |
| Trigger | `recordEstateRoomTransition()` in `estateMemoryContinuity.ts` |
