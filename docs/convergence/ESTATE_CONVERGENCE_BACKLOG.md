# Estate Convergence Backlog

| Field | Value |
|-------|-------|
| **Type** | Engineering backlog (working document) — derived from the Core Experience Integration audit |
| **Goal** | Converge the existing platform onto the approved authorities. **No new architecture. No new implementation of any responsibility. Consolidate, connect, repair.** |
| **Governing hierarchy** | Companion Constitution → Product Authority Hierarchy ([`docs/constitution/README.md`](../constitution/README.md)) → subject authorities → engineering standards → code |

## How to use this backlog

- Each task is consolidation/repair of **existing** code — never a second implementation.
- **Product Decision Gates** (below) block specific tasks until Shari decides; do not start a gated task first.
- Order is integration-first: Phase 1 (plumbing) → Phase 2 (resident surfaces) → Phase 3 (Business Estate) → Phase 4 (polish).
- Complexity: Low (isolated) · Medium (multi-file, one subsystem) · High (touches the shell / saved data / multiple subsystems).

## Authority legend

`CONST` Companion Constitution · `PAH` Product Authority Hierarchy · `VTS` Visual Thinking Studio Authority · `SPARK` Spark Card Authority · `RESEARCH` Research Everywhere (platform) · `PLACE` Estate Place authorities · `WELCOME` Welcome Home / Resident Journey authorities

## Product Decision Gates (blocking — pending Shari)

| Gate | Blocks | Decision |
|------|--------|----------|
| **G1** | EC-003, EC-004, EC-016 | Which Visual Thinking engine is canonical — `visualFocus` (shell opens it) or `cartographersStudio` (handoffs land there). |
| **G2** | EC-015 | Canonical member-facing Spark Card display taxonomy (runtime enum stays the internal key regardless). |
| **G3** | EC-019 | Client Avatar stays a linked "area" (`companion-ideal-clients-v1`) or folds onto the business envelope. |
| **G4** | EC-020 | The single canonical Strategy home (Desk vs Library/playbook vs Chamber vs Board vs Founder). |
| **G5** | EC-024 | Kinsey / surprise-moment scope and the 3-soundscape ambience contract. |

---

## Summary table

| ID | Task | Phase | Authority | Complexity | Risk | Depends on |
|----|------|-------|-----------|-----------|------|-----------|
| EC-001 | Enforce routing ownership contract | 1 | CONST · PAH | Medium | Med-High | — |
| EC-002 | Demote/retire duplicate routers to adapters | 1 | CONST · PAH | Medium | Medium | EC-001 |
| EC-003 | Visual engine convergence (one engine) | 1 | VTS | High | High | G1 |
| EC-004 | Unify the two visual handoff channels | 1 | VTS | Medium | High | EC-003 |
| EC-005 | Repair Research→Visual handoff (payload) | 1 | RESEARCH · VTS | Medium | Medium | EC-004 |
| EC-006 | Spark Card router fix (no hard reload) | 1 | SPARK | Low | Low | EC-001 |
| EC-007 | Unify discovery selection to one selector | 1 | WELCOME · CONST | Medium | Medium | EC-001 |
| EC-008 | Consolidate arrival/greeting to one owner | 1 | WELCOME | Medium | Medium | — |
| EC-009 | Consolidate Welcome Home surface | 1 | WELCOME | Medium | Med-High | EC-008 |
| EC-010 | Single overwhelm route | 1 | CONST | Low | Medium | EC-001 |
| EC-011 | Retire deprecated place code / empty nav | 1 | PLACE | Low | Low | EC-001 |
| EC-012 | Execute Business Estate legacy dispositions | 1 | PLACE · PAH | Medium | Medium | EC-002 |
| EC-013 | Welcome Home four-section render | 2 | WELCOME | Medium | Low | EC-009, EC-007 |
| EC-014 | Resident Journey 61–90 earned gate + invites | 2 | WELCOME | Medium | Medium | EC-007, EC-013 |
| EC-015 | Spark Card taxonomy map + expanded back-fill | 2 | SPARK | Medium | Medium | G2 |
| EC-016 | VTS calm convergence (one model, redesign) | 2 | VTS | High | Med-High | EC-003 |
| EC-017 | Research Everywhere shared consumption | 2 | RESEARCH | Medium | Medium | EC-005 |
| EC-018 | Finish Identity Office sub-flows (7 of 9) | 3 | PAH | Medium | Low | — |
| EC-019 | Unify Client Avatar front doors | 3 | PAH · PLACE | Medium | Medium | EC-012, G3 |
| EC-020 | Strategy naming consolidation | 3 | PAH | High | High | G4 |
| EC-021 | Systems Desk vs SOP clarification | 3 | PAH | Low | Low | — |
| EC-022 | Business Builder frame continuity check | 3 | PAH | Low | Low | EC-012 |
| EC-023 | Split CompanionPageClient god-file | 4 | CONST | High | High | EC-001..EC-010 |
| EC-024 | Seasonal + ambience + delight | 4 | PLACE | Medium | Low | G5 |
| EC-025 | Accessibility parity (ADHD UX platform-wide) | 4 | VTS · CONST | Medium | Low | EC-016 |
| EC-026 | VTS visual polish + transitions | 4 | VTS | Low | Low | EC-016 |

