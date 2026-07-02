# Spark Estate™ — Cleanup Roadmap

| Field | Value |
|-------|-------|
| **Title** | Estate Cleanup Roadmap |
| **Version** | 1.0 |
| **Status** | Active — simplification only |
| **Source** | Migration audit (vs3 baseline vs V4) · consolidation analysis · live bug reports |
| **Governs under** | [ESTATE_ARCHITECTURAL_AUTHORITY](./estate/ESTATE_ARCHITECTURAL_AUTHORITY.md) — Constitution · Experience Guide · Bible |
| **Rule** | Authorities define Estate; this roadmap **aligns code** to them. **No new features.**

---

## Why this exists

V4 is **not** a clean migration of the tested vs3 shell. The audit found:

| Signal | Finding |
|--------|---------|
| **Orchestrator** | `CompanionPageClient.tsx` ~18k lines; ~100 `activeSection` branches |
| **Routing** | 4+ parallel paths: `estateCommandRouter` · `intentRoutingIntelligence` · `v3BehaviorRecovery` · `acceptWorkspaceOfferCore` · `companionRoutingExecutor` · governor `workspace_open` |
| **Registries** | `estateRoomRegistry` · `estateIntelligence/registrations/*` · `estateSectionMap` · `estateRoomAliasRegistry` · `momentumInstitute/room/*` — vocabulary collisions |
| **Chat UI** | Split `WorkspaceLayout` **and** `EstateChatNavigationOverlay` + `WelcomeHomeFrostedChatPanel` |
| **Place confusion** | `LIBRARY_ENTRY` id `library` but name **Momentum Institute™**; `momentum-institute` section maps to `library` entry in `estateSectionMap` |
| **Assets** | 16 files in `public/backgrounds/`; 30+ paths referenced in `estateRoomAssets.ts` — many missing or typo’d |
| **Stubs** | `GrowPlaceholderPanel` on 5+ grow sections; partial room UX masked as “live” |
| **Tests vs runtime** | `estateCommandRouter.test.ts` proves detection/copy, not full `handleSend` → navigation chain |

**Goal:** fewer files, one registry, one router, one chat shell, one vocabulary, one background map — **before** any new Institute content, menus, or intelligence.

---

## Phase gate (non-negotiable)

```
Phase 1 complete → start Phase 2
Phase 2 complete → start Phase 3
…
```

**During a phase:**

- ✅ Delete, merge, redirect, fix bugs caused by consolidation  
- ✅ Update tests to match simplified behavior  
- ❌ New rooms, lessons, menus, panels, intelligence engines, or specs  
- ❌ “While we’re here” feature work  

**Phase complete when:** exit criteria are met **and** manual smoke paths for that phase pass (listed per phase).

---

## Complexity budget (target)

| Metric | Audit (now) | After Phase 5 |
|--------|-------------|---------------|
| Authoritative room registries | 3+ | **1** (`estateRoomRegistry` + thin intelligence adapter) |
| Chat layout systems in estate visits | 2 | **1** (overlay + float) |
| Navigation executors for named places | 4+ | **1** (`goToPlace(roomId)`) |
| Section ↔ room maps | 2 conflicting | **1** derived from registry |
| Default arrival UI | Panels + placeholders + offers | **Scene + float** only |

---

# Phase 1 — Architecture cleanup

**Purpose:** Collapse duplicate sources of truth and shrink the orchestrator so later phases have a single spine to wire.

## 1.1 Registry consolidation

| Survivor | Role |
|----------|------|
| `lib/estate/estateRoomRegistry.ts` | **Only** place definitions: id, category, section(s), background, phrases, status |
| `lib/estate/estateRoomAliasRegistry.ts` | Phrase → `roomId` (keep; merge duplicates from matcher keywords) |

| Merge or retire | Reason |
|-----------------|--------|
| `estateIntelligence/registrations/*.ts` keyword duplicates | Derive matcher signals from room registry |
| `lib/estateMemory/estateSectionMap.ts` hard-coded collisions | Generate from registry; **split `library` vs `momentum-institute`** |
| `LIBRARY_ENTRY` in `knowledge.ts` | Today: id `library`, name Institute, section `momentum-institute` — **root cause of wrong room** |
| `momentumInstitute/room/instituteRoomRegistry.ts` | Institute **content** catalog only — not navigation |
| `estateRoomInvitationCatalog.ts` + dynamic invitations | Conflicts with [Estate UI Philosophy](./SPARK_ESTATE_UI_PHILOSOPHY.md) — retire or gate to Destinations only |
| Orphan / unwired | `estateMap/estateMapLocations` (if present), unused `ProfilePanel` paths, duplicate homestead ids in registry comments |

