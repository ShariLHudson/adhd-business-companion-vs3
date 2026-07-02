# Universal Knowledge Card™ Framework

**Momentum Institute™ — the standard learning object everything else is built from.**

| Field | Value |
|-------|-------|
| **Status** | Canonical template — all Institute lesson content |
| **Runtime type** | `KnowledgeCardDefinition` in `lib/sparkMomentumInstitute/types.ts` |
| **Panel / drawer UI** | `lib/momentumInstitute/drawerWall/knowledgeCardViewModel.ts` |
| **Related** | [MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md](../MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md) · [MOMENTUM_INSTITUTE_ARCHITECTURE.md](../MOMENTUM_INSTITUTE_ARCHITECTURE.md) · [SPARK_COMPETENCY_FRAMEWORK.md](../SPARK_COMPETENCY_FRAMEWORK.md) · [estate/momentum-institute.md](../estate/momentum-institute.md) · [departments/MARKETING.md](./departments/MARKETING.md) (Dept #1 gold standard) |

---

## Purpose

Every piece of learning inside the **Momentum Institute™** is built as a **Knowledge Card™**.

Knowledge Cards™ are the **building blocks of the entire Institute** — one important idea per card, taught exceptionally well. Never overload a card. If a topic needs two big ideas, it needs two cards.

A card is **never finished.** Experiences, apprenticeships, and coaching layers grow **from** the card by reference — they never duplicate it.

### Where Knowledge Cards™ live

| Container | Role |
|-----------|------|
| **Knowledge Collections™** | Drawer filing — index cards grouped by theme (e.g. Pricing, Delegation) |
| **Apprenticeships™** | Multi-week arcs that sequence many cards |
| **Business Mastery Minutes™** | Fast grounding on one card |
| **Thinking Gym™** | Cognitive reps attached to thinking cards |
| **Business Labs™** | Hands-on application of one card |
| **Challenges™** | Real-world practice from one card |
| **Simulations™** | Safe rehearsal of one card’s decision skill |
| **Coaching Conversations™** | Discuss with Shari™ · Make It Mine™ on one card |

**Hierarchy:** Pillar → Department → Drawer (collection) → **Knowledge Card™** → Learning Experience(s)

---

## The one-concept rule

Before writing or approving any card, answer:

> **What is the ONE idea this card owns?**

| Pass | Fail |
|------|------|
| “Why customers buy on emotion before logic” | “Marketing, sales, and branding overview” |
| “How to name a price without apologizing” | “Everything about pricing strategy” |
| “One follow-up habit after networking” | “Complete guide to networking” |

If you cannot state the idea in one sentence, **split the card**.

---

## Standard structure

Every Knowledge Card™ contains **fifteen sections**. Members may see these across the learning panel, experiences, and conversation — not always as fifteen visible headings. Authors still write all fifteen so content stays complete and consistent.

---

### 1. Title

**Short · clear · benefit-focused.**

The title names the **capability or insight**, not the academic category.

| Good | Avoid |
|------|-------|
| Why Customers Actually Buy | Consumer Behavior 101 |
| Name Your Price With Confidence | Pricing Module 3 |
| The One Follow-Up That Builds Trust | Networking Best Practices |

**Runtime:** `KnowledgeCardDefinition.title` · index card headline · panel title

---

### 2. Essential Question

**What question does this card answer?**

One question. The card exists to help the member answer it for *their* business.

**Example:** *Why do customers actually buy?*

Other examples:

- *What makes a price feel fair — not just low?*
- *How do I start a conversation without feeling salesy?*
- *What is the smallest brave step after a networking event?*

**Authoring tip:** If the essential question has “and” in the middle, you may have two cards.

---

### 3. Why This Matters

Explain why mastering this concept **changes business results**.

Focus on **practical impact** — revenue, trust, time, stress, decisions, relationships. No theory for its own sake.

**Voice:** “When you understand this, you stop guessing why offers stall.” — not “This topic is important in modern commerce.”

**Runtime:** Often opens the panel as `introduction` / `description` · first paragraph of Business Mastery Minute™

---

### 4. Core Principle

**The single most important takeaway.**

If someone remembers only one thing after this card, this is it.

One sentence. Plain language. No hedge words.

**Example (pricing):** *People buy the story of the outcome before they buy the price tag.*

**Runtime:** Anchor for Spark synthesis · repeated gently in Make It Mine™ · Growth Profile competency signal

---

### 5. Key Ideas

**Three to seven** supporting concepts.

| Rule | Detail |
|------|--------|
| Count | 3–7 — never 12 |
| Style | Simple · actionable · evidence-based |
| Format | Short bullets or numbered lines — not paragraphs |
| Test | Each idea could become one reflection question |

**Example (pricing psychology):**

1. Buyers decide emotionally first, then justify with logic.
2. Confidence in your price changes how the buyer feels about quality.
3. “Cheap” and “fair” are different fears — name which one you are fighting.
4. Anchoring works both ways — your framing sets the comparison.
5. Silence after stating a price is a skill, not awkwardness.

**Runtime:** `objectives` + `mainContent` sections in learning panel · Deep Lesson body

---

### 6. Real Business Example

One **realistic entrepreneurial scenario** — solo founder, small team, service or product business Spark members recognize.

Avoid fictional corporate jargon, Fortune 500 case studies, or made-up brand names unless clearly illustrative.

**Pattern:** Situation → what went wrong or right → tie back to Core Principle.

**Example:** *Maria raised her coaching rate from $150 to $225. She almost apologized in the email. Instead she named the transformation her clients already thanked her for. Three said yes the same week — one said “I was wondering when you’d charge what you’re worth.”*

---

### 7. Reflection Questions

Help members **think** — not quiz them.

**Always include variations of:**

- How does this show up in **your** business?
- What are you already doing well?
- Where are you getting stuck?
- What would change if you tried one idea this week?

**3–5 questions** per card. One at a time in conversation.

**Runtime:** `reflectionQuestions` in `KnowledgeCardLearningContent` · Discuss with Shari™ prompts

---

### 8. Make It Mine™

The bridge from **learning → implementation**.

**Always offer (never force):**

- How could this apply to your business?
- Would you like help adapting this?

This may launch a **facilitated workspace** with Shari — permission before drafts, one question at a time (Spec 106).

**Forbidden:** Auto-generating a full plan · homework piles · “Apply these 10 steps”

**Runtime:** `apply_to_my_business` experience · `instituteMakeItMineTurn()` · Creative Studio™ bridge when artifact needed

---

### 9. Try It This Week™

**One small action.** Simple · achievable · momentum-building.

Not a project. Not a overhaul. Something they can do in **&lt; 30 minutes** unless the card explicitly teaches deep work.

**Examples:**

- Write your price on paper and read it aloud without apologizing.
- Send one genuine follow-up to someone you met last month.
- List three outcomes your clients thank you for — use one in your offer.

**Runtime:** Challenge™ seed · coaching follow-up · optional Evidence Vault™ prompt after completion

---

### 10. Common Mistakes

Highlight **typical misconceptions** or implementation errors — with compassion, not shame.

**Pattern:** Mistake → why it happens → what to do instead

**Examples:**

- *Lowering price to feel safe — and training buyers to wait for discounts.*
- *Explaining every feature before naming the outcome.*
- *Following up once, deciding “they’re not interested,” and missing the quiet yes.*

---

### 11. Related Competencies™

List **competencies strengthened** by this lesson.

Use slugs from [Spark Competency Framework™](../SPARK_COMPETENCY_FRAMEWORK.md).

**Runtime:** `competencyIds` on `KnowledgeCardDefinition` · panel “Competency” label · Growth Profile™

**Example (pricing card):** `pricing-confidence` · `value-communication` · `decision-quality`

---

### 12. Related Knowledge Cards™

Suggest **what to explore next** — same drawer, prerequisite, or natural sequel.

**Relationship kinds** (architecture):

| Kind | Meaning |
|------|---------|
| `related` | Thematic neighbor |
| `prerequisite` | Understand this first |
| `advanced` | Go deeper after this card |
| `recommended_next` | Natural next step |

**Runtime:** `relatedKnowledgeCardIds` · `suggestedNextKnowledgeCardIds` · `relationships` in catalog

**Rule:** Recommend **one primary** next card in conversation — not a menu of five.

---

### 13. Related Apprenticeships™

Show **larger learning journeys** connected to this topic.

**Example:** Pricing Psychology card → *Marketing Confidence™ Apprenticeship*

Apprenticeships sequence many cards — the card is one step in the arc, not the whole journey.

**Runtime:** `RelatedLearningItem` kind `apprenticeship` · learning path definitions

---

### 14. Progress Tracking

Member status tracks **engagement and growth** — not grades.

| Status | Meaning |
|--------|---------|
| **Not Started** | Card discovered but not opened |
| **In Progress** | Learning experience or conversation active |
| **Completed** | Finished an experience or meaningful pass through the card |
| **Applied** | Tried It This Week™ or Make It Mine™ in the real business |
| **Mastered** | Repeated use + evidence of capability (Growth Profile™, quiet) |

**V1 runtime** (`knowledgeCardMemberState.ts`): `not_started` · `in_progress` · `completed` · `saved` (filed in My Institute Cabinet™). **Applied** and **Mastered** map to Growth Profile™ and Evidence Vault™ signals as those systems mature — authors should still write for the full lifecycle.

**Never:** streaks · public leaderboards · shame for “not completed”

---

### 15. Save Options

Members choose what to do with a card — Spark suggests, never demands.

| Option | Purpose |
|--------|---------|
| **Save to My Institute Cabinet™** | File for easy return |
| **Journal about it** | Private reflection |
| **Discuss with Shari™** | Coaching conversation in-room |
| **Return later** | No pressure — card stays in drawer |
| **Mark as Favorite** | Quick return (future) |

**Permission:** Save and journal require consent for durable storage (Spec 112).

**Runtime:** `InstituteLearningAction` — `save_to_cabinet` · `discuss_with_shari` · `apply_to_my_business`

---

## Learning principles

Every Knowledge Card™ must:

| Principle | Meaning |
|-----------|---------|
| **Teach one concept** | Split overloaded topics |
| **Be practical** | Tomorrow’s business, not yesterday’s textbook |
| **Avoid unnecessary theory** | Theory only when it unlocks action |
| **Be conversational** | Sounds like Shari beside them |
| **Be immediately useful** | At least one idea usable this week |
| **Encourage reflection** | Questions before answers |
| **Lead into application** | Make It Mine™ · Try It This Week™ |

---

## Voice

Write as if an **experienced entrepreneur is coaching another entrepreneur**.

| Always | Never |
|--------|-------|
| Plain language | Academic tone |
| Short sentences | Textbook headings and lectures |
| Stories and examples | Corporate jargon |
| One question, then wait | Walls of bullet frameworks |
| Warm confidence | “It is important to note that…” |
| Member owns the decision | Spark as authority figure |

Spark teaches through **clarity, stories, questions, and practical wisdom** — not information dumps.

**Shari test:** Would Shari say this across the table? If it sounds like AI or a course, rewrite.

**Human voice:** See [SPARK_HUMAN_VOICE_RULES.md](../SPARK_HUMAN_VOICE_RULES.md).

---

## Authoring template

Copy this block for every new card.

```markdown
# Knowledge Card™ — [Title]

**Essential question:** [One question]
**Drawer / collection:** [Department → Drawer]
**Difficulty:** foundational | intermediate | advanced | expert
**Estimated time:** [minutes]

## Why this matters
[2–4 sentences — practical impact]

## Core principle
[One sentence]

## Key ideas
1.
2.
3.
(3–7 total)

## Real business example
[Scenario — entrepreneurial, realistic]

## Reflection questions
-
-
-

## Make It Mine™
- How could this apply to your business?
- Would you like help adapting this?

## Try It This Week™
[One small action]

## Common mistakes
-
-

## Related competencies™
- [slug]
-

## Related knowledge cards™
- [card id or title] — [relationship]

## Related apprenticeships™
- [Apprenticeship name]

## Progress & save
Statuses: Not Started → In Progress → Completed → Applied → Mastered
Save: Cabinet · Journal · Discuss · Return later · Favorite
```

---

## Worked example — Pricing Psychology

**Title:** Why Customers Actually Buy

**Essential question:** Why do customers say yes — even when the price is higher than they expected?

**Why this matters:** Most founders underprice because they think buyers are spreadsheets. Buyers are humans. When you understand what they are really purchasing, you stop competing on discount and start competing on trust.

**Core principle:** People buy the outcome they believe in — and the confidence you show in delivering it.

**Key ideas:**

1. Emotion chooses; logic explains the receipt.
2. Buyers use price as a shortcut for quality when they lack other signals.
3. Confident pricing filters for better clients — it is not cruelty.
4. The story before the number matters more than the number itself.
5. Objections are often requests for reassurance, not rejection.

**Real business example:** *James sold websites. He listed features for twenty minutes. Crickets. He tried again: “You told me you lose leads after 6pm — I build the site that captures them.” Same price. Yes.*

**Reflection questions:**

- What outcome do your clients thank you for — in their words?
- Where are you still selling features instead of transformation?
- What would confident pricing look like if you believed your results?

**Make It Mine™:** How could this apply to your offer? Would you like help rewriting one sentence of your pitch?

**Try It This Week™:** Ask one past client what changed for them after working with you. Use their words in one line of your offer.

**Common mistakes:** Apologizing for price · listing every feature · matching the cheapest competitor · changing price before changing the story

**Related competencies™:** `pricing-confidence` · `value-communication` · `customer-understanding`

**Related knowledge cards™:** Name Your Price With Confidence (recommended_next) · Value-Based Offers (related)

**Related apprenticeships™:** Marketing Confidence™

---

## Experience layering (one card, many doors)

Every experience **references** the card by `knowledgeCardId` — never copies lesson body.

| Experience | Typical use of card sections |
|------------|------------------------------|
| Business Mastery Minute™ | Core Principle + one Key Idea + Try It This Week™ |
| Deep Lesson™ | Full Key Ideas + Example + Common Mistakes |
| Thinking Gym™ | Reflection Questions + simulation of decision |
| Business Lab™ | Make It Mine™ + workspace |
| Challenge™ | Try It This Week™ + evidence capture |
| Simulation™ | Real Business Example → branching choices |
| Apprenticeship™ | Sequences multiple cards over weeks |
| Coaching Session™ | Discuss with Shari™ on Reflection Questions |

---

## Quality checklist (before publish)

- [ ] One concept only — essential question is singular
- [ ] Title is benefit-focused, not academic
- [ ] Core principle fits on one breath
- [ ] 3–7 key ideas — each actionable
- [ ] Example is entrepreneurial, not corporate fiction
- [ ] Reflection questions use “your business”
- [ ] Make It Mine™ asks permission
- [ ] Try It This Week™ is small enough to actually do
- [ ] Common mistakes are compassionate, not shaming
- [ ] Competency slugs exist in Competency Framework
- [ ] Related cards use graph relationships — not random links
- [ ] Voice passes Shari test and Human Voice Rules
- [ ] Card registered in catalog with unique `id` / `slug`
- [ ] Experiences reference card — no duplicate content objects

---

## Success

After this framework, every lesson inside the Momentum Institute™ feels **consistent** regardless of topic — Marketing, Sales, Networking, Leadership, Confidence, AI, Pricing, Decision Making, Communication, Strategic Thinking, and everything that follows.

The member always gets:

- One clear idea
- Practical wisdom
- Room to reflect
- A path to apply
- Familiar rhythm — **not** a new interface per topic

**This document is the universal template for every future Knowledge Card™ in the Momentum Institute™.**

---

## Sync

When this framework changes:

1. Update `KnowledgeCardDefinition` / CMS schema if new fields are required
2. Update `resolveKnowledgeCardLearningContent()` placeholders in `knowledgeCardContent.ts`
3. Update [MOMENTUM_INSTITUTE_ARCHITECTURE.md](../MOMENTUM_INSTITUTE_ARCHITECTURE.md) data models section
4. Notify curriculum authors via [SPARK_CURRICULUM_MASTER_INDEX.md](../SPARK_CURRICULUM_MASTER_INDEX.md)