---

## Task detail

### EC-001 — Enforce routing ownership contract
- **Authority:** CONST · PAH · `lib/estateBrain/routingOwnershipContract.ts` (self-declared production path)
- **Existing code owner:** `frictionlessActionLayer.resolveFrictionlessAction` → `estateBrain/routeEstateIntelligence` → `estate/goToPlace` → shell `openSectionBesideChatCore`
- **Files affected:** `app/companion/CompanionPageClient.tsx` (`openSectionBesideChatCore`, `openSectionFromUrlCore`, `executeCompanionIntent`), `lib/frictionlessActionLayer.ts`, `lib/estateBrain/routingOwnershipContract.ts`, `lib/estate/goToPlace.ts`
- **Dependencies:** none (foundational)
- **Complexity:** Medium · **Risk:** Med-High (touches the 994 KB shell; many entry points)
- **Acceptance:** every intent→place path funnels through the declared chain; contract assertion passes at runtime; no navigation bypasses the sink; no user-visible change.
- **Test files:** extend contract/route tests under `lib/estateBrain/**`; new `routingOwnership.integration.test.ts`; regression on existing navigation tests.
- **Order:** Sprint 1 (first).

### EC-002 — Demote/retire duplicate routers to adapters
- **Authority:** CONST · PAH
- **Existing code owner:** `estateBrain/*` (primary)
- **Files affected:** `lib/estateIntelligence/**`, `lib/estateCapabilityRegistry/**`, `lib/estateNavigationIntelligence/**`, `lib/estateExperiences/resolveEstateNavigation.ts`, `lib/intentRoutingIntelligence.ts`, kernel `runDirectEstateRoomNavigation` (in CompanionPageClient)
- **Dependencies:** EC-001
- **Complexity:** Medium · **Risk:** Medium (behavior parity across resolvers)
- **Acceptance:** the 6 parallel resolvers no longer independently decide a destination — they resolve *through* estateBrain or are removed; `estateExperiences/resolveEstateNavigation` (currently unimported) removed or adapter-only.
- **Test files:** existing resolver tests repurposed as adapter tests; parity snapshot tests.
- **Order:** Sprint 2.

### EC-003 — Visual engine convergence (one engine)
- **Authority:** VTS
- **Existing code owner:** `lib/visualFocus/**` (shell opens; canonical `VisualFocusMap`) vs `lib/cartographersStudio/**` (handoffs land)
- **Files affected:** the chosen engine's model/store; the other becomes model/entry adapter; `lib/estateBrain/environmentRegistry.ts` (`visual-thinking-studio` `primarySection`)
- **Dependencies:** **G1**
- **Complexity:** High · **Risk:** High (two saved-data models; existing maps must open — Acceptance Test 48)
- **Acceptance:** one persisted map model; both entry paths open the same surface; existing `companion-visual-focus-maps-v1` maps still open; no second engine remains authoritative.
- **Test files:** `lib/visualFocus/*.test.ts`, `lib/cartographersStudio/visualThinking*.test.ts` (converge/adapter), map-migration test (new).
- **Order:** Sprint 1–2 (after G1).

