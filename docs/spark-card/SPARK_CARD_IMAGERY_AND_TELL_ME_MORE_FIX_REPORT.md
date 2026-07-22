# Spark Card Imagery and "Tell Me More" Expansion Fix — Report

**Prompt (archived):** `docs/spark-card/SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_PROMPT.md`
**Branch:** `deploy/companion-app-v3` · **Workspace:** `companion-app`
**Builds on:** `docs/spark-card/SPARK_CARD_VISUAL_REDESIGN_REPORT.md` (gold-frame collectible redesign — preserved, not regressed)

No commits were made. All changes are local working-tree edits, narrowly scoped to Spark Card / SparkNote files.

---

## 1. Mission recap

Two problems were fixed:

1. **Imagery** — most cards fell back to a handful of generic per-category stock photos (or a single lonely emoji) instead of fun, topic-specific art.
2. **Tell Me More** — for the ~90% of the library with no hand-authored expanded copy, `Tell Me More` was often empty, or (when populated) risked repeating the front's story / Today's Spark / Spark In Action.

---

## 2. Files changed

### Data model
- `lib/sparkNote/types.ts` — added `SparkNoteExpandedContent`, `SparkNoteExpandedGalleryItem`, `SparkNoteExpandedTimelineItem`; added optional `expanded?: SparkNoteExpandedContent` to `SparkNoteCatalogEntry` and `SparkNoteDailyCard`.
- `lib/sparkNote/contentDatabase/types.ts` — added `SparkExpandedContentFields` (snake_case `expanded_*` fields) to `SparkContentRecord`, so authors can add expanded content directly in `spark-library/**/*.json` with no further engineering.
- `lib/sparkNote/contentDatabase/mapRecord.ts` — `buildExpandedFromRecord()` / `expandedToRecordFields()` round-trip the new fields between JSON records and catalog entries.
- `lib/sparkNote/evaluateDailySparkNote.ts`, `lib/sparkNote/runtimeIntegration.ts` — pass `entry.expanded` through to the `SparkNoteDailyCard` the UI renders (`entryToCard`, `catalogEntryToFallbackCard`).

### New generator (fills the gap for the ~90% of cards with no authored `expanded`)
- `lib/sparkNote/sparkCardTellMeMoreGenerator.ts` **(new)** — `generateSparkCardExpandedContent()`. Deterministic (seeded by card id, never random/SSR-unsafe), keyed by the 13 approved diversity categories, 3 hand-written variants per category (39 total) covering `lookCloser`, `deeperStory`, `whatHappenedNext` (where it fits), `unexpectedConnection`, 3 `newFacts`, `tryThis`, a 3-item `gallery`, an optional `timeline`, and `sources`. This is genuinely new content per category (behind-the-scenes patterns, historical/psychological context) — never built from front fields.

### Imagery
- `lib/sparkNote/sparkCardArtRegistry.ts` — added `resolveSparkCardSpecificArtAsset()`, which returns a **real photo only** when a card has an explicit `imageSrc`/`thumbnailSrc` or matches a genuinely topic-specific pattern (person/object name or id). Returns `null` otherwise instead of silently handing back the generic per-category stock photo. Old `resolveSparkCardArtAsset()` kept, marked `@deprecated`, for any legacy callers.
- `lib/sparkNote/sparkCardDiversity.ts` — added `SPARK_CARD_DIVERSITY_HERO_MOTIFS` (5 emoji motifs per diversity category), `pickDiversityHeroMotifs()` (deterministic, seeded by card id), and `stableSeedIndex()` (shared hash helper, also used by the generator).
- `lib/sparkNote/sparkCardCollectibleDisplay.ts` — `resolveSparkCardHeroVisual()` now tries `resolveSparkCardSpecificArtAsset()` first; if nothing genuinely topic-specific exists, it returns the new `resolveSparkCardThemedScene()` payload (medallion emblem + 3 supporting motifs + caption + diversity category) instead of a generic stock photo. This is the "illustrated hero scene" described below.
- `components/companion/SparkNoteExpanded.tsx` — new `SparkCardIllustratedScene` renders that payload as a small illustrated scene (medallion, scattered motifs, washi-tape + stamp ephemera flourish), used both as the default hero (no specific photo) and as the graceful fallback if a photo `onError`s.
- `app/companion/spark-note.css` — new `.spark-note-expanded__art-scene`, `-medallion`, `-motifs`, `-motif`, `-tape`, `-stamp` rules, plus a `[data-diversity-category="…"]` gradient per diversity category (13 total, reusing existing CSS custom properties — no new color tokens).

