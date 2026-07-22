# How Spark Estate Works Together — Implementation Report

| Field | Value |
|-------|-------|
| **Date** | 2026-07-21 |
| **Branch** | deploy/companion-app-v3 |
| **Status** | Shipped (narrow paths) |

## Summary

Added a shared estate orientation experience that teaches one mental model instead of feature training: one business, many helpful perspectives, quietly connected. Frosted panel + optional Shari-led in-panel Estate Tour. Wired into How Do I (onboarding + Help), WorkspaceAreaWorksGuide, and major destination help surfaces.

## Files

### New

- `lib/estateOrientation/types.ts`
- `lib/estateOrientation/howSparkEstateWorksTogether.ts`
- `lib/estateOrientation/roomOrientationMap.ts`
- `lib/estateOrientation/openOrientation.ts`
- `lib/estateOrientation/index.ts`
- `lib/estateOrientation/howSparkEstateWorksTogether.test.ts`
- `components/companion/HowSparkEstateWorksTogetherPanel.tsx`
- `components/companion/HowSparkEstateWorksTogetherPanel.test.tsx`
- `components/companion/HowThisFitsTogetherLink.tsx`
- `components/companion/EstateOrientationHost.tsx`
- `app/companion/how-spark-estate-works-together.css`
- `docs/estate/HOW_SPARK_ESTATE_WORKS_TOGETHER.md`
- `docs/estate/HOW_SPARK_ESTATE_WORKS_TOGETHER_REPORT.md`

### Wired

- `components/companion/CompanionPageLoader.tsx` — host mount
- `components/companion/WorkspaceAreaWorksGuide.tsx` — What / Why / Connect + link
- `lib/howDoIHelpArticles.ts` — How Everything Works Together article
- `lib/howDoIHelpBrowseStructure.ts` — New User + Companion Features
- `components/companion/HowDoIWorkflowCard.tsx` — opens orientation panel
- Create, Cartography, Chamber, Strategies, Board (via guide), Business Pulse, Evidence, Wins (collection), Hall

## Tour status

**In-panel Estate Tour complete** — Walk with me / Stay / Not now. Does **not** force room navigation (safer Spec 108 path). Soft `estatePlaceHint` values reserved for a future walk-with-navigation if desired.

## Deferred

- Forced room-switch tour via estate navigation (intentionally avoided)
- Dedicated Experience Controls Learning row (How Do I is the Help/Learning surface)
- Separate phase-1 conversation onboarding card outside How Do I (article lives in New? Start Here)

## Tests

- `lib/estateOrientation/howSparkEstateWorksTogether.test.ts`
- `components/companion/HowSparkEstateWorksTogetherPanel.test.tsx`
