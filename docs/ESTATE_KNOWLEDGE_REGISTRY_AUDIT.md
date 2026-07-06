# Estate Knowledge Registry Audit

**Date:** 2026-07-05  
**Status:** Audit + **binding architecture alignment** — no code changes until approved  
**Foundational principle:** **THE RELATIONSHIP OWNS THE WORK.**

**Binding stack:** Relationship → Conversation → Estate Intelligence → Creating Together → Studio → Artifact → Member Journey. See [docs/README.md](./README.md) for the full stack including **Creation Guidance Intelligence** (approved 2026-07-06).

**Problem:** Spark cannot reliably answer “What rooms exist?”, “Where can I read?”, “Where is the Treehouse?”, “Do you have a butterfly conservatory?”, or “Where can I create an SOP?”

**Root cause (summary):** The Estate has **one canonical place registry (75 places)** but **five disconnected knowledge/routing layers** that each expose a different subset. Chat answers are assembled from hard-coded 3-room lists, a 12-space Estate Brain slice, and local FAQ copy — not from the full registry.

---

## Executive summary

| Layer | Count | Used for chat answers? |
|-------|------:|------------------------|
| **Canonical registry** (`canonicalEstateRegistry.ts`) | **75** places | Partial — name resolution only |
| **Estate Directory** (`directory/buildDirectory.ts`) | **75** entries | Dev/architect; not wired to chat FAQ |
| **Estate Brain spaces** (`estateBrain/knowledgeRegistry.ts`) | **12** spaces + 10 experiences | **Yes** — `roomsGuideBody()` shows first **8** spaces only |
| **Estate Mount table** (`estateMountRegistry.ts`) | **11** mounted | UI only |
| **Hard-coded wander menus** | **3** places per menu | **Yes** — dominant “where can I go?” surface |
| **App Feature Knowledge** (`appFeatureKnowledge.ts`) | **~20** features | Prompt hints; many tools missing |
| **Physical Guidebook** (`data/estateGuideSpreads.ts`) | Rich room stories | **UI only** — not chat |

**The registry exists. Chat does not read it completely.**

---

## 1. Current knowledge architecture (why answers fail)

```
Member asks "What rooms do you have?"
        │
        ├─► estateGuide.ts → roomsGuideBody()
        │       └─► first 8 of 12 Estate Brain spaces (not 75)
        │
        ├─► estateMetaNavigation / estateWanderNavigation
        │       └─► slice(0, 3) from fixed arrays (15 or 7 ids)
        │
        ├─► estatePlaceClusters.ts
        │       └─► another fixed 3-id set per vague need
        │
        ├─► matchCanonicalPlaceInText() / resolveEstatePlace()
        │       └─► works for explicit names — fails for catalog questions
        │
        └─► shariKnowledge.ts / estateCapabilityRegistry
                └─► capabilities + experiences — not full place catalog
```

**Two different “live” definitions:**

| Function | Rule | Effect |
|----------|------|--------|
| `place.status === "live"` | Registry canon | **9** places |
| `isLiveEstatePlace()` | Excludes `planned` + `future` only | **~44** places walkable in pending-choice menus |
| `ESTATE_WANDER_PLACE_ORDER` | **No live filter** | Can offer `conservatory` (`planned`), `tea-room` (`future`) |

---

## 2. Canonical registry statistics

**Authority:** `lib/estate/canonicalEstateRegistry.ts` (75 places = 62 main + 19 subplaces)

| Status | Count | Meaning |
|--------|------:|---------|
| `live` | 9 | Fully shipped |
| `partial` | 7 | Shipped with gaps |
| `needs-asset` | 34 | Defined; art/routing incomplete |
| `planned` | 28 | Canon; not member-facing per status |
| `future` | 3 | Deferred |

| Category | Count |
|----------|------:|
| living-place | 32 |
| destination | 28 |
| collection | 8 |
| transition-space | 7 |

**Status values:** `live` · `partial` · `planned` · `future` · `needs-asset` — **no `hidden` status.**

---

## 3. All Estate places (canonical inventory)

### 3.1 User-requested places (detailed)

