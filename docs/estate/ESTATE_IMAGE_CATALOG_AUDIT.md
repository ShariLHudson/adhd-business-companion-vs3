# Spark Estate™ — Image Catalog & Registry Audit

**Status:** Phase 1–7 audit complete — **no image files renamed** (awaiting approval)  
**ID master index:** [ESTATE_ID_REGISTRY.md](./ESTATE_ID_REGISTRY.md)  
**Video registry:** [ESTATE_VIDEO_ASSET_REGISTRY.md](./ESTATE_VIDEO_ASSET_REGISTRY.md)  
**Generated:** 2026-07-08  
**Scope:** `public/backgrounds/` (40 images) + estate room videos  
**Runtime source reviewed:** `lib/estate/estatePlaceMedia.ts`, `lib/estate/canonicalEstatePlaces.ts`

---

## 1. Estate Image Registry

### Image assets (`ESTATE-IMG-###`)

| Image ID | Current filename | Intended room(s) | Room ID(s) | Category | Asset role |
|----------|------------------|------------------|------------|----------|------------|
| ESTATE-IMG-001 | `aquarium-room-background.png` | The Conservatory™ (Aquarium Room) | ESTATE-ROOM-003 | Living place | Main image + video poster |
| ESTATE-IMG-002 | `butterfly-conservatory.png` | Butterfly House | ESTATE-ROOM-004 | Destination (Focus) | Main image + video poster |
| ESTATE-IMG-003 | `creative-studio-background.png` | Create / Creative Studio™ | ESTATE-ROOM-030 | Destination | Main image |
| ESTATE-IMG-004 | `fireside-deck-background.PNG` | Fireside Deck™, Back Deck, Porch Swing | ESTATE-ROOM-019, 020, 021 | Living place | Main image (shared) |
| ESTATE-IMG-005 | `founder-office-background.png` | Founder Studio (non-Estate nav) | — | Homestead / app | Main image — **outside estate room nav** |
| ESTATE-IMG-006 | `gallery-background.png` | Hall of Accomplishments™ (Gallery of Firsts) | ESTATE-ROOM-035 | Archive | Main image |
| ESTATE-IMG-007 | `grand-terrace-background.png` | Grand Terrace™, Lakeside Verandah, Personal Deck, Balcony | ESTATE-ROOM-016–018, 052 | Living place | Main image (shared) |
| ESTATE-IMG-008 | `greenhouse-background.png` | Greenhouse™, Apple Orchard™, Gardens, Estate Gardens, Garden Bench, Growth Profile | ESTATE-ROOM-009, 010, 011, 012, 013, 054 | Nature | Main image (**over-shared**) |
| ESTATE-IMG-009 | `hall-of-achievements-room-background.png` | Evidence Vault™, Portfolio™ | ESTATE-ROOM-036, 037 | Archive | Main image (shared) |
| ESTATE-IMG-010 | `kitchen-background.png` | Estate Kitchen™ | ESTATE-ROOM-014 | Living place | Main image |
| ESTATE-IMG-011 | `observatory-daytime-inside.png` | Observatory™ | ESTATE-ROOM-031 | Destination | Alternate view — interior / telescope |
| ESTATE-IMG-012 | `observatory-daytime-outside-background.png` | Observatory™, Possibility House Observatory, Telescope Deck | ESTATE-ROOM-031, 045, 046 | Destination | Main image — daytime exterior |
| ESTATE-IMG-013 | `observatory-night-outside-background.png` | Observatory™ | ESTATE-ROOM-031 | Destination | Alternate view — night exterior |
| ESTATE-IMG-014 | `reading-nook-under-stairway-background.png` | Stairway Reading Nook™, Personal Library, Window Seat, Main Staircase | ESTATE-ROOM-024, 025, 026, 051 | Reflection | Main / shared (**conflict risk**) |
| ESTATE-IMG-015 | `reading-nook-window background.png` | Reading Nook™ (arched window) | ESTATE-ROOM-023 | Reflection | Main image — window nook |
| ESTATE-IMG-016 | `room-celebration-hall-background.png` | Celebration Hall™ | ESTATE-ROOM-038 | Archive | Main image |
| ESTATE-IMG-017 | `room-dining-room-background.png` | Dining Room™, Round Table™, Goals & Projects™ | ESTATE-ROOM-015, 033, 039 | Living / planning | Main image (shared) |
| ESTATE-IMG-018 | `room-discovery-room-background.png` | Discovery Room™ | ESTATE-ROOM-029 | Research | Main image |
| ESTATE-IMG-019 | `room-library-estate-background.png` | The Library™ (Estate Library) | ESTATE-ROOM-027 | Learning | Main image |
| ESTATE-IMG-020 | `shari-office-autumn-background.png` | Shari Office (homestead) | — | Homestead | Seasonal variant — autumn |
| ESTATE-IMG-021 | `shari-office-background.png` | Shari Office (homestead) | — | Homestead | Main — summer |
| ESTATE-IMG-022 | `shari-office-Christmas-background.png` | Shari Office (homestead) | — | Homestead | Seasonal variant — Christmas |
| ESTATE-IMG-023 | `space-reflection-tree-swing-background.png` | The Swing Beneath the Oak™, Woodland Path, Reflection Tree | ESTATE-ROOM-022, 053, 055 | Nature | Main image (shared) |
| ESTATE-IMG-024 | `spark-chamber-of-momentum-background.png` | Momentum Institute™, Game Room™, Momentum Room™ | ESTATE-ROOM-028, 040, 041 | Learning / play | Main image (shared) |
| ESTATE-IMG-025 | `spark-estate-photo-background.png` | Spark Estate™, My Estate™, Stables™ | ESTATE-ROOM-001, 002, 042 | Welcome / profile | Main image (shared) |
| ESTATE-IMG-026 | `study-hall-background.png` | Study Hall™, Momentum Builder™ | ESTATE-ROOM-032, 043 | Learning | Main image (shared) |
| ESTATE-IMG-027 | `sunroom-background.png` | Sunroom™, Clear My Mind™ | ESTATE-ROOM-Sunroom, 006 | Welcome / destination | Main image (shared) |
| ESTATE-IMG-028 | `tea-room-background.webp` | Tea Room™, Coffee House™ | ESTATE-ROOM-007, 008 | Restoration | Main image (**Coffee House = stand-in**) |
| ESTATE-IMG-029 | `treehouse-possibility-collage.png` | — | — | Possibility House | **Not used** — decorative / catalog collage |
| ESTATE-IMG-030 | `treehouse-possibility-discovery-chest-background.png` | Discovery Chest, Cabinet of Chapters, Curiosity Cabinet | ESTATE-ROOM-047–049 | Possibility House | Main image (shared) |
| ESTATE-IMG-031 | `treehouse-possibility-house-outside-background.png` | Possibility House / Treehouse (exterior) | ESTATE-ROOM-044, 050 | Possibility House | Main image — exterior |
| ESTATE-IMG-032 | `treehouse-possibility-reflection-desk-background.png` | Possibility Reflection Desk | ESTATE-ROOM-045 | Possibility House | Alternate view — desk |
| ESTATE-IMG-033 | `treehouse-possibility-staircase-window-reading-nook-background.png` | Possibility Staircase, Window Nook | ESTATE-ROOM-046, 047 | Possibility House | Alternate view — interior nook |
| ESTATE-IMG-034 | `treehouse-possibility-studio.png` | Possibility Studio | ESTATE-ROOM-048 | Possibility House | Main image — studio |
| ESTATE-IMG-035 | `water-lakeside-hammock-background.png` | Lakeside Hammock™ | ESTATE-ROOM-017 | Restoration | Main image |
| ESTATE-IMG-036 | `water-seat-at-pond-background.png` | Seat at Pond, Reflection Pond, Peaceful Places | ESTATE-ROOM-056–058 | Nature / restoration | Main image (shared) |
| ESTATE-IMG-037 | `water-swimming-pool-private-background.png` | Summer Terrace™ / Pool | ESTATE-ROOM-059 | Restoration | Main image |
| ESTATE-IMG-038 | `welcome-home-background.png` | Welcome Home™ | ESTATE-ROOM-000 | Welcome | Main image |
| ESTATE-IMG-039 | `welcome-to-the-journal-gazebo.png` | Journal Gazebo™ | ESTATE-ROOM-060 | Reflection | Main image |
| ESTATE-IMG-040 | `writing-room-background.png` | Decision Compass™ (Writing Room), Music Room™ | ESTATE-ROOM-061, 062 | Planning / audio | Main image (**Music Room = stand-in**) |

