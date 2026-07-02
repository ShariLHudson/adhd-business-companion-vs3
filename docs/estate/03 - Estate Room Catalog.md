# Estate Room Catalog™

| Field | Value |
|-------|-------|
| **Series** | Spark Estate Documentation · **03 of 10** |
| **Status** | **Historical reference only** — superseded by [SPARK_ESTATE_CANONICAL_REGISTRY](./SPARK_ESTATE_CANONICAL_REGISTRY.md) and [P0 Canon Errata](./P0_CANON_ERRATA.md) |
| **Code** | `lib/estate/canonicalEstateRegistry.ts` (was `estateRoomRegistry.ts`) |
| **Parent** | [02 — Master Plan](./02%20-%20Spark%20Estate%20Master%20Plan.md) |
| **Next** | [04 — Estate Objects](./04%20-%20Estate%20Objects.md) |

---

> **⚠ Historical document.** Do not use for implementation. See [SPARK_ESTATE_CANONICAL_REGISTRY](./SPARK_ESTATE_CANONICAL_REGISTRY.md) and [P0_CANON_ERRATA](./P0_CANON_ERRATA.md).

---

Each place has:

- **`roomId`** — stable key for routing  
- **Category** — `destination` · `conversation` · `living`  
- **Status** — `live` · `partial` · `planned` · `future` · `image-ready-needs-asset`  

**Rule:** Library ≠ Momentum Institute. Different stories, different destinations.

---

## Category 1 — Destination Rooms

Dedicated interactions. Scene stays hero; one object system per room.

| Trademark | `roomId` | Purpose | Status |
|-----------|----------|---------|--------|
| Momentum Institute™ | `momentum-institute` | Entrepreneur Development Center — drawer wall, Knowledge Cards™ | image-ready-needs-asset |
| Celebration Room / Gardens™ | `gardens` | Outdoor celebration and reflection | image-ready-needs-asset |
| Evidence Vault™ | `evidence-vault` | Proof of growth for harder days | image-ready-needs-asset |
| Portfolio™ | `portfolio` | Creative work and projects shown with care | image-ready-needs-asset |
| Guidebook™ | `guidebook` | Estate knowledge as a **physical book** (see Objects doc) | planned |
| My Institute Cabinet™ | `institute-cabinet` | Saved card references — not duplicate lessons | live |
| Creative Studio™ | `creative-studio` | Create workshops, content, assets (with permission) | image-ready-needs-asset |
| Decision Compass™ | `decision-compass` | Think through choices — member owns decision | live |
| Momentum Builder™ | `momentum-builder` | Coaching toward one meaningful next step | image-ready-needs-asset |
| Growth Journal™ | `journal` | Private reflection | image-ready-needs-asset |
| Seeds Planted™ | `seeds-planted` | Spark Cards™ taking root | planned |
| Goals & Projects™ | `goals-projects` | Direction without surveillance | live |

---

## Category 2 — Conversation Places

Scene + frosted chat. No feature grid on arrival.

| Trademark | `roomId` | Purpose | Status |
|-----------|----------|---------|--------|
| The Library™ / Reading Nook | `library` | Quiet reading and story — **not** the Institute | image-ready-needs-asset |
| Reading Nook (alias) | `library` | Same room — stairway nook art when wired | image-ready-needs-asset |
| Window Seat | `window-seat` | Look out, talk, rest | planned |
| Back Deck | `back-deck` | Evening air, easy conversation | planned |
| Greenhouse™ | `greenhouse` | Possibilities begin here; Kinsey asleep = safety | live |
| Garden Bench | `gardens` | Pause outdoors (path within Gardens) | partial |
| Apple Orchard™ | `apple-orchard` | Fresh ideas, patience, open air | future |
| Dock / Seat at Pond | `peaceful-places` | Water, stillness, soundscapes | image-ready-needs-asset |
| Porch Swing | `porch-swing` | Slow rhythm, unhurried talk | planned |
| The Conservatory™ | `conservatory` | Clear head — space before solutions | planned |
| Clear My Mind™ | `clear-my-mind` | Continuous capture — relief, not organize | image-ready-needs-asset |
| Coffee House™ | `coffee-house` | Warm pause, debrief | partial |
| Tea Room™ | `tea-room` | Stillness and ceremony | future |
| Music Room™ | `music-room` | Focus through music | partial |
| Peaceful Places™ | `peaceful-places` | Calm destinations — woodland, pond, etc. | image-ready-needs-asset |
| Sunroom | `sunroom` | Shari’s quiet welcome | live |
| The Stables™ | `stables` | Leadership, confidence, calm coaching | live |
| Observatory™ | `observatory` | Curated research — explore before commit | image-ready-needs-asset |
| Game Room™ | `game-room` | Playful recharge | image-ready-needs-asset |

---

## Category 3 — Living Estate

No required interaction. Atmosphere and transit.

| Place | Role | Status |
|-------|------|--------|
| Welcome Home™ / Front Entry | Threshold — arrive, continue, not dashboard | image-ready-needs-asset |
| Hallways | Silent connective tissue between rooms | planned |
| Staircase | Vertical movement — reading nook landings | partial (art) |
| Balconies | Overlook, pause, seasonal light | planned |
| Paths | Garden and orchard walkways | partial |
| Gardens (as movement) | Walking between celebration and bench | partial |
| My Estate™ (estate photo) | Personal belonging — profile overlay, not a hub | live |

---

## Profile & growth overlays (Destinations via menu)

| Trademark | `roomId` | Notes |
|-----------|----------|-------|
| Growth Profile™ | `growth-profile` | Competency earned through use — greenhouse scene |
| My Estate™ | `my-estate` | Estate photo; menu anchor |

---

## Critical distinctions (do not merge)

| Place A | Place B | Why separate |
|---------|---------|--------------|
| **Library / Reading Nook** | **Momentum Institute** | Stories vs drawer-wall learning |
| **Greenhouse** | **Growth Profile** | Talk/nurture vs capability record (may share art) |
| **Peaceful Places** | **Apple Orchard** | Soundscape hub vs orchard destination |
| **Conservatory** | **Clear My Mind** | Atmosphere vs capture workflow (may share conservatory art) |
| **Gardens** | **Celebration Room** | Path vs ritual destination (same family, different use) |

---

## Registry maintenance

1. Add a place → one row in `estateRoomRegistry.ts` + alias phrases  
2. Name category first (`destination` | `conversation` | `living`)  
3. Art path must exist in `public/backgrounds/` or `status: image-ready-needs-asset`  
4. Do not register a **feature name** without a **place name**  

---

## Related

- Objects in Destinations: [04 — Estate Objects](./04%20-%20Estate%20Objects.md)  
- Navigation phrases: `lib/estate/estateRoomAliasRegistry.ts`  
- Cleanup collisions (Library/Institute): [Estate Cleanup Roadmap](../ESTATE_CLEANUP_ROADMAP.md)
