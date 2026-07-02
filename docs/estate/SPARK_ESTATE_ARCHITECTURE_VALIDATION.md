# Spark Estate Architecture Validation™

| Field | Value |
|-------|-------|
| **Phase** | H — Final architecture review (documentation only) |
| **Status** | **Binding assessment** before implementation begins |
| **Scope** | Seven authorities read as **one system** — not seven separate audits |
| **Date** | 2026-06-30 |

---

## Documents under review (one system)

| Layer | Document | Role in the whole |
|-------|----------|-------------------|
| Law | [01 — Spark Estate Constitution](./01%20-%20Spark%20Estate%20Constitution.md) | Immutable principles |
| Feeling | [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) | Presence, silence, discovery |
| Canon | [Spark Estate Bible](./Spark%20Estate%20Bible.md) | What is true — places, objects, language |
| Inventory | [SPARK_ESTATE_CANONICAL_REGISTRY](./SPARK_ESTATE_CANONICAL_REGISTRY.md) | 42 places + objects — routing truth |
| Runtime shell | [PHASE_D_UNIFIED_ESTATE_SHELL](./PHASE_D_UNIFIED_ESTATE_SHELL.md) | One scene, one conversation panel |
| Companion voice | [PHASE_F_SHARI_COMPANION_ENGINE](./PHASE_F_SHARI_COMPANION_ENGINE.md) | How Shari behaves everywhere |
| Memory | [SPARK_ESTATE_MEMORY_ARCHITECTURE](./SPARK_ESTATE_MEMORY_ARCHITECTURE.md) | Stories, books, lifecycles, recall |

**Supporting runtime (partially built):** Phase B registry · Phase C `goToPlace` · Phase E chrome policy.

**Verdict:** The system is **coherent in intent** and **strong in philosophy**. It is **not yet coherent in implementation** or in every subordinate document. The world works as one estate **when canon Phases A–G are followed**; legacy code, the Room Catalog, and a handful of unresolved place/memory boundaries are the main fractures.

---

## System coherence summary

```text
                    ┌─────────────────────┐
                    │    Constitution     │
                    │  (relationship law) │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   Living Guide            Bible Canon          Memory Arch (G)
   (feeling)               (facts)              (stories)
         │                     │                     │
         └──────────┬──────────┴──────────┬──────────┘
                    ▼                     ▼
            Canonical Registry (A)   Shari Engine (F)
                    │                     │
                    └──────────┬──────────┘
                               ▼
                    Unified Shell (D) ← NOT BUILT
                               │
                               ▼
                    Runtime (B/C/E partial)
```

**What holds together:** One relationship · conversation continuity · places-not-features · quiet celebration · permission memory · Library ≠ Institute · Living Places without software arrival.

**What does not yet hold together:** 27-vs-42 registry · dual shell stacks · Celebration Room naming · wins/accomplishments/vault routing · Bible 3-type vs Registry 4-type taxonomy · subordinate docs (03, 07) contradicting canon · Guidebook as place vs object · product vocabulary (My Thoughts, brain-dump) leaking in.

---

## Architecture strengths

### 1. Unified north star
Every authority repeats the same sentence: *Spark Estate is not a place you use — it is a place where you are welcomed home.* Constitution, Living Guide, Bible, Phase F, and Memory Architecture are aligned on **relationship over product**.

### 2. Clear separation of concerns across phases
| Concern | Owner | Status |
|---------|-------|--------|
| What exists | Canonical Registry | Defined (42 places) |
| How to move | `goToPlace` / `resolveEstatePlace` | Partially implemented |
| How it feels on arrival | Registry category + chrome policy | Living Place law encoded |
| How Shari speaks | Phase F + Specs 105–119 | Documented |
| What persists | Phase G + Spec 112/117 | Documented |
| How it renders | Phase D shell | **Designed, not built** |

### 3. Critical distinctions are explicit and repeated
Registry “never merge” table (Library/Institute, Conservatory/Clear My Mind, Gardens/Celebration Garden, Greenhouse/Growth Profile, Reading Nook/Library) appears in canon, authority manifest, and Memory Architecture. These are the right fault lines.