**Deliverable:** `docs/ESTATE_ROOM_REGISTRY.md` matches runtime; one `roomId` → one trademark → one primary section.

## 1.2 Orchestrator decomposition (no new behavior)

Extract from `CompanionPageClient.tsx` **without** changing UX yet:

| Extract | Target |
|---------|--------|
| Estate visit state | `useEstateVisit` or `estateVisitController.ts` |
| Section render switch | `resolveEstateView(roomId \| section)` — thin mapper |
| Send / routing tail | `estateNavigationFromChat.ts` — single entry called by `handleSend` |

**Rule:** extraction only; no new branches.

## 1.3 Delete or quarantine dead code

- Unused imports / panels never mounted  
- Duplicate background helpers (`estateRoomBackground` vs `estateRoomAssets` — one module)  
- Comment-only registries and `NEEDS_ASSET` rooms with no route — mark `status: future` and **remove from menu** until Phase 5  

## 1.4 Type alignment

Add to `EstateRoomDefinition` (registry types):

- `placeCategory`: `destination` \| `conversation` \| `living`  
- `dedicatedInteraction`: `none` \| brief id  

No UI built from these fields in Phase 1 — data only for later phases.

### Phase 1 exit criteria

- [ ] Single registry row per visitable place; Library ≠ Institute in data  
- [ ] `estateSectionMap` generated or manually aligned with zero duplicate entry ids  
- [ ] `CompanionPageClient.tsx` reduced by ≥15% line count via extraction (same behavior)  
- [ ] Inventory doc: **Survivors / Retired / Quarantined** committed in this file’s appendix  
- [ ] `npm test` — estate registry + alias tests green  

### Phase 1 smoke

1. Dev boot → Welcome Home loads  
2. No new console errors on idle  

---

# Phase 2 — Navigation cleanup

**Purpose:** One path from conversation and menu to a place. Named place = immediate move. No home detour.

## 2.1 Single navigation API

Introduce **one** function (name illustrative):

```ts
goToPlace(roomId: string, options?: { source: "chat" | "menu" | "map"; preserveThread: true })
```

**All** of these must delegate to it or be deleted:

| Current path | Action |
|--------------|--------|
| `runDirectEstateRoomNavigation` / `directEstateVisit` | Keep → call `goToPlace` |
| `acceptWorkspaceOfferCore` for **explicit** room names | Bypass offer; direct `goToPlace` |
| `acceptWorkspaceOfferCore` for **feeling** matches | Keep offer card **only** when member did not name a place |
| `intentRoutingIntelligence` workspace offers | Remove estate-capable intents; defer to estate pipeline |
| `v3BehaviorRecovery` duplicate opens | Delete overlaps with `estateCommandRouter` |
| Governor `workspace_open` | Estate-capable sections → `goToPlace`; remove fallthrough to `home` |
| `openSectionBesideChat` / split workspace for estate rooms | Retire for Conversation Places |

## 2.2 Routing order (final)

```
1. Exact room phrase (alias registry)     → goToPlace (no permission, no offer)
2. Estate command router (feeling/intent) → offer OR goToPlace per confidence
3. Governor / legacy intent               → only if estate returned none
4. LLM conversation                       → never auto-open home
```

## 2.3 Permission and copy

| Remove | Keep |
|--------|------|
| “Step into X?” for “take me to library” | Feeling-based offer: Yes · Stay · Map |
| `estateArrivalShariGreeting` tour lines on direct nav | Optional one line in chat (Phase 3) |
| Workspace offer defaulting to wrong section | Registry-driven section from `roomId` |

## 2.4 Menu and sidebar simplification

- `GlobalEstateMenu` → **destinations only**; remove feature catalog rows that duplicate grow hub  
- Sidebar grow tree → hide sections that only render `GrowPlaceholderPanel`  
- URL deep links → resolve to `roomId` via registry, not orphan `AppSection`  

## 2.5 Tests that match runtime

