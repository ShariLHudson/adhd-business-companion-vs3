# 001 — Repository Gap Analysis

**Audit baseline commit:** `9dc09da`  
**Repository:** `deploy/companion-app-v3`  
**Status:** Current repository audit  

**Spark Estate™ Companion App Intelligence Repository**  
**Analysis date:** 2026-07-11  
**Repository path:** `c:\Users\Shari\spark-ecosystem-v4\companion-app`  
**Companion audit:** [`000_MASTER_REPOSITORY_AUDIT.md`](./000_MASTER_REPOSITORY_AUDIT.md)  
**Read-only analysis:** Gaps and recommendations reflect baseline commit `9dc09da`.

---

## Executive summary

The companion-app repository contains **substantial intelligence content** spread across at least **four parallel namespaces** that are not yet unified under INT-000 governance:

1. **Approved Upload Set** (`.tmp-approved-upload/` — 172 files, **not ingested** into `docs/intelligence/`)
2. **Estate Recognition Library** (`docs/estate/recognition/library/` — 124 numbered docs, gaps 089–252)
3. **Visual Spark Studios / SPARK-OS** (`docs/visual-spark-studios/` — 29 discipline folders + 137 SPARK-numbered OS docs)
4. **Runtime mirrors** (`lib/estate/*.ts`, `lib/sparkCompanion/`, phase protocols in `docs/protocols/`)

INT-000 defines **10 intelligence layers** and **12 library prefixes**. Only **6 upload libraries** exist as folders; **4 first-class layers have no dedicated library folder** (HEI, CAP, MEM, EXEC). The largest structural risk is **ownership drift**: the same concerns (constitution, memory, therapy-dog behavior, capabilities, daily experience) are defined in multiple places with no single authoritative merge.

---

## Table of contents

