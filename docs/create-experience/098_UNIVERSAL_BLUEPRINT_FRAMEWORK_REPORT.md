# 098 — Universal Blueprint Framework Report

**Status:** Framework complete for Universal Work Engine ownership + five Event Blueprint registrations  
**Authority:** Universal Work Engine foundation (`096`) · Create ownership audit (`095`)  
**Scope:** Universal Blueprint registry, depth modes, adaptive questions, versioning, save-as, build-from-previous  
**Out of scope (honored):** Marketing Plan Work Type · Marketing Plan Blueprints · private Work Type Blueprint runtimes  
**Commit:** _(pending — do not declare shipped until committed)_

---

## Executive summary

Blueprints are now owned by the **Universal Work Engine** (`lib/universalWorkEngine/blueprints/`). Work Type packages may **register domain definitions only** through `registerBlueprint`. They must not create private Blueprint registries or private initialization pipelines.

Five Event Spark Blueprints are registered through that universal path:

1. Business Luncheon — `bp-event-business-luncheon`  
2. Online Workshop — `bp-event-online-workshop`  
3. One-Day Workshop — `bp-event-one-day-workshop`  
4. Three-Day Retreat — `bp-event-three-day-retreat`  
5. Book Signing — `bp-event-book-signing`

There is **no per-Blueprint runtime**. Each Event Blueprint is data consumed by shared engine operations.

---

## Authoritative owners

| Capability | Owner |
|------------|--------|
| Blueprint registry | `lib/universalWorkEngine/blueprints/registry.ts` |
| Blueprint lookup / version resolution | `getBlueprint` · `requireBlueprint` · `resolveBlueprintVersion` |
| Compatibility checks | `isBlueprintCompatibleWithWorkType` · `assertBlueprintCompatible` |
| Blueprint → Work initialization | `initializeWorkFromBlueprint` |
| Depth mode switching | `changeBlueprintDepthMode` (same Work ID) |
| Blueprint adaptation | `adaptBlueprintForContext` · `mergeKnownContext` · conditional section resolve |
| Inheritance / duplication | `inheritBlueprint` · `duplicateBlueprint` |
| Save as Personal / Company | `prepareSaveAsBlueprint` → review → `confirmSaveAsBlueprint` |
| Build from previous work | `buildWorkFromPreviousWork` |
| Upgrade handling | `upgradeWorkBlueprint` · `approveBlueprintOverwrite` |
| Audit history | `recordBlueprintAudit` · `listBlueprintAudit` |
| Adaptive questions | `evaluateAdaptiveQuestion` · answer / skip / recover |
| Event domain definitions | `packages/eventPlan/eventBlueprintDefinitions.ts` (data only) |
| Event registration hook | `packages/eventPlan/registerEventBlueprints.ts` → `registerBlueprint` |

**Not Blueprint owners:** Event Intelligence UI, Create durable repository, platformIntent routing catalog (`lib/platformIntent/blueprintRegistry.ts` remains Create *routing* aliases — distinct from UWE Work Blueprints).

---

## Public exports

Primary surface: `lib/universalWorkEngine/index.ts` (and `lib/universalWorkEngine/blueprints/index.ts`).

Key exports include:

- Types: `BlueprintDefinition`, `WorkBlueprintState`, `BlueprintDepthMode`, `SaveAsBlueprintReview`, …
- Errors: `UnknownBlueprintError`, `IncompatibleBlueprintError`
- Registry: `registerBlueprint`, `requireBlueprint`, `listBlueprints`, …
- Lifecycle: `initializeWorkFromBlueprint`, `changeBlueprintDepthMode`, `upgradeWorkBlueprint`
- Adaptive: `evaluateAdaptiveQuestion`, `answerBlueprintQuestion`, `skipBlueprintQuestion`, `recoverSkippedQuestion`
- Save / reuse: `prepareSaveAsBlueprint`, `confirmSaveAsBlueprint`, `buildWorkFromPreviousWork`
- Event helpers: `ensureEventBlueprintsRegistered`, `EVENT_PLAN_BLUEPRINT_IDS`