### EC-004 — Unify the two visual handoff channels
- **Authority:** VTS
- **Existing code owner:** `lib/visualFocus/store.ts` (`companion-visual-focus-pending-open-v1`) + `lib/creationWorkspace/destination/*` (`companion-creation-workspace-visual-handoff-v1`)
- **Files affected:** `lib/visualFocus/store.ts`, `lib/creationWorkspace/destination/**`, `components/companion/VisualFocusWorkspacePanel.tsx`, `components/companion/cartographersStudio/VisualThinkingRequestPanel.tsx`
- **Dependencies:** EC-003
- **Complexity:** Medium · **Risk:** High (handoffs currently land in a different surface than nav opens)
- **Acceptance:** Creation→Visual and any queued-open land in the same surface `environmentRegistry.primarySection` opens; one consume path; no orphaned handoff.
- **Test files:** handoff producer/consumer tests (extend); `visualHandoff.integration.test.ts` (new).
- **Order:** Sprint 2.

### EC-005 — Repair Research→Visual handoff (payload, not label)
- **Authority:** RESEARCH · VTS
- **Existing code owner:** `lib/researchLibrary/useThisResearch.ts` (`destination:"visual_thinking"` label only)
- **Files affected:** `lib/researchLibrary/useThisResearch.ts`, the unified visual handoff (EC-004), `lib/research/**` adapter
- **Dependencies:** EC-004
- **Complexity:** Medium · **Risk:** Medium
- **Acceptance:** choosing "use this research in Visual Thinking" writes a real handoff payload the visual surface consumes and attaches findings additively to the map model (per `04_RESEARCH_EVERYWHERE`); no produced-intent-without-delivery.
- **Test files:** `lib/researchLibrary/*.test.ts`, research→visual handoff test (new).
- **Order:** Sprint 2–3.

### EC-006 — Spark Card router fix (no hard reload)
- **Authority:** SPARK
- **Existing code owner:** `lib/sparkNote/sparkNoteDestinations.ts` (`navigateToSparkDestination` uses `window.location.assign`)
- **Files affected:** `lib/sparkNote/sparkNoteDestinations.ts`, the in-app router entry (EC-001)
- **Dependencies:** EC-001
- **Complexity:** Low · **Risk:** Low (isolated)
- **Acceptance:** Spark Card navigation goes through the in-app router (no full reload); `idea-vault` either routes correctly or is explicitly labeled a stand-in; no bypass of the central router.
- **Test files:** `lib/sparkNote/sparkNoteDestinations.test.ts` (new/extend).
- **Order:** Sprint 1 (quick win).

### EC-007 — Unify discovery selection to one selector
- **Authority:** WELCOME · CONST
- **Existing code owner:** `lib/estateProgressiveDiscoveryJourney/journeyDiscoveryPicker.ts` (wraps `estateDiscovery` + curriculum)
- **Files affected:** `lib/estateBrain/discoveryMode.ts`, `lib/estateIntelligence/estateDiscovery.ts`, `lib/estateHelpDiscoveryIntelligence/**` (→ adapters/removed); Spark Card daily engine stays separate but coordinates "one invitation/morning"
- **Dependencies:** EC-001
- **Complexity:** Medium · **Risk:** Medium
- **Acceptance:** one "what to surface today" selector for discovery; Spark Card daily engine unchanged but does not double-prompt on the same morning.
- **Test files:** `lib/estateDiscovery/*.test.ts`, `estateProgressiveDiscoveryJourney/*.test.ts`.
- **Order:** Sprint 3.

