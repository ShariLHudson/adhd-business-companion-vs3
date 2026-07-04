# Spark Estate™ — Architectural Authority

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | **Binding** — supersedes all prior Estate design assumptions |
| **Effective** | Immediately for all implementation |

---

## The three authorities

These documents **define Spark Estate**. They are not reference material, inspiration, or optional reading.

| # | Document | Authority |
|---|----------|-----------|
| **1** | [01 — Spark Estate Constitution](./01%20-%20Spark%20Estate%20Constitution.md) | **Principles** — what must never break |
| **2** | [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) | **Experience** — how the Estate feels and behaves |
| **3** | [Spark Estate Bible](./Spark%20Estate%20Bible.md) | **Canon** — what is true (places, objects, language, rules) |

**Read together.** No single document overrides the other two on its domain:

- **Constitution** wins on moral law and immutable articles.  
- **Experience Guide** wins on feeling, presence, silence, discovery.  
- **Bible** wins on vocabulary, place types, objects, seasons, and the Spark Estate Test.

If all three agree and legacy code or docs disagree → **change the code**, not the canon.

---

## What this supersedes

The following are **subordinate** — useful only where they **align** with the three authorities:

| Subordinate | Status |
|-------------|--------|
| `ESTATE_ROOM_TEMPLATE.md` | Retire invitation panels, hero plaques, feature-first arrival |
| `ESTATE_E2E_WIRING.md` / `ESTATE_BEHAVIORAL_CONSISTENCY.md` | Implementation notes — must converge to canon |
| `ESTATE_INTELLIGENCE_FRAMEWORK.md` | Routing mechanics — vocabulary from Bible Ch 7–9 |
| `SPARK_ESTATE_UI_PHILOSOPHY.md` | UI detail — Bible Ch 8, 22, 23 win on conflict |
| `ESTATE_EXPERIENCE_MASTER_PLAN.md` | Pre-canon planning — do not extend |
| Feature-first `AppSection` / workspace panel patterns | **Invalid** unless mapped to Living / Destination / Transitional places |
| Grow hub placeholders, dashboard arrival, software navigation copy | **Invalid** |

Conversation specs (105–119) and Relationship Constitution remain binding for **how Spark speaks**. Estate architectural authority governs **what members see and where they are**.

---

## Canonical place registry (Phase A)

**[SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)** is the official inventory of every Estate location — Living Place, Destination, Collection, Transition Space. It is **not** `lib/estate/estateRoomRegistry.ts`. Technical registries must converge to the canonical registry.

## Runtime place registry (Phase B)

**`lib/estate/canonicalEstateRegistry.ts`** is the single **runtime** source of truth for place identity (42 entries, synced from Phase A). Legacy files (`estateRoomRegistry`, alias maps, invitation catalog, arrival experience, section map, presence, estate intelligence registrations) are **adapters only** until later migration phases. See **[PHASE_B_RUNTIME_REGISTRY_REPORT.md](./PHASE_B_RUNTIME_REGISTRY_REPORT.md)**.

## Navigation (Phase C)

**`lib/estate/goToPlace.ts`** is the approved navigation primitive. **`lib/estate/resolveEstatePlace.ts`** resolves natural language to canonical place ids. Legacy section routing and regex matchers are subordinate. See **[PHASE_C_GOTOPLACE_REPORT.md](./PHASE_C_GOTOPLACE_REPORT.md)**.

## Estate Registry — Experience → Space → Tool (BINDING)

**[ESTATE_REGISTRY.md](./ESTATE_REGISTRY.md)** is the master map: every member-facing capability appears **exactly once** (Experience → Estate Space → Tool). Machine-readable audit: `lib/estateExperiences/legacyWorkspaceMap.ts`. **Migration freeze:** no new member-facing features until every legacy workspace, menu, route, prompt, and launcher is mapped or removed.

## Estate Brain — Spark's internal Estate knowledge (BINDING)

