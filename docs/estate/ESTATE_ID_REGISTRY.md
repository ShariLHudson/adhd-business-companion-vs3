# Spark Estate™ — ID Registry

**Purpose:** Single reference for the three approved asset ID schemes and how they connect.

```
Navigation phrase → ESTATE-ROOM-### (placeId) → ESTATE-IMG-### (poster/plate) + ESTATE-VID-### (optional video)
```

| Prefix | What it identifies | Count | Example |
|--------|-------------------|-------|---------|
| `ESTATE-ROOM-###` | Navigable room / place | 63 (000–062) | `ESTATE-ROOM-003` → Aquarium Room™ (`conservatory`) |
| `ESTATE-IMG-###` | Image file on disk | 40 (001–040) | `ESTATE-IMG-001` → `aquarium-room-background.png` |
| `ESTATE-VID-###` | Room experience video | **2 only** (001–002) | `ESTATE-VID-001` → `aquarium-room-video.mp4` |

**Related docs:** [ESTATE_ROOM_REGISTRY.json](./ESTATE_ROOM_REGISTRY.json) · [ESTATE_IMAGE_CATALOG_AUDIT.md](./ESTATE_IMAGE_CATALOG_AUDIT.md) · [ESTATE_VIDEO_ASSET_REGISTRY.md](./ESTATE_VIDEO_ASSET_REGISTRY.md)

---

## ID rules

1. **One room ID** maps to exactly one canonical `placeId` (kebab-case in code).
2. **One image ID** maps to exactly one filename under `public/backgrounds/`.
3. **One video ID** maps to exactly one filename under `public/Videos/`.
4. A room may have: primary `ESTATE-IMG-###`, alternate `ESTATE-IMG-###` views, and at most one `ESTATE-VID-###`.
5. Videos attach to rooms — they are not separate navigable destinations.
6. Do not invent IDs outside the tables below without updating this registry.

---

## ESTATE-VID-### (approved — locked)

| Video ID | Filename | Room ID | `placeId` | Poster IMG |
|----------|----------|---------|-----------|------------|
| ESTATE-VID-001 | `aquarium-room-video.mp4` | ESTATE-ROOM-003 | `conservatory` | ESTATE-IMG-001 |
| ESTATE-VID-002 | `butterfly-house-video.mp4` | ESTATE-ROOM-Butterfly-House | `butterfly-house` | ESTATE-IMG-002 |

---

## ESTATE-IMG-### (001–040)

