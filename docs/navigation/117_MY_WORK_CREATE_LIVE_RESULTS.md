# Live Results — Add Create to My Work (116–118)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

**Preview:** https://adhd-business-companion-vs3-dyjx1a8bz-shari-hudsons-projects.vercel.app  
**Commit:** `64114b6c`

## Decision (118)

Create is first under My Work. Create makes output; Projects organize work. Strategy Library stays under Get Advice — browse Strategy from Create routes into Strategy Library create mode, not a second engine.

## Owners after fix

| Concern | Owner |
|---------|--------|
| My Work order (Create first) | `lib/estate/welcomeHomeNavigationStructure.ts` |
| Menu → Create opener | `EstateRoomExperienceMenu` `create: onOpenCreateStudio` |
| Open Create estate | `openCreateEstateCore()` → `openStandaloneFocusSectionCore("create")` |
| Fresh entry (no stale resume) | `EMPTY_CREATE_WORKFLOW` before open; Universal Create via `hard_nav` after choice |
| Estate entrance UI | `CreateEstateEntrancePanel` + `CreateEstateRoomShell` |
| Copy / How Do I / vs Projects | `lib/createEstate/copy.ts` |
| Full-bleed section | `ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS` includes `"create"` |
| Daily Spark hidden while open | `showSparkNoteChrome` excludes `activeSection === "create"` |
| Strategy browse | `openStrategyLibraryCore({ openView: "business" })` |
| Continue saved | `CreateDraftResumeList` → `openCreateDraftFromLibrary` (split, not hard wipe) |

## Automated tests

- `lib/createEstate/createEstateDestination.test.ts`
- `lib/estate/createWorkStudioSubmenu.test.tsx`
- `lib/estate/welcomeHomeNavigationStructure.test.ts`
- `lib/estate/estateFullBleedPanelSections.test.ts`
- `lib/estate/sparkEstateTopNavigationAndProfileMenu.test.ts` (My Work ids)

## Authenticated preview (117)

Pending — run `docs/navigation/117_MY_WORK_CREATE_LIVE_CHECKLIST.md` on preview after deploy.
