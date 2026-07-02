# Spark Estate Guidebook™ — Editorial System

**Direction:** luxury estate coffee-table book — curated spreads, large readable type, generous spacing. Not a web page, dashboard, or card grid.

**Preview:** `/estate-guide/{spreadId}` · **In-app:** Guidebook flipbook (companion anchor)

---

## Editorial blocks

Each spread composes **optional blocks** on the left and right pages. Spreads do not share one repeated template.

| Block type | Label |
|------------|-------|
| `around-the-estate` | Around the Estate |
| `estate-tradition` | Estate Tradition |
| `found-among-archives` | Found Among the Archives |
| `from-sharis-notebook` | From Shari's Notebook |
| `stewards-note` | Steward's Note |
| `curators-note` | Curator's Note |
| `leave-remembering-one-thing` | If You Leave Here Remembering One Thing |
| `estate-saying` | Estate Saying |

Types: `lib/estate/estateGuideEditorial/types.ts`  
Labels: `lib/estate/estateGuideEditorial/blockLabels.ts`  
Renderer: `components/estate-guide/EstateGuideEditorialBlock.tsx`  
Spread data: `data/estateGuideSpreads.ts`

---

## Adding a spread

1. Append one object to `ESTATE_GUIDE_SPREADS` with `leftBlocks` and `rightBlocks`.
2. Choose a **different block mix** than neighboring spreads when possible.
3. Run `npx vitest run data/estateGuideSpreads.test.ts`.
4. Preview at `/estate-guide/your-spread-id`.

### Example

```typescript
{
  id: "reading-nook",
  title: "The Reading Nook™",
  image: estateBackgroundPath("reading-nook-background.png"),
  tagline: "One lamp, one chair, one page at a time.",
  leftBlocks: [
    {
      type: "around-the-estate",
      title: "A pause between chapters",
      paragraphs: ["…"],
      visitReasons: ["…"],
    },
    { type: "estate-saying", quote: "…" },
  ],
  rightBlocks: [
    {
      type: "from-sharis-notebook",
      paragraphs: ["…"],
      prompts: ["…"],
    },
    { type: "leave-remembering-one-thing", line: "…" },
  ],
}
```

---

## Design constraints

- **Large serif body** — `clamp(1.375rem …)` minimum; no small gray UI copy.
- **Premium spacing** — blocks separated by hairline rules and margin, not cards.
- **No emojis** — never in guidebook copy or chrome.
- **No cartoon styling** — no badges, chips, or playful illustration language.
- **No dashboard look** — no bordered cards, metric tiles, or accordion FAQ patterns.

---

## Structural fields (every spread)

| Field | Purpose |
|-------|---------|
| `id` | Route + lookup |
| `title` | Room name on spread |
| `tagline` | Italic line beneath title |
| `image` | Scene plate photograph |
| `imagePlaceId` | Fallback place id for asset chain |
| `leftBlocks` | Editorial blocks — orientation page |
| `rightBlocks` | Editorial blocks — wisdom / remembrance page |

---

## Tests

```bash
cd companion-app
npx vitest run data/estateGuideSpreads.test.ts
```

`validateEstateGuideSpread()` returns errors for empty or unknown blocks.
