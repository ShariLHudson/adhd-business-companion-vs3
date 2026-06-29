# Spark Discipline Orchestrator™

**v1.0 — Assemble the right business expertise behind one voice.**

| Field | Value |
|-------|-------|
| **Priority** | Domain layer — invoked by [Intelligence Engine](./05-intelligence-engine.md) per [Routing Plan](./09-spark-performance-routing-engine.md) |
| **Governed by** | [Spark Constitution™](./00-spark-constitution.md) |
| **Outputs to** | Intelligence Engine (internal contributions) → unified member response |
| **Pack specs** | [`disciplines/`](./disciplines/) |
| **Status** | Draft v1.0 |

---

## Purpose

The Spark Discipline Orchestrator™ assembles the appropriate combination of **business disciplines** behind the scenes for every member interaction.

Members should never decide whether they need Marketing, Sales, Strategy, Finance, Research, or Copywriting.

**Spark makes that decision automatically.**

The result should feel like an experienced **executive team quietly collaborating** before presenting **one unified recommendation**.

---

## Mission Statement

No entrepreneur succeeds by relying on one specialty.

Spark should think the same way.

Every important business decision should benefit from **multiple perspectives** while remaining **simple** for the member.

---

## Core Philosophy

Spark does **not** imitate famous business experts.

Spark studies the **enduring principles** behind exceptional work across every business discipline.

Each discipline represents the accumulated knowledge, research, frameworks, psychology, best practices, and methodologies of an **entire profession** — not a single individual.

---

## Responsibilities

The Discipline Orchestrator must:

| Responsibility | Behavior |
|----------------|----------|
| Determine which disciplines are **required** | `requiredDisciplines[]` |
| Determine which disciplines are **optional** | `optionalDisciplines[]` |
| Avoid activating unnecessary disciplines | Efficiency Rules |
| Resolve conflicts between disciplines | Conflict Resolution |
| Present **one unified** internal synthesis | `orchestratedBrief` |
| Never expose internal orchestration | Unless member explicitly requests depth |

Members hear **Spark** — not a panel of experts.

---

## Available Disciplines (v1.0)

| ID | Discipline |
|----|------------|
| `business-strategy` | Business Strategy |
| `marketing` | Marketing |
| `sales` | Sales |
| `wordsmith` | Wordsmith (Copywriting) |
| `creative-direction` | Creative Direction |
| `research` | Research |
| `finance` | Finance |
| `operations` | Operations |
| `leadership` | Leadership |
| `customer-experience` | Customer Experience |
| `learning-coach` | Learning Coach |
| `ai-automation` | AI & Automation |
| `brand-strategy` | Brand Strategy |
| `technology-advisor` | Technology Advisor |
| `product-development` | Product Development |
| `project-management` | Project Management |
| `productivity` | Productivity |
| `legal-awareness` | Legal Awareness *(general guidance only — never legal advice)* |

Future disciplines register in catalog without orchestrator rewrite (extensible `disciplineId` registry).

---

## Discipline Specifications

### Business Strategy

| Field | Value |
|-------|-------|
| **Purpose** | Help members make better long-term business decisions |
| **Focus** | Business models, growth, positioning, competitive advantage, planning, priorities, tradeoffs |
| **Success metric** | Clear direction |

---

### Marketing

| Field | Value |
|-------|-------|
| **Purpose** | Help members attract the right audience |
| **Focus** | Messaging, positioning, campaigns, offers, brand awareness, customer psychology, traffic, content strategy |
| **Success metric** | The right people become interested |

---

### Sales

| Field | Value |
|-------|-------|
| **Purpose** | Help members convert opportunities into customers |
| **Focus** | Trust, sales conversations, objections, pricing, negotiation, follow-up, closing, relationship selling |
| **Success metric** | Customers confidently buy |

---

### Wordsmith

| Field | Value |
|-------|-------|
| **Purpose** | Help members communicate clearly and persuasively |
| **Focus** | Writing, editing, storytelling, email, books, courses, sales pages, newsletters, calls to action |
| **Success metric** | The message creates the intended response |

---

### Creative Direction

| Field | Value |
|-------|-------|
| **Purpose** | Improve visual communication |
| **Focus** | Brand identity, typography, presentation, photography, graphics, video, user experience, design systems |
| **Success metric** | Visual clarity |

---

### Research

| Field | Value |
|-------|-------|
| **Purpose** | Provide trustworthy information |
| **Focus** | Verification, competition, market analysis, technology, current trends, sources, fact checking |
| **Success metric** | Accurate recommendations |

---

### Finance

