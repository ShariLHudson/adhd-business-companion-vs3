# Spark Estate V4 — Foundation Pass Executive Report

| Field | Value |
|-------|-------|
| **Date** | 2026-06-30 |
| **Status** | **Complete — review only, no code changed** |
| **Scope** | Full architectural audit vs Constitution · Living in Spark Estate · Bible |

---

## Mission outcome

All Foundation Pass prompts are **complete**. Implementation was **not** modified. Three audit artifacts plus this executive summary document the gap between **Estate vision** and **V4 runtime**.

---

## Bottom line

Spark Estate is **defined as a living world** in canon. V4 still **behaves like a companion application** with estate photography:

| Signal | State |
|--------|--------|
| Canon documents | ✅ Binding and clear |
| Room registry (concept) | ✅ Right direction; not sole source of truth |
| Member immersion | ❌ Broken by Scene 4 of first visit (invitation grid) |
| Code alignment | ❌ Structural drift — duplicates, not polish |

**Rule for all future work:** *Does this feel like software?* → simplify until it feels like a place.

---

## Deliverables (read in this order)

| # | Document | Purpose |
|---|----------|---------|
| 1 | [FOUNDATION_PASS_EXECUTIVE_REPORT.md](./FOUNDATION_PASS_EXECUTIVE_REPORT.md) | **This file** — decisions and sequence |
| 2 | [V4_FOUNDATION_PASS_ARCHITECTURAL_REVIEW.md](./V4_FOUNDATION_PASS_ARCHITECTURAL_REVIEW.md) | **30 conflicts** (FP-001…FP-030) with required fields |
| 3 | [ARCHITECTURAL_RESET_GAP_REPORT.md](./ARCHITECTURAL_RESET_GAP_REPORT.md) | **28 gaps** (GAP-001…GAP-028) — technical depth |
| 4 | [NEW_MEMBER_IMMERSION_WALKTHROUGH.md](./NEW_MEMBER_IMMERSION_WALKTHROUGH.md) | **Lived experience** — where software breaks home |

**Authorities:** [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md) · [ARCHITECTURAL_RESTORATION.md](./ARCHITECTURAL_RESTORATION.md)

---

## Conflict counts

| Priority | Count | IDs |
|----------|-------|-----|
| **P0** | 10 | FP-001, 002, 003, 006, 010, 011, 013, 014, 016, 020 |
| **P1** | 11 | FP-004, 005, 007, 008, 009, 015, 018, 021, 024, 025, 027 |
| **P2** | 8 | FP-012, 017, 019, 022, 023, 026, 028, 029 |
| **P3** | 1 | FP-030 |

---

## Top 10 structural problems

1. **`CompanionPageClient.tsx`** (~5,500 lines) — entire app in one file; mode flags pick layout  
2. **Six UI shells** — welcome cinematic, split workspace, estate overlay, institute, stables, profile  
3. **Fourteen routing paths** — no single `goToPlace()`; thread continuity inconsistent  
4. **Seven registry/copy sources** — same place described differently; drift risk  
5. **Triple navigation** — sidebar + top bar + global ⋯ menu (+ back, ACTIVE bar)  
6. **Double arrival** — title/motto plaque **then** emoji invitation grid  
7. **Bottom-right chat** — messenger widget, not centered conversation  
8. **Software copy** — “Step into…”, “While you're here…”, signpost directions  
9. **Bible objects as chrome** — Guidebook FAB, map reveals sidebar, celebration as chat card  
10. **Asset drift** — 27 registry rooms, ~16 background files; wrong/missing fallbacks  

---

## When immersion fails (new member timeline)

| Scene | Moment | Software tell |
|-------|--------|---------------|
| 1 | Login | Spark Studio Companions, ADHD Business Ecosystem™, Opening your space… |
| 2 | First visit | Cinematic dolly, **Stop** button, timed chat unlock |
| 3 | Welcome Home | Bottom-right chat + ⋯ menu + Guidebook FAB |
| 4 | **Immersion lost** | While you're here… / Plan My Day / Explore the Estate grid |
| 7 | Leave home | Sidebar, top bar, ACTIVE workspaces, 15-item menu |
| 8+ | Create / Grow | Split panes, placeholder “architecture is in place” |

