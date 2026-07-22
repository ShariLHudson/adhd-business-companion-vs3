# 136 — Cursor Prompt: Platform Polish Phase 1

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Binds:** Spec **128** (Simplicity & Cognitive Load) · Spec **132** (Momentum Protection)  
**Create track:** 127–135 already shipped — do **not** redesign Create architecture  
**Companion DNA / Estate canon:** refinement only — no new product features unless required to complete a broken control  

---

## Mission

Major architecture is complete. Elevate the platform via **refinement only**: consistency, reliability, polish.

Store this prompt + produce report:

- `docs/platform/136_CURSOR_PLATFORM_POLISH_PHASE_1.md` (this file)
- `docs/platform/136_PLATFORM_POLISH_PHASE_1_REPORT.md`
- Pointer in `docs/architecture-v2/317_ARCHITECTURE_V2_MASTER_INDEX.md` and/or `docs/constitution/README.md` when natural

---

## Scope (Parts 1–14)

Prioritize **real, shippable fixes**.

1. **Navigation Simplification Audit** — Welcome Home, global nav, Create, Today, Reflect, Estate, Experience Controls, Profile. Ask merge / disappear / Shari-led / Search. Evaluate top-level groups for decision density. Investigate Quick Launch / search-as-navigation — **implement only if a thin, existing pattern can be extended**; otherwise document as Phase 2 (no half-built Quick Launch).
2. **Visual Consistency** — duplicate headings, spacing, typography, icons, buttons, empty states. Fix concrete duplicates found.
3. **Interface Trust** — overlapping text, z-index, hydration flash, layout jumps, loading inconsistencies.
4. **Reliability** — hydration/React warnings if reproducible; delayed buttons; double-click; race conditions. Fix code-level issues you can prove.
5. **Accessibility** — contrast, focus, keyboard, reduced motion, labels, targets on high-traffic surfaces.
6. **Sensory** — calm motion/imagery; don’t gut Estate beauty.
7. **Momentum** — Plan My Day, Adapt My Day, Reflect, Create, Projects, Business Pulse — unexpected nav, duplicate actions, hidden work.
8. **Estate Identity** — Where / Why / thinking type (copy/chrome fixes only).
9. **Experience Controls** — preserve; improve immediacy / reversibility if gaps found.
10. **Daily Experience** — Welcome / Today / Plan / Reflect — calm morning, clearer primary action.
11. **Performance** — unnecessary renders / layout shifts / duplicate requests where obvious.
12. **First Impression** — document + fix blockers to 60s orientation.
13. **Polish details** — remove confidence-reducing chrome.
14. **Final Certification** — honest Provisional vs Certified; browser/mobile if tools work.

---

## Process

1. Explore high-traffic surfaces: CompanionPageClient (**CAREFUL** — WIP + companionBehaviorAudit; prefer tiny hunks or avoid), Experience Controls, Welcome/Today, Plan My Day, Create estate (residual only), NavigationReturnBar / ProfileReturnBar.
2. Fix highest-impact concrete bugs (duplicate labels, trust leaks, a11y, ESC/momentum leftovers).
3. Prefer CSS/component fixes over CompanionPageClient rewrites.
4. Run focused vitest for touched areas; browser if MCP works.
5. Write Phase 1 report: issues found/fixed, deferred to Craftsmanship Sprint Phase 2, cadence recommendation (Capability vs Craftsmanship).
6. Narrow commit + push — **NEVER `git add .`**.

### Suggested commit

```
fix: platform polish phase 1 — trust, nav density, visual consistency (136)

Eliminate duplicate chrome, trust leaks, and decision density on high-traffic surfaces without adding new product features.
```

---

## Constraints

- NEVER `git add .`
- Avoid large CompanionPageClient changes; if needed, stage only verified hunks
- No new menus/features for Quick Launch unless already half-built and finishable
- Spec 128/132 bind
- Honest certification — do not claim full-platform 12/10

---

## Return checklist

Issues table · files · tests · browser status · certification verdict · commit hash · Phase 2 backlog bullets (incl. craftsmanship cadence)
