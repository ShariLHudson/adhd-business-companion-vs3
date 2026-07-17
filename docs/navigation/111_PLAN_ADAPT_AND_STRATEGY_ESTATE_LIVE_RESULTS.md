# 111 — Plan/Adapt + Strategy Estate Live Results

**Status:** Implementation complete · Preview pending authenticated checklist  
**Production:** Do not deploy until authenticated preview verification passes

## Owners

| Concern | Owner |
|--------|--------|
| Plan/Adapt shared window | `components/companion/PlanAdaptSharedWindow.tsx` |
| Side-by-side card layout | `PlanAdaptSharedWindow` (`md:grid-cols-2`) + `lib/myDaySharedWindows/copy.ts` |
| Active Plan/Adapt selection | `activeChild` state in `PlanAdaptSharedWindow` |
| Plan/Adapt How Do I… | `SharedHowDoI` in `PlanAdaptSharedWindow` |
| Shared scroll | `PlanMyDayMorningRoomShell` scrollport |
| Strategy Library route | `openStrategyLibraryCore` → `openStandaloneFocusSectionCore("playbook")` |
| Strategy Library view shell | `StrategyLibraryEstatePanel` + `StrategyLibraryRoomShell` |
| Strategy modes / store | Existing `StrategiesPanel` + strategy libs (unchanged engine) |
| Strategy cards | `StrategiesPanel` home list (estate presentation sizes) |
| Shari integration | Estate conversation (`setEstateRoomChatVisible`) — not split workspace |
| Daily Spark hide | `showSparkNoteChrome` gated off when `activeSection === "playbook"` |

## Removed / retired from Strategy Library entry

- Split chat/workspace layout on open
- WorkspaceShell + focus toolbar around playbook
- Auto `setCoachingMode("playbook")` discovery seed on library open
- Bottom-corner Daily Spark while Strategy Library is open

## Automated tests

- `lib/myDaySharedWindows/sharedMyDayWindows.test.ts`
- `lib/strategyLibrary/strategyLibraryEstate.test.ts`
- `lib/estate/estateFullBleedPanelSections.test.ts`

## Preview

- Preview commit: `572dd6e5`
- Authenticated preview URL: https://adhd-business-companion-vs3-o2ooq9obm-shari-hudsons-projects.vercel.app
- Inspector: https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/7UhzDNNYqHewtJb5FUZ9nvV1ygJp
- Overall: **unit_verified** · live authenticated **Pending** (`111` checklist)

## Authenticated checklist

See `111_PLAN_ADAPT_AND_STRATEGY_ESTATE_LIVE_CHECKLIST.md` — still required on preview.

## Deploy recommendation

**Do not deploy production** until preview checklist is signed off.
