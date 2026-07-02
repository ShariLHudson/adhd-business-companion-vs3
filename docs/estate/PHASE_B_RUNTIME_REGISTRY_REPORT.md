# Phase B — Single Runtime Estate Registry

| Field | Value |
|-------|-------|
| **Phase** | B — Runtime registry (no UI changes) |
| **Status** | Complete |
| **Canon authority** | [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md) (Phase A) |
| **Runtime authority** | `lib/estate/canonicalEstateRegistry.ts` |
| **Date** | 2026-06-30 |

---

## Goal

Create one runtime Estate Registry aligned to Phase A canon. Legacy registries may remain for current behavior but are **no longer authoritative** for place identity.

**Out of scope (honored):** UI redesign, chat placement, room images, new features, deleting legacy files, wiring canonical registry into live routing.

---

## Files created

| File | Role |
|------|------|
| `lib/estate/canonicalEstateRegistryTypes.ts` | Types + version constants aligned to canon field schema |
| `lib/estate/canonicalEstatePlaces.ts` | **42 places** — data synced from Phase A doc |
| `lib/estate/canonicalEstateRegistry.ts` | **Single runtime API** — lookup, alias match, integrity validation |
| `lib/estate/canonicalEstateRegistry.test.ts` | Integrity + alias + category distribution tests (8 passing) |
| `docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md` | This report |

---

## Files touched (markers / exports only)

| File | Change |
|------|--------|
| `lib/estate/index.ts` | Exports `canonicalEstateRegistry` first; documents authority |
| `lib/estate/estateRoomRegistry.ts` | Header: **replace later** — not authoritative |
| `lib/estate/estateRoomAliasRegistry.ts` | Header: **adapter** |
| `lib/estate/estateRoomInvitationCatalog.ts` | Header: **deprecated** (arrival grids) |
| `lib/estate/estateArrivalExperience.ts` | Header: **deprecated** (title/motto plaques) |
| `lib/estate/estateRoomAssets.ts` | Header: **adapter** (background URLs) |
| `lib/estateMemory/estateSectionMap.ts` | Header: **adapter** (AppSection ↔ place) |
| `lib/estate/estatePresence/registry.ts` | Header: **adapter** (presence layers) |
| `lib/estateIntelligence/estateRegistry.ts` | Header: **adapter** (intelligence extensions) |

No runtime behavior changed in legacy files — comments only.

---

## Runtime registry API

**Import path:** `@/lib/estate/canonicalEstateRegistry` or `@/lib/estate` (re-exported).

| Export | Purpose |
|--------|---------|
| `CANONICAL_ESTATE_REGISTRY` | All 42 places (readonly) |
| `CANONICAL_ESTATE_REGISTRY_VERSION` | `"1.0"` |
| `CANONICAL_ESTATE_REGISTRY_DOC` | Path to Phase A markdown |
| `getCanonicalEstatePlaceById(id)` | Lookup by stable id |
| `requireCanonicalEstatePlace(id)` | Lookup or throw |
| `getAllCanonicalEstatePlaces()` | Full list |
| `getCanonicalEstatePlacesByCategory(category)` | Filter by category |
| `getCanonicalLivingPlaces()` / `Destinations()` / `Collections()` / `TransitionSpaces()` | Category shortcuts |
| `isCanonicalEstatePlaceId(id)` | Type guard |
| `resolveCanonicalPlaceIdFromAlias(phrase)` | Exact normalized alias → id |
| `matchCanonicalPlaceInText(text)` | Longest-alias substring match |
| `canonicalRegistryStats()` | Counts by category and status |
| `validateCanonicalRegistryIntegrity()` | Cross-reference `relatedPlaces`, arrival law |

### Per-entry fields (required)

Each `CanonicalEstatePlace` includes: `id`, `officialName`, `category`, `primaryFeeling`, `backgroundImage`, `aliases`, `arrivalBehavior`, `conversationStyle`, `permanentObjects`, `seasonalObjects`, `interactiveObjects`, `relatedPlaces`, `status` (+ optional `expansionNotes`).

### Category distribution (matches Phase A index)

| Category | Count |
|----------|------:|
| Living Place | 16 |
| Destination | 14 |
| Collection | 5 |
| Transition Space | 7 |
| **Total** | **42** |

---

## Legacy registries found

### Primary duplicates (user-specified)