### 4. Memory model matches companion philosophy
Phase G’s stories-not-data model, permission gates, and natural recall align with Phase F memory laws and Spec 112. Estate Memory™ (L5 atmosphere) vs Brain (facts) vs story containers (books) is the right three-layer split **if implemented as one lineage graph**.

### 5. Navigation primitive is estate-native
Phase C’s `goToPlace` metadata (`preserveConversation`, `showTitlePlaque`, `showInvitationGrid`) expresses Constitution Art. VIII and Phase F C3/C6 without inventing a second navigation language.

### 6. Anti-gamification is consistent
Constitution Art. XI, Bible Ch. 16, Phase F celebration laws, and Phase G collection growth rules all forbid points, streaks, and loud achievement UI.

### 7. Conversation-first stack is frozen and compatible
Specs 106–119 and Wisdom Layer 120–131 do not fight the Estate docs; Phase F correctly positions itself as the **Estate-facing expression** of the frozen conversation stack.

---

## Architecture weaknesses

### Conflicting statements

| # | Conflict | Document A | Document B | Resolution needed |
|---|----------|------------|------------|-------------------|
| C1 | **Place taxonomy count** | Bible Ch. 7: **three** kinds (Living, Destination, Transitional) | Canonical Registry: **four** (+ Collection) | Amend Bible Ch. 7 or add canonical addendum: Collections are curated holdings, not walkable rooms |
| C2 | **Celebration Room vs Celebration Garden** | Constitution Art. V, Living Guide feeling table: **Celebration Room** | Registry: only `celebration-garden`; Phase C aliases “Celebration Room” → garden | Canon name: **Celebration Garden** (place) with optional “Celebration Room” as **alias only** — update Constitution examples |
| C3 | **Guidebook as place** | Bible Ch. 7 lists Guidebook under **Destination Places** | Registry + Bible §4: Guidebook is **portable object**, not `placeId` | Bible Ch. 7 errata — Guidebook is object; orientation happens in any room |
| C4 | **Gazebo as place** | Bible Ch. 7 Living examples: **Gazebo** | Registry: no `gazebo` id; Journal uses gazebo **background** | Either add `gazebo` Living Place or remove Gazebo from Bible examples |
| C5 | **Conservatory purpose** | Room Catalog 03: Conservatory = “clear head” | Registry: Conservatory = **Living Place**; Clear My Mind = **capture Destination** | Registry wins — update Catalog 03 and Bible grounds copy |
| C6 | **GlobalEstateMenu** | Phase D: **Deprecate** as primary navigation | Phase E: **Retain** floating menu for settings/account | Reconcile: menu is **exception chrome** (account only), not estate map — document in authority manifest |
| C7 | **Reading Nook vs Library** | Room Catalog 03: Reading Nook **aliases to `library`** | Registry: **separate** `reading-nook` (Living) and `library` (Destination) | Catalog 03 is **wrong** — delete alias row; stairway landing ≠ library |
| C8 | **Gardens room id** | Room Catalog: `gardens` = Celebration Room | Registry: `gardens` = Living Place; `celebration-garden` = ritual Destination | Catalog **`gardens` misuse** — align to registry |
| C9 | **Environment invitation vs immediate go** | Spec 108: three choices (Yes · Stay · Map) on **suggestions** | Phase F C3: named place = **go immediately** | Not a true conflict — clarify: **explicit name → go**; **feeling only → suggest with stay option** |
| C10 | **Estate Guide vs Guidebook™** | Bible Ch. 12–13: “Estate Guide” | Objects index: **Guidebook™** | Single trademark: **Spark Estate Guidebook™** |

### Duplicate concepts

