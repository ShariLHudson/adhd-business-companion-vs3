# CURSOR SPEC — T-017 Estate Rooms™ Framework

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-017 |
| **Title** | Estate Rooms™ Framework |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Every room in the Spark Estate™ — homestead rooms, workspaces, growth estate, peaceful places, guild halls, and all future destinations |
| **Related** | [Spec 100 — Transformation Constitution](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) · [Spec 103 — Universal Experience](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · **[Spec 109 — Frosted Conversation Workspace](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)** · **[Spec 108 — Environment Integration](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md)** · [T-003 Universal Experience](./UNIVERSAL_EXPERIENCE_STANDARDS.md) · [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) · [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) · [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [Estate Light Flicker](../.cursor/rules/estate-light-flicker.mdc) · [07 – Estate Navigation](../spark-intelligence-foundation/07-estate-navigation.md) · `lib/companionHomestead/homesteadRoomRegistry.ts` |

---

## Purpose

This specification defines the philosophy, architecture, and design standards for every room inside the Spark Estate™.

Rooms are **not** backgrounds.

Rooms are **not** themes.

Rooms are **not** decoration.

Every room exists because it improves thinking, reduces cognitive load, and supports entrepreneurial transformation.

**The Estate™ is Spark's interface.**

The rooms are where the experiences happen.

---

## The Conversation Front Door™

**Governing architectural rule** — every room, tool, and future destination inherits this.

> If a member can accomplish something by talking to Spark, they should never have to hunt through the Estate to find it.

- **Conversation is the front door.** Members describe what they need; Spark helps.
- **Rooms are destinations for depth.** Immersive environments when focus, atmosphere, or dedicated workspace genuinely helps — never required just to begin.
- **The Estate enriches conversation.** It does not replace it.

As the Estate grows to dozens of rooms and hundreds of capabilities, Spark stays simple because members never need a mental map to get started.

**Design gate:** Would a first-time visitor need to know this room's name to succeed? If yes — the feature is not finished.

**Routing:** [Estate Intelligence™](./ESTATE_INTELLIGENCE_FRAMEWORK.md) · **Language:** [Spec 108](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md) — invitations, not navigation commands.

**Code:** `CONVERSATION_FRONT_DOOR_PRINCIPLE` · `CONVERSATION_FRONT_DOOR_GATE` in `lib/sparkEstateRooms/types.ts`

---

## Core Philosophy

People think differently depending on their environment.

A noisy room creates one kind of thinking.

A peaceful library creates another.

A strategy room creates another.

Spark intentionally uses **environmental psychology** to help entrepreneurs think more clearly.

Every room should improve thinking **before** the member does any work.

---

## The Estate Principle™

Every room must answer three questions:

| # | Question |
|---|----------|
| 1 | **Why does this room exist?** |
| 2 | **How does this environment improve the member's thinking?** |
| 3 | **What transformation happens here?** |

If those questions cannot be answered, the room should **not** exist.

**Type:** `ESTATE_PRINCIPLE_QUESTIONS` in `lib/sparkEstateRooms/types.ts`

Aligns with [Spec 103](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) `ESTATE_ROOM_DESIGN_QUESTIONS`.

---

## Rooms Are Experiences

A room is never just a location.

It is a carefully designed entrepreneurial experience.

The room itself **prepares the mind** for the work that happens inside it.

---

## Environmental Psychology™

Every room should intentionally influence:

| Dimension | |
|-----------|---|
| Attention | |
| Emotion | |
| Energy | |
| Creativity | |
| Reflection | |
| Decision-making | |
| Confidence | |
| Focus | |
| Curiosity | |

The environment becomes an **invisible coach**.

**Type:** `EnvironmentalPsychologyDimension` in `lib/sparkEstateRooms/types.ts`

---

## Every Room Has One Primary Purpose

Avoid multi-purpose rooms.

| Room | Primary purpose |
|------|-----------------|
| **Clear My Mind™** | Mental decluttering |
| **Focus™** | Deep concentration |
| **Grow™** | Capability development |
| **Create™** | Creative production |
| **Gallery™** | Reflection and recognition |
| **Observatory™** | Exploration and future thinking |
| **Guild Hall™** | Mastery |
| **Community Commons™** | Connection |

**One room. One emotional purpose.**

**Type:** `EstatePrimaryRoom` · `EstateRoomEmotionalTone` in `lib/sparkEstateRooms/types.ts`

---

## Architectural Identity

Every room should feel like part of **one estate**.

**Shared design language:**

Natural materials · Stone · Wood · Glass · Books · Plants · Fire · Water · Natural light · Beautiful craftsmanship · Timeless architecture

**Never:**

- Futuristic sci-fi environments
- Corporate offices
- Cartoon styling

**Type:** `ArchitecturalIdentityMaterial` · `ArchitecturalIdentityAvoid` in `lib/sparkEstateRooms/types.ts`

Warm light (lanterns, candles, fireplaces) uses [Estate Light Flicker](../.cursor/rules/estate-light-flicker.mdc).

---

## Living Spaces

Every room should feel **inhabited**.

**Examples:**

- Open books
- Fresh coffee
- Handwritten notes
- A chair slightly turned
- Soft lantern light
- Gentle movement

Nothing should feel **staged**.

**Type:** `LivingSpaceDetail` in `lib/sparkEstateRooms/types.ts`

---

## Seasonal Evolution

Rooms quietly evolve.

| Season | Examples |
|--------|----------|
| Spring · Summer · Autumn · Winter | Flowers · lighting · blankets · windows · views |

Without changing the room's **identity**.

**Type:** `EstateSeason` in `lib/sparkEstateRooms/types.ts`

Runtime: `lib/gallery/environmentExperience.ts` · homestead time/season intelligence.

---

## Time of Day

Rooms should respond to time.

| Period | Feeling |
|--------|---------|
| **Morning** | Golden light |
| **Afternoon** | Bright productivity |
| **Evening** | Warm lamps |
| **Night** | Quiet reflections |

Members should feel connected to the **passage of time**.

**Type:** `EstateTimeOfDay` in `lib/sparkEstateRooms/types.ts`

---

## Personalization

As the relationship grows, rooms become more personal.

**Examples:**

- Current notebook
- Favorite books
- Business Assets™ on desks
- Gallery photos
- Current Guild materials
- Spark Cards left open

The room should slowly become **"their room."**

---

## Navigation Through Space

Members should feel like they are **walking through the Estate**.

Not opening applications.

**Examples:**

- Walk into the Library
- Enter the Guild Hall
- Visit the Observatory
- Sit in the Reflection Garden

The environment communicates where experiences live.

See [07 – Estate Navigation](../spark-intelligence-foundation/07-estate-navigation.md) · [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md).

---

## Cognitive Load

Rooms should reduce thinking **before** work begins.

Every room should immediately answer:

| Question | |
|----------|---|
| Why am I here? | |
| What happens here? | |
| What should I do first? | |

No instructions should be required.

The environment should communicate **purpose** through atmosphere and action — not exposition.

---

## Do the thing — never explain the room

**Estate-wide design standard (Spark Estate™).**

No room opens by defining itself.

| Wrong | Right |
|-------|-------|
| "A momentum builder is…" | "Let's figure out the easiest way to move forward today." |
| "Would you like to learn about the Observatory?" | Begin observing — one thoughtful question |
| "The Library is where you…" | Offer the book, topic, or insight the member needs |
| "The Conservatory is…" | Start the conversation the room exists for |

Members arrive to **move forward**, not to learn what a room is called.

**Test:** If a first-time visitor learns a definition or framework name before they get help, the room has failed.

Teaching belongs in the **Library**, **Business Mastery Minutes**, or when the member explicitly asks — never in the arrival moment.

Aligns with [Spec 108 Environment Integration](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md) · [T-012 Momentum Builder Room](./MOMENTUM_BUILDER_ROOM_ARCHITECTURE.md).

---

## Executive Function Support

Every room should:

- Reduce overwhelm
- Limit choices
- Highlight today's priority
- Hide unnecessary complexity
- Allow easy return
- Support interruption and continuation

The room itself should reduce executive function demands.

Aligns with [Spec 103](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) Executive Function First.

**Estate routing:** [Estate Intelligence™](./ESTATE_INTELLIGENCE_FRAMEWORK.md) — Spark leads with the Estate before generic AI answers.

---

## Emotional Design

Every room should have **one dominant emotional tone**.

| Room | Dominant emotion |
|------|------------------|
| Clear My Mind™ | Relief |
| Grow™ | Possibility |
| Create™ | Creative confidence |
| Gallery™ | Pride |
| Observatory™ | Wonder |
| Community™ | Belonging |

**Never mix competing emotions.**

**Type:** `EstateRoomEmotionalTone` in `lib/sparkEstateRooms/types.ts`

---

## Sound Design

Each room should have subtle **environmental sound**.

**Examples:**

Fireplace · Birds · Wind · Water · Pages turning · Soft rain

The soundscape should **support** — not distract from — the room's purpose.

**Type:** `EstateAmbientSound` in `lib/sparkEstateRooms/types.ts`

---

## Estate Continuity

Members should gradually recognize the Estate.

Like returning to a favorite place.

Nothing should feel random.

Every room belongs. Every hallway connects. Every doorway leads somewhere meaningful.

---

## The Room Remembers

The environment should quietly acknowledge the entrepreneur.

**Examples:**

- Today's notebook waiting
- Recent Business Asset on the desk
- A recent Gallery memory framed
- Current Momentum Builder already open

The room feels **prepared**.

Aligns with [T-015 Gallery](./GALLERY_FRAMEWORK.md) · Business Brain™ · Arrival Intelligence.

---

## Success Standard

Members should consistently think:

- *"I want to spend time here."*
- *"This place helps me think."*
- *"It feels peaceful."*
- *"It feels familiar."*
- *"It feels like mine."*

**Type:** `EstateRoomSuccessSignal` in `lib/sparkEstateRooms/types.ts`

---

## Long-Term Vision

Years from now, members should describe Spark differently than other software.

**Not:** *"I use an app."*

**Instead:**

- *"I spent the morning in my Grow Room."*
- *"I was working in the Observatory."*
- *"I reflected in the Gallery."*

Spark becomes a **place** members visit — not merely software they use.

---

## Estate Room Specification Template

Every new room must explicitly define:

| Field | Required |
|-------|----------|
| Primary Purpose | Yes |
| Emotional Goal | Yes |
| Entrepreneurial Capability Supported | Yes |
| Environmental Psychology | Yes |
| Time-of-Day Changes | Yes |
| Seasonal Changes | Yes |
| Personalization Opportunities | Yes |
| Connected Rooms | Yes |
| Business Asset™ Integration | When relevant |
| Executive Function Strategy | Yes |
| Ambient Sound Design | Yes |

If a room cannot improve the member's thinking **before** they begin working, redesign the room before implementation.

**Type:** `SparkEstateRoomSpec` in `lib/sparkEstateRooms/types.ts`

---

## OS vs Experience Layer

| Layer | Role |
|-------|------|
| **Estate Rooms Framework (T-017)** | Why rooms exist — psychology, emotion, purpose |
| **Homestead Room Registry** | `lib/companionHomestead/homesteadRoomRegistry.ts` — V1 room catalog, backgrounds, signature motion |
| **Estate Navigation (OS 07)** | How members move between rooms without feeling like app switching |
| **Universal Experience (Spec 103)** | Cross-room consistency — one relationship |

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/estate-rooms-framework.mdc`

**Framework types:** `lib/sparkEstateRooms/types.ts`

Before shipping any room, answer the Estate Principle™ three questions and complete the Estate Room Specification Template.

The Estate is not a theme.

**The Estate is one of Spark's primary competitive advantages.**

---

**Status:** Foundational v1.0
