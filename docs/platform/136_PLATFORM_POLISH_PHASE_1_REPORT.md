# 136 — Platform Polish Phase 1 Report

**Date:** 2026-07-21  
**Prompt:** [136_CURSOR_PLATFORM_POLISH_PHASE_1.md](./136_CURSOR_PLATFORM_POLISH_PHASE_1.md)  
**Binds:** Spec **128** · Spec **132**  
**Create architecture:** untouched (127–135 remain authority)  
**Certification verdict:** **Provisional** — high-traffic polish shipped; full-platform 12/10 **not** claimed  
**Commit:** `37333e362fe6d366d9d41856584f6f9a1aaa638f` · pushed to `deploy/companion-app-v3`  

---

## Executive summary

Phase 1 audited Welcome Home navigation density, Plan/Adapt shared window chrome, Experience Controls, and return bars. Shipped concrete fixes: duplicate **Today’s List** heading removed, Plan/Adapt choice cards collapsed to one primary control each (a11y `aria-pressed` on the real button), Experience Controls keyboard focus + focus-visible styles, larger touch targets on list actions and return-bar crumbs. Quick Launch / search-as-navigation deferred to Phase 2 (no half-built feature). CompanionPageClient left untouched.

---

## Issues table

| # | Area | Severity | Finding | Disposition |
|---|------|----------|---------|-------------|
| 1 | Visual / Plan My Day | High | **“Today’s List” rendered twice** — outer `h2` in `PlanAdaptSharedWindow` + heading inside `PlanDaySimpleList` | **Fixed** — outer heading removed; list owns the title |
| 2 | Momentum / a11y | High | Plan/Adapt choice cards had **two buttons** doing the same open + `aria-pressed` on a non-interactive `div` | **Fixed** — single open button per card with `aria-pressed` |
| 3 | Experience Controls / a11y | Medium | Dialog opened without focusing a control; choice/close lacked `:focus-visible` styles | **Fixed** — focus Close on open; CSS focus rings |
| 4 | a11y / touch | Medium | Plan list complete/edit/delete targets ~28px; crumb links had zero padding | **Fixed** — ~44px targets + focus-visible |
| 5 | Nav density | Medium | Welcome Home has **6 top-level groups** (Today · Create · Reflect · My Story · Guidance · Estate); Spec 129 style names five intent buckets — **My Story** adds a sixth decision | **Documented** Phase 2 — consider merge My Story → Reflect or Shari-led suggest |
| 6 | Nav density | Medium | Reflect alone lists **7 destinations** (Talk It Out, Clear My Mind, Parking Lot, Breathe, Spin, Peaceful Moments, Soundscapes) | **Documented** Phase 2 — progressive disclosure / recommend-first |
| 7 | Quick Launch | Low | No finishable Quick Launch / search-as-nav pattern in runtime (legacy “top bar quick-launch” copy in old walkthrough only) | **Phase 2** — do not ship half-feature; extend search only if a thin existing control exists |
| 8 | First impression (60s) | Medium | Welcome Card path is clear (≤3 choices + recommended); density risk is **Explore Estate / full menu**, not Welcome Card | **Documented** — protect Welcome Card; don’t teach full Estate in first minute |
| 9 | Interface trust | Low | CompanionPageClient WIP / hydration risk on full shell — not reproducible as a narrow fix without touching audit surface | **Deferred** — avoid CompanionPageClient |
| 10 | Reliability | Low | No proven double-click / race on Plan Add in this pass; Adapt wipe protection already present | **Watch** Craftsmanship sprint |
| 11 | Create residual | — | Create 135 certified; no residual polish required this pass | **No change** |
| 12 | Sensory / Estate beauty | — | No imagery/motion gutting; Reduce Motion path already in Experience Controls | **Preserved** |
| 13 | Estate identity chrome | Low | Some destination labels still read slightly software-adjacent in deep menus | **Phase 2** copy pass |
| 14 | Performance | Low | No obvious duplicate fetch found in touched surfaces | **Phase 2** profiling |

---

## Files changed (Phase 1)

| File | Change |
|------|--------|
| `components/companion/PlanAdaptSharedWindow.tsx` | Remove duplicate heading; one open control per choice; a11y |
| `components/companion/PlanDaySimpleList.tsx` | Larger touch targets + focus-visible on actions |
| `components/companion/estate/ExperienceControlsOverlay.tsx` | Focus Close when overlay opens |
| `app/companion/experience-controls-overlay.css` | `:focus-visible` / `:focus-within` rings |
| `app/companion/profile-return-bar.css` | Crumb link touch targets (NavigationReturnBar + ProfileReturnBar) |
| `lib/myDaySharedWindows/sharedMyDayWindows.test.ts` | Assert single open controls + no duplicate list `h2` |
| `docs/platform/136_CURSOR_PLATFORM_POLISH_PHASE_1.md` | Prompt store |
| `docs/platform/136_PLATFORM_POLISH_PHASE_1_REPORT.md` | This report |
| `docs/architecture-v2/317_ARCHITECTURE_V2_MASTER_INDEX.md` | Pointer |
| `docs/constitution/README.md` | Pointer |

