# Estate Room Registry™

**Master source of truth** for every room and space in the Spark Estate™.

Shari, Estate Intelligence™, navigation, and room art all read from one registry. **Register once — route everywhere.**

**Data:** `lib/estate/estateRoomRegistry.ts`  
**API:** `lib/estate/index.ts`  
**Routing:** `lib/estate/estateRoomRouting.ts`  
**Imagery:** [estate/ESTATE_IMAGE_BIBLE.md](./estate/ESTATE_IMAGE_BIBLE.md) · `lib/estate/estateImageStandards.ts`

---

## Purpose

The Estate Room Registry™ answers:

- What places exist in the Estate?
- How does a member get there?
- What background image belongs on the wall?
- What is this room *for* — emotionally and practically?
- What should Shari do here?
- When should Estate Intelligence™ recommend it?
- What related rooms might help next?

Future rooms ship by **adding one entry** — not by hunting through components, menus, and map files.

---

## Registry fields

| Field | Meaning |
|-------|---------|
| `id` | Stable registry id (kebab-case) |
| `name` / `trademark` | Display name |
| `route` | Primary `AppSection` when visitable |
| `routes` | Alternate sections that open inside this room |
| `menuActionId` | Global Estate menu action (overlays / profile) |
| `overlayId` | Modal overlay when not a full section |
| `backgroundImage` | Path in `public/backgrounds` when the file exists — otherwise `null` |
| `intendedBackgroundImage` | Known art path from room specs — connect when asset lands |
| `roomType` | welcome · learning · creation · research · reflection · restoration · planning · play · nature · profile · archive · future |
| `purpose` | Why this place exists |
| `emotionalFeeling` | How it should feel |
| `whatMembersDo` | Member activities |
| `whatShariDoes` | Companion posture in this room |
| `whenToRecommend` | Estate Intelligence signals |
| `relatedRoomIds` | Natural next places |
| `navigationPhrases` | "Take me to…" language |
| `estateIntelligenceExamples` | Example intents for routing docs and matchers |
| `status` | `live` · `planned` · `partial` · `image-ready-needs-asset` · `future` |

### Image policy

- **Do not invent filenames.** Use paths already referenced in room code or art specs.
- When the file is **not** in `public/backgrounds`: `backgroundImage: null`, `status: "image-ready-needs-asset"`, set `intendedBackgroundImage`.
- When wired and visitable but no art yet: same as above.
- `live` without art is valid — the room works; the plate waits for the asset.

---

## All registered spaces (25)

| Room | Route | Status | Intended background |
|------|-------|--------|---------------------|
| Welcome Home™ | `home` | image-ready-needs-asset | `welcome-home-background.png` |
| The Conservatory™ | `brain-dump` (alternate; brand planned) | planned | `clear-my-mind-background.png` |
| The Library™ | `growth-library`, `how-do-i` | image-ready-needs-asset | `library-reading-nook-background.png` |
| Momentum Institute™ | `momentum-institute` | image-ready-needs-asset | `the-momentum-institute-background.png` |
| Coffee House™ | — (partial) | partial | `cozy-cafe-peaceful-places.png` |
| Creative Studio™ | `content-generator` | image-ready-needs-asset | `creative-studio-background.png` |
| Observatory™ | `grow-observatory` | image-ready-needs-asset | `plan-my-day-background.webp` |
| Music Room™ | `focus-audio` (partial) | partial | `peaceful-places/music-room-peaceful-places.png` |
| Tea Room™ | — | future | — |
| Game Room™ | `games`, `activities` | image-ready-needs-asset | `focus-my-brain-games-background.png` |
| The Gardens™ | `wins-this-week`, peaceful routes | image-ready-needs-asset | `celebration-garden-background.png` |
| The Stables™ | `stables` | live | `spark-estate-stables-background.png` |
| Apple Orchard™ | — (map only) | future | `celebration-garden-background.webp` |
| Peaceful Places™ | `focus-audio`, `breathe` | image-ready-needs-asset | `peaceful-places/woodland-pathway.png` |
| Clear My Mind™ | `brain-dump` | image-ready-needs-asset | `clear-my-mind-background.png` |
| Decision Compass™ | `decision-compass` | live | — |
| Momentum Builder™ | `momentum-builder` | image-ready-needs-asset | `plan-my-day-background.png` |
| Journal™ | `growth-journal` | image-ready-needs-asset | `journal-background.png` |
| My Estate™ | menu `estate-profile` | live | — |
| My Institute Cabinet™ | overlay `institute-cabinet` | live | — |
| Evidence Vault™ | `evidence-bank` | image-ready-needs-asset | `evidence-vault-background.png` |
| Portfolio™ | `growth-portfolio` | image-ready-needs-asset | `growth-background.png` |
| Seeds Planted™ | `grow-spark-cards` | planned | — |
| Goals & Projects™ | `projects` | live | — |
| Growth Profile™ | overlay `growth-profile` | live | — |

