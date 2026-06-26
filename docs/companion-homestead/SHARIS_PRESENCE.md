# Shari's Presence™
## The Companion Does Not Need To Be Seen To Be Felt

**Version:** 1.0  
**Status:** Constitutional — every room, every experience  
**Code:** `lib/sharisPresence/` · `companionPresenceEngine.ts`  
**Sibling:** [LIVING_BORDER.md](./LIVING_BORDER.md) · [ROOM_COMPOSITION_RULE.md](./ROOM_COMPOSITION_RULE.md)

---

## Principle

> The Companion does not need to be seen to be felt.

Presence is measured by **how welcome the guest feels** — not how often Shari appears on screen.

Sometimes Shari is physically present.  
Sometimes she has simply prepared the room.  
Sometimes she is creating elsewhere in the Homestead.  
Sometimes her presence is felt through details left behind.

**Goal:** The guest never feels alone — without placing Shari in every room.

---

## Presence States

### Host™
Shari is present — welcomes, listens, talks, shares the room.  
**Primary room:** Living Room™  
**Visual:** Shari may appear

### Beside You™
Not visually present — fully available through the **Communication Anchor™**.  
The guest has space to think.  
**Primary rooms:** Planning Table™ · Clear My Mind™ · Decision Compass™  
**Visual:** No portrait — anchor is primary

### Nearby™
Somewhere in the Homestead — the room holds evidence of everyday life.  
**Examples:** coffee mug · open journal · reading glasses · crochet · flowers · Kinsey's toy  
Accompanied **without** feeling observed.  
**Primary rooms:** Creative Studio™ · Reading Nook™ · Kitchen Table™

### Returning™
The room suggests she just stepped away — open book, warm mug, chair pulled back.  
> "She's nearby if I need her."

---

## Room Assignments

| Room | State |
|------|-------|
| Living Room™ | Host™ |
| Planning Table™ | Beside You™ |
| Clear My Mind™ (Window Seat™) | Beside You™ |
| Decision Compass™ | Beside You™ |
| Reading Nook™ | Nearby™ |
| Creative Studio™ | Nearby™ |
| Kitchen Table™ | Nearby™ |

**Never** place Shari in a room simply because she *can* be there.  
The guest should **never feel watched**. They should **always feel welcomed**.

---

## Integration

| Layer | Role |
|-------|------|
| `evaluateSharisPresence()` | Constitutional verdict per place/section |
| `applySharisPresenceToEngine()` | Overrides `showShariImage` on Presence Engine |
| `ROOM_PRESENCE_ASSIGNMENTS` | Canonical state per place |
| Living Border™ | Evidence objects at edges — not Shari portraits |

---

## Code Reference

```
lib/sharisPresence/
├── types.ts
├── roomAssignments.ts
├── evidenceCatalog.ts
├── rules.ts
├── evaluateSharisPresence.ts
├── index.ts
└── sharisPresence.test.ts
```