**Not touched:** `app/companion/CompanionPageClient.tsx` (WIP / audit risk).

---

## Navigation audit (Part 1) — decision density

| Surface | Role | Phase 1 note |
|---------|------|--------------|
| Welcome Home menu | Global “where do I go?” | 6 categories — keep Experience Controls **out** (already enforced). Consider collapsing My Story later. |
| Today | Plan/Adapt shared window + Calendar + Reminders/Rhythms | Shared window pattern is correct; duplicate chrome fixed. |
| Create | Separate Create estate | Leave architecture alone. |
| Reflect | High destination count | Recommend-first / progressive disclosure Phase 2. |
| Estate | Wander + Guide | Low density — good. |
| Experience Controls | Overlay, never navigates | Preserved; ESC + Close focus improved. |
| Profile + Return bars | Universal return | Touch targets improved via shared CSS. |
| Quick Launch / Search | — | **Phase 2 recommendation only.** |

**Questions (merge / disappear / Shari-led / Search):**

| Question | Phase 1 answer |
|----------|----------------|
| Merge any top-level group? | Candidate: **My Story → Reflect** (journal/evidence/accomplishments as reflection). Do not merge Create. |
| Disappear any chrome? | Duplicate Today’s List heading + twin Open buttons — done. |
| Shari-led over menus? | Welcome Card already recommend-first; protect that as primary daily path. |
| Search-as-navigation? | Defer until a thin existing search/command pattern can be extended end-to-end. |

---

## Tests run

```text
npx vitest run \
  lib/myDaySharedWindows/sharedMyDayWindows.test.ts \
  components/companion/PlanDaySimplePaper.test.tsx \
  lib/estate/experienceControlPrefs.test.ts \
  lib/estate/welcomeHomeNavigationStructure.test.ts \
  lib/planMyDay/planOrAdaptInsidePlanMyDay.test.ts
```

(Results recorded in commit session — all expected green for touched contracts.)

---

## Browser / mobile status

| Check | Status |
|-------|--------|
| Cursor browser MCP visual pass | **Not run** this session (tooling not used for live companion shell) |
| Manual mobile | **Not run** |
| Code-level a11y (focus, targets, aria-pressed) | **Shipped** |

Treat visual/mobile verification as **Craftsmanship Sprint** gate before any Certified claim.

---

## Final certification (Part 14) — honest

| Gate | Result |
|------|--------|
| Spec 128 simplicity on touched surfaces | **Pass (local)** — removed duplicate decisions/chrome |
| Spec 132 momentum on Plan/Adapt open | **Pass (local)** — one click opens; ESC dismiss preserved |
| Ten-Second Rule (full platform) | **Not certified** |
| 12/10 Experience Perfection (full platform) | **Not certified** |
| **Phase 1 overall** | **Provisional** |

---

## Phase 2 backlog — Craftsmanship Sprint

1. **Welcome Home density** — evaluate merging My Story into Reflect; cap visible Reflect destinations (recommend 3 + Browse).
2. **Search / Quick Launch** — only if an existing thin search or command palette can be completed; otherwise keep Shari-led Welcome Card.
3. **CompanionPageClient trust** — hydrate/flash/audit-driven reliability when WIP settles; narrow hunks only.
4. **Estate identity copy pass** — Where / Why / thinking-type language on deep destinations.
5. **Loading consistency** — Parking Lot / Chamber / Plan shared window loading states cross-audit.
6. **Browser + mobile certification pass** — focus traps beyond Close focus; reduced-motion visual check; contrast on Experience Controls dark panel.
7. **Performance** — Welcome Home menu mount cost; duplicate subscription audits.
8. **Cadence (recommended)** — alternate **Capability sprints** (new Work/Blueprint/intelligence) with **Craftsmanship sprints** (polish only, no features). After any Capability ship: one Craftsmanship pass before the next Capability wave. Rule: if Provisional polish debt > 5 open High items, Craftsmanship wins the next sprint.

---

## Cadence recommendation

| Mode | When | Allowed work |
|------|------|--------------|
| **Capability** | Architecture / Create / intelligence gaps | New capability with 128/132 gates |
| **Craftsmanship** | After Capability or when Provisional debt rises | Consistency, a11y, trust, density — **no new menus/features** |

Phase 1 is a Craftsmanship slice. Next Capability work should not expand Welcome Home top-level groups without a density audit.