| Display name | place ID | Registry status | `isLiveEstatePlace` | Category tags | Key synonyms (aliases) | Background / media | Chat can route? | Menu can show? | Spark can describe? |
|--------------|----------|-----------------|---------------------|---------------|------------------------|-------------------|-----------------|----------------|---------------------|
| **Welcome Home™** | `welcome-home` | needs-asset | ✅ | orient, threshold | welcome home, go home, take me home | Registry: `null`; no plate in `estatePlaceMedia` | ✅ resolve by alias | ❌ not in wander lists | ⚠️ registry objects only; weak brain entry |
| **Coffee House™** | `coffee-house` | partial | ✅ | calm, focus, gather | coffee house, cafe, cozy cafe | `room-coffee-house-background.png` + cafe ambience mp3 | ✅ | ✅ wander #1 | ✅ brain space |
| **The Library™** | `library` | needs-asset | ✅ | reading, learn, study | library, estate library, read something | `room-library-estate-background.png` + gallery ambience | ✅ | ✅ wander #2 | ✅ brain space |
| **Reading Nook** | `reading-nook` | needs-asset | ✅ | reading, quiet, rest | reading nook, under the stairs, quiet read | `reading-nook-window background.png` | ✅ | ✅ wander #15; cluster | ✅ brain space |
| **Greenhouse™** | `greenhouse` | **live** | ✅ | growth, calm, orient | greenhouse, working greenhouse, plant an idea | `greenhouse-background.png` + birds ambience | ✅ | ⚠️ wander only | ⚠️ no dedicated brain space |
| **Butterfly Conservatory** | `conservatory` | **planned** | ❌ | restoration, think, play | conservatory, **butterfly conservatory** | Media: `butterfly-conservatory.png`; registry `backgroundImage` wrongly points to greenhouse plate | ⚠️ named routing blocked by `planned`; wander offers it anyway | ✅ exploratory list | ⚠️ PLAY experience mentions it; **no space brain entry** |
| **Reflection Pond™** | `reflection-pond` | needs-asset | ✅ | water, reflective, quiet | reflection pond, visit the reflection pond | `water-seat-at-pond-background.png` (shared w/ seat-at-pond) | ✅ | ✅ water cluster | ❌ no brain entry |
| **Journal Gazebo** (Gazebo) | `journal` | needs-asset | ✅ | reflection, journal, outdoor | gazebo, journal gazebo | `gazebo-journal-background.png` | ✅ alias `gazebo` | ⚠️ mount only | ⚠️ JOURNAL experience, not gazebo-specific |
| **Back Deck** | `back-deck` | planned | ❌ | outdoor, evening | back deck, sit outside | `peaceful-places/east-terrace-peaceful-places.png` | ❌ blocked | ❌ | ❌ |
| **Fireside Deck™** | `fireside-deck` | needs-asset | ✅ | outdoor, rest, deck | fireside deck | `fireside-deck-background.PNG` | ✅ | ❌ | ❌ |
| **Personal Deck™** | `personal-deck` | needs-asset | ✅ | outdoor, balcony | personal deck, balcony | `private-balcony-sunset-background.PNG` | ✅ | ❌ | ❌ |
| **Summer Terrace / Pool** | `summer-terrace` | partial | ✅ | water, outdoor, pool | pool, swimming pool, summer terrace | `water-swimming-pool-private-background.png` | ✅ alias `pool` | ✅ wander | ❌ no brain entry |
| **Lakeside Hammock** | `lakeside-hammock` | needs-asset | ✅ | water, rest | hammock, lakeside | `water-lakeside-hammock-background.png` | ✅ | ✅ lake/hammock clusters | ✅ brain space |
| **Seat at Pond / Dock** | `seat-at-pond` | needs-asset | ✅ | water, calm | dock, pond, sit by the water | `water-seat-at-pond-background.png` | ✅ | ✅ water clusters | ❌ |
| **Observatory** | `observatory` | needs-asset | ✅ | outside, think, stars | observatory | `observatory-daytime-outside-background.png` + gallery ambience | ✅ | ✅ wander #3 | ❌ no brain space |
| **Possibility House / Treehouse** | `house-possibility-outside` | **planned** | ❌ | treehouse, curious, creative | possibility house, house of possibility | Media: `treehouse-possibility-house-outside-background.png`; registry `backgroundImage: null` | ❌ `isLiveEstatePlace` false | ❌ | ⚠️ canonical story via `roomStoryBody`; no brain |
| **Possibility Staircase** | `house-possibility-staircase` | planned | ❌ | treehouse, reading | treehouse staircase, possibility staircase | `treehouse-possibility-staircase-window-reading-nook-background.png` | ❌ | ❌ | ⚠️ registry only |
| **Discovery Chest** | `house-possibility-discovery-chest` | planned | ❌ | treehouse, collection | discovery chest, open the discovery chest | `treehouse-possibility-discovery-chest-background.png` | ❌ | ❌ | ❌ |
| **Cabinet of Chapters** | `house-possibility-cabinet-of-chapters` | planned | ❌ | treehouse, legacy | curiosity cabinet (related) | `treehouse-possibility-cabinet-of-chapters-background.png` | ❌ | ❌ | ❌ |
| **Reflection Desk** | `house-possibility-reflection-desk` | planned | ❌ | treehouse, reflective | treehouse reflection desk | `treehouse-possibility-reflection-desk-background.png` | ❌ | ❌ | ❌ |
| **Legacy Room** | `house-possibility-legacy-room` + `legacy-room-main` | planned | ❌ | legacy, reflection | legacy room (two canon entries: treehouse wing + main estate) | Treehouse: `treehouse-possibility-legacy-room-background.png` | ❌ | ❌ | ❌ |
| **Treehouse Observatory** | `house-possibility-observatory` | planned | ❌ | treehouse, stars | possibility observatory, treehouse observatory | `treehouse-possibility-observatory-background.png` | ❌ | ❌ | ❌ |
| **Round Table™ / Boardroom** | `round-table` | needs-asset | ✅ | strategy, business, decide | boardroom, round table, board room | `round-table-boardroom-background.png` | ✅ | ❌ wander | ✅ brain as “Boardroom” |
| **Working Conference Room** | — | **not in canon** | — | — | — | — | — | — | — |
| **Listening Rooms** | — | **not a place ID** | — | music, calm | — | Music Room ambience copy: “warm listening room” | — | — | ❌ concept only |
| **Music Room™** | `music-room` | partial | ✅ | music, focus, calm | music room, piano, I want music | `music-room-background.png` + piano ambience | ✅ | ✅ wander + exploratory | ✅ brain space |
| **Clear My Mind™** | `clear-my-mind` | needs-asset | ✅ | restore, overwhelm | clear my mind, brain dump | Sunroom plate in registry; **UI also uses** `butterfly-conservatory.png` via `CLEAR_MY_MIND_CONSERVATORY_BG` | ✅ → `brain-dump` section | ❌ not in wander | ✅ brain space |
| **Stairway Reading Nook** | `stairway-reading-nook` | needs-asset | ✅ | reading | (via main-staircase aliases) | `reading-nook-under-stairway-background.png` | ✅ | ✅ reading cluster | ❌ |
| **Decision Compass** | `decision-compass` | needs-asset | ✅ | decide, think | decision compass, writing room | `writing-room-background.png` | ✅ → workspace | ❌ | ⚠️ features_missing blurb only |
| **Peaceful Places™** (audio hub) | `peaceful-places` | needs-asset | ✅ | calm, focus audio | peaceful places, I need calm | woodland path + rain plates | ✅ scene-only | ✅ exploratory list | ❌ no brain space |

