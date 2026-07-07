# Estate Knowledge Base™

**Spark Estate's permanent source of truth**

| | |
|---|---|
| **Status** | Foundational — seeded V1; expandable without restructuring |
| **Authority** | All intelligent systems read from here — nothing invents estate knowledge |
| **Runtime** | `lib/estateKnowledgeBase/` |

---

## Purpose

The Estate Knowledge Base™ answers:

- What rooms exist?
- What does this feature do?
- How does this tool work?
- What should Spark call it?
- When should it be recommended?
- Where does this button go?
- What member problem does it solve?

**If the answer is not here, Spark must not make it up.**

---

## Folder structure

```text
/docs/estate-knowledge-base/
    README.md                 ← You are here
    rooms.json                ← Living places and destination rooms
    features.json             ← Member-facing capabilities
    tools.json                ← Guidebook, folios, estate objects
    settings.json             ← Preferences and accessibility
    routes.json               ← Canonical navigation destinations
    vocabulary.json           ← One official name per thing
    discovery-mappings.json   ← Room/feature → discoveries, audio, stories
    estate-assets.json        ← Visual asset directory (file names = source of truth)
    estate-locations.json     ← Canonical place → primary asset file
    estate-aliases.json       ← Natural language → locationId
    estate-experience-groups.json ← Experience intent → location options
    estate-objects.json           ← Objects, stories, visual elements
    object-locations.json         ← Object ↔ location placement
    object-aliases.json           ← Natural language → objectId
    member-need-signals.json      ← Human-side need signals (right now)
    estate-recommendation-reasons.json ← Why a place fits this moment
    feature-how-to.json           ← Feature & settings how-to guidance
    progressive-discovery.json    ← Progressive Discovery Journey™ (5 stages)
    progressive-discovery-curriculum.json ← Curriculum philosophy & audience paths
    discovery-collections.json  ← Discovery Note collections (internal)
    discovery-prerequisites.json  ← Prerequisite relationships (internal)
    audio-categories.json         ← Audio Experience Foundation™ taxonomy
    audio-experiences.json        ← Audio experiences (not full library)
    audio-mappings.json           ← Room/feature/need → audio experiences
    sparkcard-mappings.json   ← Entity → Spark Cards™
    momentum-mappings.json    ← Entity → Momentum™ suggestions
```

**Subsystem extensions** (Discovery Key content, placement coordinates) remain in  
`docs/estate-intelligence/` and **reference** IDs defined here.

---

## Shared item schema

Every room, feature, tool, setting, or route should eventually support:

| Field | Purpose |
|-------|---------|
| `id` | Stable identifier |
| `officialName` | **One** canonical name — see [vocabulary.json](./vocabulary.json) |
| `category` | Registry category |
| `description` | What it is (member-safe) |
| `purpose` | Why it exists |
| `memberBenefits` | What the member gains |
| `primaryProblemSolved` | Emotional + practical need |
| `status` | `Live` · `Draft` · `Future` · `Hidden` · `Retired` |
| `route` | App path when applicable |
| `image` | Scene or icon asset |
| `relatedRooms` | Cross-links to room IDs |
| `relatedFeatures` | Cross-links to feature IDs |
| `relatedTools` | Cross-links to tool IDs |
| `relatedDiscoveries` | Discovery Library IDs (`DISC-xxx`) |
| `relatedSparkCards` | Spark Card IDs |
| `relatedMomentum` | Momentum activity IDs |
| `recommendedWhen` | When Spark may suggest |
| `buttonText` | **One** official primary action label |
| `keywords` | Search and matching |
| `tags` | Additional classification |
| `version` | Item schema version (integer) |
| `lastUpdated` | ISO date |

Not every field is required on day one. Structure supports future search, voice, and Companion Intelligence™.

---

## Status rules

| Status | Meaning |
|--------|---------|
| **Live** | Exists and may be recommended |
| **Draft** | In progress — not for member recommendation |
| **Future** | Planned — not presented as available |
| **Hidden** | Exists but not surfaced in normal discovery |
| **Retired** | Historical reference only |

**Only Live items may be recommended** by Discovery Key™, Momentum™, Spark Cards™, Estate Guide™, or Companion Intelligence™.

---

## Vocabulary rules

1. Every room has **one** official name.
2. Every feature has **one** official name.
3. Every button has **one** official label.
4. Spark never randomly renames things.
5. Approved aliases only when listed in [vocabulary.json](./vocabulary.json).

---

## Mapping files

Mapping registries avoid duplicated relationship logic:

```text
Greenhouse™ (room)
    ↓ discovery-mappings.json
Related Discoveries · Spark Cards · Momentum · Audio · Stories · Journal prompts
```

Consumers read mappings — they do not hard-code cross-links.

---

## Source of truth rule

If something is **not** in the Estate Knowledge Base™:

- Do **not** recommend it
- Do **not** explain it
- Do **not** navigate to it
- Do **not** create Discovery Notes about it

Runtime code: `lib/estateKnowledgeBase/` — never hard-code estate copy in prompts or UI.

---

## Consumers

| System | Reads |
|--------|-------|
| Discovery Key™ | `rooms`, `features`, `routes`, `discovery-mappings` |
| Environment intent | `estate-experience-groups`, `estate-aliases`, `estate-locations` |
| Asset intelligence | `estate-assets`, `estate-locations`, `locationIntentResolution` |
| Spark Companion | All registries + `vocabulary` |
| Momentum™ | `momentum-mappings`, `features`, `rooms` |
| Spark Cards™ | `sparkcard-mappings` |
| Estate Guide™ | `rooms`, `routes`, `vocabulary` |
| Onboarding | `features`, `rooms`, Live-only gate |
| Navigation | `routes`, `buttonText` |
| Future search / voice | `keywords`, `tags`, full schema |

---

## Maintenance

1. Add or update the JSON registry item.
2. Update [vocabulary.json](./vocabulary.json) official name.
3. Update mapping files if relationships change.
4. Set `status` — never ship recommendations without Live.
5. Bump `version` when meaningfully changing an item.

Estate Bible and canon (`docs/estate/`) win on **naming conflicts** — this base indexes shippable knowledge.

---

## Related

| Document | Role |
|----------|------|
| [estate-intelligence/README.md](../estate-intelligence/README.md) | Discovery Key subsystem extensions |
| [ESTATE_INTELLIGENCE_ARCHITECTURE.md](../estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md) | Routing and judgment |
| [Spark Estate Bible](../estate/Spark%20Estate%20Bible.md) | Place and object canon |
