# Companion Homestead™ — Room Look Books

**Phase 1 — Design Before Implementation**

These documents are **permanent design authority** for the first five daily-life rooms. No production room UI should ship until the relevant look book is approved.

## Authority chain

1. [`COMPANION_HOMESTEAD_MANIFESTO.md`](../COMPANION_HOMESTEAD_MANIFESTO.md) — constitutional law
2. [`docs/companion-homestead/VISUAL_DESIGN_BIBLE.md`](../companion-homestead/VISUAL_DESIGN_BIBLE.md) — house DNA
3. [`docs/companion-homestead/LOOK_BOOK.md`](../companion-homestead/LOOK_BOOK.md) — full 20-room environmental spec
4. **This folder** — implementation-ready room packets for Phase 1 build
5. [`docs/companion-homestead/SCREEN_COMPOSITION_GUIDE.md`](../companion-homestead/SCREEN_COMPOSITION_GUIDE.md) — how rooms become screens
6. [`docs/companion-homestead/FIRST_PRODUCTION_EXPERIENCE.md`](../companion-homestead/FIRST_PRODUCTION_EXPERIENCE.md) — first 30–60s arrival journey
7. [`lib/companionObjects/companionObjectRegistry.ts`](../lib/companionObjects/companionObjectRegistry.ts) — object identity (no duplicate objects)

## Phase 1 rooms

| Room | File | Primary registry objects |
|------|------|--------------------------|
| Living Room™ | [living-room.md](./living-room.md) | `messages`, `momentum-just-for-fun` |
| Planning Table™ | [planning-table.md](./planning-table.md) | `plan-my-day`, `calendar` |
| Window Seat™ | [window-seat.md](./window-seat.md) | `clear-my-mind` |
| Reading Nook™ | [reading-nook.md](./reading-nook.md) | `reading`, `strategies` |
| Creative Studio™ | [creative-studio.md](./creative-studio.md) | `create`, `email-generator`, `momentum-creative-spark` |

## Signature features (one hero per room)

| Room | Hero |
|------|------|
| Living Room™ | The welcoming fireplace |
| Planning Table™ | The handcrafted planning desk |
| Window Seat™ | The Iowa view |
| Reading Nook™ | The living saltwater reef aquarium |
| Creative Studio™ | The active project table |

## What this is not

- Not a component library
- Not a Figma file
- Not permission to redesign production screens in this pass
- Not a replacement for behavior routing, intelligence, or arrival logic

## Approval gate

Before room UI implementation:

- [ ] All five look books reviewed
- [ ] Signature features confirmed (one hero each)
- [ ] Companion Object Registry cross-check complete
- [ ] UI Language™ agreed with Companion Layout System™
- [ ] ADHD Rules™ validated against behavior audit constraints
- [ ] [Screen Composition Guide™](../companion-homestead/SCREEN_COMPOSITION_GUIDE.md) approved