| Area | Duplicates | Risk |
|------|------------|------|
| **Wins** | Memory category “Wins”; Evidence Vault aliases “my wins”; Accomplishments aliases “story of my wins” | Member asks “show my wins” — three valid homes |
| **Impact** | Impact Collection™ (book); Evidence Vault™ (place); Acts of Kindness (category) | Same story filed twice without lineage rules |
| **Knowledge** | Knowledge Cards; Knowledge Collection™ (volume); Institute Cabinet; Library shelves | Unclear when card becomes volume vs shelf |
| **Growth** | Growth Profile™ collection; Momentum Institute; Capability Graph (OS); Growth Journal naming | “How am I growing?” routes ambiguously |
| **Ideas** | Seeds Planted™; Ideas Worth Revisiting; My Thoughts (product); Greenhouse | Product vocabulary outside canon |
| **Profile** | My Estate™ collection; Estate Preferences; Memory Center; `my-estate` scene | Settings vs story vs preferences overlap |
| **Reflection** | Journal™; Clear My Mind™; Conservatory Living Place | “I need to think” vs “brain dump” vs “reflect” overlap |
| **Coaching destinations** | Stables™, Momentum Builder™, Decision Compass™, Goals & Projects | All `coaching` / stuck-adjacent — `resolveEstatePlace` must rank by intent |
| **Peaceful calm** | `peaceful-places`, `conservatory`, `reading-nook`, `seat-at-pond`, `woodland-path` | Feeling “quiet” returns 3+ suggestions — acceptable if ranked, confusing if rotating |
| **Registry files** | `estateRoomRegistry` (27), `canonicalEstateRegistry` (42), section maps, alias registries | Dual truth until migration completes |

### Missing definitions

| Gap | Impact |
|-----|--------|
| **Collection navigation contract** | How `goToPlace("institute-cabinet")` differs from visiting Institute then filing — not specified in Phase C/D |
| **Book vs Collection vs Destination** | When is Portfolio a folio on a desk vs `portfolio` place vs Library volume? |
| **My Thoughts™ canonical mapping** | Referenced in Memory G + Clear My Mind notes; **no placeId** or object page |
| **Conversation save artifact** | Phase G L3 “conversation summary” — no Estate object (Letter? Ribbon? Chapter?) |
| **Discovery Key™ behavior** | Bible Ch. 14 — unlocks experiences; no registry trigger list |
| **Scene object anchor spec** | Phase D proposes `EstateObjectAnchor` — no per-place coordinate manifest |
| **Start New Conversation / Start New Day** | Phase G references both; not in Constitution or Phase F |
| **Spec 112 ↔ Phase G level map** | Business/Project/Relationship/Session vs L0–L5 — no official mapping table |
| **Bible object pages** | §4 index: ~15 objects **pending** — only Guidebook has full page |
| **Welcome Home vs Sunroom** | Two entry Living Places — first-visit routing undefined |
| **Game Room™ vs anti-gamification** | Allowed “playful reset” vs forbidden self-worth gamification — boundary rules thin |

### Contradictory room behavior

| Place | Canon says | Legacy / subordinate says | Status |
|-------|------------|---------------------------|--------|
| **Living Places** | No plaque, no grid (Art. VIII; Phase E) | `estateRoomInvitationCatalog`, immersion walkthrough still show grids | **Code debt** |
| **Conservatory** | Living — ambience only | Shared butterfly asset with Clear My Mind; Catalog says “clear head” workflow | **Art + behavior** |
| **Library** | Destination — volumes | Catalog merged Reading Nook into `library` | **Catalog wrong** |
| **Celebration** | Garden = ritual; Gardens = walk | Catalog used `gardens` for Celebration Room | **Id collision** |
| **Destinations** | `object-invitation` not feature menu | Dedicated shells (Institute, Stables) still own layout | **Phase D not built** |
| **Direct nav on `home` section** | Estate chrome active (Phase E fix) | Was broken pre-E — verify all living ids | **Partially fixed** |

### Inconsistent terminology

| Term | Variants found | Canonical term |
|------|----------------|----------------|
| Estate guide | Estate Guide, Guidebook, Spark Estate Guidebook™ | **Guidebook™** |
| Celebration | Celebration Room, Celebration Garden, All Out Celebration | **Celebration Garden** (place); Room = alias |
| Library | growth-library, story library, reading nook | **The Library™** (`library`) |
| Evidence | evidence-bank, proof of growth | **Evidence Vault™** |
| Capture | brain-dump, clear head, conservatory | **Clear My Mind™** (capture); **Conservatory™** (living) |
| Institute | entrepreneur development center, lessons, modules | **Momentum Institute™** |
| Place types | conversation / living / destination (Catalog 03) | Living Place · Destination · Collection · Transition Space |
| Sections vs places | `AppSection` ids (`brain-dump`, `growth-profile`) | `canonical placeId` only at Estate layer |