| File | Classification | Notes |
|------|----------------|-------|
| `lib/estate/estateRoomRegistry.ts` | **Replace later** | Was labeled “master source of truth”; **27** rooms vs **42** in canon |
| `lib/estate/estateRoomAliasRegistry.ts` | **Adapter** | Aliases + `AppSection` overrides; should derive from canonical |
| `lib/estate/estateRoomInvitationCatalog.ts` | **Deprecated** | “While you're here…” grids — conflicts Art. VIII / `arrivalBehavior` |
| `lib/estate/estateArrivalExperience.ts` | **Deprecated** | Title/motto/timed plaques — conflicts canon arrival law |
| `lib/estate/estateRoomAssets.ts` | **Adapter** | `ESTATE_ROOM_BG` / `ESTATE_ROOM_BG_BY_ROOM_ID` until Phase H |
| `lib/estateMemory/estateSectionMap.ts` | **Adapter** | `AppSection` ↔ estate entry id |
| `lib/estate/estatePresence/registry.ts` | **Adapter** | Environmental layers keyed by room id |
| `lib/estateIntelligence/estateRegistry.ts` | **Adapter** | Aggregates rooms/tools/knowledge/planned — routing intelligence |
| `lib/estateIntelligence/registrations/*` | **Adapter** | Per-domain entry registrations |

### Secondary / related sources

| File | Classification | Notes |
|------|----------------|-------|
| `lib/estate/estateRoomRouting.ts` | **Adapter** | Feeling-based + explicit nav; should call canonical id resolution |
| `lib/estate/estateDirectRoomResolve.ts` | **Adapter** | Direct visit resolution |
| `lib/estate/estateChatNavigation.ts` | **Adapter** | Chat-driven navigation hints |
| `lib/estate/estateRoomTemplate/catalog.ts` | **Adapter** | Welcome/hero copy — not place identity |
| `lib/estate/estateRoomBackground.ts` | **Adapter** | Resolves background from legacy maps |
| `lib/estateIntelligence/estateCommandAliases.ts` | **Adapter** | Command phrases for intelligence router |
| `lib/growth/profileEstateRooms.ts` | **Adapter** | Profile estate room subset + backgrounds |
| `lib/momentumInstitute/room/instituteRoomRegistry.ts` | **Adapter** | Institute interior — child of `momentum-institute` |
| `lib/stables/stablesRoomRegistry.ts` | **Adapter** | Stables experiences — child of `stables` |

**Authority rule:** If code and canon disagree on **place identity** (id, name, category, arrival law), **canon wins**. Legacy files supply **behavior adapters** until migrated.

---

## Systems that should eventually import `canonicalEstateRegistry`

| System | Current source | Migration note |
|--------|----------------|----------------|
| Estate routing (`goToPlace` / section nav) | `estateRoomRegistry`, `estateSectionMap`, `CompanionPageClient` | Phase C — single id-based router |
| Alias / chat navigation | `estateRoomAliasRegistry`, `estateChatNavigation` | Derive aliases from canonical; keep section adapter |
| Estate Intelligence matcher | `estateRegistry`, `estateCommandAliases` | Validate entry ids against canonical |
| Arrival sequence | `estateArrivalExperience`, invitations | Read `arrivalBehavior` from canonical |
| Backgrounds | `estateRoomAssets`, `estateRoomBackground` | `backgroundImage` on canonical place; assets file as URL resolver |
| Estate Map / Guidebook | Ad hoc lists, menus | Generate from `CANONICAL_ESTATE_REGISTRY` by category |
| Presence layers | `estatePresence/registry` | Register only ids that exist in canonical |
| Memory / visit tracking | `estateSectionMap`, `estateRoomVisitMemory` | Key visits by canonical id |
| Room template copy | `estateRoomTemplate/catalog` | Keyed by canonical id (already mostly aligned) |

---

## Canon vs code mismatches

### Place inventory

| Issue | Canon | Legacy code |
|-------|-------|-------------|
| **Place count** | 42 | `estateRoomRegistry`: 27 |
| **Canon-only places** (no legacy room row) | `reading-nook`, `celebration-garden`, `accomplishments-shelf`, `garden-bench`, `back-deck`, `porch-swing`, `seat-at-pond`, `window-seat`, `main-hallway`, `main-staircase`, `front-drive`, `garden-path`, `woodland-path`, `balcony`, `bridge` | Absent from `estateRoomRegistry` |
| **Gardens vs Celebration Garden** | `gardens` (living) + `celebration-garden` (collection) distinct | Legacy has `gardens` only; no `celebration-garden` row |
| **Evidence naming** | `evidence-vault` | `estateRoomAssets` still maps `evidence-bank` → same background |