Extend tests beyond `evaluateEstateCommand`:

- Integration: `handleSend("take me to the library")` → `growth-library` + `library` roomId, **not** `momentum-institute`  
- Integration: explicit nav never sets `activeSection: home` intermediate  
- Regression matrix from [ESTATE_E2E_WIRING](./ESTATE_E2E_WIRING.md) on **full chain**  

### Phase 2 exit criteria

- [ ] Every visitable `roomId` reachable only through `goToPlace` (audit grep clean)  
- [ ] Library / Institute / Reading Nook routes documented and tested  
- [ ] No `acceptWorkspaceOffer` on exact room phrase  
- [ ] `COMPANION_ROUTE_INVENTORY` updated; dead routes marked `retired`  
- [ ] Manual matrix (8 prompts from E2E doc) passes on full chain  

### Phase 2 smoke

1. “Take me to the library” → Reading Nook / Library scene, not Institute panel  
2. “Take me to the momentum institute” → Institute destination only  
3. Back / home → thread preserved  

---

# Phase 3 — Conversation cleanup

**Purpose:** One chat surface; Shari sounds like Shari; no instructional UI.

## 3.1 One chat shell

| Survivor | Retire for estate visits |
|----------|--------------------------|
| `EstateChatNavigationOverlay` → `EstateRoomVisitChrome` → `WelcomeHomeFrostedChatPanel` | `WorkspaceLayout` split view on Conversation Places |
| Centered frosted float ([Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)) | Sidebar chat column |

**Rule:** Conversation Places = scene + float **only**. Split layout exists only where audit proves a Destination cannot yet use object-layer (temporary; list in appendix).

## 3.2 Hint and prompt stack

Consolidate per-turn hints into **one** builder:

| Merge from | Into |
|------------|------|
| `estateConversationHintForChat` | `buildEstateTurnHint()` |
| `welcomeHomeConciergeHintForChat` | same (Welcome Home = room, not special case) |
| Global `APP_FEATURE_KNOWLEDGE` when estate active | suppressed |
| `ESTATE_ROOM_ENTRY_HINT` lecture openers | delete |
| `estateOffer.ts` Institute copy on library id | registry trademark |

**Files to align:** `companionPrompt.ts` · `estateArrivalExperience.ts` · `estateRoomTemplate/catalog.ts` · `estateOffer.ts` · `estateRouter.ts`

## 3.3 Voice cleanup (delete list)

Remove from prompts and arrival templates:

- “Enjoy the space” · “What would you like to think about?” · “Take time to reflect”  
- “Welcome to [Room]” · “Here you can…” · dictionary definitions on room entry  
- Software strings: “Workspace loaded”, “Opening…”  

## 3.4 Offer card scope

- **Show** only when estate matcher suggests a place member did **not** name  
- **Hide** on direct navigation, repeat visit same session, Conversation Place already active  
- Remove duplicate offer surfaces (pending action + estate card + workspace chip for same target)  

## 3.5 Conversation continuity

- Single message thread across `goToPlace` (already intended — verify no branch clears state)  
- `estateRoomInConversation` suppresses re-invite while in named room  

### Phase 3 exit criteria

- [ ] All Conversation Places render without `WorkspaceLayout` split  
- [ ] Chat panel visually centered; scene visible at edges  
- [ ] Zero persistent room title labels on float (per UI Philosophy)  
- [ ] Arrival copy audit: no instructional overlays on first paint  
- [ ] Offer card only on feeling-based routing  
- [ ] CT-style manual pass: 5 estate nav phrases sound human, not ChatGPT  

### Phase 3 smoke

1. Greenhouse → birds/ambience, one float, no feature grid  
2. Conservatory / clear my mind → no split brain-dump panel unless member asks  
3. Return from room → same thread  

---

# Phase 4 — Background / image cleanup

**Purpose:** Every visitable place shows a real photograph — or an honest fallback — with one asset map.

## 4.1 Asset audit (baseline)

**On disk today (16 files):** e.g. `reading-nook-background.png`, `greenhouse-background.png`, `portfolio-room-background.png`, `seat-at-pond-background.png`, …  

**Referenced but missing or broken (audit samples):**

