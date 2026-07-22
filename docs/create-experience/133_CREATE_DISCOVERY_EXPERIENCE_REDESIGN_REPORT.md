# 133 — Create Discovery Experience Redesign — Implementation Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Spec:** [`133_CREATE_DISCOVERY_EXPERIENCE_REDESIGN.md`](./133_CREATE_DISCOVERY_EXPERIENCE_REDESIGN.md)  
**Parents:** Spec 128 · Spec 130 · Spec 131 · Spec 132 · Create 127–129

---

## Summary

Replaced **More Ways to Start (Optional)** with one coherent **Explore Ideas** discovery experience: Continue Something → one search → Recommended For Me → category cards. Framework tabs and duplicate browse/filter chains removed from Create entrance. Spec **130/131** confirm-before-create preserved for Explore → Create.

---

## Architecture before → after

| Before (129) | After (133) |
|--------------|-------------|
| More Ways to Start (Optional) | **Explore Ideas** |
| Guided Frameworks + Event/Marketing tabs | Removed from entrance — ideas discovered via search/categories |
| Browse Ideas (`CreateCatalogPicker` dropdown + search) | One search + large category cards → **same result list** |
| Previous Work at bottom of More Ways | Previous Work under **Continue Something** (near top) |
| Bare Personal / Company template toggles | Explained source chips (⭐ Spark Recommended · 🏢 Company · 👤 Personal · 🕘 Recent) |
| UniversalBlueprintInterface nested in More Ways | Not on Create entrance (UBI remains available elsewhere) |

---

## Paths

| Kind | Path |
|------|------|
| Spec | `docs/create-experience/133_CREATE_DISCOVERY_EXPERIENCE_REDESIGN.md` |
| This report | `docs/create-experience/133_CREATE_DISCOVERY_EXPERIENCE_REDESIGN_REPORT.md` |
| Copy | `lib/createEstate/copy.ts` |
| Discovery lib | `lib/createEstate/exploreIdeas/` |
| Explore panel | `components/companion/CreateExploreIdeasPanel.tsx` |
| Entrance | `components/companion/CreateEstateEntrancePanel.tsx` |
| Tests | `lib/createEstate/exploreIdeas/exploreIdeas.test.ts` · `lib/createEstate/createDiscovery133.test.ts` |

---

## Confirm path preserved (130 / 131)

1. Explore idea → Preview → **Create** calls `onRequestCreate`  
2. Entrance `requestCatalogConfirm` → `resolveCatalogCreateConfirm`  
3. Member sees intent confirm (Yes / Choose something else / Cancel)  
4. Work opens only after `confirmCreateBeginToOpen`  

Begin on Start Something New unchanged.

---

## Empty states (131 Rule 11)

- Continue Working omitted on main entrance when no active workspaces  
- Continue Working omitted inside Explore when empty  
- Previous Work teaches when no drafts  

---

## Deferred

- Full Company / Personal template libraries (chips ready; catalog mostly Spark Recommended today)  
- Richer Recommended For Me signals (Chamber, Board, Business Pulse, Goals) — hooks via context when available  
- UniversalBlueprintBrowser source chip copy alignment when UBI is used outside Create entrance  
- Intent Memory™ (131) still future  

---

## Tests

```bash
npx vitest run \
  lib/createEstate/exploreIdeas/exploreIdeas.test.ts \
  lib/createEstate/createDiscovery133.test.ts \
  lib/createEstate/createIntent131.test.ts \
  lib/createEstate/createPolish129.test.ts \
  lib/createEstate/createPolish130.test.ts \
  lib/createEstate/createEstateDestination.test.ts \
  lib/createEstate/createScrollContract.test.ts
```
