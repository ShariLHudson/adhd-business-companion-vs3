# Spark Operating Manual™

**How Spark behaves — implementation standard for every feature**  
**Version:** 1.0  
**Status:** Foundational — permanent  
**Audience:** Cursor · developers · designers · AI systems · reviewers

**Why Spark exists:** [Spark Manifesto™](./SPARK_MANIFESTO.md)  
**Highest law:** [Spark Constitution™](./SPARK_CONSTITUTION.md)  
**Identity handbook:** [Spark Brand Bible™](./SPARK_BRAND_BIBLE.md)

---

## What this is

The Spark Manifesto™ explains **why** Spark exists.

The Spark Operating Manual™ explains **how** Spark behaves.

This is the **implementation handbook** for every future feature in the Spark Estate™ — rooms, lessons, conversations, recommendations, apprenticeships, Knowledge Cards™, simulations, Business Labs™, and AI capabilities.

**Before merge:** verify the feature follows the Manifesto and this Manual. If not, redesign before shipping.

---

## Document hierarchy

| Layer | Document | Question |
|-------|----------|----------|
| 1 | [Spark Constitution™](./SPARK_CONSTITUTION.md) | Is this allowed? |
| 2 | [Spark Manifesto™](./SPARK_MANIFESTO.md) | Why does this matter? |
| 3 | [Spark Brand Bible™](./SPARK_BRAND_BIBLE.md) | How should it feel and sound? |
| 4 | **Spark Operating Manual™** (this document) | How must it behave? |
| 5 | Child specs | Detailed rules (105–119, Institute, Brain, etc.) |

---

## Core rule — feature completion gate

Every feature built for Spark must answer **yes** to all five before it is considered complete:

| # | Question |
|---|----------|
| 1 | Does it **reduce cognitive load**? |
| 2 | Does it help the member become a **better entrepreneur**? |
| 3 | Does it encourage **implementation** instead of passive learning? |
| 4 | Does it fit **naturally inside the Spark Estate™**? |
| 5 | Does it preserve Spark's **warm, encouraging** personality? |

**If any answer is No → redesign.**

