# Spark Curriculum Master Index™

**Momentum Institute™ — Phase 4**  
**Version:** 1.0.0  
**Status:** Curriculum map complete — **no lesson content**  
**Mission:** *Help every member become a better entrepreneur.*

This document is Spark's **permanent curriculum roadmap** — the intellectual property behind the Momentum Institute™. Every future Knowledge Card™, Business Mastery Minute™, Deep Lesson™, Apprenticeship™, Simulation™, Business Lab™, Challenge™, Strategy Collection™, Coaching Session™, and Apply To My Business™ experience **must have a place here before it is built**.

**Master blueprint:** [MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md)

---

## What this is

| This IS | This is NOT |
|---------|-------------|
| A capability development map | A course platform |
| A master index of topics to teach | Lesson scripts or videos |
| Structured data for drawers, cards, and AI | An LMS content dump |
| A decades-long growth roadmap | A fixed V1 feature list |

**North star question for every topic:**

> *What capability is this helping the entrepreneur develop?*

---

## Structured data (machine-readable)

**Source of truth:** `lib/sparkCurriculumMasterIndex/`

| File | Purpose |
|------|---------|
| `types.ts` | Curriculum row schema + experience kinds |
| `competencies.ts` | Master competency slug registry |
| `buildEntry.ts` | Consistent row builder + experience bundles |
| `curriculum/buildYourself.ts` | Pillar I topics |
| `curriculum/buildYourBusiness.ts` | Pillar II topics |
| `curriculum/buildYourThinking.ts` | Pillar III topics |
| `curriculum/buildYourLegacy.ts` | Pillar IV topics |
| `masterIndex.ts` | Merged index, stats, JSON export |
| `index.ts` | Public API |

### Export to JSON / database

```typescript
import {
  SPARK_CURRICULUM_MASTER_INDEX,
  curriculumMasterIndexToJson,
  curriculumEntryToKnowledgeCardSeed,
} from "@/lib/sparkCurriculumMasterIndex";

// Full index as JSON string (CMS / DB import)
const json = curriculumMasterIndexToJson();

// Single row → future Knowledge Card catalog seed (no lesson body)
const seed = curriculumEntryToKnowledgeCardSeed(entry);
```

### Curriculum scale (v1.0.0)

| Pillar | Topics |
|--------|--------|
| Build Yourself | 55 |
| Build Your Business | 66 |
| Build Your Thinking | 30 |
| Build Your Legacy | 30 |
| **Total Knowledge Card topics** | **181** |

*Counts from `computeCurriculumStats()` — grows as drawers expand.*

---

## Hierarchy

Every topic belongs in the university model (see **five pillars** in [Master Blueprint](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md)):

```
Momentum Institute™
└── Pillar (5 in Blueprint v1.0 · 4 in current data scaffold)
    └── Department
        └── Drawer
            └── Knowledge Card (Topic)
                └── Future Learning Experiences
```

**Example:**

```
Build Your Business → Marketing → Pricing → Pricing Psychology
```

Aligns with [MOMENTUM_INSTITUTE_ARCHITECTURE.md](./MOMENTUM_INSTITUTE_ARCHITECTURE.md) Phase 3 knowledge architecture.

---

## Topic record schema

Every curriculum row (`CurriculumMasterIndexEntry`) uses the **same structure**:

| Field | Description |
|-------|-------------|
| **Pillar** | `build_yourself` · `build_your_business` · `build_your_thinking` · `build_your_legacy` |
| **Department** | e.g. Marketing, Executive Function, Leadership |
| **Drawer** | Filing cabinet theme, e.g. Pricing, Habits, Public Speaking |
| **Knowledge Card (Topic)** | Canonical concept title, e.g. *Pricing Psychology* |
| **Short Description** | One-line orientation (not lesson content) |
| **Capability Focus** | The capability this topic develops — **required** |
| **Primary Competencies** | Slugs from competency registry |
| **Business Stage** | `idea` · `launch` · `growth` · `scale` · `mature` · `all` |
| **ADHD Relevance** | `none` · `low` · `medium` · `high` — for quiet EF-aware routing |
| **AI Relevance** | `none` · `low` · `medium` · `high` |
| **Difficulty** | `foundational` · `intermediate` · `advanced` · `expert` |
| **Estimated Time** | Typical minutes for primary engagement |
| **Related Topics** | Slugs for relationship engine |
| **Future Learning Experiences** | Which experience types this topic may eventually offer |
| **Status** | `planned` · `in_production` · `published` |

### Example record (structural only)

```json
{
  "id": "cmi-marketing-pricing-pricing-psychology",
  "pillarId": "build_your_business",
  "departmentTitle": "Marketing",
  "drawerTitle": "Pricing",
  "title": "Pricing Psychology",
  "shortDescription": "How price shapes perception.",
  "capabilityFocus": "Price with psychology and integrity.",
  "primaryCompetencies": ["pricing", "sales"],
  "businessStages": ["launch", "growth", "scale"],
  "adhdRelevance": "medium",
  "aiRelevance": "medium",
  "difficulty": "intermediate",
  "estimatedMinutes": 15,
  "futureLearningExperiences": [
    "knowledge_card",
    "business_mastery_minute",
    "deep_lesson",
    "strategy_collection",
    "business_lab",
    "simulation",
    "challenge",
    "reflection",
    "worksheet",
    "coaching_session",
    "apply_to_my_business"
  ],
  "status": "planned"
}
```

