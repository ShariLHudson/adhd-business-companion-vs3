# Companion Homestead™ Architecture Audit
## Production Readiness Review — Before Commit & Push

**Date:** 2026-06-25  
**Branch:** `safety/clear-my-mind-working` (~191 modified paths)  
**Reviewer role:** Senior Staff / Principal FE / Systems / Performance / A11y / Tech Debt  
**Commands run:** `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run audit:companion:check`

---

## Executive summary

| Gate | Result |
|------|--------|
| Production build | **FAIL** — TypeScript errors block `next build` |
| TypeScript (`tsc --noEmit`) | **28 errors** across hospitality, needs, judgment, workspace layers |
| ESLint | **762 problems** (343 errors, 419 warnings) |
| Vitest | **22 failed** / 3,149 tests (18 files) |
| Companion behavior audit | **FAIL** — `companionBehaviorAudit.test.ts` |
| Audit guardrail | **Not recorded** — `audit:companion:check` requests fresh run |

**Git recommendation:** ❌ **Do NOT Commit Yet**

---

# Part 1 — Build Health

## TypeScript errors (28 — blocking)

| Area | Files | Issue |
|------|-------|-------|
| Welcome scene | `CompanionWelcomeScene.tsx` | `atmosphere.weather` not on type |
| Object migration | `GamesPanel.tsx` | `CompanionNavCard` used, not imported |
| Hospitality prototype | `CompanionDirectorsStudio.tsx`, `HospitalityExperiencePrototype.tsx` | Missing types, wrong constant name, props mismatch |
| Dev panel | `WelcomeRoomPrototypeDevPanel.tsx` | `FavoriteDrink` union mismatch |
| Needs intelligence | `companionNeedsIntelligence.ts` | Invalid section map, type casts, boolean |
| Universe catalog | `libraryCatalog.ts` | Broken import `../types` (should be `./types`) |
| Hospitality layers | `resolveHospitalityLayers.ts`, `sceneIntegrityEngine.ts`, `resolveGuestPreparation.ts` | Impossible type comparisons (stale unions) |
| Judgment client | `adaptationMessage.ts` | Energy mode unions out of sync |
| Plan My Day brain | `flexiblePlanning.ts`, `planAdjustment.ts`, `usePlanDayCompanionCycle.ts` | Status/phase union drift |
| Life areas | `smartLifeAreaSuggestions.ts`, `lifeAreaBridge.ts` | Missing/wrong exports |
| Stress objects | `workspaceObjectIds.ts` | Missing `talk-through` mapping |
| Actions | `doItNowActions.ts` | `emoji` removed from `AssistedAction` |

**Build error (first failure):** `CompanionWelcomeScene.tsx:127` — `atmosphere.weather`.

## ESLint (762 problems)

- **343 errors** — predominantly **React Compiler / hooks rules** in `CompanionPageClient.tsx` (~15,156 lines): refs during render, impure calls during render, `setState` in effects, variables used before declaration.
- **419 warnings** — mostly `@typescript-eslint/no-unused-vars` (heavy concentration in `CompanionPageClient.tsx` — dozens of unused imports from incomplete refactors).
- Babel deoptimizes `CompanionPageClient.tsx` — **file exceeds 500KB** parsed size.

## Tests (22 failures in 18 files)

| Category | Failed files |
|----------|----------------|
| **Companion governance** | `companionBehaviorAudit.test.ts` (2), `companionGovernor.test.ts`, `pendingAcceptanceAuthority.test.ts`, `companionFirstWorkflow.test.ts` |
| **Navigation / how-to** | `appFeatureKnowledge.test.ts` (4), `howDoIToolWalkthrough.test.ts`, `workspaceNav.test.ts`, `hardNavigationCommands.test.ts` |
| **Relationship** | `relationshipIntelligencePrompt.test.ts`, `relationshipObservationRelevance.test.ts`, `relationshipResponseContract.test.ts` |
| **Arrival / hospitality** | `arrivalIntelligence.test.ts` (2), `welcomePresenceIntelligence.test.ts`, `companionPresenceEngine.test.ts` |
| **Other** | `crossWorkspaceSuggestion.test.ts`, `phase1Onboarding.test.ts`, `visualThinkingRealityAudit.test.ts`, `adhdEntrepreneurIntelligenceBenchmark.test.ts` |