### EC-008 — Consolidate arrival/greeting to one owner
- **Authority:** WELCOME
- **Existing code owner:** `lib/arrivalIntelligence/**` (MA-05-hardened)
- **Files affected:** `lib/arrivalExperience/**`, `lib/arrivalGreetingIntelligence/**`, `lib/welcomePresenceIntelligence/greetingLibrary.ts`, `lib/relationshipIntelligence/greetingVariety.ts` (→ retire/merge)
- **Dependencies:** none
- **Complexity:** Medium · **Risk:** Medium (greeting parity)
- **Acceptance:** one greeting/arrival authority; duplicate greeting libraries removed or merged; greeting copy parity preserved.
- **Test files:** `lib/arrivalIntelligence/arrivalIntelligence.test.ts`, greeting tests.
- **Order:** Sprint 3.

### EC-009 — Consolidate Welcome Home surface
- **Authority:** WELCOME
- **Existing code owner:** `lib/dailyOpening/resolveGlobalDailyOpening`
- **Files affected:** `lib/welcomeHome/**`, `lib/estate/welcomeHome*.ts` (7), `lib/welcomeRoom/**`, `lib/estateMenu/**`, `CompanionPageClient.openWelcomeRoom`
- **Dependencies:** EC-008
- **Complexity:** Medium · **Risk:** Med-High (multiple welcome entry points)
- **Acceptance:** Welcome Home renders from the single daily-opening controller; scattered welcome logic retired/merged.
- **Test files:** `lib/dailyOpening/*.test.ts`, `lib/welcomeHome/*.test.ts`.
- **Order:** Sprint 3–4.

### EC-010 — Single overwhelm route
- **Authority:** CONST (relief-before-action)
- **Existing code owner:** `lib/frictionlessActionLayer.ts` (overwhelm→Clear My Mind)
- **Files affected:** `lib/overwhelmTodayRouting.ts`, `lib/intentRoutingIntelligence.ts` (remove duplicate copy)
- **Dependencies:** EC-001
- **Complexity:** Low · **Risk:** Medium (emotional-safety path)
- **Acceptance:** one overwhelm-routing implementation; constitutional rules ("Clear My Mind only; never scenic menus; never auto-open Breathe") enforced in one place.
- **Test files:** `lib/frictionlessActionLayer.*.test.ts` (extend).
- **Order:** Sprint 3.

### EC-011 — Retire deprecated place code / empty nav
- **Authority:** PLACE
- **Existing code owner:** `lib/estate/canonicalEstateRegistry.ts` (primary)
- **Files affected:** `lib/estate/canonicalEstatePlaces.ts` (`@deprecated`), `lib/companionUi.ts` (empty `SIDEBAR_NAV`/`MORE_NAV`, deprecated `SidebarNavId`s), dead `clearMyMindRouting.shouldOpenClearMyMindBesideChat`, empty `PLACE_NAVIGATION_REDIRECTS`
- **Dependencies:** EC-001
- **Complexity:** Low · **Risk:** Low
- **Acceptance:** deprecated place adapter removed or fully behind the canonical registry; dead/empty scaffolding removed; no runtime consumer left pointing at retired code.
- **Test files:** place-registry tests; nav-config tests.
- **Order:** Sprint 4.

### EC-012 — Execute Business Estate legacy dispositions
- **Authority:** PLACE · PAH (`legacyWorkspaceMap` + `ESTATE_LEGACY_MIGRATION_FREEZE`)
- **Existing code owner:** `lib/estateExperiences/legacyWorkspaceMap.ts`; envelope estate `lib/profile/businessEstateProfile.ts`
- **Files affected:** `lib/estateBrain/capabilityRegistry.ts` (`BUSINESS` caps → round-table), `legacyWorkspaceMap.ts`, `ProfileDestinationHost.tsx`
- **Dependencies:** EC-002
- **Complexity:** Medium · **Risk:** Medium
- **Acceptance:** `client-avatars`/`business-profile` moved, `playbook`/`sop-workspace` dispositions executed; legacy round-table/Business-HQ routing no longer parallels the envelope estate.
- **Test files:** `legacyWorkspaceMap.test.*`, business-nav intent tests.
- **Order:** Sprint 4.

