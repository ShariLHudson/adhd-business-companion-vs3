# 162_SCENES_ARCHITECTURE

# Spark Estate™
## Scenes™ Architecture Standard

**Version:** 1  
**Status:** Architecture  
**Date:** 2026-07-09  
**Concept:** Scenes™ are visual environments — places to spend time, not purpose-labeled tools

**Related:**
- [100 Spark Estate Master Manifest](./100_SPARK_ESTATE_MASTER_MANIFEST.md)
- [153 Spark Estate Room Access Matrix](./153_SPARK_ESTATE_ROOM_ACCESS_MATRIX.md)
- [163 Soundscapes™ Architecture](./163_SOUNDSCAPES_ARCHITECTURE.md) — independent audio layers
- Peaceful Places™ runtime — `lib/peacefulPlaces/`
- Canonical places — `lib/estate/canonicalEstatePlaces.ts`
- Runtime mirror — `lib/scenes/scenesArchitecture.ts`

---

## Purpose

Scenes™ are the visual environments of Spark Estate™.

A Scene is where a member chooses to spend time.

Scenes are **not** tied to a specific purpose.

The same Scene may be used for:

- focus  
- relaxation  
- reading  
- journaling  
- planning  
- prayer  
- creativity  
- or simply enjoying the environment  

Members define the meaning.  
Spark learns their preferences over time.

---

## Philosophy

Spark Estate™ never tells members how they should use a space.

Instead, Spark observes how each member naturally uses different places and adapts future recommendations accordingly.

---

## Scene Types

### Estate Scenes™

Permanent locations inside Spark Estate™.

Examples:

| Scene | Notes |
|-------|--------|
| Welcome Home | Arrival / home base |
| Estate Library™ | Reading · research · quiet study |
| Journal Gazebo™ | Capture · reflection |
| Greenhouse™ | Growth · writing · calm work |
| Aquarium Room™ | Soft presence · restore |
| Writing Room™ | Drafting · long-form |
| Music Room™ | Sound · listening · create |
| Reading Nook™ | Intimate reading |
| Fireside Deck™ | Warm outdoor presence |
| Observatory™ | Perspective · research · night sky |
| Sunroom™ | Light · welcome · soft work |
| Treehouse Reading Nook™ | Elevated quiet reading |
| Tea Room™ | Pause · conversation · ritual |
| Lakeside Hammock™ | Rest · open air |
| Celebration Garden™ | Joy · milestones · gathering |
| Swimming Pool™ | Water · restore · leisure |

### Peaceful Places™

Beautiful environments outside Spark Estate™.

Examples:

| Scene | Notes |
|-------|--------|
| Bedroom Window™ | Soft indoor calm |
| Bright Studio™ | Light · movement · open space |
| Coffee House™ | Ambient company · gentle focus |
| East Terrace™ | Morning light · outdoor quiet |
| Summer Storm Deck™ | Weather atmosphere · covered deck |
| Peaceful Pathway™ | Walking · transition · nature |

---

## Future Scene Variations

Each Scene may eventually contain multiple versions.

### Journal Gazebo™

- Morning  
- Rain  
- Evening  
- Autumn  
- Winter  

### Observatory™

- Day  
- Sunset  
- Night  

### Library™

- Morning  
- Fireplace  
- Christmas  
- Rain  

Variations change atmosphere — never purpose labels.

---

## Scene Components

Every Scene may include:

| Component | Role |
|-----------|------|
| Still image | Primary visual plate |
| Cinematic video | Optional living atmosphere |
| Seasonal version | Time-of-year / weather variants |
| Ambient animation | Subtle motion without clutter |
| Interactive elements | Future — objects, invitations, soft affordances |

---

## Scene Selection

Spark asks:

> "Where would you like to spend some time?"

Members choose a Scene.  
**Purpose is never required.**

Do not ask “What do you want to do here?” as a gate to entry.

---

## Learning

Spark quietly notices patterns.

Examples:

- "You often choose the Greenhouse when writing."  
- "You usually visit the Journal Gazebo before journaling."  

Recommendations are based on **behavior**, never assumptions.

Learning rules:

1. Observe usage over time  
2. Prefer soft, optional suggestions  
3. Never lock a Scene to one activity  
4. Never shame or correct how a member uses a place  

---

## Design Rules

Scenes should feel:

- Peaceful  
- Beautiful  
- Timeless  
- Comfortable  
- Believable  
- Luxurious  
- Uncluttered  

Scenes are places people genuinely want to spend time.

---

## Anti-Rules

Do **not** permanently label Scenes as:

- Focus  
- Sleep  
- Productivity  
- Meditation  
- ADHD  

Members decide how they use each place.  
Spark learns over time.

---

## Runtime Implications

| Concern | Guidance |
|---------|----------|
| Navigation | Scene choice opens the place — no purpose triage required |
| Copy | Invite presence (“spend some time”), not task assignment |
| Recommendations | Behavior-derived; optional; never mandatory |
| Peaceful Places™ | Outside-estate Scenes; same philosophy as Estate Scenes™ |
| Variations | Future seasonal / time-of-day plates share one Scene identity |
| Room awareness | Visual place ≠ claimed activity; do not invent purpose on arrival |

---

## Implementation Notes

| Layer | Location |
|-------|----------|
| This architecture | `docs/estate/recognition/library/162_SCENES_ARCHITECTURE.md` |
| Runtime constants | `lib/scenes/scenesArchitecture.ts` |
| Estate places | `lib/estate/canonicalEstatePlaces.ts` |
| Peaceful Places | `lib/peacefulPlaces/` |
| Access patterns | [153 Room Access Matrix](./153_SPARK_ESTATE_ROOM_ACCESS_MATRIX.md) |

**Status:** Architecture ingested. Full Scene-variation media and preference learning loops are future work; existing Estate places and Peaceful Places™ already embody the Scene model.