**Note on “Working Conference Room”:** Not registered. Closest canon: **`round-table`** (Boardroom™) and **`strategy-studio`**. No separate conference-room id.

**Note on “Listening Rooms”:** Not a place. **`music-room`** and **`peaceful-places`** (Focus Audio / soundscapes) cover the intent. Chat should explain that relationship — it currently does not.

---

### 3.2 Butterfly Conservatory — media disconnect (critical)

| Source | What it says |
|--------|----------------|
| `canonicalEstatePlaces.ts` | `id: conservatory`, status **`planned`**, aliases include **butterfly conservatory** |
| `canonicalEstatePlaces.ts` | `backgroundImage: "/backgrounds/greenhouse-background.png"` |
| `estatePlaceMedia.ts` | `conservatory` → **`butterfly-conservatory.png`** |
| `estateRoomAssets.ts` | `butterflyConservatory` key → same butterfly plate |
| `lib/clearMyMind/conservatory.ts` | Clear My Mind standalone uses **`butterfly-conservatory.png`** (not sunroom) |
| `estatePlaceMedia.ts` ambience | No dedicated conservatory loop; music-room copy says “listening room” |
| `knowledgeRegistry.ts` PLAY | Lists “Butterfly Conservatory” as capability — **no `kind: "space"` entry** |
| `isLiveEstatePlace("conservatory")` | **false** — pending-choice / capability navigate blocks |
| `ESTATE_WANDER_PLACE_ORDER` | Includes **`conservatory`** anyway — menu can offer, navigate may fail or feel broken |

**No video references found** in code for conservatory (image + ambience only).

---

### 3.3 Full canonical place list (75)

#### Main places (62) — `lib/estate/canonicalEstatePlaces.ts`

**Living places (32):**  
`welcome-home` · `sunroom` · `conservatory` · `coffee-house` · `tea-room` · `music-room` · `greenhouse` · `gardens` · `garden-bench` · `apple-orchard` · `back-deck` · `porch-swing` · `peaceful-places` · `seat-at-pond` · `reading-nook` · `personal-deck` · `estate-kitchen` · `spark-estate` · `dining-room` · `summer-terrace` · `grand-terrace` · `lakeside-verandah` · `lakeside-hammock` · `reflection-pond` · `fireside-deck` · `estate-gardens` · `stairway-reading-nook` · `window-seat`

**Destinations (28):**  
`library` · `personal-library` · `momentum-institute` · `study-hall` · `momentum-room` · `discovery-room` · `art-studio` · `strategy-studio` · `round-table` · `gallery-of-firsts` · `clear-my-mind` · `creative-studio` · `observatory` · `stables` · `game-room` · `momentum-builder` · `decision-compass` · `journal` · `evidence-vault` · `portfolio` · `goals-projects` · `celebration-room`

**Collections (8):**  
`institute-cabinet` · `seeds-planted` · `growth-profile` · `my-estate` · `accomplishments-shelf`

