# Spark Estate Architectural Reset — V4 Foundation Pass

| Field | Value |
|-------|-------|
| **Version** | 1.0 — Foundation Pass |
| **Date** | 2026-06-30 |
| **Status** | **Review only — no code changes** |
| **Authority** | [Constitution](./01%20-%20Spark%20Estate%20Constitution.md) · [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) · [Spark Estate Bible](./Spark%20Estate%20Bible.md) · [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md) |

---

## Design test (binding on every correction)

> **Does this feel like software?**  
> If yes — keep simplifying until it feels like a beautiful place instead.

The Estate is always the hero. The relationship between Shari and the member comes before features. **Build places. Not software.**

---

## Executive summary

Spark Estate V4 has **strong canon documents** and a **growing room registry**, but the **member runtime** is still a companion application wearing estate photography:

- One **~5,500-line orchestrator** chooses among **six layout modes** and **fourteen routing paths**.
- **Four registries** describe the same places differently.
- **Three navigation systems** (sidebar, top bar, global menu) coexist with conversational routing.
- **Arrival is explained twice** (animated plaque + invitation grid) before conversation.
- **Chat is a bottom-right widget** on most rooms, not the centered presence Spec 109 describes.
- **Objects from the Bible** (Guidebook, Bell, Accomplishments Book, folded map) are implemented as **menus, FABs, and notification cards**.

**Drift severity:** The vision is documented; the shell is not yet a living world. Foundation Pass must **stop feature work** and **collapse duplicates** before any room is “finished.”

**Related audits:** [ARCHITECTURAL_RESET_GAP_REPORT.md](./ARCHITECTURAL_RESET_GAP_REPORT.md) · [NEW_MEMBER_IMMERSION_WALKTHROUGH.md](./NEW_MEMBER_IMMERSION_WALKTHROUGH.md)

---

## Priority legend

| Priority | Meaning |
|----------|---------|
| **P0** | Constitutional break — immersion fails immediately |
| **P1** | Core world coherence — must fix in Foundation Pass |
| **P2** | Localized drift — fix after P0–P1 collapse |
| **P3** | Hygiene, naming, assets |

---

## Conflict register

Each entry uses the required format.

---

### FP-001 — Monolithic orchestrator vs one living world

**CURRENT IMPLEMENTATION**  
`CompanionPageClient.tsx` (~5,546 lines) owns section state, chat, routing side-effects, workspace panels, estate overlays, grow/growth destinations, recognition, voice, menus, and dozens of `open*Core` / `handle*` functions. Boolean flags (`welcomeHomePrimary`, `showDirectEstateOverlay`, `workspacePanel`, `profileEstateChromeActive`, `momentumInstitutePrimary`, etc.) select which world shell renders.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Constitution: conversation travels; the Estate is one home. Bible Ch 7: places have kinds, not app modes. Members experience **mode switches** (welcome vs split vs immersive vs overlay), which feels like changing software, not walking between rooms.

**RECOMMENDED DIRECTION**  
Extract a thin **Estate Shell** — one conversation surface, one place resolver, optional destination layer per place kind. Page client becomes wiring only. No new features until shell exists.