| Image ID | Filename | Primary room ID | Role |
|----------|----------|-----------------|------|
| ESTATE-IMG-001 | `aquarium-room-background.png` | ESTATE-ROOM-003 | Main + VID-001 poster |
| ESTATE-IMG-002 | `butterfly-conservatory.png` | ESTATE-ROOM-004 | Main + VID-002 poster |
| ESTATE-IMG-003 | `creative-studio-background.png` | ESTATE-ROOM-030 | Main |
| ESTATE-IMG-004 | `fireside-deck-background.PNG` | ESTATE-ROOM-019 | Main (shared 020, 021) |
| ESTATE-IMG-005 | `founder-office-background.png` | — | Homestead (non-Estate nav) |
| ESTATE-IMG-006 | `gallery-background.png` | ESTATE-ROOM-035 | Main |
| ESTATE-IMG-007 | `grand-terrace-background.png` | ESTATE-ROOM-016 | Main (shared 018, 052) |
| ESTATE-IMG-008 | `greenhouse-background.png` | ESTATE-ROOM-009 | Main (shared 010–013, 054) |
| ESTATE-IMG-009 | `hall-of-achievements-room-background.png` | ESTATE-ROOM-036 | Main (shared 037) |
| ESTATE-IMG-010 | `kitchen-background.png` | ESTATE-ROOM-014 | Main |
| ESTATE-IMG-011 | `observatory-daytime-inside.png` | ESTATE-ROOM-031 | Alt — interior |
| ESTATE-IMG-012 | `observatory-daytime-outside-background.png` | ESTATE-ROOM-031 | Main — day exterior |
| ESTATE-IMG-013 | `observatory-night-outside-background.png` | ESTATE-ROOM-031 | Alt — night exterior |
| ESTATE-IMG-014 | `reading-nook-under-stairway-background.png` | ESTATE-ROOM-024 | Main (shared 025, 026, 051) ⚠️ |
| ESTATE-IMG-015 | `reading-nook-window background.png` | ESTATE-ROOM-023 | Main — window nook |
| ESTATE-IMG-016 | `room-celebration-hall-background.png` | ESTATE-ROOM-038 | Main |
| ESTATE-IMG-017 | `room-dining-room-background.png` | ESTATE-ROOM-015 | Main (shared 033, 039) |
| ESTATE-IMG-018 | `room-discovery-room-background.png` | ESTATE-ROOM-029 | Main |
| ESTATE-IMG-019 | `room-library-estate-background.png` | ESTATE-ROOM-027 | Main — estate library |
| ESTATE-IMG-020 | `shari-office-autumn-background.png` | — | Homestead seasonal |
| ESTATE-IMG-021 | `shari-office-background.png` | — | Homestead |
| ESTATE-IMG-022 | `shari-office-Christmas-background.png` | — | Homestead seasonal |
| ESTATE-IMG-023 | `space-reflection-tree-swing-background.png` | ESTATE-ROOM-022 | Main (shared 053, 055) |
| ESTATE-IMG-024 | `spark-chamber-of-momentum-background.png` | ESTATE-ROOM-028 | Main (shared 040, 041) |
| ESTATE-IMG-025 | `spark-estate-photo-background.png` | ESTATE-ROOM-001 | Main (shared 002, 042) |
| ESTATE-IMG-026 | `study-hall-background.png` | ESTATE-ROOM-032 | Main (shared 043) |
| ESTATE-IMG-027 | `sunroom-background.png` | ESTATE-ROOM-Sunroom | Main (shared 006) |
| ESTATE-IMG-028 | `tea-room-background.webp` | ESTATE-ROOM-007 | Main (shared 008) |
| ESTATE-IMG-029 | `treehouse-possibility-collage.png` | — | Unused collage |
| ESTATE-IMG-030 | `treehouse-possibility-discovery-chest-background.png` | ESTATE-ROOM-049 | Main (shared 047–049) |
| ESTATE-IMG-031 | `treehouse-possibility-house-outside-background.png` | ESTATE-ROOM-044 | Main — treehouse exterior |
| ESTATE-IMG-032 | `treehouse-possibility-reflection-desk-background.png` | ESTATE-ROOM-045 | Alt — desk |
| ESTATE-IMG-033 | `treehouse-possibility-staircase-window-reading-nook-background.png` | ESTATE-ROOM-046 | Alt (shared 047) |
| ESTATE-IMG-034 | `treehouse-possibility-studio.png` | ESTATE-ROOM-048 | Main — studio |
| ESTATE-IMG-035 | `water-lakeside-hammock-background.png` | ESTATE-ROOM-017 | Main |
| ESTATE-IMG-036 | `water-seat-at-pond-background.png` | ESTATE-ROOM-056 | Main (shared 057, 058) |
| ESTATE-IMG-037 | `water-swimming-pool-private-background.png` | ESTATE-ROOM-059 | Main |
| ESTATE-IMG-038 | `welcome-home-background.png` | ESTATE-ROOM-000 | Main |
| ESTATE-IMG-039 | `welcome-to-the-journal-gazebo.png` | ESTATE-ROOM-060 | Main |
| ESTATE-IMG-040 | `writing-room-background.png` | ESTATE-ROOM-061 | Main (shared 062) |

---

## ESTATE-ROOM-### (000–062)