**Transitions (7):**  
`main-hallway` · `main-staircase` · `front-drive` · `garden-path` · `woodland-path` · `balcony` · `bridge`

#### Subplaces (19) — `lib/estate/canonicalEstateSubplaces.ts`

**Possibility House / Treehouse tree:**  
`house-possibility-outside` · `house-possibility-studio` · `house-possibility-dream-wall` · `house-possibility-telescope-deck` · `house-possibility-discovery-chest` · `house-possibility-curiosity-cabinet` · `house-possibility-window-nook` · `house-possibility-staircase` · `house-possibility-reflection-desk` · `house-possibility-observatory` · `house-possibility-cabinet-of-chapters` · `house-possibility-legacy-room`

**Main Estate Legacy wing:**  
`legacy-room-main` · `legacy-room-reflection-corner` · `legacy-room-legacy-desk` · `legacy-room-cabinet-of-chapters`

**Observatory subspaces:**  
`observatory-telescope-window` · `observatory-fireplace`

**Other:**  
`reflection-tree-main`

**All Possibility House + Legacy subplaces:** status **`planned`**, assets largely present in `estatePlaceMedia.ts`, registry `backgroundImage` often **`null`**.

---

### 3.4 Legacy / parallel registries (do not treat as authority)

| File | Places | Status |
|------|-------:|--------|
| `lib/estate/estateRoomRegistry.ts` | 27 | **@deprecated** — pre-Phase-B walkable catalog |
| `lib/estate/placeIdAliases.ts` | — | Alias map (`pool` → `summer-terrace`, `gazebo-journal` → `journal`) |
| `lib/estate/estateRoutingRegistry.ts` | 75 + ambiguity groups | Routing derived from canonical |
| `lib/estate/estateMountRegistry.ts` | 11 | Phase-1 UI mount table only |

---

## 4. Missing or disconnected places

### 4.1 Places with assets but weak/no chat knowledge

| place ID | Asset exists | Chat gap |
|----------|--------------|----------|
| `conservatory` | `butterfly-conservatory.png` | `planned` blocks navigate; no brain space; wander still offers |
| `house-possibility-*` (12+) | Treehouse PNG set in media map | All `planned`; Spark cannot honestly say “take me there” |
| `reflection-pond`, `seat-at-pond`, `observatory`, `greenhouse` | Yes | Not in Estate Brain `SPACES` (except partial overlap) |
| `welcome-home` | Partial / null in registry | Not in brain; threshold arrival under-documented in chat |
| `fireside-deck`, `personal-deck`, `grand-terrace`, `lakeside-verandah` | Yes | No brain entries; not in wander lists |
| `stables`, `celebration-room`, `discovery-room`, `evidence-vault` | Yes | Experience-level only or wander line only |

### 4.2 In registry but filtered from menus

| place ID | Why hidden from menus |
|----------|----------------------|
| `porch-swing`, `back-deck` | `planned` → `isLiveEstatePlace` false — **regression #9** (stress test routed to porch swing then failed) |
| All `house-possibility-*` | `planned` |
| `tea-room` | `future` |

### 4.3 In menus but not reliably routable

| place ID | Issue |
|----------|-------|
| `conservatory` | In `ESTATE_WANDER_PLACE_ORDER` + exploratory list; **`planned`** |
| `tea-room` | In wander order; status **`future`** |
| `library`, `observatory` | In default wander trio; **`needs-asset`** — may lack full mount/shell |

### 4.4 Registry vs media inconsistencies

| place ID | Issue |
|----------|-------|
| `conservatory` | Registry `backgroundImage` = greenhouse; media map = butterfly |
| `clear-my-mind` | Registry = sunroom; product UI = butterfly conservatory plate |
| `reading-nook` | Filename has space: `reading-nook-window background.png` |
| `game-room` | Filename has space: `game-room- background.webp` |

### 4.5 Estate Brain coverage gap

**12 spaces** in `knowledgeRegistry.ts` `SPACES` array vs **75** canonical places:

Present: `clear-my-mind`, `coffee-house`, `lakeside-hammock`, `sunroom`, `study-hall`, `round-table`, `art-studio`, `music-room`, `library`, `reading-nook`

**Missing as spaces (63+):** including greenhouse, conservatory, reflection-pond, observatory, journal/gazebo, all water decks, all treehouse subplaces, evidence-vault, decision-compass, peaceful-places, creative-studio, stables, etc.

`roomsGuideBody()` (`estateGuide.ts`) lists **first 8** of those 12 — members never hear about 67+ registered places.

### 4.6 Guidebook vs chat

| Surface | Content | Chat wired? |
|---------|---------|-------------|
| `data/estateGuideSpreads.ts` | Rich stories (Clear My Mind Sunroom, Evidence Vault, …) | **No** |
| `lib/sparkKnowledge/estateGuide.ts` | Short FAQ bodies | **Yes** (local, pre-API) |
| `components/estate-guide/EstateGuideFlipbook.tsx` | Physical book UI | Manual open only |