### EC-013 — Welcome Home four-section render
- **Authority:** WELCOME
- **Existing code owner:** `lib/dailyOpening/resolveGlobalDailyOpening` + `CanonicalWelcomeContext`
- **Files affected:** `components/companion/…TodaysWelcomeCard`, `GlobalDailyCompanionOpening`, daily-opening wiring in `CompanionPageClient`
- **Dependencies:** EC-009, EC-007
- **Complexity:** Medium · **Risk:** Low
- **Acceptance:** four sections (welcome · one optional discovery/invitation · three action cards · encouragement) render from one controller; daily invitation sourced from the unified selector (EC-007).
- **Test files:** `lib/dailyOpening/welcomeContext.test.ts`, `globalDailyCompanionOpening.test.ts`.
- **Order:** Sprint 4.

### EC-014 — Resident Journey 61–90 earned gate + adaptive invitations
- **Authority:** WELCOME (Days 61–90 audit)
- **Existing code owner:** `lib/dailyOpening/first60Days/**`, `lib/arrivalIntelligence/returnState.ts`, Phase-3 signals
- **Files affected:** `first60Days/dayIndex.ts` (earned-familiarity gate), `resolveDiscoveryForDay.ts` (broaden adaptive pool to places), invitation source
- **Dependencies:** EC-007, EC-013
- **Complexity:** Medium · **Risk:** Medium (must stay invisible — no phase/level UI)
- **Acceptance:** belonging tone gates on earned usage (sessions/places/Phase-3), not calendar day 61; adaptive invitation can surface unvisited/likely-helpful places; no "Day 61/Phase 2/graduated" ever shown.
- **Test files:** `first60Days/*.test.ts`, `arrivalIntelligence.test.ts`.
- **Order:** Sprint 5.

### EC-015 — Spark Card taxonomy map + expanded back-fill
- **Authority:** SPARK
- **Existing code owner:** `lib/sparkNote/types.ts` (`SparkNoteCategory` enum, keep), `contentDatabase/categoryTaxonomy.ts`, `sparkCardDiversity.ts`
- **Files affected:** a mapping table (enum → display → workbook); `catalogSeed.ts` `expanded` content back-fill; fix duplicate `SPARK-BIZ-001` file
- **Dependencies:** **G2**
- **Complexity:** Medium · **Risk:** Medium (must not rename the runtime enum — breaks affinity learning)
- **Acceptance:** one member-facing display taxonomy via mapping table; runtime enum unchanged; cards lacking a genuine second layer get `expanded` content; `SPARK-BIZ-001` duplicate resolved.
- **Test files:** `lib/sparkNote/*.test.ts` (19 files), taxonomy-map test (new).
- **Order:** Sprint 5.

### EC-016 — VTS calm convergence (one model, progressive-disclosure redesign)
- **Authority:** VTS
- **Existing code owner:** `lib/visualFocus` (`VisualFocusMap`), `CARTOGRAPHERS_STUDIO_PROGRESSIVE_DISCLOSURE_REDESIGN.md`
- **Files affected:** the chosen canvas (`MindMapEditableCanvas` / `ThinkingWorkspace`), workspace layout (map 75–85%, dim room, remove permanent Nodes list, no auto analysis panel)
- **Dependencies:** EC-003
- **Complexity:** High · **Risk:** Med-High
- **Acceptance:** map, relationships, analysis, summary from one saved model (Acceptance Tests 22–28); calm workspace per `01`/`05` (the "screamed" dashboard resolved); plain language (no Canvas/Nodes/Edges).
- **Test files:** map the 50 `06_ACCEPTANCE_TESTS` onto `lib/visualFocus/**` + `lib/cartographersStudio/**` tests.
- **Order:** Sprint 5–6.

