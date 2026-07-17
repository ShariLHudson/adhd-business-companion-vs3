# 149–151 — Create End-to-End Workflow (Live Results)

**Status:** `unit_verified` · authenticated preview **Pending**  
**Do not deploy production** until `150_CREATE_OPTION_WORKFLOW_AUDIT_CHECKLIST.md` passes.

## Root cause

Create entrance still used the three-choice Browse / Start With What I Need path and a flat launcher list that skipped catalog label resolution. `CreateCatalogPicker` already existed but was orphaned. Unavailable/routed items could appear without a Create workflow.

## What shipped

- Entrance: **What Do You Want to Create?** (categorized alphabetical picker, collapsed by default) + **Continue a Saved Creation**
- Removed Browse Things I Can Create / Start With What I Need choice cards
- Active-type filter (`listActiveCreationPickerCatalog`) hides routed/unavailable items
- Selection → `resolveCreateLauncherType` → `startFreshCreateFromEstate`
- Existing guided discovery / draft library / ContentGenerator save-resume-print path reused

## Owners

| Concern | Owner |
|---------|--------|
| Creation type registry | `lib/createCatalogData.ts` + `lib/createEstate/activeCreationTypes.ts` |
| Picker | `CreateCatalogPicker` + `CreateEstateEntrancePanel` |
| Workflow routing | CPC `startFreshCreateFromEstate` / `openCreateWorkspace` |
| Prompt sequence | `lib/createWorkflow.ts` (`DISCOVERY_BY_TYPE`) |
| Draft / save / resume | `lib/createDraftLibrary.ts` + ContentGenerator |
| Review / approval / print | ContentGeneratorPanel + createWorkflow gates |

## Automated tests

50 tests in Create/Board packages suite including createEstate + activeCreationTypes — **passed**

## Limitations

- Per-type prompt depth still varies (Lead Magnet richest; others use discovery sequences / defaults)
- Full section edit/reorder/regenerate UX remains in ContentGenerator — not rebuilt in this package
- Authenticated click-every-option audit still required
