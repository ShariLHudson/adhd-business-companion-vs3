# Phase C — goToPlace Navigation System

| Field | Value |
|-------|-------|
| **Phase** | C — Unified place navigation (no UI redesign) |
| **Status** | Complete |
| **Authority** | `lib/estate/canonicalEstateRegistry.ts` |
| **Navigation primitive** | `lib/estate/goToPlace.ts` |
| **Phrase resolution** | `lib/estate/resolveEstatePlace.ts` |
| **Date** | 2026-06-30 |

---

## Goal

One canonical navigation function — `goToPlace(placeId)` — becomes the approved way to move through Spark Estate. Conversation continues; only the place changes.

**Out of scope (honored):** UI redesign, image changes, new rooms, new destination experiences, deleting legacy routers, wiring `CompanionPageClient` to call `goToPlace` directly (adapter path via command router is in place).

---

## Files created

| File | Role |
|------|------|
| `lib/estate/goToPlace.ts` | **`goToPlace(placeId)`** — validate canonical id, return UI metadata, enforce navigation law |
| `lib/estate/resolveEstatePlace.ts` | Natural language → canonical place (priority: exact → object → activity → suggestion) |
| `lib/estate/canonicalPlaceSectionAdapter.ts` | Canonical place id → `AppSection` / menu action (shell adapter) |
| `lib/estate/goToPlace.test.ts` | Phase C success tests (16 passing) |
| `docs/estate/PHASE_C_GOTOPLACE_REPORT.md` | This report |

---

## Files touched

| File | Change |
|------|--------|
| `lib/estate/estateDirectRoomResolve.ts` | Canonical resolution first via `resolveEstatePlace` + `goToPlace` |
| `lib/estateIntelligence/estateCommandRouter.ts` | Phase C notes; intent suppressed when resolution is `suggestion` |
| `lib/estate/estateRoomRouting.ts` | Marked **replace later** for regex nav |
| `lib/estate/directEstateVisit.ts` | Adapter note — visit from `goToPlace().directVisit` |
| `lib/estate/estateChatNavigation.ts` | Adapter note |
| `lib/estate/estateRoomBackground.ts` | Canonical `backgroundImage` first |
| `lib/estate/index.ts` | Export `goToPlace`, `resolveEstatePlace`, section adapter |
| `lib/estate/canonicalEstatePlaces.ts` | Alias fixes (reading nook, celebration room, accomplishments book); removed `reading nook` from `main-staircase` |
| `lib/intentRoutingIntelligence.ts` | Phase C adapter note |
| `lib/frictionlessActionLayer.ts` | Phase C adapter note |
| `lib/estateIntelligence/estateRouter.ts` | Phase C adapter note |

---

## `goToPlace` API

```typescript
goToPlace({
  placeId: string;
  userIntent?: string;
  userMessageCountAtArrival?: number;
  explicitActivityRequested?: boolean;
})
```

### Returns (success)

| Field | Meaning |
|-------|---------|
| `place` | Full canonical entry |
| `section` | Legacy `AppSection` shell (adapter) |
| `backgroundImage` | From canonical registry |
| `arrivalBehavior` | From canonical registry |
| `preserveConversation` | Always `true` |
| `resetConversation` | Always `false` |
| `autoOpenActivity` | Only when `explicitActivityRequested` |
| `showTitlePlaque` | `false` for living places & pass-through |
| `showInvitationGrid` | `false` for living places |
| `directVisit` | Compatible with existing `DirectEstateVisit` overlay |

### Navigation law (enforced in metadata)

> The conversation belongs to the member. The place changes. The conversation continues.

Only **Start New Conversation** / **Start New Day Conversation** may reset chat (handled outside `goToPlace`).

---

## `resolveEstatePlace` routing priority

| Priority | Kind | Behavior |
|----------|------|----------|
| 1 | `exact-place` | Nav verb + alias, or bare destination name |
| 2 | `explicit-object` | Accomplishments Book™, Celebration Room, Institute Cabinet |
| 3 | `explicit-activity` | Clear My Mind™, Plan My Day, Decision Compass™ |
| 4 | `suggestion` | Feelings — quiet, celebrate, learn — **never forced** |
| 5 | `none` | General conversation |

Legacy `estateRoomRouting` regex and intent matcher run only when canonical resolution returns `none`.

---

## Legacy routing paths found

| Path | Classification | Notes |
|------|----------------|-------|
| `lib/estate/estateRoomRouting.ts` | **Replace later** | Regex explicit-nav rules |
| `lib/estate/estateDirectRoomResolve.ts` | **Adapter** | Now canonical-first |
| `lib/estate/estateRoomAliasRegistry.ts` | **Adapter** | Section overrides until shell unification |
| `lib/estateIntelligence/estateCommandRouter.ts` | **Adapter** | Orchestrates direct/hybrid/intent |
| `lib/estateIntelligence/estateRouter.ts` | **Adapter** | Intent invitations |
| `lib/estateIntelligence/estateMatcher.ts` | **Adapter** | Capability matching |
| `lib/estateMemory/estateSectionMap.ts` | **Adapter** | Section ↔ entry id |
| `lib/intentRoutingIntelligence.ts` | **Replace later** | Feature/section routing |
| `lib/frictionlessActionLayer.ts` | **Adapter** | Early-turn action layer |
| `app/companion/CompanionPageClient.tsx` | **Replace later** | `setActiveSection` / `runDirectEstateRoomNavigation` (14+ paths) |
| `acceptWorkspaceOffer` / workspace offers | **Adapter** | Still opens sections from offers |
| `activeSection` fallthrough → `home` | **Replace later** | Implicit default in page client |

