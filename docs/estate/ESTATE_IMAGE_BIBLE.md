# Estate Image Bible™

**Spark Estate Image Standards™ — permanent brand consistency for every Estate photograph, room plate, and scene.**

| Field | Value |
|-------|-------|
| **Status** | Canonical — all Estate imagery |
| **Audience** | Art direction · image generation · designers · AI image prompts |
| **Runtime prompt block** | `lib/estate/estateImageStandards.ts` → `ESTATE_IMAGE_BRAND_PROMPT` |
| **Related** | [SPARK_BRAND_BIBLE.md](../SPARK_BRAND_BIBLE.md) · [ESTATE_EXPERIENCE_MASTER_PLAN.md](./ESTATE_EXPERIENCE_MASTER_PLAN.md) · [estate-light-flicker.css](../app/companion/estate-light-flicker.css) · Spec 103 visual standards |

---

## Purpose

Every room in the Spark Estate™ must feel like **one property** — not a collection of unrelated stock photos.

The Estate Image Bible™ ensures:

- The same **Spark flame logo** on every drinking vessel  
- The same **brass, pens, journals, and signage** language  
- **No generic clip art** or placeholder branding  
- **Decorative objects** that reinforce each room’s purpose  
- **Absurdity guards** (e.g. never a two-handled mug) so AI output stays believable  

Whether the scene is the **Stables™**, **Coffee House™**, **Conservatory™**, **Apple Orchard™**, **Momentum Institute™**, or a room not yet built — the identity must be **unmistakably Spark Estate**.

---

## Spark Estate Image Standards™ (summary)

| Rule | Standard |
|------|----------|
| **Drinking vessels** | Official **Spark flame logo** on every mug, teacup, travel mug, or cup — centered, proportioned, facing viewer when practical. Never blank. Never another emblem. |
| **Journals** | Spark Estate branding — leather, debossed or foil **Spark** / flame mark; never generic notebooks |
| **Pens** | Black-and-gold luxury pens (Montblanc-style): black barrel, gold clip and trim |
| **Brass hardware** | Warm antique brass throughout — drawer pulls, lamps, horseshoes, file hardware, hinges |
| **Room signage** | Approved Estate typography on plaques and labels — elegant serif, warm cream on wood or brass |
| **Forbidden** | Generic clip art · stock logos · placeholder icons · cold SaaS UI chrome |
| **Purpose** | Every decorative object supports the **emotional job** of the room |
| **Photography** | Photorealistic, warm, premium estate — timeless, not trend-chasing |

---

## Master image prompt block

**Append this block to every Estate room-plate and scene-generation prompt** (after room-specific description).

```
SPARK ESTATE IMAGE STANDARDS (mandatory):

Brand consistency: Every coffee mug, teacup, travel mug, or drinking vessel visible anywhere
in the Spark Estate must display the official Spark flame logo. Never leave mugs blank.
Never substitute another emblem. Keep the logo centered, correctly proportioned, and facing
the viewer whenever practical. This branding rule applies consistently across every Estate
room and all future image variations.

Journals and ledgers: Leather-bound with subtle Spark Estate branding (debossed or foil flame).
Never generic store-brand notebooks.

Writing instruments: Black-and-gold luxury pens only (Montblanc-style — black barrel, gold
clip and trim). No plastic ballpoints, no novelty pens.

Brass hardware: Warm antique brass (#c4a574 family) — consistent pulls, lamps, hinges,
drawer plates, hooks, and accents. Match Momentum Institute drawer brass.

Room signage: Elegant estate serif typography on plaques; warm cream or brass lettering on
dark wood. No sans-serif app UI fonts in the scene.

Photography: Photorealistic, warm natural light, premium entrepreneurial estate, calm and
uncluttered. No cartoon, no clip art, no stock-watermark logos, no neon, no gamified UI.

Physical plausibility: One handle per mug/cup. Correct human-scale proportions. No floating
objects. No impossible architecture.

Decorative objects must reinforce this room's purpose (see room brief) — not random clutter.

Lanterns, candles, fireplaces: soft warm flicker implied; never strobe or harsh pulse.
Respect still photography — gentle glow only.
```

