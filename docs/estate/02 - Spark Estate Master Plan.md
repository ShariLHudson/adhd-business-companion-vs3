# Spark Estate Master Plan™

| Field | Value |
|-------|-------|
| **Series** | Spark Estate Documentation · **02 of 11** |
| **Status** | Strategic north star |
| **Parent** | [01 — Constitution](./01%20-%20Spark%20Estate%20Constitution.md) · [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) |
| **Next** | [03 — Estate Room Catalog](./03%20-%20Estate%20Room%20Catalog.md) |

---

## Heart of the project

> *Spark Estate™ is not a place you use. It is a place where you are welcomed home.*

Every room, image, line of code, and conversation must honestly support that sentence. Full founding law: [01 — Constitution](./01%20-%20Spark%20Estate%20Constitution.md). **Why feelings matter:** [Living in Spark Estate](./Living%20in%20Spark%20Estate.md).

## Vision (ten years)

One luxury entrepreneurial estate — seasons change, light moves, rooms hold memory. Members return because it **feels like theirs**, not because they left tasks unfinished.

Shari is the trusted companion who lives on the property (Article III). The interface disappears (Article XVI). Capability grows through places, objects, and conversation — not through learning a product.

---

## Strategic pillars

| Pillar | Meaning |
|--------|---------|
| **One property** | Continuous world — not tabs, modules, or workspaces |
| **One registry** | `roomId` → place, art, category, routing — register once |
| **One navigation spine** | `goToPlace(roomId)` — conversation and menu share it |
| **One chat shell** | Frosted float over full-bleed scene |
| **Objects, not panels** | Guidebook, vault, folio, drawer wall — furniture in the photo |
| **Cleanup before expansion** | [Estate Cleanup Roadmap](../ESTATE_CLEANUP_ROADMAP.md) phases 1–5 complete before new features |

---

## Place architecture (summary)

```
        ┌─────────────────────────────────────┐
        │         LIVING ESTATE               │
        │  entry · halls · stairs · paths     │
        └──────────────┬──────────────────────┘
                       │ walk (silent)
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
  CONVERSATION    CONVERSATION   DESTINATION
     PLACES          PLACES         ROOMS
```

**Conversation Places** — where life with Shari happens (Reading Nook, Greenhouse, Dock, …).  
**Destination Rooms** — where work is kept (Institute, Vault, Portfolio, Celebration, Guidebook).  
**Living Estate** — what makes movement feel real.

Full inventory: [03 — Estate Room Catalog](./03%20-%20Estate%20Room%20Catalog.md).

---

## Member journey (canonical)

1. **Arrive** — Welcome Home / Front Entry; continuity, not blank app  
2. **Talk** — one question, human pace  
3. **Move** — named place → immediate; feeling → one gentle suggestion  
4. **Stay or do** — Conversation Place (float only) or Destination (object layer)  
5. **Continue** — thread never resets; no forced closure  

Detail: [05 — Conversation Philosophy](./05%20-%20Conversation%20Philosophy.md) · [07 — Estate Navigation](./07%20-%20Estate%20Navigation.md).

---

## Implementation sequence (current era)

**Not** feature sprints. **Simplification** sprints:

| Phase | Focus |
|-------|-------|
| 1 | Architecture — one registry, split Library/Institute, shrink orchestrator |
| 2 | Navigation — `goToPlace`, retire parallel routers |
| 3 | Conversation — one chat shell, Shari voice, no arrival tours |
| 4 | Backgrounds — asset audit, honest fallbacks |
| 5 | Room completion — stubs out, category-appropriate minimum |

**Gate:** Phase *n+1* does not start until phase *n* exit criteria pass.

---

## Success measures

| Measure | Yes | No |
|---------|-----|-----|
| Feels like a photograph | Member forgets UI | Member operates an app |
| Navigation | Talk or name a place | Hunt menus |
| Shari | Friend on the estate | ChatGPT with scenery |
| Complexity | Subtracted each release | New panel per room |
| Return | “Glad I’m back here” | “Where was that feature?” |

---

## Document map (this series)

| # | Document | Role |
|---|----------|------|
| 01 | Constitution | Founding principles I–XVII + heart quote |
| — | **[Living in Spark Estate](./Living%20in%20Spark%20Estate.md)** | **Experience Guide — feelings, presence, why** |
| — | **[Spark Estate Bible](./Spark%20Estate%20Bible.md)** | **Official canon** — Ch 1–23 + Promise |
| 02 | Master Plan | Strategy (this doc) |
| 03 | Room Catalog | Every place |
| 04 | Estate Objects | Physical affordances |
| 05 | Conversation Philosophy | Talk = navigation |
| 06 | Shari Personality Guide | Voice and presence |
| 07 | Estate Navigation | Routing rules |
| 08 | UI Philosophy | Scene, float, object layers |
| 09 | Seasonal Estate Guide | Time, weather, light |
| 10 | Future Expansion Ideas | Parking lot only |

---

## What we are not doing now

- New Institute curriculum or lesson content  
- New global menus or dashboard surfaces  
- Parallel chat or routing systems  
- Specs 132+ or conversation architecture redesign  

**Simplify until the estate feels like home.** Then expand from evidence.
