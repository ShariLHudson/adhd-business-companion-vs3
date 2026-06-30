# SPARK OS™ ARCHITECTURE SPECIFICATION

## Spec 002 — Business Asset Architecture™

| Field | Value |
|-------|-------|
| **Spec Number** | 002 |
| **Spec Title** | Business Asset Architecture™ |
| **Version** | 1.0 |
| **Status** | Foundational |
| **Owner** | Spark Intelligence Foundation |
| **Dependencies** | [001 – Spark Constitution™](./00-spark-constitution.md) |
| **Last Updated** | June 28, 2026 |

---

## Purpose

This specification defines the **Business Asset System™**, which serves as the central organizing structure of Spark OS™.

Rather than organizing information around files, documents, chats, or projects, Spark organizes around **Business Assets™**.

Business Assets become the living objects that entrepreneurs build, improve, connect, and evolve over time.

Every major Spark system interacts with Business Assets.

**Business Assets are the heart of Spark.**

---

## Mission

Entrepreneurs do not build documents.

They build businesses.

Documents are temporary.

Business Assets continue evolving.

Spark exists to help members continuously improve these assets rather than recreate them.

---

## Core Principle

> **Everything important eventually becomes a Business Asset.**

If something contributes to building the member's business, Spark should eventually recognize it as an asset rather than an isolated file.

---

## What Is A Business Asset?

A **Business Asset** is any reusable component that creates value inside the member's business.

Unlike a traditional document, an asset is **alive**.

- It evolves.
- It accumulates knowledge.
- It gains history.
- It connects to other assets.
- It improves over time.

---

## Examples

Business Assets include — but are not limited to —

- Products
- Services
- Offers
- Courses
- Workshops
- Books
- Lead Magnets
- Client Avatars
- Marketing Campaigns
- Sales Funnels
- Presentations
- Websites
- Standard Operating Procedures
- Frameworks
- Methodologies
- Membership Programs
- Coaching Programs
- Email Sequences
- Brand Guidelines
- Prompt Libraries
- AI Workflows
- Business Processes
- Templates
- Checklists
- Decision Frameworks
- Strategic Plans
- Knowledge Libraries

---

## Assets Are Living Objects

A workshop is not simply a PowerPoint presentation.

It is a living collection that may contain:

- Overview
- Purpose
- Audience
- Transformation
- Modules
- Workbook
- Slides
- Speaker Notes
- Marketing Assets
- Landing Page
- Registration System
- Emails
- Testimonials
- Gallery Memories
- Related Spark Cards™
- Momentum Builders™
- Future Ideas
- Version History

Every component belongs to the **Workshop Business Asset**.

---

## Asset Relationships

Business Assets should naturally connect to one another.

**Example:**

```
Workshop
  ↓ Creates
Lead Magnet
  ↓ Supports
Course
  ↓ Feeds
Membership
  ↓ Generates
Testimonials
  ↓ Strengthens
Sales Page
```

Spark should understand these relationships automatically whenever possible.

---

## Asset Ownership

Every Business Asset has one owner.

**The member.**

Spark never owns business assets.

Spark simply helps members develop them.

This reinforces the **Hero Principle™**.

---

## Asset Lifecycle

Business Assets move through natural stages.

| Stage |
|-------|
| Idea |
| Planning |
| Design |
| Building |
| Testing |
| Launch |
| Growth |
| Optimization |
| Archive |
| Legacy |

Different Guidance Engine behaviors may occur at each stage.

---

## Asset Memory

Business Assets accumulate memory over time.

Spark should remember:

- Previous versions
- Lessons learned
- Member reflections
- Important decisions
- Related conversations
- Gallery milestones
- Supporting files
- Associated AI generations
- Connections to other assets

Nothing valuable should be lost simply because time has passed.

---

## Asset Intelligence

Business Assets should become progressively smarter.

Spark may eventually understand:

- Purpose
- Audience
- Business value
- Dependencies
- Strengths
- Weaknesses
- Missing pieces
- Related opportunities
- Potential improvements

Without requiring members to repeatedly explain the same asset.

---

## Connections Across Spark

Every major Spark system should strengthen Business Assets.

| System | Role |
|--------|------|
| **Business Brain™** | Remembers everything about each asset | [003-business-brain.md](./003-business-brain.md) |
| **Guidance Engine™** | Suggests meaningful improvements | [005-guidance-engine.md](./005-guidance-engine.md) |
| **Experience Engine™** | Determines how much complexity to expose |
| **Companion™** | Discusses assets naturally |
| **Create™** | Builds and expands assets | [Spec 104 Create™ Experience](../docs/CREATE_EXPERIENCE_PHILOSOPHY.md) · [T-004](../docs/CREATE_PHILOSOPHY.md) |
| **Momentum Builders™** | Help members implement assets |
| **Spark Cards™** | Teach concepts relevant to assets |
| **Gallery™** | Records meaningful milestones |
| **Estate™** | Provides an emotional home for entrepreneurial growth |
| **Community™** | Allows members to learn from one another through shared experiences without exposing private business assets |

---

## Asset Expansion

Every completed asset creates new opportunities.

**Example:** A completed workshop may naturally expand into:

- Course
- Book
- Workbook
- Landing Page
- Speaker Kit
- Podcast Series
- Newsletter
- Social Campaign
- Lead Magnet
- Mini Course
- Presentation
- Certification

Spark should surface these possibilities **thoughtfully** rather than automatically generating everything.

---

## Asset Discovery

Members should never need to remember where something was saved.

Instead they should think naturally.

**Example:**

> "Show me everything related to my ADHD workshop."

Spark assembles the complete Business Asset.

Not a list of disconnected files.

---

## Design Principles

Business Assets should always feel:

| Quality |
|---------|
| Persistent |
| Organized |
| Connected |
| Expandable |
| Understandable |

**Never** fragmented.

**Never** disposable.

**Never** buried.

---

## Things This Specification Does Not Define

This specification does **not** define:

- User Interface
- Storage implementation
- Database schema
- API design
- AI prompts
- Conversation flow

Those are addressed by later specifications.

---

## Success Criteria

This specification is successful when:

1. Members think in terms of their business — not their files.
2. Spark remembers business context naturally.
3. Assets continuously improve over time.
4. Members rarely recreate work they have already done.
5. Every major Spark system strengthens Business Assets.
6. Business Assets become the living center of the Spark ecosystem.

---

## Related internal docs

- [00-spark-constitution.md](./00-spark-constitution.md) — governing behavioral law
- [003-business-brain.md](./003-business-brain.md) — Business Brain™ (OS memory layer)
- [08-memory-engine.md](./08-memory-engine.md) — Business Memory Engine (implementation)
- `lib/intelligence/INTELLIGENCE_REGISTRY.md` — object × engine registry
- [004-spark-knowledge-model.md](./004-spark-knowledge-model.md) — Asset Knowledge™ category
- `lib/sparkKnowledgeModel/types.ts` — canonical enums
- `lib/intelligence/intelligenceReadyTypes.ts` — shared lineage hooks (`business-asset` kind)

---

**Status:** Foundational v1.0