| Room ID | `placeId` | Official name | Primary IMG | Video |
|---------|-----------|---------------|-------------|-------|
| ESTATE-ROOM-000 | `welcome-home` | Welcome Home™ | IMG-038 | — |
| ESTATE-ROOM-001 | `spark-estate` | Spark Estate™ | IMG-025 | — |
| ESTATE-ROOM-002 | `my-estate` | My Estate™ | IMG-025 | — |
| ESTATE-ROOM-003 | `conservatory` | Aquarium Room™ | IMG-001 | **VID-001** |
| ESTATE-ROOM-Butterfly-House | `butterfly-house` | Butterfly House™ | IMG-002 | **VID-002** |
| ESTATE-ROOM-Sunroom | `sunroom` | Sunroom™ | IMG-027 | — |
| ESTATE-ROOM-006 | `clear-my-mind` | Clear My Mind™ | IMG-027 | — |
| ESTATE-ROOM-007 | `tea-room` | Tea Room™ | IMG-028 | — |
| ESTATE-ROOM-008 | `coffee-house` | Coffee House™ | IMG-028 ⚠️ | — |
| ESTATE-ROOM-009 | `greenhouse` | Greenhouse™ | IMG-008 | — |
| ESTATE-ROOM-010 | `apple-orchard` | Apple Orchard™ | IMG-008 ❌ | — |
| ESTATE-ROOM-011 | `gardens` | Celebration Garden™ | IMG-008 | — |
| ESTATE-ROOM-012 | `estate-gardens` | Estate Gardens™ | IMG-008 | — |
| ESTATE-ROOM-013 | `garden-bench` | Garden Bench™ | IMG-008 | — |
| ESTATE-ROOM-014 | `estate-kitchen` | Estate Kitchen™ | IMG-010 | — |
| ESTATE-ROOM-015 | `dining-room` | Dining Room™ | IMG-017 | — |
| ESTATE-ROOM-016 | `grand-terrace` | Grand Terrace™ | IMG-007 | — |
| ESTATE-ROOM-017 | `lakeside-hammock` | Lakeside Hammock™ | IMG-035 | — |
| ESTATE-ROOM-018 | `lakeside-verandah` | Lakeside Verandah™ | IMG-007 | — |
| ESTATE-ROOM-019 | `fireside-deck` | Fireside Deck™ | IMG-004 | — |
| ESTATE-ROOM-020 | `back-deck` | Back Deck™ | IMG-004 | — |
| ESTATE-ROOM-021 | `porch-swing` | Porch Swing™ | IMG-004 | — |
| ESTATE-ROOM-022 | `the-swing-beneath-the-oak` | Swing Beneath the Oak™ | IMG-023 | — |
| ESTATE-ROOM-023 | `reading-nook` | Reading Nook™ | IMG-015 | — |
| ESTATE-ROOM-024 | `stairway-reading-nook` | Stairway Reading Nook™ | IMG-014 | — |
| ESTATE-ROOM-025 | `personal-library` | Personal Library | IMG-014 ❌ | — |
| ESTATE-ROOM-026 | `window-seat` | Window Seat™ | IMG-014 ❌ | — |
| ESTATE-ROOM-027 | `library` | The Library™ | IMG-019 | — |
| ESTATE-ROOM-028 | `momentum-institute` | Momentum Institute™ | IMG-024 | — |
| ESTATE-ROOM-029 | `discovery-room` | Discovery Room™ | IMG-018 | — |
| ESTATE-ROOM-030 | `creative-studio` | Creative Studio™ | IMG-003 | — |
| ESTATE-ROOM-031 | `observatory` | Observatory™ | IMG-012 | — |
| ESTATE-ROOM-032 | `study-hall` | Study Hall™ | IMG-026 | — |
| ESTATE-ROOM-033 | `round-table` | Round Table™ | IMG-017 | — |
| ESTATE-ROOM-034 | `art-studio` | Art Studio™ | IMG-003 | — |
| ESTATE-ROOM-035 | `gallery-of-firsts` | Hall of Accomplishments™ | IMG-006 | — |
| ESTATE-ROOM-036 | `evidence-vault` | Evidence Vault™ | IMG-009 | — |
| ESTATE-ROOM-037 | `portfolio` | Portfolio™ | IMG-009 | — |
| ESTATE-ROOM-038 | `celebration-room` | Celebration Hall™ | IMG-016 | — |
| ESTATE-ROOM-039 | `goals-projects` | Goals & Projects™ | IMG-017 | — |
| ESTATE-ROOM-040 | `game-room` | Game Room™ | IMG-024 | — |
| ESTATE-ROOM-041 | `momentum-room` | Momentum Room™ | IMG-024 | — |
| ESTATE-ROOM-042 | `stables` | The Stables™ | IMG-025 | — |
| ESTATE-ROOM-043 | `momentum-builder` | Momentum Builder™ | IMG-026 | — |
| ESTATE-ROOM-044 | `house-possibility-outside` | Treehouse™ / Possibility House | IMG-031 | — |
| ESTATE-ROOM-045 | `house-possibility-reflection-desk` | Reflection Desk | IMG-032 | — |
| ESTATE-ROOM-046 | `house-possibility-staircase` | Staircase & Nook | IMG-033 | — |
| ESTATE-ROOM-047 | `house-possibility-window-nook` | Window Nook | IMG-033 | — |
| ESTATE-ROOM-048 | `house-possibility-studio` | Possibility Studio | IMG-034 | — |
| ESTATE-ROOM-049 | `house-possibility-discovery-chest` | Discovery Chest | IMG-030 | — |
| ESTATE-ROOM-050 | `house-possibility-legacy-room` | Legacy Room | IMG-031 | — |
| ESTATE-ROOM-051 | `main-staircase` | Main Staircase™ | IMG-014 | — |
| ESTATE-ROOM-052 | `balcony` | Private Balcony™ | IMG-007 | — |
| ESTATE-ROOM-053 | `woodland-path` | Woodland Path™ | IMG-023 | — |
| ESTATE-ROOM-054 | `growth-profile` | Growth Profile™ | IMG-008 | — |
| ESTATE-ROOM-055 | `reflection-tree-main` | Reflection Tree | IMG-023 | — |
| ESTATE-ROOM-056 | `seat-at-pond` | Seat at the Pond™ | IMG-036 | — |
| ESTATE-ROOM-057 | `reflection-pond` | Reflection Pond™ | IMG-036 | — |
| ESTATE-ROOM-058 | `peaceful-places` | Peaceful Places™ | IMG-036 | — |
| ESTATE-ROOM-059 | `summer-terrace` | Summer Terrace™ | IMG-037 | — |
| ESTATE-ROOM-060 | `journal` | Journal Gazebo™ | IMG-039 | — |
| ESTATE-ROOM-061 | `decision-compass` | Decision Compass™ / Writing Room | IMG-040 | — |
| ESTATE-ROOM-062 | `music-room` | Music Room™ | IMG-040 ❌ | — |

**Observatory alt views (same room):** IMG-011 (interior), IMG-013 (night) → ESTATE-ROOM-031

**Possibility House parent:** ESTATE-ROOM-044 (treehouse exterior) with child views 045–050, 048

**Nature Spaces parent group:** ESTATE-ROOM-003, 004, 009, 010

---

## Quick lookup — video rooms only

```
ESTATE-ROOM-003  conservatory      →  ESTATE-IMG-001  +  ESTATE-VID-001
ESTATE-ROOM-004  butterfly-house   →  ESTATE-IMG-002  +  ESTATE-VID-002
```

---

## Status legend

| Mark | Meaning |
|------|---------|
| ⚠️ | Shared stand-in image — needs dedicated art or approval |
| ❌ | Known mismatch — must fix before final rename cutover |
| — | No video (image and/or ambience only) |
