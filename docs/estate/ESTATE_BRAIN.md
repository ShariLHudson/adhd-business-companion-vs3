# Estate Brain™

**Status:** BINDING (internal) · **Runtime:** `lib/estateBrain/` · **Member map:** `ESTATE_REGISTRY.md`

> Spark's internal knowledge of its own Estate — not shown to members as a database or menu.

## What this is

The **Estate Brain** is the single authoritative source that defines:

- Every **experience** and navigable **space**
- **Purpose**, **capabilities**, **tools**, **relationships**
- **Triggers** for search and routing
- **Default greetings** and **next suggestions**

Chat, routing, menus, Visit Another Room, suggestions, and onboarding **read from here** — they do not define the Estate independently.

## Entry structure

Each `EstateKnowledgeEntry` has:

| Field | Role |
|-------|------|
| `name` | Member-facing label |
| `purpose` | One-line why |
| `description` | Internal reasoning context |
| `capabilities` | What can be done here |
| `suggestedActivities` | Arrival suggestions (not menus) |
| `tools` | Named tools inside the space |
| `relatedSpaceIds` | Cross-place connections |
| `triggers` | Search + routing keywords |
| `aliases` | Alternate names |
| `defaultGreeting` | Arrival prompt |
| `nextSuggestions` | Completion / cross-suggest bridges |
| `userNeeds` | Discovery buckets (overwhelmed, business, …) |

## How Spark uses it

```
Member: "help me write an email"
        ↓
searchEstateBrain()
        ↓
Best match: Create
        ↓
Navigate → creative-studio → Email tool
        ↓
nextSuggestions: Momentum, Boardroom, …
```

```
Member: "what rooms help if I'm overwhelmed?"
        ↓
searchEstateBrainByNeed("overwhelmed")
        ↓
Restore, Clear My Mind, Sunroom, Lakeside Hammock, Journal, …
```

No special-case routing rules required for each question type.

## API (internal)

| Function | Use |
|----------|-----|
| `searchEstateBrain(query)` | General intent → space/experience |
| `searchEstateBrainByNeed(need)` | Situational discovery |
| `resolveExperienceFromBrain(text)` | Routing layer |
| `whatCanIDoHere(spaceId)` | In-place orientation |
| `betterPlaceFor(space, intent)` | "Is there a better place?" |
| `relatedSpacesFor(id)` | Cross-suggestions |
| `defaultGreetingForSpace(id)` | Arrival copy |

## Adapters (migration)

| Legacy module | Reads from Brain |
|---------------|------------------|
| `estateExperiences/registry.ts` | `experiencesFromBrain()` |
| `estateExperiences/spacePersonalities.ts` | All brain entries |
| `estateExperiences/intentToExperience.ts` | `resolveExperienceFromBrain()` |
| `estateExperiences/resolveEstateNavigation.ts` | `searchEstateBrain()` for disambiguation |
| `estateIntelligence/*` | `brainEntryToRegistryEntry()` (phased) |

## Rule

**One feature, one entry.** If it appears twice in the brain, that's technical debt. If it doesn't fit, that's a design discussion.

## Related

- `docs/estate/ESTATE_REGISTRY.md` — member-facing experience map
- `lib/estateExperiences/legacyWorkspaceMap.ts` — migration audit
- `lib/estate/canonicalEstateRegistry.ts` — place identity (photography, canon)

**Place identity** stays in the canonical registry. **Capability knowledge** lives in the Estate Brain. Both must agree on `spaceId`.
