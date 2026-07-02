# Phase D — Unified Estate Shell

| Field | Value |
|-------|-------|
| **Phase** | D — Architecture & migration plan (no room redesign) |
| **Status** | Complete (documentation) |
| **Vision** | One Estate. One Conversation. One Experience. |
| **Prerequisites** | [Phase B](./PHASE_B_RUNTIME_REGISTRY_REPORT.md) canonical registry · [Phase C](./PHASE_C_GOTOPLACE_REPORT.md) `goToPlace` |
| **Date** | 2026-06-30 |

---

## Vision

Spark Estate is **not** a collection of pages. It is **one continuous place**.

The member should never feel they are leaving one screen and entering another application.

| Law | Meaning |
|-----|---------|
| **The Estate changes** | Background, atmosphere, objects, destination content |
| **The conversation remains** | Same thread, same panel, same relationship |
| **The interface disappears** | No app chrome, no software cards on Living Places |

> *The member should feel like they are walking through one beautiful estate rather than opening different pages.*

---

## Primary objective

Create **one canonical Estate shell** that every Living Place and Destination ultimately renders inside.

The shell owns:

- Full-screen background (from `goToPlace().backgroundImage` / canonical registry)
- Centered conversation panel (single frosted surface)
- Estate object placement (Guidebook™, Folded Map™, Bell — scene-anchored, not floating app buttons)
- Subtle place transitions (crossfade / ambient — never hard page swaps)
- Conversation continuity (never reset on `goToPlace`)
- Immersion gates (no plaques, grids, or instruction overlays on Living Places)

**No destination should own independent layout logic** unless absolutely necessary (documented exceptions below).

**Phase D scope:** Inventory, canonical design, migration strategy — **not** visual redesign, new features, or new destinations.

---

## Recommended canonical shell

### Name: `SparkEstateShell` (proposed)

Single React tree mounted once in `CompanionPageClient` (or successor orchestrator). Navigation calls `goToPlace(placeId)`; the shell updates **place state** only.

