# Phase 1 — Architecture Audit & Gap Analysis

**Status:** Complete — awaiting review before Evidence Vault rebuild  
**Authority:** `SPARK_RECOGNITION_ENGINE.md` wins conflicts  
**Build handoff:** `056_UNIFIED_RECOGNITION_BUILD_HANDOFF.md` / `060_CURSOR_IMPLEMENTATION_ORDER.md`

---

## 1. Existing code map

### Evidence Bank / Evidence Vault™

| Path | Role | Reuse? |
|------|------|--------|
| `lib/evidenceBankStore.ts` | CRUD, print/export (no hallCandidate field yet) | **Adapt** → recognition_records adapter |
| `lib/estate/collectionFramework/*` | Shared collection UI + adapters | **Reuse** as Experience/Management shell |
| `components/companion/EvidenceBankPanel.tsx` | Thin wrapper | Keep during migration |
| `components/companion/EvidenceVaultRoomShell.tsx` | Full-bleed shell only | Reuse shell later |
| Immersive `components/evidence-vault/*` / `lib/evidenceVault/*` | Referenced in older docs | **Not in source** on this branch |
| `lib/momentumInstitute/evidenceBridge.ts` | Institute → vault permission | Keep; bridge to shared model |

### Hall of Accomplishments™

| Path | Role | Reuse? |
|------|------|--------|
| Canonical place `gallery-of-firsts` | Navigation identity | Keep place ID |
| Alias `hall-of-accomplishments` | Phrase routing | Keep |
| Shell maps to `growth-portfolio` | Wrong destination for Hall | **Obsolete routing** |
| `lib/gallery/*` | Asset Library hallway | **Do not reuse as Hall** |
| Hall exhibit store | — | **Missing** |

### Journal / Accomplishments / Legacy Studio™

| Path | Role | Reuse? |
|------|------|--------|
| `lib/growthJournalStore.ts` | Journal entries | Adapt later for legacy_story |
| `lib/journalGazebo/*` | Rich journal UX | Keep as journal experience |
| Legacy Studio module | — | **Missing** |
| `achievement-library` collection | Milestone stories in journal store | Overlaps Legacy intent |

### Celebration features

| Path | Role | Reuse? |
|------|------|--------|
| `lib/growthWinsStore.ts` | Garden wins | Adapt → quiet_celebration |
| Celebration Garden shell + CSS | Visual room | Reuse mood/background |
| `celebration-hall` generic store | Festive chapters | Adapt → festive_celebration |
| `lib/recognition/*` | Date milestones | **Keep separate** — different product |
| `lib/ecosystem/.../celebrationEngine.ts` | Founder events | Out of scope |

### Room navigation / state / routing

| Path | Role | Gap |
|------|------|-----|
| `resolveEstatePlace`, alias catalogs, manifest | Place resolution | Fragmented registries |
| `estateCommandRouter`, primary turn classifier | Turn ownership | No `active_recognition_flow` |
| `estateMemoryStore` | Session memory | No `visual_room` contract |
| `roomContext/*` “already here” | In-room replies | Can fire when visual room ≠ claimed room |
| `collectionPendingOffer` | Save offers | Closest to recognition flow — incomplete |

### Search / print / export / attachments

| Capability | Exists? | Notes |
|------------|---------|-------|
| Collection search | Yes | Per-room via `collectionQuery` |
| Unified recognition search | No | Needed across types |
| Evidence print/export | Yes | txt |
| Journal print/PDF | Yes | gazebo |
| Memory export batch | Yes | weekly-wins/journal/portfolio/evidence |
| Shared recognition export | No | Spec requires Print/PDF/Word/MD/Text |
| Asset library attachments | Yes | Reuse |

---

## 2. Gap analysis

### Reusable

- Collection Framework (capture + browse shell)
- Evidence / wins / journal stores (as adapters)
- Asset library attachment model
- Estate place IDs for vault / gardens / celebration-room / gallery-of-firsts
- Collection offer intelligence (permission-first pattern)
- Print utilities (extend, don’t replace)

### Obsolete / misleading (do not delete yet — map around)

- Routing Hall → Portfolio
- `planned.ts` stale `evidence-bank` registration
- Treating Asset Library gallery as Hall
- Using `lib/recognition` name for Unified Recognition Engine (namespace collision)

### Duplicate logic

- Three “recognition/celebration” engines (dates, founder, collection offers)
- Evidence Bank vs Evidence Vault naming
- Wins This Week vs Celebration Garden
- Journal gazebo vs journal collection panel
- Garden wins store vs Celebration Hall generic store

### Missing functionality (vs Recognition Engine)