### Video Experience assets (`ESTATE-VID-###`)

**Authoritative ID index:** [`ESTATE_ID_REGISTRY.md`](./ESTATE_ID_REGISTRY.md)

The Estate has **exactly two** room experience videos. No other video filenames are valid.

| Video ID | Approved filename | Maps to Room ID | `placeId` | Poster |
|----------|-------------------|-----------------|-----------|--------|
| ESTATE-VID-001 | `aquarium-room-video.mp4` | ESTATE-ROOM-003 | `conservatory` | IMG-001 |
| ESTATE-VID-002 | `butterfly-house-video.mp4` | ESTATE-ROOM-Butterfly-House | `butterfly-house` | IMG-002 |

**Rules:** Videos attach to rooms; never substitute poster for video when experience is available; never cross-assign between rooms.

---

## 2. Room registry (`ESTATE-ROOM-###`)

Parent areas follow `ROOM_HIERARCHY_REQUIREMENTS.md` intent.

| Room ID | Canonical `placeId` | Official name | Parent area | Primary image | Alt images |
|---------|---------------------|---------------|-------------|---------------|------------|
| ESTATE-ROOM-000 | `welcome-home` | Welcome Home™ | Main House | IMG-038 | — |
| ESTATE-ROOM-001 | `spark-estate` | Spark Estate™ | Grounds | IMG-025 | — |
| ESTATE-ROOM-002 | `my-estate` | My Estate™ | Profile | IMG-025 | — |
| ESTATE-ROOM-003 | `conservatory` | Aquarium Room / Conservatory™ | Nature Spaces | IMG-001 | VID-001 (video experience) |
| ESTATE-ROOM-004 | `butterfly-house` | Butterfly House / Butterfly Conservatory | Nature Spaces | IMG-002 | VID-002 (video experience) |
| ESTATE-ROOM-Sunroom | `sunroom` | Sunroom™ | Main House | IMG-027 | — |
| ESTATE-ROOM-006 | `clear-my-mind` | Clear My Mind™ | Main House | IMG-027 | — |
| ESTATE-ROOM-007 | `tea-room` | Tea Room™ | Main House | IMG-028 | — |
| ESTATE-ROOM-008 | `coffee-house` | Coffee House™ | Main House | IMG-028 ⚠️ | **Missing dedicated image** |
| ESTATE-ROOM-009 | `greenhouse` | Greenhouse™ | Nature Spaces | IMG-008 | — |
| ESTATE-ROOM-010 | `apple-orchard` | Apple Orchard™ | Nature Spaces | IMG-008 ❌ | **Must have own image** |
| ESTATE-ROOM-011 | `gardens` | Celebration Garden™ | Grounds | IMG-008 ⚠️ | — |
| ESTATE-ROOM-012 | `estate-gardens` | Estate Gardens™ | Grounds | IMG-008 ⚠️ | — |
| ESTATE-ROOM-013 | `garden-bench` | Garden Bench™ | Grounds | IMG-008 ⚠️ | — |
| ESTATE-ROOM-014 | `estate-kitchen` | Estate Kitchen™ | Main House | IMG-010 | — |
| ESTATE-ROOM-015 | `dining-room` | Dining Room™ | Main House | IMG-017 | — |
| ESTATE-ROOM-016 | `grand-terrace` | Grand Terrace™ | Grounds | IMG-007 | — |
| ESTATE-ROOM-017 | `lakeside-hammock` | Lakeside Hammock™ | Grounds | IMG-035 | — |
| ESTATE-ROOM-018 | `lakeside-verandah` | Lakeside Verandah™ | Grounds | IMG-007 ⚠️ | — |
| ESTATE-ROOM-019 | `fireside-deck` | Fireside Deck™ | Grounds | IMG-004 | — |
| ESTATE-ROOM-020 | `back-deck` | Back Deck™ | Grounds | IMG-004 | — |
| ESTATE-ROOM-021 | `porch-swing` | Porch Swing™ | Grounds | IMG-004 | — |
| ESTATE-ROOM-022 | `the-swing-beneath-the-oak` | Swing Beneath the Oak™ | Grounds | IMG-023 | — |
| ESTATE-ROOM-023 | `reading-nook` | Reading Nook™ (window) | Main House | IMG-015 | — |
| ESTATE-ROOM-024 | `stairway-reading-nook` | Stairway Reading Nook™ | Main House | IMG-014 | — |
| ESTATE-ROOM-025 | `personal-library` | Personal Library | Main House | IMG-014 ❌ | **Must not share stairway plate** |
| ESTATE-ROOM-026 | `window-seat` | Window Seat™ | Main House | IMG-014 ❌ | **Must use window nook (IMG-015)** |
| ESTATE-ROOM-027 | `library` | The Library™ (Estate) | Main House | IMG-019 | — |
| ESTATE-ROOM-028 | `momentum-institute` | Momentum Institute™ | Institute | IMG-024 | — |
| ESTATE-ROOM-029 | `discovery-room` | Discovery Room™ | Main House | IMG-018 | — |
| ESTATE-ROOM-030 | `creative-studio` | Creative Studio™ | Possibility House | IMG-003 | — |
| ESTATE-ROOM-031 | `observatory` | Observatory™ | Main House / Research | IMG-012 | IMG-011, IMG-013 |
| ESTATE-ROOM-032 | `study-hall` | Study Hall™ | Institute | IMG-026 | — |
| ESTATE-ROOM-033 | `round-table` | Round Table™ | Planning | IMG-017 ⚠️ | — |
| ESTATE-ROOM-034 | `art-studio` | Art Studio™ | Creation | IMG-003 | — |
| ESTATE-ROOM-035 | `gallery-of-firsts` | Hall of Accomplishments™ | Archive | IMG-006 | — |
| ESTATE-ROOM-036 | `evidence-vault` | Evidence Vault™ | Archive | IMG-009 | — |
| ESTATE-ROOM-037 | `portfolio` | Portfolio™ | Archive | IMG-009 | — |
| ESTATE-ROOM-038 | `celebration-room` | Celebration Hall™ | Archive | IMG-016 | — |
| ESTATE-ROOM-039 | `goals-projects` | Goals & Projects™ | Planning | IMG-017 ⚠️ | — |
| ESTATE-ROOM-040 | `game-room` | Game Room™ | Play | IMG-024 | — |
| ESTATE-ROOM-041 | `momentum-room` | Momentum Room™ | Institute | IMG-024 | — |
| ESTATE-ROOM-042 | `stables` | The Stables™ | Grounds | IMG-025 ⚠️ | **Missing dedicated stables image** |
| ESTATE-ROOM-043 | `momentum-builder` | Momentum Builder™ | Planning | IMG-026 | — |
| ESTATE-ROOM-044 | `house-possibility-outside` | Possibility House / Treehouse™ | Possibility House | IMG-031 | — |
| ESTATE-ROOM-045 | `house-possibility-reflection-desk` | Reflection Desk | Possibility House | IMG-032 | — |
| ESTATE-ROOM-046 | `house-possibility-staircase` | Staircase & Nook | Possibility House | IMG-033 | — |
| ESTATE-ROOM-047 | `house-possibility-window-nook` | Window Nook | Possibility House | IMG-033 | — |
| ESTATE-ROOM-048 | `house-possibility-studio` | Possibility Studio | Possibility House | IMG-034 | — |
| ESTATE-ROOM-049 | `house-possibility-discovery-chest` | Discovery Chest | Possibility House | IMG-030 | — |
| ESTATE-ROOM-050 | `house-possibility-legacy-room` | Legacy Room | Possibility House | IMG-031 | — |
| ESTATE-ROOM-051 | `main-staircase` | Main Staircase™ | Main House | IMG-014 ⚠️ | — |
| ESTATE-ROOM-052 | `balcony` | Private Balcony™ | Main House | IMG-007 ⚠️ | — |
| ESTATE-ROOM-053 | `woodland-path` | Woodland Path™ | Grounds | IMG-023 | — |
| ESTATE-ROOM-054 | `growth-profile` | Growth Profile™ | Profile | IMG-008 ⚠️ | — |
| ESTATE-ROOM-055 | `reflection-tree-main` | Reflection Tree | Grounds | IMG-023 | — |
| ESTATE-ROOM-056 | `seat-at-pond` | Seat at the Pond™ | Grounds | IMG-036 | — |
| ESTATE-ROOM-057 | `reflection-pond` | Reflection Pond™ | Grounds | IMG-036 | — |
| ESTATE-ROOM-058 | `peaceful-places` | Peaceful Places™ | Restoration | IMG-036 | — |
| ESTATE-ROOM-059 | `summer-terrace` | Summer Terrace™ / Pool | Grounds | IMG-037 | — |
| ESTATE-ROOM-060 | `journal` | Journal Gazebo™ | Grounds | IMG-039 | — |
| ESTATE-ROOM-061 | `decision-compass` | Decision Compass™ (Writing Room) | Planning | IMG-040 | — |
| ESTATE-ROOM-062 | `music-room` | Music Room™ | Audio | IMG-040 ❌ | **Missing dedicated music-room image** |