### EC-017 — Research Everywhere shared consumption
- **Authority:** RESEARCH
- **Existing code owner:** `lib/research/**` + `lib/researchLibrary/**` + capability `RESEARCH`
- **Files affected:** collapse the 3 research surfaces to one shared capability; VTS-local research paths (`visualFocus/researchAssisted`, `cartographersStudio/visualThinkingResearchAcquisition`) become thin adapters
- **Dependencies:** EC-005
- **Complexity:** Medium · **Risk:** Medium
- **Acceptance:** one research engine consumed by Welcome/VTS/Business; status contract (idle→…→cancelled) shared; no third research system; no failed request shown as active forever.
- **Test files:** `lib/research*/**/*.test.ts`, research-status tests.
- **Order:** Sprint 6.

### EC-018 — Finish Identity Office sub-flows
- **Authority:** PAH
- **Existing code owner:** `lib/profile/businessEstateProfile.ts` envelope (`identity`), `lib/profile/businessEstateRedesign/identitySections.ts`
- **Files affected:** wire the 7 stubbed sub-sections (Purpose, Mission, Vision, Values, Guiding Principles, Boundaries, Definition of Success) — envelope fields already exist
- **Dependencies:** none
- **Complexity:** Medium · **Risk:** Low (wiring existing data, no new store)
- **Acceptance:** all 9 Identity sub-flows editable and persisted to the envelope; approved-only projection intact.
- **Test files:** `businessEstateProfile.test.*`, identity-section tests (new).
- **Order:** Sprint 6.

### EC-019 — Unify Client Avatar front doors
- **Authority:** PAH · PLACE
- **Existing code owner:** `components/companion/IdealClientBuilder.tsx` + `companion-ideal-clients-v1`
- **Files affected:** `guided-stages/PeopleIHelp*` (second front-door), legacy round-table `client-avatars` cap
- **Dependencies:** EC-012, **G3**
- **Complexity:** Medium · **Risk:** Medium
- **Acceptance:** one entry to avatar data; legacy round-table client-avatar routing retired; store position (linked area vs envelope) per G3.
- **Test files:** avatar store tests, People-I-Help nav tests.
- **Order:** Sprint 6–7.

### EC-020 — Strategy naming consolidation
- **Authority:** PAH (`docs/strategy-chamber/01_CURRENT_STATE_AUDIT`, `179` proposal)
- **Existing code owner:** Strategy Desk (`direction` section) + `StrategiesPanel`/`StrategyLibraryEstatePanel`/`userStrategies` + Chamber + Board + Founder
- **Files affected:** the competing Strategy surfaces (consolidate to one home; others adapter/retire)
- **Dependencies:** **G4**
- **Complexity:** High · **Risk:** High (user-facing; "do not delete working functionality until replacement verified")
- **Acceptance:** one canonical Strategy home; other surfaces route to it or are retired behind verified paths; cognitive-load reduced.
- **Test files:** strategy-chamber tests, strategy nav tests.
- **Order:** Sprint 7.

### EC-021 — Systems Desk vs SOP clarification
- **Authority:** PAH
- **Existing code owner:** Systems Desk (`tools` section) vs Create SOP (`create.sop`, `WorkspaceSopField`)
- **Files affected:** naming/routing only (no new SOP engine)
- **Dependencies:** none
- **Complexity:** Low · **Risk:** Low
- **Acceptance:** residents can tell "my tools inventory" (Systems Desk) from "write an SOP" (Create); no duplicate SOP system introduced.
- **Test files:** section-field tests; create-SOP tests.
- **Order:** Sprint 7.

### EC-022 — Business Builder frame continuity check
- **Authority:** PAH
- **Existing code owner:** `MyBusinessEstatePanel.tsx` (re-entry returns to overview)
- **Files affected:** verification only (largely unchanged)
- **Dependencies:** EC-012
- **Complexity:** Low · **Risk:** Low
- **Acceptance:** "Business Builder" language resolves to the estate overview; continuity (resume/return) preserved.
- **Test files:** `businessEstateNavIntent.test.*`.
- **Order:** Sprint 7.