| Field | Value |
|-------|-------|
| **Purpose** | Protect business health |
| **Focus** | Pricing, profitability, cash flow, forecasting, margins, investment, financial planning |
| **Success metric** | Sustainable business growth |

---

### Operations

| Field | Value |
|-------|-------|
| **Purpose** | Help members execute efficiently |
| **Focus** | Processes, systems, documentation, automation, project management, delegation, scaling |
| **Success metric** | Reliable execution |

---

### Leadership

| Field | Value |
|-------|-------|
| **Purpose** | Improve leadership decisions |
| **Focus** | Communication, hiring, delegation, culture, conflict, vision, decision making |
| **Success metric** | Healthy leadership |

---

### Customer Experience

| Field | Value |
|-------|-------|
| **Purpose** | Improve how customers feel throughout the journey |
| **Focus** | Onboarding, support, retention, feedback, journey mapping, loyalty, expectations |
| **Success metric** | Customers feel valued and stay |

---

### Learning Coach

| Field | Value |
|-------|-------|
| **Purpose** | Help members build durable business skills |
| **Focus** | Frameworks, practice, skill progression, reflection, microlearning, Business Mastery alignment |
| **Success metric** | Member applies what they learn |

---

### AI & Automation

| Field | Value |
|-------|-------|
| **Purpose** | Identify where technology saves time or improves outcomes |
| **Focus** | Automation, AI workflows, integrations, efficiency, emerging tools |
| **Success metric** | More time for meaningful work |

*Conversation before automation — Constitution Article IV.*

---

### Brand Strategy

| Field | Value |
|-------|-------|
| **Purpose** | Define and evolve how the business is perceived |
| **Focus** | Brand architecture, positioning, promise, differentiation, voice, long-term identity |
| **Success metric** | Coherent brand the member can execute |

---

### Technology Advisor

| Field | Value |
|-------|-------|
| **Purpose** | Guide technical choices without replacing specialists |
| **Focus** | Stack selection, build vs. buy, feasibility, integrations, technical risk |
| **Success metric** | Sound technical decisions for the business stage |

---

### Product Development

| Field | Value |
|-------|-------|
| **Purpose** | Help members design and evolve offers and products |
| **Focus** | Offer design, MVP scope, iteration, customer discovery, product-market fit signals |
| **Success metric** | Products people want and can deliver |

---

### Project Management

| Field | Value |
|-------|-------|
| **Purpose** | Move initiatives from idea to done without overwhelm |
| **Focus** | Scope, milestones, dependencies, realistic timelines, handoffs |
| **Success metric** | Projects finish without chaos |

---

### Productivity

| Field | Value |
|-------|-------|
| **Purpose** | Help members work sustainably — not hustle theater |
| **Focus** | Focus, energy, realistic capacity, ADHD-friendly execution patterns |
| **Success metric** | Meaningful progress without burnout |

*Not activated by default for Support / overwhelmed routes.*

---

### Legal Awareness

| Field | Value |
|-------|-------|
| **Purpose** | Surface when legal topics need professional counsel |
| **Focus** | General awareness of contracts, entities, compliance flags — **never legal advice** |
| **Success metric** | Member knows when to consult a lawyer |
| **Hard rule** | Always disclaim; never pretend to be counsel |

---

## Collaboration Rules

The disciplines are **teammates**.

| Rule | Meaning |
|------|---------|
| They never compete in member-facing copy | Internal debate only |
| They never produce separate answers | One `orchestratedBrief` |
| Orchestrator combines | Intelligence Engine reconciles for voice |
| One primary discipline | Others advisory unless breadth requested |
| Support routes | Minimal or zero disciplines until Conversation Engine clarifies need |

```ts
type DisciplineOrchestrationResult = {
  required: DisciplineId[];
  optional: DisciplineId[];
  contributions: DisciplineContribution[];
  orchestratedBrief: string;
  conflicts?: ConflictResolution;
  primaryDiscipline: DisciplineId;
  exposedToMember: false; // unless debug / member asks "how are you thinking?"
};
```

---

## Activation Examples

### Example 1 — Landing page

**Member:** *"I need a landing page."*

| Activate | Do NOT activate |
|----------|-----------------|
| Marketing | Finance |
| Wordsmith | Leadership |
| Creative Direction | Operations |
| Strategy (light — offer fit) | |

---

### Example 2 — Raising prices

**Member:** *"I'm thinking about raising my prices."*

| Activate |
|----------|
| Strategy |
| Marketing |
| Sales |
| Finance |
| Customer Experience |

---

### Example 3 — Starting a membership

**Member:** *"I want to start a membership."*

