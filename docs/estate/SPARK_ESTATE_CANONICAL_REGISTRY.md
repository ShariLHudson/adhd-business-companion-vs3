# Spark Estate Canonical Registry™

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | **Official source of truth — all places in Spark Estate** |
| **Phase** | A — Canonical Estate Registry (documentation only; **not** code) |
| **Authority** | [Constitution](./01%20-%20Spark%20Estate%20Constitution.md) · [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) · [Spark Estate Bible](./Spark%20Estate%20Bible.md) |
| **Supersedes** | Ad hoc lists in code, menus, and pre-canon planning docs for **place identity** |
| **Feeds** | Routing · backgrounds · Guidebook · Estate Map · conversation · image generation |

---

## How to use this document

This is **not** `lib/estate/estateRoomRegistry.ts`. Code registries must **converge to this document**, not the reverse.

When adding a place:

1. Add one entry here first.  
2. Pass the [Spark Estate Design Test](#spark-estate-design-test).  
3. Only then register in code, art pipeline, and map.

**Portable objects** (Guidebook™, Folded Estate Map™, The Bell, Discovery Key™) are defined in [Bible Section 04](./bible/Section%2004%20-%20Estate%20Objects.md). They appear *in* places but are not walkable locations — cross-linked below.

---

## Spark Estate Design Test

> Does this feel like software?  
> If yes — simplify until it feels like a beautiful place.

**Arrival law (Constitution Art. VIII):** The Estate never explains itself. No title plaques, no feature grids, no “While you're here…” menus on Living Places.

---

## Field definitions

| Field | Meaning |
|-------|---------|
| **Internal ID** | Stable key for routing, art, and map (never member-visible) |
| **Official Estate Name** | Canon name; ™ only where trademarked in Bible |
| **Category** | Living Place · Destination · Collection · Transition Space |
| **Primary Feeling** | One emotional headline |
| **Background Image** | Canonical plate path under `public/backgrounds/` or **TBD** |
| **Permanent Objects** | Always in scene or always available in room |
| **Seasonal Objects** | Appear per [Seasonal Guide](./09%20-%20Seasonal%20Estate%20Guide.md) |
| **Interactive Objects** | Member may open, pick up, or use (permission where noted) |
| **Conversation Style** | How Shari shows up here |
| **Arrival Behavior** | What happens when member arrives (canon — not current code) |
| **Navigation Aliases** | Natural phrases members say |
| **Future Expansion Notes** | Discovery, art, objects — not feature backlog |

### Category rules (Bible Ch. 7 + Foundation Pass)

| Category | Member experience |
|----------|-------------------|
| **Living Place** | Scene + conversation. No dedicated feature grid. |
| **Destination** | Intentional experience (create, decide, learn, celebrate, capture). |
| **Collection** | Curated holdings — books, cards, filed lessons, personal record. |
| **Transition Space** | Connective tissue; atmosphere only; conversation continues. |

### Arrival behavior (canon vocabulary)

| Value | Behavior |
|-------|----------|
| `threshold` | Belonging at the door; no tour, no menu |
| `ambient-crossfade` | Scene fades in; optional ambience; **no on-screen title** |
| `presence-only` | Shari may speak **one** line in conversation after arrival — never a plaque |
| `object-invitation` | Scene reveals a primary object (desk, drawer wall, folio); Shari names it only if helpful |
| `pass-through` | Transition only — never blocks movement or chat |

### Conversation style (canon vocabulary)

`open-presence` · `coaching` · `discovery-dialogue` · `quiet-capture` · `reflective-writing` · `creative-collaboration` · `research-companion` · `decision-facilitation` · `archive-browsing` · `calm-restoration` · `playful-reset` · `celebration-ritual` · `personal-continuity`

---

## Registry index

| Internal ID | Official Estate Name | Category |
|-------------|----------------------|----------|
| `welcome-home` | Welcome Home™ | Living Place |
| `sunroom` | Sunroom | Living Place |
| `main-hallway` | Main Hallway | Transition Space |
| `main-staircase` | Main Staircase | Transition Space |
| `front-drive` | Front Drive | Transition Space |
| `reading-nook` | Reading Nook | Living Place |
| `library` | The Library™ | Destination |
| `momentum-institute` | Momentum Institute™ | Destination |
| `institute-cabinet` | My Institute Cabinet™ | Collection |
| `conservatory` | The Conservatory™ | Living Place |
| `clear-my-mind` | Clear My Mind™ | Destination |
| `creative-studio` | Creative Studio™ | Destination |
| `observatory` | Observatory™ | Destination |
| `coffee-house` | Coffee House™ | Living Place |
| `tea-room` | Tea Room™ | Living Place |
| `music-room` | Music Room™ | Living Place |
| `stables` | The Stables™ | Destination |
| `greenhouse` | Greenhouse™ | Living Place |
| `gardens` | The Gardens™ | Living Place |
| `celebration-room` | Celebration Room™ | Destination |
| `garden-bench` | Garden Bench | Living Place |
| `garden-path` | Garden Path | Transition Space |
| `apple-orchard` | Apple Orchard™ | Living Place |
| `back-deck` | Back Deck | Living Place |
| `porch-swing` | Porch Swing | Living Place |
| `balcony` | Balcony | Transition Space |
| `peaceful-places` | Peaceful Places™ | Living Place |
| `woodland-path` | Woodland Path | Transition Space |
| `seat-at-pond` | Seat at Pond / Dock | Living Place |
| `window-seat` | Window Seat | Living Place |
| `bridge` | Garden Bridge | Transition Space |
| `game-room` | Game Room™ | Destination |
| `momentum-builder` | Momentum Builder™ | Destination |
| `decision-compass` | Decision Compass™ | Destination |
| `journal` | Journal™ | Destination |
| `evidence-vault` | Evidence Vault™ | Destination |
| `portfolio` | Portfolio™ | Destination |
| `goals-projects` | Goals & Projects™ | Destination |
| `seeds-planted` | Seeds Planted™ | Collection |
| `growth-profile` | Growth Profile™ | Collection |
| `my-estate` | My Estate™ | Collection |
| `accomplishments-shelf` | Accomplishments Book™ (Library shelf) | Collection |

**Portable objects (not locations):** Guidebook™ · Folded Estate Map™ · The Bell · Discovery Key™ · Knowledge Cards™ (Institute) · Letters

---

## Living Places

---

### `welcome-home`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Welcome Home™ |
| **Category** | Living Place |
| **Primary Feeling** | Belonging, warmth, orientation, hope |
| **Background Image** | `/backgrounds/welcome-home-background.png` **TBD** |
| **Permanent Objects** | Front entry; coat hooks; soft light; **Guidebook™** on side table; **Folded Estate Map™** (corner, optional) |
| **Seasonal Objects** | Wreath (Christmas); porch lanterns (winter); spring planters |
| **Interactive Objects** | Map (folded); Guidebook; continue conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `threshold` — member is already home; Shari greets without pressure; **no cinematic tour, no feature grid** |
| **Navigation Aliases** | welcome home · go home · take me home · back home · I'm home |
| **Future Expansion Notes** | Kinsey at threshold (optional); evening porch light; never dashboard tiles |

---

### `sunroom`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Sunroom |
| **Category** | Living Place |
| **Primary Feeling** | Warmth, belonging, unhurried welcome |
| **Background Image** | `/backgrounds/sunroom-background.png` *(fix filename typo on disk)* |
| **Permanent Objects** | Shari's chair; pond view; Spark mugs; plants in light |
| **Seasonal Objects** | Brighter morning wash (summer); frost on glass (winter) |
| **Interactive Objects** | Letter from Shari (first visits, optional); conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | sunroom · welcome room · Shari's sunroom |
| **Future Expansion Notes** | Voice welcome optional; never product explainer |

---

### `conservatory`

| Field | Value |
|-------|-------|
| **Official Estate Name** | The Conservatory™ |
| **Category** | Living Place |
| **Primary Feeling** | Restoration, clarity, gentle thinking |
| **Background Image** | `/backgrounds/butterfly-conservatory.webp` **TBD** |
| **Permanent Objects** | Glass walls; butterflies; garden views; bench |
| **Seasonal Objects** | Rain on glass (spring); dusk glow (autumn) |
| **Interactive Objects** | Ambience toggle; journal nearby (walk to Journal™ if asked) |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` — **no** “help you with one of these” menu |
| **Navigation Aliases** | conservatory · the conservatory · quiet glass room |
| **Future Expansion Notes** | Shares atmosphere with Clear My Mind™ — distinct purpose; never merge IDs |

---

### `coffee-house`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Coffee House™ |
| **Category** | Living Place |
| **Primary Feeling** | Warmth, ease, gentle company |
| **Background Image** | `/backgrounds/coffee-house-background.png` |
| **Permanent Objects** | Counter; mugs with Spark flame; small tables |
| **Seasonal Objects** | Pumpkin spice warmth (autumn); iced drinks visible (summer) |
| **Interactive Objects** | Mug; conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `presence-only` — *"Pull up a chair."* |
| **Navigation Aliases** | coffee house · coffee shop · let's get coffee · cozy cafe |
| **Future Expansion Notes** | Never turns rest into task list |

---

### `tea-room`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Tea Room™ |
| **Category** | Living Place |
| **Primary Feeling** | Stillness, ritual, gentle hospitality |
| **Background Image** | `/backgrounds/tea-room-background.png` |
| **Permanent Objects** | Tea service; low table; soft chairs |
| **Seasonal Objects** | Autumn tea settings; quiet Christmas ribbon |
| **Interactive Objects** | Tea set; conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | tea room · let's have tea |
| **Future Expansion Notes** | Ship only when art passes Image Bible |

---

### `music-room`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Music Room™ |
| **Category** | Living Place |
| **Primary Feeling** | Focus, warmth, creative calm |
| **Background Image** | `/backgrounds/music-room-background.png` **TBD** *(peaceful-places variant exists)* |
| **Permanent Objects** | Piano; sheet music; comfortable seating |
| **Seasonal Objects** | Evening lamp (winter); open windows (summer) |
| **Interactive Objects** | Piano audio; ambience toggle |
| **Conversation Style** | `calm-restoration` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | music room · piano · play music · I want music |
| **Future Expansion Notes** | Distinct from Peaceful Places™ hub |

---

### `greenhouse`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Greenhouse™ |
| **Category** | Living Place |
| **Primary Feeling** | Hopeful, patient, safe emergence |
| **Background Image** | `/backgrounds/greenhouse-background.png` |
| **Permanent Objects** | Potting benches; seed trays; watering can; glass walls; **Kinsey asleep** (intentional) |
| **Seasonal Objects** | Birdsong (spring); frost on glass (winter); amber autumn light |
| **Interactive Objects** | Garden journal on bench; path door to gardens |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `presence-only` — Shari may already be sitting; **no title card** |
| **Navigation Aliases** | greenhouse · the greenhouse · plant an idea |
| **Future Expansion Notes** | Link to Seeds Planted™ via conversation only; [full room page](./bible/rooms/The%20Greenhouse.md) |

---

### `gardens`

| Field | Value |
|-------|-------|
| **Official Estate Name** | The Gardens™ |
| **Category** | Living Place |
| **Primary Feeling** | Growth, peace, natural rhythm |
| **Background Image** | `/backgrounds/celebration-garden-room-background.png` **TBD** |
| **Permanent Objects** | Paths; plantings; benches; seasonal flowers |
| **Seasonal Objects** | Spring blooms; autumn leaves; snow-quiet beds (winter) |
| **Interactive Objects** | Walk paths; sit on bench; conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | gardens · the gardens · walk in the garden · outside |
| **Future Expansion Notes** | Celebration Room™ ritual destination — see `celebration-room`; distinct from garden walks |

---

### `garden-bench`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Garden Bench |
| **Category** | Living Place |
| **Primary Feeling** | Pause, unhurried reflection |
| **Background Image** | Shared gardens / greenhouse edge plates |
| **Permanent Objects** | Wooden bench; surrounding plantings |
| **Seasonal Objects** | Blossom overhead (spring); fallen leaves (autumn) |
| **Interactive Objects** | Sit; silence valid |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` — **no explanation required** |
| **Navigation Aliases** | garden bench · sit outside · bench in the garden |
| **Future Expansion Notes** | May be thirty seconds or an hour |

---

### `apple-orchard`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Apple Orchard™ |
| **Category** | Living Place |
| **Primary Feeling** | Possibility, freshness, gentle abundance |
| **Background Image** | `/backgrounds/apple-orchard-background.png` |
| **Permanent Objects** | Trees; ladder (optional); basket |
| **Seasonal Objects** | Blossom (spring); harvest (autumn) |
| **Interactive Objects** | Walk rows; conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | apple orchard · the orchard |
| **Future Expansion Notes** | Window seat overlooks orchard |

---

### `back-deck`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Back Deck |
| **Category** | Living Place |
| **Primary Feeling** | Evening air, ease, conversation |
| **Background Image** | **TBD** |
| **Permanent Objects** | Railings; chairs; view to yard |
| **Seasonal Objects** | Summer evening; autumn sweaters weather |
| **Interactive Objects** | Sit; conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | back deck · sit outside · evening air |
| **Future Expansion Notes** | Summer affinity per Seasonal Guide |

---

### `porch-swing`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Porch Swing |
| **Category** | Living Place |
| **Primary Feeling** | Slow rhythm, unhurried talk |
| **Background Image** | **TBD** (porch scene) |
| **Permanent Objects** | Swing; porch lanterns |
| **Seasonal Objects** | Lantern flicker (evening); fireflies (summer) |
| **Interactive Objects** | Swing motion (subtle); conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | porch swing · swing on the porch |
| **Future Expansion Notes** | Estate Light Flicker on lanterns |

---

### `peaceful-places`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Peaceful Places™ |
| **Category** | Living Place |
| **Primary Feeling** | Calm, safety, restoration, breath |
| **Background Image** | `/backgrounds/peaceful-places/woodland-pathway.png` **TBD** |
| **Permanent Objects** | Woodland path; pond edge; calm destinations (hub) |
| **Seasonal Objects** | Mist on pond; rain ambience |
| **Interactive Objects** | Soundscape destinations (pond, woodland); ambience toggle |
| **Conversation Style** | `calm-restoration` |
| **Arrival Behavior** | `ambient-crossfade` — Shari suggests calm; member chooses sub-place |
| **Navigation Aliases** | peaceful places · I need calm · help me breathe · quiet place |
| **Future Expansion Notes** | Hub for dock, woodland, coffee nook — not a feature menu |

---

### `seat-at-pond`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Seat at Pond / Dock |
| **Category** | Living Place |
| **Primary Feeling** | Still water, breath, rest |
| **Background Image** | `/backgrounds/seat-at-pond-background.png` |
| **Permanent Objects** | Dock or bench; still water |
| **Seasonal Objects** | Mist (autumn); dragonflies (summer) |
| **Interactive Objects** | Water ambience |
| **Conversation Style** | `calm-restoration` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | dock · pond · sit by the water |
| **Future Expansion Notes** | Sub-place of Peaceful Places™ |

---

### `reading-nook`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Reading Nook |
| **Category** | Living Place |
| **Primary Feeling** | Peaceful, timeless, unhurried |
| **Background Image** | `/backgrounds/reading-nook-background.png` · `/backgrounds/stairway-reading-nook-background.png` |
| **Permanent Objects** | Chair beneath staircase; lamp; small table |
| **Seasonal Objects** | Blanket (winter); open window (summer) |
| **Interactive Objects** | Book on table (optional); conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` — **never** feature menu |
| **Navigation Aliases** | reading nook · nook under the stairs · quiet read |
| **Future Expansion Notes** | Adjacent to Library™ — different category |

---

### `window-seat`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Window Seat |
| **Category** | Living Place |
| **Primary Feeling** | Lookout, rest, quiet companionship |
| **Background Image** | **TBD** |
| **Permanent Objects** | Cushioned seat; orchard or garden view |
| **Seasonal Objects** | Snow on pane; blossom view |
| **Interactive Objects** | Look out; conversation |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | window seat · sit by the window |
| **Future Expansion Notes** | Overlooks Apple Orchard™ |

---

## Destination Places

---

### `library`

| Field | Value |
|-------|-------|
| **Official Estate Name** | The Library™ |
| **Category** | Destination |
| **Primary Feeling** | Curiosity, timelessness, intellectual warmth |
| **Background Image** | `/backgrounds/reading-nook-background.png` *(main hall TBD)* |
| **Permanent Objects** | Shelves; ladder; volumes; ribbon markers; **Accomplishments Book™** shelf |
| **Seasonal Objects** | Hearth nearby (winter); open windows (summer) |
| **Interactive Objects** | Pull a volume; read; discuss with Shari |
| **Conversation Style** | `discovery-dialogue` |
| **Arrival Behavior** | `object-invitation` — shelves visible; **not** Institute drawers |
| **Navigation Aliases** | library · the library · story library · read something |
| **Future Expansion Notes** | **Never** merge with Momentum Institute™ |

---

### `momentum-institute`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Momentum Institute™ |
| **Category** | Destination |
| **Primary Feeling** | Discovery, prestige, earned capability |
| **Background Image** | `/backgrounds/the-momentum-institute-background.webp` |
| **Permanent Objects** | Drawer wall; brass hardware; index cards; study tables |
| **Seasonal Objects** | Subtle light shift; quiet holiday garland (Christmas) |
| **Interactive Objects** | Open drawer; **Knowledge Cards™**; file to Cabinet (permission) |
| **Conversation Style** | `discovery-dialogue` — lessons are conversations |
| **Arrival Behavior** | `object-invitation` — **no** “What would you like to do while we're here?” menu |
| **Navigation Aliases** | momentum institute · the institute · entrepreneur development center |
| **Future Expansion Notes** | Not school; not LMS panels; [Bible Ch. 12–14](./Spark%20Estate%20Bible.md) |

---

### `clear-my-mind`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Clear My Mind™ |
| **Category** | Destination |
| **Primary Feeling** | Relief, lightness, mental spaciousness |
| **Background Image** | `/backgrounds/butterfly-conservatory.webp` *(shared atmosphere)* |
| **Permanent Objects** | Capture surface (diegetic pad/glass); calm glass light |
| **Seasonal Objects** | Rain on glass |
| **Interactive Objects** | Continuous capture; share to Shari |
| **Conversation Style** | `quiet-capture` |
| **Arrival Behavior** | `presence-only` — listen first; organize invisibly later |
| **Navigation Aliases** | clear my mind · clear my head · brain dump |
| **Future Expansion Notes** | Capture ≠ organize; organize workflow inside Clear My Mind (non-canon product label: My Thoughts) |

---

### `creative-studio`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Creative Studio™ |
| **Category** | Destination |
| **Primary Feeling** | Creative calm, possibility, craft |
| **Background Image** | `/backgrounds/creative-studio-background.webp` |
| **Permanent Objects** | Worktable; pens (black/gold); journals; tools |
| **Seasonal Objects** | Natural light shift |
| **Interactive Objects** | Draft workspace (permission before show) |
| **Conversation Style** | `creative-collaboration` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | creative studio · the studio · make something |
| **Future Expansion Notes** | Spec 106 permission before drafts |

---

### `observatory`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Observatory™ |
| **Category** | Destination |
| **Primary Feeling** | Wonder, foresight, calm curiosity |
| **Background Image** | **TBD** *(dedicated observatory plate)* |
| **Permanent Objects** | Telescope; horizon windows; curated stacks |
| **Seasonal Objects** | Clear winter skies; summer haze |
| **Interactive Objects** | Research findings (3–5, conversational) |
| **Conversation Style** | `research-companion` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | observatory · research tower · what's emerging |
| **Future Expansion Notes** | Never dump information |

---

### `stables`

| Field | Value |
|-------|-------|
| **Official Estate Name** | The Stables™ |
| **Category** | Destination |
| **Primary Feeling** | Safe, grounded, calm, capable |
| **Background Image** | `/backgrounds/spark-estate-stables-background.webp` |
| **Permanent Objects** | Stalls; brass; hay warmth; metaphor horses (no gamification) |
| **Seasonal Objects** | Open doors (summer); cozy lamps (winter) |
| **Interactive Objects** | Stables experiences (coaching stories) — conversation-first |
| **Conversation Style** | `coaching` — slower, warmer |
| **Arrival Behavior** | `presence-only` |
| **Navigation Aliases** | stables · the stables · I need confidence |
| **Future Expansion Notes** | Horse is metaphor; never lectures |

---

### `game-room`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Game Room™ |
| **Category** | Destination |
| **Primary Feeling** | Playfulness, relief, light momentum |
| **Background Image** | `/backgrounds/focus-my-brain-games-background.png` **TBD** |
| **Permanent Objects** | Table; playful objects; comfortable chaos |
| **Seasonal Objects** | Subtle holiday game (Christmas) |
| **Interactive Objects** | Momentum builders; quick recharge |
| **Conversation Style** | `playful-reset` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | game room · let's play · brain break |
| **Future Expansion Notes** | Never gamify self-worth |

---

### `momentum-builder`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Momentum Builder™ |
| **Category** | Destination |
| **Primary Feeling** | Honest momentum, hope, forward motion |
| **Background Image** | **TBD** *(dedicated planning studio plate)* |
| **Permanent Objects** | Planning table; lamp; single clear surface |
| **Seasonal Objects** | Morning light bias |
| **Interactive Objects** | One next step workspace (conversation-led) |
| **Conversation Style** | `coaching` |
| **Arrival Behavior** | `presence-only` — *"What's making today difficult?"* |
| **Navigation Aliases** | momentum builder · help me get moving · I'm stuck |
| **Future Expansion Notes** | Never guilt |

---

### `decision-compass`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Decision Compass™ |
| **Category** | Destination |
| **Primary Feeling** | Steadiness, clarity, ownership |
| **Background Image** | **TBD** |
| **Permanent Objects** | Compass motif (diegetic); writing surface |
| **Seasonal Objects** | — |
| **Interactive Objects** | Options exploration; member owns decision |
| **Conversation Style** | `decision-facilitation` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | decision compass · help me decide · stuck between options |
| **Future Expansion Notes** | T-008 ownership always |

---

### `journal`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Journal™ |
| **Category** | Destination |
| **Primary Feeling** | Privacy, honesty, gentle self-awareness |
| **Background Image** | `/backgrounds/gazebo-libjournal-background.png` |
| **Permanent Objects** | Gazebo or writing desk; leather journal; pen |
| **Seasonal Objects** | Garden growth around gazebo |
| **Interactive Objects** | Write; voice-to-text; mic |
| **Conversation Style** | `reflective-writing` |
| **Arrival Behavior** | `presence-only` |
| **Navigation Aliases** | journal · my journal · reflect on this week |
| **Future Expansion Notes** | `/backgrounds/journal-background.png` alternate plate |

---

### `evidence-vault`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Evidence Vault™ |
| **Category** | Destination |
| **Primary Feeling** | Confidence, proof, self-trust |
| **Background Image** | `/backgrounds/evidence-vault-background.webp` |
| **Permanent Objects** | Vault latch; shelves; warm lamp |
| **Seasonal Objects** | — |
| **Interactive Objects** | Add memory of win; open shelf entry (conversation-led) |
| **Conversation Style** | `archive-browsing` |
| **Arrival Behavior** | `object-invitation` — **never** spreadsheet hero |
| **Navigation Aliases** | evidence vault · proof of growth · proof · impact stories · people I helped |
| **Future Expansion Notes** | Retire `evidence-bank` vocabulary |

---

### `portfolio`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Portfolio™ |
| **Category** | Destination |
| **Primary Feeling** | Pride, craft, continuity |
| **Background Image** | `/backgrounds/portfolio-room-background.png` |
| **Permanent Objects** | Folio on desk; project artifacts |
| **Seasonal Objects** | — |
| **Interactive Objects** | Open folio; review work with Shari |
| **Conversation Style** | `archive-browsing` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | portfolio · my portfolio · what I've built |
| **Future Expansion Notes** | Never file-table dashboard |

---

### `goals-projects`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Goals & Projects™ |
| **Category** | Destination |
| **Primary Feeling** | Direction, ownership, honest ambition |
| **Background Image** | **TBD** |
| **Permanent Objects** | Project board (diegetic, calm); desk |
| **Seasonal Objects** | — |
| **Interactive Objects** | Review projects; shape goals |
| **Conversation Style** | `coaching` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | goals and projects · my projects · what am I building |
| **Future Expansion Notes** | No surveillance language |

---

### `celebration-room`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Celebration Room™ |
| **Category** | Destination |
| **Primary Feeling** | Joyful, quiet, honored |
| **Background Image** | `/backgrounds/celebration-garden-background.webp` · `/backgrounds/all-out-celebration-room-background.png` |
| **Permanent Objects** | Flowers; chalkboard; handwritten notes; **The Bell** (permission) |
| **Seasonal Objects** | Seasonal blooms; modest Christmas lights |
| **Interactive Objects** | Ring bell; leave note; quiet ritual — **not** popup card |
| **Conversation Style** | `celebration-ritual` |
| **Arrival Behavior** | `presence-only` — Shari acknowledges; member chooses ritual |
| **Navigation Aliases** | celebration room · celebration garden · celebration · accomplishments · wins · mark this moment |
| **Legacy id** | `celebration-garden` → `celebration-room` (adapters only) |
| **Future Expansion Notes** | Accomplishments Book™ volume may be added here; distinct from `gardens` Living Place |

---

## Collections

---

### `institute-cabinet`

| Field | Value |
|-------|-------|
| **Official Estate Name** | My Institute Cabinet™ |
| **Category** | Collection |
| **Primary Feeling** | Trust, filed wisdom, easy return |
| **Background Image** | Institute archive nook **TBD** |
| **Permanent Objects** | Filing drawers; brass labels; index tabs |
| **Seasonal Objects** | — |
| **Interactive Objects** | Open filed card; discuss saved topic |
| **Conversation Style** | `archive-browsing` |
| **Arrival Behavior** | `object-invitation` — only after Institute save or explicit request |
| **Navigation Aliases** | institute cabinet · my cabinet · what I saved from the institute |
| **Future Expansion Notes** | Not duplicate lesson bodies |

---

### `seeds-planted`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Seeds Planted™ |
| **Category** | Collection |
| **Primary Feeling** | Hope, emergence, gentle growth |
| **Background Image** | Greenhouse or garden plate **TBD** |
| **Permanent Objects** | Seed packets; labeled stakes; starter pots |
| **Seasonal Objects** | Spring planting emphasis |
| **Interactive Objects** | Browse Spark Cards / early ideas |
| **Conversation Style** | `archive-browsing` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | seeds planted · my spark cards · planted seeds |
| **Future Expansion Notes** | Linked from Greenhouse™ via conversation |

---

### `growth-profile`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Growth Profile™ |
| **Category** | Collection |
| **Primary Feeling** | Quiet pride, earned capability |
| **Background Image** | `/backgrounds/greenhouse-background.png` *(shared view — distinct story)* |
| **Permanent Objects** | Growth ledger; timeline markers |
| **Seasonal Objects** | — |
| **Interactive Objects** | Review capability growth (quiet, not dashboard) |
| **Conversation Style** | `personal-continuity` |
| **Arrival Behavior** | `object-invitation` |
| **Navigation Aliases** | growth profile · how am I growing · my capabilities |
| **Future Expansion Notes** | **Not** the Greenhouse — shared art only |

---

### `my-estate`

| Field | Value |
|-------|-------|
| **Official Estate Name** | My Estate™ |
| **Category** | Collection |
| **Primary Feeling** | Ownership, continuity, belonging |
| **Background Image** | `/backgrounds/spark-estate-photo-background.png` |
| **Permanent Objects** | Personal estate photo; mementos |
| **Seasonal Objects** | Photo may reflect season (subtle) |
| **Interactive Objects** | Preferences (conversation-led); profile |
| **Conversation Style** | `personal-continuity` |
| **Arrival Behavior** | `ambient-crossfade` |
| **Navigation Aliases** | my estate · estate profile |
| **Future Expansion Notes** | Not a settings app with wallpaper |

---

### `accomplishments-shelf`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Accomplishments Book™ (Library shelf) |
| **Category** | Collection |
| **Primary Feeling** | Honored story, legacy |
| **Background Image** | Within Library™ plates |
| **Permanent Objects** | Volumes on shelf; ribbon markers |
| **Seasonal Objects** | New volume binding (quiet) |
| **Interactive Objects** | Open volume; read story; add chapter (permission) |
| **Conversation Style** | `celebration-ritual` |
| **Arrival Behavior** | `object-invitation` via Library — never achievement popup |
| **Navigation Aliases** | accomplishments book · my accomplishments book · show me my accomplishments |
| **Future Expansion Notes** | Bible Ch. 17; pairs with Bell in celebration-room |

---

## Transition Spaces

---

### `main-hallway`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Main Hallway |
| **Category** | Transition Space |
| **Primary Feeling** | Belonging, flow, quiet |
| **Background Image** | **TBD** |
| **Permanent Objects** | Art; runner rug; soft lamps |
| **Seasonal Objects** | Holiday garland (subtle) |
| **Interactive Objects** | None required |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `pass-through` |
| **Navigation Aliases** | hallway · down the hall |
| **Future Expansion Notes** | Never blocks with menus |

---

### `main-staircase`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Main Staircase |
| **Category** | Transition Space |
| **Primary Feeling** | Vertical calm, discovery |
| **Background Image** | `/backgrounds/stairway-reading-nook-background.png` *(landing)* |
| **Permanent Objects** | Stairs; landing; reading nook below |
| **Seasonal Objects** | — |
| **Interactive Objects** | Pause on landing |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `pass-through` |
| **Navigation Aliases** | stairs · up the stairs · reading nook |
| **Future Expansion Notes** | Connects to Reading Nook |

---

### `front-drive`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Front Drive |
| **Category** | Transition Space |
| **Primary Feeling** | Arrival, anticipation |
| **Background Image** | Welcome Home approach **TBD** |
| **Permanent Objects** | Drive; trees; porch light |
| **Seasonal Objects** | Snow; autumn leaves |
| **Interactive Objects** | None |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `pass-through` — optional approach before `welcome-home` |
| **Navigation Aliases** | drive up · arriving |
| **Future Expansion Notes** | Cinematic optional; skippable |

---

### `garden-path`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Garden Path |
| **Category** | Transition Space |
| **Primary Feeling** | Movement, seasonal air |
| **Background Image** | Shared gardens plates |
| **Permanent Objects** | Gravel or stone path; plantings |
| **Seasonal Objects** | Full seasonal guide |
| **Interactive Objects** | Walk |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `pass-through` |
| **Navigation Aliases** | garden path · walk with me |
| **Future Expansion Notes** | Orchard ↔ greenhouse ↔ celebration |

---

### `woodland-path`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Woodland Path |
| **Category** | Transition Space |
| **Primary Feeling** | Calm approach, anticipation |
| **Background Image** | `/backgrounds/discovery-room-background.png` *(rename canon TBD)* |
| **Permanent Objects** | Trees; filtered light |
| **Seasonal Objects** | Mud and mist (autumn); bird song (spring) |
| **Interactive Objects** | Walk into Peaceful Places™ |
| **Conversation Style** | `calm-restoration` |
| **Arrival Behavior** | `pass-through` |
| **Navigation Aliases** | woodland path · into the trees |
| **Future Expansion Notes** | Entry to Peaceful Places™ |

---

### `balcony`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Balcony |
| **Category** | Transition Space |
| **Primary Feeling** | Overlook, pause |
| **Background Image** | **TBD** |
| **Permanent Objects** | Railing; chairs |
| **Seasonal Objects** | Seasonal light on gardens |
| **Interactive Objects** | Look out |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `pass-through` |
| **Navigation Aliases** | balcony · overlook |
| **Future Expansion Notes** | Evening affinity |

---

### `bridge`

| Field | Value |
|-------|-------|
| **Official Estate Name** | Garden Bridge |
| **Category** | Transition Space |
| **Primary Feeling** | Crossing, gentle discovery |
| **Background Image** | **TBD** |
| **Permanent Objects** | Wooden bridge; stream below |
| **Seasonal Objects** | — |
| **Interactive Objects** | Cross |
| **Conversation Style** | `open-presence` |
| **Arrival Behavior** | `pass-through` |
| **Navigation Aliases** | bridge · over the stream |
| **Future Expansion Notes** | Section 02 — future grounds |

---

## Portable objects (cross-reference)

Not walkable locations. Documented in [Bible Section 04](./bible/Section%2004%20-%20Estate%20Objects.md).

| Object | Primary homes | Registry role |
|--------|---------------|---------------|
| **Guidebook™** | Welcome Home desk; Library | Map · traditions · orientation |
| **Folded Estate Map™** | Any room corner | Pause conversation; show places |
| **The Bell** | Celebration Room™ | Milestone ritual (permission) |
| **Knowledge Cards™** | Momentum Institute | Pick up → conversation |
| **Discovery Key™** | Estate-wide | Unlocks experiences quietly |
| **Letters** | Sunroom; Journal | Shari → member |

---

## Background image manifest (summary)

| Status | Count | Action |
|--------|-------|--------|
| **Approved on disk** | ~16 plates | Align filenames to this registry |
| **TBD** | ~20+ | Image Bible generation queue |
| **Known issues** | `sunroom-background,.png` typo; spaces in filenames; wrong cross-fallbacks |

Full art rules: [ESTATE_IMAGE_BIBLE.md](./ESTATE_IMAGE_BIBLE.md) · `lib/estate/estateImageStandards.ts`

---

## Critical distinctions (never merge)

| A | B | Why |
|---|---|-----|
| **Library™** | **Momentum Institute™** | Stories/volumes vs drawer discovery |
| **Greenhouse™** | **Growth Profile™** | Talk/nurture vs capability ledger |
| **Conservatory™** | **Clear My Mind™** | Living atmosphere vs capture destination |
| **Gardens™** | **Celebration Room™** | Walk vs ritual |
| **Peaceful Places™** | **Apple Orchard™** | Calm hub vs open-air ideation |
| **Reading Nook** | **Library™** | Living pause vs volume destination |

---

## Document control

| Version | Change |
|---------|--------|
| 1.0 | Initial canonical registry — Phase A |

**Next step (Phase B):** Generate code registry and CI tests **from** this document.  
**Do not** edit this registry to match broken implementation — fix implementation to match canon.