| Spec requirement | Status |
|------------------|--------|
| Shared `recognition_records` | Missing |
| Lifecycle states | Missing (partial hallCandidate on evidence only) |
| Tone routing (quiet vs festive) | Missing |
| `visual_room` / `conversation_context` / `requested_destination` / `active_recognition_flow` | Missing as explicit contract |
| Fast path vs full experience API | Partial (offers exist; not unified) |
| Legacy Studio | Missing |
| Hall exhibits as separate records | Missing |
| Never auto-induct | N/A (no Hall yet) — must enforce |
| Preserve-first (don’t route discovery → Create) | Partial / fragile |
| Unified search across recognition types | Missing |
| Rediscovery engine | Missing |

### Technical debt

- `CompanionPageClient` monolith (~20k lines) — integration must be surgical
- Triple place registry
- Local-only persistence (no multi-device)
- Collection offers can fight Create / task lock
- “Already here” depends on inconsistent current-place signals

---

## 3. Proposed shared data model

See also: `058_SHARED_RECOGNITION_SCHEMA_SPEC.md` and runtime module `lib/sparkRecognitionEngine/`.

### Core entity: `RecognitionRecord`

```
id, userId?, recordType, title, description?, body?,
date, sourceContext?, sourceRoom?, lifecycleStatus,
tone?, significanceScoreInternal?, wing?,
tags[], people[], projectId?,
attachmentIds[], relatedRecordIds[],
hallCandidateStatus, hallExhibitId?,
celebrationIntensity?,
createdAt, updatedAt, lastRevisitedAt?
```

### `recordType`

`discovery` | `quiet_celebration` | `festive_celebration` | `legacy_story` | `hall_candidate` | `hall_exhibit_reference`

### `lifecycleStatus`

`captured` → `preserved` → `recognized` → `celebrated_quiet` | `celebrated_festive` → `chronicled` → `hall_candidate` → `hall_exhibit` → `archived`

Stages may be skipped. Never auto-advance to `hall_exhibit`.

### Hall exhibits

Separate `HallExhibit` records that **reference** supporting recognition IDs. Never mutate a discovery into an exhibit.

### Storage (Phase 1)

New localStorage key: `companion-recognition-records-v1`  
Adapters will later bridge existing evidence/wins/journal stores without deleting them.

---

## 4. Routing / state implementation plan

### Required state fields

| Field | Meaning |
|-------|---------|
| `visual_room` | Place ID currently visible on screen |
| `conversation_context` | What conversation believes is active |
| `requested_destination` | Explicit member navigation target |
| `active_recognition_flow` | In-progress recognition flow (or null) |

### Rules

1. Never say “already here” unless `visual_room` matches the claimed place.
2. Explicit `requested_destination` wins over suggestions.
3. Active recognition flow blocks Create routing for discovery language.
4. Inside Evidence Vault → preserve; inside Garden → quiet; inside Celebration Room → festive; inside Hall → exhibit language.
5. Member override wins immediately (no argument).

### Integration points (after review)

1. Write `visual_room` whenever `goToPlace` / shell section changes.
2. Gate “already here” replies through recognition room state.
3. Hook recognition flow into turn pipeline **after** primary turn classifier, **alongside** collection offers (do not fight them yet — bridge).

---

## 5. Files that will change (foundation only)

### New (this phase)

- `lib/sparkRecognitionEngine/**` — types, store, lifecycle, room state, routing, triggers, cold start, index
- `lib/sparkRecognitionEngine/*.test.ts` — foundation tests
- `docs/estate/recognition/PHASE_0_REPOSITORY_INTELLIGENCE.md`
- `docs/estate/recognition/PHASE_1_ARCHITECTURE_AUDIT.md` (this file)
- `docs/estate/recognition/PHASE_1_FOUNDATION_PLAN.md`

### Touch later (not yet)

- `CompanionPageClient.tsx` — wire visual_room + recognition flow
- `estateInRoomConversationIntents.ts` / `roomActionMatchers.ts` — already-here gate
- `collectionOfferIntelligence.ts` — bridge to shared model
- `evidenceBankStore.ts` / `growthWinsStore.ts` — adapters
- Hall / Legacy Studio modules — Phase 2–5

### Do not change yet

- Evidence Vault immersive UI rebuild
- Hall gallery walk
- Celebration rituals
- Deleting legacy stores

---

## 6. Risks before implementation begins

| Risk | Mitigation |
|------|------------|
| Namespace collision with `lib/recognition/` | New module named `lib/sparkRecognitionEngine/` |
| Breaking collection offers | Foundation-only; adapters later |
| Wrong Hall destination | Document; fix routing in Phase 5, not now |
| Monolith integration bugs | Small hooks; tests first |
| Data migration | Dual-write adapters; no delete of old keys |
| Create misroute | Context lock + preserve-first rules in engine |
| Scope creep into room rebuilds | Hard stop until review |

---

## 7. Review gate

**Do not rebuild Evidence Vault™ until this foundation is reviewed.**

Approve to continue:

1. Shared model + room state module (scaffolded)
2. Wire `visual_room` into navigation
3. Gate “already here”
4. Then Phase 2 — Evidence Vault™