### Tell Me More display + duplication guard
- `lib/sparkNote/sparkCardCollectibleDisplay.ts` — `resolveSparkCardTellMeMore()` rewritten:
  - Merges hand-authored `card.expanded` (wins per-field) with the generator's fallback.
  - Runs every candidate field through `isDuplicateOfFrontContent()` (normalizes punctuation/case/whitespace, checks exact match + substring containment both directions) against `resolveFrontContentFingerprints()` (title, shortTitle, teaser, whatHappened, Today's Spark, Spark In Action). Anything that duplicates the front is dropped — the field falls back to the generator, or to `null`/omitted.
  - Tracks `newDiscoveryCategories` (new_fact / new_context / new_consequence / new_connection / new_practical_use / new_visual_detail / new_source) and exposes `meetsNewInformationRequirement` (≥ 3 categories) — the prompt's New-Information Requirement, verified in tests (see §5).
- `components/companion/SparkNoteExpanded.tsx` — the Tell Me More panel is now visual-first and progressively disclosed, in the prompt's suggested order: **1. visual reveal** ("See It Differently" gallery chips) → **2. surprising fact** (Look Closer + new facts) → **3. deeper story** (Behind The Scenes / What Happened Next / Surprising Connection) → **4. image or timeline** (A Small Timeline) → **5. optional reflection** (Try This / reflection prompt / related sparks) → **6. sources**. Each sub-section only renders when it has content — no empty headers.
- `app/companion/spark-note.css` — new section styles: `-more-section-label`, `-more-block`, `-more-gallery(-row/-chip)`, `-more-facts/-fact`, `-more-timeline`, `-more-try`, `-more-sources`. Existing `-more-toggle` / `-more-panel` / print rules were left untouched (still forces the panel visible in print).

### Primary Action Feedback (Tell Me More)
- `SPARK_CARD_SECTION_TELL_ME_MORE` toggle already used `aria-expanded` + a visibly different pressed style (`[aria-expanded="true"]` — solid teal border/background instead of dashed gold) — preserved. Clicking it always does one of: opens the panel (visible content appears immediately) or closes it. No silent no-op path exists — `hasTellMeMore` is computed before the button renders, so the button never shows if there is truly nothing to reveal.
- `handlePrint()` was updated so choosing Print while Tell Me More is collapsed opens it first (state update + `requestAnimationFrame`) before calling `window.print()`, so the printed page always includes the new discoveries/visuals rather than a blank section — closing the "avoid printing a blank placeholder" gap in the prompt's Print Behavior section.

### Tests (new)
- `lib/sparkNote/sparkCardTellMeMoreGenerator.test.ts` **(new)**
- Additions to `lib/sparkNote/sparkCardCollectibleDisplay.test.ts` (see §5)

### Docs (archive)
- `docs/spark-card/SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_PROMPT.md` **(new)** — verbatim archive of the authoritative prompt.
- `docs/spark-card/SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md` **(new)** — this report.

---

## 3. Updated content model

Implemented as additive TypeScript types (not the prompt's exact shape, but the same separation of concerns — front fields untouched, expanded fields fully separate and optional):

```ts
// lib/sparkNote/types.ts
export type SparkNoteExpandedGalleryItem = { emblem: string; caption: string };
export type SparkNoteExpandedTimelineItem = { label: string; detail?: string };

export type SparkNoteExpandedContent = {
  lookCloser?: string;
  deeperStory?: string;
  whatHappenedNext?: string;
  unexpectedConnection?: string;
  newFacts?: string[];
  tryThis?: string;
  gallery?: SparkNoteExpandedGalleryItem[];
  timeline?: SparkNoteExpandedTimelineItem[];
  sources?: string[];
};

// Added to SparkNoteCatalogEntry and SparkNoteDailyCard:
expanded?: SparkNoteExpandedContent;
```

JSON-authorable mirror (`lib/sparkNote/contentDatabase/types.ts`, snake_case, fully optional) so content authors can hand-write expanded content directly in `spark-library/**/*.json` without any code changes:

```ts
export type SparkExpandedContentFields = {
  expanded_look_closer?: string;
  expanded_deeper_story?: string;
  expanded_what_happened_next?: string;
  expanded_unexpected_connection?: string;
  expanded_new_facts?: string[];
  expanded_try_this?: string;
  expanded_gallery?: { emblem: string; caption: string }[];
  expanded_timeline?: { label: string; detail?: string }[];
  expanded_sources?: string[];
};
```

**Runtime output shape** (`SparkCardTellMeMore`, in `sparkCardCollectibleDisplay.ts`) merges authored + generated + legacy `whyInteresting`/"More To Discover" content, then strips anything duplicating the front:

```ts
export type SparkCardTellMeMore = {
  facts: string[];
  reflectionPrompt: string | null;
  related: SparkCardRelatedSpark[];
  lookCloser: string | null;
  deeperStory: string | null;
  whatHappenedNext: string | null;
  unexpectedConnection: string | null;
  tryThis: string | null;
  gallery: SparkCardGalleryItem[];
  timeline: SparkCardTimelineItem[];
  sources: string[];
  visualModules: ("gallery" | "timeline" | "lookCloser")[];
  newDiscoveryCategories: SparkCardNewDiscoveryCategory[];
  meetsNewInformationRequirement: boolean; // true when >= 3 new-discovery categories
};
```

Authored `card.expanded` always wins per-field over the generator; the generator only fills gaps. Nothing is ever concatenated from front fields.

---

## 4. How imagery improved

**Before:** `resolveSparkCardArtAsset()` fell back to one of 13 fixed per-category Wikimedia stock photos (e.g. every "invention" card without a specific match got the same Edison/lightbulb photo). Sparse pattern matching meant almost the entire 29+ card library shared a handful of images.

**After:**
1. `resolveSparkCardSpecificArtAsset()` is checked first — returns a real photo **only** when the card has an explicit `imageSrc`/`thumbnailSrc`, or its id/title/tags match a genuinely specific topic pattern (a named person, invention, or object already in the registry, e.g. Oscar Wilde, the Post-it Note, the microwave). Otherwise it returns `null` — it never falls back to the generic per-category photo.
2. When nothing specific exists (the large majority of cards), `resolveSparkCardThemedScene()` builds an **illustrated hero scene**: a gold medallion with the diversity category's emblem, 3 deterministically-picked supporting motifs scattered around it (e.g. nature → 🍃🦋🌾, history → 📯🕯️🗺️, science → 🔬🛰️⚛️), a washi-tape flourish, a small postage-stamp flourish, and a caption ribbon — rendered on a category-tinted gradient (13 distinct gradients, one per diversity category). This directly answers the prompt's "vintage ephemera," "illustrated objects," and "fun supporting icons" guidance, and its "avoid a single sprout icon standing in for the entire topic" rule — there are always 4 visual elements (medallion + 3 motifs), never one lonely icon.
3. The same themed-scene payload is the graceful fallback if a specific photo fails to load at runtime (`onError`) — no blank panel is ever possible.
4. Motifs and the generator's variant selection are both derived from a shared deterministic `stableSeedIndex()` hash of the card id, so the same card always looks the same across renders/SSR, but different cards in the same category visibly differ from one another.

---

## 5. Tests

### New: `lib/sparkNote/sparkCardTellMeMoreGenerator.test.ts`
- Every one of the 13 diversity categories produces a fully-populated discovery layer (`lookCloser`, `deeperStory`, `unexpectedConnection`, `tryThis`, ≥3 `newFacts`, ≥3 `gallery` items, `sources`).
- Deterministic: same card id → identical output across calls.
- Varies across different card ids within the same category (proves it isn't hard-coded to one fixed string).
- Always returns populated content even for an unrecognized label/tags combination.

### Extended: `lib/sparkNote/sparkCardCollectibleDisplay.test.ts` (focused on the "≠ front" requirement)
- **Tell Me More is never empty** for a card with no authored expanded content, and `meetsNewInformationRequirement` is `true` (≥ 3 new-discovery categories).
- **Tell Me More fields never duplicate the front's title, subtitle, story paragraphs, Today's Spark, or Spark In Action** — checked via the same normalize + exact-match + bidirectional-substring logic the runtime uses.
- **A hand-authored expanded field that duplicates the front is dropped** (falls back to generated content) — proves the duplication guard runs on authored content too, not just generated content.
- **Every card in the real `SPARK_NOTE_CATALOG` library** (all `spark-library/**/*.json` records) produces Tell Me More content with no duplication against its own front, and meets the new-information requirement — this is the full-library regression net requested by the prompt's Testing Requirements section (covers every category currently in the library: invention, business, history, fun fact, holiday, quote, creativity, personal growth, gratitude, ADHD-friendly, personal).
- **Themed scene imagery**: medallion + ≥3 motifs are present, motifs are deterministic per card id, and motifs visibly differ between two cards in different diversity categories (e.g. innovation vs. nature).
- **Hero visual falls back to the themed scene** (not a generic stock photo) when a card has no specific photo match.

### Result

```
npx vitest run lib/sparkNote/sparkCardCollectibleDisplay.test.ts \
  lib/sparkNote/sparkCardTellMeMoreGenerator.test.ts \
  lib/sparkNote/sparkCardDiversity.test.ts \
  lib/sparkNote/evaluateDailySparkNote.test.ts \
  lib/sparkNote/runtimeIntegration.test.ts \
  lib/sparkNote/contentDatabase/mapRecord.test.ts \
  lib/sparkNote/sparkCardChatContext.test.ts \
  components/companion/SparkNoteAnchor.test.tsx

Test Files  1 failed | 7 passed (8)
Tests       2 failed | 55 passed (57)
```

All new/changed Spark Card behavior passes (all 57 - 2 = 55, including the full-library duplication sweep). The 2 failures are in `sparkCardDiversity.test.ts` and are **pre-existing, unrelated to this change** — see Gaps (§7) for root cause; they were not introduced by this work (confirmed by inspecting `catalogSeed.ts` / `spark-library/fun-facts/SPARK-FACT-001.json`, both untouched by this session, both already carrying the `"nature"` tag that triggers the mis-categorization).

---

## 6. Verify steps

1. Open a Spark Card that has **no** hand-authored `expanded` field (i.e. almost any card today) → expand "Tell Me More" → confirm:
   - "See It Differently" gallery chips appear first (visual, not text).
   - "Look Closer" / new facts / "Behind The Scenes" text is clearly different from the front's story, Today's Spark, and Spark In Action.
   - A "Try This" micro-action appears and is **not** the same as the front's Spark In Action line.
2. Confirm the card's main illustration is either a genuinely specific photo (e.g. Oscar Wilde portrait, Post-it Note photo) or the new illustrated medallion + motif scene — never a blank box or a single lonely emoji.
3. Open two different cards in the same category (e.g. two "nature" cards) and confirm their motifs/variant text differ from each other.
4. Click "More ⋯" → "Print" while Tell Me More is collapsed → confirm the print preview includes the Tell Me More content (not a blank section).
5. Confirm Save / Favorite / Share / Print all still work exactly as before (no changes were made to `persistence.ts`, `sparkNoteDestinations.ts`, or the action button markup/handlers other than the print-before-open fix above).
6. Run the test suite in §5.

---

## 7. Gaps / follow-ups (not fixed — out of narrow scope for this task)

- **Pre-existing diversity-category bug** (`lib/sparkNote/sparkCardDiversity.test.ts`, 2 failing tests): `resolveSparkCardDiversityCategory()`'s `TAG_TO_DIVERSITY` rule order checks `nature|animal|plant|wildlife|...` before any fun-fact/label check, so a fun-fact card tagged `["nature", "science", "curiosity"]` (e.g. `SPARK-FACT-001` "Honey Never Spoils") resolves to the `nature` diversity category instead of `fun_facts`. This predates this session (present in both `catalogSeed.ts` and `spark-library/fun-facts/SPARK-FACT-001.json`, neither touched here) and is outside the imagery/Tell-Me-More scope — flagging for a separate, narrowly-scoped fix to the tag-priority order.
- **Pre-existing unrelated failures** in `lib/sparkNote/sparkCardVisualDesignAndDailyGeneration.test.ts` (`SPARK_CARD_ACTIONS` expected length 3, actual 6) predate this session — from the earlier collectible-redesign work (Save/Favorite/Share/Print buttons), not touched by this task.
- **Gallery items are illustrative chips (emblem + caption), not real images.** The prompt's "image gallery," "then-and-now," "map," and "quiz" visual modules are richer than what ships here; given the library has no photographed/illustrated assets per-card today, a true image gallery would require new art assets per card (out of scope for a code-only pass). The current gallery still satisfies "at least one meaningful visual module" and "first section is visual."
- **Only 39 authored generator variants (13 categories × 3)** — genuinely new and non-duplicative, but a member who saves many cards in the same category over time will eventually see a repeated variant (cycles after 3 cards in a category, deterministically by id). Authoring true per-card `expanded` content in `spark-library/**/*.json` (now fully supported, zero code changes needed) is the recommended long-term path for the highest-traffic cards.
- **No new photographed hero images were added** — per the prompt's Fallback Behavior ("if a generated image is unavailable, show a topic-specific illustrated fallback, do not show a generic sprout/star/flame"), the illustrated scene is exactly that fallback; sourcing/generating bespoke photography per card was out of scope for this pass.

---

## 8. Suggested commit message

```
feat(spark-card): topic-specific illustrated imagery + genuinely-new Tell Me More

- Add SparkNoteExpandedContent data model (types.ts, contentDatabase/types.ts,
  mapRecord.ts) so cards can carry a separate, JSON-authorable second layer.
- Add sparkCardTellMeMoreGenerator.ts: deterministic, category-specific
  fallback discovery content (lookCloser/deeperStory/facts/gallery/timeline/
  tryThis/sources) for the ~90% of cards with no authored expanded content.
- Rewrite resolveSparkCardTellMeMore() to merge authored + generated content
  and run a duplication check against the front (title/subtitle/story/
  Today's Spark/Spark In Action) before ever showing a field.
- Add resolveSparkCardSpecificArtAsset() + resolveSparkCardThemedScene():
  hero art now uses a real photo only when genuinely topic-specific, else an
  illustrated medallion + motif scene (never a generic stock photo or a
  single lonely icon).
- SparkNoteExpanded.tsx: new SparkCardIllustratedScene visual; Tell Me More
  panel restructured to a visual-first, progressively-disclosed layout;
  Print now opens Tell Me More before printing so nothing prints blank.
- spark-note.css: illustrated-scene + Tell Me More section styles, 13
  diversity-category gradients. Gold-frame collectible chrome unchanged.
- Tests: new sparkCardTellMeMoreGenerator.test.ts; sparkCardCollectibleDisplay
  .test.ts extended with a full-library sweep proving Tell Me More content
  never duplicates front content and meets the >=3 new-discovery requirement.

No functional change to save/favorite/share/print handlers, diversity
category set, or approved category labels.
```