---

## Future learning experience types

Not every topic offers every type — availability is declared per topic in data.

| Kind | Label | Typical role |
|------|-------|--------------|
| `knowledge_card` | Knowledge Card™ | Canonical concept anchor |
| `business_mastery_minute` | Business Mastery Minute™ | 5–8 minute grounding |
| `strategy_collection` | Strategy Collection™ | Frameworks and methods |
| `deep_lesson` | Deep Lesson™ | Longer exploration |
| `business_lab` | Business Lab™ | Hands-on implementation |
| `simulation` | Simulation™ | Practice difficult situations |
| `challenge` | Challenge™ | Real-world practice |
| `apprenticeship` | Apprenticeship™ | Multi-week guided development |
| `reflection` | Reflection™ | Personal insight |
| `worksheet` | Worksheet™ | Structured practice artifact |
| `thinking_gym` | Thinking Gym™ | Thinking exercises |
| `coaching_session` | Coaching Session™ | Apply with Shari |
| `apply_to_my_business` | Apply To My Business™ | Personalized implementation |

### Experience bundles

Standard bundles in `buildEntry.ts`:

- **foundational** — minute + reflection + worksheet  
- **core** — minute, deep lesson, strategy, reflection, apply, coaching  
- **practice** — labs, simulations, challenges  
- **mastery** — full stack including apprenticeship  
- **adhd** — thinking gym, worksheets, coaching-friendly  
- **legacy** — teaching, authority, long-horizon impact  

---

## Master competency registry

**Full capability map:** [SPARK_COMPETENCY_FRAMEWORK.md](./SPARK_COMPETENCY_FRAMEWORK.md) — 71 competencies across seven groups, growth levels, mastery indicators.

Curriculum topics reference competencies by **slug**. These map to `GrowthCompetencyDefinition` in the production catalog.

### Build Yourself
`entrepreneur-mindset` · `confidence` · `courage` · `self-trust` · `adhd-entrepreneurship` · `executive-function` · `planning` · `prioritization` · `focus` · `task-initiation` · `time-management` · `productivity` · `momentum` · `habits` · `consistency` · `emotional-intelligence` · `self-awareness` · `resilience` · `recovery` · `energy-management` · `communication` · `listening` · `boundaries` · `negotiation` · `networking` · `personal-leadership` · `influence` · `purpose`

### Build Your Business
`business-foundations` · `business-strategy` · `business-planning` · `mission-vision` · `offers` · `pricing` · `marketing` · `messaging` · `positioning` · `copywriting` · `content-creation` · `storytelling` · `branding` · `sales` · `customer-experience` · `finance` · `cash-flow` · `profitability` · `operations` · `hiring` · `delegation` · `systems` · `automation` · `project-management` · `ai-for-business` · `business-growth` · `scaling` · `partnerships` · `legal-risk-awareness`

### Build Your Thinking
`critical-thinking` · `strategic-thinking` · `systems-thinking` · `creative-thinking` · `visual-thinking` · `decision-making` · `opportunity-recognition` · `problem-solving` · `learning-science` · `research` · `innovation` · `pattern-recognition` · `mental-models`

### Build Your Legacy
`leadership` · `coaching` · `mentoring` · `consulting` · `public-speaking` · `writing` · `course-creation` · `teaching` · `community-building` · `thought-leadership` · `authority` · `legacy-building` · `culture` · `giving-back`

Competencies compose in trees (e.g. **Pricing** → business strategy, communication, confidence, sales). See competency graph in Phase 3 architecture.

---

## Curriculum by pillar (department inventory)

### Pillar I — Build Yourself (55 topics)

| Department | Drawers / themes covered |
|------------|--------------------------|
| Entrepreneur Mindset | Growth mindset, founder identity, risk, self-trust |
| Confidence & Courage | Confidence, fear, perfectionism, imposter syndrome, courage |
| ADHD Entrepreneurship | ADHD foundations, time blindness, task initiation, hyperfocus, RSD, environment, interest motivation |
| Executive Function | Planning, prioritization, decision fatigue, organization, sequencing, cognitive flexibility |
| Productivity & Momentum | Momentum, deep work, procrastination, motivation, batching |
| Emotional Intelligence | Self-awareness, regulation, empathy, conflict |
| Habits & Consistency | Habit design, routines, accountability, keystone habits |
| Resilience & Recovery | Resilience, burnout, failed launch, long absence |
| Focus & Attention | Sustained attention, distractions, digital boundaries |
| Energy Management | Energy mapping, sustainable pace, rest |
| Communication | Listening, boundaries, negotiation, networking, difficult conversations, clarity |
| Personal Leadership | Influence, values, purpose, integrity |