**Code:** `ESTATE_IMAGE_BRAND_PROMPT` in `lib/estate/estateImageStandards.ts`

---

## Drinking vessels — Spark flame logo

The **Spark flame logo** is the Estate’s hospitality mark on every cup.

| Do | Never |
|----|-------|
| Center logo on mug face toward camera | Blank white mugs |
| Proportion logo to cup size (readable, not billboard) | Other company logos, initials, or patterns |
| Use on coffee mugs, teacups, travel mugs, cocoa cups | “Generic cozy mug” with no brand |
| Match logo across Welcome Home™, Coffee House™, Tea Room™, Conservatory™ desk scenes | Inconsistent flame shape per room |

**Hospitality principle:** The mug is Shari’s welcome — the flame says *you are in Spark’s home*.

---

## Journals & paper goods

| Object | Standard |
|--------|----------|
| **Journals** | Leather or fine linen cover; **Spark Estate** wordmark or flame; ribbon bookmark optional |
| **Desk pads** | Cream or warm gray; minimal branding corner |
| **Index cards** (Institute) | Aged cream stock; brass drawer context — not neon office supplies |
| **Letters / envelopes** | Estate cream stationery when visible |

Never: spiral school notebooks, corporate legal pads with unrelated logos, sticky-note walls in romantic rooms.

---

## Pens & writing tools

**Black-and-gold luxury pen** — Montblanc-inspired:

- Black lacquer or resin barrel  
- Gold clip, gold ring at cap  
- Fountain or rollerball silhouette — refined, not bulky  
- May rest beside journal, on drafting table, or in Conservatory™ scenes  

Never: cheap plastic pens, highlighters in hero foreground, novelty shapes.

---

## Brass hardware palette

One brass language across the Estate:

| Attribute | Direction |
|-----------|-----------|
| **Tone** | Warm antique brass — not chrome, not rose gold |
| **Reference** | Momentum Institute™ drawer pulls and file plates |
| **Hex family** | `#c4a574` · `#b8956a` · highlights `#e8d4a8` |
| **Finish** | Slightly aged, soft patina — lived-in estate |
| **Uses** | Drawer pulls, lamp bases, hooks, horseshoes, compass cases, telescope fittings, door hardware |

Institute, Stables™, Library™, and Evidence Vault™ scenes must **match** — not different metal families per room.

---

## Room signage typography

Signage is **environmental**, not app UI.

| Use | Typography |
|-----|------------|
| Room plaques | Elegant serif capitals — estate engraved feel |
| Drawer labels | Small caps on brass plates |
| Directional signs | Painted or carved wood — warm cream letterforms |
| Forbidden in scenes | Inter, Roboto, dashboard fonts, neon wayfinding |

**UI typography** for conversation glass is separate (Spec 109) — do not confuse scene signage with frosted panel fonts.

---

## Forbidden elements

Never in Estate imagery:

- Generic clip art or flat icons  
- Stock photo watermarks or placeholder “LOGO” boxes  
- Random corporate brands on mugs, books, or screens  
- Cold blue-gray SaaS office aesthetic  
- Gamification badges, streak flames, point counters  
- Harsh strobe on lanterns or fireplaces  
- Busy clutter that fights conversation focal areas  

---

## Physical plausibility rules

AI image generation must pass **believe-you-could-walk-there** tests:

| Rule | Why |
|------|-----|
| **One handle per mug** | Never two handles on a single cup |
| **One flame logo per vessel face** | Not repeated wrapping incorrectly |
| **Human-scale furniture** | Doors, chairs, desks believable |
| **Consistent light direction** | Sun/window/fire agree |
| **No floating props** | Mugs rest on surfaces with contact shadow |
| **Bookshelf gravity** | Books sit on shelves, spines varied naturally |

Add new absurdity guards here as they appear in generation (document → prompt block).

---

## Decorative objects by room purpose

