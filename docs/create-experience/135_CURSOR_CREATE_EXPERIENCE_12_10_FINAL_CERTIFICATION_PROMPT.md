# 135 — Cursor Prompt: Create Experience 12/10 Final Certification

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Parents:** 127–134 · Specs 128 · 130 · 131 · 132 · 133

## Mission

You are NOT redesigning architecture or adding optional features. You are completing Create: remove friction, uncertainty, inconsistency, cognitive load, and trust leaks until Create feels effortless.

Prior art already shipped:

- 127 simplification + refinements
- 128 Simplicity Constitution
- 129 polish
- 130 final polish (confirm everywhere, Manage My Work, Undo)
- 131 Intent Constitution
- 132 Momentum Protection
- 133 Explore Ideas

**Do not redesign.** Fix remaining gaps, polish, certify honestly.

## Parts 1–18 (execute systematically)

1. Trust leaks — dead/unfinished/duplicate/empty/wrong counts/IDs/placeholders
2. Momentum — ESC, nav surprise, resume, rename, progress, Undo
3. Intent — never silent guess; 3 alternatives when uncertain; flyer≠workshop; learn corrections if hooks exist
4. Explore Ideas — one discovery; no overlapping mental models
5. Continue Working — home; no Untitled/orphans/duplicates
6. AI Helpers — unique purposes, no placeholders/fake AI
7. Visual polish — calm loading, consistent chrome
8. Cognitive load audit — remove decisions/clicks/menus Spark can decide
9. ADHD certification
10. Simplicity — Where am I / What doing / Next step in 2s
11. Consistency — all paths Intent→Confirm→Create→Open→Current Focus
12. Micro-interactions — keyboard, ESC, focus, feedback
13. Trust audit
14. Emotional audit
15. No developer thinking in UI
16. Browser certification — if browser MCP/tools available, run Create walkthrough; else document blocked + max automated coverage
17. Independent user test (simulate + document)
18. Final certification — honest pass/fail; do NOT claim 12/10 if browser/a11y not actually verified

## Process

1. Create docs (this prompt + certification report)
2. Walk Create estate UI code
3. Fix concrete trust leaks found in code
4. Run focused vitest suites for createEstate / polish 129–133 / intent / momentum
5. Browser: try cursor-ide-browser or Playwright/e2e; if blocked (auth), document honestly
6. Narrow commit+push of fixes + certification report

## Suggested commit

```
fix: Create 12/10 certification polish (135)

Close remaining trust leaks, momentum gaps, and discovery inconsistencies; document honest certification results and known limitations.
```

## Constraints

- Specs 128/131/132 bind
- Avoid large CompanionPageClient edits unless tiny audit-safe
- Never `git add .`
- Do not certify as 12/10 if browser/independent testing couldn't run — mark Provisional / Partial with clear gaps

## Return

- Issues found & resolved (table)
- Before/after
- Tests + browser status
- Certification verdict (Certified / Provisional / Not certified) with honesty
- Commit hash
- Remaining limitations
