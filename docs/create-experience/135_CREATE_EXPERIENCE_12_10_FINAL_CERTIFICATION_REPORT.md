# 135 — Create Experience 12/10 Final Certification Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Prompt:** [`135_CURSOR_CREATE_EXPERIENCE_12_10_FINAL_CERTIFICATION_PROMPT.md`](./135_CURSOR_CREATE_EXPERIENCE_12_10_FINAL_CERTIFICATION_PROMPT.md)  
**Parents:** 127–133 · Specs 128 · 130 · 131 · 132

---

## Certification verdict

**Provisional — not Certified 12/10**

Automated Create estate coverage is green after polish. Authenticated browser walkthrough and live independent a11y pass were **not** completed in this session (browser MCP could not hold a stable tab / no auth session). Do **not** treat Create as fully 12/10 until those gates run.

---

## Issues found & resolved

| # | Area | Issue | Before | After | Status |
|---|------|-------|--------|-------|--------|
| 1 | Trust / Spec 128 | Blueprint save ack exposed `blueprintId` + version | `Saved “…”(id @ version)` / `Saved Company Blueprint ${id}` | Human ack: saved + “open anytime from your library” — no IDs | **Fixed** |
| 2 | Continue Working | Empty / Untitled titles on cards | `Untitled Workshop` | `New Workshop` (display only) | **Fixed** |
| 3 | Interface truthfulness | Progress line duplicated status | `progressSummary` fell back to `statusLabel` → two identical lines | Progress only when distinct from status | **Fixed** |
| 4 | Momentum / ESC | Confirm open → Escape left Create | ESC dismissed whole entrance | ESC cancels confirm first; window Escape disabled while confirming | **Fixed** |
| 5 | Explore Ideas | Duplicate Continue Working inside Explore | Full resume list on home **and** in Explore | Explore keeps Recent + Previous Work only; active work stays on home | **Fixed** |
| 6 | Intent | Medium confidence often &lt;2 alternatives | Sparse `alsoConsidered` | Wording-aware candidates (workshop/event/newsletter/…) capped at 3 | **Fixed** |
| 7 | Intent / 131 Rule 13 | No correction hooks | Gate documented only | Session `intentCorrectionHooks` on also-considered switch | **Fixed** (session-only; Intent Memory™ still future) |
| 8 | Test drift | Entrance wiring test expected stale `companionLed` | Brittle fail | Asserts `useDismissibleWindow` / Escape wiring | **Fixed** |
| 9 | AI Helpers | Dedicated “AI Helpers” surface | N/A on Create estate entrance | Working tools are real (Save, Build draft, Undo) — no fake helper stubs found | **Pass / N/A** |
| 10 | Browser / a11y | Live Create walkthrough | Deferred since 127/129/130 | Attempted cursor-ide-browser; tab lifecycle unstable; no auth | **Blocked** |

---

## Parts 1–18 status

| Part | Result | Notes |
|------|--------|-------|
| 1 Trust leaks | **Pass (code)** | IDs, Untitled, duplicate progress, Explore overlap closed |
| 2 Momentum | **Pass (code)** | ESC layering, Undo retained, soft leave (132) retained |
| 3 Intent | **Pass (unit)** | Flyer≠workshop; alternatives; session correction hooks |
| 4 Explore Ideas | **Pass (code)** | One discovery; no nested Continue Working list |
| 5 Continue Working | **Pass (code)** | Home-only active list; New {Type} display |
| 6 AI Helpers | **Pass / N/A** | No placeholder AI helper panel on estate Create |
| 7 Visual polish | **Partial** | No chrome redesign; calm feedback strings preserved |
| 8 Cognitive load | **Pass (code)** | Removed duplicate resume decision surface |
| 9 ADHD | **Partial (code audit)** | Fewer competing lists; confirm focus retained; browser ADHD pass deferred |
| 10 Simplicity (2s) | **Partial** | Hierarchy clear in code/copy; Ten-Second Rule needs human browser |
| 11 Consistency | **Pass (unit)** | Intent→Confirm→Open across NL + Explore |
| 12 Micro-interactions | **Pass (code)** | ESC confirm cancel; rename Escape; Begin feedback |
| 13 Trust audit | **Pass (code)** | No silent create; no ID acks; Undo path |
| 14 Emotional audit | **Partial** | Copy review only (Shari-safe); no live session |
| 15 No developer thinking | **Pass (touched surfaces)** | Blueprint IDs removed from acks |
| 16 Browser certification | **Blocked** | See below |
| 17 Independent user test | **Simulated** | Checklist below — not run by a fresh human |
| 18 Final certification | **Provisional** | Honest gap: browser + independent + full a11y |