**Rooms without any image assignment (canonical place exists, no plate on disk):**  
`institute-cabinet`, `seeds-planted`, `accomplishments-shelf`, `main-hallway`, `front-drive`, `garden-path`, `bridge`, `personal-deck` (uses terrace stand-in), `strategy-studio` (uses creative studio), `house-possibility-observatory` / `telescope-deck` (share main observatory exterior).

---

## 3. Room / image mismatch report

### Critical (named in audit protocol)

| Room | Current runtime image | Required | Severity |
|------|----------------------|----------|----------|
| **Apple Orchard™** | `greenhouse-background.png` (IMG-008) | Dedicated orchard plate | ❌ Critical |
| **Personal Library** | `reading-nook-under-stairway-background.png` (IMG-014) | Own personal-library plate — not estate library, not generic stairway | ❌ Critical |
| **Window Seat™** | IMG-014 (stairway under stairs) | Should use window nook (`reading-nook-window`) or own plate | ❌ Critical |
| **Stairway Reading Nook™** | IMG-014 | Correct plate — but **same file as Personal Library & Window Seat** | ⚠️ Collision |
| **Hall of Accomplishments™** | `gallery-background.png` (IMG-006) | Correct — **does not load library** | ✅ OK |
| **Evidence Vault / Portfolio** | `hall-of-achievements-room-background.png` (IMG-009) | Distinct from gallery (IMG-006) and library (IMG-019) | ✅ OK |

