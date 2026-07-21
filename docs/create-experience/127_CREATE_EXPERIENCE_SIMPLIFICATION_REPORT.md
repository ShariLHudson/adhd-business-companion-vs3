# 127 — Create Experience Simplification — Report

**Date:** 2026-07-21  
**Slice:** P0 companion-first Create entrance + confirmation gate · Refinements 20–30 (map Focus Mode + quieter chrome)  
**Conflict check:** No mid-flight financial blueprint packs 279–282 in Create paths (ADHD strategy IDs 279–282 are unrelated). Stayed out of blueprint definition wiring.

## Requirement status (1–19)

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
| 14 | One Focus Everywhere | **Partial** | Entrance + working panel principle; other Create panels not fully audited. |
| 15 | Recover from wrong matches | **Deferred** | Convert Work Type preserving notes — needs dedicated UWE convert API UX. |
| 16 | Never lose work | **Partial** | Continue Working + registry. Broader Projects bridging deferred. |
| 17 | First-time vs experienced | **Partial** | Map Full Mode locked until familiarity (20–28). Broader friction branching deferred. |
| 18 | ADHD standard | **Partial** | Confirmation + fewer choices + Focus Mode default + Save/More. |
| 19 | Certification | **Partial** | Unit/wiring tests for gates 1–4, 7–9 + map mode helpers. Full 056 browser cert still open. |

## Requirement status (20–30)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 20 | Intelligent Workshop Map Organization | **Done** | Threshold 6; collapsed categories; one open at a time; Current Focus category auto-expands; category progress line. |
| 21 | Current Focus Always Wins | **Done** | Dominant Current Focus chrome; map secondary (“Your plan”). |
| 22 | Simplify Action Bar | **Done** | Primary Save + More… (Rename, Duplicate, Export, Print, Share, Archive, Trash). |
| 23 | Unsaved Changes Must Be Clear | **Done** | Labels: Saved / Saving… / Draft Saved / Unsaved Changes. Dirty only when draft ≠ savedContent. |
| 24 | Track Execution Quietly | **Done** | Phrase removed from UI → “Keep with my projects”. Quiet progress remains principle-only. |
| 25 | Continue Working | **Done** | Lists all active registry workspaces; Current Focus + Continue →. |
| 26 | Progressive Map Modes | **Done** | Focus (default) / Organized / Full; preference persisted in localStorage. |
| 27 | Human-meaning categories | **Done** | Event groups: Foundation · Venue & Budget · Content · Marketing · Delivery · Follow-Up. Reuses BUSINESS_PLAN / marketing groups. |
| 28 | First-time users stay in Focus Mode | **Done** | Default Focus; Full Map locked until familiarity (visits / completed / used Organized). |
| 29 | Protect conversation-first Create | **Done** | No new pre-question decisions; P0 confirm gate untouched. |
| 30 | Governing principle | **Done** | `CREATE_ONE_FOCUS_PRINCIPLE` on working panel + docs. |

## Files changed (20–30 slice)

- `lib/createEstate/workshopMapModes.ts` (new)
- `lib/createEstate/workshopMapModes.test.ts` (new)
- `lib/createEstate/copy.ts`
- `lib/universalWorkEngine/blueprints/mapGrouping.ts`
- `lib/universalWorkEngine/packages/eventPlan/eventPlanMapGroups.ts`
- `lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType.ts`
- `lib/universalWorkEngine/packages/marketingPlan/registerMarketingPlanWorkType.ts`
- `lib/universalWorkEngine/packages/businessPlan/registerBusinessPlanWorkType.ts`
- `lib/creationDurable/saveState.ts`
- `lib/creationDurable/saveState.test.ts`
- `lib/creationDurable/savePipeline.ts`
- `lib/createCertification/productionCreateFoundation.cert.test.ts`
- `components/companion/GroupedWorkshopMap.tsx`
- `components/companion/CreateWorkCommandToolbar.tsx`
- `components/companion/CreateEstateWorkingPanel.tsx`
- `components/companion/CurrentFocusInteraction.tsx`
- `components/companion/CreateWorkspaceResumeList.tsx`
- `docs/create-experience/127_CREATE_EXPERIENCE_SIMPLIFICATION.md`
- `docs/create-experience/127_CREATE_EXPERIENCE_SIMPLIFICATION_REPORT.md`

## Honest blockers for remaining items

1. **Wrong-match convert (15)** — needs a safe Work Type conversion path with content/relationship preserve; do not invent outside UWE.
2. **Progressive section UI (5–6)** — many Blueprint pack UIs still render depth-visible sections wholesale; apply `progressiveQuickStartSectionIds` per pack without breaking cert expectations.
3. **Smart Resume effort (11)** — no estimated-effort field on continue projection yet.
4. **Full certification (19)** — authenticated browser J-001 / Create NL still required for 056 CERTIFIED.
5. **Map modes in non-estate Create shells** — Focus/Organized/Full wired on Estate `GroupedWorkshopMap`; legacy non-estate CreateWorkspaceV2 list path unchanged.

## Do not mix

Stay out of unfinished blueprint pack wiring (financial or otherwise). This pack only touches Create experience paths and shared UBI / Workshop Map presentation helpers.