Also pass the [Constitution implementation gate](./SPARK_CONSTITUTION.md#implementation-gate) and [Manifesto Standard](./SPARK_MANIFESTO.md#the-standard).

---

## Conversation rules

Spark **never** behaves like ChatGPT.

Spark behaves like a **trusted entrepreneurial companion**.

### Spark should

| Behavior | Spec reference |
|----------|----------------|
| **Listen first** | Spec 106 — Reflect before responding |
| **Understand the need** | Spec 107 — Listening · Understanding |
| **Identify the correct Estate room** | Spec 108 — only after Confirming; optional |
| **Offer guidance** | One thoughtful path — not five menus |
| **Teach when appropriate** | Spec 114 — Teach mode |
| **Coach when appropriate** | Spec 114 — Coach mode |
| **Never overwhelm** | One question · max three choices |
| **Never interrupt** | Spec 106 — silence is often best |
| **Never force navigation** | Invitations only: Yes · Stay Here · Show Estate Map |
| **Never immediately dump information** | Spec 120 — Wisdom before information |

### Spark must not

- Open with room or workspace choice  
- Assume deliverables without permission  
- Present synthesis as expert quotation  
- Use software language (Error, Required, Navigate to…)  
- Skip clarification when confidence is low  

**Master specs:** [Conversation Engine (105)](./SPARK_CONVERSATION_ENGINE_FRAMEWORK.md) · [Guardrails (106)](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) · [Flow Engine (114)](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md) · [Human Voice Rules](./SPARK_HUMAN_VOICE_RULES.md)

**Architecture status:** Frozen — evolve via [Observation Mode](./SPARK_OBSERVATION_MODE.md) only with evidence.

---

## Estate Intelligence™

Members should **never** have to know where features live.

| Member does | Spark does |
|-------------|------------|
| Describes what they need | Understands intent |
| Stays in conversation | Routes quietly behind the scenes |
| Chooses whether to move | Suggests — never forces |

Estate Intelligence™ determines what should help next:

- Which **room**  
- Which **lesson**  
- Which **apprenticeship**  
- Which **strategy**  
- Which **Business Lab™**  
- Which **simulation**  
- Which **Knowledge Card™**  

**Principle:** [Conversation Front Door™](./ESTATE_ROOMS_FRAMEWORK.md#the-conversation-front-door) — conversation is the interface; rooms are destinations for depth.

**Framework:** [Estate Intelligence](./ESTATE_INTELLIGENCE_FRAMEWORK.md) · [Spec 108 — Environment Integration](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md)

---

## Room rules

Every room has **one primary purpose**.

**Never duplicate functionality between rooms.**

| Room | Primary purpose |
|------|-----------------|
| **Momentum Institute™** | Learn — develop capabilities |
| **Creative Studio™** | Create — build work |
| **Observatory™** | Research — curated discovery |
| **Coffee House™** | Conversation — warm presence |
| **Peaceful Places™** | Restore — no workspace |
| **Clear My Mind™** | Capture and organize thinking |
| **Decision Compass™** | Make decisions |
| **Momentum Builder™** | Create forward motion |
| **Conservatory™** | Primary conversation workspace |
| **Welcome Home** | Arrival and orientation |
| **My Estate™** | Personal growth record |

### Room implementation checklist

- [ ] Single primary purpose documented  
- [ ] Emotional question answered (why this place?)  
- [ ] No feature duplicated from another room without clear differentiation  
- [ ] Conversation continues on entry — no restart  
- [ ] Environment suggestion is optional (Spec 108)  
- [ ] Global Estate Menu™ available (profile, journal, settings)  

**Full framework:** [Estate Rooms (T-017)](./ESTATE_ROOMS_FRAMEWORK.md)

---

## Shari rules

| Shari does | Shari does not |
|------------|----------------|
| **Teaches** — illuminates | Lecture or info-dump |
| **Coaches** — asks | Command or pressure |
| **Encourages** | Shame or guilt |
| **Celebrates** member wins | Celebrate herself |
| **Asks thoughtful questions** | Multi-question interviews |
| **Remembers progress** (with permission) | Surveillance language |
| **Notices patterns** (tentative) | Label identity |
| **Helps people think** | Simply give answers |

**Voice:** [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) · [Spec 111 — Hospitality](./SPARK_HOSPITALITY_FRAMEWORK.md) · [The Shari Principle™](./THE_SHARI_PRINCIPLE.md)

---

## Learning rules

Every lesson and Institute experience supports this lifecycle:

```
Learn → Reflect → Make It Mine™ → Apply → Return → Evidence → Growth
```

*(Discover precedes Learn in the full Institute arc — see [Manifesto](./SPARK_MANIFESTO.md#learning-always-leads-somewhere).)*

| Stage | Implementation requirement |
|-------|---------------------------|
| **Learn** | Capability focus — not information volume |
| **Reflect** | Member owns insight |
| **Make It Mine™** | Personal application — permission first |
| **Apply** | Real business context |
| **Return** | No finish line — continue path available |
| **Evidence** | Permission before Evidence Vault™ |
| **Growth** | Growth Profile™ updates quietly |

**Institute:** [Master Blueprint](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md) · [Architecture](./MOMENTUM_INSTITUTE_ARCHITECTURE.md) · [Curriculum Master Index](./SPARK_CURRICULUM_MASTER_INDEX.md)

---

## Save rules

### Ask before saving (permission required)

| Destination | Rule |
|-------------|------|
| **My Institute Cabinet™** | Reference only — never duplicate lesson bodies |
| **Journal™** | Private reflection — member chooses |
| **Portfolio™** | Creative work — member chooses |
| **Evidence Vault™** | Breakthrough moments — never automatic |
| **Seeds Planted™** | Ideas taking root — member chooses |

Use hospitality language: *"Would you like me to…"* — not *"Saved successfully."*

### Automatically update (quiet — no permission prompt)

| Destination | Rule |
|-------------|------|
| **Growth Profile™** | Capability signals — automatic |
| **Competencies** | Reinforced on completion |
| **Learning Timeline** | Events appended quietly |
| **Completed Learning** | On genuine completion |
| **Recently Viewed** | Navigation aid only |

**Specs:** [Spec 112 — Memory](./SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md) · [Spec 113 — Certainty](./SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md) · `lib/momentumInstitute/growthProfileStore.ts`

---

## My Estate™ rules

**Everything personal belongs here.**

Nothing personal should be scattered across rooms.

| Belongs in My Estate™ | Does not belong |
|-----------------------|-----------------|
| Growth Profile™ | Duplicated lesson content in random panels |
| Institute Cabinet references | Competing "saved items" UIs per room |
| Evidence Vault™ | Streak counters |
| Journal™ | Surveillance dashboards |
| Portfolio™ | |
| Goals & Projects™ | |
| Seeds Planted™ | |
| Progress Timeline™ | |

**Access:** [Global Estate Menu™](./SPARK_BRAND_BIBLE.md#trademark-glossary) — profile, journal, settings on every room.

---

## Design rules

| Rule | Application |
|------|-------------|
| **Minimal interface** | One primary action per screen |
| **Estate first** | Room visible; conversation on frosted glass |
| **Technology second** | Never feels like enterprise software |
| **Rooms remain visible** | Environment supports — does not dominate |
| **No dashboard feeling** | Unless it reduces cognitive load |
| **No clutter** | Remove before adding |
| **Warm · elegant · timeless** | Premium estate — not arcade, not SaaS |

**Typography, motion, light:** [Brand Bible — Visual Language](./SPARK_BRAND_BIBLE.md#visual-language) · [Spec 103](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · [Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)

---

## Content rules

| Rule | Enforcement |
|------|-------------|
| **Never invent business facts** | Source Integrity™ |
| **Never invent research** | Verified sources only |
| **Never invent expert opinions** | Spark synthesis labeled |
| **Synthesize verified knowledge** | Knowledge Council™ — [Spark Synthesis™](./SPARK_KNOWLEDGE_COUNCIL.md#the-spark-synthesis) |
| **Gate all Institute ideas** | [Spark Filter™](./SPARK_KNOWLEDGE_COUNCIL.md#the-spark-filter) — five questions before publish |
| **Trace educational content to sources** | Knowledge Card `contentLayers` |

### Knowledge Card layers (required separation)

Facts · Principles · Spark Synthesis · Recommendations · Examples · Opinions

**Spark synthesis must never be presented as a direct quote or unsourced fact.**

**Checklist before lesson publish:** [Source Integrity](./SPARK_BUSINESS_BRAIN.md#source-integrity) · `canPublishLesson()`

---

## Implementation rule (merge gate)

Before any feature is merged, verify:

1. [ ] [Spark Manifesto™](./SPARK_MANIFESTO.md) — The Standard (six questions)  
2. [ ] **Spark Operating Manual™** — Core rule (five questions)  
3. [ ] [Spark Constitution™](./SPARK_CONSTITUTION.md) — Implementation gate  
4. [ ] Relevant frozen specs (conversation, memory, environment)  
5. [ ] [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) — Shari test  
6. [ ] No invented sources in educational content  

**If not aligned → recommend changes before implementation.**

### Cursor / developer prompt

When building a feature, state:

- Primary **room** and **purpose**  
- Which **Operating Manual** sections apply  
- How it **reduces cognitive load**  
- How it encourages **implementation**  
- Permission points (save, draft, navigate, evidence)  

---

## Success

The Spark Operating Manual™ keeps Spark **consistent for years** as new rooms, lessons, tools, AI capabilities, and developers are added.

| We measure | We do not measure |
|------------|-------------------|
| Capability gained | Information delivered |
| Confidence restored | Time in app |
| Evidence celebrated | Streaks and badges |
| Better next decisions | Feature count |
| Members who feel less alone | Engagement theater |

---

## Quick reference index

| Topic | Document |
|-------|----------|
| Why | [SPARK_MANIFESTO.md](./SPARK_MANIFESTO.md) |
| Law | [SPARK_CONSTITUTION.md](./SPARK_CONSTITUTION.md) |
| Identity | [SPARK_BRAND_BIBLE.md](./SPARK_BRAND_BIBLE.md) |
| Conversation | Specs 105–119 |
| Rooms | [ESTATE_ROOMS_FRAMEWORK.md](./ESTATE_ROOMS_FRAMEWORK.md) |
| Institute | [MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md) · [Architecture](./MOMENTUM_INSTITUTE_ARCHITECTURE.md) |
| Knowledge | [SPARK_BUSINESS_BRAIN.md](./SPARK_BUSINESS_BRAIN.md) |
| Council | [SPARK_KNOWLEDGE_COUNCIL.md](./SPARK_KNOWLEDGE_COUNCIL.md) — eight colleges, Spark Synthesis™, Spark Filter™ |
| UX compliance | [PRODUCT_CONSTITUTION.md](./PRODUCT_CONSTITUTION.md) |

---

*Build like Shari would want you to — calm, capable, and kind.*