### Missing architectural decisions

1. **Single wins home** — Accomplishments Book vs Vault vs both with lineage?  
2. **Celebration Room** — permanent alias only, or future separate interior room?  
3. **My Thoughts** — Collection, Destination, or Brain-only (no Estate place)?  
4. **GlobalEstateMenu** — diegetic object vs minimal floating exception?  
5. **Collection entry** — always via parent Destination, or direct `goToPlace`?  
6. **Volume completion ritual** — who initiates: member, Shari, or system trigger?  
7. **First visit path** — `welcome-home` vs `sunroom` vs both seasonal?  
8. **Peaceful Places** — hub that sub-places resolve into, or deprecated in favor of atomic places?  
9. **Capability growth surface** — Growth Profile only, or also Institute graduation?  
10. **Frozen conversation stack vs Estate** — explicit precedence doc when Spec 108 three-choice conflicts with “member named place” (partially resolved in Phase F — needs one-line in Authority).

### Implementation risks

| Risk | Severity | Notes |
|------|----------|-------|
| **CompanionPageClient ~18k lines, 4+ shell branches** | Critical | Remounting chat; feels like separate apps |
| **Legacy registry still wired** | High | 27 rooms, wrong aliases, invitation catalog |
| **~20 TBD backgrounds** | High | Fallback cross-wiring (conservatory, greenhouse, library) |
| **Copy audit not done** | High | “Step into…”, plaques, recognition cards remain |
| **Memory dual-write** | High | Estate story + Brain record without lineage → duplicates |
| **resolveEstatePlace tie-breaking** | Medium | Quiet/stuck/coaching collisions |
| **Collection without shell slot** | Medium | Phase D `EstateDestinationSlot` undefined for Cabinet |
| **Art filename chaos** | Medium | Typos, spaces, legacy fallbacks |
| **Observation Mode** | Low (process) | Engineers may “fix” conversation from one bug — Rule of Three |

### Unnecessary complexity

| Complexity | Simplification |
|------------|----------------|
| **42 places before shell exists** | Ship shell first; defer Transition Spaces without art |
| **Peaceful Places hub + atomic pond/woodland** | Pick one model: hub **or** atoms, not both in routing |
| **Six coaching destinations** | Document primary intent signals; merge suggestions in resolver |
| **My Estate + Growth Profile + Goals** | One “personal continuity” collection with views |
| **Four registry source files** | Single `canonicalEstateRegistry` consumer; delete adapters last |
| **Dedicated *RoomShell per destination** | One shell + destination slot — Phase D already says this |
| **18 memory categories** | Group into 6 member-facing **books/shelves** for Memory Center UI |

---

## Missing pieces

| Piece | Priority | Owner doc |
|-------|----------|-----------|
| Bible Ch. 7 errata (4 place types, Guidebook object) | **P0** | Bible + Authority |
| Retire / watermark [03 — Room Catalog](./03%20-%20Estate%20Room%20Catalog.md) | **P0** | Authority |
| Wins / impact / accomplishments routing decision | **P0** | Memory Architecture addendum |
| Spec 112 ↔ L0–L5 mapping table | **P1** | Memory Architecture |
| My Thoughts canonical decision | **P1** | Registry + Memory |
| Collection `goToPlace` contract | **P1** | Phase C/D |
| Estate object pages (Bell, Cards, Accomplishments Book…) | **P1** | Bible §4 |
| Scene object anchor manifest (Guidebook, Map, Bell) | **P2** | Phase D |
| Copy voice module audited against Phase F ban list | **P0** | Implementation |
| Background manifest completion plan | **P1** | Image Bible |
| Welcome Home vs Sunroom first-visit spec | **P2** | Living Guide |

---

## Recommended simplifications