**Pass rate:** 99.3% by test count — but failures cluster in **core companion behavior**, not edge cases.

## Unused / dead / duplicate signals

| Signal | Evidence |
|--------|----------|
| **Monolith imports** | `CompanionPageClient.tsx` — 30+ unused imports (ESLint) |
| **Duplicate catalog entry** | `libraryCatalog.ts` — `needs` listed twice (lines 9 and 38) |
| **Stub libraries** | `artworkLibrary.ts`, `humorLibrary.ts` — exported, no runtime consumers |
| **Parallel orchestrators** | `companionBrain/orchestrator.ts` vs `companionUniverse/.../companionBrainOrchestrator.ts` — naming collision |
| **Parallel decision stacks** | `lib/decision-intelligence/` vs `lib/companionDecisionIntelligence/` |
| **Parallel environment stacks** | `lib/environment-intelligence/` vs `lib/companionEnvironmentIntelligence/` |
| **Four presence layers** | `welcomePresenceIntelligence`, `companionPresence`, `companionPresenceEngine`, `companionPresenceLibrary` |
| **Universe orchestrator isolated** | `orchestrateCompanionUniverse()` — prototype page only, not `arrivalIntelligence` or main client |
| **Needs intelligence unwired** | Not imported by `CompanionPageClient` or `arrivalIntelligence` |

## Circular dependencies

**No direct cycle** among `companionBrain`, `companionUniverse`, `arrivalIntelligence`.  
**Risk:** Both `arrivalIntelligence` and `companionBrainOrchestrator` independently compose the same subsystems — drift already visible in presence engine test failure.

## Runtime risks

- React Compiler violations in monolith → subtle render bugs, stale closures, cascade re-renders.
- Half-migrated object/emoji system → runtime `undefined` components (`GamesPanel`).
- Type union drift → dead branches that **silently never run** (judgment energy modes, scene weather/snow).
- 191-file changeset without green build → unknown interaction surface.

---

# Part 2 — Architecture

## Vision vs implementation gap

| Designed (docs) | Code reality |
|-----------------|--------------|
| Decision Ladder → one next thing | 15+ intelligence offer imports in `CompanionPageClient` |
| Homestead porch arrival | Chat + sidebar + 35 workspace panels |
| Companion Universe orchestration | Prototype route only (`/companion/hospitality-prototype`) |
| 20 rooms, life rhythms | `placeLibrary` registered; main path uses living room + workspaces |
| Hospitality Principle | Split across 4+ modules composing greetings independently |
| Scene Integrity™ | Engine exists; type unions not aligned with scene presets |
| Manifesto: depth in 5 rooms | Breadth in 30 library registrations |

## Unnecessary complexity

1. **Dual composition paths** — `arrivalIntelligence` and `orchestrateCompanionUniverse` duplicate welcome/environment/greeting chains.
2. **Offer-card intelligence fleet** — decision, environment, relationship, opportunity, momentum, recovery, loop, predictive, chief-of-staff, business-os, ecosystem, future-shari, adaptive-companion, user-health — all importable from one client file.
3. **libraryCatalog** — 30 entries, several `planned`, duplicate `needs`, broken types import.
4. **Master Plan + Blueprint + Look Book + Year doc** — engineering has no single runtime source of truth.

## Missing abstractions

| Needed | Why |
|--------|-----|
| **`ArrivalPipeline`** | Single function: trust gate → needs → environment → greeting → presence |
| **`TrustGate` API** | Unify trust doc + relationship phases for copy/code |
| **Room tier registry** | Daily vs lore-only — prevent 20-room nav explosion |
| **Intelligence visibility boundary** | Engines → hooks only; never cards on turn 1 |
| **Rename `companionBrainOrchestrator`** | → `universeSceneOrchestrator` to prevent mistaken imports |

