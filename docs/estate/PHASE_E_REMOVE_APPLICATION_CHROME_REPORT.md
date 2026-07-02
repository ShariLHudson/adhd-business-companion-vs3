# Phase E — Remove Application Chrome

| Field | Value |
|-------|-------|
| **Phase** | E — Let the Estate become the interface |
| **Status** | Complete |
| **Authorities** | Constitution Art. VIII · Living in Spark Estate · Phase D shell · `goToPlace` |
| **Date** | 2026-06-30 |

---

## Goal

Remove visual elements that make Spark Estate feel like **software** instead of a **living place**. The Estate image is the hero; the member is inside the Estate, not inside an app layout.

**Out of scope (honored):** New features, individual room redesign, destination content changes.

---

## Files created

| File | Role |
|------|------|
| `lib/estate/estateChromePolicy.ts` | Central policy: what chrome to hide/show per place + context |
| `lib/estate/estateChromePolicy.test.ts` | 5 tests — living places, destinations, direct overlay |
| `docs/estate/PHASE_E_REMOVE_APPLICATION_CHROME_REPORT.md` | This report |

---

## Files changed

| File | Change |
|------|--------|
| `app/companion/CompanionPageClient.tsx` | `estatePlaceChromeActive` hides sidebar/topbar/workspace bar; policy-driven menu/guidebook; home link suppressed |
| `app/companion/estate-immersive.css` | Hide chrome on `companion-direct-estate-room-active`; hide home link + signpost |
| `components/companion/estate/EstateRoomVisitChrome.tsx` | Living Place mode — no invitation grid or arrival plaque slot |
| `components/companion/estate/EstateChatNavigationOverlay.tsx` | Passes living-place flag from canonical policy |
| `components/companion/estate/EstateArrivalHost.tsx` | Skips title/motto overlay for Living Places & transitions |
| `components/companion/estate/useEstateRoomVisitPhase.ts` | `skipInvitation` → conversation phase immediately |
| `lib/estate/index.ts` | Export `estateChromePolicy` |
| `docs/estate/README.md` | Phase E link |
| `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md` | Phase E note |

---

## UI removed (Estate mode)

| Element | How |
|---------|-----|
| **Homestead sidebar / signpost** | Hidden when `estatePlaceChromeActive` (includes direct `goToPlace` visits on `home` section) |
| **Top navigation bar** | Hidden via same gate + CSS |
| **Active workspace bar** (tabs) | Hidden in Estate mode |
| **Upper-left “Home” pill** | `hideEstateHomeLink` policy + CSS |
| **Title / motto arrival plaques** | `EstateArrivalHost` skips overlay when `shouldSuppressEstateTitlePlaque` |
| **“While you're here…” invitation grids** | `EstateRoomVisitChrome` living-place mode — no `EstateRoomInvitationPanel` |
| **Arrival template hero plaque** | Not rendered when invitation suppressed (no `welcomeSlot`) |
| **Section back button** | Hidden when `estatePlaceChromeActive` |

---

## UI hidden (CSS + conditional render)

| Element | Estate mode behavior |
|---------|---------------------|
| `AppSidebar` / `CompanionSidebarPortal` | Not mounted when `estatePlaceChromeActive` |
| `TopBar` | Not mounted when `estatePlaceChromeActive` |
| `ActiveWorkspaceBar` | Not mounted when `estatePlaceChromeActive` |
| `EstateImmersiveHomeLink` | Policy + CSS `display: none` |
| `.homestead-signpost-sidebar` | CSS hide in direct estate + immersive roots |
| Global `CompanionBackground` wash | Already suppressed in immersive (unchanged) |

---

## UI kept (Estate mode)

| Element | Notes |
|---------|-------|
| **Centered frosted chat** | `WelcomeHomeFrostedChatPanel` / `EstateRoomChatChrome` |
| **Subtle Estate menu** | `GlobalEstateMenu` floating variant — settings, profile, logout |
| **Guidebook** | `SparkEstateGuideAnchor` — still bottom-right (scene object migration in Phase D.5) |
| **Room background** | Full-bleed via `EstateRoomFullBleedBackground` |
| **Conversation continuity** | Unchanged — navigation law from Phase C |
| **Destination objects** | Institute drawers, stables experiences, etc. — unchanged this phase |
| **Room ambience toggle** | Subtle per-room sound control |

---

## Living Place rule (enforced)

Canonical **Living Places** (`category: living-place`) now show only:

- Background
- Centered chat (conversation phase immediately — no invitation)
- Subtle Estate menu + Guidebook