---

## 5. Feature knowledge audit

| Feature | What it does | How users ask | Chat should say (Shari) | Opens tool or stays in chat? | Route / component | Status |
|---------|--------------|---------------|-------------------------|------------------------------|-------------------|--------|
| **Clear My Mind** | Continuous thought capture | “clear my mind”, “brain dump” | Relief-first; capture not organize | **Tool** — standalone `brain-dump` | `BrainDumpPanel.tsx`, `openClearMyMindCore` | **live** — brain + app feature |
| **Plan My Day** | Daily planning by energy | “plan my day”, “today’s plan” | One-day focus, not task manager | **Tool** — `plan-my-day` | `PlanMyDayPanel.tsx` | **live** |
| **Focus Music / Peaceful Places** | Ambient audio / soundscapes | “focus music”, “help me focus”, “peaceful” | Name **Peaceful Places** or music room — align copy | **Tool** — `focus-audio` or place | `FocusAudioPanel.tsx`, `music-room` | **live** — naming split |
| **Listening Rooms** | (Not a product id) | “listening room”, “background music” | Explain Music Room + Peaceful Places | Place or audio tool | `music-room`, `peaceful-places` | **planned concept** — not documented |
| **Decision Compass / visual decision map** | Structured decision walkthrough | “decision compass”, “help me decide” | Offer compass; optional mind map later | **Workspace beside chat** | `DecisionCompassWorkspace.tsx`, `decision-compass` | **live** — weak in `APP_FEATURES` |
| **Email Writer** | Email drafting | “write an email”, “email writer” | Conversation → Create/email panel | **Workspace** — `email-generator` or Create | `EmailGeneratorPanel.tsx`, UC plugin `email` | **live** — chat steers to generic Create |
| **SOP Builder** | SOP drafting | “write an sop”, “document a process” | UC discovery → Create SOP | **Workspace** — `content-generator` | Universal Creation + Create panel | **live** — continuity issues (see Conversation Session audit) |
| **Proposal Builder** | Proposal drafting | “proposal”, “client proposal” | Same Create path | **Workspace** | UC plugin `proposal` | **live** — not in app feature catalog |
| **Content Creator / Create** | Multi-type creation studio | “create content”, “help me write” | Estate Create experience | **Workspace** — `content-generator` | `ContentGeneratorPanel.tsx`, `creative-studio` place | **live** |
| **Sales Funnel Builder** | Funnel / marketing plan | “sales funnel”, “build a funnel” | **Conflict:** UC plugin vs brain `business.funnel` → playbook | **Workspace** (unclear which) | Create plugin + `strategies`/`round-table` | **live** — **dual routes** |
| **Evidence Bank / Vault** | Growth evidence collection | “evidence vault”, “celebrate wins” | Quiet celebration of real growth | **Place** — `evidence-bank` | `EstateCollectionRoomPanel` | **live** — missing from `APP_FEATURES` |
| **Parking Lot** | Park idea while focusing (Focus activity) | “park this for later” | Not a room — Focus tool | **Focus activity** | `brain-parking-lot` in APP_FEATURES | **live** — name collision with Plan My Day defer |
| **Templates** | Template library | “templates”, “starting points” | Browse templates | **Panel** — `templates-library` | `TemplatesLibrary.tsx` | **live** |
| **Connected Apps** | Google / integrations settings | “connect gmail”, “calendar sync” | Settings → Connections | **Settings** | `integrationIntent.ts`, Connections UI | **live** — not in compact app-feature prompt |
| **Gmail / Calendar / Drive** | Google Workspace open-in-app | “open my sheet”, “google doc” | Integration routing | **Panel / external** | `GoogleWorkspacePanel.tsx` | **partial** |
| **Visual Thinking / Mind Map** | Maps, whiteboards, canvas | “mind map”, “visual thinking” | Visual Focus studio | **Workspace** — `visual-focus` | `visualFocus/store.ts` | **live** |
| **Strategies / Playbook** | Strategy templates + apply | “marketing strategy”, “playbook” | Strategy studio / apply coach | **Workspace** — `strategies` | `StrategiesPanel`, strategy apply session | **live** |
| **Momentum / Projects** | Project execution | “my projects”, “goals” | Momentum experience | **Section** — `projects`, `goals-projects` | Projects panels | **live** |
| **Growth Journal** | Business journaling | “journal”, “growth journal” | Journal Gazebo or growth journal | **Place / panel** | `JournalGazeboExperience`, `growth-journal` | **live** |
| **Breathe / Focus Timer** | EF support tools | “help me breathe”, “focus timer” | Calm tool offer | **Sidebar tools** | Breathe, focus-timer panels | **live** |
| **Estate Map / Guidebook** | Orientation | “estate map”, “what rooms” | Full catalog from registry — **not 3 rooms** | Chat + optional map UI | `estateGuide`, wander (broken), flipbook | **partial** |