Full narrative: [NEW_MEMBER_IMMERSION_WALKTHROUGH.md](./NEW_MEMBER_IMMERSION_WALKTHROUGH.md)

---

## What already aligns (do not discard)

- Three founding documents + architectural authority manifest  
- `estateRoomRegistry.ts` as the right abstraction (make it authoritative)  
- Phase 1 Library vs Momentum Institute registry split  
- Full-bleed room backgrounds + ambience direction  
- `estateRoomAliasRegistry` for conversational place names  
- Welcome Home temporarily hiding sidebar/top bar (extend estate-wide)  
- `ESTATE_IMAGE_BIBLE.md` (needs runtime manifest wiring)  
- Observation Mode — no feature sprawl during reset  

---

## Approved correction sequence (no new features)

```text
Phase A — FREEZE     Feature work stopped; charter active
Phase B — REGISTRY   FP-011: single source + CI bijection tests
Phase C — ROUTING    FP-010: one goToPlace pipeline
Phase D — SHELL      FP-001–003, FP-004: one layout + centered chat
Phase E — NAV        FP-006–009, FP-007–008: remove chrome; real map + guide objects
Phase F — ARRIVAL    FP-013–015: no plaques/grids on Living Places
Phase G — VOICE      FP-016: estate copy pass; ban “Step into”
Phase H — ASSETS     FP-025: 1:1 room → background manifest
Phase I — DESTINATIONS FP-021–024: presentation only (Institute, Evidence, celebration)
Phase J — VERIFY     Re-run new member walkthrough; Spec 119 gates on sample turns
```

**Do not start Phase I until D–F complete** — objects must not attach to invalid chrome.

---

## Area checklist (audit coverage)

| Area | Reviewed | Primary FP/GAP IDs |
|------|----------|-------------------|
| Conversation flow | ✅ | FP-016, FP-017, GAP-025 |
| Navigation | ✅ | FP-006, FP-007, GAP-002 |
| Room transitions | ✅ | FP-013, FP-014 |
| Routing | ✅ | FP-010, GAP-010 |
| Chat placement | ✅ | FP-003, FP-004 |
| UI behavior | ✅ | FP-002, FP-005, FP-029 |
| Prompts | ✅ | FP-016, FP-014 |
| Menus | ✅ | FP-006, FP-009 |
| Room vocabulary | ✅ | FP-011, FP-012 |
| Background usage | ✅ | FP-025, GAP-012 |
| Duplicate systems | ✅ | FP-001, FP-002, FP-006 |
| Duplicate routing | ✅ | FP-010 |
| Duplicate registries | ✅ | FP-011 |
| Duplicate chat | ✅ | FP-003 |
| Duplicate room logic | ✅ | FP-027 |
| Onboarding | ✅ | FP-018, FP-019, GAP-020 |
| Profile/settings | ✅ | FP-023, FP-009 |
| Estate map | ✅ | FP-007 |
| Guidebook | ✅ | FP-008 |
| Momentum Institute | ✅ | FP-021 |
| Celebration | ✅ | FP-024 |
| Evidence vault | ✅ | FP-022 |
| Collections | ✅ | FP-026 |
| Image architecture | ✅ | FP-025 |

---

## Implementation gate

| Question | Answer |
|----------|--------|
| Code changed in this pass? | **No** |
| Features added? | **No** |
| Ready to implement? | **After founder approves Phase B start** |
| First implementation targets | FP-011 → FP-010 → FP-001 (registry, routing, shell) |

---

## Next step for founder

1. Read [NEW_MEMBER_IMMERSION_WALKTHROUGH.md](./NEW_MEMBER_IMMERSION_WALKTHROUGH.md) (15 min — feel the drift).  
2. Skim P0 table in [V4_FOUNDATION_PASS_ARCHITECTURAL_REVIEW.md](./V4_FOUNDATION_PASS_ARCHITECTURAL_REVIEW.md).  
3. Approve **Phase B** start or reprioritize.  

**Spark Estate Design Test:** The Estate is always the hero. Build places. Not software.