### `canonicalEstatePlaces.ts` vs runtime (`estatePlaceMedia.ts`)

`canonicalEstatePlaces.backgroundImage` still points at **20+ missing files**. Runtime navigation UI uses `estatePlaceMedia` — members may see correct OR broken images depending on code path.

Examples of stale canonical paths (file **not on disk**):

- `room-coffee-house-background.png`, `music-room-background.png`
- `space-celebration-garden-background.png`, `place-estate-gardens-background.png`
- `the-momentum-institute-background.png`, `room-create-studio-background.png`
- `gazebo-journal-background.png`, `evidence-vault-background.png`
- `spark-estate-stables-background.png`, `game-room- background.webp`
- `peaceful-places/woodland-pathway.png`, `tree-swing-background.png`

### Homestead / non-Estate images on estate disk

| File | Used by | Issue |
|------|---------|-------|
| `founder-office-background.png` | `lib/founderStudio/founderConfig.ts` | Estate folder; not in room nav |
| `shari-office-*.png` (×3) | **No code reference found** | Orphan seasonal variants on disk |

---

## 4. Duplicate image report

### Same image → multiple rooms (runtime `estatePlaceMedia.ts`)

| Image ID | Filename | # Rooms | Room IDs |
|----------|----------|---------|----------|
| IMG-008 | `greenhouse-background.png` | **6** | greenhouse, apple-orchard, gardens, estate-gardens, garden-bench, growth-profile |
| IMG-014 | `reading-nook-under-stairway-background.png` | **4** | personal-library, stairway-reading-nook, window-seat, main-staircase |
| IMG-007 | `grand-terrace-background.png` | **4** | grand-terrace, lakeside-verandah, personal-deck, balcony |
| IMG-004 | `fireside-deck-background.PNG` | **3** | fireside-deck, back-deck, porch-swing |
| IMG-024 | `spark-chamber-of-momentum-background.png` | **3** | momentum-institute, game-room, momentum-room |
| IMG-003 | `creative-studio-background.png` | **3** | creative-studio, art-studio, strategy-studio |
| IMG-017 | `room-dining-room-background.png` | **3** | dining-room, round-table, goals-projects |
| IMG-036 | `water-seat-at-pond-background.png` | **3** | seat-at-pond, reflection-pond, peaceful-places |
| IMG-025 | `spark-estate-photo-background.png` | **3** | spark-estate, my-estate, stables |
| IMG-012 | `observatory-daytime-outside-background.png` | **3** | observatory, house-possibility-observatory, telescope-deck |
| IMG-030 | `treehouse-possibility-discovery-chest-background.png` | **3** | cabinet-of-chapters, curiosity-cabinet, discovery-chest |
| IMG-031 | `treehouse-possibility-house-outside-background.png` | **2** | house-possibility-outside, legacy-room-main |
| IMG-033 | `treehouse-possibility-staircase-window-reading-nook-background.png` | **2** | house-possibility-staircase, window-nook |
| IMG-028 | `tea-room-background.webp` | **2** | tea-room, coffee-house |
| IMG-040 | `writing-room-background.png` | **2** | decision-compass, music-room |
| IMG-009 | `hall-of-achievements-room-background.png` | **2** | evidence-vault, portfolio |
| IMG-026 | `study-hall-background.png` | **2** | study-hall, momentum-builder |
| IMG-027 | `sunroom-background.png` | **2** | sunroom, clear-my-mind |
| IMG-023 | `space-reflection-tree-swing-background.png` | **3** | swing-beneath-oak, woodland-path, reflection-tree-main |