## Future bottlenecks

- `CompanionPageClient.tsx` — any change triggers full reparse; blocks team parallelism.
- Per-room art × seasons — no pipeline, no performance budget.
- `companionStore.ts` (~2,557 lines) — god store for persistence.
- Scene switching with layered audio/motion — mobile memory and jank at 20 rooms.

---

# Part 3 — Performance

| Area | Assessment |
|------|------------|
| **Initial load** | Only 2 `dynamic()` imports in monolith — most panels static-imported or bundled eagerly |
| **Re-renders** | Monolith + ESLint compiler errors → high risk of cascading updates |
| **CompanionPageClient** | 500KB+ AST — dev HMR and build stress |
| **Images** | `companionPresenceLibrary` + safe composition — OK pattern; not all paths use it |
| **Scene switching** | Prototype only; no measured budget |
| **20+ rooms** | **Not scalable** as separate interactive scenes without tiering and lazy media |
| **Animations** | Motion library defined; loading all motion on arrival would fail mobile budget |

**Recommendation:** Performance budget doc — max KB and max one hero animation per arrival; lazy-load room media by tier.

---

# Part 4 — UX Integrity

## Breaks Companion philosophy

| Violation | Where |
|-----------|-------|
| **Software feeling** | Sidebar + More menu + 35 panels vs porch exhale |
| **Too many decisions** | Intelligence offer cards stack; Constitution says ≤3 choices |
| **Feature mall** | How-to routing still maps to many workspaces (failing tests show drift) |
| **Emoji + object mix** | Phase 2 migration incomplete — Strategies, HowDoI, games, companions picker still emoji |
| **Inconsistent nav** | `workspaceNav` / `appFeatureKnowledge` tests failing — user gets wrong paths |
| **Surveillance tone risk** | Relationship intelligence tests failing on pattern-first prompts |
| **Two products one door** | Founder/ecosystem intelligence adjacent to guest chat |
| **Prototype leakage risk** | Director's Studio — must stay `?demo=1` / dev routes only |

## What still aligns

- Companion Constitution tests largely pass (governor, consent, conversation-only modes).
- `companionNeedsIntelligence` + universe tests pass (isolated module).
- Hospitality principle codified in `hospitalityPrinciple.ts`.
- Dynamic import for Plan My Day and Visual Focus (partial code-splitting).

---

# Part 5 — Technical Debt

## Critical (fix before commit)

| Debt | Why exists | Risk | Fix |
|------|------------|------|-----|
| Build broken (28 TS errors) | Parallel refactors, union drift | Cannot deploy | Fix types imports, finish migration |
| `companionBehaviorAudit` failing | Behavior drift vs constitution | Ship regression | Align governor/routing with audit |
| `CompanionPageClient` compiler errors | Monolith growth | Production bugs | Fix or suppress with tracked split plan |
| `GamesPanel` missing import | Incomplete NavCard migration | Runtime crash | Add import |
| `libraryCatalog.ts` broken import | Path error | Universe API broken | `./types` |

## High (fix before next feature)

| Debt | Risk | Fix |
|------|------|-----|
| 15k-line monolith | Unmaintainable | Extract `useCompanionTurnPipeline`, panel registry |
| Dual arrival orchestration | Drift | Merge to `ArrivalPipeline` |
| 22 failing tests | Wrong UX copy/routing | Batch fix navigation + relationship suites |
| 343 ESLint errors | CI blocker | Compiler rules + split file |
| Needs intelligence unwired | Dead design | Wire to arrival or mark experimental |
| Four presence systems | Inconsistent Shari | Document layer map; consolidate greeting path |

## Medium

| Debt | Fix |
|------|-----|
| Duplicate decision/environment intelligence | Deprecate offer-card path or rename namespaces |
| Stub universe libraries | Remove from catalog or gate `planned` |
| `companionStore` size | Domain slices |
| Emoji migration remainder | Complete or rollback consistently |
| 191-file changeset | Split PRs by domain |

## Low