### EC-023 — Split CompanionPageClient god-file
- **Authority:** CONST (maintainability) — **after** routing is centralized
- **Existing code owner:** `app/companion/CompanionPageClient.tsx` (~994 KB)
- **Files affected:** extract routing, arrival, section-open, overlay hosts into modules
- **Dependencies:** EC-001..EC-010
- **Complexity:** High · **Risk:** High
- **Acceptance:** no behavior change; the shell delegates to the now-single owners; file materially smaller; tests green.
- **Test files:** full companion behavior suite; snapshot/regression.
- **Order:** Sprint 8 (Phase 4 only).

### EC-024 — Seasonal + ambience + delight
- **Authority:** PLACE (Place Registry model)
- **Existing code owner:** `lib/estate/estatePresence/**`, `lib/peacefulPlaces/**`, place manifest
- **Files affected:** per-place seasonal behavior; 3-soundscape ambience contract; low-frequency surprise moments / Kinsey
- **Dependencies:** **G5**
- **Complexity:** Medium · **Risk:** Low (non-gamified per Constitution)
- **Acceptance:** seasonal/ambience/delight behaviors are calm, opt-in, and never gamified.
- **Test files:** estatePresence tests, ambience tests (new).
- **Order:** Sprint 8.

### EC-025 — Accessibility parity (ADHD UX platform-wide)
- **Authority:** VTS (`05_ADHD_UX_RULES`) · CONST (`128`)
- **Existing code owner:** existing a11y (toolbar/aria/sr-only mirrors) in VTS + companion
- **Files affected:** apply ADHD UX rules across resident surfaces (contrast, keyboard, one-primary-action, text-off-imagery)
- **Dependencies:** EC-016
- **Complexity:** Medium · **Risk:** Low
- **Acceptance:** keyboard + contrast + focus parity across Welcome/Spark/VTS/Business; ADHD UX rules met.
- **Test files:** a11y tests per surface.
- **Order:** Sprint 8.

### EC-026 — VTS visual polish + transitions
- **Authority:** VTS
- **Existing code owner:** `sparkCardCollectibleDisplay` (Spark done); VTS visual layer
- **Files affected:** VTS transitions/polish after convergence
- **Dependencies:** EC-016
- **Complexity:** Low · **Risk:** Low
- **Acceptance:** polish only; no structural change; calm, readable, premium.
- **Test files:** visual/interaction tests.
- **Order:** Sprint 8.

---

## Sprint plan (integration-first)

- **Sprint 1 — Unblock the spine:** EC-001, EC-006, and (once G1 is decided) start EC-003.
- **Sprint 2 — One router, one visual surface:** EC-002, EC-003, EC-004.
- **Sprint 3 — Connect + de-duplicate:** EC-005, EC-007, EC-008, EC-010.
- **Sprint 4 — Welcome + legacy cleanup:** EC-009, EC-011, EC-012, EC-013.
- **Sprint 5 — Resident experience depth:** EC-014, EC-015, EC-016 (start).
- **Sprint 6 — Research + Business foundation:** EC-016 (finish), EC-017, EC-018, EC-019 (start).
- **Sprint 7 — Business Estate consolidation:** EC-019 (finish), EC-020, EC-021, EC-022.
- **Sprint 8 — Polish (only after integration):** EC-023, EC-024, EC-025, EC-026.

**Recommended first sprint = EC-001 + EC-003/EC-004 (after G1) + EC-006** — enforce the routing owner, converge the visual engine + handoffs, and remove the one surface (Spark Card) that bypasses the router. All integration/repair; no feature added.

---

*This is a working backlog derived from the Core Experience Integration audit. It plans consolidation of existing code onto approved authorities; it introduces no new architecture and no second implementation of any responsibility. Product Decision Gates (G1–G5) remain with Shari.*
