# 152 — Wander Room Name and Route Fix

**Status:** Implemented  
**Prompt:** `152_WANDER_ROOM_NAME_AND_ROUTE_FIX_PROMPT.md`  
**Date:** 2026-07-09

---

## 1. Files changed

| File | Change |
|------|--------|
| `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json` | Names, Live/Draft, images, new places |
| `lib/estate/placeIdAliases.ts` | Hall → portfolio; Gallery aliases; swimming-pool; swing |
| `lib/estate/directory/shell.ts` | Observatory variants + treehouse + writing-room sections |
| `lib/estate/estateNavigationCanon.ts` | Gallery / Hall / Estate Library canon |
| `lib/estate/estatePlaceSceneViews.ts` | Observatory labels; Treehouse sub-room choices; pool label |
| `lib/estate/estatePlaceMedia.ts` | Swing plate fallbacks; writing/observatory variants |
| `lib/estate/estateWanderNavigation.ts` | Conversation wander order (no Decision Compass / orphan Drafts) |
| `lib/sparkRecognitionEngine/*` | Hall recognition room id → `portfolio` |
| `lib/estate/manifest/wander152Fixes.test.ts` | Acceptance tests |
| `scripts/patch-wander-152.cjs` | One-shot manifest patch script |

---

## 2. Rooms renamed

| Was | Now (member-facing) |
|-----|---------------------|
| Hall of Accomplishments (on Gallery image) | **Gallery** |
| The Library / Library | **Estate Library** |
| Portfolio | **Hall of Accomplishments™** |
| Summer Terrace | **Swimming Pool** |
| Porch Swing | **Swing** |
| Reading Nook | **Reading Nook Window** |
| Lakeside Hammock | **Water / Lakeside Hammock** |
| Possibility House outside | **Treehouse** |
| Discovery Chest / Reflection Desk / … | **Treehouse …** prefixed names |
| Celebration Room | **Celebration Hall** (display) |

---

## 3. Rooms removed from Wander

| Place | Reason |
|-------|--------|
| Decision Compass | Tool/feature — not a Wander room/window |
| Apple Orchard | Orphan name (no dedicated orchard asset) |
| Growth Profile / My Estate | `navigable: false` (null/invalid routes) |

---

## 4. Rooms added (Live + navigable)

- Celebration Garden (already Live; image fixed)
- Butterfly House (video wired)
- Treehouse Discovery Chest
- Treehouse Reflection Desk
- Treehouse Staircase / Reading Nook
- Treehouse Possibility Studio (+ window nook Live)
- Observatory — Daytime Inside / Outside / Night Outside
- Writing Room
- Swing
- Tea Room
- Water / Lakeside Hammock (name + Live)
- Discovery Room, Study Hall, Celebration Hall (confirmed Live)

Treehouse also has **in-room scene choices** (4 sub-rooms) via `estatePlaceSceneViews`.

---

## 5. Missing assets

| Expected / needed | Status |
|-------------------|--------|
| `space-reflection-tree-swing-background.png` | **Missing** — retargeted to `swing-background.png` |
| Dedicated Personal Deck plate | **Missing** — still uses `grand-terrace-background.png` (not fireside/back deck) |
| Dedicated Celebration Garden plate | **Missing** — uses `swing-background.png` until dedicated art |
| Dedicated Apple Orchard plate | **Missing** — Orchard removed from Wander |
| `water-lakeside-deck-verandah-background.png` | Still referenced by summer-terrace verandah scene view |
| `treehouse-possibility-observatory-background.png` | Still missing (treehouse observatory not added to Wander) |
| Butterfly House video | **Present:** `public/Videos/butterfly-house-video.mp4` |

---

## 6. Duplicate room names found

| Name | Resolution |
|------|------------|
| Discovery Room (listed twice in prompt) | Single canonical id `discovery-room` |
| Hall vs Gallery vs Portfolio | Gallery = `gallery-of-firsts`; Hall = `portfolio` (member name Hall of Accomplishments™); Portfolio label deprecated |
| Celebration vs Celebration Garden vs Celebration Hall | Garden = `gardens`; Hall = `celebration-room` |
| Butterfly House vs Sunroom vs Aquarium | Kept distinct |

---

## 7. Routes still unresolved / notes

- Personal Deck still lacks a dedicated image (terrace borrow).
- Observatory variants share section `grow-observatory` (distinct Wander entries + scene views).
- Writing Room uses `home` section (presence) until a dedicated writing shell exists.
- Decision Compass remains routable as a **feature** (`decision-compass` section) but not via Wander.

---

## 8. Desktop/mobile verification status

| Check | Status |
|-------|--------|
| Unit tests (`wander152Fixes`, wander mode, navigation canon, recognition) | **40/40 passed** |
| Live browser desktop/mobile Wander click-through | **Not run in this pass** — recommend manual: Room menu → Wander from Welcome Home on desktop + phone width |

### Success criteria map

| Criterion | Met? |
|-----------|------|
| Wander names match correct rooms | Yes (manifest display names) |
| No orphan Apple Orchard in Wander | Yes |
| Hall ≠ Portfolio label | Yes (Hall of Accomplishments) |
| Estate Library ≠ “Library” | Yes |
| Swimming Pool ≠ Summer Terrace | Yes |
| Sunroom ≠ Butterfly House | Yes |
| Celebration Garden appears | Yes |
| Butterfly House video available | Yes (asset + manifest `video`) |
| Treehouse sub-room options | Yes (Wander Live + scene views) |