### Pillar II — Build Your Business (66 topics)

| Department | Drawers / themes covered |
|------------|--------------------------|
| Business Foundations | Models, planning, mission, vision, niche, ideal client, values |
| Strategy | Offers, offer stack, differentiation, pivoting |
| Marketing | Pricing, messaging, positioning, headlines, storytelling, copywriting, content, email, social proof, launches, funnels, lead magnets |
| Branding | Identity, voice, trust |
| Sales | Psychology, discovery, closing, objections, proposals, follow-up |
| Customer Experience | Journey, onboarding, retention, support, feedback |
| Finance | Cash flow, profit, forecasting, budgeting, unit economics, tax awareness |
| Operations | Hiring, delegation, team onboarding, vendors |
| Systems | SOPs, automation, CRM, documentation |
| Project Management | Scoping, timelines, capacity |
| AI for Business | Literacy, prompts, workflows, ethics |
| Business Growth | Scaling, partnerships, expansion, content engine |
| Legal & Risk Awareness | Contracts, IP, compliance mindset |

### Pillar III — Build Your Thinking (30 topics)

| Department | Drawers / themes covered |
|------------|--------------------------|
| Critical Thinking | Clear thinking, first principles, bias, patterns |
| Strategic Thinking | Second-order effects, mental models, business analysis, scenarios |
| Systems Thinking | Feedback loops, leverage points |
| Creative Thinking | Ideation, visual thinking, constraints |
| Decision Making | Decision trees, reversible decisions, weighted criteria |
| Opportunity Recognition | Spotting opportunities, trend spotting |
| Problem Solving | Root cause, five whys, problem framing |
| Learning How to Learn | Learning science, metacognition, deliberate practice |
| Research | Business research, customer interviews, competitive analysis |
| Innovation | Innovation mindset, MVP thinking, iteration |

### Pillar IV — Build Your Legacy (30 topics)

| Department | Drawers / themes covered |
|------------|--------------------------|
| Leadership | Founder leadership, culture, delegation, team vision |
| Coaching | Coaching foundations, powerful questions |
| Mentoring | Mentor relationships |
| Consulting | Consulting model, client results |
| Speaking | Public speaking, webinars, stage storytelling |
| Writing | Writing habit, newsletters, books |
| Course Creation | Course design, adult learning, cohorts |
| Community Building | Community design, engagement |
| Thought Leadership | Authority, expert positioning |
| Content Creation | Content systems, video, podcasting, repurposing |
| Legacy Building | Purpose, impact, giving back, succession |

---

## What this curriculum drives

| System | How the index is used |
|--------|------------------------|
| **Drawer contents** | Topics grouped by `drawerId` |
| **Knowledge Cards** | One catalog card per index row |
| **Learning experiences** | `futureLearningExperiences` declares what to build |
| **Estate Intelligence™** | Stage, ADHD, AI relevance for quiet routing |
| **Growth Profile™** | `primaryCompetencies` linkage |
| **Relationship engine** | `relatedTopicSlugs` + prerequisites |
| **Future AI recommendations** | Capability + competency graph + member state |

---

## Adding topics (expansion protocol)

1. Add competency slugs to `competencies.ts` if new.
2. Add row via `buildCurriculumEntry()` in the correct pillar curriculum file.
3. Ensure unique `id` and `slug`.
4. Write `capabilityFocus` before `shortDescription`.
5. Choose an experience bundle or explicit experience list.
6. Run `lib/sparkCurriculumMasterIndex/sparkCurriculumMasterIndex.test.ts`.
7. When ready for catalog, map via `curriculumEntryToKnowledgeCardSeed()`.

**Design for decades:** drawers and topics are cheap to add; lesson bodies are expensive — separate the two permanently.

---

## Relationship to other Spark assets

| Asset | Link |
|-------|------|
| Knowledge Architecture (Phase 3) | [MOMENTUM_INSTITUTE_ARCHITECTURE.md](./MOMENTUM_INSTITUTE_ARCHITECTURE.md) |
| Competency Framework v1.0 | `lib/sparkCompetencyFramework/` · [SPARK_COMPETENCY_FRAMEWORK.md](./SPARK_COMPETENCY_FRAMEWORK.md) |
| Institute catalog types | `lib/sparkMomentumInstitute/types.ts` |
| Runtime engine | `lib/momentumInstitute/` |
| Intelligence registry | `lib/intelligence/INTELLIGENCE_REGISTRY.md` |

---

## Full topic listing

All **181** topics with drawer, title, capability focus, difficulty, time, and experience counts live in structured TypeScript:

```
lib/sparkCurriculumMasterIndex/curriculum/
```

Query in code:

```typescript
import {
  getAllCurriculumEntries,
  getCurriculumByDepartment,
  getCurriculumByDrawer,
} from "@/lib/sparkCurriculumMasterIndex";

const pricing = getCurriculumByDrawer("drawer-dept-marketing-pricing");
```

---

*This index is Spark intellectual property. It defines what the Institute will teach — not how each lesson reads. Content comes later; capability comes first.*