### Intentional multi-view (not duplicate rooms — Phase 6)

| Room ID | Views | Image IDs |
|---------|-------|-----------|
| ESTATE-ROOM-031 Observatory | Day exterior, night exterior, interior | IMG-012, IMG-013, IMG-011 |
| ESTATE-ROOM-044 Possibility House | Exterior, studio, staircase, desk, chest | IMG-031, IMG-034, IMG-033, IMG-032, IMG-030 |
| ESTATE-ROOM-004 Butterfly House | Still + video | IMG-002, VID-002 |
| ESTATE-ROOM-003 Aquarium | Still + video | IMG-001, VID-001 |

### Unused / orphan files

| Image ID | Filename | Status |
|----------|----------|--------|
| IMG-029 | `treehouse-possibility-collage.png` | Not wired in code |
| IMG-020–022 | `shari-office-*.png` | No references in companion-app |
| IMG-013 | `observatory-night-outside-background.png` | Fallback only — not primary for any room |

---

## 5. Rename plan (Phase 5 — **do not execute until approved**)

Proposed standard: `estate-room-[room-name]-[view].ext`

| Image ID | Current filename | Proposed filename |
|----------|------------------|-------------------|
| IMG-001 | `aquarium-room-background.png` | `estate-room-aquarium-main.png` |
| IMG-002 | `butterfly-conservatory.png` | `estate-room-butterfly-conservatory-main.png` |
| IMG-003 | `creative-studio-background.png` | `estate-room-creative-studio-main.png` |
| IMG-004 | `fireside-deck-background.PNG` | `estate-room-fireside-deck-main.png` |
| IMG-005 | `founder-office-background.png` | `homestead-founder-office-main.png` *(move out of estate)* |
| IMG-006 | `gallery-background.png` | `estate-room-hall-of-accomplishments-main.png` |
| IMG-007 | `grand-terrace-background.png` | `estate-room-grand-terrace-main.png` |
| IMG-008 | `greenhouse-background.png` | `estate-room-greenhouse-main.png` |
| IMG-009 | `hall-of-achievements-room-background.png` | `estate-room-hall-of-achievements-main.png` |
| IMG-010 | `kitchen-background.png` | `estate-room-estate-kitchen-main.png` |
| IMG-011 | `observatory-daytime-inside.png` | `estate-room-observatory-interior.png` |
| IMG-012 | `observatory-daytime-outside-background.png` | `estate-room-observatory-day.png` |
| IMG-013 | `observatory-night-outside-background.png` | `estate-room-observatory-night.png` |
| IMG-014 | `reading-nook-under-stairway-background.png` | `estate-room-stairway-reading-nook-main.png` |
| IMG-015 | `reading-nook-window background.png` | `estate-room-reading-nook-window-main.png` |
| IMG-016 | `room-celebration-hall-background.png` | `estate-room-celebration-hall-main.png` |
| IMG-017 | `room-dining-room-background.png` | `estate-room-dining-room-main.png` |
| IMG-018 | `room-discovery-room-background.png` | `estate-room-discovery-room-main.png` |
| IMG-019 | `room-library-estate-background.png` | `estate-room-estate-library-main.png` |
| IMG-020–022 | `shari-office-*.png` | `homestead-shari-office-{season}.png` *(move out of estate)* |
| IMG-023 | `space-reflection-tree-swing-background.png` | `estate-room-reflection-tree-swing-main.png` |
| IMG-024 | `spark-chamber-of-momentum-background.png` | `estate-room-momentum-chamber-main.png` |
| IMG-025 | `spark-estate-photo-background.png` | `estate-room-spark-estate-main.png` |
| IMG-026 | `study-hall-background.png` | `estate-room-study-hall-main.png` |
| IMG-027 | `sunroom-background.png` | `estate-room-sunroom-main.png` |
| IMG-028 | `tea-room-background.webp` | `estate-room-tea-room-main.webp` |
| IMG-029 | `treehouse-possibility-collage.png` | `estate-room-possibility-house-collage.png` |
| IMG-030 | `treehouse-possibility-discovery-chest-background.png` | `estate-room-possibility-discovery-chest-main.png` |
| IMG-031 | `treehouse-possibility-house-outside-background.png` | `estate-room-treehouse-exterior.png` |
| IMG-032 | `treehouse-possibility-reflection-desk-background.png` | `estate-room-treehouse-reflection-desk.png` |
| IMG-033 | `treehouse-possibility-staircase-window-reading-nook-background.png` | `estate-room-treehouse-interior-nook.png` |
| IMG-034 | `treehouse-possibility-studio.png` | `estate-room-treehouse-studio.png` |
| IMG-035 | `water-lakeside-hammock-background.png` | `estate-room-lakeside-hammock-main.png` |
| IMG-036 | `water-seat-at-pond-background.png` | `estate-room-pond-seat-main.png` |
| IMG-037 | `water-swimming-pool-private-background.png` | `estate-room-summer-terrace-pool-main.png` |
| IMG-038 | `welcome-home-background.png` | `estate-room-welcome-home-main.png` |
| IMG-039 | `welcome-to-the-journal-gazebo.png` | `estate-room-journal-gazebo-main.png` |
| IMG-040 | `writing-room-background.png` | `estate-room-writing-room-main.png` |