```
┌─────────────────────────────────────────────────────────────┐
│  SparkEstateShell (persistent — never unmounts on navigate) │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ EstateSceneLayer                                      │  │
│  │  • full-bleed background (canonical place id)         │  │
│  │  • vignette · estate light flicker · presence layers  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ EstateObjectLayer (scene-anchored, not OS chrome)       │  │
│  │  • Guidebook™ · Folded Estate Map™ · Bell (permission)│  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ EstateDestinationSlot (optional — destinations only)  │  │
│  │  • institute drawers · stables experiences · shelves  │  │
│  │  • never replaces conversation panel                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ EstateConversationPanel (ONE — always mounted)          │  │
│  │  • centered · floating · frosted glass                │  │
│  │  • SimpleChat thread + HomeChatInputFooter              │  │
│  │  • follows member everywhere                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Shell state (driven by Phase C)

```typescript
// Conceptual — implement in Phase D.1+
type SparkEstateShellState = {
  placeId: string;                    // from goToPlace
  category: CanonicalEstateCategory;  // living-place | destination | collection | transition-space
  backgroundImage: string | null;
  arrivalBehavior: CanonicalArrivalBehavior;
  showTitlePlaque: boolean;           // goToPlace — false for living places
  showInvitationGrid: boolean;        // goToPlace — false for living places
  autoOpenActivity: boolean;          // only explicit member request
  preserveConversation: true;
};
```

### What survives as the conversation primitive

**`WelcomeHomeFrostedChatPanel`** is the closest existing implementation of the unified conversation surface (`companion-workspace-frosted`, `estate-room-frosted-chat`). Phase D **renames/evolves** it into `EstateConversationPanel` but keeps one CSS/token system (`lib/workspaceLayoutTokens.ts`, Spec 109 frosted workspace).

**`SimpleChat`** remains the **thread renderer** inside the panel — not a layout shell.

---

## Current shell implementations

### A. Conversation & chat chrome

| Component | Path | Role today | Phase D verdict |
|-----------|------|------------|-----------------|
| **WelcomeHomeFrostedChatPanel** | `components/companion/WelcomeHomeFrostedChatPanel.tsx` | Single frosted card — messages + input | **Survives** → canonical `EstateConversationPanel` |
| **SimpleChat** | `components/companion/SimpleChat.tsx` | Message thread only | **Survives** — child of conversation panel |
| **EstateRoomChatChrome** | `components/companion/estate/EstateRoomChatChrome.tsx` | Frosted chat + ambience toggle | **Adapter** → fold into shell |
| **EstateRoomVisitChrome** | `components/companion/estate/EstateRoomVisitChrome.tsx` | Arrival + invitation grid + frosted chat | **Deprecate** for Living Places; **adapter** for Destinations until rituals move to destination slot |
| **HomeChatInputFooter** | (used in CompanionPageClient) | Input, mic, offers | **Survives** — shell footer |

### B. Full-bleed room stacks (estate immersive)

| Component | Path | Role today | Phase D verdict |
|-----------|------|------------|-----------------|
| **EstateChatNavigationOverlay** | `components/companion/estate/EstateChatNavigationOverlay.tsx` | Background + visit chrome for direct nav | **Adapter** → pattern merges into `SparkEstateShell` |
| **ProfileEstateRoomExperience** | `components/companion/ProfileEstateRoomExperience.tsx` | Profile rooms — bg + chat, no invitations | **Adapter** — closest to Living Place law; merge into shell |
| **EstateRoomFullBleedBackground** | `components/companion/estate/EstateRoomFullBleedBackground.tsx` | Edge-to-edge photograph | **Survives** → `EstateSceneLayer` |
| **EstatePresence** | `components/companion/estate/EstatePresence.tsx` | Subtle environmental motion | **Survives** → scene layer child |
| **EstateRoomAmbienceToggle** | `components/companion/estate/EstateRoomAmbienceToggle.tsx` | Room sound toggle | **Adapter** → scene object or quiet control |

### C. Dedicated destination shells (custom layout)

| Component | Path | Role today | Phase D verdict |
|-----------|------|------------|-----------------|
| **StablesRoomShell** + **StablesRoomPanel** | `components/companion/stables/` | Full viewport + panel content | **Adapter** → destination slot inside unified shell |
| **MomentumInstituteRoomShell** + **Panel** | `components/companion/momentumInstitute/` | Institute drawers + visit chrome | **Adapter** → destination slot |
| **MomentumBuilderRoomShell** + **Panel** | `components/companion/momentumBuilder/` | Planning studio scene + table | **Adapter** → destination slot |
| **GrowRoomShell** | `components/companion/GrowRoomShell.tsx` | Grow™ cinematic background | **Adapter** → migrate to canonical scene layer |
| **GrowthProfileRoomShell** | `components/companion/GrowthProfileRoomShell.tsx` | Growth profile scene | **Adapter** |
| **PortfolioRoomShell** | `components/companion/PortfolioRoomShell.tsx` | Portfolio scene | **Adapter** |

### D. Welcome / home entry

| Component | Path | Role today | Phase D verdict |
|-----------|------|------------|-----------------|
| **WelcomeHomePage** (`WelcomeHomeFirstLaunch`) | `components/companion/WelcomeHomeFirstLaunch.tsx` | First-visit cinematic + frosted chat | **Adapter** — welcome-home **arrival** only; must not be a separate app mode long-term |
| **WorkspaceLayout** | `components/companion/WorkspaceLayout.tsx` | Split chat + workspace (Create, tools) | **Adapter** — **non-immersive tool mode** only; not the Estate shell |
| **CinematicBackground** | `components/companion/scene/CinematicBackground.tsx` | Grow / legacy scenes | **Adapter** → unify under `EstateSceneLayer` |

### E. App chrome (immersion breaks)

| Component | Path | Role today | Phase D verdict |
|-----------|------|------------|-----------------|
| **GlobalEstateMenu** | `components/companion/GlobalEstateMenu.tsx` | Floating upper-right menu | **Deprecate** as primary estate navigation — conflicts with “one place” |
| **SparkEstateGuideAnchor** | `components/companion/SparkEstateGuideAnchor.tsx` | Fixed bottom-right guide button | **Adapter** → **scene object** (see Guidebook) |
| **EstateImmersiveHomeLink** | (CompanionPageClient) | Upper-left Home link | **Deprecate** — conversation + map/guidebook replace |
| **TopBar** / **BackButton** / **ActiveWorkspaceBar** | various | Software navigation | **Retire** inside immersive estate contexts |
| **Homestead signpost sidebar** | CSS + CompanionPageClient | Sidebar nav | **Retire** from member-facing estate (Observation / legacy) |

### F. Living Place violations (must not survive on shell)

| Component | Path | Violation | Phase D verdict |
|-----------|------|-----------|-----------------|
| **EstateRoomTemplateArrival** | `components/companion/estate/EstateRoomTemplateArrival.tsx` | Title plaque + Shari welcome block | **Deprecate** for Living Places |
| **EstateRoomInvitationPanel** | `components/companion/estate/EstateRoomInvitationPanel.tsx` | “While you're here…” feature grid | **Deprecate** for Living Places |
| **estateArrivalExperience** | `lib/estate/estateArrivalExperience.ts` | Timed title/motto sequence | **Deprecate** — use `goToPlace().showTitlePlaque` |
| **EstateRoomInvitationCatalog** | `lib/estate/estateRoomInvitationCatalog.ts` | Static invitation grids | **Deprecate** for Living Places |

### G. Layout intelligence (lib)

| Module | Path | Role today | Phase D verdict |
|--------|------|------------|-----------------|
| **estateImmersiveLayout** | `lib/estateImmersiveLayout.ts` | Which sections are full-bleed | **Adapter** → shell `isImmersive` derived from canonical `category` |
| **companionDesk/workspaceLayout** | `lib/companionDesk/workspaceLayout.ts` | Floating card vs desk | **Adapter** — tool/workspace mode only |
| **workspaceLayoutTokens** | `lib/workspaceLayoutTokens.ts` | Frosted tokens (Spec 109) | **Survives** |
| **goToPlace** | `lib/estate/goToPlace.ts` | Navigation metadata + arrival flags | **Survives** — shell input authority |

### H. Orchestrator

| Module | Path | Role today | Phase D verdict |
|--------|------|------------|-----------------|
| **CompanionPageClient** | `app/companion/CompanionPageClient.tsx` (~18k lines) | Branches across 5+ shell stacks; multiple conditional `SimpleChat` mounts | **Replace later** — thin orchestrator + single `SparkEstateShell` |

### I. Prototypes (out of production path)

| Path | Verdict |
|------|---------|
| `app/prototype/conversation-workspace/` | Reference only |
| `app/prototype/conservatory-workspace/` | Reference only |
| `app/companion/workspace-test/` | Dev only |

---

## Chat — one conversation panel

### Rules (canonical)

| Rule | Implementation note |
|------|---------------------|
| Centered | Panel in viewport center or lower-center — never sidebar |
| Floating | `companion-workspace-frosted` / `estate-room-frosted-chat` |
| Frosted glass | Spec 109 minimum typography; warm, readable on glass |
| Never dominates the room | Max width ~40–48% desktop; room visible at edges |
| Never blocks important objects | Destination objects sit **outside** panel z-index plan |
| Conversation follows member | **One mounted panel** — `goToPlace` updates scene, not chat tree |

### Current problem

`CompanionPageClient` conditionally renders **separate** immersive branches:

1. `ProfileEstateRoomExperience` + `SimpleChat`
2. `EstateChatNavigationOverlay` + `SimpleChat`
3. `WorkspaceLayout` + `SimpleChat` (home / tools)
4. Dedicated panels (Stables, Institute, Momentum Builder) + `EstateRoomVisitChrome` + `SimpleChat`

Same `messages` state — but **remounting** `SimpleChat` on branch switches risks scroll/focus churn and feels like “another app.”

### Target

One `EstateConversationPanel` instance **always mounted** inside `SparkEstateShell`. Branch switches update `placeId` and scene only.

---

## Guidebook — scene object, not software button

### Current state

`SparkEstateGuideAnchor` is a **fixed bottom-right floating button** (`spark-estate-guide.css`) — reads as software chrome, not a physical object in the room.

### Phase D design (document only — no redesign yet)

The unified shell will expose an **`EstateObjectLayer`** with anchored slots:

| Object | Behavior in shell |
|--------|-------------------|
| **Spark Estate Guidebook™** | Rests on a surface defined per place (e.g. side table, welcome home shelf) — position from canonical `permanentObjects` / future scene map |
| **Folded Estate Map™** | Same layer; opens map without pausing conversation (Spec 108) |
| **The Bell** | Celebration Garden / ritual destinations — permission-gated |

**Integration contract (future):**

```typescript
type EstateObjectAnchor = {
  objectId: "guidebook" | "folded-map" | "bell" | ...;
  placeId: string;
  /** Scene coordinates — % of viewport, aligned to background art */
  anchor: { top: string; left: string; width: string };
  onInteract: () => void;
};
```

`goToPlace` returns `relatedPlaces` and `interactiveObjects`; object layer reads canonical registry + per-place scene config (Phase E/H).

**Migrate:** `SparkEstateGuideAnchor` → `EstateObjectLayer` adapter until art-directed positions exist.

---

## Living Places

### Must never display (Constitution Art. VIII · `goToPlace` flags)

- Title plaques (`EstateRoomTemplateArrival`, `estateArrivalExperience`)
- Feature grids (`EstateRoomInvitationPanel`, invitation catalog)
- Software cards / instruction overlays
- Arrival messages / “While you're here…”

### Must happen

1. Member arrives (or `goToPlace` fires)
2. Scenery crossfades (`arrivalBehavior`: `threshold` · `ambient-crossfade` · `presence-only`)
3. Conversation continues in the **same panel**
4. Nothing else

**Reference implementation today:** `ProfileEstateRoomExperience` (no invitation) — use as Living Place adapter pattern.

---

## Destinations

Destinations **may** include special objects, rituals, books, drawers, collections.

The **shell stays identical**:

| Layer | Living Place | Destination |
|-------|--------------|-------------|
| Scene | Background + presence | Same |
| Conversation panel | Always visible | Always visible |
| Destination slot | Empty | Institute drawers, shelves, stables experiences |
| Arrival | Silent crossfade | `object-invitation` **inside conversation** or object layer — not full-screen grid |

Only **destination content** changes — not layout grammar.

---

## Background

### Authority

`goToPlace().backgroundImage` ← `canonicalEstateRegistry` (Phase B).

### Current split (to unify)

| Source | Used by |
|--------|---------|
| `EstateRoomFullBleedBackground` | Most immersive rooms |
| `CinematicBackground` | GrowRoomShell |
| `profileEstateRoomBackgroundImage` | Profile estate |
| Section-based `getEstateRoomForRoute` | Legacy fallbacks |
| Homestead scene provider | welcome / multi-room |

### Target

**`EstateSceneLayer`** alone resolves background:

1. Canonical `backgroundImage` for `placeId`
2. `estateRoomBackground.ts` candidate fallback (adapter)
3. Crossfade on `placeId` change — no unmount/remount of conversation

Destinations **must not** import their own full-page layout wrappers long-term — only slot content.

---

## Migration strategy

### Phase D.1 — Shell scaffold (no visual change)

| Step | Action |
|------|--------|
| 1 | Add `components/companion/estate/SparkEstateShell.tsx` — composes existing children behind stable API |
| 2 | Add `lib/estate/estateShellState.ts` — maps `GoToPlaceResult` → shell props |
| 3 | Unit tests: living place → `showInvitationGrid === false` |

### Phase D.2 — Single conversation mount

| Step | Action |
|------|--------|
| 1 | Extract one `EstateConversationPanel` from `WelcomeHomeFrostedChatPanel` |
| 2 | Mount once in shell; remove duplicate `SimpleChat` branches from overlay paths |
| 3 | Verify: navigate greenhouse → reading nook → chat history intact |

### Phase D.3 — Consolidate immersive stacks

| Step | Action |
|------|--------|
| 1 | Route `EstateChatNavigationOverlay` + `ProfileEstateRoomExperience` through shell |
| 2 | Gate invitations: `if (goToPlace.showInvitationGrid)` only |
| 3 | Living Places: skip `EstateRoomVisitChrome` invitation path entirely |

### Phase D.4 — Destination slots

| Step | Action |
|------|--------|
| 1 | Move Stables / Institute / Momentum Builder **content** into `EstateDestinationSlot` |
| 2 | Retire per-destination **shell** wrappers (`*RoomShell`) as layout owners |
| 3 | Keep exception docs if a destination truly needs custom layout |

### Phase D.5 — Chrome retirement

| Step | Action |
|------|--------|
| 1 | Remove floating `GlobalEstateMenu` from immersive contexts |
| 2 | Migrate `SparkEstateGuideAnchor` to object layer |
| 3 | Remove `EstateImmersiveHomeLink` + section `BackButton` when shell active |

### Phase D.6 — Orchestrator slim-down

| Step | Action |
|------|--------|
| 1 | `CompanionPageClient` → state + handlers only |
| 2 | All place rendering via `goToPlace` + `SparkEstateShell` |
| 3 | `WorkspaceLayout` only for explicit tool/create split mode off-estate |

---

## Files involved (by migration phase)

| Phase | Primary files |
|-------|----------------|
| D.1 | `SparkEstateShell.tsx` (new), `lib/estate/estateShellState.ts` (new), `goToPlace.ts` |
| D.2 | `WelcomeHomeFrostedChatPanel.tsx`, `CompanionPageClient.tsx` |
| D.3 | `EstateChatNavigationOverlay.tsx`, `ProfileEstateRoomExperience.tsx`, `EstateRoomVisitChrome.tsx` |
| D.4 | `StablesRoomShell.tsx`, `MomentumInstituteRoomShell.tsx`, `MomentumBuilderRoomShell.tsx`, related panels |
| D.5 | `GlobalEstateMenu.tsx`, `SparkEstateGuideAnchor.tsx`, `estate-immersive.css` |
| D.6 | `CompanionPageClient.tsx`, `estateImmersiveLayout.ts` |

**CSS consolidation (later):** `estate-room-frosted-chat.css`, `companion-floating-card.css`, `welcome-home-first-launch.css`, `estate-immersive.css` → shell tokens; **not in Phase D**.

---

## Dependencies

| Dependency | Why |
|------------|-----|
| **Phase B** `canonicalEstateRegistry` | Place identity, category, backgrounds, arrival behavior |
| **Phase C** `goToPlace` | Shell state input; navigation without chat reset |
| **Spec 109** Frosted Conversation Workspace | Panel typography and behavior |
| **Spec 108** Environment Integration | Map/guidebook optional; conversation travels |
| **Constitution Art. VIII** | Living Place arrival law |
| **estate-light-flicker.css** | Scene layer warm light |
| **HomesteadSceneProvider** | Background preload — adapter until scene layer owns preload |

---

## Risks

| Risk | Mitigation |
|------|------------|
| **CompanionPageClient complexity** | Incremental migration; shell behind feature flag |
| **SimpleChat remount** | Single panel instance; pass `conversationScrollKey` only |
| **Dedicated destinations resist unification** | Document exceptions; slot pattern first |
| **WorkspaceLayout coupling** | Keep for Create/tool split — not part of estate shell |
| **Invitation grids deeply wired** | `goToPlace.showInvitationGrid` gate before delete |
| **Guidebook position per room** | Phase E/H scene map; floating button until art ready |
| **Regression in 56+ estate tests** | Migrate one shell branch at a time; keep adapters |
| **Performance** | One background crossfade; avoid double full-bleed images |

---

## Future simplifications

After unified shell ships:

1. **Delete** `EstateChatNavigationOverlay` as standalone wrapper — shell only
2. **Delete** `EstateRoomVisitChrome` invitation path for Living Places
3. **Merge** `EstateRoomChatChrome` into shell
4. **Retire** `estateImmersiveLayout` section lists → `category === 'living-place' | 'destination'`
5. **Retire** duplicate background resolvers — canonical + one candidate fallback
6. **Collapse** 15+ estate CSS files into shell + scene + panel
7. **Replace** `activeSection` branching with `placeId` in orchestrator
8. **Generate** Estate Map / Guidebook place lists from `CANONICAL_ESTATE_REGISTRY` (Phase E)

---

## Success test

Manual — member walkthrough:

| Step | Pass criteria |
|------|----------------|
| 1 | Open Companion — feels like **arriving home**, not loading an app |
| 2 | Chat with Shari — panel centered, frosted, calm |
| 3 | “Take me to the Greenhouse” — scenery changes; **same conversation** visible |
| 4 | “Go to the Coffee House” — crossfade; **no title plaque**, **no grid** |
| 5 | Open Guidebook — feels like **picking up an object**, not a menu button (after D.5) |
| 6 | Visit Momentum Institute — drawers/rituals appear **beside** conversation, not instead of it |
| 7 | Return Welcome Home — no “welcome back” software surge; continuity preserved |
| 8 | Throughout — **never** feels like switching between different applications |

Automated (Phase D.1+):

```bash
# After scaffold lands
npx vitest run lib/estate/goToPlace.test.ts
# living place flags: showTitlePlaque false, showInvitationGrid false
```

---

## Related documents

- [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)
- [PHASE_B_RUNTIME_REGISTRY_REPORT.md](./PHASE_B_RUNTIME_REGISTRY_REPORT.md)
- [PHASE_C_GOTOPLACE_REPORT.md](./PHASE_C_GOTOPLACE_REPORT.md)
- [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md)
- [01 — Spark Estate Constitution](./01%20-%20Spark%20Estate%20Constitution.md) — Art. VIII
- Spec 109 — `docs/SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md`
- Spec 108 — `docs/SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md`