**FILES INVOLVED**  
`app/companion/CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-002, FP-003, FP-004, FP-005, FP-010

**PRIORITY**  
P0

---

### FP-002 — Duplicate layout shells (six coexisting “rooms”)

**CURRENT IMPLEMENTATION**  
Parallel UI shells:

| Shell | Used when |
|-------|-----------|
| `WelcomeHomeFirstLaunch` / `WelcomeHomePage` | First-visit cinematic + portal |
| `WorkspaceLayout` | Home with workspace split (chat + panel) |
| `EstateChatNavigationOverlay` | Direct estate visit overlay |
| `EstateRoomVisitChrome` | Invitation + frosted chat inside overlay |
| Dedicated panels | `MomentumInstituteRoomPanel`, `StablesRoomPanel`, `MomentumBuilderRoomPanel` |
| `ProfileEstateRoomExperience` | Menu-opened profile “rooms” |

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Living in Spark Estate: members should not feel they are **navigating menus** or **managing windows**. Each shell has different chat geometry, chrome, and arrival rules — the world **changes shape** when you move.

**RECOMMENDED DIRECTION**  
One **frosted conversation layer** (Spec 109 geometry) on every place. Destination work mounts as Review-state primary surface — not alternate page layouts.

**FILES INVOLVED**  
`components/companion/WorkspaceLayout.tsx`, `WelcomeHomeFirstLaunch.tsx`, `estate/EstateChatNavigationOverlay.tsx`, `estate/EstateRoomVisitChrome.tsx`, `momentumInstitute/MomentumInstituteRoomPanel.tsx`, `stables/StablesRoomPanel.tsx`, `MomentumBuilderRoomPanel.tsx`, `ProfileEstateRoomExperience.tsx`

**DEPENDENCIES**  
FP-004, FP-005

**PRIORITY**  
P0

---

### FP-003 — Duplicate chat implementations (one primitive, many behaviors)

**CURRENT IMPLEMENTATION**  
Shared primitive: `WelcomeHomeFrostedChatPanel`. Wrapped by:

- `EstateRoomVisitChrome` — gates conversation behind invitation phase  
- `EstateRoomChatChrome` — always-on conversation + ambience toggle  
- `ProfileEstateRoomExperience` — claims “centered” chat; uses same panel classes  
- `WorkspaceLayout` — embeds chat as a **labeled pane** (“💬 Chat”)  
- Room-specific CSS: `estate-room-frosted-chat.css` (bottom anchor), `welcome-home-page__chat-panel`, `grow-room.css`, `momentum-builder-room.css`

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Conversation should be **primary and familiar** everywhere. Today: bottom-right widget on estate rooms, centered-ish on welcome home, hidden/unmounted in workspace-focus, different scroll and divider classes per shell. Member learns **UI patterns**, not **presence**.

**RECOMMENDED DIRECTION**  
Single chat component contract: position, typography minimums, input always visible, one scroll model. Delete per-room chat layout overrides except mobile safe-area.

**FILES INVOLVED**  
`WelcomeHomeFrostedChatPanel.tsx`, `EstateRoomVisitChrome.tsx`, `EstateRoomChatChrome.tsx`, `app/companion/estate-room-frosted-chat.css`, `app/companion/estate-room-fullbleed.css`, `WorkspaceLayout.tsx`

**DEPENDENCIES**  
FP-002, FP-004

**PRIORITY**  
P0

---

### FP-004 — Chat placement: bottom-right anchor

**CURRENT IMPLEMENTATION**  
`estate-room-frosted-chat.css` fixes panel `bottom-right`, `width: min(36rem, 44vw)`, grows upward. Scene is full-bleed; chat reads as **overlay widget**.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Spec 109 / Bible intent: **one centered frosted panel**; room visible at edges. Bottom strip mimics Intercom/support chat — conversation ancillary to scenery. Constitution: conversation belongs to the member and should feel **primary**.

**RECOMMENDED DIRECTION**  
Center frosted panel on desktop for all estate places; bottom anchor only if required for mobile thumb reach (document exception).

**FILES INVOLVED**  
`app/companion/estate-room-frosted-chat.css`, `estate-room-fullbleed.css`, `lib/workspaceLayoutTokens.ts`

**DEPENDENCIES**  
FP-003

**PRIORITY**  
P1

---

### FP-005 — Split workspace (chat as a pane)

**CURRENT IMPLEMENTATION**  
`WorkspaceLayout`: desktop ~40/60 chat/workspace; mobile **Chat | Work** tabs; headers “💬 Chat” / “🛠 Create”; **Work With Shari** toggle; view size presets.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Not a dashboard (Spec 109). Member operates **two applications** side by side. Shari becomes a **pane you switch to**, not someone in the room. Violates “conversation first, workspace third” (Spec 105).

**RECOMMENDED DIRECTION**  
Conversation-full default. Draft/review: workspace primary, chat soft — single surface state machine, not persistent split.

**FILES INVOLVED**  
`WorkspaceLayout.tsx`, `lib/workspaceNav.ts`, `lib/workspaceViewSize.ts`, `CompanionPageClient.tsx` (`focusWorkspaceLayout`, `chatLayoutMode`)

**DEPENDENCIES**  
FP-001, FP-004

**PRIORITY**  
P1

---

### FP-006 — Triple navigation (sidebar + top bar + global menu)

**CURRENT IMPLEMENTATION**  
- `AppSidebar` + homestead signpost + **Connected Apps** (Google Calendar, Gmail, Drive)  
- `TopBar`: Clear My Mind, Plan My Day (badge), Today's Reality  
- `GlobalEstateMenu`: 15+ emoji actions across Personal / Conversation / Settings  
- `BackButton` labeled **Home** / **Chat** on many sections  
- `ActiveWorkspaceBar`: **ACTIVE** workspace chips  

Hidden on `welcomeHomePrimary` only — returns when member leaves home.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Living in Spark Estate: *members never feel they are navigating menus*. Bible Ch 8: objects, not chrome. Constitution: Spark accompanies — never sends via toolbar.

**RECOMMENDED DIRECTION**  
Member-facing estate: **conversation + folded map + in-world objects**. Retire sidebar/topbar/global menu from default shell (founder/dev behind flag if needed).

**FILES INVOLVED**  
`AppSidebar.tsx`, `TopBar.tsx`, `GlobalEstateMenu.tsx`, `lib/estateMenu/menuConfig.ts`, `ActiveWorkspaceBar.tsx`, `lib/navigationBack.ts`, `CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-007, FP-008, FP-009