| Reference | Issue |
|-----------|--------|
| `butterfly-conservatory.webp` | Not on disk |
| `the-momentum-institute-background.webp` | Not on disk (spec mentions `.png` with space in filename) |
| `creative-studio-background.webp` | Not on disk |
| `evidence-vault-background.webp` | Not on disk |
| `spark-estate-stables-background.webp` | Not on disk |
| `coffee-house-background.png` | Not on disk |
| `sunroom-background,.png` | Typo comma in filename |
| `welcome-home-background.png` | Not on disk |

## 4.2 Single background resolver

| Survivor | Retire |
|----------|--------|
| `estateRoomAssets.ts` + `estateRoomBackgroundCandidates()` | Scattered inline paths in components |
| Registry `backgroundImage` / `intendedBackgroundImage` | Duplicate keys in `ESTATE_ROOM_BG` object |

**Process:**

1. Export audit script: registry path → file exists? → fallback used?  
2. Fix typos on disk **or** update registry to match actual filenames — never invent new names without art  
3. One fallback per room max (not 3-tier chains that mask missing art forever)  
4. Missing art → `status: image-ready-needs-asset`; room **hidden from menu** until file lands (Phase 5 re-enables)  

## 4.3 Wrong room / wrong plate

| Bug class | Fix |
|-----------|-----|
| Library shows Institute art | `roomId` → background map after Phase 1 split |
| Peaceful Places / focus-audio shows orchard copy | Section → roomId mapping + presence registry |
| Greenhouse vs growth-profile sharing plate | Intentional duplicate OK; document in registry |

## 4.4 Ambience

- Keep one ambience map (`estateRoomAmbience.ts` + `audioAssets.ts`)  
- Remove duplicate bird/track wiring in arrival experience  
- Align greenhouse birds asset to cleaned `greenhouse-birds-ambience.mp3` only  

### Phase 4 exit criteria

- [ ] 100% of **live** registry rooms: primary background exists **or** documented fallback displays (no blank hero)  
- [ ] Zero typo paths in `estateRoomAssets.ts`  
- [ ] Audit script checked into `scripts/estate/` (read-only check; no generation)  
- [ ] `estateRoomAssets.test.ts` asserts on-disk files for `status: live` rooms  
- [ ] No `.webp` reference without file or explicit conversion task in appendix  

### Phase 4 smoke

1. Visit each **live** room in registry — Photograph Test: scene is hero  
2. Library, Greenhouse, Portfolio, Pond — correct art, not neighbor room  
3. Broken `onError` does not flash white full-screen  

---

# Phase 5 — Room completion

**Purpose:** Finish visitable places to category-appropriate **minimum** — still no new features, only remove stubs and align shell.

**Not in scope:** new lessons, Institute curriculum, Gallery features, guild systems.

## 5.1 Place category alignment

Apply categories from Master Room Philosophy:

| Category | Completion standard |
|----------|---------------------|
| **Conversation** | Scene + float; ambience; no panel |
| **Destination** | Scene + float + **one** object interaction (existing only — drawer wall, vault, portfolio folio, guidebook) |
| **Living** | Transit assets only; no route until path art exists |

## 5.2 Stub removal

| Current | Action |
|---------|--------|
| `GrowPlaceholderPanel` sections | Unroute from nav/menu OR redirect to nearest Conversation Place |
| `grow-observatory` placeholder | Route to Conversation Place with pond/observatory art when asset ready |
| Partial Coffee House / Tea Room | `future` until art + float shell |
| Duplicate panels (`GrowthProfilePanel` vs `GrowthProfileRoomPanel`) | One component |

## 5.3 Destination rooms (complete existing shell only)

| Room | Complete means |
|------|----------------|
| **Momentum Institute** | Drawer wall works; no library collision; Institute plate |
| **Evidence Vault** | Object-layer or folio; not empty table UI |
| **Portfolio** | Uses `portfolio-room-background.png`; no dashboard grid |
| **Celebration** | Uses celebration art on disk; no placeholder header |
| **Guidebook** | Physical book object per UI Philosophy — not help sidebar |

## 5.4 Conversation places (priority list)

Complete to scene + float for rooms with art on disk:

- Reading Nook (library)  
- Greenhouse / growth-profile  
- Apple Orchard  
- Seat at Pond / Peaceful Places  
- Conservatory (when butterfly asset lands or approved fallback)  

## 5.5 Registry hygiene

