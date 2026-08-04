# Handoff — Companion App (Client Avatar / Audience / Business Estate work)

Branch: `deploy/companion-app-v3` · Repo: `C:\Users\Shari\adhd-business-companion - vs3\companion-app`
Main branch for PRs: `main`. This is NOT stock Next.js — read `node_modules/next/dist/docs/` before writing Next-specific code.

## How the user works (IMPORTANT — follow exactly)

- **Audit first, implement second.** For non-trivial work, investigate and report before changing code.
- **Report before committing.** Implement → run focused tests + `npm run build` → report → WAIT for explicit approval → commit. Never commit unprompted.
- **Never push** unless explicitly told to (they say "push"). Each push is authorized separately.
- **Commits:** stage only the files for the bounded change. Use `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. A pre-commit hook runs a companion-behavior audit when companion-behavior files are staged (verbose output; it passes — just confirm the commit landed with `git log --oneline -1`).
- **Never stage** `lib/generated/shariPhotoManifest.json` (incidental build artifact, always left unstaged).
- **Never touch** untracked: `.claude/`, `GPT-Client_Experience_Studio_2.1 navigation/`, `Intelligence Library/`, `PHASE3_1_IMPLEMENTATION_HANDOFF.md`, `PHASE3_AUDIT.md`.
- Bounded scope — do only what's asked; note out-of-scope findings, don't act on them.

## Git state

Pushed (origin at `cccdd155`): `9cf1b8a8`, `f72c08a7`, `0ba47e95`, `adf5d950`, `738f8712`, `cccdd155`.
**Committed but NOT pushed:** `0d683ede` (Welcome Home composer + Client Avatar research/print), `b5bf3be5` (Audience architecture foundation). HEAD = `b5bf3be5`.
Working tree clean except unstaged `shariPhotoManifest.json` + the untouched untracked items above.

## What exists now

**Client Avatar Contextual Workspace** (the reference pattern) — `components/companion/contextualWorkspace/` (README documents the contract):
- `ContextualWorkspaceShell` (transparent single-column over the room), `WorkspaceStepControls` (Back · Skip for Now · Save Progress · Save and Continue + "Progress saved."), `ContextualResearchPanel` (per-question inline research: auto-runs once per question, "Researching this question…", Add to Answer / Keep Researching / Not Now, failure → Try Again, per-question threads).
- Host: `components/companion/IdealClientBuilder.tsx` — draft resume via `draftStepKey` (on `IdealClientAvatar`), `appendToCurrentAnswer`, Print menu; libs `lib/clientAvatarResearch.ts`, `lib/clientAvatarPrint.ts`.
- Rendered focused via `activeSection === "client-avatars"` (WorkspaceShell, `showAssist=false`, `CLIENT_AVATAR_BACKGROUND_SRC`) AND via People I Help overlay (`PeopleIHelpPanel` → `MyBusinessEstateRoomShell`). `client-avatars` is in `ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS` (fixes the gray-block).

**Audience Selection architecture (foundation only, `b5bf3be5`)** — NOT integrated anywhere:
- `lib/audienceSelection.ts` — `AudienceSelection` contract {selectionMode none|single|multiple|all, selectedAvatarIds, includeDrafts, multiAvatarOutputMode shared|separate|tailored|compare, inheritedFromProject, overrideForCurrentGeneration, lastUpdatedAt}. Completeness = `isAvatarCompleteEnough` (crossWorkspaceGuidance). `updateAudienceSelection` is the ONLY thing that stamps `lastUpdatedAt`; normalize/parse/resolve/serialize preserve it.
- `lib/audienceContext.ts` — distinct multi-avatar context (each avatar its own labeled block; never flattened; states the strategy).
- `components/companion/audience/AudienceSelectionField.tsx` + `MultiAvatarOutputStrategyField.tsx`.

## Nav / routing facts (Client Avatar + Business Estate)

- `openProfileDestinationCore("my-business-estate")` → `setOverlay` → `ProfileDestinationHost` (portal dialog) → `MyBusinessEstatePanel`. Business Estate is an OVERLAY, not an AppSection.
- Deterministic chat gate: `lib/businessEstateNavIntent.ts` → gate in `handleSend` (`CompanionPageClient.tsx`) opens the MBE overlay. "open client avatar" → capability → focused section.
- Known remaining nav gap (audited, not fixed): non-"business" estate phrases ("show me my estate") still dead-end via `runDirectEstateRoomNavigation`.

## Business Estate audit (done, no code written)

Overlay portal; all views wrapped in the frosted `EstateWorkspace` panel (the gray-block anti-pattern — same as the Client Avatar fix). `MyBusinessEstatePanel` views: overview / identity-entrance / business-basics / legacy-room. Business Basics autosaves (`companion-business-profile-v1` → `estate.identity`); legacy rooms (`BusinessEstateSectionEditor`) manual-save with **Chamber/Board Get Expert Help still embedded**. Retire candidates: `business-profile` AppSection (`BusinessProfilePanel`, 2 render sites, bounces to Welcome Home), orphaned `ExecutiveBusinessSnapshot`. Separate store for avatars (`companion-ideal-clients-v1`). Proposed bounded Phase 1: migrate Business Basics to the Contextual Workspace pattern + drop the frosted wrapper. Awaiting go-ahead.

## Verification workflow

- Tests: `npx vitest run <patterns>` (jsdom tests use `/** @vitest-environment jsdom */` + `react-dom/client` + `act`; there is NO `@testing-library/react`). The "not configured to support act(...)" stderr is a benign pre-existing warning.
- Typecheck baseline is **204 pre-existing errors** (`npx tsc --noEmit`); goal is "no NEW errors in changed files," not zero. Build is the real gate.
- `npm run build` must exit 0 (occasionally a transient Windows file-lock on `shariPhotoManifest.json` — just retry).
- **Live browser** (in-app preview on `localhost:3000`, `preview_start`/`preview_logs`): the chat composer does NOT respond to synthetic typing — drive it via `javascript_tool`: set the textarea value with the native setter + dispatch `input`, then dispatch a full `pointerdown/mousedown/pointerup/mouseup/click` sequence on the Send button. Reads via `get_page_text` / `javascript_tool`; no screenshots available. First load after edits recompiles the huge `CompanionPageClient.tsx` (~15–25s).

## Open / queued

1. **Step 10 correction (Client Avatar)** — NOT started; user referenced a screenshot I could not see. Requirements: (a) put "Step 10 of 11 / Refine this avatar further / helper" in a readable frosted header panel (dark high-contrast text, not text-shadow); (b) give EVERY research area its own "Research this area"/"AI research" action (Behavioral patterns, Motivation drivers, Buying behavior, Communication preferences, Market insights, "What I notice…", each custom field) auto-scoped to avatar + step + area key + existing answer; (c) remove the inactive top "Research" button, KEEP Print; (d) response actions Add to This Area / Keep Researching / Not Now (append, never overwrite); (e) preserve entered text across area switches / research open-close / Back; (f) 6 focused tests. The research area UI lives in `IdealClientBuilder.tsx` `current.key === "research"` (RESEARCH_MODULES) — only Market insights currently has an "AI research" action (`aiMarketInsights`). Confirm what the "top Research button" is before removing (likely the `STEP_NAV` pill or a leftover).
2. **Business Estate Phase 1** — awaiting approval.
3. **Push** `0d683ede` + `b5bf3be5` when instructed.