| Activate |
|----------|
| Strategy |
| Marketing |
| Finance |
| Operations |
| Research |
| Wordsmith |
| AI & Automation |

---

### Example 4 — Overwhelmed

**Member:** *"I'm overwhelmed."*

| Rule |
|------|
| Do **not** activate every discipline |
| [Conversation Engine](./02-conversation-engine.md) + [Objective Engine](./01-spark-objective-engine.md) determine primary need first |
| Activate additional disciplines **only** when they genuinely help |

Typically: **none** or Support-adjacent only until clarified.

---

## Conflict Resolution

Disciplines may disagree internally.

**Example:**

| Discipline | Position |
|------------|----------|
| Marketing | Lower price to convert |
| Finance | Protect margin |
| Strategy | Reposition the offer |

**Orchestrator must:**

1. Capture each position with rationale
2. Explain tradeoffs in synthesis (for Intelligence Engine to voice)
3. Recommend the **most balanced path** for member objective
4. Never ship contradictory advice to the member

Hand off to [Intelligence Engine](./05-intelligence-engine.md) `ConflictResolution` — Orchestrator produces discipline-level positions; Intelligence Engine owns final member framing.

---

## Efficiency Rules

| Rule | Rationale |
|------|-----------|
| Do not activate disciplines that add no value | Performance & Routing lazy load |
| More experts ≠ better answers | Thoughtful collaboration |
| Required vs. optional split | Required run; optional only if budget and objective warrant |
| Respect `RoutingPlan.disciplineOrchestrator` | Empty list = orchestrator idle |

Validated by [Response Evaluation Engine](./10-spark-response-evaluation-engine.md) Step 4.

---

## Pipeline Position

```
RoutingPlan (which disciplines may load)
    ↓
Objective Engine (what member needs)
    ↓
Intelligence Engine (requests orchestration)
    ↓
Spark Discipline Orchestrator™  ← this module
    · Load discipline packs from disciplines/
    · Run required → optional
    · Synthesize orchestratedBrief
    ↓
Intelligence Engine (unified draft + conflict resolution)
    ↓
Conversation / Communication / Evaluation
```

Discipline packs are **lazy-loaded** per [Performance & Routing](./09-spark-performance-routing-engine.md).

---

## Future Expansion

Every discipline should eventually have:

| Asset |
|-------|
| Its own Knowledge Library slice |
| Its own Smart Card collections |
| Its own research sources |
| Its own workflows |
| Its own templates |
| Its own Business Mastery lessons |
| Its own quality standards |

The Orchestrator supports **unlimited future disciplines** via registry — no monolithic code path.

Scaffold packs under [`disciplines/`](./disciplines/) — one file per discipline when ready.

---

## Founder Mode

Founder Mode extends the Discipline Orchestrator for **operator** context — never mixed into member voice without role gate.

In addition to member disciplines, Founder Mode may activate:

| System |
|--------|
| Future Lab |
| Observatory |
| Competitive Intelligence |
| Trend Scanner |
| Innovation Pipeline |
| Knowledge Curator |
| Executive Board |
| Founder Research Library |

These systems help **continuously improve Spark itself**.

Spec: [`founder/`](./founder/) · member disciplines remain bounded and privacy-safe.

---

## Orchestration Exposure

| Default | Exception |
|---------|-----------|
| Internal only | Member asks *"how are you thinking about this?"* |
| No expert names in copy | May explain tradeoffs in plain language |
| No committee tone | One Spark voice |

---

## Success Metric

The Discipline Orchestrator succeeds when members consistently feel:

| Feeling |
|---------|
| *"It felt like Spark brought together exactly the right expertise."* |
| *"I didn't have to figure out who to ask."* |
| *"The advice felt complete."* |
| *"The response considered things I hadn't thought about."* |

The member should **never think about orchestration**.

They should experience remarkably **well-rounded business guidance**.

**Internal metrics:**

- Discipline count per route (should match examples, not inflate)
- Optional discipline activation rate
- Conflict resolution rate without member-reported contradiction
- Over-activation on Support routes (should be near zero)

---

## Implementation Notes

- **Not wired to production.** v1.0 is specification only.
- Implement as `orchestrateDisciplines(input: OrchestrationInput): DisciplineOrchestrationResult`.
- Each discipline: `evaluate{Discipline}()` reading pack from `disciplines/{id}.md` or structured config.
- Map to existing `lib/*Intelligence*.ts`, business intelligence ecosystem.
- Legal Awareness: hard block on prescriptive legal output; flag `referToCounsel: true`.
- Register discipline object kinds in `lib/intelligence/INTELLIGENCE_REGISTRY.md`.

---

**Status:** Draft v1.0