### Arrival behavior

| Issue | Canon | Legacy code |
|-------|-------|-------------|
| Living places | `threshold` · `ambient-crossfade` · `presence-only` only | `estateArrivalExperience` shows title + motto; `estateRoomInvitationCatalog` shows object grids |
| Destinations | May use `object-invitation` where canon specifies | Same legacy arrival path for many destinations |
| Transition spaces | `pass-through` — no blocking | Not modeled in legacy registries |

### Backgrounds

| Issue | Canon | Legacy code |
|-------|-------|-------------|
| TBD plates | `backgroundImage: null` on several canon entries | `intendedBackgroundImage` / `NEEDS_ASSET` in room registry |
| Library plate | Canon: reading nook path for Library destination | `estateRoomAssets.library` points at reading-nook file (intentional overlap — document in Phase H) |

### Routing / aliases

| Issue | Canon | Legacy code |
|-------|-------|-------------|
| Alias authority | `aliases` on each canonical place | Duplicate alias lists in `estateRoomAliasRegistry`, `estateRoomRegistry.navigationPhrases`, intelligence aliases |
| Mood vs room | “clear my mind” as feeling ≠ always room visit | `estateRoomAliasRegistry` test expects mood sentence not to exact-match (currently fails — pre-existing) |

### Intelligence registry

| Issue | Canon | Legacy code |
|-------|-------|-------------|
| Scope | Places only in canonical registry | `estateIntelligence` includes tools (`decision-compass` as tool entry), planned catalog entries, duplicate knowledge/room splits |
| Library vs Institute | Distinct destination ids | Recently split in registrations (Phase 1) — aligned with canon |

### Pre-existing test failures (unchanged by Phase B)

- `estateArrivalExperience.test.ts` — motto/greeting expectations vs current copy
- `estateRoomAliasRegistry.test.ts` — mood sentence false-positive on “clear my mind”

These reflect **legacy behavior drift**, not canonical registry defects. Canonical integrity tests pass.

---

## Success test (Phase B)

| Criterion | Result |
|-----------|--------|
| One runtime registry reflects Phase A canon | ✅ `canonicalEstateRegistry.ts` — 42 places, full field schema |
| Legacy registries not authoritative | ✅ Deprecation/adapter headers; `index.ts` exports canonical first |
| No UI / visual changes | ✅ No component or CSS changes |
| No worse member behavior | ✅ Legacy paths unchanged; only new module + comments |

```bash
npx vitest run lib/estate/canonicalEstateRegistry.test.ts
# 8 tests passing
```

---

## Sync workflow (ongoing)

1. Edit **`docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md`** first.
2. Sync **`lib/estate/canonicalEstatePlaces.ts`**.
3. Run **`canonicalEstateRegistry.test.ts`** + `validateCanonicalRegistryIntegrity()`.
4. Update adapters only when a migration phase wires them to canonical.

---

## Recommended next phase

### Phase C — Unified place routing (`goToPlace`)

**Objective:** One id-based navigation function used by chat, map, intelligence, and direct links.

1. Add `goToPlace(canonicalPlaceId)` (or equivalent) that resolves:
   - Canonical place → `AppSection` / shell (adapter layer, not in canonical data)
   - Preserves conversation continuity (Spec 108)
2. Route explicit alias matches through `resolveCanonicalPlaceIdFromAlias` / `matchCanonicalPlaceInText` before feeling-based rules.
3. Keep legacy registries as thin adapters reading canonical ids until call sites migrate.
4. **Still no UI redesign** — swap data source behind existing shells.

### Later phases (reference)

| Phase | Focus |
|-------|--------|
| **D** | Arrival behavior from `arrivalBehavior` (retire plaque + grid arrivals on living places) |
| **E** | Estate Map + Guidebook generated from canonical registry |
| **F** | Retire `estateRoomRegistry` — re-export or generate from canonical + adapter extensions |
| **H** | Background image unification (`backgroundImage` + asset resolver) |

---

## Related documents

- [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)
- [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md)
- [ARCHITECTURAL_RESET_GAP_REPORT.md](./ARCHITECTURAL_RESET_GAP_REPORT.md)
- [V4_FOUNDATION_PASS_ARCHITECTURAL_REVIEW.md](./V4_FOUNDATION_PASS_ARCHITECTURAL_REVIEW.md)