---

## Registry structure

```
blueprintId → Map<version, BlueprintDefinition>
latestVersionById → blueprintId → latest semver-ish version
```

- Multiple versions per Blueprint ID are retained.  
- Lookup without version resolves to latest.  
- Unknown IDs throw `UnknownBlueprintError` (fail-visible).  
- Work Type packages call `registerBlueprint` only — no local `Map` registries.

---

## Schema (capability coverage)

Each `BlueprintDefinition` supports:

| Field | Purpose |
|-------|---------|
| `blueprintId` / `version` | Stable identity + versioning |
| `category` | spark · personal · company · adaptive · from_previous_work |
| `compatibleWorkTypeIds` | Compatibility gate |
| `title` · `description` · `intendedUse` · `complexity` | Member-facing metadata |
| `supportedDepthModes` | Quick Start · Guided Build · Complete Planning |
| `sections` | required · conditional · optional · hidden_system |
| `defaultValues` | Seeded content (never overwrites user text on upgrade) |
| `adaptiveQuestions` | Dependencies, known-context keys, lower-friction prompts |
| `suggestedTasks` / `suggestedMilestones` | Depth-aware suggestions |
| `commonlyForgottenItems` · `riskPrompts` · `researchPrompts` | Planning depth aids |
| `deliverables` | Expected outputs |
| Chamber / Board / Project / Cartography recommendations | Ecosystem bridges |
| `completionCriteria` · `certificationRules` | Done / cert hooks |
| `domainExtensions` | People/roles, budget, timeline, communications, follow-up |

---

## Depth-mode behavior

| Mode | Behavior |
|------|----------|
| **Quick Start** | Ask only questions listed for `quick_start`; prefer lower-friction prompts; postpone non-material optional asks; optional sections mostly hidden |
| **Guided Build** | Explanations-oriented question set; optional sections (Guided+) appear; adaptive deps honored |
| **Complete Planning** | Full domain questions, risk/research-oriented asks, deepest optional/conditional surface |

**Critical rule:** `changeBlueprintDepthMode` updates depth on the **same Work ID**. It does not mint a second Work item and does not duplicate Blueprint state rows.

---

## Adaptive-question behavior

Before asking, `evaluateAdaptiveQuestion` evaluates:

1. Already known? → `skip_known`  
2. Required in current depth? → else `not_required_now`  
3. Dependencies met? → else `postpone`  
4. Safely inferable? → `infer`  
5. Postponable in Quick Start without material next-step change? → `postpone`  
6. Lower-friction wording available in Quick Start? → `ask` with alternate prompt  
7. Otherwise → `ask`

Skipped questions remain on `skippedQuestionIds` and are recoverable via `recoverSkippedQuestion`.

Blueprints **never** overwrite user-entered section content on upgrade without `approveBlueprintOverwrite`.

---

## Versioning

- Registering the same `blueprintId` with a higher version updates “latest”.  
- Work state stores `blueprintVersion` at initialization.  
- `upgradeWorkBlueprint` moves Work to a target/latest version, preserving member section text; conflicting defaults go to `pendingOverwriteApprovals`.

---

## Save-as-Blueprint

1. `prepareSaveAsBlueprint` → review screen payload (sanitized defaults, removed fields, retain hints)  
2. `confirmSaveAsBlueprint({ confirm: true })` → registers a **new** Personal/Company Blueprint  

Guards:

- Instance dates, emails, phones, completed-state markers, and confidential tokens stripped (unless explicitly retained)  
- Source Work ID recorded in audit  
- Updating an existing saved Blueprint bumps version  
- Original Work is **never** converted into the Blueprint; Work ID cannot equal Blueprint ID  

---

## Build-from-previous-work

`buildWorkFromPreviousWork`:

