# Live Results — Spark Estate Guide Menu Move (100–102)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

## Owners

| Concern | Owner |
|---------|--------|
| Welcome Home menu | `lib/estate/welcomeHomeNavigationStructure.ts` + `EstateRoomExperienceMenu.tsx` |
| Spark Estate submenu | category id `spark-estate` (last) |
| Spark Estate Guide route | `openSparkEstateGuideCore` → `SparkEstateGuideChrome` / lazy `EstateGuideFlipbook` |
| Wander the Grounds route | `onExploreSpark` → `openExploreSparkVisualExplorer` |
| Removed bottom-corner entry | `SparkEstateGuideAnchor` no longer rendered by `SparkEstateGuideChrome` |
| Mount / lazy-load | Chrome mounts only when `estateGuideFlipbookOpen`; flipbook remains `lazy()` |

## State flags

- `estateGuideFlipbookOpen` — sole open flag (defaults false; closed on Welcome Home arrival)
- `showSparkEstateGuideChrome` — true only while open (and not sign-in / Just Be Here)
- `showSparkNoteChrome` — independent of guide launcher

## Automated

| Suite | Result |
|-------|--------|
| `sparkEstateGuideMenuMove.test.ts` | PASS |
| `sparkEstateGuideLazyLoad.contract.test.ts` | PASS |
| Welcome Home structure / focused submenu / top-nav | PASS |

## Preview

- Preview commit: `6286c6f8`
- Authenticated preview URL: https://adhd-business-companion-vs3-c3j0a9qp8-shari-hudsons-projects.vercel.app
- Inspector: https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/GtvcXmEXa4fgHonzh8VDPkvLrN97
- Overall: **unit_verified** · live authenticated **Pending** (`101` checklist)
- Deploy recommendation: **Do not deploy production**
