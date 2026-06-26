# Signature Companion Objects™
## The Visual Language of the Entire Companion

**Version:** 1.0  
**Status:** Canonical — governs all visual identity in the Homestead  
**Code:** `lib/signatureCompanionObjects/`  
**Master catalog:** `lib/companionObjectsDesignSystem/`  
**Runtime UI:** `components/companion/CompanionObjectVisual.tsx`

---

## The Decision

We are **not replacing emojis with icons.**

We are creating the permanent visual language of the Companion Homestead™.

From this point forward, every workspace, room, menu, recommendation, navigation item, feature card, and conversation uses **Signature Companion Objects™** — not emojis or generic UI icons.

These objects become as recognizable as the Companion logo itself.

---

## Design Philosophy

The Companion is a home.

The user should never feel like they are clicking software icons. They should feel like they are interacting with meaningful objects that belong inside Shari's home.

**Warmth before function.**

---

## One Object • Three Forms

Every Signature Companion Object™ exists in **three coordinated versions** of the same identity.

| Level | Name | Size | Where |
|-------|------|------|-------|
| **1** | Navigation Object™ | 24–32 px | Sidebar, top nav, menus, tabs, search, notifications, favorites |
| **2** | Feature Object™ | 64–120 px | Workspace cards, recommendations, How Do I cards, room entrances |
| **3** | Environmental Object™ | 128 px+ | Physically in the room — journal on table, mug by chair, feeder outside window |

### Recognition without explanation

**Planning Notebook™**

```
Tiny menu illustration (navigation)
        ↓
Feature card illustration (feature)
        ↓
Notebook sitting on the Planning Table (environmental)
```

The brain connects them. No label required.

### Code

```tsx
<CompanionObjectVisual
  signatureId="sig-planning-notebook"
  form="navigation"
/>
<CompanionObjectVisual
  signatureId="sig-planning-notebook"
  form="feature"
/>
```

Environmental objects render in room scenes via `data-catalog-object` placement — not as nav icons.

---

## Room Catalogs

| Zone | Primary signature | Objects |
|------|-------------------|---------|
| **Living Room™** | Favorite Coffee Mug™ | Chair, fireplace, clock, flowers, window, bird feeder, lamp, blanket |
| **Clear My Mind™** | Reflection Journal™ | Fountain pen, memory box, candle, blanket, thought basket |
| **Planning Table™** | Planning Notebook™ | Daily planner, calendar, clipboard, sticky notes, lamp, pencil cup |
| **Reading Nook™** | Book Stack™ | Open novel, glasses, bookmark, saltwater aquarium, chair, tea cup |
| **Creative Studio™** | Crochet Basket™ | Yarn, watercolor, brushes, fabric, craft storage, half-finished project |
| **Business™** | Leather Portfolio™ | Camera, microphone, laptop, marketing notebook, whiteboard |
| **Kitchen™** | Coffee Pot™ | Favorite mug, herbs, recipe box, wooden spoon, fruit bowl, tea tin |
| **Nature™** | Hummingbird™ | Goldfinch, cardinal, butterfly, sunflower, lavender, watering can |
| **Kinsey™** | Dog Bed™ | Toy, water bowl, leash, treat jar, blanket, tennis ball |

Full registry: `SIGNATURE_COMPANION_OBJECTS` in `lib/signatureCompanionObjects/roomCatalog.ts`

---

## Emotional Purpose

Objects are **emotional cues**, not decorations.

| Object | Meaning |
|--------|---------|
| Journal™ | Reflection |
| Coffee Mug™ | Welcome |
| Planner™ | Clarity |
| Blanket™ | Comfort |
| Aquarium™ | Peace |
| Bird Feeder™ | Hope |
| Flowers™ | Care |
| Crochet Basket™ | Creativity |
| Reading Lamp™ | Quiet |
| Portfolio™ | Building something meaningful |

Each signature entry includes `emotionalPurpose`. Designer backstories live in `designerStory` on the master catalog — **never shown to guests**.

---

## Illustration Style

Shared with [COMPANION_OBJECTS_DESIGN_SYSTEM.md](./COMPANION_OBJECTS_DESIGN_SYSTEM.md):

**Warm Homestead Realism™** — handcrafted, natural, timeless.

Materials: wood, linen, leather, stone, ceramic, glass, cotton, brass, copper, woven materials.

Reject: plastic, chrome, flat UI icons, emoji styling, corporate graphics, clip art, gaming aesthetics.

---

## Animation

Objects come alive only when appropriate:

- Coffee steam · Candle flicker · Aquarium bubbles · Curtain drift · Bird landing briefly · Leaves moving

Never animated for entertainment. Movement reinforces that this is a **living home**.

`animation` field on signature entries. Respects `prefers-reduced-motion`.

---

## Brand Consistency

The **exact same** Companion Object™ appears everywhere:

Menu → Recommendation card → Search → Workspace header → Conversation suggestion → Physical object in the room

The object becomes the identity. Users recognize it before reading text.

---

## Future Expansion — Constitutional Gate

Every new feature must first answer:

> **"What is its Signature Companion Object™?"**

No new workspace may launch without one.

If a feature cannot be represented by an object that belongs inside the Homestead, reconsider whether it belongs in the Companion at all.

```ts
import { assertWorkspaceSignatureObject } from "@/lib/signatureCompanionObjects";

assertWorkspaceSignatureObject("new-feature-id"); // throws if missing
```

---

## The Recognition Test

Someone scrolling Pinterest sees only a small illustrated leather journal.

No logo. No text. No branding.

They immediately think:

> **"That's from Shari's Companion."**

That is the standard.

---

## Document Hierarchy

```
Manifesto
  → Signature Companion Objects™ (this document) — visual identity law
    → Companion Objects Design System — 298-object master catalog + designer stories
      → Visual Design Bible — materials and Warm Homestead Realism™
        → Production art assets
```

---

## Related Code

| Module | Role |
|--------|------|
| `lib/signatureCompanionObjects/` | Room catalogs, three-form resolution |
| `lib/companionObjectsDesignSystem/` | Master object catalog + designer stories |
| `lib/companionObjects/companionObjectRegistry.ts` | Runtime feature → object mapping |
| `lib/companionUniverse/libraries/objectLibrary.ts` | Feature iconography migration |
| `CompanionObjectVisual` | Renders navigation + feature forms |

```ts
import {
  signatureObjectById,
  signaturesForRoom,
  resolveSignatureVisualSpec,
} from "@/lib/signatureCompanionObjects";
```

Tests: `npx vitest run lib/signatureCompanionObjects`
