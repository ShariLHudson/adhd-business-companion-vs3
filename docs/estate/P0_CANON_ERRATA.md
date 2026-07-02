# P0 Canon Errata™

| Field | Value |
|-------|-------|
| **Status** | **Binding** — resolves final canon conflicts before Phase D.1 |
| **Scope** | Documentation + minimal canonical registry cleanup |
| **Effective** | Immediately |
| **Supersedes** | Conflicting rows in [03 — Estate Room Catalog](./03%20-%20Estate%20Room%20Catalog.md) and Phase H open items marked P0 |

---

## Purpose

Phase H identified fractures between Constitution, Bible, Canonical Registry, and legacy catalogs. **This document is the resolution.** Implementation (shell, UI, copy audit) waits for Phase D.1 — but routing and registry must not contradict these rules.

**Authority order after P0:**

1. Constitution · Living Guide · Bible (with errata below)  
2. [SPARK_ESTATE_CANONICAL_REGISTRY](./SPARK_ESTATE_CANONICAL_REGISTRY.md)  
3. [SPARK_ESTATE_MEMORY_ARCHITECTURE](./SPARK_ESTATE_MEMORY_ARCHITECTURE.md) (wins simplification)  
4. Phase F · Phase G · Phase D  
5. **03 Room Catalog** — historical reference only  

---

## 1. Celebration Room™ (was `celebration-garden`)

### Canon decision

| Field | Value |
|-------|-------|
| **Canonical id** | `celebration-room` |
| **Official member-facing name** | **Celebration Room™** |
| **Category** | Destination |
| **Role** | Quiet ritual space — bell, notes, flowers; where accomplishments are **celebrated** |

The outdoor **Gardens™** (`gardens`) remain a separate **Living Place** for walking and reflection. The Celebration Room is the ritual destination — not the garden path.

### Aliases (routing)

| Alias | Notes |
|-------|-------|
| `celebration room` | Primary |
| `the celebration room` | Primary |
| `celebration garden` | Legacy phrase — still understood |
| `celebration` | Bare destination |
| `accomplishments` | Honor context — not the Accomplishments Book shelf |
| `wins` | Default wins destination (see §4) |
| `mark this moment` | Ritual language |

### Legacy id

| Legacy | Maps to |
|--------|---------|
| `celebration-garden` | `celebration-room` |

Runtime adapters may accept `celebration-garden` until Phase D.1; **new code uses `celebration-room` only.**

### Document updates

- Constitution Art. V and Living Guide already say **Celebration Room** — no change needed.  
- Canonical Registry index and destination entry renamed.  
- Bible Ch. 7 example **Celebration Room** — correct; garden path is `gardens`, not this destination.

---

## 2. Room Catalog 03 — retired as authority

[03 — Estate Room Catalog](./03%20-%20Estate%20Room%20Catalog.md) is **historical reference only**.

| Rule | Meaning |
|------|---------|
| **Do not** add places to Catalog 03 | Edit [SPARK_ESTATE_CANONICAL_REGISTRY](./SPARK_ESTATE_CANONICAL_REGISTRY.md) first |
| **Do not** cite Catalog 03 in implementation decisions | Use `lib/estate/canonicalEstateRegistry.ts` |
| **Catalog errors explicitly void** | Reading Nook → `library` alias; `gardens` as Celebration Room; Guidebook as `roomId` |

Catalog 03 may remain in the repo for archaeology and migration notes.

---

## 3. Reading Nook ≠ Library

### Canon decision

| Place | Id | Category | Role |
|-------|-----|----------|------|
| **Reading Nook** | `reading-nook` | Living Place | Peaceful pause beneath the stairs — conversation only |
| **The Library™** | `library` | Destination | Volumes, shelves, completed books — story library |

### Rules

- **No alias** may map Reading Nook to `library`.  
- **No alias** may map `library` to Reading Nook.  
- Main Staircase (`main-staircase`) connects to the nook landing — it does **not** substitute for the nook or the Library.  
- Library may share **art plate** with nook for V1 — that is a **visual** overlap, not a place merge.

### Voided (Catalog 03)

```text
Reading Nook (alias) → library   ❌ REMOVED
The Library™ / Reading Nook → single roomId   ❌ REMOVED
```

---

## 4. Wins simplification

### Retired

- **“Wins”** as a separate memory category, destination, or product surface in **Estate canon**.  
- **“Wins This Week”** / weekly win stats as Estate vocabulary (implementation may exist — not canon).  
- Alias **`my wins`** on Evidence Vault™.

### Canonical homes

| Content | Home | Id |
|---------|------|-----|
| Honored chapters, accomplishments, quiet pride | **Accomplishments Book™** | `accomplishments-shelf` |
| Proof, impact, people helped, difference made | **Evidence Vault™** | `evidence-vault` |
| Celebrating a moment, ringing the bell, marking today | **Celebration Room™** | `celebration-room` |

### Routing rules

| Member intent | Route |
|---------------|-------|
| `wins`, `my wins`, `show my wins`, `story of my wins` | **Celebration Room™** (default) |
| `accomplishments book`, `my accomplishments book`, `show me my accomplishments` | **Accomplishments Book™** (`accomplishments-shelf`) |
| `accomplishments` (bare) | **Celebration Room™** (honor context) |
| `proof`, `impact`, `people I helped`, `evidence vault`, `difference I made` | **Evidence Vault™** |
| Vague “I want to celebrate” | **Suggestion** — Celebration Room + Accomplishments Book (Phase F — stay option included) |

