# Spark Card — Authority Record

| Field | Value |
|-------|-------|
| **Type** | Authority record (decisions only — not a redesign, not a specification) |
| **Scope** | The Spark Card / Spark Note subject |
| **Sits under** | Companion Constitution v1 → subject authorities, per [`docs/constitution/README.md`](../constitution/README.md) (Product Authority Hierarchy) |
| **Confirmed system size** | **112 cards** (one library; the `spark-library/` JSON + `manifest.json` are *generated* from the seed — not a second set; the "225" figure was a double-count) |

## Authority Scope

This document records the authoritative ownership of the Spark Card system.

- It does not redefine product behavior.
- It does not replace implementation specifications.
- It does not replace engineering documentation.

Its purpose is to identify:

- **Primary Authority**
- **Supporting Authorities**
- **Historical References**
- **Current System of Record**
- **Remaining Product Decisions**

Where a genuine product choice is still open, it is listed under **Remaining Product Decisions** rather than decided here.

---

## Primary Authority

- **[`docs/SPARK_CARD_FRAMEWORK.md`](../SPARK_CARD_FRAMEWORK.md)** (T-011) — what a Spark Card *is*: purpose and principles. Highest Spark Card authority beneath the Companion Constitution.
- **System-of-record (behavior):** the live code `lib/sparkNote/`, indexed by [`docs/protocols/SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md`](../protocols/SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md) (Implemented v1). The code is authoritative for actual behavior.

## Supporting Authorities

- **Content standard:** [`SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md`](../protocols/SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md)
- **Daily engine spec:** [`SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md`](../protocols/SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md)
- **Selection rules:** [`SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md`](../protocols/SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md)
- **Diversity rule:** [`docs/platform/SPARK_CARD_CONTENT_DIVERSITY_RULE.md`](../platform/SPARK_CARD_CONTENT_DIVERSITY_RULE.md)
- **Visual (current):** [`SPARK_CARD_VISUAL_REDESIGN_REPORT.md`](./SPARK_CARD_VISUAL_REDESIGN_REPORT.md) — the implemented gold-frame collectible design
- **Interaction (current):** [`SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md`](./SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md) — front-curiosity / "Tell Me More" second layer
- **Editorial (proposal layer):** the *Master Taxonomy & Pilot* and *Five Full Prototypes* workbooks — editorial standards, scoring model, writing-voice exemplars, and candidate content. They inform authoring; they do **not** replace the live taxonomy or create a second card system.

## Implementation Reference

- [`SPARK_CARD_VISUAL_REDESIGN_PROMPT.md`](./SPARK_CARD_VISUAL_REDESIGN_PROMPT.md) and [`SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_PROMPT.md`](./SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_PROMPT.md) — the build prompts, now realized in the reports and code above. Kept as build lineage, not authority.

## Historical References

- [`SPARK_CARDS_REDESIGN_SIMPLIFICATION_PROMPT.md`](./SPARK_CARDS_REDESIGN_SIMPLIFICATION_PROMPT.md) and [`docs/platform/spark-cards-redesign-cursor-prompt.md`](../platform/spark-cards-redesign-cursor-prompt.md) — older redesign prompt; **not** current authority.
- *First 90-Card Expansion Plan* — editorial reference only (per the Phase-5a lock).
- `spark-notes-files/` — historical mirror / archive dump; not the live docs tree.

## Current System of Record

The live code `lib/sparkNote/` is the system of record for actual Spark Card behavior. Canonical content = `catalogSeed.ts` (112) → generated `spark-library/manifest.json` (**runtime reads the manifest**; seed is fallback). Persistence key `companion-spark-note-v1`. One reusable card component across full / collapsed / saved / daily / mobile / print. No parallel card system exists; none should be created.

## Daily Engine authority

`evaluateDailySparkNote.ts`, governed by the Daily Engine spec + Selection Intelligence rules above. Order: day-key pin (one card/day) → personal moment → date/holiday → seasonal → curated library. Cooldown 45 days; last 12 ids avoided; category-affinity preference learning. **Do not add a second selection engine** — new selection logic composes here.

## Visual authority

The **implemented gold-frame collectible** (`sparkCardCollectibleDisplay.ts` + the Visual Redesign Report) is the visual authority: warm parchment, gold frame, storybook illustration, collectible feel; preserve all content; one adaptable component. The gamified "Explorers"/XP/quest character-sheet image is **explicitly not** Spark Card visual authority (it conflicts with the Companion Constitution's no-streaks / no-gamification principles).

## Interaction authority

The **front-curiosity / "Tell Me More" second-layer** model (`sparkCardTellMeMoreGenerator.ts` + the Imagery/Tell-Me-More Report): the front creates curiosity; "Tell Me More" reveals genuinely new facts, visuals, and connections (never a longer restatement); progressive disclosure; expansion is always optional.

## Taxonomy mapping strategy

- **Keep the runtime enum `SparkNoteCategory` as the stable internal key.** Never rename it — personalization (`categoryAffinity`, `ignoredCategories`) depends on it.
- **Consolidate to one member-facing display taxonomy** and add a mapping table (internal enum → display category → workbook category). Retire the free-text `category` label and the duplicate "master labels" list as *display* sources.
- **The workbook's 12 categories are an editorial lens mapped in — not a data migration** and not a replacement.

## Remaining Product Decisions

*(Open — pending Shari; not decided here.)*

1. **Canonical member-facing taxonomy** — choose the display set (diversity ribbons, the workbook's 12, or a reconciled set); the internal enum stays fixed regardless.
2. **Approved Spark Card reference image** — supply/confirm the real design (the current "Explorers" image is not it).

## Related Authorities

**Depends on:**
- Companion Constitution v1 — product-principle apex
- Product Authority Hierarchy — [`docs/constitution/README.md`](../constitution/README.md)

**Related subject authorities:**
- [Visual Thinking Studio Authority](../visual-thinking/VISUAL_THINKING_STUDIO_AUTHORITY.md)
- Welcome Home / Resident Journey authorities — [`FIRST_60_DAYS_WELCOME_EXPERIENCE.md`](../estate/FIRST_60_DAYS_WELCOME_EXPERIENCE.md) · [`126 First-Time Welcome`](../product-specifications/126_FIRST_TIME_WELCOME_EXPERIENCE_STANDARD.md)
- Estate Place authorities (where applicable) — [`ESTATE_ARCHITECTURAL_AUTHORITY.md`](../estate/ESTATE_ARCHITECTURAL_AUTHORITY.md) · [`ESTATE_PLACE_MASTER_MANIFEST.json`](../estate/ESTATE_PLACE_MASTER_MANIFEST.json) · [`ESTATE_REGISTRY.md`](../estate/ESTATE_REGISTRY.md)

**If guidance conflicts:**

Companion Constitution → Product Authority Hierarchy → This Authority → Engineering Standards → Implementation.

---

*This is a decision record. It records authority and does not modify code, content, taxonomy records, or behavior. Open product choices remain with Shari.*
