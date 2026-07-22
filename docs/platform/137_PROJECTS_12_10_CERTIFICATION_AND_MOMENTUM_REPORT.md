# 137 — Projects 12/10 Certification & Momentum — Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Binds:** Spec **128** · Spec **132**  
**Verdict:** **Provisional 12/10** — code-level P0 shipped; full browser / ADHD live pass deferred  

---

## Issues fixed

| # | Issue | Fix |
|---|--------|-----|
| 1 | Add Task required a named Section (`ProjectBreakdown`) | Inbox capture — root tasks, no section; grouping Yes / Later / Keep as Inbox |
| 2 | Wizard Required/Optional unclear | Labeled Required (intention/what) vs Optional (purpose/why/pieces) on Panel + Homes |
| 3 | Double-collapsed resume (Recent/All + row expand) | Continue Project strip + Current Focus + Continue →; Recent flat; View All disclosure |
| 4 | Overview buried Outcome/Next/Suggest | Smart overview always visible; Status/Color/Horizon/Goals under Project Details |
| 5 | Thin Suggest Next Step | Helpers: Suggest / I'm Stuck / Break It Down / Simplify / What Matters Most? (+ Project Brain modifiers; honest local fallback) |
| 6 | Related work prototype-only | Wire `summarizeRelatedProjectWork` (conversations/files/links/notes) when hooks have data |
| 7–8 | Classification / metadata before capture | Capture Before Classification™ + hide metadata until meaningful work |
| 9 | Continue Working | Existing Active Work / Continuity patterns retained; Projects Panel resume aligned |
| 10–12 | Momentum / ADHD | Removed nested accordion resume; capture-first Inbox; deferred full browser cert |

---

## Constitution — Capture Before Classification™

| Artifact | Path |
|----------|------|
| Product Constitution article | `docs/constitution/113_SPARK_ESTATE_PRODUCT_CONSTITUTION.md` |
| Series index pointer | `docs/constitution/README.md` |
| Cursor rule | `.cursor/rules/capture-before-classification.mdc` |
| Prompt | `docs/platform/137_CURSOR_PROJECTS_12_10_CERTIFICATION_AND_MOMENTUM_PROMPT.md` |

**Law:** Spark Estate must never require classification before capture (Projects, tasks, notes, ideas, evidence, journal, Clear My Mind, Parking Lot).

---

## Key code

- `lib/projects/projectInbox.ts` · `suggestNextStepHelpers.ts` · `projectRelatedWork.ts`
- `components/companion/ProjectBreakdown.tsx` — Inbox UI
- `components/companion/ProjectsPanel.tsx` — resume, smart overview, wizard labels, helpers
- `components/companion/projectHomes/ProjectHomeDetail.tsx` · `ProjectHomesPrototypePanel.tsx`
- `app/api/project-brain/route.ts` — `matters` modifier

---

## Tests

```
npx vitest run \
  lib/projects/projectInbox.test.ts \
  lib/projects/suggestNextStepHelpers.test.ts \
  lib/projectHomes/projectHomesUsability.test.ts \
  components/companion/projectHomes/ProjectHomesUsability.test.tsx
```

**Result:** 29 passed  

---

## Certification verdict

**Provisional** — shippable P0 for capture-first Inbox, momentum resume, progressive overview, and constitutional binding.

### Deferred

- Full live browser / mobile ADHD walkthrough (MCP/browser not run this pass)
- Deeper related-work / LIG inference beyond existing store hooks
- Pulse / Search / Create Continue Working cross-surface polish beyond existing Active Work patterns
- Richer Inbox capture for notes/links as first-class inbox kinds (tasks + notes via existing paths)

### ADHD / Momentum notes (code-level)

- No “Where should this go?” before Add Task  
- Resume is one primary Continue Project — not nested accordions  
- Metadata deferred until meaningful work  
- Suggest helpers reduce stuckness without fake AI theater (local fallback when brain unavailable)