### 5.1 Feature knowledge sources (files)

| Source | Path | Role |
|--------|------|------|
| App Feature Knowledge | `lib/appFeatureKnowledge.ts` | Chat API hints |
| App Feature Navigation | `lib/appFeatureNavigation.ts` | How-to + open beside chat |
| Estate Brain | `lib/estateBrain/knowledgeRegistry.ts` | Experiences + 12 spaces |
| Estate Capabilities | `lib/estateCapabilityRegistry/catalog.ts` | Concierge menus, create/focus/momentum |
| Estate Guide (chat) | `lib/sparkKnowledge/estateGuide.ts` | Local FAQ before API |
| Shari Knowledge index | `lib/sparkKnowledge/shariKnowledge.ts` | Unified search (partial) |
| Universal Creation plugins | `lib/universalCreation/documentRegistry.ts` | Create-type features |
| Workspace offers | `lib/workspaceMode.ts` | Regex → workspace cards |
| Physical guidebook | `data/estateGuideSpreads.ts` | **Not in chat pipeline** |

---

## 6. Hard-coded 3-room fallback lists (must retire)

| File | Constant | Default 3 (examples) | Filter live? |
|------|----------|------------------------|--------------|
| `lib/estate/estateWanderNavigation.ts` | `ESTATE_WANDER_PLACE_ORDER` | coffee-house, library, observatory (+12 more in pool) | **No** |
| `lib/estate/estateMetaNavigation.ts` | `DEFAULT_EXPLORATORY_PLACE_IDS` | coffee-house, music-room, conservatory | **No** |
| `lib/estate/estatePlaceClusters.ts` | `VAGUE_CLUSTERS` | 3 ids per need (water, read, …) | **No** |
| `lib/estate/estatePlaceClusters.ts` | `AMBIGUOUS_DESTINATION_CLUSTERS` | pond, lake, hammock, nook | **No** |
| `lib/pendingChoice/listContinuation.ts` | expanded menu | `pickNextLivePlaceIds` from wander order | **Yes** (only expansion path) |

**These override the 75-place registry for member-facing “where can I go?”** — documented in `docs/CONVERSATION_REGRESSION_AUDIT.md` regression **#1**.

---

## 7. Proposed single source of truth: `estateKnowledgeRegistry`

**Goal:** One exported registry consumed by chat FAQ, concierge, wander suggestions, capability routing, and guidebook sync — **derived from** canonical places, not parallel lists.

### 7.1 Proposed module layout

```
lib/estateKnowledgeRegistry/
  index.ts                 # public API
  types.ts                 # EstateKnowledgePlace, EstateKnowledgeFeature, …
  buildRegistry.ts         # compile from canonical + directory + mounts
  placeGroups.ts           # water, reading, focus, calm, treehouse, …
  featureLinks.ts          # place ↔ AppSection ↔ capability id
  suggestedPrompts.ts      # Shari-facing answer templates
  query.ts                 # answerMemberQuery(intent) — single chat entry
```

### 7.2 Record shape (place)

```typescript
type EstateKnowledgePlace = {
  placeId: string;                    // canonical id
  displayName: string;                // officialName
  status: CanonicalEstateStatus;
  memberVisible: boolean;             // derived: status + mount + asset policy
  category: CanonicalEstateCategory;
  groups: EstatePlaceGroupId[];       // water | reading | focus | calm | …
  synonyms: string[];                 // from canonical aliases
  emotionalNeeds: string[];           // suggestionProfiles + recommendWhen
  primaryFeeling: string;
  description: string;                // for Spark to quote
  suggestedActivities: string[];
  media: {
    background?: string;
    ambience?: string;
    video?: string;
  };
  routing: {
    canNavigate: boolean;             // goToPlace + isLive policy
    appSection?: AppSection | null;
    mountTier?: EstateExperienceTier;
    capabilityIds?: string[];
  };
  relatedPlaceIds: string[];
  guidebookSpreadId?: string;
};
```

### 7.3 Record shape (feature)

```typescript
type EstateKnowledgeFeature = {
  featureId: string;
  displayName: string;
  synonyms: string[];
  description: string;
  howToAsk: string[];
  chatAnswer: string;                 // Shari test passed
  opens: "chat" | "workspace" | "tool" | "place" | "settings";
  route: { appSection?: AppSection; placeId?: string; capabilityId?: string };
  status: "live" | "partial" | "planned";
  relatedFeatureIds: string[];
};
```

### 7.4 Place groups (for “show me all water places”)

