# The Living Border
## Where The Home Comes Alive

**Version:** 1.1  
**Status:** Constitutional — every homestead room  
**Code:** `lib/livingBorder/` · `components/companion/LivingBorderFrame.tsx`  
**Sibling:** [ROOM_COMPOSITION_RULE.md](./ROOM_COMPOSITION_RULE.md) · [COMPANION_WORKSPACE_STANDARD.md](./COMPANION_WORKSPACE_STANDARD.md)

---

## Heartbeat

> The Living Border is the **heartbeat of every room**.

The center of the screen belongs to the guest.  
The borders belong to the Homestead.

This is where life quietly unfolds while the guest thinks, creates, plans, writes, and talks.

The Living Border should **never distract**.  
It should gently remind the guest that they are working inside a **real home** — not inside software.

---

## Core Principle

> **The center supports the guest.**  
> **The borders support the experience.**

While the guest is focused on their work, the Homestead continues living around them.

---

## What Lives In The Border

The Living Border is where **subtle movement** and quiet change happen:

- Curtains sway beside the window  
- Tree branches move outside  
- A bird lands at the feeder  
- Aquarium bubbles rise  
- Candlelight flickers on a side table  
- Steam rises from a mug  
- Leaves shift in the breeze  
- Cloud shadows pass  
- Rain rolls down far glass  
- Light gradually changes with the hour  
- Kinsey chooses another sunny spot  

**Never** hero motion behind text. **Never** requiring interaction. **Never** announcing itself.

Catalog: `SUBTLE_BORDER_MOVEMENT` in `lib/livingBorder/types.ts`  
Cap: `MAX_SIMULTANEOUS_BORDER_ANIMATIONS` (3) — enforced in `evaluateLivingBorder()`

---

## The Rules

| Border | Center |
|--------|--------|
| May change | Remains stable |
| Creates delight | Creates focus |
| Supports the experience | Supports the guest |
| Is observed | Is used |
| Subtle movement only | No border life |

Enforced: `LIVING_BORDER_RULES` · `filterLivingChangesToBorder()` · `capBorderAnimations()`

---

## Room Border Catalogs

| Room | Border life |
|------|-------------|
| Living Room | Window, curtains, trees, bird feeder, flowers, mug, bookshelf, lamp, Kinsey |
| Window Seat | Landscape, wildlife, rain, snow, curtains, candle, steam |
| Reading Nook | Aquarium, books, lamp, window, blanket |
| Planning Table | Planner, calendar shelf, lamp, window, coffee |
| Creative Studio | Craft shelves, fabric corner, plants, windows |

---

## Memory Through Observation

Guests notice life changing — not because the Companion points it out:

- "The flowers changed."  
- "Kinsey is sleeping somewhere else today."  
- "The curtains are open."

Relationship grows through **observation**, not explanation.

---

## Success Test

Hide the center 60%. Only the outer frame remains.

Can you still recognize the **season · room · time of day · feeling · life**?

> "I know exactly where I am."

`passesLivingBorderRecognitionTest()` in `evaluateLivingBorder.ts`

---

## Integration

| Layer | Role |
|-------|------|
| `evaluateLivingBorder()` | Active border elements + subtle animation cap |
| `LivingBorderFrame` | `companion-living-border--subtle` — edge life only |
| `SceneRenderer` | Border in motion layer — never center |
| `livingChangeResolver` | `filterLivingChangesToBorder()` after scene integrity |

---

## Code Reference

```
lib/livingBorder/
├── types.ts              — principles, SUBTLE_BORDER_MOVEMENT
├── rules.ts              — capBorderAnimations(), MAX_SIMULTANEOUS_BORDER_ANIMATIONS
├── elementRegistry.ts
├── borderCatalog.ts
├── evaluateLivingBorder.ts
├── livingBorderGate.ts
└── livingBorder.test.ts
```
