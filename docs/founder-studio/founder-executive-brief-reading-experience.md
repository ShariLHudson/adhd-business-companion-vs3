# Founder Executive Brief — Reading Experience

**Date:** 2026-07-23  
**Entry:** `/companion/founder` → `FounderHome` → `FounderExecutiveOffice` → `FireExecutiveBriefReadingExperience`  
**Daily id:** `fire-YYYY-MM-DD` (unchanged)

## Current-state problems (addressed)

- Report text too small and easy to miss among Mission / Concierge dashboards  
- Page read like a dense analytics collection  
- Complete detailed briefing not clearly available as a coherent report  
- Internal cramped scroll feeling; nested scroll traps  
- Technical “sample adapter” language in the title area  

## Information architecture

1. **Morning opening** — greeting + “Today’s Executive Intelligence Brief”  
2. **Dominant daily brief** — full title with date, status, reading time, prepared time, gentle provenance  
3. **Primary controls** — Read Full Executive Brief · Executive Overview · Open Founder Actions · Open Izna Work Package · Expand All · Collapse All · Text Size · Reading Mode  
4. **Executive Overview** — developments, alerts, top priority, opportunity, product/dev recommendation, Izna priority, comparison when available  
5. **Full Brief** — all 16 accordion sections, color-guided  
6. **Secondary office tools** — Mission, FLAME, Concierge, workspace cards **below** the brief (hidden in Reading Mode)

## Executive Overview versus Full Brief

| Layer | Role |
|---|---|
| Executive Overview | Fast morning summary — what needs attention |
| Full Brief | Every complete report section; Expand All remains usable |
| Reading Mode | Same route; secondary dashboards minimized; centered reading column; Exit Reading Mode restores position |

## Typography scale (Default)

| Role | Size |
|---|---|
| Report title | 42px (Larger → 44px) |
| Greeting | ~30–34px |
| Brief kicker | ~24–30px |
| Date | 28px |
| Section title | 30px |
| Subheading | 25px |
| Body | 23px (Smaller floor 22px; Larger ~26px+) |
| Buttons | 23px |
| Supporting labels | 19–20px |
| Line height | ~1.55 · measure ~72ch |

**Text Size:** Smaller (0.96×, body ≥22px) · Default · Larger (1.14×)  
Persisted: `spark-estate:founder-fire-reading-size`

## Color mapping

Deep teal · aqua · lavender · navy · bronze · blue-gray · muted coral · gold · blue-green · plum · forest · warm rose · slate blue · warm amber · charcoal — left borders, pale header tints, icons, badges.

## Schema changes (backward compatible)

Optional on `FireExecutivePortfolio`:

- `executiveBriefDetail` — complete 16-section tree  
- `preparedAt` — ISO when first composed  

Detail overview additions: `topPriority`, `highestOpportunity`, `productOrDevelopmentRecommendation`, `comparisonNote`, `memberFacingProvenance`, `preparedAtDisplay`.

Legacy local records without these fields still validate; detail is resolved on read via `buildExecutiveBriefDetail`.

## How existing FounderHome content was retained

Mission Workspace, FLAME, Concierge agenda/reminders/suggestions, and Founder workspace cards remain in `founder-home__secondary` **below** the brief. They are not deleted. Reading Mode hides them temporarily without leaving `/companion/founder`.

## Accessibility

Keyboard accordions (Enter/Space) · `aria-expanded` / `aria-controls` · labeled text-size group · visible focus · no fixed-height truncation · page scroll (not nested report scroll) · color never sole indicator · Reading Mode does not trap focus (Exit control receives focus; exit restores scroll).

## Sample / bridged limitations

Visible copy: *“Prepared from the intelligence currently available in your Founder Workspace.”*  
Internal provenance remains `bridged_adapters`. Status stays `draft`. This is **not** a live overnight SPARK→FIRE company report.

## What remains for the real overnight engine

Live company-state generation · scheduler · PDF/email/Drive · cloud archive · Listen · Send to Izna · Turn Into Project integration  

## Related code

- `lib/founder/types/fireBriefDetail.ts`  
- `lib/founder/briefs/buildExecutiveBriefDetail.ts`  
- `lib/founder/briefs/composeTodayFirePortfolio.ts`  
- `lib/founder/briefs/firePortfolioStorage.ts`  
- `components/founderStudio/FounderExecutiveOffice.tsx`  
- `components/founderStudio/fire/FireExecutiveBriefReadingExperience.tsx`  
- `app/companion/founder/fire-executive-brief-reading.css`  
