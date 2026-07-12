# 058A — My Business Estate Live Path Audit

Repository: `spark-ecosystem-v4/companion-app`  
Branch: `deploy/companion-app-v3`  
Date: 2026-07-11

## Executive Summary

My Business Estate is **substantially built** (commit `8fb488f` and prior). The primary visible failure reported in preview was **Profile submenu clicks not firing** — fixed in uncommitted `GlobalEstateMenu` work (`closeAndRun`: action before close, mousedown outside-dismiss). This audit traces the full live path and lists remaining spec gaps closed in this cycle.

## Live Click Path

```text
SH trigger (GlobalEstateMenu)
  → expand Profile (EstateDropdownMenuCategoryRow)
  → My Business Estate row (EstateDropdownMenuActionRow, id: my-profile)
  → closeAndRun("my-profile")
  → handleEstateMenuAction (CompanionPageClient.tsx)
  → openProfileDestinationCore("my-business-estate")
  → setOverlay("profile")
  → estateProfilePrimary === true
  → resolveSparkEstateShellPlaceId → null (my-estate uses dedicated panel)
  → <MyBusinessEstatePanel onClose={goBack} />
  → companion-business-profile-v1 envelope (lib/profile/businessEstateProfile.ts)
  → saveBusinessEstateSection on Save
```

People I Help parallel path: `people-i-help` → `setOverlay("people-i-help")` → `<PeopleIHelpPanel />`.

## Root Cause — Button Did Not Open

| Layer | Finding |
|-------|---------|
| Menu handler | `run()` called `close()` before `onAction()`, unmounting nested rows during the same click |
| Outside dismiss | Document `click` listener raced with menu item unmount |
| Fix | `closeAndRun`: `onAction` first; mousedown outside; `stopPropagation` on row pointer events |

Routing and panel mount were already correct once `setOverlay("profile")` fired.

## Components

| Role | File | Status |
|------|------|--------|
| SH menu | `components/companion/GlobalEstateMenu.tsx` | Active — collapsible Profile group |
| Menu primitives | `components/companion/estate/EstateDropdownMenuPrimitives.tsx` | Shared with Welcome Home row styling |
| Chrome mount | `components/companion/estate/EstateTopRightChrome.tsx` | Portal to `document.body` |
| Action router | `app/companion/CompanionPageClient.tsx` | `handleEstateMenuAction`, overlay mount |
| Overview panel | `components/companion/MyBusinessEstatePanel.tsx` | Six sections + snapshot |
| Section editor | `components/companion/business-estate/BusinessEstateSectionEditor.tsx` | View / edit / save / cancel |
| Room shell | `components/companion/MyBusinessEstateRoomShell.tsx` | Estate background plate |
| Field schema | `lib/profile/businessEstateSectionFields.ts` | All six sections |
| Storage | `lib/profile/businessEstateProfile.ts` | `companion-business-profile-v1` envelope |
| Safe snapshot | `lib/profile/businessSnapshot.ts` | Approved fields only |

## Duplicate / Unused (do not revive)

| Item | Notes |
|------|-------|
| `ProfilePanel.tsx` | Orphan — not SH Profile destination |
| `BusinessProfilePanel` wizard | Legacy; not Profile dropdown target |
| `My Estate` chat shell | Replaced by `MyBusinessEstatePanel` for `overlay === "profile"` |
| `Growth Profile` | Not in Profile dropdown |

## Destination Keys

| UI label | Menu action id | Overlay / resolver |
|----------|----------------|-------------------|
| My Business Estate | `my-profile` | `openProfileDestinationCore("my-business-estate")` → `overlay: "profile"` |
| People I Help | `people-i-help` | `openProfileDestinationCore("people-i-help")` → `overlay: "people-i-help"` |

## Storage

- Key: `companion-business-profile-v1` (localStorage)
- Envelope: `{ estate: { version, sections, approval, sectionUpdatedAt } }`
- Legacy `role` / `sells` / `goals` synced only from **approved** fields
- Conversational imports flagged via `looksLikeConversationalImport()` — excluded from Business Snapshot until user saves

## Snapshot Mapping

Approved paths only (`lib/profile/businessSnapshot.ts`):

- Business name → `identity.businessName`
- What business does → `identity.shortDescription` or `identity.roleTitle`
- Main offer → `offers.mainOffer`
- Current priority → `direction.currentPriority`
- Next milestone → `direction.nextMilestone`

## Files Changed This Cycle

| File | Change |
|------|--------|
| `GlobalEstateMenu.tsx` | `closeAndRun`, mousedown outside-dismiss |
| `EstateDropdownMenuPrimitives.tsx` | New shared rows + pointer isolation |
| `MyBusinessEstatePanel.tsx` | Close, icons, descriptions, chevrons, `onClose` |
| `BusinessEstateSectionEditor.tsx` | View/edit modes, cancel restores, unsaved guard |
| `CompanionPageClient.tsx` | `onClose={goBack}` on panel |
| `businessEstateProfile.ts` | Section descriptions per spec 056 |
| `my-business-estate.css` | Close, view mode, card layout |

## Files Not Touched (per packet)

Welcome Home, Experiences, Settings internals, Journal Gazebo, Evidence Vault, Hall of Accomplishments, Cartographer, Chamber, People I Help behavior.

## Remaining for Founder Sign-off (058 Phase 7)

- [ ] Hard refresh preview after deploy
- [ ] Browser walkthrough per `059_MY_BUSINESS_ESTATE_ACCEPTANCE_CHECKLIST.md`
- [ ] Screenshots (10 required in 058)
- [ ] `059_MY_BUSINESS_ESTATE_VISIBLE_IMPLEMENTATION_REPORT.md` after preview proof

## Not Complete Until

Preview browser tests pass and screenshots are captured — not claimed on code-only changes.