Shari never frames wins as scores, streaks, or weekly totals.

---

## 5. Guidebook™ — portable object, not a destination

### Canon decision

| | |
|-|-|
| **Guidebook™** | Portable **Estate Object** (Bible §4, Registry portable objects table) |
| **Not** | A `placeId`, walkable room, or Destination |

### Rules

- Orientation and map access happen **in any room** via the Guidebook object on a surface (Phase D `EstateObjectLayer`).  
- Bible Ch. 7 listing Guidebook under Destination Places is **errata** — treat as object carried in destinations, not a destination itself.  
- Remove Guidebook from destination inventories in historical catalogs.

### Shari language

- “Let me grab the guidebook.”  
- Not: “Opening the Guidebook room.”

---

## 6. My Thoughts — non-canonical until later

### Canon decision

**My Thoughts** is **not** an Estate place, Collection, or trademark in canon at P0.

| Experience | Canonical Estate home |
|------------|----------------------|
| Raw capture, brain dump, mental clutter | **Clear My Mind™** (`clear-my-mind`) |
| Reflective writing, journaling | **Journal™** (`journal`) |
| Organizing captured thoughts | **Inside Clear My Mind workflow** — implementation may use product label “My Thoughts”; **Shari and Estate routing do not** |

### Rules

- Do not add `my-thoughts` to Canonical Registry.  
- Do not route “open my thoughts” to a separate Estate place.  
- `resolveEstatePlace` does not target My Thoughts.  
- Seeds Planted™ (`seeds-planted`) remains the canonical Collection for early ideas **filed** from conversation — distinct from capture.

### Phrase status

| Phrase | P0 status |
|--------|-----------|
| My Thoughts | **Retired from Estate canon** — product implementation detail only |
| Clear My Mind™ | Canonical capture destination |
| Journal™ | Canonical reflection destination |

A future phase may promote an organize experience to a named Collection — until then, use Clear My Mind + Journal language in Estate docs and Shari voice.

---

## 7. Bible & taxonomy errata (summary)

| Bible / legacy | P0 correction |
|----------------|---------------|
| Ch. 7 — three place types | Add **Collection** as fourth type (matches Registry) |
| Ch. 7 — Guidebook as Destination | **Portable object** |
| Ch. 7 — Gazebo as Living Place | Journal™ uses gazebo scene; optional future `gazebo` id — not required for P0 |
| Section 03 — Library / Reading Nook merged | **Split** per §3 |
| Celebration Garden naming | **Celebration Room™** (`celebration-room`) |

Full Bible markdown files may be updated in a later editorial pass; **this errata binds** until then.

---

## 8. Registry changes (minimal — Phase P0)

| Change | File |
|--------|------|
| `celebration-garden` → `celebration-room` | `canonicalEstatePlaces.ts` |
| Legacy id map `celebration-garden` → `celebration-room` | `canonicalEstateRegistry.ts` |
| Wins / proof routing rules | `resolveEstatePlace.ts` |
| Section adapter key `celebration-room` | `canonicalPlaceSectionAdapter.ts` |
| Evidence Vault aliases — remove `my wins` | `canonicalEstatePlaces.ts` |
| Accomplishments shelf — specific book aliases only | `canonicalEstatePlaces.ts` |
| Clear My Mind expansion note — My Thoughts non-canon | `canonicalEstatePlaces.ts` |
| Canonical Registry doc sync | `SPARK_ESTATE_CANONICAL_REGISTRY.md` |

**Not in P0 scope:** renaming CSS files, component names, `AppSection` ids, or legacy `estateRoomRegistry` rows.

---

## 9. Memory architecture alignment

Update [SPARK_ESTATE_MEMORY_ARCHITECTURE](./SPARK_ESTATE_MEMORY_ARCHITECTURE.md):

- **Retire** § category **15. Wins** as standalone — fold into Accomplishments Book + Celebration Room ritual.  
- Evidence Vault owns **impact / proof / people helped**.  
- Celebration Room owns **marking and honoring** moments.  

---

## 10. Verification checklist (pre–Phase D.1)

- [x] `resolveCanonicalPlaceId("celebration-garden")` → `celebration-room`  
- [x] “Open the Celebration Room” → `celebration-room`  
- [x] “Go to the Reading Nook” → `reading-nook` (not `library`)  
- [x] “Take me to the library” → `library` (not `reading-nook`)  
- [x] “my wins” → `celebration-room`  
- [x] “proof of growth” → `evidence-vault`  
- [x] “show me my accomplishments” → `accomplishments-shelf`  
- [x] No canonical alias: reading nook → library  
- [x] Guidebook absent from `CANONICAL_ESTATE_REGISTRY` place list  

---

## Implementation status (P0 + D.1)

| Item | Status |
|------|--------|
| P0 errata document | **Complete** |
| `celebration-room` + legacy map | **Complete** |
| Wins routing | **Complete** |
| Phase D.1 `SparkEstateShell` | **Complete** — [PHASE_D1_RUNTIME_SHELL_REPORT](./PHASE_D1_RUNTIME_SHELL_REPORT.md) |

---

## Document control

| Version | Change |
|---------|--------|
| 1.0 | P0 canon errata — pre Phase D.1 |
| 1.1 | P0 verified; D.1 shell shipped |

**Next:** Phase D.2 — single conversation mount across shell navigation (approval required).