| Debt | Fix |
|------|-----|
| Unused imports in monolith | ESLint autofix pass |
| `Master Plan` duplicate doc | Index only |
| `npm warn devdir` | Environment config |

---

# Part 6 — File Organization

## Must move / split

| File | Action |
|------|--------|
| `app/companion/CompanionPageClient.tsx` | Split: `CompanionShell`, `CompanionChatTurn`, `CompanionPanelHost`, `CompanionIntelligenceOffers` |
| `lib/companionStore.ts` | Split by domain (thoughts, projects, day, settings) |
| `lib/companionBehaviorAudit.ts` | Keep; wire as CI gate |

## Should merge

| Candidates | Into |
|------------|------|
| `environment-intelligence` offer cards + `companionEnvironmentIntelligence` scene | Namespaced subfolders under `lib/companion-environment/` |
| `welcomePresenceIntelligence` + greeting parts of `arrivalIntelligence` | `lib/companion-arrival/` |
| `companionBrainOrchestrator` naming | Rename to `universeSceneOrchestrator` |

## Naming inconsistencies

- `companionBrain` vs `companionBrainOrchestrator` (universe)
- `decision-intelligence` vs `companionDecisionIntelligence`
- `companionHospitalityPrototype` vs `companionUniverse/libraries/hospitalityLibrary`
- `welcomeLivingRoom` vs `companionEnvironmentIntelligence`

## Oversized files (>1,200 lines)

`CompanionPageClient.tsx`, `companionStore.ts`, `ContentGeneratorPanel.tsx`, `howDoIHelpArticles.ts`, `companionBehaviorAudit.ts`, `companionValidationScenarios.ts`, `createWorkflow.ts`, `ProjectsPanel.tsx`, `SettingsPanel.tsx`, `StrategiesPanel.tsx`, `TimeBlockPanel.tsx`

---

# Part 7 — Production Readiness

## Must fix before commit

1. All **28 TypeScript errors** — `npm run build` green  
2. **`companionBehaviorAudit.test.ts`** passing  
3. **`GamesPanel.tsx`** import — runtime safety  
4. **`libraryCatalog.ts`** import path  
5. Re-run **`npm run audit:companion:record`** after audit green  
6. Fix or quarantine **hospitality prototype** TS errors (dev-only route must still compile)

## Should fix soon (same sprint)

1. 22 failing tests — especially arrival, navigation, relationship  
2. ESLint **errors** in `CompanionPageClient` (343) — at minimum compiler blockers  
3. Wire **one** arrival path — deprecate duplicate composition  
4. Complete **object ID migration** for touched panels  
5. Split changeset — docs vs hospitality vs object migration vs routing

## Nice to have

1. ESLint warnings cleanup (419)  
2. Delete stub libraries from catalog  
3. Room tier document → code  
4. Performance budget  
5. `tsc` in CI separate from Next build

---

# Part 8 — Git Recommendation

## ❌ Do NOT Commit Yet

### Why

1. **`npm run build` fails`** — production deploy blocked.  
2. **28 TypeScript errors** — including user-facing `GamesPanel` and welcome scene.  
3. **`companionBehaviorAudit` fails** — constitutional regression on a branch named for safety work.  
4. **22 test failures** in navigation, arrival, and relationship — core companion UX paths.  
5. **343 ESLint errors** — many in the monolith indicate unsafe React patterns.  
6. **~191 modified files** — too large to review or bisect without green gates.  
7. **Architectural evolution incomplete** — Universe orchestrator not integrated; dual stacks drift; emoji migration half-done.  
8. **Audit guardrail not recorded** for this fingerprint.

### Suggested sequence before push

1. Fix TS build blockers (targeted, ~1 day)  
2. Green `companionBehaviorAudit` + arrival tests  
3. `npm run test` — zero failures on companion-critical paths  
4. `npm run audit:companion:record`  
5. Split commit: **(A)** type/fixes **(B)** object migration **(C)** docs **(D)** hospitality prototype  
6. Then push `safety/clear-my-mind-working` or merge to integration branch with CI

---

*Architecture Audit v1.0 — Protect the exhale. Green builds before green fields.*