1. [What libraries are missing?](#1-what-libraries-are-missing)
2. [What documents are referenced but don't exist?](#2-what-documents-are-referenced-but-dont-exist)
3. [What files appear duplicated?](#3-what-files-appear-duplicated)
4. [What files belong in different libraries?](#4-what-files-belong-in-different-libraries)
5. [Which documents should be merged?](#5-which-documents-should-be-merged)
6. [Which documents should be split?](#6-which-documents-should-be-split)
7. [What should be built next?](#7-what-should-be-built-next)

---

## 1. What libraries are missing?

Per **INT-000** naming rules, the following **first-class intelligence libraries** are defined but **do not exist** as dedicated, numbered upload folders in the repository:

| Library prefix | INT-000 layer | Expected role | Repository status |
|----------------|---------------|---------------|-------------------|
| **HEI** | Human Experience Intelligence | Fear, grief, conflict, self-doubt, identity, social exhaustion | **Missing entirely.** `CONV-107` held for future `HEI-000`. |
| **CAP** | Capability Intelligence | What each capability does, inputs/outputs, permissions, limits | **Missing as library.** Fragmented in recognition `131–140`, `docs-companion-intelligence/`, `lib/sparkSharedCapabilities/`. |
| **MEM** | Memory & Context Intelligence | Save rules, confidence, retrieval, correction, conflict resolution | **Missing as library.** Partial in `COMP-*`, recognition `128`, `lib/sparkCoreIntelligence/memoryEngine/`. |
| **EXEC** | Execution Intelligence | Intent → completed action, orchestration, tool selection, retry | **Missing as library.** Partial in `CONV-021`, protocols, `lib/frictionlessActionLayer/`. |
| **EST** | Estate Intelligence | Rooms, chamber members, navigation, room-to-capability map | **Partial.** One file (`EST-001`) in recognition library; most estate content is unnumbered `docs/estate/` + protocols. |
| **FND** | Founder Intelligence (product research) | Research-to-action, coverage gaps, product implications | **Partial.** `ADHD-033`, founder dashboards, `docs/founder/` — not a numbered FND library. |

### Upload libraries present but not canonical

The **Approved Upload Set** exists only in `.tmp-approved-upload/` (staging). There is **no** `docs/intelligence/` folder. Until ingested, the INT-000-governed libraries are not the repository's canonical doc location.

| Library | Staging location | Files | Completeness |
|---------|------------------|------:|--------------|
| Intelligence Architecture | `.tmp-approved-upload/01_Intelligence_Architecture/` | 3 | Complete (INT-000–002) |
| ADHD Intelligence | `.tmp-approved-upload/02_ADHD_Intelligence/` | 40 | Complete ADHD-000–038 |
| Conversation Intelligence | `.tmp-approved-upload/03_Conversation_Intelligence/` | 107 | Missing CONV-000–008; CONV-107 held |
| Founder Experience Intelligence | `.tmp-approved-upload/04_Founder_Experience_Intelligence/` | 7 | Small but complete FEI-000–006 |
| Companion Intelligence | `.tmp-approved-upload/05_Companion_Intelligence/` | 5 | Seed set only (COMP-000–004) |
| Chamber & Anticipatory | `.tmp-approved-upload/06_Chamber_and_Anticipatory_Intelligence/` | 4 | Seed set (CHAM-000–002, INT-003) |
| Growth Intelligence | `.tmp-approved-upload/07_Growth_Intelligence/` | 5 | Seed set (GROW-000–004) |
| Boardroom Intelligence | `.tmp-approved-upload/08_Boardroom_Intelligence/` | 1 | Single doc (BOARD-000) |

### Parallel libraries not in INT-000 upload set

These exist in-repo but sit **outside** the Approved Upload Set hierarchy:

| Library | Location | Notes |
|---------|----------|-------|
| Estate Recognition Library | `docs/estate/recognition/library/` | 124 files; mixed UX, capability, architecture, visual engine |
| Spark Intelligence OS | `docs/visual-spark-studios/Spark-Intelligence-Operating-System/` | 137 SPARK-numbered docs |
| Visual Spark Studios disciplines | `docs/visual-spark-studios/*/` (29 folders) | Discipline-specific intelligence (~22–63 MD each) |
| Companion OS (legacy) | `docs-companion-intelligence/` | 7 numbered docs (`00`, `21–26`) |
| Spark intelligence foundation | `spark-intelligence-foundation/` | Early foundation markdown |
| Phase protocols | `docs/protocols/` | 35 SPARK_ESTATE phase specs + chamber phases |

**Gap:** No master index reconciles INT-000 libraries with recognition `089–252`, SPARK-OS, and phase protocols. `100_SPARK_ESTATE_MASTER_MANIFEST.md` indexes recognition numbers only; it does not list CONV/ADHD/HEI/CAP/MEM/EXEC.

---

## 2. What documents are referenced but don't exist?

### Explicitly referenced, confirmed absent

| Referenced ID / document | Referenced in | Status |
|--------------------------|---------------|--------|
| **HEI-000** `Human_Experience_Intelligence_Overview.md` | INT-002, INT-000 layer map | **Does not exist.** Planned replacement for CONV-107. |
| **CONV-107** | INT-002, UPLOAD_MANIFEST | **Excluded** from upload; content belongs in HEI. |
| **CONV-000** through **CONV-008** | INT-002 ("upload CONV-000 through CONV-116") | **Do not exist.** Upload set starts at CONV-009. |
| **Recognition 141–150** | `100_SPARK_ESTATE_MASTER_MANIFEST` ("Evaluation / GPT extraction prompts") | **None present** in `docs/estate/recognition/library/`. |
| **Recognition 157–161, 164–170, 173–180** | Numeric series gaps in audit | **Absent** (30 slots in 089–185 range). |
| **Recognition 202, 213, 222–223, 225–226, 231–235, 238, 241** | Extended 186–252 scan | **Absent** (13 additional slots). |

### Referenced in recognition README priority chain — partial

`docs/estate/recognition/README.md` cites a priority order including docs that use **old numbering** or live outside `library/`:

| Cited reference | Expected | Found |
|-----------------|----------|-------|
| SPARK_RECOGNITION_ENGINE / **001** | `001` seed doc | `docs/estate/recognition/001_SPARK_RECOGNITION_ENGINE.md` ✓ (parent folder, not `library/`) |
| **002** Room Interaction Standard | `002_*` | **Not found** as numbered file in recognition tree |
| **003** Unified Recognition System | `003_*` | **Not found** as numbered file |
| **030** Recognition Data Model | `030_*` | **Not found** in library (schema work may be in `117_*`) |
| **051–055** Room implementation specs | numbered room specs | **Not found** under those numbers (UX specs exist as `101–105`) |
| **058** Shared Schema | `058_*` | **Not found** (partial overlap with `117_RECOGNITION_DATABASE_SCHEMA`) |

### Referenced in INT-000 completion standard — no owning doc set

INT-000 states a capability is complete only when **Capability, Estate, Conversation, Execution, Memory, Companion, ADHD/Founder/Human, and Founder Intelligence** all have applicable documents. For most live features, **CAP, EXEC, MEM, and HEI** documents do not exist as libraries — only runtime code and fragmented specs.

### Referenced in runtime / handoff but stale vs Spark Estate

| Document | Issue |
|----------|-------|
| `HANDOFF.md` | Describes **Chat / Make / Do** three-environment model — predates Spark Estate room architecture and INT-000 layers. Still at repo root; conflicts with `090_DAILY_EXPERIENCE_STANDARD`, `093_COMPANION_OVER_FEATURES`. |
| `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json` | Place manifest; may not align with `100_SPARK_ESTATE_MASTER_MANIFEST` section map. |

### CONV patterns that imply HEI ownership (no HEI home)

CONV-089 through CONV-106 cover human-experience themes (protective patterns, masking, guilt, identity, sensory profile, life transitions). Per INT-002, **CONV-107** was the bridge to HEI. These patterns **exist** but sit in Conversation Intelligence where INT-000 says **Human Experience Intelligence** should own the research/framing (Conversation owns only response scripts).

---

## 3. What files appear duplicated?

The master audit found **152 duplicate filename groups** (same basename, different paths). Below: duplicates that matter for **intelligence governance** (excluding benign `index.ts`, `types.ts`, `route.ts` scaffolding).

### Markdown intelligence duplicates (high priority)

| Filename pattern | Copies | Locations | Risk |
|------------------|-------:|-----------|------|
| `SPARK_ESTATE_*_PHASE*.md` | 2 each | `docs/protocols/` ↔ `spark-notes-files/` | **Archive drift** — 20+ estate phase specs duplicated verbatim |
| `CHAMBER_OF_MOMENTUM_*_PHASE*.md` | 2 each | `docs/protocols/` ↔ `spark-notes-files/` | Same |
| `CONSTITUTION.md` | 2 | `lib/characterOfShari/`, `lib/shariVoiceBible/` | **Competing Shari constitution sources** |
| `constitution.ts` | 2+ | `lib/companionBrain/`, `lib/companionUniverse/` | Runtime constitution fragmentation |
| `creative-studio.md` | 2 | `docs/estate/`, `docs/room-lookbooks/` | Same topic, two homes |
| `SPARK_COMPANION_RUNTIME_ARCHITECTURE` | 3+ | `docs/`, `docs/estate/recognition/library/151_*`, `lib/` implementations | **Three-layer mirror** without supersession header |

### Duplicate document numbers (not just filenames)

| Number | Conflict | Files |
|--------|----------|-------|
| **140** | Two different docs share **140** | `140_CAPABILITY_LIBRARY_BUILD_ORDER.md` + `140_SHARED_CAPABILITY_LIBRARY_INDEX.md` |
| **091** (semantic) | Constitution vs conversation pattern | `091_SPARK_ESTATE_CONSTITUTION.md` vs `CONV-091_Pattern_Expecting_the_Worst.md` (different prefixes, same number — cross-library confusion) |
| **CANON-030** | Two canonical docs | `CANON-030_BREATHE.md` + `CANON-030_PRODUCT_ENCYCLOPEDIA.md` (same prefix index) |

### Duplicate purpose (content overlap, different files)

| Topic | File A | File B | Notes |
|-------|--------|--------|-------|
| Therapy-dog behavior | `CONV-012_Therapy_Dog_Conversational_Behavior_Standard.md` | `ADHD-028_Therapy_Dog_Companion_Behavior_Framework.md` | CONV owns scripts; ADHD owns lens — **must cross-link, not duplicate rules** |
| Daily companion experience | `090_DAILY_EXPERIENCE_STANDARD.md` | `docs/protocols/SPARK_ESTATE_DAILY_COMPANION_EXPERIENCE_SPECIFICATION_PHASE24.md` | Philosophy vs phase implementation spec |
| Constitution / non-negotiables | `091_SPARK_ESTATE_CONSTITUTION.md` | `lib/sparkCompanion/sparkEstateConstitution/*` | Doc vs runtime hints — not wired together |
| Memory & trust | `COMP-000`–`COMP-003` | `128_MEMORY_DECISION_FRAMEWORK.md` | MEM layer split across Companion and recognition |
| Capability facade | `139_COMPANION_CAPABILITY_FACADE.md` | `lib/sparkSharedCapabilities/facade.ts` | Doc exists; main chat path bypasses facade |
| Master manifest | `100_SPARK_ESTATE_MASTER_MANIFEST.md` | `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json` | Two "master" indexes with different scope |

### Benign duplicates (low action)

- **30× `README.md`** across doc subfolders — expected index files.
- **427× `index.ts`, 233× `types.ts`** — normal module structure.
- **`README.txt`** in `public/audio/*` — asset folder placeholders.

---

## 4. What files belong in different libraries?

Per INT-000, each layer owns one responsibility. The following files are in the **wrong library** or **wrong namespace** relative to INT-000 rules:

### Should move to Human Experience Intelligence (HEI) when created

| Current location | Files | Reason |
|------------------|-------|--------|
| `.tmp-approved-upload/03_Conversation_Intelligence/` | CONV-089 – CONV-106 (protective patterns, sensory, masking, guilt, identity, ambiguity, life transitions) | INT-000: Human Experience owns fear, conflict, self-doubt, identity — **not** conversation scripts. Keep response patterns in CONV as *references* to HEI. |
| Held / excluded | CONV-107 content | INT-002 explicitly assigns to `HEI-000`. |

### Should move to Capability Intelligence (CAP) when created

| Current location | Files | Reason |
|------------------|-------|--------|
| `docs/estate/recognition/library/` | `131–140` (Shared Capability Library) | INT-000 §6: Capability Intelligence owns capability contracts — not Recognition/Estate library. |
| `docs-companion-intelligence/` | `22_App_Feature_Knowledge.md`, `25_Capability_Registration_And_12_10_Readiness.md` | Feature knowledge is CAP, not legacy "companion OS". |
| `lib/sparkSharedCapabilities/catalog.ts` | runtime | Implementation of CAP — docs should live in `docs/intelligence/CAP/`. |

### Should move to Memory & Context Intelligence (MEM) when created

| Current location | Files | Reason |
|------------------|-------|--------|
| `docs/estate/recognition/library/128_MEMORY_DECISION_FRAMEWORK.md` | recognition library | MEM layer per INT-000 §8. |
| `.tmp-approved-upload/05_Companion_Intelligence/COMP-000`–`COMP-003` | companion upload | COMP owns *how memory feels*; MEM owns *what may be saved and when*. Split trust principles (COMP) from storage/retrieval rules (MEM). |
| `ADHD-019_Communication_Follow_Up_and_Conversation_Memory.md` | ADHD library | ADHD owns friction research; MEM owns conversation memory rules. |

### Should move to Execution Intelligence (EXEC) when created

| Current location | Files | Reason |
|------------------|-------|--------|
| `.tmp-approved-upload/03_Conversation_Intelligence/CONV-021_Conversation_to_Action_Architecture.md` | CONV | EXEC owns orchestration; CONV owns confirmation dialogue only. |
| `docs/protocols/SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_*` | protocols | Execution journey — cross-link from CONV, own in EXEC. |
| `lib/frictionlessActionLayer.ts`, `lib/conversationIntelligence/orchestrator.ts` | runtime | EXEC implementations. |

### Should move to Estate Intelligence (EST) when formalized

| Current location | Files | Reason |
|------------------|-------|--------|
| `docs/estate/recognition/library/101–105` | UX room specs | EST owns where capabilities live; Recognition wing consumes EST. |
| `docs/estate/recognition/library/153_SPARK_ESTATE_ROOM_ACCESS_MATRIX.md` | recognition | Pure estate navigation. |
| `CHAM-000`–`CHAM-002` | chamber upload | Chamber is EST + entry routing; keep CHAM folder but EST should own room-to-capability map. |

### Should not live in Conversation Intelligence

| File | Belongs in |
|------|------------|
| `ADHD-028_Therapy_Dog_Companion_Behavior_Framework.md` | ADHD (research/lens) + COMP (personality) — CONV-012 should *reference* both, not redefine |
| `CONV-091` (Expecting the Worst pattern) | HEI for psychology; CONV keeps response template only — **not** constitution (091 constitution is separate doc) |

### Approved upload set — wrong staging location

| Issue | Action |
|-------|--------|
| Entire `.tmp-approved-upload/` tree | Should be canonical at `docs/intelligence/` per INT-002 upload order |
| `INT-003` inside `06_Chamber_and_Anticipatory_Intelligence/` | INT docs belong in `01_Intelligence_Architecture/` (or cross-linked from CHAM) |

---

## 5. Which documents should be merged?

Merging reduces drift. Recommended merges (doc-level, not file moves yet):

### Priority 1 — Governance merges

| Merge target | Source documents | Rationale |
|--------------|------------------|-----------|
| **Single Constitution authority** | `091_SPARK_ESTATE_CONSTITUTION.md` + `lib/sparkCompanion/sparkEstateConstitution/*` + `lib/characterOfShari/CONSTITUTION.md` + `lib/shariVoiceBible/CONSTITUTION.md` | One non-negotiables doc (EST or INT) + thin runtime hint adapter. Eliminate four constitution sources. |
| **Single runtime architecture** | `151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md` + `docs/SPARK_COMPANION_RUNTIME_ARCHITECTURE.md` | Manifest cites both; pick one canonical path, mark the other `Supersedes:` or symlink index. |
| **Capability library index** | `140_CAPABILITY_LIBRARY_BUILD_ORDER.md` + `140_SHARED_CAPABILITY_LIBRARY_INDEX.md` | **Duplicate number 140** — merge into one `CAP-000` index when CAP library is created. |

### Priority 2 — Cross-library link merges (not full text merge)

| Topic | Documents | Merge approach |
|-------|-----------|----------------|
| Therapy-dog standard | CONV-012 + ADHD-028 | **Merge into one cross-linked pair:** ADHD-028 = behavior model (owner: ADHD); CONV-012 = conversational application (owner: CONV); shared appendix for Notice/Settle/Stay/Guide. |
| Daily experience | 090 + CONV-013 + PHASE24 protocol | **Merge index:** 090 owns philosophy; CONV-013 owns conversation model; PHASE24 owns implementation checklist — single `DAILY_EXPERIENCE_INDEX.md` linking all three. |
| Memory | COMP-000–003 + 128 + MEM (future) | **Merge rules table:** COMP = trust tone; 128 = decision framework; MEM = storage/retrieval — one matrix, three owners. |

### Priority 3 — Archive consolidation

| Merge / deprecate | Action |
|-------------------|--------|
| `spark-notes-files/SPARK_ESTATE_*` duplicates | Mark `spark-notes-files/` as **archive**; `docs/protocols/` is canonical. Add `Superseded by:` header in archive copies or remove from search index. |
| `docs-companion-intelligence/21_Companion_Constitution.md` | Merge into COMP library or supersede with `091` + COMP-000. |

---

## 6. Which documents should be split?

### Recognition library — overloaded mixed library

`docs/estate/recognition/library/` combines **seven concerns** that INT-000 assigns to different layers. Split when ingesting into `docs/intelligence/`:

| Current range | INT-000 owner | Proposed split |
|---------------|---------------|----------------|
| 089–100 | Estate experience + governance philosophy | Keep as **EST-Experience-Standards** or link to ARCH manifest |
| 101–130 | Estate UX + conversation playbooks | Split: **EST** (room UX) vs **CONV** (dialogue playbooks 111–113, 130) |
| 131–140 | Capability Intelligence | Move to **CAP-*** library |
| 151–163 | Estate + media architecture | **EST** + **Execution** routing |
| 184–221 | Visual Engine / Cartographers | **Capability** (Visual Engine) — separate from Recognition |
| 245–252 | Evidence intelligence | **Recognition engine** proper — keep under `docs/estate/recognition/` |

### Conversation patterns — early-form records

INT-002 states CONV-027 through CONV-116 should eventually split each pattern into:

- trigger
- hidden need
- context to retrieve / ignore
- exact response pattern
- action
- UI behavior
- memory behavior
- prevention / recovery
- testing criteria

**Do not merge** patterns together; **split** each CONV-028+ into a folder or multi-section template when promoting from "early-form" to "implementation-ready."

### ADHD library — already well-factored

ADHD-000–027 (friction), 028–032 (companion/prevention), 033–038 (founder research) — structure is sound. **Split only** if ADHD-033 (Founder Intelligence research) moves to **FND** library.

### Phase protocols vs philosophy docs

Each `docs/protocols/SPARK_ESTATE_*_PHASE*.md` that duplicates content in recognition `090–099` should be split into:

1. **Philosophy standard** (short, stable)
2. **Implementation specification** (phase doc, mutable)

---

## 7. What should be built next?

Ordered by **INT-000 processing flow** and **repository gap severity**. Each item is doc + wiring where noted.

### Phase A — Repository structure (docs only, no runtime)

| # | Build | Why |
|---|-------|-----|
| A1 | **Ingest** `.tmp-approved-upload/` → `docs/intelligence/` preserving folder structure | Makes INT-000 libraries canonical; removes staging ambiguity |
| A2 | Create **`docs/intelligence/README.md`** as master index linking to `000_MASTER_REPOSITORY_AUDIT` and this gap analysis | Single entry point for agents and architects |
| A3 | Create **`HEI-000_Human_Experience_Intelligence_Overview.md`** from held CONV-107 content | Unblocks CONV-089–106 ownership split |
| A4 | Create seed libraries: **`CAP-000`**, **`MEM-000`**, **`EXEC-000`**, **`EST-000`** (or rename EST-001 → EST-000 index) | Satisfies INT-000 layer map |
| A5 | Resolve **duplicate 140** → single capability index | Prevents manifest collision |
| A6 | Mark **`spark-notes-files/`** duplicates as archive; update recognition README priority chain (002, 003, 030, 051–055, 058) as *found / not found / superseded by* | Stops false references |

### Phase B — Governance wiring (highest runtime impact)

| # | Build | Sources | Runtime target |
|---|-------|---------|----------------|
| B1 | Wire **constitution hint** on every chat turn | `091`, COMP, `sparkEstateConstitutionHintForChat` | `buildSparkCompanionHint` |
| B2 | Wire **daily companion engine** | `090`, CONV-013, PHASE24 | `CompanionPageClient` ← `sparkEstateDailyCompanionExperience` |
| B3 | Fix **Welcome Home** first launch | CONV-051, ADHD-003 | Call `completeWelcomeHomeFirstLaunch()`; align choices |
| B4 | Wire **memory engine** | COMP-000–003, 128, MEM-000 | `runCoreMemory()` on chat API path |
| B5 | Enable **capability facade** on main chat | CAP 131–139, `resolveCompanionCapabilityHelp` | `shariCompanionEngine` |

### Phase C — Conversation intelligence Pass 2

| # | Build | Sources |
|---|-------|---------|
| C1 | Expand `conversationIntelligence/orchestrator` from priority shell to **pattern registry** | CONV-026, CONV-028–032 (overwhelm, start, decide, take-care) |
| C2 | Add **return/absence** and **end-of-day** patterns | CONV-029, CONV-061 |
| C3 | Add **founder overload** routing | CONV-115, FEI-002, FEI-006 |
| C4 | Cross-link **therapy-dog** CONV-012 ↔ ADHD-028 in registry | Single behavior pipeline |

### Phase D — Fill recognition library gaps (or mark reserved)

| Range | Action |
|-------|--------|
| 141–150 | Create evaluation prompt docs **or** mark `Reserved` in manifest (stop implying they exist) |
| 157–180 | Assign to Scenes/Soundscapes/Media **or** mark reserved |
| 202, 213, 222+ | Complete visual/cartographer series **or** update `100_SPARK_ESTATE_MASTER_MANIFEST` to reflect actual range |

### Phase E — Consolidation (after B–C stable)

| # | Build |
|---|-------|
| E1 | Split recognition library per Section 6 into INT-000-aligned folders |
| E2 | Supersede `HANDOFF.md` Chat/Make/Do model with Spark Estate daily experience + link to `090` |
| E3 | Unify `ESTATE_PLACE_MASTER_MANIFEST.json` with `100_SPARK_ESTATE_MASTER_MANIFEST` |
| E4 | Wire `sparkRecognitionEngine` as recognition SoT (GROW + 245–252) |

---

## Recommended immediate next step

**A1 + A2 + B1 + B2** in one sprint:

1. Canonicalize approved intelligence docs under `docs/intelligence/`
2. Wire constitution and daily experience on the live `/companion` path
3. Publish `HEI-000` stub and `CAP-000` index to stop INT-000 layer violations

This closes the largest gap between **what the repository says** (172 approved intelligence docs + 124 recognition docs) and **what the app actually uses** (~30–35% of upload set on main chat path, per prior runtime audit).

---

## Cross-reference

| Document | Role |
|----------|------|
| [`000_MASTER_REPOSITORY_AUDIT.md`](./000_MASTER_REPOSITORY_AUDIT.md) | Full inventory, file lists, duplicate groups |
| [`.audit-data.json`](./.audit-data.json) | Machine-readable audit source |
| [`.tmp-approved-upload/UPLOAD_MANIFEST.md`](./.tmp-approved-upload/UPLOAD_MANIFEST.md) | Approved upload set manifest |
| [`.tmp-approved-upload/01_Intelligence_Architecture/INT-000_*.md`](./.tmp-approved-upload/01_Intelligence_Architecture/INT-000_Spark_Intelligence_Architecture_and_Source_of_Truth.md) | Source-of-truth governance |

---

*End of repository gap analysis.*