- `status: live` only when: routable + art + shell matches category  
- `partial` → not in menu, not in matcher primary  
- `future` → alias may resolve but shows “not ready” **in chat**, not software error  

### Phase 5 exit criteria

- [ ] Zero `GrowPlaceholderPanel` in default user paths  
- [ ] Every menu item maps to a `live` room meeting Photograph Test  
- [ ] Destination vs Conversation list matches registry `placeCategory`  
- [ ] Manual estate walkthrough (15 stops) — no blank screen, wrong trademark, or split chat  
- [ ] vs3 parity: behaviors that worked in tested baseline work in V4 or are intentionally retired with doc note  

### Phase 5 smoke (full walkthrough)

1. Welcome Home → talk → feeling route → offer → accept → arrive  
2. Direct: library, institute, greenhouse, portfolio, celebration garden  
3. Global menu → each destination  
4. Map (if enabled) → place → scene  
5. Mobile width — float + scene  

---

## What we are explicitly NOT building (all phases)

- New Institute lessons, cards, or curriculum  
- New Global Estate Menu actions  
- New intelligence engines or specs 132+  
- Dashboards, analytics, streaks, KPI tiles  
- Invitation catalogs on arrival  
- Parallel chat systems or experimental layouts  
- “Fix” by adding another registry  

---

## Appendix A — Audit collision register (fix by phase)

| Issue | Phase |
|-------|-------|
| `LIBRARY_ENTRY` id/name/section mismatch | 1, 2 |
| `momentum-institute` → `library` in `estateSectionMap` | 1 |
| `estateOffer` “Explore Momentum Institute” for `library` id | 3 |
| Dual chat: `WorkspaceLayout` vs overlay | 3 |
| `handleSend` home fallthrough | 2 |
| Missing backgrounds (see §4.1) | 4 |
| `GrowPlaceholderPanel` grow sections | 5 |
| Apple Orchard / Peaceful Places text leak | 2, 5 |
| Tests don’t cover full navigation chain | 2 |

---

## Appendix B — Survivors (target end state)

| Concern | Survivor |
|---------|----------|
| Room data | `estateRoomRegistry.ts` |
| Phrase match | `estateRoomAliasRegistry.ts` |
| Navigate | `goToPlace()` |
| Chat UI | `EstateChatNavigationOverlay` + `WelcomeHomeFrostedChatPanel` |
| Backgrounds | `estateRoomAssets.ts` + on-disk `public/backgrounds/` |
| Matcher | `estateCommandRouter.ts` + thin `estateMatcher` reading registry |
| Memory | `estateMemory` (transitions only; no second section map) |
| Institute **content** | `lib/momentumInstitute/*` (not navigation) |

---

## Appendix C — Retire list (delete or quarantine)

| Item | Condition |
|------|-----------|
| `GrowPlaceholderPanel` routes | After redirect or hide |
| Split `WorkspaceLayout` for Conversation Places | Phase 3 |
| Duplicate section maps | Phase 1 |
| `estateRoomInvitationCatalog` as arrival UI | Phase 1 or 3 |
| `intentRouting` estate duplicates | Phase 2 |
| `v3BehaviorRecovery` overlapping opens | Phase 2 |
| Orphan map locations unwired to registry | Phase 1 |
| Instructional arrival templates | Phase 3 |
| 3-tier background fallback chains | Phase 4 |

---

## Appendix D — Suggested execution order within each phase

**Phase 1:** registry split (library/institute) → section map → extract navigation from page client → delete dead files  

**Phase 2:** implement `goToPlace` → wire `handleSend` → strip duplicate routers → fix tests → menu prune  

**Phase 3:** retire split layout on conversation rooms → hint merge → voice pass → offer card scope  

**Phase 4:** audit script → fix paths → add/copy assets → test on-disk  

**Phase 5:** hide stubs → flip `live` flags → destination object polish → full walkthrough  

---

## Appendix E — vs3 migration note

Tested baseline: `adhd-business-companion - vs3/companion-app`  

V4 added ~31 `lib/estate/*` files and ~50 `lib/momentumInstitute/*` files **without** removing vs3 routing patterns. This roadmap **subtracts** until the shell feels like vs3 simplicity with estate places — not until V4 feature count grows.

---

*Last updated: cleanup roadmap v1.0 — simplification sequence only.*