Objects **reinforce the room’s job** — see [ESTATE_EXPERIENCE_MASTER_PLAN.md](./ESTATE_EXPERIENCE_MASTER_PLAN.md) signature objects.

| Room | Decorative direction |
|------|----------------------|
| **Welcome Home™** | Hearth lantern, Spark logo mug, welcome warmth |
| **Coffee House™** | Logo mugs, pastry warmth, conversational tables |
| **Tea Room™** | Teapot, logo teacups, unhurried ceremony |
| **Conservatory™** | Glass, plants, thought stones, journal + gold pen |
| **Clear My Mind™** | Thought stones, open space, relief not clutter |
| **Momentum Institute™** | Brass file drawers, index cards, academic estate wood |
| **Creative Studio™** | Drafting table, sketches, logo mug, black-gold pen |
| **Observatory™** | Telescope, brass fittings, curated books |
| **Stables™** | Antique saddle, leather journal, brass horseshoe — no cartoon horses |
| **Apple Orchard™** | Apple basket, garden light, harvest warmth |
| **The Gardens™** | Garden gate, natural growth, celebration without kitsch |
| **Greenhouse™** | Potting bench, seedlings, diffused glass light |
| **Peaceful Places™** | Lantern path, soft soundscape implied visually |
| **Journal™** | Leather journal with Estate branding, pen, quiet lamp |

When a room’s signature object appears, it should be **hero-quality** — not an afterthought prop.

---

## Warm light & motion (still images)

Estate lanterns, candles, and fireplaces imply **gentle life**:

- Soft radial glow aligned to flame  
- Never harsh pulse or arcade flash in photography  
- Align with [Estate Light Flicker™](../.cursor/rules/estate-light-flicker.mdc) for animated UI overlays  

In **static** room plates: subtle glow bloom is enough; animation is a separate CSS layer.

---

## Workflow — generating a new room plate

1. Read room purpose in [ESTATE_ROOM_REGISTRY.md](../ESTATE_ROOM_REGISTRY.md) or [ESTATE_EXPERIENCE_MASTER_PLAN.md](./ESTATE_EXPERIENCE_MASTER_PLAN.md).  
2. Write room-specific description (architecture, light, mood, signature object).  
3. **Append** `ESTATE_IMAGE_BRAND_PROMPT` (master block above).  
4. QA against checklist below.  
5. Register asset path in `lib/estate/estateRoomRegistry.ts` — do not invent filenames.  

---

## QA checklist (before approving any Estate image)

- [ ] Every visible mug/cup/teacup has **Spark flame logo** — centered, correct, not blank  
- [ ] No two-handled mugs or impossible cups  
- [ ] Journals show **Spark Estate** branding if visible  
- [ ] Pens are **black-and-gold luxury** style  
- [ ] Brass matches warm antique palette — consistent with Institute  
- [ ] Signage uses **estate serif** — not app UI fonts  
- [ ] No clip art, stock logos, or placeholder icons  
- [ ] Decorative objects match **room purpose**  
- [ ] Photorealistic, warm, calm, premium — Spec 103  
- [ ] Lantern/candle/fire gentle — not strobe  
- [ ] Focal area leaves space for frosted conversation panel when applicable  

---

## Document hierarchy

| Order | Document |
|-------|----------|
| 1 | [Spark Constitution™](../SPARK_CONSTITUTION.md) |
| 2 | [Spark Brand Bible™](../SPARK_BRAND_BIBLE.md) — voice & estate philosophy |
| 3 | **Estate Image Bible™** (this document) — **all Estate photography & scene generation** |
| 4 | Room specs — [ESTATE_EXPERIENCE_MASTER_PLAN.md](./ESTATE_EXPERIENCE_MASTER_PLAN.md) · per-room lookbooks |

When image direction conflicts with a one-off prompt, **this bible wins**.

---

## Living document

Add rules here when generation QA discovers new failure modes (e.g. duplicate handles, wrong metal, blank mugs).

**Sync:** update `lib/estate/estateImageStandards.ts` when the master prompt block changes.

---

*One Estate. One flame on every cup. One brass language. One unmistakable home.*