**Rename execution order (after approval):**
1. Add new files / copy with new names (keep old names until cutover).
2. Update `ESTATE_IMAGE_REGISTRY.json` (to be generated in Phase 2 implementation).
3. Regenerate `estatePlaceMedia.ts` from registry.
4. Sync `canonicalEstatePlaces.ts` + knowledge base asset filenames.
5. Remove legacy filenames in one commit.

---

## 6. Missing image report

### Rooms that need **new** art (no acceptable dedicated plate)

| Room ID | Room | Gap |
|---------|------|-----|
| ESTATE-ROOM-010 | Apple Orchard™ | Using greenhouse — **needs `estate-room-apple-orchard-main.png`** |
| ESTATE-ROOM-008 | Coffee House™ | Using tea room — needs coffee-house plate |
| ESTATE-ROOM-025 | Personal Library | Using stairway nook — needs **`estate-room-personal-library-main.png`** |
| ESTATE-ROOM-026 | Window Seat™ | Using stairway — should use window nook or dedicated plate |
| ESTATE-ROOM-062 | Music Room™ | Using writing room — needs music-room plate |
| ESTATE-ROOM-042 | Stables™ | Using estate photo — needs stables plate |
| ESTATE-ROOM-011 | Celebration Garden (`gardens`) | Shared greenhouse — needs garden plate |
| ESTATE-ROOM-012 | Estate Gardens™ | Shared greenhouse — needs estate-gardens plate |
| ESTATE-ROOM-018 | Lakeside Verandah™ | Shared grand terrace — needs verandah plate |
| ESTATE-ROOM-052 | Balcony™ | Shared grand terrace — needs balcony plate |
| ESTATE-ROOM-020 | Personal Deck™ | Shared grand terrace — needs deck plate |

