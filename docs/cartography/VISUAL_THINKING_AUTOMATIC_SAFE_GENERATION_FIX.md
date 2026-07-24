# Visual Thinking — Automatic Safe Generation Fix

**Commit intent:** `fix(creation): auto-generate useful result when live research is unavailable`

## Observed screenshot state

After the prior research-to-result repair, the live route no longer opened a warning-only empty Thinking Workspace. Instead it stopped on a recovery screen:

- “Still building your result”
- “I could not open a finished workspace yet…”
- Primary action: **Build the Useful Guide**
- Secondary: **Retry Current Research**
- Presentation notice: “No primary result is available to present.”

That recovery UI is rendered by `VisualThinkingRequestPanel` when `pipelineRecovery` is true (`knowledge` / `research` / thin `generation` present and `hasSubstantiveResult` is false). **Build the Useful Guide** called `runGenerateFirstPipeline(request.rawRequest)` — the same path that should already have run.

## Exact root cause

Several interacting failures:

1. **Authorization misclassified as awaiting choice** — when live research was unavailable, the platform treated continuation as a user decision even though creation was already authorized.
2. **`awaiting_research` blocked workspace entry** — `canOpenThinkingWorkspace` rejected `awaiting_research` even when substantive instructional steps existed, so `createThinkingWorkspace` returned null.
3. **Stale session restore** — restoring `knowledgeBundle` / `researchBundle` without a substantive result showed recovery and did **not** auto-continue (the preview auto-continue effect explicitly bailed when `knowledgeBundle` was present).
4. **Plan override status** — adding supporting `process_flow` / `checklist` via `applyExperiencePlanOverride` left the plan in `user_adjusted`, so generation failed with “Plan was not confirmed” and empty deliverables → “No primary result is available to present.”

Generation had often not completed a bound primary result; when it produced usable steps under `researchBlocked`, the workspace gate still refused entry. The recovery button was a redundant second authorization.

## Authorization rule

The original request authorizes:

- attempt current research;
- generate from stable instructional knowledge when live research is unavailable;
- create primary + eligible supporting deliverables;
- validate and open the result.

A second click is **not** required to use safe stable knowledge unless the member explicitly required verified-current-only content, essential user-owned input is missing, or a consequential assumption would be required.

## Automatic fallback transition

Replace:

`research_unavailable → awaiting_user_choice → Build the Useful Guide → safe_generation`

With:

`research_unavailable → safe_generation_in_progress → outcome_validation → workspace_projection → partial_ready_with_substantive_result`

## Safe-generation predicate

`shouldAutomaticallyContinueWithSafeGeneration` in `lib/cartographersStudio/visualThinkingGenerateFirst.ts`:

Returns true when creation is authorized, live research is unavailable or failed, stable substantive knowledge exists, a useful result can be generated, no essential user input is missing, no consequential assumption is required, and the user did not prohibit unverified fallback.

For the Loom request this returns **true**.

## Primary-result binding

- Safe generation passes `knowledgeResearchSatisfied: true` when auto-continue applies so runs are not left research-blocked without a usable status.
- Substantive instructional content under research-blocked generation resolves to `partial` (not empty `awaiting_research`).
- Workspace entry allows `awaiting_research` when substantive content is already present.
- Plan overrides are re-confirmed to `ready_to_generate` before generation.
- Guide requests auto-include `process_flow` + `checklist` supporting deliverables.
- UI suppresses “No primary result is available to present” when a substantive result exists; freshness notice is shown instead.
- Recovery with safe auto-continue shows progress and immediately re-invokes `runGenerateFirstPipeline` — **Build the Useful Guide** is removed from that path.

## Retry Current Research

Appears as a **secondary** control only after a substantive result exists. It re-runs the pipeline without deleting the authorized creation intent; user edits remain in session until a successful regenerate merges. It must not be the only path to obtain the guide.

## Shared impact (Create / Projects)

Audited Create Estate and Projects for the same recovery choice pattern. This recovery UI and research→generation continuation live in Visual Thinking Studio / cartographersStudio orchestration (`runVisualThinkingResearchToResult`, generate-first helpers). Create and Projects do not share this exact recovery screen.

Platform-wide rule still applies wherever shared: **when creation is authorized and safe substantive generation is possible, research unavailability must not stop creation.** Destination presentation may differ; execution should continue. The predicate is exported from the cartographersStudio index for reuse.

## Tests

- Unit: `shouldAutomaticallyContinueWithSafeGeneration` Loom true / verified-only false
- Unit: Loom instructional material ≥ 26 steps + process groups
- Pipeline: Loom auto-safe generation creates primary guide + process_flow + workspace
- Generation: research-required Loom yields usable partial, not empty shell
- Integration (`VisualThinkingRequestPanel.loomLive.test.tsx`): stale knowledge recovery auto-continues without Build the Useful Guide; Retry appears after result; Research & Build / Continue paths remain green

## Browser validation

Validate on the live companion route:

1. Welcome Home → Visual Thinking Studio
2. Enter the Loom research + guide request
3. With live research unavailable (default in this runtime)
4. Confirm no Build the Useful Guide stop
5. Confirm populated guide + visual process + freshness notice
6. Confirm Retry Current Research secondary after result
7. Refresh during/after generation restores populated result

## Loom acceptance standard (not the only supported guide)

- Title: How to Record a Loom Video and Upload It to YouTube
- ≥ 26 guide sections / numbered steps covering prepare → record → review → share/download → YouTube → troubleshoot → checklist
- Visual process groups: Prepare, Set Up, Record, Review, Share or Download, Upload to YouTube, Final Check
- Localized freshness notices only where interface labels may differ
