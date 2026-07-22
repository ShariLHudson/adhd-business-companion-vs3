# 130 — Create Experience Final Polish — Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Parents:** 127 (`36701c3e` + `daaba3ff`) · Spec 128 (`4ffc0fe4`) · 129 (`bd653240`)

## Requirement status (1–14)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | One Creation Rule — confirm everywhere | **Done** | NL + Browse Ideas + Guided Frameworks → confirm; Create {Type} / Choose Something Else / Cancel |
| 2 | Eliminate accidental clutter | **Done** | Manage My Work: multi-select Archive / Trash / Restore / Delete permanent (confirm) |
| 3 | Intelligent title generation | **Done** | `createTitleFromIntent`; registry uses `originalRequest`; rejects template-name titles when intent differs |
| 4 | Remove dead elements | **Done** | Catalog no longer silent-creates; confirm Cancel clears; disabled/busy states retained |
| 5 | Meaningful visual recognition | **Done** | `workTypeVisual` icon + accent on Continue cards (labels remain primary) |
| 6 | Empty states must teach | **Done** | Continue Working + Previous Work teaching copy |
| 7 | Continue Working quality | **Done** | Title · Work Type · Current Focus · Last Worked · Progress · one Continue (removed duplicate next-action line) |
| 8 | No Untitled unless intentional | **Done** | Browse-only → `New {Type}`; intent path prefers wording over Untitled |
| 9 | Consistency | **Done** | Intent → Confirm → Creation → Open → Current Focus across NL / Browse / Frameworks |
| 10 | Trust | **Done** | No silent create from Browse; Undo window; no surprise title from template when request exists |
| 11 | Recovery | **Done** | Post-create Undo (~45s) until meaningful edit; Undo → Trash + return to Create |
| 12 | Accessibility | **Done** | Icons `aria-hidden`; confirm group labeled; focus moves to Create CTA; checkboxes labeled |
| 13 | Final Polish Audit | **Partial** | Unit certification green; authenticated browser walkthrough deferred |
| 14 | 12/10 Experience Test | **Partial** | Checklist below for independent testers; not yet run in-session |

## Files changed

- `docs/create-experience/130_CREATE_EXPERIENCE_FINAL_POLISH_AND_CERTIFICATION.md`
- `docs/create-experience/130_CREATE_EXPERIENCE_FINAL_POLISH_AND_CERTIFICATION_REPORT.md`
- `lib/createEstate/createIntentConfirmation.ts`
- `lib/createEstate/resolveCreateBeginOutcome.ts` (+ test)
- `lib/createEstate/createTitleFromIntent.ts` (+ test)
- `lib/createEstate/workTypeVisual.ts`
- `lib/createEstate/postCreateUndo.ts`
- `lib/createEstate/copy.ts`
- `lib/createEstate/createPolish130.test.ts`
- `lib/activeWorkspaceRegistry/registry.ts` (intent title on register)
- `components/companion/CreateEstateEntrancePanel.tsx`
- `components/companion/CreateWorkspaceResumeList.tsx`
- `components/companion/CreateEstateWorkingPanel.tsx`

## Tests

```text
npx vitest run \
  lib/createEstate/createPolish130.test.ts \
  lib/createEstate/createTitleFromIntent.test.ts \
  lib/createEstate/resolveCreateBeginOutcome.test.ts \
  lib/createEstate/createPolish129.test.ts \
  lib/createEstate/createEstateDestination.test.ts \
  lib/createEstate/createScrollContract.test.ts \
  lib/activeWorkspaceRegistry/humanReadableIdentity.test.ts
```

**Result:** 7 files · 60 tests · passed

## Final Polish Audit (13)

| Check | Result |
|-------|--------|
| Every create path confirms | Pass (unit + panel wiring) |
| No silent Browse create | Pass |
| Titles from intent | Pass (unit: coaching newsletter) |
| Manage My Work obvious | Pass (wiring) |
| Work Type accent + label | Pass |
| Empty states teach | Pass |
| One Continue per card | Pass |
| Undo after create | Pass (wiring + eligibility unit) |
| Spec 128 — no architecture jargon | Pass (copy review) |
| CompanionPageClient confirmation consistency | **Blocked** — browse confirm handled in entrance panel without CPC rewrite; CPC still has direct `onSelectCreationType` if called from elsewhere |
| Authenticated browser cert | **Deferred** |

## 12/10 Experience Test checklist (14) — for independent testers

1. [ ] NL: “Weekly newsletter for coaching clients” → confirm message → Create Newsletter → opens with intent-like title (not Announcement Newsletter)  
2. [ ] Browse Ideas: Blog Post → confirm → Cancel → no Work created  
3. [ ] Browse Ideas: Blog Post → Create Blog Post → workspace opens + Current Focus  
4. [ ] Guided Frameworks: Marketing Plan → Open → confirm before work  
5. [ ] Continue Working shows title, type accent, Current Focus, Last Worked, one Continue  
6. [ ] Manage My Work: archive → appears under Archived & Trash → Restore  
7. [ ] Manage My Work: Trash → Restore; Delete permanently asks confirm  
8. [ ] Fresh create → Undo create within ~45s returns to Create and removes from Continue  
9. [ ] After typing a Current Focus answer, Undo is gone  
10. [ ] Previous Work empty shows teaching copy (not blank)  
11. [ ] Keyboard: Tab to confirm actions; Escape cancel path feels safe  
12. [ ] Spec 128 feel: calm, one primary action, no Blueprint/Work Type jargon  

## Protected

- 127 confirm-before-create NL gate  
- 129 hierarchy · rename · More Ways · context-aware suggestions  
- Focus Mode workshop map untouched  
- No `CompanionPageClient` rewrite (behavior audit)

## Blockers

1. **CompanionPageClient** — pre-existing `companionBehaviorAudit` failures; active-destination / exitOriginHint from 129 remain unstaged. 130 confirmation for Browse is panel-side so CPC `onSelectCreationType` is unused by entrance picker (still wired for API compat).  
2. **Browser cert** — authenticated Create walkthrough still open (same class as 127 #19 / 129).  
3. **Recommendations / external launchers** outside Create estate entrance were not fully re-audited; estate entrance paths are covered.