### Referenced in code but **file absent** from `public/backgrounds/`

From `canonicalEstatePlaces.ts` (stale — should be retired or art commissioned):

`room-coffee-house-background.png`, `music-room-background.png`, `space-celebration-garden-background.png`, `place-estate-gardens-background.png`, `tree-swing-background.png`, `peaceful-places/woodland-pathway.png`, `grand-estate-background.png`, `water-lakeside-deck-verandah-background.png`, `room-library-personal-background.png`, `the-momentum-institute-background.png`, `room-create-studio-background.png`, `strategy-studio-workroom-background.png`, `round-table-boardroom-background.png`, `gazebo-journal-background.png`, `evidence-vault-background.png`, `accomplisments-room-background.png`, `game-room- background.webp`, `spark-estate-stables-background.png`

---

## 7. Approval checklist

Before renaming or reassigning:

- [ ] Confirm Apple Orchard will get new art (not greenhouse stand-in)
- [ ] Confirm Personal Library art direction (distinct from IMG-014 and IMG-019)
- [ ] Confirm Window Seat → IMG-015 or new art
- [ ] Confirm shared plates that are **acceptable** (e.g. tea room / coffee house temporary)
- [ ] Move homestead images (`founder-office`, `shari-office-*`) out of `public/backgrounds/`
- [ ] Approve rename table (Section 5)
- [ ] Approve `ESTATE-ROOM-###` ID scheme for navigation registry Phase 2

---

*No files were renamed in this audit.*