**PRIORITY**  
P0

---

### FP-007 — Estate map is sidebar reveal, not folded map

**CURRENT IMPLEMENTATION**  
`revealWelcomeHomeEstateMap()` sets `welcomeHomeEstateMapVisible` → CSS class `companion-welcome-home-show-estate-nav`. Shari says: *"The homestead signposts are on the left — wander as long as you like."* Guidebook on Welcome Home also calls `revealWelcomeHomeEstateMap()`. Invitation catalog uses **Explore the Estate** / **Go Somewhere Else** → same reveal.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible / Spec 108: **folded map** — pauses conversation, does not destroy it; not a permanent nav rail. Current behavior exposes **software sidebar signposts**, contradicting map metaphor and “places not features.”

**RECOMMENDED DIRECTION**  
Implement map as **in-world object** (folded paper, bottom-right or desk) — overlay places, optional, conversation continues underneath. Remove coupling to left sidebar.

**FILES INVOLVED**  
`CompanionPageClient.tsx` (`revealWelcomeHomeEstateMap`, `welcomeHomeEstateMapVisible`), `lib/estate/estateRoomInvitationCatalog.ts`, `SparkEstateGuideAnchor.tsx`, welcome-home CSS (class `companion-welcome-home-show-estate-nav`)

**DEPENDENCIES**  
FP-006, FP-008

**PRIORITY**  
P1

---

### FP-008 — Guidebook as global FAB

**CURRENT IMPLEMENTATION**  
`SparkEstateGuideAnchor` — fixed bottom-right button on every screen (`spark-estate-guide-cover.png`). Welcome Home: opens map reveal. Elsewhere: `openStandaloneFocusSectionCore("how-do-i")`.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible Ch 13: Guidebook is an **estate object** with story — discovered in the world, not omnipresent help chrome. Living in Spark Estate: objects have stories, not session UI.

**RECOMMENDED DIRECTION**  
Physical book in Welcome Home / Library; conversation opens pages. Remove global fixed anchor.

**FILES INVOLVED**  
`SparkEstateGuideAnchor.tsx`, `lib/estate/sparkEstateGuide.ts`, `CompanionPageClient.tsx` (`openSparkEstateGuideCore`)

**DEPENDENCIES**  
FP-006, FP-007

**PRIORITY**  
P1

---

### FP-009 — Global menu as feature catalog

**CURRENT IMPLEMENTATION**  
`ESTATE_MENU_ITEMS`: Estate Profile™, Growth Profile™, Institute Cabinet™, Evidence Vault™, Journal™, Portfolio™, Seeds Planted™, Goals & Projects™, Progress Timeline™, Start New Conversation, Start New Day Conversation, Settings, Notifications, Voice Settings, Log Out — emoji + hints like *"Capabilities and learning progress — updated quietly."*

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Experience Guide: estate must not overwhelm with buttons and menus. Settings/account/export/session controls are **SaaS**, not country estate.

**RECOMMENDED DIRECTION**  
Replace with in-world access paths; keep only essential account exit behind quiet object. Conversation drives navigation (Spec 113).

**FILES INVOLVED**  
`lib/estateMenu/menuConfig.ts`, `GlobalEstateMenu.tsx`, `CompanionPageClient.tsx` (`handleEstateMenuAction`)

**DEPENDENCIES**  
FP-006, FP-022, FP-023

**PRIORITY**  
P1

---

### FP-010 — Fourteen routing paths (no `goToPlace`)

**CURRENT IMPLEMENTATION**  
Place changes via overlapping systems:

| Layer | Role |
|-------|------|
| `estateCommandRouter` | NL commands, offer labels |
| `estateRouter` / `estateMatcher` | Intelligence evaluation |
| `estateDirectRoomResolve` | Direct room text |
| `estateRoomRouting` | Feeling vs explicit rules |
| `estateRoomAliasRegistry` | Phrase → room id |
| `frictionlessActionLayer` | Workspace offers |
| `intentRoutingIntelligence` | Section intents |
| `acceptWorkspaceOffer` | Offer acceptance in page client |
| `open*Core` family | Section mutations (20+ functions) |
| `CompanionUrlNavigation` | URL → section |
| `handleNavSelect` / `SECTION_NAV` | Sidebar |
| `directEstateVisit` state | Overlay gating |
| `estateChatNavigation` | Pending transition |
| `estatePendingTransition` | Memory persistence |

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Constitution: conversation travels naturally; only member ends conversation. Inconsistent paths → some jumps show plaques, some open splits, some set overlays — **the world behaves unpredictably**.

**RECOMMENDED DIRECTION**  
Single pipeline: `utterance → resolve place (registry) → ambient transition → preserve thread`. One mutation: `goToPlace(placeId, { preserveThread })`. Deprecate section-first routing for members.