| Group ID | Example place IDs |
|----------|-------------------|
| `water` | `seat-at-pond`, `reflection-pond`, `lakeside-verandah`, `lakeside-hammock`, `summer-terrace` |
| `reading` | `library`, `personal-library`, `reading-nook`, `stairway-reading-nook`, `window-seat`, `house-possibility-window-nook` |
| `focus` | `study-hall`, `discovery-room`, `decision-compass`, `music-room`, `coffee-house` |
| `calm` | `peaceful-places`, `sunroom`, `journal`, `porch-swing`, `gardens` |
| `creation` | `creative-studio`, `art-studio`, `clear-my-mind` |
| `strategy` | `round-table`, `strategy-studio`, `goals-projects` |
| `music` | `music-room`, `peaceful-places` |
| `reflection` | `journal`, `reflection-pond`, `house-possibility-reflection-desk`, `legacy-room-main` |
| `treehouse` | all `house-possibility-*` |
| `outdoor` | `estate-gardens`, `apple-orchard`, `woodland-path`, decks, `observatory` |

Groups are **tags on registry entries**, not separate hard-coded menus.

### 7.5 Build rules

1. **Compile from** `CANONICAL_ESTATE_REGISTRY` + `buildDirectory()` media/shell + `ESTATE_MOUNT_REGISTRY`.
2. **Merge** Estate Brain space/experience copy where ids match; flag gaps for editorial pass.
3. **Merge** `APP_FEATURES` + capability catalog for feature records.
4. **Never** duplicate place ids in wander arrays — call `queryPlaces({ group, limit, liveOnly, excludeId })`.
5. **Export** `answerEstateKnowledgeQuery(text)` used by `estateGuide.ts`, frictionless, and API hints.

---

## 8. Required behavior after registry exists

Spark must answer these from **`estateKnowledgeRegistry`** (not static arrays):

| Member question | Expected behavior |
|-----------------|-------------------|
| “What rooms do you have?” | Summarize by category/group; offer to narrow (“water, reading, calm, create…”) — **not 3 names** |
| “Show me all water places.” | List all places in `water` group with member-visible status; offer numbered choices (max 3 visible + “more”) |
| “Where can I read?” | `reading` group — library, nooks, stairway nook, etc. |
| “Take me somewhere peaceful.” | `calm` group query + emotional ranking |
| “Where is the Treehouse?” | Explain **Possibility House** tree; honest status if not walkable yet |
| “Do you have a butterfly conservatory?” | Yes — **`conservatory`**; describe; clarify relationship to Clear My Mind atmosphere if asked |
| “What can I do here?” | Current place from estate memory + linked features |
| “How do I use the decision map?” | Decision Compass feature record + offer to open |
| “What features do you have?” | Feature catalog grouped (Focus, Create, Momentum, Grow, Explore) |
| “Help me focus.” | Focus capabilities — not default coffee-house trio |
| “I want music.” | Music Room + Peaceful Places / Focus Audio — explain difference |
| “I need to create an SOP.” | Feature + place (`creative-studio`) + UC path — one canonical answer |

**Conversation rules (align Spec 108):** catalog answers are **invitations**, not navigation dumps; max **3 choices** per screen with progressive disclosure (“more water places”).

---

## 9. Safest implementation plan

**Do not random-fix wander arrays.** Phase by phase:

### Phase 1 — Read-only registry compile (low risk)

| Step | Work |
|------|------|
| 1.1 | Add `lib/estateKnowledgeRegistry/buildRegistry.ts` — compile 75 places from canonical + directory media |
| 1.2 | Add place groups + feature links tables |
| 1.3 | Dev panel: show registry vs brain vs wander diff |
| 1.4 | Tests: every canonical id appears; every group query returns expected ids |

### Phase 2 — Chat FAQ wired to registry (medium risk)

| Step | Work |
|------|------|
| 2.1 | Replace `roomsGuideBody()` slice(8) with `queryPlaces()` + group summaries |
| 2.2 | Wire `roomStoryBody()` to registry `description` when brain missing |
| 2.3 | Add `answerPlaceGroupQuery(water|reading|…)` handler before wander fallback |
| 2.4 | Butterfly / Treehouse / conservatory honest-status copy |

### Phase 3 — Retire hard-coded pools (medium-high risk)

| Step | Work |
|------|------|
| 3.1 | `pickWanderPlaceIds` → `queryPlaces({ liveOnly: true, limit: 3 })` |
| 3.2 | `pickExploratoryPlaceIds` → same |
| 3.3 | `matchVaguePlaceCluster` → group tags from registry |
| 3.4 | Feature flag `ESTATE_KNOWLEDGE_REGISTRY_ROUTING` |

### Phase 4 — Feature catalog parity (medium risk)

| Step | Work |
|------|------|
| 4.1 | Extend `APP_FEATURES` from registry feature table |
| 4.2 | Unify Sales Funnel route (Create vs playbook) in registry |
| 4.3 | Optional: sync guidebook spreads → registry `guidebookSpreadId` |

### Phase 5 — Status / mount alignment (product decision)