**[ESTATE_BRAIN.md](./ESTATE_BRAIN.md)** · Runtime: `lib/estateBrain/` — purpose, capabilities, tools, triggers, relationships, greetings, and suggestions for every experience and space. Chat, routing, menus, and discovery **search the brain** instead of maintaining parallel rule lists.

## Unified shell (Phase D)

**[PHASE_D_UNIFIED_ESTATE_SHELL.md](./PHASE_D_UNIFIED_ESTATE_SHELL.md)** defines the canonical **`SparkEstateShell`** — one scene, one conversation panel, scene-anchored objects. Current layout components are inventoried with survive / adapter / deprecate verdicts.

## Application chrome (Phase E)

**`lib/estate/estateChromePolicy.ts`** governs what software chrome may appear in Estate mode. Living Places show background + chat + subtle menu/guidebook only. See **[PHASE_E_REMOVE_APPLICATION_CHROME_REPORT.md](./PHASE_E_REMOVE_APPLICATION_CHROME_REPORT.md)**.

## Companion behavior (Phase F)

**[PHASE_F_SHARI_COMPANION_ENGINE.md](./PHASE_F_SHARI_COMPANION_ENGINE.md)** — Shari as trusted companion (not chatbot): conversation, memory, celebration, navigation, silence, and 50 example dialogues. **Documentation only.**

## Memory architecture (Phase G)

**[SPARK_ESTATE_MEMORY_ARCHITECTURE.md](./SPARK_ESTATE_MEMORY_ARCHITECTURE.md)** — Estate remembers **stories**, not data: categories, levels, lifecycles, books, collections, recall, privacy, search, and quiet celebrations. **Documentation only.** Spec 112 (trust) wins on persist conflicts; Spec 117 (structure) implements.

## P0 canon errata (pre–Phase D.1)

**[P0_CANON_ERRATA.md](./P0_CANON_ERRATA.md)** — binding resolutions: Celebration Room™ id, Reading Nook ≠ Library, wins simplification, Guidebook as object, My Thoughts non-canon, Room Catalog 03 retired.

## Runtime shell (Phase D.1)

**[PHASE_D1_RUNTIME_SHELL_REPORT.md](./PHASE_D1_RUNTIME_SHELL_REPORT.md)** — `SparkEstateShell` + `estateShellState`; unified direct/profile estate visits.

## Architecture validation (Phase H)

**[SPARK_ESTATE_ARCHITECTURE_VALIDATION.md](./SPARK_ESTATE_ARCHITECTURE_VALIDATION.md)** — final pre-build review: cross-document conflicts, duplicate concepts, top risks, simplifications, and **Phase D.1 (SparkEstateShell)** as the recommended first implementation phase.

---

## Implementation rule

Before any Estate change — code, art, copy, registry, or routing:

1. **Identify** which authority applies (principle · feeling · canon fact).  
2. **Align** — if implementation cannot satisfy all three, **do not ship**.  
3. **Never** cite an old doc, test matrix, or existing code pattern to override the three authorities.  
4. **Never** treat these as "nice goals" — they are **release gates**.

**Spark Estate Test (Bible Ch 23):** If most answers are no, it does not belong.

---

## Conflict resolution

```
Question arises
    → Constitution (principles)
    → Experience Guide (feeling)
    → Bible (facts, language, places)
    → Cleanup Roadmap (how to simplify toward alignment)
    → Code
```

Legacy behavior that fails the three authorities is **debt to remove**, not precedent to preserve.

---

## For agents and engineers

| Do | Don't |
|----|-------|
| Quote chapter/article when deciding | Say "see also" and ignore |
| Block features that violate Ch 8–9 language | Add dashboards "for now" |
| Split Library vs Institute per Bible Ch 12–13 | Merge places for routing convenience |
| Scene + float for Living Places | Split workspace panels on arrival |
| Stop and ask if canon is unclear | Improvise from ChatGPT UX habits |

**Cursor rules:** `estate-architectural-authority.mdc` · `living-in-spark-estate.mdc` · `spark-estate-bible.mdc`

---

## Heart (immutable)

> *Spark Estate™ is not a place you use. It is a place where you are welcomed home.*

Everything else serves that sentence.
