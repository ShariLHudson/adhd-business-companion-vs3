# Spark Card™ Visual Redesign — Implementation Report

**Status:** Implemented (uncommitted — per instructions, not committed).
**Scope:** Visual + interaction chrome only. No data model, selection engine, or
routing changes.
**Branch:** `deploy/companion-app-v3`
**Prompts (archived):**
- [`SPARK_CARD_VISUAL_REDESIGN_PROMPT.md`](./SPARK_CARD_VISUAL_REDESIGN_PROMPT.md) — authoritative brief
- [`SPARK_CARDS_REDESIGN_SIMPLIFICATION_PROMPT.md`](./SPARK_CARDS_REDESIGN_SIMPLIFICATION_PROMPT.md) — companion brief found alongside it (parchment/gold/whimsical direction; consistent with the authoritative brief, used only to confirm direction, not as a second source of truth)

## Reference image — not found

The prompt references `/mnt/data/spark-card-design(2).png` (a ChatGPT/sandbox
path). It was **not present** on this machine — searched Downloads, Desktop,
Documents, and the `companion-app` workspace (`public/`, `docs/`, repo-wide
glob for `*spark-card*`/`*spark*card*.png`). No matching image existed.

**This is logged as a gap.** The redesign below was implemented directly from
the prompt's detailed written visual specification (palette, composition,
section list, typography rules, acceptance criteria) rather than pixel-matched
to the reference screenshot. If the actual reference image becomes available,
a follow-up pass should visually diff against it (frame ornamentation,
badge shape, exact panel layout) and adjust spacing/detailing only — the
underlying structure already implements every named section.

## Files changed

| File | What changed |
|---|---|
| `app/companion/spark-note.css` | Full visual rewrite: palette tokens, card frame, category badge, illustration framing, insight panels, Spark in Action, footer, actions/More menu, collapsed anchor, My Collection modal, print rules. No class renamed away — old selectors kept where still referenced. |
| `components/companion/SparkNoteExpanded.tsx` | Restructured markup: badge, close button, decorative ornaments, panel grid, prominent action block, footer line, "More" menu (Share/Print) alongside visible Save/Favorite. |
| `components/companion/SparkNoteAnchor.tsx` | Collapsed anchor: added decorative corner seal + category color tint via `data-diversity-category`. **No structural change** — kept exactly what the existing test asserts (no thumbnail, no teaser text, single SVG, no "badge"-named class). |
| `components/companion/SparkNoteMyCollection.tsx` | Added ornament corners + category emoji per saved item for visual consistency with the redesigned card language. |
| `lib/sparkNote/sparkCardDiversity.ts` | **Additive only** — new `SPARK_CARD_DIVERSITY_CATEGORY_ICON` map + `diversityCategoryIcon()` helper (small emblem per approved category, for the badge). No existing export changed. |
| `lib/sparkNote/sparkCardCollectibleDisplay.ts` | **Additive only** — `categoryIcon` field added to `SparkCardSimplifiedPresentation`; new `resolveSparkCardFooterLine()` (deterministic per-card pick from the existing, already-approved `SPARK_CARD_OUTCOME_FEELINGS` copy — nothing fabricated). |

No changes to: `catalog.ts`, `evaluateDailySparkNote.ts`, `librarySelection.ts`,
`selectionIntelligence.ts`, `persistence.ts`, `mySparksCollection.ts`,
`sparkNoteDestinations.ts`, `sparkCardArtRegistry.ts`, `SparkNoteChrome.tsx`,
or any daily-selection/rotation logic.

## How this maps to the reference brief

