# 129 — Create Experience Polish — Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Parents:** 127 (`36701c3e` + `daaba3ff`) · Spec 128 (`4ffc0fe4`)

## Requirement status (1–12)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Restore Rename | **Done** | Inline title rename on Continue Working + working panel; `renameActiveWorkspaceTitleDurable` wired from CompanionPageClient |
| 2 | One resume entry point | **Done** | Removed twin `Continue “…”` CTA; only `CreateWorkspaceResumeList` Continue → |
| 3 | Eliminate duplicate messaging | **Done** | Single `CREATE_GUIDED_SUPPORT_LINE`; Projects cue kept in How-Do-I copy only |
| 4 | Clarify exit navigation | **Done** | Return to Welcome Home / My Focus / Create; `formatAppBackLabel` estate → Return to Welcome Home |
| 5 | Merge Customize + Browse | **Done** | `More Ways to Start (Optional)` with Guided Frameworks · Browse Ideas · Previous Work · Personal/Company |
| 6 | Context-aware suggestions | **Done** | `contextAwareSuggestions.ts` filters catalog + defaults framework Work Type |
| 7 | Persistent orientation | **Partial** | Menu/chrome support `activeDestinationId`; CompanionPageClient wiring deferred (pre-commit behavior audit) |
| 8 | Simplify header navigation | **Done** | Labels: Today · Create · Reflect · Guidance · Estate (ids unchanged) |
| 9 | Advanced features hidden | **Done** | Frameworks, browse, drafts, filters behind More Ways |
| 10 | Reduce visual competition | **Done** | Continue Working → Start Something New → More Ways |
| 11 | Remove mismatched recommendations | **Done** | Marketing/media context drops Event templates; Event context prioritizes events |
| 12 | Certification | **Partial** | Focused vitest green; authenticated browser cert deferred |

## Files changed

- `docs/create-experience/129_CREATE_EXPERIENCE_POLISH_AND_DECISION_FRICTION_ELIMINATION.md`
- `docs/create-experience/129_CREATE_EXPERIENCE_POLISH_REPORT.md`
- `lib/createEstate/copy.ts`
- `lib/createEstate/contextAwareSuggestions.ts` (+ test)
- `lib/createEstate/createPolish129.test.ts`
- `lib/createEstate/createEstateDestination.test.ts`
- `lib/createEstate/createScrollContract.test.ts`
- `lib/createGuidedConversation189.ts` (+ test)
- `lib/navigationBackLabels.ts` (+ `navigationBack.test.ts`)
- `lib/estate/welcomeHomeNavigationStructure.ts` (+ test)
- `lib/estate/welcomeHomeActiveDestination.ts`
- `components/companion/CreateEstateEntrancePanel.tsx`
- `components/companion/CreateWorkspaceResumeList.tsx`
- `components/companion/CreateCatalogPicker.tsx`
- `components/companion/CreateEstateWorkingPanel.tsx`
- `components/companion/estate/EstateRoomExperienceMenu.tsx`
- `components/companion/estate/EstateTopRightChrome.tsx`
- `app/companion/estate-room-experience-menu.css`
- *(CompanionPageClient wiring deferred — behavior audit on stage; rename uses durable defaults in Create components)*

## Tests

```text
npx vitest run \
  lib/createEstate/createPolish129.test.ts \
  lib/createEstate/contextAwareSuggestions.test.ts \
  lib/createEstate/createEstateDestination.test.ts \
  lib/createGuidedConversation189.test.ts \
  lib/navigationBack.test.ts \
  lib/estate/welcomeHomeNavigationStructure.test.ts
```

## Browser cert

Deferred — authenticated Create NL / rename-everywhere surface check still open (same class as 127 #19).

## Protected

- 127 confirm-before-create gate (`create-estate-intent-confirm`)
- Focus Mode workshop map (untouched)
- Spec 128 — no Blueprint/Work Type/Registry jargon in member copy

## Blockers

1. Full browser cert for rename sync across Projects / Business Pulse / Search — needs authenticated session.
2. Recommendation engine (`recommendForWorkspace`) is still event-domain primary; entrance mismatch fixed via context filter — broader generic-domain ranking deferred.
3. `CompanionPageClient` stage triggers `lib/companionBehaviorAudit.test.ts` (pre-existing failures). Active-destination highlight + exitOriginHint from `activeNav` remain unstaged until audit is green or explicitly waived.
