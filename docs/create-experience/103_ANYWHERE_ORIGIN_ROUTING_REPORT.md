# 103 — Anywhere-Origin Universal Work Routing Report

**Status:** Implementation complete for Anywhere-Origin launch + resolution  
**Date:** 2026-07-21  
**Authority:** Universal Work Engine · Universal Blueprint Framework · Universal Blueprint Interface (102)  
**Prerequisite:** 102 committed (`80274a65`)

---

## Purpose delivered

Any Spark Estate experience may originate meaningful work. Every origin resolves through one Universal Launch Contract into continue / connect / create / conversation-support — preserving one canonical Work ID and one source of truth.

Marketing Plan was **not** added.

---

## Origins implemented

| Origin | Adapter | Notes |
|--------|---------|--------|
| Create | `launchFromCreate` | Begin (event-domain) + Blueprint Interface |
| Projects | `launchFromProjects` | Project-first connect via `projectId` |
| Strategies | `launchFromStrategies` | Same contract; no private strategy engine |
| Blueprints | `launchFromBlueprints` | Initializes through UWE registry |
| Cartography | `launchFromCartography` | Node refs via relationships; no content copy |
| Body Doubling | `launchFromBodyDoubling` | Session id on knownContext; attaches to Work |
| Shari / conversation | `launchFromShari` | `talk_only` / `work_on_this` + approval |
| Chamber | `launchFromChamber` | Attribution + approval before apply |
| Board | `launchFromBoard` | Review advisory until approved |
| Research | `launchFromResearch` | Research → approval → apply |
| Clear My Mind | `launchFromClearMyMind` | Thought-only or create with provenance |
| Tasks | `launchFromTasks` | Task id relationship + deeper Work |
| Welcome Home | `launchFromWelcomeHome` | Continue / recommend / clarify |
| Templates | `launchFromTemplates` | Routes through UWE (no shadow template Work) |

---

## Authoritative launch contract

**Path:** `lib/universalWorkEngine/launch/`

| File | Role |
|------|------|
| `types.ts` | `UniversalLaunchContract`, resolution types |
| `resolveAnywhereOriginWork.ts` | Single resolution sequence |
| `inferWorkTypeAndBlueprint.ts` | Message + legacy CreateBlueprint → UWE Blueprint |
| `findRelatedWork.ts` | Related Work search |
| `duplicateRisk.ts` | Cross-origin duplicate assessment |
| `memberFacingCopy.ts` | Warm replies (no architecture jargon) |
| `originAdapters.ts` | One function per required origin |
| `naturalLanguageExamples.ts` | Required NL examples |
| `bridgePlatformIntent.ts` | platformIntent alias → Anywhere-Origin |

Public exports: `lib/universalWorkEngine/index.ts` · `REQUIRED_ANYWHERE_ORIGINS` · `ANYWHERE_WORK_ORIGINS`

### Contract fields

origin · userIntent · originalUserMessage · candidate Work Type / Blueprint · related Work ID · Project / section / task · Cartography node · conversation · Chamber member · Board review · research · Body Doubling session · Clear My Mind thought · knownContext · depth · Shari mode · forceNew · applyApproved · confirmMultiCreate

---

## Resolution sequence

1. Classify talk / research / review / structured / support  
2. Infer Work Type + compatible Blueprint (registry only)  
3. Search related Work  
4. Assess duplicate risk  
5. Decide continue / connect / create / conversation-only / clarify / awaiting-approval  
6. Clarify only when ambiguity material  
7. Resolve one canonical Work ID (mint only via UWE)  
8. Attach origin relationships + provenance knownContext  
9. Signal `openUniversalInterface` + section focus  
10. Continuity via existing Blueprint Interface session (102)

---

## Duplicate prevention

Signals: hinted Work · same Work Type · similar intent · Project · Blueprint · conversation · recent · active incomplete · Cartography node · Chamber/Board context · CMM source.

Likely match → continue/connect (never a new master solely because origin changed).  
`forceNew` creates a deliberate new Work.

---

## platformIntent aliases

Legacy CreateBlueprint ids map to UWE Blueprints via `mapLegacyCreateBlueprintToUwe` / `resolvePlatformIntentViaAnywhereOrigin`:

| Legacy | UWE |
|--------|-----|
| `bp-retreat-event` | `bp-event-three-day-retreat` |
| `bp-workshop` | `bp-event-online-workshop` |
| `bp-event-plan` | `bp-event-business-luncheon` |
| … | … |

Unknown legacy ids do **not** fall through to templates.

Exported from `lib/platformIntent` for host callers.

---

## Relationship handling

`linkWorkRelationship` for project · cartography_node · blueprint · task · research · work.  
Chamber / Board / CMM / Body Doubling / conversation provenance stored on Work Blueprint `knownContext` (attribution without private save paths).

---

## Files changed

- `lib/universalWorkEngine/types.ts` — extended `WorkOrigin` + `ANYWHERE_WORK_ORIGINS`
- `lib/universalWorkEngine/launch/**` — new launch surface
- `lib/universalWorkEngine/index.ts` — public exports
- `lib/platformIntent/index.ts` — Anywhere-Origin bridge export
- `components/companion/CreateEstateEntrancePanel.tsx` — event-domain Begin through `launchFromCreate`

---

## Tests

`lib/universalWorkEngine/launch/anywhereOriginRouting.test.ts` — **10/10**

Covers: all origins · continue/connect/create/non-create · Shari modes · Chamber/Board/Research approval · Body Doubling · Cartography · duplicates · legacy alias map · 12 NL examples · CMM provenance · no durable/Marketing imports.

### Regression (this session)

| Suite | Result |
|-------|--------|
| `lib/universalWorkEngine` (incl. 103 + Blueprint) | **passed** |
| `lib/universalBlueprintInterface` | **passed** |
| `lib/createEstate/resolveCreateBeginOutcome.test.ts` | **passed** |
| `platformIntentRouting` CPC host scan | **pre-existing fail** — `CompanionPageClient` WIP missing `045 — Platform Intent Routing` block (tracked historically; not introduced by 103 launch module) |

---

## Browser / interaction evidence

Automated certification walks all required NL examples and origin adapters. Member replies verified free of architecture jargon.

Optional founder visual pass: Create Begin event prompt + Blueprint path still use Create shell; Anywhere-Origin decision surfaces via clarify/continue ack.

---

## Unresolved risks (non-blocking)

| Risk | Notes |
|------|--------|
| Full CompanionPageClient origin openers | Dirty WIP tree — thin Create entrance wired; other `open*Core` room navigators remain visual until host bind |
| platformIntent CPC string test | Pre-existing WIP; launch bridge is unit-certified |
| Templates surface still exists | Routes through UWE when launching Work; retirement is separate |
| Marketing Plan | Explicitly out of scope |

---

## Completion checklist

- [x] All required origins use Universal Work Engine launch contract  
- [x] No private origin Work mint / shadow Blueprint registry in launch layer  
- [x] NL examples resolve through registry identity  
- [x] Duplicate prevention across origins  
- [x] One canonical Work ID on continue/connect  
- [x] Event / UWE / Blueprint interface regressions green (excluding pre-existing CPC WIP scan)  
- [x] No Marketing Plan code  

**Do not begin 104 certification until this report is reviewed and 103 is committed/pushed per upload order.**