| Brief section | Implementation |
|---|---|
| Parchment base, gold frame, dimensional edges, ornamental corners | `.spark-note-expanded__card` (layered parchment gradient + paper-grain texture, gold hairline + outer parchment ring box-shadow) + `.spark-note-expanded__ornaments` (4 gold corner brackets, `aria-hidden`) |
| Category badge, upper-left, deep teal, beveled, icon, gold accent | `.spark-note-expanded__badge` — teal gradient, gold border, inset bevel shadow, per-category emoji (`categoryIcon`) + existing approved ribbon label (`categoryRibbon`) — **category set/labels unchanged** |
| Main title + subtitle + decorative accent | `.spark-note-expanded__title` (large serif), `.spark-note-expanded__subtitle` (serif italic, kept readable per "no tiny copy" rule), `.spark-note-expanded__divider` (gold accent rule). A small script-font "kicker" line ("Today's Spark") sits above the title as the one restrained handwritten accent the brief allows. |
| Large topic-specific illustration, integrated not pasted on | `.spark-note-expanded__art` — thicker gold frame + parchment ring, plus a new `.spark-note-expanded__art-frame` warm vignette/duotone overlay (`mix-blend-mode: multiply`) and a light `saturate/sepia` filter on photographic art, so the existing photo assets read closer to "vintage editorial" instead of raw stock photography (see Gaps below) |
| Spark Story / main content | `.spark-note-expanded__section--story` — unchanged story paragraphs, now with a storybook drop-cap on the opening letter |
| Supporting insight panels (icon + heading + text, light separation) | `.spark-note-expanded__panels` grid — currently one panel ("Today's Spark", ✨) because that's the data the current card model provides distinct from Tell Me More; the grid auto-adapts if more panel-worthy fields are added later |
| Spark in Action — prominent, warm, icon, clear sentence | `.spark-note-expanded__action` — rose/gold gradient panel, 🔥 icon, unchanged `sparkInAction` copy |
| Footer line | `.spark-note-expanded__footer` — deterministic pick from the existing `SPARK_CARD_OUTCOME_FEELINGS` copy (e.g. "That was interesting."), script font, per-card stable (not random per render) |
| Collapsed state — thumbnail, label, title, subtitle, category icon, expand control | Implemented **within the frozen constraint** that the collapsed anchor may not show a thumbnail image or teaser text (see `SparkNoteAnchor.test.tsx`, unchanged). It keeps flame + "Daily Spark" + short title, now with a decorative gold corner seal and category-tinted flame well, so it still reads as a small keepsake object rather than a plain icon button. |
| Expanded state = full experience | `SparkNoteExpanded` — everything in one scrollable card; existing `Tell Me More` accordion still carries facts / reflection / related sparks so nothing is hidden or lost |
| Responsive (desktop/tablet/mobile) | Card widens on `min-width: 720px` / `1024px`; panel grid collapses to one column and card narrows back down under `max-width: 720px`; illustration max-height scales with breakpoint |
| Readability requirements | No frosted/washed overlays over text; teal-on-parchment and ink-on-cream contrast preserved; section labels are bold uppercase sans, body stays serif/sans at ≥0.9rem, action text is bold and larger |
| Palette tokens | Root variables updated to the brief's palette (`--spark-note-teal: #0f6f7c`, `--spark-note-gold-bright: #f5c16c`, `--spark-note-bronze`, `--spark-note-gold-light: #ffd98a`, warm rose for the action panel) — restrained, not rainbow |
| Typography (serif title, humanist body, restrained script accent, uppercase sans labels) | Serif (`Georgia`) title/body/story, `Segoe UI` uppercase for badge/section/panel labels, `Segoe Script` restricted to the kicker line and footer only |
| Secondary actions inside discreet `More` | Save + Favorite stay visible; Share and Print moved into a "More ⋯" popover (keyboard + outside-click + Escape dismiss) so the card face isn't cluttered |
| Print view | Print stylesheet now also hides the close button and More popover/toggle; frame, title, category, illustration, story, panels, action, and Tell Me More (forced open) still print |

## Preserved (verified, nothing removed)

- All content fields: title, subtitle/teaser, category + ribbon, story
  paragraphs, Today's Spark takeaway, Spark In Action, Tell Me More facts /
  reflection prompt / related sparks, footer.
- All actions: Save (→ saved-confirmation screen), Favorite (star toggle),
  Share (native share sheet or clipboard fallback), Print.
- Saved state, favorite state, viewed/completed tracking, category affinity —
  untouched (`lib/sparkNote/persistence.ts` not modified).
- My Spark Collection: search, category filter, date filter, sort, empty
  states — all logic untouched, only frame/accent styling added.
- Daily selection engine, rotation, cooldowns, personalization, seasonal
  personality — untouched.
- Keyboard/dismiss behavior — still routed through the shared
  `useDismissibleWindow` (Escape + outside-click), now with an added explicit
  visible **Close (×)** button for a clearer affordance (additive, not a
  replacement for existing dismiss paths).
- Data-testids used by existing tests (`spark-note-anchor`,
  `spark-note-expanded`, `spark-note-tell-me-more`, `spark-note-my-collection`)
  all unchanged.

## Gaps / follow-ups

1. **Reference image never located.** Implemented from the written spec only
   — see note above. Re-check against the actual approved PNG when available.
2. **Illustrated artwork per category is a pre-existing, already-documented
   gap** (`docs/protocols/SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md` lists
   "Illustrated assets per card" under Future). Today's hero art is real
   Wikimedia photography, not watercolor/storybook illustration. This redesign
   adds a warm duotone/vignette treatment to soften the photographic look, but
   commissioning or generating actual illustrated art per category is a
   content project, not a chrome/CSS change, and is out of this scope.
