# Architectural Restoration — Session Charter

| Field | Value |
|-------|-------|
| **Date** | Active session |
| **Status** | **No new features** — restore integrity only |
| **Authority** | [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md) — binding |
| **Execution** | [Estate Cleanup Roadmap](../ESTATE_CLEANUP_ROADMAP.md) |

---

## Today's mandate

> We are not adding features. We are restoring architectural integrity.

**Allowed today**

- Remove duplicate registries, routers, and vocabulary  
- Split collisions (Library ≠ Momentum Institute)  
- Align copy with Bible Ch 8–9 (no software language)  
- Delete or quarantine dead paths  
- Update tests to match restored truth  
- Document survivors vs retired  

**Forbidden today**

- New rooms, lessons, menus, panels, intelligence engines  
- New specs or conversation redesign  
- "While we're here" feature work  
- Building anything not required to **consolidate**  

**Gate:** Do not start Phase 2+ navigation refactors until Phase 1 registry truth is verified.

---

## Canon alignment checklist

| Source | Question |
|--------|----------|
| **Constitution** | Relationship > tasks? Places > features? |
| **Bible Ch 7** | Living / Destination / Transitional — correct category? |
| **Bible Ch 8–9** | No dashboard, launch, module language? |
| **Bible Ch 22–23** | Conversation first; Spark Estate Test? |
| **Experience Guide** | Feelings, silence, discovery — not tours? |

---

## Phase 1 — In progress (registry truth)

| Item | Status |
|------|--------|
| Split `LIBRARY_ENTRY` vs `MOMENTUM_INSTITUTE_ENTRY` | ✅ restored |
| `estateSectionMap`: `momentum-institute` → institute, not library | ✅ restored |
| `estateRoomRegistry`: institute `estateRegistryId` | ✅ restored |
| Matcher / offer / router copy aligned | ✅ restored |
| Survivors inventory in Cleanup Roadmap appendix | pending |

---

## Survivors (target spine)

| Concern | Survivor |
|---------|----------|
| Place definitions | `lib/estate/estateRoomRegistry.ts` |
| Phrase → room | `lib/estate/estateRoomAliasRegistry.ts` |
| Intelligence entries | `estateIntelligence/registrations/*` — **derived from room truth, not duplicate vocabulary** |
| Canon docs | Constitution · Bible · Living in Spark Estate |

---

## Retire / quarantine (not extend)

- `LIBRARY_ENTRY` naming Institute  
- `momentum-institute` section → `library` entry id  
- Parallel routing without `goToPlace` (Phase 2)  
- `GrowPlaceholderPanel` default paths (Phase 5)  
- Instructional arrival overlays (Phase 3)  

---

## Exit criteria (today)

- [ ] Library and Institute are separate in registry, section map, matcher, offer, router  
- [ ] Tests pass for library vs institute routing  
- [ ] No new files except this charter + required consolidation edits  
- [ ] Manual smoke: "take me to the library" ≠ Institute  

---

*Stop when exit criteria pass or when instructed. Do not open Phase 2 without approval.*
