# 127 — Create Experience Simplification — Report

**Date:** 2026-07-21  
**Slice:** P0 companion-first Create entrance + confirmation gate  
**Conflict check:** No mid-flight financial blueprint packs 279–282 in Create paths (ADHD strategy IDs 279–282 are unrelated). Stayed out of blueprint definition wiring.

## Requirement status (19)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Intelligent confirmation | **Done** | High/medium → Yes / Choose something else; low → clarify. Never silent `open`. |
| 2 | Eliminate Start Method | **Done** (entrance) | Create entrance uses `companionLed` → browser. Legacy UBI entry kept for pack checklists (`companionLed={false}`). |
| 3 | Hide Blueprint terminology | **Done** (P0 surfaces) | Entrance, browser headings, memberFacingCopy, work-ready ack. Depth/save under Customize. |
| 4 | Reduce decisions | **Done** | Describe → Confirm → Open. |
| 5 | Quick Start truly quick | **Partial** | Helper `progressiveQuickStartSectionIds` + tests; Marketing Plan QS already essential-only. Full progressive UI wiring across all Blueprint UIs deferred. |
| 6 | Progressive Blueprint expansion | **Partial** | Helper landed; section-by-section reveal in live Blueprint editors deferred. |
| 7 | Never empty Blueprint search | **Done** | Auto-broaden Company → Personal → Spark → Recommended → All. |
| 8 | Remove internal language / IDs | **Done** (Create entrance + UBI active) | No workId/blueprintId in member ack. |
| 9 | Immediate Open action | **Done** | `Open My Plan` primary via `onOpenWork` / confirm Yes. |
| 10 | Unified Active Work | **Partial** | Continue Working list + Current Focus + Continue CTA. Full unified Active Work across Projects deferred. |
| 11 | Smart Resume | **Partial** | Current Focus + next step + last worked shown. Goal / effort estimate deferred. |
| 12 | Companion-led creation | **Done** (default path) | Confirm + companionLed structure browse. |
| 13 | Delay advanced decisions | **Done** | Depth / structures under Customize. |
| 14 | One Focus Everywhere | **Partial** | Entrance + confirm path; other Create panels not fully audited. |
| 15 | Recover from wrong matches | **Deferred** | Convert Work Type preserving notes — needs dedicated UWE convert API UX. |
| 16 | Never lose work | **Partial** | Continue Working + registry. Broader Projects bridging deferred. |
| 17 | First-time vs experienced | **Deferred** | Friction adaptation not yet branched. |
| 18 | ADHD standard | **Partial** | Confirmation + fewer choices + no empty search + no Start Method. |
| 19 | Certification | **Partial** | Unit/wiring tests for gates 1–4, 7–9. Full 056 browser cert still open. |

## Files changed

- `lib/createEstate/resolveCreateBeginOutcome.ts`
- `lib/createEstate/createIntentConfirmation.ts` (new)
- `lib/createEstate/quickStartFocusSections.ts` (new)
- `lib/createEstate/copy.ts`
- `lib/createEstate/resolveCreateBeginOutcome.test.ts`
- `components/companion/CreateEstateEntrancePanel.tsx`
- `components/companion/CreateWorkspaceResumeList.tsx`
- `components/companion/universalBlueprint/UniversalBlueprintInterface.tsx`
- `components/companion/universalBlueprint/UniversalBlueprintBrowser.tsx`
- `lib/universalBlueprintInterface/browseBlueprints.ts`
- `lib/universalBlueprintInterface/index.ts`
- `lib/universalBlueprintInterface/browseBlueprints.autoBroaden.test.ts` (new)
- `lib/universalBlueprintInterface/universalBlueprintInterface.test.ts`
- `components/companion/universalBlueprint/universalBlueprintInterface.browserChecklist.test.tsx`
- `lib/universalWorkEngine/launch/memberFacingCopy.ts`
- `docs/create-experience/127_CREATE_EXPERIENCE_SIMPLIFICATION.md`
- `docs/create-experience/127_CREATE_EXPERIENCE_SIMPLIFICATION_REPORT.md`

## Honest blockers for remaining items

1. **Wrong-match convert (15)** — needs a safe Work Type conversion path with content/relationship preserve; do not invent outside UWE.
2. **Progressive section UI (5–6)** — many Blueprint pack UIs still render depth-visible sections wholesale; apply `progressiveQuickStartSectionIds` per pack without breaking cert expectations.
3. **Smart Resume effort (11)** — no estimated-effort field on continue projection yet.
4. **First-time friction (17)** — needs experience signal / onboarding flag wiring.
5. **Full certification (19)** — authenticated browser J-001 / Create NL still required for 056 CERTIFIED.

## Do not mix

Stay out of unfinished blueprint pack wiring (financial or otherwise). This pack only touches Create experience paths and shared UBI presentation helpers.