| Step | Work |
|------|------|
| 5.1 | Decide which `planned` places with assets become `partial` or `live` (Possibility House? Porch Swing? Conservatory?) |
| 5.2 | Fix `conservatory` backgroundImage mismatch in canonical record |
| 5.3 | Expand `ESTATE_MOUNT_REGISTRY` beyond 11 places |

---

## 10. Tests needed

| Test | Asserts |
|------|---------|
| `estateKnowledgeRegistry.build` | 75 places; every id has displayName, groups, routing flags |
| `queryPlaces({ group: "water" })` | Includes reflection-pond, seat-at-pond, summer-terrace, … |
| `queryPlaces({ group: "reading" })` | Includes library, reading-nook, stairway-reading-nook |
| `queryFeatures({ synonym: "decision map" })` | Returns Decision Compass with workspace route |
| `queryFeatures({ synonym: "sop" })` | Returns SOP builder + create route |
| `isLivePolicy` | Wander never returns `planned`/`future` when `liveOnly: true` |
| `estateGuide rooms topic` | Response mentions **>8** places or group summary |
| `matchCanonicalPlaceInText("butterfly conservatory")` | Resolves `conservatory` |
| `matchCanonicalPlaceInText("treehouse")` | Resolves Possibility House family |
| Regression CT | “what rooms” → not only coffee-house/library/observatory |
| Asset integrity | Every `memberVisible: true` place has resolvable background path |

---

## 11. Biggest gaps (priority order)

1. **No chat-facing catalog of 75 places** — only 8 names in FAQ.  
2. **Hard-coded 3-room lists** bypass registry (`estateWanderNavigation`, `estateMetaNavigation`, `estatePlaceClusters`).  
3. **Estate Brain covers 12/75 spaces** — treehouse, water, conservatory, observatory, greenhouse absent.  
4. **`planned` vs wander mismatch** — offers places navigation blocks (conservatory, porch-swing).  
5. **Butterfly Conservatory** — asset + aliases exist; status + brain + mount block honest answers.  
6. **Possibility House / Treehouse** — full asset set; all `planned`; Spark cannot guide members.  
7. **Feature catalog gaps** — Evidence Vault, Email Writer, Connections, Decision Compass, Sales Funnel route conflict.  
8. **Guidebook rich content not in chat** — duplicate editorial universe.  
9. **“Listening Rooms” / “Working Conference Room”** — not modeled; members get confused answers.  
10. **Two “live” definitions** — registry status vs `isLiveEstatePlace` vs wander unfiltered.

---

## 12. Key files (exact paths)

| Concern | Path |
|---------|------|
| Canonical places (75) | `lib/estate/canonicalEstatePlaces.ts`, `canonicalEstateSubplaces.ts`, `canonicalEstateRegistry.ts` |
| Live filter | `lib/estate/liveEstatePlace.ts` |
| Media / ambience | `lib/estate/estatePlaceMedia.ts`, `lib/estate/estateRoomAssets.ts` |
| Master directory | `lib/estate/directory/buildDirectory.ts` |
| Mount table (11) | `lib/estate/estateMountRegistry.ts` |
| **3-room wander** | `lib/estate/estateWanderNavigation.ts` |
| **3-room exploratory** | `lib/estate/estateMetaNavigation.ts` |
| **3-room clusters** | `lib/estate/estatePlaceClusters.ts` |
| Chat estate FAQ | `lib/sparkKnowledge/estateGuide.ts` |
| Estate Brain (12 spaces) | `lib/estateBrain/knowledgeRegistry.ts` |
| Capabilities / concierge | `lib/estateCapabilityRegistry/catalog.ts`, `estateConcierge.ts` |
| App features | `lib/appFeatureKnowledge.ts`, `appFeatureNavigation.ts` |
| Place resolution | `lib/estate/resolveEstatePlace.ts`, `estateRoutingRegistry.ts` |
| Pending menus | `lib/pendingChoice/resolve.ts`, `listContinuation.ts` |
| Clear My Mind conservatory bg | `lib/clearMyMind/conservatory.ts` |
| Guidebook (UI) | `data/estateGuideSpreads.ts` |
| Integration | `lib/meaningBeforeMatching/integrationIntent.ts` |
| Regression doc | `docs/CONVERSATION_REGRESSION_AUDIT.md` |

---

## 13. Recommendation

**Yes — build `estateKnowledgeRegistry` as a compile-time view over existing canonical data.** Do not add another ad-hoc room list.

The **75-place canonical registry is not the problem**. The problem is that **chat, wander menus, and Estate Brain never consume it wholesale**. Fixing individual FAQs or adding a fourth 3-room array will repeat this regression.

**Safest path:** Phase 1–2 (read-only compile + FAQ wiring) before retiring wander constants. **Product gate for Phase 5:** which `planned` places with assets (Conservatory, Possibility House, Porch Swing) should become member-visible — that decision belongs to you before status flips.

---

*End of audit. No code has been changed. Review and approve before implementation.*
