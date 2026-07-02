# Estate Presence™

The Spark Estate™ should feel **alive** — like a beautiful country estate, not a static background or a game.

## Principles

Movement is **slow**, **subtle**, **realistic** — never distracting, never cartoonish.

## Environmental layers

`EstatePresence` renders decorative CSS layers above the room plate and below UI:

| Layer | Example rooms |
|-------|----------------|
| `steam` | Coffee House™ |
| `leaves` / `wind-sway` | Conservatory™, Apple Orchard™, Peaceful Places™ |
| `water-ripple` | Conservatory™ |
| `dust` | Momentum Institute™, Creative Studio™ |
| `lantern` / `candle` / `fireplace` | Stables™, Coffee House™ (via Estate Light Flicker™) |
| `horse-calm` | Stables™ |
| `bird-pass` | Conservatory™, Orchard (rare, slow) |
| `apple-fall` | Apple Orchard™ (very rare) |
| `cloud-drift` / `star-twinkle` | Observatory™ |
| `compass-glow` | Decision Compass™ |
| `page-turn` / `drawer-settle` | Institute, Journal |

## Ambience

- Unique loop per room (`estateArrivalExperience.ts`)
- **Crossfade** between rooms (`estateRoomAmbience.ts` dual-slot)
- **Remembered volume** — `getEstateAmbienceVolume()` / `setEstateAmbienceVolume()`

## Performance

- `animation-play-state: paused` when tab hidden (`data-paused`)
- Hidden entirely when `prefers-reduced-motion: reduce`
- `pointer-events: none` — never blocks interaction

## Implementation

| Piece | Path |
|-------|------|
| Registry | `lib/estate/estatePresence/registry.ts` |
| Component | `components/companion/estate/EstatePresence.tsx` |
| CSS | `app/companion/estate-presence.css` |
| Global host | `CompanionPageClient` (immersive sections) |
| Room shells | Stables™, Momentum Institute™ |

## Success

Members notice new details over weeks. The Estate rewards quiet observation without demanding attention.
