# Visual Thinking Studio — Research-to-Populated Workspace Fix™

**Status:** Binding corrective — execution correctness  
**Date:** 2026-07-24  
**Commit intent:** `fix(visual-thinking): complete research-to-populated-result execution`  
**Runtime:** `lib/cartographersStudio/visualThinkingResearchToResult.ts` · knowledge · research acquisition · workspace foundation · request panel  

---

## Observed failure

Request: **“How to Create a Loom Video”**

Opened Thinking Workspace with title / “Visual Process” chrome, **no meaningful steps**, and the blocking notice:

> Current product, platform, or market details are required and have not been verified.

Controls (Fit View, Auto Organize, Focus, Add Idea, Show This Differently, Written Review) appeared against an empty or warning-only result.

---

## Root cause (exact chain)

| Stage | Failure |
|-------|---------|
| **1. Request default** | `research_assisted` entry path defaulted `requestedOutput` to **`report`** when `detectRequestedOutput` missed plain `how to` (it required `how to i`). |
| **2. Understanding** | Explicit `report` forced `recommendedPrimaryOutput = report` despite `primaryGoal = learn_how`. |
| **3. Research strategy** | Optional Loom research → `excludedSourceKinds: ["external_research"]` → **`internal_only`** → research items **`blocked`**. |
| **4. Acquisition** | Findings matched the blocked item and were **`continue`d / skipped** — never merged. |
| **5. Gap merge** | `partially_resolved` findings never closed `current_external_facts` (required `"resolved"`). |
| **6. Generation** | Thin **report** shell generated (no instructional steps). |
| **7. Workspace** | Entry allowed with warning as `completenessNotice`; **1 object**; controls always rendered. |

**Primary failing stage:** merge / wrong-deliverable handoff (stages 1–4), not “research provider offline.”

---

## Fixes

1. **`detectRequestedOutput` / `inferResearchAssistedDefaultOutput`** — recognize `how to` / guides; never default Research & Build to report for how-tos.  
2. **`runVisualThinkingResearchToResult`** — requested outcome overrides plan primary for guides/training (no longer skipped).  
3. **Knowledge plan** — current product requests do not exclude external research.  
4. **Research acquisition** — unblock blocked items when trusted findings arrive; close `current_external_facts` on partial verification with localized freshness.  
5. **`canOpenThinkingWorkspace` + entry eligibility** — reject warning-only / insufficient substance; localize incomplete notices.  
6. **Control visibility** — Fit / Auto Organize / Focus / Undo / Add Idea / Show Differently / Written Review require substantive prerequisites.  
7. **Recovery UI** — when pipeline cannot open a populated workspace, show Build Useful Guide / Retry Research (not an empty editor shell).

---

## Correct pipeline (enforced)

User Request → Understanding → Requested Outcome → Knowledge → Research (when needed) → Normalize/Merge → Reassess → **Generate** → Validate → Project → Validate workspace → Open populated result  

Forbidden: plan/research/warning → ready · empty shell as complete.

---

## Request-as-authorization

Create / build / research and create / how to / show me authorize continuation through research and generation without extra confirmation gates.

---

## Scoped readiness

A single unverified UI label must not erase stable preparation, recording, review, sharing, and upload guidance. Freshness is localized.

---

## Tests

- Short Loom how-to: guide + ≥8 steps + populated workspace + no verification-only notice  
- Existing research-to-result / generate-first / knowledge / workspace suites  

---

## Browser validation

Authenticated browser validation was not available in this session. Manual steps:

1. Welcome Home → Visual Thinking Studio → Research & Build  
2. Enter: `How to Create a Loom Video`  
3. Confirm progress reaches generation  
4. Confirm substantive guide + process objects  
5. Confirm Written Review has real steps  
6. Confirm no warning-only empty workspace  
7. Refresh — result persists  

---

## Core belief

Research is not the result. A warning is not the result. A workspace shell is not the result. The requested substantive creation is the result.
