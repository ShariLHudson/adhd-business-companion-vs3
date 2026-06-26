# Shari's Everyday Life™
## Companion Homestead™ — The Home Should Feel Lived In, Not Staged

**Version:** 1.0  
**Status:** Canonical design authority — environmental storytelling, not activity  
**Authority:** Subordinate to [`CHARACTER_OF_SHARI.md`](./CHARACTER_OF_SHARI.md) · [`PRESENCE_INTELLIGENCE.md`](./PRESENCE_INTELLIGENCE.md) · [`LIVING_LIFE_ENGINE.md`](./LIVING_LIFE_ENGINE.md)  
**Implementation:** [`lib/sharisEverydayLife/`](../../lib/sharisEverydayLife/) · [`LIVING_DETAILS_CATALOG.md`](./LIVING_DETAILS_CATALOG.md) (520+ extended candidates)

**This is not:**
- Tasks
- Features
- Announced hospitality
- A movie set waiting for the guest

**This is:** **Life** — what would naturally be happening if someone stopped by unexpectedly.

---

## Core principle

The house should never feel frozen waiting for the user.

It should feel **gently lived in**.

The guest is always welcome — but they are arriving in the **middle of a real day**.

The goal is not activity. The goal is **authenticity**.

---

## Life happens without explanation

| Wrong (announced) | Right (noticed) |
|-------------------|-----------------|
| "I've been crocheting today." | Crochet basket beside the chair |
| "I watered the herbs." | Herbs look freshly watered |
| "I've been reading." | Book open, reading glasses on top |
| "Coffee's ready if you want it." | Mug on the table, steam optional — no line |

**The home tells the story.** Shari does not narrate the staging.

Banned narration patterns: `lib/sharisEverydayLife/rules.ts`

---

## Everyday moment library

Canonical catalog: `lib/sharisEverydayLife/catalog.ts` (40+ moments; extends [`LIVING_DETAILS_CATALOG.md`](./LIVING_DETAILS_CATALOG.md))

### Living Room
- Crochet draped over chair arm
- Blanket not quite folded
- Second mug — someone stopped by earlier
- Half-finished puzzle
- Mystery novel with bookmark
- Bird guide on windowsill
- Kinsey claimed the favorite chair

### Kitchen (emotional center)
- Coffee half-finished in the breakfast nook
- Banana bread cooled — kitchen still cozy
- Herb wall freshly watered
- Mug still on the table
- Basket not yet put away

### Creative Studio
- Fabric mid-project
- Beads in trays
- Colored pencils left out
- Card half completed
- Journal cover drying
- Ideas notebook open

### Planning Table
- Journal open
- Sticky notes sticking out
- Coffee ring — real session happened

### Garden & porch
- Garden gloves by the door
- Flowers picked from garden
- Seasonal harvest (tomatoes, pumpkins)
- Hummingbird at feeder
- Porch throw on rocker

### ADHD authenticity
- Craft project sitting for a week — **loved, not staged**
- Basket not put away
- Imperfect is warm

---

## How moments appear (engine rules)

| Rule | Why |
|------|-----|
| **≤1 moment per visit** | One quiet detail — not a tour |
| **Never on day one** | Familiarity before discovery |
| **Silent** | No `conversationHint` narration |
| **Caused** | Season, time, continuity — not random |
| **Cooldown** | Same detail doesn't repeat for days |
| **Restraint on hard days** | Flooded/grief/recovery — room softens, doesn't decorate |

Wired through **Living Life Engine™** → `resolveEverydayLifeChanges()`

---

## Relationship through discovery

The guest learns about Shari over **months and years** — not because she tells stories, because they **notice**:

- "She loves hummingbirds."
- "She always has a craft project going."
- "Her kitchen feels cozy."
- "She drinks coffee in that same nook."
- "Kinsey finds the warmest spot."
- "I've watched her garden change through the seasons."

None of those were explained. They were **lived**.

---

## Five-year success test

Ask: **"What do you know about Shari?"**

### Pass
Answers sound like a real friend observed over time — birds, crafts, Kinsey, the nook, the garden.

### Fail
- "The app shows seasonal objects."
- "It personalizes the room."
- "Features rotate."

---

## Stack position

```
Presence Intelligence™ (silent guest preparation)
  → Living Life Engine™ (time, weather, Kinsey, wildlife)
  → Shari's Everyday Life™ (one lived-in detail)
  → Environmental Truth™ (coherence)
  → Guest discovers
```

Sibling: **Shari's Life Moments™** (conversational sharing) vs **Everyday Life™** (environmental — no dialogue).

---

## Approval gate

- [ ] No announced staging copy in UI or `conversationHint`
- [ ] Objects use labels for dev/lookbook — never announced in chrome
- [ ] Imperfect moments included — not Pinterest-perfect
- [ ] Kitchen reads cozy and real
- [ ] Creative studio reads mid-project, not showroom
- [ ] Five-year discovery test passes on paper

---

*From an app with personality to a home with a soul — one quiet detail at a time.*
