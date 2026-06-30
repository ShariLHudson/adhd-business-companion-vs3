# CURSOR SPEC — T-015 Gallery™ Framework

## Entrepreneurial Transformation Architecture™

| Field | Value |
|-------|-------|
| **Spec ID** | T-015 |
| **Title** | Gallery™ Framework |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Gallery™, Estate™, Guidance™, Companion™, Create™, Momentum Builders™, Spark Cards™, Business Assets™, Guilds™, Observatory™, Business History™ |
| **Related** | [Spec 100 — Transformation Constitution](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) · [T-004 Create™ Philosophy](./CREATE_PHILOSOPHY.md) · [T-005 Experience Patterns](./EXPERIENCE_PATTERNS.md) · [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) · [T-011 Spark Cards](./SPARK_CARD_FRAMEWORK.md) · [T-012 Momentum Builders](./MOMENTUM_BUILDER_FRAMEWORK.md) · [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [T-016 Daily Discoveries](./DAILY_DISCOVERIES_FRAMEWORK.md) · [002 – Business Asset Architecture](../spark-intelligence-foundation/002-business-asset-architecture.md) · [005 – Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) |

---

## Purpose

This specification defines the philosophy and architecture of Gallery™.

Gallery™ is **not** an activity log.

It is **not** a history page.

It is **not** a list of completed tasks.

Gallery™ is the **living story** of an entrepreneur becoming who they were meant to become.

It preserves **transformation**.

Not activity.

---

## Core Philosophy

People rarely remember:

- What they clicked
- What they opened
- What they completed

They remember:

- Breakthroughs
- Decisions
- Courage
- Growth

Spark should preserve those moments.

---

## Gallery Exists To…

Help members:

- Recognize growth
- Remember lessons
- Celebrate courage
- Reflect on decisions
- Reconnect with purpose
- Build confidence
- See progress across years

Gallery should answer:

> **"How have I changed?"**

Not:

> "What have I done?"

---

## Gallery Is A Living Story

Gallery should feel like:

- A beautiful journal
- A museum
- A collection
- A memory album
- An entrepreneurial autobiography

**Never:**

- A task list
- A dashboard
- A spreadsheet

---

## What Belongs In Gallery™

Gallery should preserve:

- Business Assets™
- Major decisions
- Momentum breakthroughs
- Guild milestones
- Spark Card discoveries
- Business anniversaries
- Launches
- Pivots
- Recovery moments
- Personal reflections
- Business lessons
- Founder stories
- Creative breakthroughs
- Rare discoveries
- Estate memories
- Observatory insights that changed thinking

**Type:** `GalleryPreserveableMoment` in `lib/sparkGallery/types.ts`

---

## What Does NOT Belong

Avoid recording:

- Every click
- Every session
- Every Builder completed
- Routine navigation
- Minor actions

Gallery should remain **meaningful**.

**Type:** `GalleryExcludedActivity` in `lib/sparkGallery/types.ts`

---

## Gallery Categories™

| Category | Preserves |
|----------|-----------|
| **Milestones™** | Launches · products · offers · books · courses · business achievements |
| **Breakthroughs™** | Moments where thinking changed · perspective shifted · confidence increased |
| **Reflections™** | Thoughts worth remembering · lessons · insights · journal moments |
| **Decisions™** | Important entrepreneurial decisions · why they were made · what was learned |
| **Business Assets™** | Completed or significantly improved Business Assets™ |
| **Discovery™** | Rare Spark Cards™ · Estate discoveries · Business History · Observatory insights |
| **Seasons™** | Chapters of entrepreneurship — growth · recovery · reinvention · expansion · legacy |

**Type:** `GalleryCategory` in `lib/sparkGallery/types.ts`

**V1 wall kinds:** `GalleryMemoryKind` in `lib/gallery/types.ts` — runtime hallway frames; map to these categories when curating.

---

## Timeline Philosophy

Gallery is chronological.

But not every day deserves equal attention.

- Highlight meaningful moments
- Quietly compress routine periods
- Emphasize transformation

---

## Reflection Prompts™

Occasionally Gallery should ask:

- *"What changed because of this?"*
- *"What did you learn?"*
- *"What would you tell your past self?"*
- *"What deserves remembering?"*

Reflection deepens memory.

**Type:** `GALLERY_REFLECTION_PROMPTS` in `lib/sparkGallery/types.ts`

---

## Business Asset™ Integration

Every major Business Asset™ should have:

| Field | |
|-------|---|
| Creation date | |
| Major revisions | |
| Launches | |
| Lessons | |
| Related Spark Cards™ | |
| Related Momentum Builders™ | |

Gallery preserves the **story behind the asset**.

**Type:** `GalleryBusinessAssetStory` in `lib/sparkGallery/types.ts`

See [002 – Business Asset Architecture](../spark-intelligence-foundation/002-business-asset-architecture.md).

---

## Estate Integration

The Estate should occasionally celebrate Gallery memories.

**Examples:**

- *"Five years ago…"*
- *"One year since your first workshop…"*
- *"Remember this breakthrough?"*

History becomes part of the environment.

Aligns with [T-010 Founder Journey](./FOUNDER_JOURNEY_FRAMEWORK.md) and `lib/gallery/environmentExperience.ts`.

---

## Guidance Integration

Guidance should occasionally reference Gallery.

**Examples:**

- *"You solved something similar last year."*
- *"This reminds me of your pricing breakthrough."*

Past growth strengthens future confidence.

See [005 – Guidance Engine](../spark-intelligence-foundation/005-guidance-engine.md) · [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md).

---

## Spark Card™ Integration

Important Spark Cards™ become:

- Knowledge milestones
- Not reading history
- **Transformation moments**

See [T-011 Spark Card Framework](./SPARK_CARD_FRAMEWORK.md).

---

## Momentum Builder™ Integration

Only **meaningful** Momentum moments belong.

**Examples:**

- Decision breakthrough
- Creative insight
- Leadership growth

**Not:**

- Completed Builder #27

See [T-012 Momentum Builder Framework](./MOMENTUM_BUILDER_FRAMEWORK.md).

---

## Companion Behavior

The Companion should naturally reference Gallery.

**Examples:**

- *"Do you remember…"*
- *"You've actually solved something similar before."*
- *"One of your favorite ideas came from…"*

Members should feel:

> *"I've come farther than I realized."*

Passes [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) Shari test — gentle memory, never surveillance.

---

## Executive Function Standards

Gallery should reduce:

- Remembering
- Searching
- Losing important ideas
- Repeating lessons

Gallery becomes **external memory**.

---

## Emotional Experience

Members should feel:

- Proud
- Encouraged
- Grounded
- Hopeful
- Capable

Gallery should **never**:

- Create guilt
- Compare members
- Imply they should have done more

---

## Search & Discovery

Gallery should allow exploration through:

- Business Assets™
- Capabilities
- Journey stages
- Years
- Categories
- Topics
- People
- Projects

Members should enjoy **rediscovering themselves**.

**Type:** `GallerySearchDimension` in `lib/sparkGallery/types.ts`

---

## Success Standard

Members should regularly think:

- *"I forgot I'd done that."*
- *"I've actually grown."*
- *"I've learned more than I realized."*
- *"I'm building something meaningful."*

**Type:** `GallerySuccessSignal` in `lib/sparkGallery/types.ts`

---

## Long-Term Vision

Imagine opening Spark after ten years.

Gallery shouldn't feel like software.

It should feel like opening a **beautifully curated autobiography** of your entrepreneurial life.

Every breakthrough. Every pivot. Every courageous decision. Every important lesson. Every Business Asset™. Every season.

Preserved with dignity.

Gallery becomes one of the most emotionally meaningful experiences in Spark.

---

## Gallery Preservation Gate™

Every experience should ask:

| # | Question |
|---|----------|
| 1 | Should this become part of Gallery? |
| 2 | What category? |
| 3 | Why does it matter? |
| 4 | How will it help the member in the future? |
| 5 | How could future Guidance™ use this memory? |

Only preserve moments that contribute to the member's **entrepreneurial story**.

Gallery should always prioritize **significance over quantity**.

**Type:** `SparkGalleryPreservationGate` · `GALLERY_PRESERVATION_QUESTIONS` in `lib/sparkGallery/types.ts`

---

## Gallery Specification Template

When designing a feature that may write to Gallery:

| Field | Required |
|-------|----------|
| Category | Yes |
| Significance rationale | Yes |
| Transformation narrative (one sentence) | Yes |
| Related Business Asset™ | When relevant |
| Related Spark Card™ / Momentum Builder™ | When relevant |
| Reflection prompt opportunity | When appropriate |
| Guidance reuse hook | When appropriate |
| EF benefit (what remembering burden is removed) | Yes |

**Type:** `SparkGallerySpec` in `lib/sparkGallery/types.ts`

---

## OS vs Experience Layer

| Layer | Role |
|-------|------|
| **Gallery Curator Intelligence** | `lib/gallery/galleryCuratorIntelligence.ts` — which memories surface on the wall today |
| **Gallery™ Framework (T-015)** | **What deserves preservation** and how Gallery should feel across the ecosystem |
| **Ecosystem Connection (T-014)** | How Gallery connects to Guidance, Estate, and the living cycle |

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/gallery-framework.mdc`

**Framework types:** `lib/sparkGallery/types.ts`

**Runtime V1:** `lib/gallery/` — hallway walk, wall frames, curator, environment

Before adding a Gallery memory or surfacing a wall frame, pass the Gallery Preservation Gate. Significance over quantity — always.

---

**Status:** Foundational v1.0
