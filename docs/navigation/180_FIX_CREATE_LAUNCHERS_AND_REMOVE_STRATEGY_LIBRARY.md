# 180 — Fix Create Launchers and Remove Strategy Library

**Source:** `180_CURSOR_FIX_CREATE_LAUNCHERS_AND_REMOVE_STRATEGY_LIBRARY.md`  
**Status:** Implemented in code · **Do not deploy** until authenticated verification passes.

## Root cause

Create picker called `startFreshCreateFromEstate` → `openCreateWorkspace`, but `resolveLegacyCreateWorkspaceGuard` returned `prepared_state` for every `content-generator` open. Clicks looked dead (chat line only; no workflow).

## Fixes

1. **Estate Create launch allowance** — `estateCreateLaunch: true` when `hardNavCommand === "my-work-create"` and `artifactType` is set. Chat-driven Create still blocked.
2. **Picker gate** — `hasLaunchableCreateWorkflow()`; only typed discovery / guided template types appear. DEFAULT-only tiles hidden.
3. **Strategy out of Create** — removed Strategies catalog category, Strategy entrance card, `onOpenStrategyCreate`. Strategy Library unchanged under Get Advice.

## Owners

| Concern | Owner |
|---------|--------|
| Creation registry / catalog | `lib/createCatalogData.ts` · `lib/createEstate/activeCreationTypes.ts` |
| Launch handler | `startFreshCreateFromEstate` / `openCreateWorkspace` in `CompanionPageClient.tsx` |
| Legacy guard | `lib/createExperience/blockLegacyCreateWorkspaceRouting.ts` |
| Discovery / questions | `lib/createWorkflow.ts` · `lib/createGuidedBridge.ts` |
| Save / resume | `CreateDraftResumeList` + create draft library helpers |
| Strategy Library (not Create) | Welcome Home → Get Advice → Strategy Library (`playbook` / `openStrategyLibraryCore`) |

## Strategy Library entries removed from Create

- Strategy card (`create-estate-browse-strategy`)
- Category **Strategies** (Business Strategy, Personal Companion Strategy)
- Create copy that treated “strategy” as a Create outcome
- Aliases blocked by `isStrategyLibraryCreateAlias`

**Kept (not Library):** Marketing Strategy, Content Strategy as *document* creators under Marketing.

**Remaining Strategy path:** Welcome Home → **Get Advice** → **Strategy Library** (`strategy-library` → `openStrategyLibraryCore` → `StrategiesPanel`). Data and `lib/strategyLibrary/*` preserved.

## Visible Create options (workflow-backed)

Driven by `listActiveCreationTypes()` — includes Email, Newsletter, SOP, Lead Magnet, Presentation, Workshop, Proposal, Social Post, Email Sequence, Marketing Plan, Landing Page, Sales Funnel, Course Outline, Offer, Client Onboarding, Blog Post, Video Script, Sales Page, Follow-Up Email, Marketing Strategy, Content Strategy, and other typed-discovery labels. DEFAULT-only types (e.g. Automation, Checklist, Claude Prompt, GHL Workflow, Process, Business Plan, Document, Launch Plan, Content Calendar, relationship request tiles without typed Q) are **hidden until workflows deepen**.

## Duplicate / misplaced findings (for 178 taxonomy)

- Email Sequence vs Email Campaign still both present if both have typed discovery
- Follow-Up Email vs Email overlap
- Facebook / LinkedIn vs Social Post still separate when typed
- Marketing Strategy / Plan / Content Strategy / Launch Plan cluster (Launch Plan hidden if DEFAULT-only)
- Full redesign deferred to 178 recommendations

## Automated tests

- `lib/createEstate/createLaunchers180.test.ts`
- Updates: `createEstateDestination.test.ts`, `blockLegacyCreateWorkspaceRouting.test.ts`, `activeCreationTypes.test.ts` (via filter behavior)

## Authenticated checklist (required before deploy)

1. Open Create → pick one option per visible category → workflow opens with first question  
2. Complete one workflow end-to-end  
3. Pause / resume one draft  
4. Previous Screen restores Create context  
5. Confirm no Strategy Library / Strategy card in Create  
6. Get Advice → Strategy Library still works; saved strategies intact  
7. Desktop + mobile  

## Deploy recommendation

**Do not deploy** until authenticated preview confirms every visible Create option launches a complete workflow and Strategy Library is absent from Create.
