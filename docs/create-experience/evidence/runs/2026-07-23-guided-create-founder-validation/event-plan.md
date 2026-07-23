# Founder Validation — Event Plan / Workshop

| Field | Value |
|---|---|
| Registry ID | `event_plan` |
| Validation environment | local `localhost:3000` + Founder Validation Mode |
| Build/commit | post-environment-recovery + J-001 repair WIP |
| Tester | Founder (J-001) + Cursor repair agent |
| Date and time | 2026-07-23 |
| Planned test title | Founder Validation — Event Plan / Workshop — 2026-07-23 |

## Journey results (J-001)

| Step | Result | Notes |
|---|---|---|
| Entry path | **PARTIAL** | Workshop opened guided `event_plan` (not Content Generator) |
| Route result | **PASS** | Workshop → `event_plan` |
| Save result | **PASS** | Purpose, Audience, Outcomes, Event Type, agenda persisted |
| Leave/return result | **PARTIAL** | Same Workshop record + content intact; **wrong section** (landed on Attendee Experience) |
| Continue Working result | **PARTIAL** | Reopened correct record; section resume incorrect |
| Reopen/hydrate result | **PARTIAL** | Content OK; exact section not restored |
| Refresh result | **NOT RUN** / pending re-test after repair |
| Required actions result | **PARTIAL** | “Give me ideas” appeared inert during J-001 |
| Project conversion result | **NOT RUN** | — |
| Workshop subtype path | **PASS** (routing) | Opens `event_plan` |

## Original J-001 verdict

**PARTIAL** — durable content save/reopen worked; two defects blocked Ready:

1. **“Give me ideas” inert** — click produced no useful visible suggestions (teaser-only assist + no ideas panel).
2. **Wrong-section resume** — leave/return restored the same Workshop with content, but opened **Attendee Experience** instead of the section where the founder left.

Do **not** mark J-001 PASS from this repair alone.

## Defects (J-001)

### D1 — Give me ideas
- Control visible under Need a hand?
- Handler ran `runCreateAssistance("give_me_ideas")` which returned only a teaser line with **no concrete ideas**
- Parent preferred that teaser over `ideasGuidanceForFocus`, so examples never surfaced
- No Use / Add / Retry / Close panel

### D2 — Exact-section resume
- `mergeRuntimeRecordIntoWorkflow` only kept persisted focus when the section was still **empty**
- After filling early sections, resume fell through to first incomplete → often `attendee_experience`
- Durable payload preferred `workspaceCurrentFocus` / first empty over `activeSectionId`

## Repairs made (code — awaiting browser re-test)

1. Structured `generateSectionIdeas` + Current Focus ideas panel (loading, suggestions, Use / Add / Try Again / Close; no auto-overwrite; duplicate-click guard)
2. Resume restores `activeSectionId` + focus for valid persisted section **even when filled**; invalid id → first incomplete → last available
3. Durable mapping prefers `workflow.activeSectionId`; authoritative merge restores `currentFocusId` / snapshot `activeSectionId`
4. **Shared UWE inheritance:** exact resume (`resolveExactResumeSectionId`) + section ideas catalogs registered per guided Work Type (`exactResume` / `sectionIdeas` capabilities). Marketing / Business / Facebook Community inherit the same UI + resume path automatically.

## Automated evidence

| Suite | Result |
|---|---|
| `sectionIdeas.test.ts` | **PASS** |
| `CurrentFocusInteraction.ideas.test.tsx` | **PASS** (loading, suggestions, Use/Add/Close, duplicate-click) |
| `exactWorkspacePersist.test.ts` resume cases | **PASS** (exact filled section, invalid fallback, new workshop first section) |
| `assistance.test.ts` concrete ideas | **PASS** |
| `saveEngineFocusBinding.test.ts` | **PASS** |
| `workshopEvent.foundation.cert.test.ts` + `lib/createRegistry` + Projects + guided certification | **PASS** (105 tests in focused pack) |