**FILES INVOLVED**  
`lib/estateIntelligence/estateCommandRouter.ts`, `estateRouter.ts`, `estateMatcher.ts`, `lib/estate/estateDirectRoomResolve.ts`, `estateRoomRouting.ts`, `estateRoomAliasRegistry.ts`, `lib/frictionlessActionLayer.ts`, `lib/intentRoutingIntelligence.ts`, `lib/estateMemory/estatePendingTransition.ts`, `lib/estate/estateChatNavigation.ts`, `lib/estate/directEstateVisit.ts`, `CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-011, FP-012

**PRIORITY**  
P0

---

### FP-011 — Duplicate registries (four truths)

**CURRENT IMPLEMENTATION**  

| Registry | Location | Contents |
|----------|----------|----------|
| **Estate Room Registry** | `estateRoomRegistry.ts` | 27 places, routes, backgrounds, roomType |
| **Estate Intelligence Registry** | `estateRegistry.ts` + registrations | Entries with `primarySection`, status live/planned |
| **Section map** | `estateSectionMap.ts` | `AppSection` ↔ entry id + overrides |
| **Alias registry** | `estateRoomAliasRegistry.ts` | Conversational phrases |
| **Invitation catalog** | `estateRoomInvitationCatalog.ts` | Per-room emoji actions |
| **Arrival config** | `estateArrivalExperience.ts` | Title, motto, greeting per room |
| **Room template** | `estateRoomTemplate/catalog.ts` | Hero, welcome, empty copy |

Phase 1 fixed library/institute collision in intelligence registry; **section map and invitation catalog can still disagree** with room registry.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible: one canon of places. Multiple registries caused library→institute bug; more drift is inevitable. Developers edit the wrong file; members get **wrong room or name**.

**RECOMMENDED DIRECTION**  
`estateRoomRegistry.ts` as **single source**; generate intelligence entries, section map, aliases, and arrival copy from it — or strict CI test that all maps are bijections.

**FILES INVOLVED**  
`lib/estate/estateRoomRegistry.ts`, `lib/estateIntelligence/estateRegistry.ts`, `lib/estateIntelligence/registrations/*`, `lib/estateMemory/estateSectionMap.ts`, `lib/estate/estateRoomAliasRegistry.ts`, `lib/estate/estateRoomInvitationCatalog.ts`, `lib/estate/estateArrivalExperience.ts`, `lib/estate/estateRoomTemplate/catalog.ts`

**DEPENDENCIES**  
FP-010

**PRIORITY**  
P0

---

### FP-012 — AppSection vocabulary vs estate places

**CURRENT IMPLEMENTATION**  
Internal ids exposed to logic and some UI: `brain-dump`, `focus-audio`, `grow-spark-cards`, `evidence-bank`, `content-generator`, `how-do-i`. `SECTION_NAV` maps sidebar ids to sections. Member-facing menu uses ™ labels but routes hit **legacy section names**.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible Ch 9: controlled estate vocabulary — **Conservatory**, not brain-dump module. Feature-first section ids encode **old product architecture**, not the living world.

**RECOMMENDED DIRECTION**  
`AppSection` internal only, never visible. All member copy from Bible glossary via registry `name` / `trademark`.

**FILES INVOLVED**  
`lib/companionUi.ts`, `estateSectionMap.ts`, `menuConfig.ts`, `growNavigation.ts`, `growthNavigation.ts`

**DEPENDENCIES**  
FP-011

**PRIORITY**  
P2

---

### FP-013 — Room transitions: title/motto plaque

**CURRENT IMPLEMENTATION**  
`EstateArrivalHost` → `EstateArrivalOverlay`: animated veil, **room title + motto** hold ~2s, fade. Config per room in `estateArrivalExperience.ts` (e.g. Institute: *"Developing Better Entrepreneurs."*).

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Constitution **Article VIII**: *The Estate Never Explains Itself.* Living in Spark Estate: members remember **feelings**, not opening credits. Placard = museum / video game chapter card.

**RECOMMENDED DIRECTION**  
Ambient cross-fade + optional sound only. No on-screen title/motto for Living Places; minimal for Destinations if ever — never both plaque **and** invitation grid.

**FILES INVOLVED**  
`EstateArrivalHost.tsx`, `EstateArrivalOverlay.tsx`, `lib/estate/estateArrivalExperience.ts`, `lib/estate/estateArrivalSession.ts`

**DEPENDENCIES**  
FP-014

**PRIORITY**  
P0

---

### FP-014 — Room transitions: invitation grids (Arrival Before Activity)

**CURRENT IMPLEMENTATION**  
`EstateRoomVisitChrome` → `EstateRoomTemplateArrival` (hero title, subtitle, purpose, Shari paragraphs) + `EstateRoomInvitationPanel`:

- Lead: **While you're here…**  
- Preamble: **You might enjoy…**  
- Emoji buttons: features (Plan My Day, Clear My Mind™, Journal, etc.)  
- Universal: **Just Chat**, **Visit Another Room**, **I'm Happy Just Being Here**

`useEstateRoomVisitPhase` blocks conversation until invitation cleared.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Authority doc retires `ESTATE_ROOM_TEMPLATE` invitation pattern. Bible Ch 7 Living Places: **conversation, no dedicated features** on arrival. Grid = **app launcher** on wallpaper.

**RECOMMENDED DIRECTION**  
Living Places: scene + input only. Destinations: one Shari line in chat, then conversation; activities via **objects**, not emoji menus.

**FILES INVOLVED**  
`EstateRoomVisitChrome.tsx`, `EstateRoomInvitationPanel.tsx`, `EstateRoomTemplateArrival.tsx`, `useEstateRoomVisitPhase.ts`, `estateRoomInvitationCatalog.ts`, `estateRoomTemplate/catalog.ts`

**DEPENDENCIES**  
FP-002, FP-015

**PRIORITY**  
P0

---

### FP-015 — Living / Destination / Transitional kinds not enforced

**CURRENT IMPLEMENTATION**  
`estateRoomRegistry` has `roomType` (welcome, reflection, learning…) but visit chrome treats **almost all rooms identically** (invitation + overlay). Bible Ch 7 taxonomy (**Living / Destination / Transitional**) not a runtime branch.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Greenhouse and Institute get the same arrival grammar — living places feel like **modules**. Transitional halls should not be full stops with menus.

**RECOMMENDED DIRECTION**  
Add `placeKind` to registry; single branch in visit resolver. Living = chat only; Destination = object/workflow; Transitional = ambient pass-through.

**FILES INVOLVED**  
`lib/estate/estateRoomRegistry.ts`, `lib/estate/types.ts`, `EstateRoomVisitChrome.tsx`, dedicated room panels

**DEPENDENCIES**  
FP-014

**PRIORITY**  
P1

---

### FP-016 — Conversation flow: software routing copy

**CURRENT IMPLEMENTATION**  
Offers and router labels: **Step into Clear My Mind™**, **Step into The Conservatory™**, **Explore the Momentum Institute™**, **Open Client Avatar**. `estateOffer.ts`, `estateCommandRouter.ts`, `frictionlessActionLayer.ts`, `intentRoutingIntelligence.ts`.

Map reveal copy references **homestead signposts on the left**.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Spec 108 forbidden: *Opening…*, *Navigate to…*, *Choose a room.* Relationship Constitution: never send member to features. Sounds like **theme park directions**, not accompaniment.

**RECOMMENDED DIRECTION**  
Invitation pattern: accompany language + **Yes · Stay here · Show the map** (max 3). Centralize estate voice module; ban “Step into” in member strings.

**FILES INVOLVED**  
`lib/estateIntelligence/estateOffer.ts`, `estateCommandRouter.ts`, `estateRouter.ts`, `frictionlessActionLayer.ts`, `intentRoutingIntelligence.ts`, `CompanionPageClient.tsx` (`revealWelcomeHomeEstateMap`)

**DEPENDENCIES**  
FP-010

**PRIORITY**  
P0

---

### FP-017 — Conversation flow: inline cards and offers

**CURRENT IMPLEMENTATION**  
Chat thread includes workspace offers, pending actions, `RecognitionMomentCard` (uppercase milestone title, dismiss ×), intervention cards when not suppressed. `HomeChatInputFooter` wires offer execution.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Spec 109: one clear next step — not competing cards. Celebration/notifications as **chat widgets** = software alerts in the relationship space.

**RECOMMENDED DIRECTION**  
Offers as Shari prose with numbered choices; recognition via conversation + place/bell/book — not card chrome.

**FILES INVOLVED**  
`RecognitionMomentCard.tsx`, `lib/recognition/*`, `CompanionPageClient.tsx`, chat footer components

**DEPENDENCIES**  
FP-024, FP-016

**PRIORITY**  
P2

---

### FP-018 — Onboarding: cinematic first visit

**CURRENT IMPLEMENTATION**  
`WelcomeHomeFirstLaunch`: phases `intro → pause → chat`; cinematic dolly; voice; **Stop** button; timed chat reveal; optional dev panel. `completeWelcomeHomeFirstLaunch` can auto-send *"Introduce me to something wonderful."*

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Experience Guide: arrival = **coming home**, not product tour. Constitution Art VIII: estate does not explain or perform for you. Member waits for app permission to speak.

**RECOMMENDED DIRECTION**  
First visit = already in room; one Shari greeting; no multi-phase cinematic. Respect `prefers-reduced-motion` as default path.

**FILES INVOLVED**  
`WelcomeHomeFirstLaunch.tsx`, `lib/welcomeHome/*`, `lib/welcomeRoom/*`, `CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-025

**PRIORITY**  
P1

---

### FP-019 — Login threshold still product-branded

**CURRENT IMPLEMENTATION**  
`CompanionSignInExperience`: **Spark Studio Companions**, **ADHD Business Ecosystem™**, auth form, **Opening your space…** redirect.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Before any place exists, member meets **platform branding** and loading language — not a threshold into a home.

**RECOMMENDED DIRECTION**  
Warm threshold copy; estate-first naming; avoid ecosystem/product trademarks at door. Loading → ambient transition, not “opening space.”

**FILES INVOLVED**  
`CompanionSignInExperience.tsx`, `CompanionSignInForm.tsx`, `lib/companionLoginPage.ts`

**DEPENDENCIES**  
None (can parallel track)

**PRIORITY**  
P2

---

### FP-020 — Grow hub and placeholder “rooms”

**CURRENT IMPLEMENTATION**  
`GrowPlaceholderPanel`: kicker **Grow**, marketing leads, *"This room is taking shape. The architecture is in place — guided experiences will arrive here soon."* Sidebar signpost routes to grow sections.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible: do not show unfinished destinations as broken rooms. **Architecture is in place** is developer copy. Violates “build places, not features.”

**RECOMMENDED DIRECTION**  
Remove placeholders from member routes; conversational honesty without empty panels.

**FILES INVOLVED**  
`GrowPlaceholderPanel.tsx`, `lib/growNavigation.ts`, `AppSidebar.tsx`, `CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-006

**PRIORITY**  
P0

---

### FP-021 — Momentum Institute: LMS-shaped destination

**CURRENT IMPLEMENTATION**  
`MomentumInstituteRoomPanel`: `InstituteDrawerWall`, drawer counts, `InstituteKnowledgeCardPanel`, **Discuss** / **Make it mine**, cabinet store, phase catalog bootstrap. Greeting: *"What would you like to do while we're here?"*

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible Ch 12–14: Institute = **discovery**; lessons = **conversations** — not school. Drawer index + card panels = courseware UI.

**RECOMMENDED DIRECTION**  
Physical room metaphor only; conversation-first entry; cards as objects picked up, not panels. Align with Destination kind (FP-015).

**FILES INVOLVED**  
`components/companion/momentumInstitute/*`, `lib/momentumInstitute/*`, `lib/estateIntelligence/registrations/knowledge.ts`

**DEPENDENCIES**  
FP-014, FP-015, FP-026

**PRIORITY**  
P1

---

### FP-022 — Evidence Vault dual identity

**CURRENT IMPLEMENTATION**  
Menu: **Evidence Vault™**. Routes: `evidence-bank` section + `evidence-vault` room id. `EvidenceBankPanel`: CRUD forms, categories, **Expand**, print/download, archive periods. Growth panel back stack.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible: Destination for **proof on hard days** — quiet, not spreadsheet. Dual naming leaks implementation. Form-first = software.

**RECOMMENDED DIRECTION**  
One canonical `evidence-vault` place; conversation-led capture; forms behind permission; retire `evidence-bank` member label.

**FILES INVOLVED**  
`EvidenceBankPanel.tsx`, `lib/evidenceBankStore.ts`, `estateSectionMap.ts`, `menuConfig.ts`, `estateRoomAssets.ts`, `CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-011, FP-009

**PRIORITY**  
P2

---

### FP-023 — Profile / settings as menu destinations

**CURRENT IMPLEMENTATION**  
`ProfileEstateRoomExperience` for Estate Profile™, Growth Profile™ — opened from global menu. Settings, Notifications, Voice, Log Out in same menu. Copy: *account and companion preferences*, *capabilities and learning progress*.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Profile/settings are **account admin**, not walking to a room. Growth Profile / Progress Timeline = analytics dashboard vocabulary.

**RECOMMENDED DIRECTION**  
Preferences via conversational Memory Center pattern; physical desk/mirror object if needed; demote notifications/voice to system layer.

**FILES INVOLVED**  
`ProfileEstateRoomExperience.tsx`, `lib/growth/profileEstateRooms.ts`, `menuConfig.ts`, `GlobalEstateMenu.tsx`

**DEPENDENCIES**  
FP-009

**PRIORITY**  
P2

---

### FP-024 — Celebration: notification card, not ritual

**CURRENT IMPLEMENTATION**  
`evaluateRecognitionMoment` → `RecognitionMomentCard` in chat (uppercase title, dismiss). `celebrationGarden` background exists; no bell, no Accomplishments Book volume. Builder room has separate `celebrationKind`.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible Ch 16–17: celebration = **place + sometimes bell**; accomplishments = **stories in books** — not toast notifications.

**RECOMMENDED DIRECTION**  
Shari acknowledges in conversation; optional visit to celebration place or bell — member permission. Remove achievement card UI.

**FILES INVOLVED**  
`RecognitionMomentCard.tsx`, `lib/recognition/*`, `lib/celebrationGarden/*`, `CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-017

**PRIORITY**  
P1

---

### FP-025 — Background / image architecture drift

**CURRENT IMPLEMENTATION**  

- **27** registry rooms; **~16** files in `public/backgrounds/`  
- `welcome-home-background.png` referenced — **missing on disk**  
- Typos: `sunroom-background,.png`; spaces in filenames  
- Wrong cross-wiring: `conservatory`/`clear-my-mind` share butterfly asset; `gardens` uses celebration garden; registry `greenhouse` fallback to celebration legacy  
- Separate: `ESTATE_IMAGE_BIBLE.md` + `estateImageStandards.ts` (generation rules) vs runtime `estateRoomAssets.ts` (paths) — not unified manifest  
- `momentumBuilder` uses separate `roomRegistry` BG constant  

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Experience Guide: believable **one property**. Wrong/missing plates break immersion instantly — member sees broken or mismatched world. Image Bible demands consistency; runtime uses legacy fallbacks.

**RECOMMENDED DIRECTION**  
1:1 manifest: room id → approved plate path; CI fails on missing active room assets; remove cross-room fallbacks; align filenames; single `resolveBackground(roomId)` only.

**FILES INVOLVED**  
`lib/estate/estateRoomAssets.ts`, `estateRoomRegistry.ts`, `estateRoomBackground.ts`, `public/backgrounds/*`, `docs/estate/ESTATE_IMAGE_BIBLE.md`, `lib/estate/estateImageStandards.ts`, `lib/momentumBuilderRoom/roomRegistry.ts`

**DEPENDENCIES**  
FP-011

**PRIORITY**  
P1

---

### FP-026 — Collections fragmented (Institute vs Seeds vs Library)

**CURRENT IMPLEMENTATION**  
Multiple “collection” concepts:

- Institute: `strategy_collection`, drawer **Curated collection**, Knowledge Cards  
- Menu: **Seeds Planted™** → `grow-spark-cards`  
- `planned.ts` registry entries `category: "collection"`  
- My Thoughts / Companion Boxes (separate product vocabulary) not unified with Bible Library volumes  

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Bible: Library volumes, Seeds, Institute discovery — related but distinct **objects**. Today: overlapping names and routes (cards vs seeds vs drawers) feel like **disconnected features**, not one estate library system.

**RECOMMENDED DIRECTION**  
Map collections to Bible objects (Library volume, Seeds object, Institute drawers); one member vocabulary; no Grow-hub indirection for Seeds.

**FILES INVOLVED**  
`lib/momentumInstitute/*`, `lib/estateIntelligence/registrations/planned.ts`, `menuConfig.ts`, `growNavigation.ts`, `lib/sparkMomentumInstitute/types.ts`

**DEPENDENCIES**  
FP-011, FP-021, FP-020

**PRIORITY**  
P2

---

### FP-027 — Duplicate room logic (overlay vs dedicated panel)

**CURRENT IMPLEMENTATION**  
Parallel predicates:

- `isDedicatedEstateRoomPanelSection`  
- `shouldShowDirectEstateVisitOverlay` / `shouldShowDirectEstateOverlay`  
- `isEstateImmersiveRoom` / `isStandaloneEstateRoomSection`  
- `estateSectionUsesChatNavigationOverlay` (deprecated list)  

Same room can be reached via overlay, dedicated panel, or growth section depending on entry path.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Member says “take me to the stables” — experience differs if from chat vs menu vs grow. **Same place, different app behavior** — breaks believable world.

**RECOMMENDED DIRECTION**  
One `resolvePlaceExperience(roomId)` → layout kind. Entry path must not change room grammar.

**FILES INVOLVED**  
`lib/estate/directEstateVisit.ts`, `estateChatNavigation.ts`, `lib/estateImmersiveLayout.ts`, `CompanionPageClient.tsx`

**DEPENDENCIES**  
FP-010, FP-002

**PRIORITY**  
P1

---

### FP-028 — Subordinate docs still driving runtime

**CURRENT IMPLEMENTATION**  
`ESTATE_ROOM_TEMPLATE.md`, `ESTATE_E2E_WIRING.md`, `ESTATE_EXPERIENCE_MASTER_PLAN.md` marked subordinate in authority doc — but `estateRoomTemplate/catalog.ts` still powers `EstateRoomTemplateArrival` in production.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Implementation follows **retired patterns** (hero plaques, invitation panels) contradicting Constitution Art VIII and authority manifest.

**RECOMMENDED DIRECTION**  
Stop runtime imports from template catalog for member UI; Bible room pages become copy source when needed.

**FILES INVOLVED**  
`lib/estate/estateRoomTemplate/*`, `EstateRoomTemplateArrival.tsx`, `docs/ESTATE_ROOM_TEMPLATE.md`

**DEPENDENCIES**  
FP-014

**PRIORITY**  
P2

---

### FP-029 — UI behavior: ACTIVE workspace bar and badges

**CURRENT IMPLEMENTATION**  
`ActiveWorkspaceBar` — **ACTIVE** label, workspace chips, pause/resume. `TopBar` Plan My Day **badge count**.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Task manager / notification semantics. Homes do not badge your kitchen or list “active workspaces.”

**RECOMMENDED DIRECTION**  
Remove from member estate shell; session state invisible unless member asks.

**FILES INVOLVED**  
`ActiveWorkspaceBar.tsx`, `TopBar.tsx`, `lib/planMyDay.ts`

**DEPENDENCIES**  
FP-006

**PRIORITY**  
P2

---

### FP-030 — Connected Apps in sidebar

**CURRENT IMPLEMENTATION**  
`AppSidebar` footer: **Connected Apps** — Google Calendar, Gmail, Google Drive external links.

**WHY IT BREAKS THE ESTATE EXPERIENCE**  
Integration marketplace embedded in “homestead.” Breaks world boundary — estate becomes **portal to other apps**.

**RECOMMENDED DIRECTION**  
Remove from member sidebar; if ever needed, conversational or founder-only.

**FILES INVOLVED**  
`AppSidebar.tsx`

**DEPENDENCIES**  
FP-006

**PRIORITY**  
P3

---

## Area coverage matrix

| Area | Primary conflicts |
|------|-------------------|
| Conversation flow | FP-016, FP-017, FP-014 |
| Navigation | FP-006, FP-007, FP-009 |
| Room transitions | FP-013, FP-014 |
| Routing | FP-010, FP-027 |
| Chat placement | FP-003, FP-004 |
| UI behavior | FP-002, FP-005, FP-029 |
| Prompts | FP-016, FP-014 (invitation copy) |
| Menus | FP-006, FP-009 |
| Room vocabulary | FP-012, FP-011 |
| Background usage | FP-025 |
| Duplicate systems | FP-001, FP-002, FP-006 |
| Duplicate routing | FP-010 |
| Duplicate registries | FP-011 |
| Duplicate chat | FP-003 |
| Duplicate room logic | FP-027 |
| Onboarding | FP-018, FP-019 |
| Profile/settings | FP-023, FP-009 |
| Estate map | FP-007 |
| Guidebook | FP-008 |
| Momentum Institute | FP-021, FP-026 |
| Celebration | FP-024 |
| Evidence vault | FP-022 |
| Collections | FP-026 |
| Image architecture | FP-025 |

---

## What aligns (preserve, do not discard)

| Asset | Why keep |
|-------|----------|
| Three authority documents + `ESTATE_ARCHITECTURAL_AUTHORITY.md` | Clear law for Foundation Pass |
| `estateRoomRegistry.ts` concept | Right abstraction — needs to become sole truth |
| Phase 1 library / institute split | Correct collision fix |
| Full-bleed `EstateRoomFullBleedBackground` | Right visual direction |
| `estateRoomAliasRegistry` | Supports conversational place names |
| Welcome Home hiding sidebar/topbar | Partial sanctuary — extend estate-wide |
| `ESTATE_IMAGE_BIBLE.md` | Canon for visual consistency — wire to runtime manifest |
| Observation Mode / frozen conversation specs | Prevents feature sprawl during reset |

---

## Foundation Pass sequence (no features)

```text
1. FREEZE features — charter in ARCHITECTURAL_RESTORATION.md
2. REGISTRY — single source (FP-011); CI bijection tests
3. ROUTING — one goToPlace pipeline (FP-010); delete parallel paths
4. SHELL — one chat + one layout (FP-001–003, FP-004)
5. NAV — remove member chrome (FP-006–009); real map + guide objects
6. ARRIVAL — remove plaques + grids for Living Places (FP-013–015)
7. VOICE — ban software routing copy (FP-016)
8. ASSETS — background manifest (FP-025)
9. DESTINATIONS — reshape Institute, Evidence, celebration (FP-021–024) — presentation only
10. RE-AUDIT — new member walkthrough test
```

---

## Document control

| Item | Action |
|------|--------|
| Implementation | **Blocked** until founder approves Foundation Pass order |
| Code changes | **None** in this pass |
| Next artifact | Per-conflict work tickets derived from FP-001…FP-030 |

**Spark Estate Design Test:** If the correction still feels like software — simplify again.