- Mints a **new** Work ID  
- Copies only `approvedSectionIds`  
- Skips private-note-like section ids by default  
- Does not copy history, completed tasks, or unanswered decision trails  
- Records provenance (`kind: "previous_work"`)  
- Links Cartography `reused_from` → source Work  
- Leaves the source Work intact  

---

## Event Blueprint registrations

| Blueprint | ID | Complexity | Notable conditionals |
|-----------|-----|------------|----------------------|
| Business Luncheon | `bp-event-business-luncheon` | moderate | `sponsors` when `has_sponsors` |
| Online Workshop | `bp-event-online-workshop` | moderate | `recording_plan` when `will_record` |
| One-Day Workshop | `bp-event-one-day-workshop` | complex | `hospitality` when in-person |
| Three-Day Retreat | `bp-event-three-day-retreat` | complex | `volunteers` when `needs_volunteers` |
| Book Signing | `bp-event-book-signing` | simple | partners when `has_partner` |

Registration path:

`eventBlueprintDefinitions.ts` → `ensureEventBlueprintsRegistered()` → `registerBlueprint`  
`ensureEventPlanWorkTypeRegistered()` lists `EVENT_PLAN_BLUEPRINT_IDS` on the Event Work Type package.

---

## Tests added

| Suite | Path |
|-------|------|
| Blueprint certification | `lib/universalWorkEngine/blueprints/blueprintFramework.cert.test.ts` |

Covers: universal Event registration · incompatible Work Type refusal · shared Work ID across depths · no duplicate on depth change · known-context reuse · recoverable skips · conditional sections · upgrade preserves user work · save-as sanitization · build-from provenance · unknown ID failure · no private package registry · live conditional triggers · answer → skip_known.

Architecture boundary suite updated to clear/re-register Blueprints in `beforeEach`.

---

## Test results

**Universal Work Engine** (`npx vitest run lib/universalWorkEngine`):

- **4 files / 34 tests passed** (includes 14 Blueprint cert tests)

**Event + Create regression batch** (foundation, createCertification, section feel-pass, eventCreationWorkspace, createCommands, createProjects, UWE):

- **12 files / 97 tests passed**

**Work Type schema:**

- **2 files / 7 tests passed**

**Known non-blocker (pre-existing estate WIP):**

- `j001WorkshopJourney.test.ts` — CPC cold-resume source-string expects `shouldBindWorkspace` in `CompanionPageClient.tsx` (documented in `097`; unrelated to Blueprint framework)

---

## Unresolved risks (non-blocking)

| Risk | Notes |
|------|-------|
| In-memory Blueprint Work state | Not yet durable in Supabase; durable work content remains via `creationDurable` |
| platformIntent catalog vs UWE Blueprints | Routing aliases (`bp-event-plan`, `bp-workshop`, …) still live in platformIntent; product wiring to the five UWE Event Blueprints is a follow-on |
| UI for review screen / depth switcher | Engine APIs ready; Estate Create UI not yet bound in this slice |
| Personal/Company Blueprint persistence | Registered in-process; durable Blueprint store is a follow-on |

None of the above block declaring the **framework** complete per the completion rule (registry, five Event BPs, no private runtime, depth/Work ID integrity, versioning/provenance/save-as/build-from protections, Event + UWE suites green).

---

## Completion checklist

| Requirement | Evidence |
|-------------|----------|
| Five Event Blueprints registered universally | `EVENT_PLAN_BLUEPRINT_IDS` + cert test |
| No private Blueprint runtime | Package scan + shared initialize/save/build APIs |
| Event certification still passing | 97-test regression batch green |
| UWE regression suite passing | 34/34 |
| Depth switching preserves one Work ID | cert: Quick Start / Guided / Complete |
| Versioning + provenance | upgrade + build-from tests |
| Save-as / build-from duplication guards | cert tests |
| Marketing Plan not built | No `marketing_plan` package or Blueprint added |