Pre-existing unrelated failures (not introduced here): Newsletter AWR consent; some 074 source-scan / authoritative-durable checks; Marketing Campaign `intro` map-switch test (schema no longer has `intro`).

## Flag changes

| Flag | Before | After |
|---|---|---|
| routeVerified | false | **false** (unchanged) |
| saveVerified | false | **false** |
| reopenVerified | false | **false** |
| requiredActionsVerified | false | **false** |
| projectHandoffVerified | false | **false** |
| printVerified | false | **false** |
| exportVerified | false | **false** |

## Lifecycle result

**testing** (unchanged)

## Computed user visibility

`computeIsUserVisible(event_plan)` → **false**

## Final verdict

**PARTIAL** — awaiting browser re-test of ideas + exact-section resume.  
Do not promote to Ready; do not flip verification flags from this repair alone.

---

## Re-test attempt — 2026-07-23 (entry route BLOCKED)

| Field | Value |
|---|---|
| Attempt | Founder browser validation after UWE ideas/resume repair |
| Goal | Re-test J-001 Give Me Ideas + exact-section resume |
| Outcome | **BLOCKED / FAIL at Create-New Workshop entry** — intended repair validation could not begin |

### Observed (founder browser)

| Step | Result | Notes |
|---|---|---|
| Entry: Create → “workshop new” / Workshop chip → Start Creating | **FAIL** | No Workshop workspace opened; no guided builder; no content generator; no visible error |
| create-open-live-trace | Intent received | Repeated `workspacePanel: null`, `createPanelMounted: false`, `contentGeneratorMounted: false` |
| Ambiguity prompt | **FAIL (UX)** | Copy asked continue vs begin new; **no** Continue / Begin New controls |
| Start Something New | **FAIL** | Cleared input only; did not open workspace or usable new-create state |
| Earlier Create Workshop | **FAIL (routing)** | Opened **SOP** instead of Workshop (stale type / retarget suspicion) |

### Not run (blocked by entry)

| Area | Status |
|---|---|
| Give Me Ideas | **NOT RUN** |
| Exact-section resume | **NOT RUN** |
| Record persistence re-test | **NOT RUN** |
| Overall J-001 | **BLOCKED / FAIL at entry route** |

### Classification

Create-New Workshop entry route: **FAIL**  
Does **not** replace the earlier PARTIAL evidence above — appends this blocking attempt.

### Code repair for entry (same day — awaiting founder browser confirm)

Shared Create open arbitration (not a Workshop-only DOM hack):

1. `resolveGuidedBeginOpen` — forceNew for “new workshop” / armed Start Something New; continue vs clarify vs open_new  
2. Ambiguity UI — Continue Existing {Type} / Start New {Type} / Cancel + Retry on mount failure  
3. `onBeginCreate` returns boolean; live trace records `createEstateWorkingMounted`  
4. Registry flags **unchanged** (`false`); lifecycle stays `testing`

Do **not** mark J-001 PASS until founder opens a new Workshop in browser and completes full J-001 re-test.

---

## Append — Give Me Ideas iterative assistance (2026-07-23, code-only)

**Classification stays PARTIAL** — do not mark Give Me Ideas PASS until browser confirms.

### Founder validation that triggered this append
- Passed: feedback, useful suggestions, answer protected, Add to My Answer, Close, no duplicate panels  
- Failed: Try Again returned the same suggestions  

### Root cause
Shared `generateSectionIdeas` always returned `.slice(0, 3)` with no shown-ID tracking; catalogs only had three ideas per section.

### Code repair (shared UWE — not Workshop-only)
- Stable suggestion IDs + page-lifetime shown tracking  
- Modes: initial / more / refresh  
- Expand This Idea via type-specific expansion builders (no LLM)  
- Catalogs expanded to ≥6 ideas per section for all four guided packages  
- UI: Add to My Answer · Expand This Idea · More Ideas · Refresh Ideas · Close  

### Still required before PASS
Browser confirm: Refresh returns a different set · More appends · Expand works · Add Expanded Idea safe · no content loss.  
Registry readiness flags **unchanged**.
