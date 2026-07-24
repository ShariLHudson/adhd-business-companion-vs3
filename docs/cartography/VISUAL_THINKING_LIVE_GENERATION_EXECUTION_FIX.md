# Visual Thinking Studio — Live Generation Execution Fix™

**Status:** Binding corrective — live UI execution path  
**Date:** 2026-07-24  
**Commit intent:** `fix(visual-thinking): repair live generation execution path`

---

## Observed failure

Screenshot route still opened a Thinking Workspace with only:

> Current product, platform, or market details are required and have not been verified.

Helper-level `runVisualThinkingResearchToResult` tests passed earlier, but the **browser UI path** could still show an empty/warning shell.

---

## Exact runtime route (screenshot flow)

1. `CompanionPageClient` → `activeSection === "visual-focus"`
2. `VisualFocusWorkspacePanel` hub → `VisualThinkingRequestPanel`
3. Submit: **Research and Build It for Me** (`startResearch`) or authorized **Continue** (`handleContinue`)
4. Orchestration: `runGenerateFirstPipeline` → `runVisualThinkingResearchToResult`
5. Stages: Understanding → Knowledge → Stable research findings → Merge → Generation → Presentation → `createThinkingWorkspace`

---

## Exact stop points repaired

| Failure | Cause | Fix |
|---------|-------|-----|
| Warning-only shell reopens | `loadThinkingWorkspace()` restored stale session without substance check | Reject + clear non-substantive loaded workspaces |
| Empty editor chrome | Warning-only workspace still rendered Fit/Organize/Add Idea | Recovery surface when not substantive; controls gated |
| Alternate generate path | `beginGenerationFromKnowledge` skipped research + instructional enrichment | Route through `runGenerateFirstPipeline` |
| Process looks empty | Process layouts collapsed at 6 into “More ideas” | Process/timeline collapse threshold raised to 32 |
| Warning as object | Gap / readiness text projected as Thinking Object | Filter verification-warning text from projection |
| False “fixed” without visibility | No live stage visibility | Dev-only execution trace + diagnostic panel |

---

## Research / generation truth

- Live web research provider is **not** configured in this environment (`liveResearchAvailable: false`).
- Stable instructional knowledge for Loom / screen-recording → YouTube **is** invoked and merged.
- Generation receives research facts + instructional material, not title + warning alone.

---

## Tests

- `VisualThinkingRequestPanel.loomLive.test.tsx` — same component + Research & Build handler as the browser
- Existing research-to-result / workspace foundation suites
- Panel tests updated for authorize-continue (no extra confirmation)

---

## Core belief

Do not fix the appearance of the failure. Fix the actual execution path the UI calls — and never reopen a warning-only shell as a finished result.