3. **Export / Archive / Delete / Restore / Edit** are listed in the prompt's
   "Universal actions" section but do **not exist anywhere in the current data
   layer** (`persistence.ts`, `mySparksCollection.ts` only support
   save/favorite/share/print). No such functionality was fabricated. If/when
   these are built, they belong inside the new `More` menu next to Share/Print.
4. **Supporting insight panels** currently render only one panel ("Today's
   Spark") because that's the one field the model exposes that is distinct
   from the Tell Me More facts. The panel grid (`.spark-note-expanded__panels`,
   CSS grid `auto-fit`) will automatically lay out 2+ panels side by side if
   future content adds more (e.g. a dedicated "Fun Fact" field distinct from
   `whyInteresting`).
5. Two other pre-existing markdown files reference an older
   `SPARK_CARD_QUALITY_TEST`/`SPARK_CARD_ACTIONS` model
   (`lib/sparkNote/sparkCardVisualDesignAndDailyGeneration.ts`) that is failing
   its own tests independent of this change (see Testing below) — worth a
   separate look, but out of scope for a "visual redesign only" task.

## Testing

Ran (PowerShell, background):

```powershell
npx vitest run lib/sparkNote components/companion/SparkNoteAnchor.test.tsx
```

Results: **74 passed / 7 failed** (18 files). All Spark Card *display* tests
directly touched by this redesign passed:

- `lib/sparkNote/sparkCardCollectibleDisplay.test.ts` — 12/12 ✅ (covers the
  presentation object this redesign renders, including the new
  `categoryIcon` field's dependencies)
- `lib/sparkNote/sparkCardDiversity.test.ts` — 6/8 ✅ (2 unrelated failures,
  see below)
- `components/companion/SparkNoteAnchor.test.tsx` — 2/2 ✅ (confirms the
  collapsed anchor still has no thumbnail, no teaser text, exactly one SVG,
  and no "badge"-named class — the frozen collapsed-state contract)

The 7 failing tests are **pre-existing and unrelated** to this visual
redesign — they live in files this change never touches
(`librarySelection.test.ts`, `selectionIntelligence.test.ts`, category-
rotation assertions inside `sparkCardDiversity.test.ts`, and
`sparkCardVisualDesignAndDailyGeneration.test.ts`'s action-count/compliance
checks). Confirmed via `tsc --noEmit`: the same pre-existing type errors
appear across dozens of unrelated files repo-wide (large in-progress branch),
with zero new errors in any file this redesign touched.

### Manual verify steps

1. `npm run dev`, open `/companion`, wait for the bottom-right Daily Spark
   anchor (gold/teal keepsake button).
2. Click it — expanded card should show: teal category badge (icon + label,
   upper-left), close (×), script "Today's Spark" kicker, serif title,
   italic subtitle, gold divider, framed illustration, drop-cap story,
   "Today's Spark" panel, rose/gold "Spark In Action" block, Tell Me More
   accordion (if the card has facts/reflection/related), script footer line,
   Save / Favorite / More (⋯ → Share, Print).
3. Click **Save** → confirmation screen ("Saved to your collection") →
   **View collection** → My Spark Collection modal (ornamented corners,
   category emoji per saved item, search/filter/sort unchanged).
4. Resize to mobile width (≤720px) — card narrows, panel grid stacks to one
   column, all text stays legible, Spark In Action still visible without
   scrolling past the fold on a typical phone height.
5. `Ctrl/Cmd+P` from the expanded card — print preview should hide backdrop,
   close button, action row, and the More popover, and force the Tell Me More
   panel open.
6. Keyboard: Tab to the anchor button, Enter to open; inside the card, Tab
   reaches Close, badge is not a tab stop (decorative), Escape closes the
   card; opening **More** and pressing Escape closes just the menu (not the
   whole card).
7. Test with a card that has no `imageSrc`/`thumbnailSrc` and no topic-art
   match — themed emblem fallback should render (never a blank illustration).

## Suggested commit message

```
style(spark-card): redesign Spark Card chrome to match approved treasure-card brief

- Rework SparkNoteExpanded/.css: gold-corner frame, deep-teal category
  badge, drop-cap story, grouped insight panels, prominent Spark in
  Action, script footer line, Save/Favorite visible + Share/Print in a
  discreet More menu, explicit accessible Close control.
- Enhance SparkNoteAnchor (collapsed) and SparkNoteMyCollection with
  matching ornamentation/category color cues without changing their
  tested structure or behavior.
- Add categoryIcon + resolveSparkCardFooterLine (additive, existing
  approved copy only) to sparkCardCollectibleDisplay/sparkCardDiversity.
- No changes to daily selection, persistence, or routing logic. All
  existing Spark Card content, actions, and saved state preserved.

Ref: docs/spark-card/SPARK_CARD_VISUAL_REDESIGN_PROMPT.md
```

(Not committed — per instructions, changes were left staged for review.)
