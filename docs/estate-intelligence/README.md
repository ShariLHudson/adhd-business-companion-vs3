# Estate Intelligence System™

**Spark Estate's single source of truth**

| | |
|---|---|
| **Status** | Foundational — structure only (not populated) |
| **Parent** | [Estate Intelligence Architecture](../estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md) · [Discovery Key Constitution](./discovery-key/DiscoveryKey-Constitution.md) |
| **Runtime (future)** | `lib/estateIntelligence/` · `lib/estateBrain/` |

---

## Purpose

This folder is Spark Estate's **brain** — the master documentation that describes every room, feature, tool, route, destination, and experience inside Spark Estate.

| Consumer | Uses Estate Intelligence for |
|----------|------------------------------|
| **Spark Companion** | Accurate answers about places and capabilities |
| **Discovery Key™** | Gentle recommendations (Live items only) |
| **Momentum** | Opening features and activities |
| **Onboarding** | Explaining what exists and why |
| **Navigation** | Routes, destinations, button text |
| **Future Companion Intelligence** | Unified world model |

> Nothing in the application should **invent** functionality. Everything should reference this system.

---

## Folder structure

```text
/docs/estate-intelligence/
    README.md                      ← You are here
    estate-vocabulary.md           ← Official names — one name per thing
    estate-rooms.json              ← Living and destination places
    estate-features.json           ← Member-facing capabilities
    estate-tools.json              ← Tools and utilities
    estate-settings.json           ← Settings and shortcuts
    estate-routes.json             ← Routes and navigation destinations
    discovery-library.json         ← Discovery Key notes (when populated)
    discovery-rules.md             ← How Discovery Key reads this system
    room-placement-library.json    ← In-scene placement metadata (when populated)
    discovery-key/
        DiscoveryKey-Constitution.md ← Discovery Key experience law
```

Future documents can be added without changing this architecture.

---

## Shared item schema (target)

Not every field is required on day one. Design supports growth over time.

| Field | Purpose |
|-------|---------|
| `id` | Stable identifier |
| `officialName` | Canonical name — see [estate-vocabulary.md](./estate-vocabulary.md) |
| `category` | Registry category |
| `description` | What it is |
| `purpose` | Why it exists |
| `status` | `Live` · `Draft` · `Future` · `Hidden` · `Retired` |
| `route` | App route when applicable |
| `image` | Scene or icon asset path |
| `relatedRooms` | Cross-links to room IDs |
| `relatedFeatures` | Cross-links to feature IDs |
| `relatedDiscoveries` | Cross-links to discovery IDs |
| `relatedSparkCards` | Cross-links to Spark Card IDs |
| `relatedMomentumActivities` | Cross-links to Momentum activity IDs |
| `primaryMemberProblemSolved` | Emotional + practical need |
| `memberBenefits` | What the member gains |
| `recommendedWhen` | When Spark or Discovery Key may suggest |
| `navigationDestination` | Resolved navigation target |
| `buttonText` | Primary action label |
| `keywords` | Search and matching |
| `searchTags` | Additional retrieval tags |
| `lastUpdated` | ISO date |

---

## Status rules

Every item **must** include a `status`.

| Status | Meaning |
|--------|---------|
| **Live** | Exists, shippable, member-facing |
| **Draft** | In progress — not for member recommendation |
| **Future** | Planned — not presented as available |
| **Hidden** | Exists but not surfaced in normal discovery |
| **Retired** | Removed from active experience — historical reference only |

**Discovery Key rule:** Only **Live** items may be recommended in normal rotation.  
See [discovery-rules.md](./discovery-rules.md) and [Discovery Key Constitution](./discovery-key/DiscoveryKey-Constitution.md).

---

## Source of truth rule

The Estate Intelligence System is the **only approved source** describing Spark Estate.

Spark must never invent:

- Features
- Rooms
- Settings
- Buttons
- Navigation paths
- Tools
- Destinations
- Explanations

If something is **not defined here**, it must **not** be presented as available.

Runtime code should read registries — not hard-code estate knowledge in prompts or UI copy.

---

## Population policy (current phase)

| Phase | Action |
|-------|--------|
| **Now** | Structure and documentation only — empty `items` arrays |
| **Next** | Populate from Estate Bible, canonical places, and live routes |
| **Ongoing** | One official name per thing; status on every entry; Live gate for Discovery Key |

Do not duplicate estate canon from `docs/estate/` — **reference and index** it here.

---

## Design goal

Modular. New rooms, discoveries, Spark Cards, features, and experiences should be **easy to add** without redesigning the architecture.

This system is the long-term knowledge foundation for Spark Estate.

---

## Related documents

| Document | Role |
|----------|------|
| [ESTATE_INTELLIGENCE_ARCHITECTURE.md](../estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md) | Routing, judgment, registry authority |
| [Discovery Key Constitution](./discovery-key/DiscoveryKey-Constitution.md) | Gentle discovery — not a reward system |
| [Spark Estate Bible](../estate/Spark%20Estate%20Bible.md) | Place and object canon |
| [ESTATE_ARCHITECTURAL_AUTHORITY.md](../estate/ESTATE_ARCHITECTURAL_AUTHORITY.md) | Constitution · Experience Guide · Bible |