---

## Estate Intelligence™ routing

Use `matchEstateRoomsForText()` or `bestEstateRoomForText()` from `lib/estate`.

| Member says | Registry room |
|-------------|---------------|
| "I want music" | Music Room™ (or Peaceful Places™ — member chooses) |
| "I want to learn pricing" | Momentum Institute™ |
| "I want to write a newsletter" | Creative Studio™ |
| "I want to think through a decision" | Decision Compass™ |
| "I need to clear my head" | Clear My Mind™ |
| "I want to journal" | Journal™ |
| "I want to go to the apple orchard" | Apple Orchard™ |
| "I want coffee / conversation" | Coffee House™ |
| "I want to research AI tools" | Observatory™ |

For chat hints after a match: `estateRoomHintForChat(room)`.

---

## Navigation language

Members may say:

- "Take me to the Apple Orchard."
- "Go to the Music Room."
- "Open the Tea Room."
- "Let's visit the Gardens."

Shari confirms when helpful, then uses **Estate language** — never software language.

| Avoid | Prefer |
|-------|--------|
| "Opening the Conservatory…" | "Let's step into the Conservatory." |
| "Navigate to Decision Compass" | "The Decision Compass™ can help us think this through." |
| "Loading workspace" | "I'll take us to the Music Room." |

Helpers: `estateRoomNavigationLine(roomId)` · `estateRoomInvitationLine(roomId, { confirm: true })`

---

## Adding a new room

1. Add one `EstateRoomDefinition` to `ESTATE_ROOM_REGISTRY` in `estateRoomRegistry.ts`.
2. Set `route` / `menuActionId` / `overlayId` when wiring exists.
3. Set `intendedBackgroundImage` only from confirmed art paths.
4. Add `navigationPhrases` and `estateIntelligenceExamples`.
5. Update this document's table.
6. Optionally register in `lib/estateIntelligence/` when capability scoring should include it.

---

## Related registries (do not duplicate)

These specialize; **Estate Room Registry™ is the master list of places:**

- `lib/estateIntelligence/` — capability scoring and invitations
- `lib/estateMemory/estateSectionMap.ts` — section memory
- `lib/companionHomestead/homesteadRoomRegistry.ts` — homestead arrival
- `lib/momentumInstitute/room/instituteRoomRegistry.ts` — Institute drawers
- `lib/estateMap/estateMapLocations.ts` — folded map destinations
- `docs/estate/*.md` — per-room Room Intelligence narratives

Link via `estateRegistryId`, `homesteadRoomId`, and shared `id` where applicable.

---

## Success criteria

- [x] Every Estate space exists in one registry
- [x] Every room can be routed to (route, menu, overlay, or conversational future)
- [x] Every image-ready room has `intendedBackgroundImage` for art connection
- [x] Shari knows purpose, feeling, and posture per room
- [x] Future rooms add with a single registry entry