### 1. One wins story, two shelves (recommended canon)
| Content | Primary home | Secondary |
|---------|--------------|-----------|
| Honored personal/business moments | **Accomplishments Book™** | — |
| Proof for hard days / impact on others | **Evidence Vault™** | Lineage link to accomplishment chapter |
| Acts of kindness | **Evidence Vault™** (Impact folio) | Optional accomplishment cross-reference |

**Retire** “Wins” as a separate memory category in favor of **chapter** (Accomplishments) vs **proof** (Vault).

### 2. One knowledge path
```
Institute conversation → Knowledge Card (pick up) → file to Cabinet → 
season/group → Knowledge Collection volume → Library shelf
```
Single lineage chain; never duplicate card body in Library.

### 3. One calm resolver
For “quiet / overwhelmed / need space”: default suggestion order **Reading Nook → Conservatory → member’s favorite place** (if Kept); include **stay here**. Do not surface Peaceful Places hub unless member names it.

### 4. One shell, one chat
Implement Phase D.1 before adding places or memory UI. Stop adding `*RoomShell` components.

### 5. Subordinate doc hygiene
Mark **03 Room Catalog**, **07 Navigation**, pre-canon walkthroughs as **historical** — link only to Canonical Registry.

### 6. Menu exception documented
**GlobalEstateMenu**: account/settings/logout only — never place catalog. Estate Map = folded map object.

### 7. Celebration naming
Public canon: **Celebration Garden**. “Celebration Room” → alias in resolver only; update Constitution/Living examples in next doc pass.

---

## Top ten architectural risks

| Rank | Risk | Consequence | Mitigation |
|------|------|-------------|------------|
| **1** | **No unified shell (Phase D unbuilt)** | Every room feels like a different app; conversation remounts | **Phase D.1** `SparkEstateShell` first |
| **2** | **Dual registry in production** | Wrong place, wrong background, wrong arrival | Route **only** through `canonicalEstateRegistry` + delete legacy paths |
| **3** | **Memory duplicate writes** | “Which wins record is real?” — trust collapse | One lineage graph; Phase G lifecycle enforced in Brain |
| **4** | **Wins/accomplishments/vault ambiguity** | Shari recalls wrong shelf; search fails | Adopt simplification §1; document aliases |
| **5** | **Living Place invitation grids survive** | Constitution Art. VIII violation on every visit | Remove catalog for `category === living-place` |
| **6** | **Software copy in runtime** | “Step into…”, plaques, recognition cards | Centralize `estateVoice.ts` audited vs Phase F |
| **7** | **Bible/Catalog/Registry contradictions** | Engineers implement wrong id | P0 errata; retire Catalog 03 |
| **8** | **Shared backgrounds imply merged places** | Conservatory = Clear My Mind in member mind | Distinct plates or diegetic difference in scene objects |
| **9** | **Collection navigation undefined** | Cabinet feels like second app | Direct `goToPlace` with parent scene bleed |
| **10** | **TBD art + wrong fallbacks** | Greenhouse shows celebration garden; trust breaks | Freeze fallbacks per placeId; no cross-room legacy assets |

---

## Most important next build phase

### **Phase D.1 — Implement `SparkEstateShell` (Unified Estate Shell)**

**Why this phase wins:**

Every other authority assumes **one continuous estate** — one conversation panel, one scene layer, category-driven arrival. Phases B, C, and E built **pieces** (registry, navigation, chrome policy) but `CompanionPageClient` still branches across multiple stacks. Until the shell exists:

- Living Place law cannot be verified end-to-end  
- Phase F navigation behavior cannot be tested consistently  
- Phase G memory recall cannot anchor to stable place context  
- Registry growth (42 places) increases debt faster  

**Phase D.1 scope (minimal):**

1. Mount **one** `EstateConversationPanel` — never unmount on `goToPlace`  
2. Drive scene from `goToPlace()` state only  
3. Wire `estateChromePolicy` + canonical `category` for arrival flags  
4. Adapter pattern for Institute/Stables content → `EstateDestinationSlot`  
5. Delete Living Place invitation grid path in shell (not per-room hacks)  

**Parallel prerequisites (small, not a separate phase):**