**No** plaques · **no** grids · **no** feature cards · **no** instructional arrival copy.

Examples verified in policy tests: `greenhouse`, `coffee-house`, `reading-nook`, `conservatory`, `apple-orchard`.

Implementation path: `goToPlace().showInvitationGrid === false` → `shouldSuppressEstateInvitationGrid()` → `EstateRoomVisitChrome` + `useEstateRoomVisitPhase({ skipInvitation: true })`.

---

## Destination rule (partial — content unchanged)

Destinations with `arrivalBehavior: object-invitation` (e.g. `library`, `momentum-institute`) **may still** show invitation grids via `EstateRoomVisitChrome` until destination rituals move to the unified shell destination slot (Phase D.4).

Title plaques suppressed for `presence-only` destinations (e.g. `celebration-garden`).

---

## Key fix: direct visits on `home` section

Before Phase E, `goToPlace` could route Living Places to `section: home` while **sidebar and TopBar remained visible** because `estateImmersiveActive` was false for `activeSection === "home"`.

Phase E introduces **`estatePlaceChromeActive`** = immersive OR direct overlay OR welcome/institute/stables/builder/profile modes → **application chrome hidden** for all Estate place navigation.

---

## Remaining app-like elements (future phases)

| Element | Why it remains | Target phase |
|---------|----------------|--------------|
| **Guidebook fixed bottom-right button** | Not yet scene-anchored | D.5 object layer |
| **GlobalEstateMenu floating pill** | Required for settings/account | Restyle as Estate object |
| **Destination invitation grids** | Destination rule allows; software styling | D.3–D.4 gate by `showInvitationGrid` only |
| **“Step into…” workspace offer copy** | Chat offers outside Estate overlay | Conversation / offer copy pass |
| **WorkspaceLayout split** (Create, tools) | Non-Estate tool mode on `home` | Keep for tools; not Estate shell |
| **Peaceful Places landing UI** | When not in direct room overlay | Phase F immersion |
| **Grow / legacy section panels** | Not yet unified shell | D.4+ |
| **Homestead signpost copy in chat** | Legacy assistant line in CompanionPageClient | Observation / copy log |
| **EstateRoomAmbienceToggle** | Small control — acceptable subtle chrome | Optional scene integrate |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Members cannot find settings without menu | Floating `GlobalEstateMenu` retained |
| Destination arrivals feel empty without grid | Destinations still allow invitations; institute has drawers |
| `home` + tool workspace without estate visit shows sidebar | Correct — application mode when not in Estate place |
| Institute/Stables panels still use `EstateRoomVisitChrome` with invitations | Intentional for Phase E destination rule |
| CSS `!important` hides chrome | Matches existing immersive pattern; test per room |

---

## Manual testing checklist

### Living Place (direct navigation)

- [ ] Say **“Take me to the Greenhouse”** — full-bleed greenhouse, **no sidebar**, **no top bar**
- [ ] **No** “While you're here…” grid inside chat panel
- [ ] **No** title/motto plaque animation on arrival
- [ ] Conversation history **still visible**
- [ ] **Guidebook** visible (bottom-right)
- [ ] **Estate menu** visible (upper-right floating)
- [ ] **No** upper-left Home pill

Repeat for: **Coffee House**, **Apple Orchard**, **Conservatory**, **Reading Nook** (via navigation).

### Destination

- [ ] **Momentum Institute** — drawers/content still work; sidebar hidden
- [ ] **Celebration Garden** (when navigable) — no title plaque; conversation primary

### Application mode (control)

- [ ] Generic **home** chat (no direct estate visit) — sidebar/topbar **may** appear (tooling mode)

```bash
npx vitest run lib/estate/estateChromePolicy.test.ts lib/estate/goToPlace.test.ts
# 21 tests passing
```

---

## Success test

Open a Living Place.

**Expected:** Entering a beautiful room — not a page, not a dashboard, not a menu. Background owns the screen; frosted chat floats in the center; only subtle Guidebook and Estate menu remain.

**The Estate is the interface.**

---

## Recommended next phase

**Phase D.1–D.3 implementation** — single `SparkEstateShell` mount, one conversation panel instance, retire duplicate overlay branches.

**Phase F** — replace “Step into…” offer language; Peaceful Places landing cards; Guidebook scene anchoring.

---

## Related documents

- [PHASE_D_UNIFIED_ESTATE_SHELL.md](./PHASE_D_UNIFIED_ESTATE_SHELL.md)
- [PHASE_C_GOTOPLACE_REPORT.md](./PHASE_C_GOTOPLACE_REPORT.md)
- [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)