---

## Files changed

- `docs/create-experience/135_CURSOR_CREATE_EXPERIENCE_12_10_FINAL_CERTIFICATION_PROMPT.md`
- `docs/create-experience/135_CREATE_EXPERIENCE_12_10_FINAL_CERTIFICATION_REPORT.md`
- `lib/activeWorkspaceRegistry/continueCardProjection.ts`
- `lib/createEstate/intentCorrectionHooks.ts` *(new)*
- `lib/createEstate/resolveCreateBeginOutcome.ts`
- `lib/createEstate/resolveCreateBeginOutcome.test.ts`
- `lib/createEstate/createCertification135.test.ts` *(new)*
- `lib/createEstate/copy.ts`
- `components/companion/CreateEstateEntrancePanel.tsx`
- `components/companion/CreateExploreIdeasPanel.tsx`
- `components/companion/CreateEstateWorkingPanel.tsx`

---

## Tests

```bash
npx vitest run \
  lib/createEstate/createCertification135.test.ts \
  lib/createEstate/createDiscovery133.test.ts \
  lib/createEstate/createIntent131.test.ts \
  lib/createEstate/createPolish130.test.ts \
  lib/createEstate/createPolish129.test.ts \
  lib/createEstate/exploreIdeas/exploreIdeas.test.ts \
  lib/createEstate/resolveCreateBeginOutcome.test.ts \
  lib/createEstate/createTitleFromIntent.test.ts \
  lib/createEstate/createScrollContract.test.ts \
  lib/createEstate/createEstateDestination.test.ts \
  lib/windowDismiss/windowDismiss.test.ts \
  lib/sparkMomentumProtection/types.test.ts
```

**Result:** all listed files **passed** (135 alone: 8/8; combined re-runs green).

No Create Playwright e2e suite found in-repo for authenticated Create estate.

---

## Browser status

| Step | Result |
|------|--------|
| cursor-ide-browser available | Yes (server ready) |
| Open tab + navigate `http://localhost:3000/companion` | **Failed** — tab create/navigate race (`No browser tab available` / `Browser view not found`) |
| Authenticated Create walkthrough | **Not run** |
| Playwright Create e2e | **Not present** |

**Limitation documented honestly:** same class of blocker as 127 #19 / 129 / 130 — needs a logged-in Preview/local session and a stable browser harness.

---

## Independent user test (simulated)

Simulated first-time mental model against code + unit paths (not a live human):

1. NL “Weekly newsletter…” → confirm → Create → expect intent-like title — **unit covered**
2. Explore idea → confirm → Cancel → no Work — **wiring covered**
3. Explore → Create → open + Current Focus — **wiring covered; browser deferred**
4. Continue Working fields — **unit/display covered**
5. Manage My Work archive/trash/restore — **wiring covered (130)**
6. Undo after create — **unit + wiring**
7. ESC during confirm cancels confirm — **code + unit string assert**
8. Flyer for workshop ≠ Workshop plan — **unit covered**
9. Explore does not re-list active Continue Working — **unit covered**

Human checkbox for live Preview remains open.

---

## Remaining limitations

1. **Browser / Preview certification** — required for Certified 12/10  
2. **Full a11y audit** (screen reader, focus order beyond confirm focus) — not run live  
3. **Intent Memory™** — session correction hooks only; no durable preference store (Spec 131 / 112)  
4. **CompanionPageClient** — avoided large edits; behavior audit WIP elsewhere  
5. **UBI “Blueprint” member language** on advanced save controls — still present as feature naming; only ID leakage removed (wider rename = redesign, out of scope)  
6. **Company / Personal Explore libraries** — still mostly Spark Recommended (133 deferred)

---

## Spec binding check

| Spec | Honored? |
|------|----------|
| 128 Simplicity | Yes — no architecture IDs in member acks; Continue display humanized |
| 131 Intent | Yes — confirm, alternatives, flyer≠workshop, correction hooks |
| 132 Momentum | Yes — Escape dismisses confirm layer first |

---

## Suggested next step to reach Certified

1. Authenticated Preview: run independent checklist in report § Independent user test  
2. Confirm Escape / Undo / Explore hierarchy visually  
3. Spot-check a11y (confirm region focus, Manage My Work checkboxes)  
4. Re-open this report → flip verdict to **Certified** only when those pass
