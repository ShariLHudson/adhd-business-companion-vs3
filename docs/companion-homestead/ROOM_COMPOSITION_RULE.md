# Room Composition Rule™
## Design Around The Conversation

**Version:** 1.0  
**Status:** Constitutional — every room, every workspace  
**Code:** `lib/roomCompositionRule/`  
**Sibling:** [COMPANION_WORKSPACE_STANDARD.md](./COMPANION_WORKSPACE_STANDARD.md) · Scene Render Contract™ (`lib/sceneRenderContract/`)

---

## Core Principle

> Design the room for the space that remains visible.  
> Not the space that will be covered.

The Homestead is not wallpaper. It is a **living frame** around the guest's work.

---

## Protected Conversation Zone™

The center is reserved for:

- Conversation · Documents · Brainstorming · Planning · Email  
- Clear My Mind™ · SOPs · Marketing · Any future workspace

**Never place here:** fireplace, aquarium, open window, Shari, hero artwork, primary Signature Objects™, seasonal heroes, motion behind text.

Enforced: `CENTER_FORBIDDEN_ELEMENTS` in `lib/roomCompositionRule/rules.ts`

---

## Living Frame™

Life happens at the **edges**. The guest is surrounded while remaining focused.

| Edge | Environmental life |
|------|-------------------|
| Left | Bookshelves, plants, aquarium, lamps, artwork |
| Right | Windows, curtains, garden, chair, mug, Kinsey |
| Top | Branches, sky, light, rain, birds, seasonal decor |
| Bottom | Rugs, furniture, blankets, dog bed, baskets |

---

## Signature Features™ (must stay visible)

| Room | Signature | Zone |
|------|-----------|------|
| Living Room™ | Open summer window | Right |
| Window Seat™ | Iowa landscape | Right |
| Planning Table™ | Handcrafted desk | Bottom |
| Reading Nook™ | Saltwater aquarium | Left |
| Creative Studio™ | Craft table | Bottom |

Catalog: `ROOM_COMPOSITION_CATALOG` in `roomCatalog.ts`

---

## Movement & Shari

- Motion: curtains, branches, birds, bubbles, candle, steam, leaves — **edges only**
- Shari: chair, window, side table — **never competing with center**

`validateEnvironmentalPlacement()` · `validateShariPlacement()`

---

## Workspace Rule

As work begins:

- Room becomes **more visible at edges**
- Panel: subtle transparency, soft blur (`--scene-panel-frosted-opacity`)
- Environment **frames** work — it never disappears

---

## Mobile

Protected zone **expands** (`--room-protected-zone-expand: 0.88`).  
Storytelling concentrates in **upper/lower corners** and edge strips.

---

## Integration

| Layer | Role |
|-------|------|
| `evaluateRoomComposition()` | Room law for place/workspace |
| `sceneLayoutEngine.ts` | Merges composition into scene CSS vars |
| `SceneRenderer` | `data-living-frame`, `data-signature-zone` |
| `placeForWorkspace()` | Maps workspace → homestead place |

---

## Success Test

Open a large document. Write for twenty minutes.

- Can I still feel the Homestead around me?  
- Can I still notice the season?  
- Can I still see gentle life at the edges?  
- Do I still feel like I'm in Shari's home?

If yes — the room is composed correctly.

> The room does not sit behind the work. **The room embraces the work.**

---

## Code Reference

```
lib/roomCompositionRule/
├── types.ts
├── rules.ts
├── roomCatalog.ts
├── mapWorkspaceToRoom.ts
├── evaluateRoomComposition.ts
├── index.ts
└── roomCompositionRule.test.ts
```