- P0 canon errata (Celebration Garden naming, Catalog 03 retired)  
- Route all navigation through `canonicalEstateRegistry`  
- Wins/vault/accomplishments decision (one-page addendum to Memory Architecture)  

**Explicitly not next:** New rooms, new memory UI, new Bible chapters, prompt rewrites, or feature expansion.

---

## Conflict register (quick reference)

```text
ROOM OVERLAP
  conservatory ↔ clear-my-mind     (shared art; different category) — OK if plates diverge
  gardens ↔ celebration-garden       (Catalog conflated — FIX catalog)
  reading-nook ↔ library             (Catalog wrongly merged — FIX catalog)
  peaceful-places ↔ pond/woodland    (hub vs atoms — DECIDE)
  greenhouse ↔ growth-profile        (shared art — OK; stories distinct)
  stables ↔ momentum-builder         (coaching intent — rank resolver)

COLLECTION OVERLAP
  institute-cabinet ↔ library knowledge volumes
  accomplishments-shelf ↔ celebration-garden ↔ library
  seeds-planted ↔ my thoughts (undefined)
  growth-profile ↔ institute ↔ goals-projects

BOOK OVERLAP
  Knowledge Collection ↔ Cabinet cards
  Impact Collection ↔ Evidence Vault
  Journal volume ↔ Journal destination
  Portfolio folio ↔ Portfolio destination ↔ Library

MEMORY DUPLICATION
  Wins category ↔ Vault ↔ Accomplishments
  L3 preferences ↔ My Estate ↔ Memory Center
  Spec 112 types ↔ Phase G levels (unmap'd)

NAVIGATION AMBIGUITY
  Collection placeIds vs parent destinations
  Celebration Room alias
  "Quiet" multi-suggestion
  Legacy AppSection vs placeId

SHARI INCONSISTENCIES
  Phase F bans "Opening…" — runtime still uses "Step into…"
  Spec 108 three-choice vs Phase F immediate go (clarified — document)

OBJECT INCONSISTENCIES
  Guidebook: place vs object
  Estate Guide vs Guidebook™ naming
  Bell: garden only vs traditions elsewhere
```

---

## Memory examples — system pass/fail

| Scenario | Coherent? | Gap |
|----------|-----------|-----|
| File institute card → recall in coaching | **Yes** | Cabinet → lineage |
| Add accomplishment → bell ritual | **Yes** | Garden + permission |
| “Show my wins” | **No** | Three homes — fix § simplification |
| Favorite greenhouse → suggest when stuck | **Yes** | Phase F + G aligned |
| Venting “I'm stupid today” → not saved | **Yes** | L1 only |
| Complete volume → Library shelf | **Yes** | Needs ritual trigger decision |
| Search “delegation card” | **Yes** | Cabinet + natural language |
| My Thoughts seed → Greenhouse | **Partial** | My Thoughts not in registry |

---

## Final assessment

| Criterion | Score | Note |
|-----------|-------|------|
| Philosophical coherence | **Strong** | All seven docs share one soul |
| Place model coherence | **Good** | Registry is authoritative; Bible/Catalog lag |
| Memory model coherence | **Good** | Needs wins routing + 112 mapping |
| Companion behavior coherence | **Strong** | Phase F expresses frozen stack well |
| Shell/runtime coherence | **Weak** | Design complete; implementation fragmented |
| Terminology coherence | **Fair** | Legacy product ids persist |
| Ready to build? | **Yes — with gates** | D.1 + P0 errata + copy audit |

**Success test (from Phase G):**

> A member should never feel Spark is collecting information. They should feel Spark is thoughtfully preserving the chapters of their life.

The architecture **passes** that test on paper. Implementation **will fail** it until shell unity, memory lineage, and software copy are removed.

---

## Document control

| Version | Change |
|---------|--------|
| 1.0 | Phase H — initial system validation |

**Related:** [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md) · [ARCHITECTURAL_RESET_GAP_REPORT.md](./ARCHITECTURAL_RESET_GAP_REPORT.md)

**Next step:** Phase D.1 implementation plan + P0 canon errata (no new features).