---

## Systems that should call `goToPlace`

| Consumer | Status after Phase C |
|----------|----------------------|
| `estateDirectRoomResolve` | ✅ Canonical-first |
| `estateCommandRouter` | ✅ Via direct resolve; intent blocked on `suggestion` |
| `CompanionPageClient` | ⏳ Still uses `runDirectEstateRoomNavigation` — should read `goToPlace` metadata for arrival flags |
| Estate Map / Guidebook | ⏳ Phase E |
| `intentRoutingIntelligence` | ⏳ Must not override exact place |
| `frictionlessActionLayer` | ⏳ Estate branches → `resolveEstatePlace` |

---

## Aliases successfully resolved (Phase C tests)

| Phrase | Result |
|--------|--------|
| Take me to the Greenhouse. | `greenhouse` |
| Go to the Reading Nook. | `reading-nook` |
| Take me to the Momentum Institute. | `momentum-institute` |
| Open the Celebration Room. | `celebration-garden` |
| Show me my Accomplishments Book. | `accomplishments-shelf` |
| Take me to the Coffee House. | `coffee-house` |
| Let's go to the Apple Orchard. | `apple-orchard` |
| let's sit under the stairs | `reading-nook` |
| go to the institute | `momentum-institute` |
| I want to sit somewhere quiet. | **suggestion** (reading-nook, conservatory, peaceful-places) |
| I need to celebrate something. | **suggestion** (celebration-garden, accomplishments-shelf) |
| I want to learn something. | **suggestion** (momentum-institute, library) |
| I need to clear my mind | **explicit-activity** → `clear-my-mind` |

---

## Unresolved conflicts

| Issue | Detail |
|-------|--------|
| **UI still uses legacy arrival** | `goToPlace` sets `showTitlePlaque: false` for living places, but `estateArrivalExperience` may still run in `CompanionPageClient` until Phase D |
| **Invitation grids** | `estateRoomInvitationCatalog` still drives post-arrival UI — not gated by `goToPlace.showInvitationGrid` yet |
| **main-staircase vs reading-nook** | Canon had overlapping alias `reading nook` on transition space — removed; living place wins on ties |
| **celebration-garden alias `celebrate`** | Removed from exact aliases so “I want to celebrate” routes to **suggestion**, not forced navigation |
| **sunroom background path** | Canonical uses `sunroom-background.png`; legacy `estateRoomAssets` typo `sunroom-background,.png` — canonical wins in `estateRoomBackground` |
| **Collection/transition shells** | Places like `accomplishments-shelf` map to `growth-library` section — overlay uses canonical `roomId` |
| **Pre-existing test failures** | `estateArrivalExperience`, `estateRoomAliasRegistry` mood sentence — unchanged legacy drift |

---

## Manual test checklist

- [ ] Say **“Take me to the Greenhouse”** — arrives greenhouse, chat history intact
- [ ] Say **“Go to the Reading Nook”** — `reading-nook` background, no title plaque
- [ ] Say **“Open the Momentum Institute”** — institute panel/section, chat intact
- [ ] Say **“Open the Celebration Room”** — celebration-garden place id, no forced activity
- [ ] Say **“Show me my Accomplishments Book”** — accomplishments-shelf routing
- [ ] Say **“I want to sit somewhere quiet”** — Shari **suggests** places; does **not** auto-navigate
- [ ] Say **“I need to celebrate something”** — suggestion only
- [ ] Say **“I need to clear my mind”** — navigates to Clear My Mind™ (explicit activity)
- [ ] Navigate between two living places — conversation never clears
- [ ] **Start New Conversation** — only explicit reset path clears chat

```bash
npx vitest run lib/estate/goToPlace.test.ts lib/estateIntelligence/estateCommandRouter.test.ts
# 31 tests passing
```

---

## Recommended next phase

### Phase D — Arrival behavior from canonical `arrivalBehavior`

Wire `goToPlace().showTitlePlaque` and `showInvitationGrid` into `CompanionPageClient` / arrival sequence. Retire `estateArrivalExperience` title/motto for living places. Retire invitation grids on living-place arrival.

### Phase E — Estate Map & Guidebook from canonical registry

Generate place lists from `CANONICAL_ESTATE_REGISTRY` by category.

---

## Related documents

- [PHASE_B_RUNTIME_REGISTRY_REPORT.md](./PHASE_B_RUNTIME_REGISTRY_REPORT.md)
- [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)
- [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md)
