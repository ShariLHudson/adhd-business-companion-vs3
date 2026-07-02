# Spark Competency Framework™

**Version:** 1.0  
**Status:** Permanent — master capability map for the Momentum Institute™  
**Runtime scaffold:** `lib/sparkCompetencyFramework/` · **Curriculum slugs:** `lib/sparkCurriculumMasterIndex/competencies.ts`

**Governs under:** [Spark Constitution™](./SPARK_CONSTITUTION.md) · [Entrepreneurial Transformation Constitution™](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) · [Momentum Institute Master Blueprint](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md)

**Related:** [Spark Knowledge Council™](./SPARK_KNOWLEDGE_COUNCIL.md) · [Spark Curriculum Master Index™](./SPARK_CURRICULUM_MASTER_INDEX.md) · [Momentum Institute Architecture](./MOMENTUM_INSTITUTE_ARCHITECTURE.md)

---

## Purpose

Spark does **not** organize learning around courses.  
Spark organizes learning around **competencies**.

A **competency** is an ability that helps someone become a more capable entrepreneur — judged by better decisions, real application, and confidence restored, not by content consumed.

The Spark Competency Framework™ is the **master map** behind:

| System | Role |
|--------|------|
| **Knowledge Cards™** | One concept → one capability signal |
| **Business Mastery Minutes™** | Fast capability touch |
| **Apprenticeships™** | Guided practice over time |
| **Business Labs™** | Safe experimentation |
| **Simulations™** | Decision rehearsal |
| **Thinking Gym™** | Cognitive reps |
| **Coaching Sessions™** | Personalized capability work |
| **Estate Intelligence™** | Quiet recommendation by growth need |
| **Growth Profile™** | *What capabilities is this entrepreneur developing?* |
| **Personalized recommendations** | One thoughtful next step — never five |

> **The Momentum Institute™ teaches knowledge.**  
> **The Spark Competency Framework™ develops entrepreneurs.**

---

## What every competency contains

Every competency in this framework is defined by:

| Field | Meaning |
|-------|---------|
| **Competency Name** | Member-facing capability label |
| **Slug** | Stable ID for curriculum, Growth Profile, and Brain |
| **Purpose** | Why this capability matters to an entrepreneur |
| **Description** | What the capability is — in plain language |
| **Business Importance** | How it changes revenue, trust, operations, or sustainability |
| **Related Competencies** | Cross-disciplinary growth edges |
| **Primary Departments** | Institute homes (pillar → department) |
| **Suggested Learning Experiences** | How Spark typically builds it |
| **Mastery Indicators** | What *mastery* looks like in real business life |
| **How Spark Builds It** | Institute + Companion patterns |
| **How It Is Measured** | Evidence-based signals — not grades |
| **Cross Connections** | Departments and competencies this strengthens |

---

## Architecture

### Five pillars (member journey)

Aligned with [Momentum Institute Master Blueprint](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md) v1.0:

```
Momentum Institute™
├── Pillar 1 — Build Yourself™          (Self Leadership · ADHD · Personal Growth)
├── Pillar 2 — Build Your Business™   (Business · Operations · Finance · AI)
├── Pillar 3 — Build Your Thinking™   (Entrepreneurial Thinking)
├── Pillar 4 — Build Your Influence™  (Communication · Visibility)
└── Pillar 5 — Build Your Legacy™     (Mentoring · Lasting impact)
```

> **Runtime note:** `lib/sparkCompetencyFramework/competencyFrameworkV1.ts` currently implements **four** pillar IDs; influence departments (Speaking, Writing, Community, etc.) live under **Build Your Legacy** until migration splits **Build Your Influence™**. This document follows the **five-pillar** blueprint.

### Seven competency groups

Groups are how members and designers **think** about capabilities. A single competency may appear in multiple groups and departments — that is intentional interdisciplinary design.

| Group | Primary pillars | Competency count |
|-------|-----------------|------------------|
| Self Leadership | Build Yourself™ | 10 |
| Entrepreneurial Thinking | Build Your Thinking™ | 10 |
| Business | Build Your Business™ | 16 |
| Communication | Build Your Influence™ · Build Yourself™ | 9 |
| AI | Build Your Business™ | 8 |
| ADHD Entrepreneurship | Build Yourself™ (flagship) | 10 |
| Personal Growth | Build Yourself™ · Build Your Legacy™ | 8 |
| **Total** | | **71** |

### Departments vs competencies

| Layer | Question it answers |
|-------|---------------------|
| **Pillar** | *Which part of the entrepreneur is growing?* |
| **Department** | *Where does this live in the Institute?* |
| **Drawer** | *What theme organizes Knowledge Cards?* |
| **Competency** | *What ability is actually strengthening?* |
| **Knowledge Card™** | *What concept teaches toward that ability?* |

Departments organize **knowledge**. Competencies organize **growth**.

---

## Growth levels

Every competency supports **seven levels**. These are **not grades**. They represent **growth**.

| Level | Meaning | Member might say |
|-------|---------|------------------|
| **Exploring** | Curious; language is new | "I'm learning what this even means." |
| **Learning** | Grasping principles; not yet applied | "I understand the idea — haven't used it much." |
| **Practicing** | Trying in low-stakes situations | "I'm experimenting in my business." |
| **Applying** | Using reliably when it matters | "I actually did this last week." |
| **Confident** | Defaults to this capability under pressure | "I trust myself here." |
| **Mastering** | Refines, teaches self, adapts across contexts | "I can handle edge cases." |
| **Mentoring** | Helps others grow the same capability | "I can show someone else how." |

**Runtime slug map:** Level 2 is stored as `understanding` in `GrowthCompetencyLevel` — member-facing label **Learning**.

Progression is **not linear on a calendar**. A member may be *Applying* in Marketing and *Exploring* in Financial Literacy. That is normal.

### What Spark never uses

Streaks · course completion % · points · leaderboards · "behind" language

### What Spark does use

Evidence of application · coaching reflection · Growth Profile trends · capability-linked recommendations

---

## Growth Profile™

The Growth Profile™ answers:

> **"What capabilities is this entrepreneur developing?"**

Not:

> ~~"What courses have they finished?"~~

| Profile shows | Profile does not show |
|---------------|------------------------|
| Competency levels over time | Lesson counts |
| Strengths emerging | Badges |
| Gentle gaps (invitation, not shame) | Rankings |
| Cross-competency patterns | Time-on-platform trophies |
| Evidence links (when member saves) | Surveillance |

**Types:** `lib/sparkMomentumInstitute/` · Growth Profile stores · Evidence Bank bridges

---

## Cross connections (interdisciplinary growth)

Competencies are **nodes**. Growth is **relational**.

**Example — Confidence** connects to:

Sales · Public Speaking · Networking · Leadership · Marketing · Pricing · Decision Making · Opportunity Recognition · Executive Function

**Design rule:** When Spark recommends learning, it may route through a **related competency** the member is ready for — not only the "obvious" department.

**Graph engine (runtime):** `lib/momentumInstitute/knowledgeArchitecture/competencyGraph.ts`

---

## How Spark builds competencies (shared patterns)

| Pattern | Builds capability by… |
|---------|------------------------|
| **Knowledge Card™** | One insight → one idea → one action |
| **Business Mastery Minute™** | Fast orientation without overwhelm |
| **Make It Mine™** | Application to *their* business |
| **Thinking Gym™** | Reps for judgment, not information |
| **Business Lab™** | Safe trial before real stakes |
| **Simulation™** | Rehearsal before costly decisions |
| **Apprenticeship™** | Structured practice over weeks |
| **Coaching Session™** | Personalized capability conversation |
| **Evidence Bank™** | Proof of real-world growth |
| **Companion** | Coaching between Institute visits |

Every experience must pass [Educational Standards™](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md#educational-standards) and the [Spark Filter™](./SPARK_KNOWLEDGE_COUNCIL.md#the-spark-filter).

---

## Measurement philosophy

| Signal type | Example |
|-------------|---------|
| **Application** | Member used pricing framework on a real offer |
| **Decision quality** | Chose better next step after Decision Making work |
| **Confidence restored** | Self-report + behavior (e.g. sent the email) |
| **Evidence artifact** | Saved win, journal entry, exported doc |
| **Coaching continuity** | Companion references capability naturally |
| **Cross-competency lift** | Sales improved after Confidence + Messaging |

Measurement serves **the member's next decision** — not Spark's dashboard.

---

# Competency groups

---

## Group 1 — Self Leadership

**Pillar:** Build Yourself™  
**Council college:** [Entrepreneurial Leadership](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-entrepreneurial-leadership) · [ADHD Entrepreneurship](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-adhd-entrepreneurship)

| Competency | Slug | Primary departments |
|------------|------|---------------------|
| Confidence | `confidence` | Confidence & Courage · Sales · Speaking |
| Courage | `courage` | Confidence & Courage · Personal Leadership |
| Self-awareness | `self-awareness` | Emotional Intelligence · Entrepreneur Mindset |
| Resilience | `resilience` | Resilience & Recovery |
| Growth Mindset | `entrepreneur-mindset` | Entrepreneur Mindset |
| Discipline | `consistency` | Habits & Consistency · Productivity & Momentum |
| Emotional Regulation | `emotional-intelligence` | Emotional Intelligence |
| Focus | `focus` | Focus & Attention |
| Consistency | `consistency` | Habits & Consistency |
| Adaptability | `resilience` | Resilience & Recovery · Entrepreneur Mindset |

### Confidence (`confidence`)

| | |
|--|--|
| **Purpose** | Act in the business without waiting for perfect certainty |
| **Description** | Trusting your judgment enough to speak, sell, price, and decide in public |
| **Business Importance** | Unblocks revenue, visibility, and leadership — fear hides capability |
| **Related Competencies** | Courage · Sales · Public Speaking · Pricing · Decision Making · Executive Function |
| **Primary Departments** | Confidence & Courage · Sales · Speaking |
| **Suggested Experiences** | Knowledge Cards · Coaching Sessions · Simulations (sales call) · Evidence Bank |
| **Mastery Indicators** | States price without apology · publishes before "ready" · recovers from "no" without spiral |
| **How Spark Builds It** | Small wins · permission-based drafts · Coach With Shari™ · celebration of member action |
| **How It Is Measured** | Evidence of acts done · Growth Profile trend · reduced avoidance patterns in conversation |
| **Cross Connections** | Marketing · Networking · Leadership · Opportunity Recognition |

### Courage (`courage`)

| | |
|--|--|
| **Purpose** | Move forward when the outcome is uncertain |
| **Description** | Willingness to try, ship, ask, and lead before comfort arrives |
| **Business Importance** | Launches, hires, and pivots require tolerating risk |
| **Related Competencies** | Confidence · Resilience · Decision Making · Public Speaking |
| **Primary Departments** | Confidence & Courage · Personal Leadership |
| **Suggested Experiences** | Thinking Gym · Business Labs · Apprenticeships · Reflection |
| **Mastery Indicators** | Takes one meaningful risk per week · names fear without stopping |
| **How Spark Builds It** | Gentle challenge (Spec 124) · one-action completions · recovery without shame |
| **How It Is Measured** | Documented attempts · Evidence Bank · coaching follow-through |
| **Cross Connections** | Marketing · Sales · Innovation · Executive Function |

### Self-awareness (`self-awareness`)

| | |
|--|--|
| **Purpose** | Know your patterns, triggers, and strengths as an operator |
| **Description** | Seeing how you think, work, and lead — without harsh self-judgment |
| **Business Importance** | Prevents repeating burnout cycles and mis-hires |
| **Related Competencies** | Emotional Regulation · Executive Function · Decision Making · Reflection |
| **Primary Departments** | Emotional Intelligence · Entrepreneur Mindset |
| **Suggested Experiences** | Journal · Reflection · Coaching Sessions · Knowledge Cards |
| **Mastery Indicators** | Names own patterns early · adjusts plan before crisis |
| **How Spark Builds It** | Observation without surveillance · Memory Center preferences · honest coaching |
| **How It Is Measured** | Journal themes · self-correction in conversation · fewer surprise overwhelm events |
| **Cross Connections** | Habits · Energy Management · Leadership · ADHD Entrepreneurship |

### Resilience (`resilience`)

| | |
|--|--|
| **Purpose** | Return to clarity after setback, absence, or failed launch |
| **Description** | Bounce back without shame — dignity preserved |
| **Business Importance** | Businesses outlast bad quarters; entrepreneurs must outlast bad weeks |
| **Related Competencies** | Adaptability · Emotional Regulation · Courage · Recovery |
| **Primary Departments** | Resilience & Recovery |
| **Suggested Experiences** | Recovery-oriented Knowledge Cards · Companion support · Evidence of preserved work |
| **Mastery Indicators** | Returns without guilt narrative · one small forward step after hard season |
| **How Spark Builds It** | [T-007 Resilience](./ENTREPRENEURIAL_RESILIENCE.md) · no streak surveillance · assets preserved |
| **How It Is Measured** | Return quality · capability restored · continued asset lineage |
| **Cross Connections** | Executive Function · Overwhelm Recovery · Motivation · Focus |

### Growth Mindset (`entrepreneur-mindset`)

| | |
|--|--|
| **Purpose** | Treat capability as developable, not fixed |
| **Description** | Learning from experiments; separating identity from single outcomes |
| **Business Importance** | Enables pivots, iteration, and long arcs |
| **Related Competencies** | Learning Agility · Curiosity · Resilience · Innovation |
| **Primary Departments** | Entrepreneur Mindset |
| **Suggested Experiences** | Knowledge Cards · Apprenticeships · Thinking Gym |
| **Mastery Indicators** | Reframes failure as data · invests in learning deliberately |
| **How Spark Builds It** | Transformation cycle (Spec 100) · no finish lines · member owns wins |
| **How It Is Measured** | Iteration behavior · Growth Profile breadth · reflection depth |
| **Cross Connections** | Strategic Thinking · Problem Solving · Personal Growth |

### Discipline (`consistency`)

| | |
|--|--|
| **Purpose** | Follow through on commitments that matter — without rigidity |
| **Description** | Steady execution aligned to priorities, ADHD-friendly when needed |
| **Business Importance** | Reliability builds trust with customers and team |
| **Related Competencies** | Consistency · Habits · Focus · Executive Function · Planning |
| **Primary Departments** | Habits & Consistency · Productivity & Momentum |
| **Suggested Experiences** | Business Mastery Minutes · Labs · systems Knowledge Cards |
| **Mastery Indicators** | Keeps few promises consistently · uses systems instead of willpower alone |
| **How Spark Builds It** | Reduce EF load · one priority · Momentum Builder connection |
| **How It Is Measured** | Completed meaningful actions · reduced chaos signals · member-reported follow-through |
| **Cross Connections** | Operations · Project Management · Energy Management |

### Emotional Regulation (`emotional-intelligence`)

| | |
|--|--|
| **Purpose** | Stay constructive under stress, conflict, and uncertainty |
| **Description** | Managing emotional intensity so thinking and relationships stay intact |
| **Business Importance** | Protects deals, team culture, and decision quality |
| **Related Competencies** | Self-awareness · Listening · Conflict Resolution · Resilience |
| **Primary Departments** | Emotional Intelligence |
| **Suggested Experiences** | Knowledge Cards · Peaceful Places · Coaching · Reflection |
| **Mastery Indicators** | Pauses before reactive emails · names emotion without being ruled by it |
| **How Spark Builds It** | Hospitality first · regulation before productivity · optional restoration rooms |
| **How It Is Measured** | Recovery time · decision repair rate · companion trust signals |
| **Cross Connections** | Negotiation · Leadership · Sales · Overwhelm Recovery |

### Focus (`focus`)

| | |
|--|--|
| **Purpose** | Direct attention to the work that moves the business |
| **Description** | Sustained attention on one meaningful thread — with ADHD-aware design |
| **Business Importance** | Finishes revenue work instead of endless preparation |
| **Related Competencies** | Attention Management · Executive Function · Prioritization · Discipline |
| **Primary Departments** | Focus & Attention |
| **Suggested Experiences** | Thinking Gym · Focus Audio · Apprenticeships · timed Labs |
| **Mastery Indicators** | Chooses one thread · completes deep work sessions · fewer context switches |
| **How Spark Builds It** | Companion-led focus · environment optional · no shame for brain style |
| **How It Is Measured** | Deep work evidence · project completion · self-reported clarity |
| **Cross Connections** | Planning · Time Blindness · Motivation · Operations |

### Consistency (`consistency`)

| | |
|--|--|
| **Purpose** | Show up reliably for customers, team, and future self |
| **Description** | Repeatable rhythms — not perfection every day |
| **Business Importance** | Trust compounds; inconsistency erodes brand and team morale |
| **Related Competencies** | Habits · Discipline · Energy Management · Systems Thinking |
| **Primary Departments** | Habits & Consistency |
| **Suggested Experiences** | Knowledge Cards · Make It Mine · Momentum appointments |
| **Mastery Indicators** | Maintains core rhythms through hard weeks · rest without abandonment guilt |
| **How Spark Builds It** | Gentle recovery · no streak punishment · capability over activity metrics |
| **How It Is Measured** | Rhythm adherence (member-defined) · customer-facing reliability evidence |
| **Cross Connections** | Marketing · Content · Operations · ADHD systems |

### Adaptability (`resilience`)

| | |
|--|--|
| **Purpose** | Adjust plans when reality changes — without losing direction |
| **Description** | Pivot tactics while holding purpose; flexible systems |
| **Business Importance** | Markets shift; rigid entrepreneurs break |
| **Related Competencies** | Strategic Thinking · Resilience · Learning Agility · Systems Thinking |
| **Primary Departments** | Resilience & Recovery · Strategy |
| **Suggested Experiences** | Simulations · Coaching · Strategy collections · Reflection |
| **Mastery Indicators** | Re-plans calmly · kills darlings without identity collapse |
| **How Spark Builds It** | Today's Reality · Adapt My Day · decision support without overwhelm |
| **How It Is Measured** | Quality of pivots · preserved assets · faster re-orientation |
| **Cross Connections** | Innovation · Finance · Leadership · Executive Function |

---

## Group 2 — Entrepreneurial Thinking

**Pillar:** Build Your Thinking™  
**Council college:** [College of Thinking](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-thinking)

| Competency | Slug | Primary departments |
|------------|------|---------------------|
| Strategic Thinking | `strategic-thinking` | Strategic Thinking |
| Critical Thinking | `critical-thinking` | Critical Thinking |
| Systems Thinking | `systems-thinking` | Systems Thinking |
| Creative Thinking | `creative-thinking` | Creative Thinking |
| Visual Thinking | `visual-thinking` | Creative Thinking · Innovation |
| Opportunity Recognition | `opportunity-recognition` | Opportunity Recognition |
| Pattern Recognition | `pattern-recognition` | Opportunity Recognition · Research |
| Decision Making | `decision-making` | Decision Making |
| Problem Solving | `problem-solving` | Problem Solving |
| Learning Agility | `learning-science` | Learning How to Learn |

### Strategic Thinking (`strategic-thinking`)

| | |
|--|--|
| **Purpose** | See the chess board — not just the next move |
| **Description** | Connecting goals, constraints, and time horizons into coherent direction |
| **Business Importance** | Prevents busy work; aligns team and offers |
| **Related Competencies** | Systems Thinking · Decision Making · Business Strategy · Opportunity Recognition |
| **Primary Departments** | Strategic Thinking · Strategy |
| **Suggested Experiences** | Thinking Gym · Simulations · Strategy collections · Visual Thinking |
| **Mastery Indicators** | Articulates 90-day logic · says no to good ideas that don't fit |
| **How Spark Builds It** | One question at a time · frosted workspace for plans · Brain quiet context |
| **How It Is Measured** | Plan quality · decision outcomes · member-reported clarity |
| **Cross Connections** | Finance · Marketing · Leadership · Innovation |

### Critical Thinking (`critical-thinking`)

| | |
|--|--|
| **Purpose** | Evaluate ideas, claims, and advice before acting |
| **Description** | Separating signal from noise; spotting assumptions and bias |
| **Business Importance** | Avoids costly trends, bad hires, and false certainty |
| **Related Competencies** | Decision Making · Research · Pattern Recognition · AI Decision Support |
| **Primary Departments** | Critical Thinking |
| **Suggested Experiences** | Knowledge Cards · Thinking Gym · Research prep · Simulations |
| **Mastery Indicators** | Asks "what would falsify this?" · challenges own narratives kindly |
| **How Spark Builds It** | Spark Filter on Institute content · permission before conclusions |
| **How It Is Measured** | Better vetting decisions · fewer regret pivots |
| **Cross Connections** | Marketing · Finance · Negotiation · Learning Agility |

### Systems Thinking (`systems-thinking`)

| | |
|--|--|
| **Purpose** | See how parts of the business affect each other |
| **Description** | Mapping feedback loops, bottlenecks, and unintended consequences |
| **Business Importance** | Fixes root causes; scales without chaos |
| **Related Competencies** | Operations · Strategic Thinking · Problem Solving · Automation |
| **Primary Departments** | Systems Thinking · Systems · Operations |
| **Suggested Experiences** | Visual Thinking · Business Labs · Apprenticeships |
| **Mastery Indicators** | Draws simple system maps · improves lever points, not symptoms only |
| **How Spark Builds It** | LIG connections · quiet Brain organization · visual focus studio |
| **How It Is Measured** | Operational improvement evidence · reduced recurring fires |
| **Cross Connections** | Delegation · Hiring · Finance · ADHD Business Systems |

### Creative Thinking (`creative-thinking`)

| | |
|--|--|
| **Purpose** | Generate useful options when the obvious path is stuck |
| **Description** | Ideation that serves the business — not novelty for its own sake |
| **Business Importance** | Differentiation, offers, and marketing breakthroughs |
| **Related Competencies** | Innovation · Visual Thinking · Problem Solving · Storytelling |
| **Primary Departments** | Creative Thinking · Innovation |
| **Suggested Experiences** | Business Labs · Create connection · Thinking Gym |
| **Mastery Indicators** | Produces viable alternatives · combines ideas into offers |
| **How Spark Builds It** | Companion brainstorming · permission before publish · Gallery lineage |
| **How It Is Measured** | New assets created · offer iterations · member confidence in ideas |
| **Cross Connections** | Marketing · Branding · Content · Opportunity Recognition |

### Visual Thinking (`visual-thinking`)

| | |
|--|--|
| **Purpose** | Make complexity visible so the brain can work with it |
| **Description** | Maps, trees, flows — externalized cognition |
| **Business Importance** | Clarifies offers, funnels, org design, and decisions |
| **Related Competencies** | Systems Thinking · Strategic Thinking · Decision Making |
| **Primary Departments** | Creative Thinking · Innovation |
| **Suggested Experiences** | Visual Focus · Thinking Gym · Knowledge Cards with diagrams |
| **Mastery Indicators** | Uses visuals to decide · shares maps with team or clients |
| **How Spark Builds It** | Visual Thinking Studio · ADHD-friendly spatial offload |
| **How It Is Measured** | Artifacts produced · faster alignment in team contexts |
| **Cross Connections** | Project Management · Operations · Teaching |

### Opportunity Recognition (`opportunity-recognition`)

| | |
|--|--|
| **Purpose** | Notice gaps, trends, and unmet needs worth pursuing |
| **Description** | Seeing where value can be created before others crowd in |
| **Business Importance** | Source of new revenue streams and partnerships |
| **Related Competencies** | Pattern Recognition · Strategic Thinking · Marketing · Confidence |
| **Primary Departments** | Opportunity Recognition |
| **Suggested Experiences** | Simulations · Research · Coaching · Apprenticeships |
| **Mastery Indicators** | Validates opportunities before over-building · kills weak bets early |
| **How Spark Builds It** | Wisdom Layer opportunity recognition (Spec 126) · permission only |
| **How It Is Measured** | Validated experiments · portfolio of bets · evidence quality |
| **Cross Connections** | Innovation · Sales · Networking · Finance |

### Pattern Recognition (`pattern-recognition`)

| | |
|--|--|
| **Purpose** | Spot recurring signals in customers, markets, and own behavior |
| **Description** | Ethical observation — patterns as hypotheses, not labels |
| **Business Importance** | Faster diagnosis; better product and messaging fit |
| **Related Competencies** | Critical Thinking · Research · Opportunity Recognition · ADHD patterns |
| **Primary Departments** | Opportunity Recognition · Research |
| **Suggested Experiences** | Knowledge Cards · Brain pattern observations · Reflection |
| **Mastery Indicators** | Names patterns tentatively · tests before concluding |
| **How Spark Builds It** | Ethical Foundation · no surveillance · member authority |
| **How It Is Measured** | Improved predictions · better offer-market fit |
| **Cross Connections** | Marketing · Customer Experience · Executive Function |

### Decision Making (`decision-making`)

| | |
|--|--|
| **Purpose** | Choose well under uncertainty — and own the choice |
| **Description** | Structured judgment; bias awareness; commitment with exit criteria |
| **Business Importance** | **Ultimate measure of Spark success** (Spec 100) |
| **Related Competencies** | Critical Thinking · Confidence · Strategic Thinking · AI Decision Support |
| **Primary Departments** | Decision Making · Decision Compass™ |
| **Suggested Experiences** | Decision Compass · Simulations · Coaching · Thinking Gym |
| **Mastery Indicators** | Decides without endless loops · documents rationale · reviews outcomes |
| **How Spark Builds It** | Member owns decisions · Spark illuminates · certainty before completion |
| **How It Is Measured** | Decision quality self-assessment · business outcomes · fewer reversals |
| **Cross Connections** | Pricing · Hiring · Finance · Negotiation · Executive Function |

### Problem Solving (`problem-solving`)

| | |
|--|--|
| **Purpose** | Move from stuck to clear next step |
| **Description** | Defining the real problem before solving the visible one |
| **Business Importance** | Reduces wasted effort and team confusion |
| **Related Competencies** | Critical Thinking · Systems Thinking · Creativity · Delegation |
| **Primary Departments** | Problem Solving |
| **Suggested Experiences** | Thinking Gym · Labs · Companion coaching · Clear My Mind bridge |
| **Mastery Indicators** | Reframes problems · solves at right altitude |
| **How Spark Builds It** | One question guardrails · stuck protocol · hidden work engine |
| **How It Is Measured** | Time-to-clarity · resolution evidence · reduced re-opens |
| **Cross Connections** | Operations · Project Management · Customer Experience |

### Learning Agility (`learning-science`)

| | |
|--|--|
| **Purpose** | Learn new domains fast enough to decide and act |
| **Description** | Meta-learning — how to study, practice, and retain what matters |
| **Business Importance** | AI, markets, and tools change; agility is moat |
| **Related Competencies** | Research · Critical Thinking · Growth Mindset · AI literacy |
| **Primary Departments** | Learning How to Learn · Research |
| **Suggested Experiences** | Knowledge Cards · Apprenticeships · Institute paths |
| **Mastery Indicators** | Builds personal learning plan · discards fluff quickly |
| **How Spark Builds It** | MVC context · spaced Institute design · no content dumping |
| **How It Is Measured** | Time to competence in new topic · application transfer |
| **Cross Connections** | All groups — cross-cutting capability |

---

## Group 3 — Business

**Pillar:** Build Your Business™  
**Council colleges:** [Business Growth](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-business-growth) · [Business Operations](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-business-operations)

| Competency | Slug | Primary departments |
|------------|------|---------------------|
| Marketing | `marketing` | Marketing |
| Branding | `branding` | Branding |
| Messaging | `messaging` | Marketing · Branding |
| Sales | `sales` | Sales |
| Networking | `networking` | Communication · Community |
| Pricing | `pricing` | Pricing · Finance |
| Offer Creation | `offers` | Business Foundations · Marketing |
| Customer Experience | `customer-experience` | Customer Experience |
| Business Strategy | `business-strategy` | Strategy |
| Financial Literacy | `finance` | Finance |
| Operations | `operations` | Operations |
| Project Management | `project-management` | Project Management |
| Hiring | `hiring` | Operations · Business Growth |
| Delegation | `delegation` | Operations · Leadership |
| Leadership | `leadership` | Leadership · Personal Leadership |

*Note: Group lists 16 capabilities; `leadership` bridges Business and Self Leadership — placed here for revenue/team outcomes.*

### Marketing (`marketing`)

| | |
|--|--|
| **Purpose** | Attract the right people to the business consistently |
| **Description** | Understanding audience, channels, and message-market fit |
| **Business Importance** | Pipeline and brand trust |
| **Related Competencies** | Messaging · Branding · Sales · Storytelling · Confidence |
| **Primary Departments** | Marketing |
| **Suggested Experiences** | Knowledge Cards · Labs · Make It Mine campaigns · Apprenticeships |
| **Mastery Indicators** | Tests messages · reads data without obsession · ethical persuasion |
| **How Spark Builds It** | Apply to real business · Brain customer context · no hype templates |
| **How It Is Measured** | Campaign evidence · lead quality · member-reported fit |
| **Cross Connections** | AI Marketing · Content · Pricing · Opportunity Recognition |

### Branding (`branding`)

| | |
|--|--|
| **Purpose** | Be remembered and trusted for a clear promise |
| **Description** | Identity, voice, and consistency across touchpoints |
| **Business Importance** | Premium pricing and referral engine |
| **Related Competencies** | Messaging · Storytelling · Customer Experience · Marketing |
| **Primary Departments** | Branding |
| **Suggested Experiences** | Knowledge Cards · Create assets · Coaching |
| **Mastery Indicators** | Coherent voice · visual/text alignment · member can explain brand in one breath |
| **How Spark Builds It** | Brand voice in Brain · Gallery assets · Shari test on copy |
| **How It Is Measured** | Consistency audit · customer recognition · pricing power signals |
| **Cross Connections** | Public Speaking · Writing · Sales |

### Messaging (`messaging`)

| | |
|--|--|
| **Purpose** | Say the right thing clearly to the right person |
| **Description** | Value proposition, headlines, emails — clarity over cleverness |
| **Business Importance** | Conversion and comprehension |
| **Related Competencies** | Copywriting · Storytelling · Marketing · Sales |
| **Primary Departments** | Marketing · Branding |
| **Suggested Experiences** | Business Mastery Minutes · Create · Simulations (pitch) |
| **Mastery Indicators** | Member rewrites with own voice · A/B judgment without spam tactics |
| **How Spark Builds It** | Make It Mine · permission before publish |
| **How It Is Measured** | Message tests · reply rates · clarity feedback |
| **Cross Connections** | Confidence · Pricing · Customer Experience |

### Sales (`sales`)

| | |
|--|--|
| **Purpose** | Help buyers decide — ethically |
| **Description** | Conversations, discovery, objection handling, closing with dignity |
| **Business Importance** | Direct revenue |
| **Related Competencies** | Confidence · Listening · Negotiation · Pricing · Messaging |
| **Primary Departments** | Sales |
| **Suggested Experiences** | Simulations · Coaching Sessions · Apprenticeships |
| **Mastery Indicators** | Asks good questions · no manipulation · comfortable silence |
| **How Spark Builds It** | Role-play without cringe · member owns pipeline |
| **How It Is Measured** | Close quality · retention · member integrity self-check |
| **Cross Connections** | Networking · Public Speaking · Customer Experience |

### Networking (`networking`)

| | |
|--|--|
| **Purpose** | Build relationships that create opportunity over time |
| **Description** | Genuine connection — not transactional collecting |
| **Business Importance** | Partnerships, referrals, talent, visibility |
| **Related Competencies** | Relationship Building · Communication · Confidence · Sales |
| **Primary Departments** | Communication · Community Building |
| **Suggested Experiences** | Knowledge Cards · Coaching · low-pressure Labs |
| **Mastery Indicators** | Gives before asks · follows up humanly · curates network size |
| **How Spark Builds It** | Relationship Constitution · no CRM guilt trips |
| **How It Is Measured** | Relationship evidence · referral patterns · member satisfaction |
| **Cross Connections** | Marketing · Leadership · Mentoring |

### Pricing (`pricing`)

| | |
|--|--|
| **Purpose** | Capture fair value without undercharging or overcomplicating |
| **Description** | Models, psychology, costs, and confidence in the number |
| **Business Importance** | Profitability and positioning |
| **Related Competencies** | Finance · Confidence · Sales · Offer Creation · Decision Making |
| **Primary Departments** | Finance · Marketing |
| **Suggested Experiences** | Simulations · Knowledge Cards · Coaching · Make It Mine |
| **Mastery Indicators** | States price calmly · adjusts with data · protects margins |
| **How Spark Builds It** | Decision support · no shame about money talk |
| **How It Is Measured** | Margin trend · discount frequency · win-rate balance |
| **Cross Connections** | Branding · Customer Experience · Negotiation |

### Offer Creation (`offers`)

| | |
|--|--|
| **Purpose** | Package value people want to buy |
| **Description** | Designing promises, deliverables, and boundaries |
| **Business Importance** | Unit of revenue; clarity for marketing and delivery |
| **Related Competencies** | Pricing · Marketing · Customer Experience · Innovation |
| **Primary Departments** | Business Foundations · Marketing |
| **Suggested Experiences** | Labs · Apprenticeships · Create · Strategy collections |
| **Mastery Indicators** | Offer one-pager exists · delivery matches promise |
| **How Spark Builds It** | Business Assets lineage · iterative Make It Mine |
| **How It Is Measured** | Sales fit · refund/chargeback signals · delivery ease |
| **Cross Connections** | Systems Thinking · Operations · Storytelling |

### Customer Experience (`customer-experience`)

| | |
|--|--|
| **Purpose** | Make customers feel seen, served, and willing to return |
| **Description** | Journey design, support, onboarding, delight without burnout |
| **Business Importance** | Retention, reviews, referrals |
| **Related Competencies** | Listening · Operations · Branding · Problem Solving |
| **Primary Departments** | Customer Experience |
| **Suggested Experiences** | Knowledge Cards · Labs · Simulations (support scenarios) |
| **Mastery Indicators** | Maps journey · fixes friction · measures satisfaction honestly |
| **How Spark Builds It** | Empathy-first copy · systems for follow-through |
| **How It Is Measured** | Retention · testimonials · support load trends |
| **Cross Connections** | Sales · Delegation · Automation |

### Business Strategy (`business-strategy`)

| | |
|--|--|
| **Purpose** | Choose where to play and how to win |
| **Description** | Positioning, moats, growth paths, and strategic tradeoffs |
| **Business Importance** | Aligns all departments; prevents random tactics |
| **Related Competencies** | Strategic Thinking · Finance · Marketing · Leadership |
| **Primary Departments** | Strategy |
| **Suggested Experiences** | Strategy collections · Coaching · Simulations · Visual Thinking |
| **Mastery Indicators** | Written strategy · quarterly review habit · explicit tradeoffs |
| **How Spark Builds It** | Playbook workspace · Brain business memory |
| **How It Is Measured** | Goal alignment · resource focus · outcome reviews |
| **Cross Connections** | Innovation · Hiring · Operations |

### Financial Literacy (`finance`)

| | |
|--|--|
| **Purpose** | Read the business numbers without fear |
| **Description** | Cash flow, profit, unit economics, and basic forecasting |
| **Business Importance** | Survival and intelligent growth |
| **Related Competencies** | Pricing · Decision Making · Operations · Delegation |
| **Primary Departments** | Finance |
| **Suggested Experiences** | Knowledge Cards · Labs · spreadsheets via Create |
| **Mastery Indicators** | Knows runway · reviews monthly · prices with margins in mind |
| **How Spark Builds It** | Plain language · no accountant cosplay · Apply to my books |
| **How It Is Measured** | Decision quality on money · fewer cash crises |
| **Cross Connections** | Business Strategy · Hiring · AI workflow for reporting |

### Operations (`operations`)

| | |
|--|--|
| **Purpose** | Deliver what you sell — reliably |
| **Description** | Workflows, capacity, quality, and handoffs |
| **Business Importance** | Scale without breaking promises |
| **Related Competencies** | Systems · Project Management · Delegation · Automation |
| **Primary Departments** | Operations · Systems |
| **Suggested Experiences** | Apprenticeships · SOP Knowledge Cards · Labs |
| **Mastery Indicators** | Documented core processes · bottleneck awareness |
| **How Spark Builds It** | Business Assets · quiet organization · ADHD-friendly SOPs |
| **How It Is Measured** | Error rate · delivery time · team clarity |
| **Cross Connections** | Customer Experience · Hiring · AI Automation |

### Project Management (`project-management`)

| | |
|--|--|
| **Purpose** | Finish important work with realistic plans |
| **Description** | Scoping, sequencing, dependencies, and visible status |
| **Business Importance** | Launches ship; clients trust timelines |
| **Related Competencies** | Planning · Delegation · Operations · Executive Function |
| **Primary Departments** | Project Management |
| **Suggested Experiences** | Labs · Momentum appointments · Visual Thinking |
| **Mastery Indicators** | Uses one system · communicates slips early |
| **How Spark Builds It** | Plan My Day bridge · projects in Brain · no guilt Gantt worship |
| **How It Is Measured** | On-time meaningful milestones · reduced thrash |
| **Cross Connections** | ADHD Planning · Time Blindness · Leadership |

### Hiring (`hiring`)

| | |
|--|--|
| **Purpose** | Bring in people who multiply the business |
| **Description** | Role design, sourcing, interviewing, and onboarding |
| **Business Importance** | Leverage beyond founder hours |
| **Related Competencies** | Leadership · Delegation · Decision Making · Culture |
| **Primary Departments** | Operations · Business Growth |
| **Suggested Experiences** | Simulations · Knowledge Cards · Coaching |
| **Mastery Indicators** | Clear scorecards · lawful, kind process · retention of good hires |
| **How Spark Builds It** | Decision Compass for role vs contractor · no rush to hire |
| **How It Is Measured** | Hire success · time-to-productivity · regret hires avoided |
| **Cross Connections** | Finance · Operations · Emotional Intelligence |

### Delegation (`delegation`)

| | |
|--|--|
| **Purpose** | Multiply output without losing quality |
| **Description** | Handing off outcomes — not just tasks — with clarity |
| **Business Importance** | Founder escape from bottleneck |
| **Related Competencies** | Leadership · Systems · Communication · Trust |
| **Primary Departments** | Operations · Leadership |
| **Suggested Experiences** | Apprenticeships · Labs · Coaching |
| **Mastery Indicators** | Delegates decisions appropriately · inspects without micromanaging |
| **How Spark Builds It** | Buyback time principles · SOP connection |
| **How It Is Measured** | Hours reclaimed · team initiative · quality maintained |
| **Cross Connections** | Executive Function · Project Management · ADHD overwhelm |

### Leadership (`leadership`)

| | |
|--|--|
| **Purpose** | Align people around meaningful work |
| **Description** | Vision, culture, feedback, and accountability with care |
| **Business Importance** | Team performance and retention |
| **Related Competencies** | Communication · Coaching · Decision Making · Emotional Intelligence |
| **Primary Departments** | Leadership · Personal Leadership |
| **Suggested Experiences** | Coaching Sessions · Apprenticeships · Simulations |
| **Mastery Indicators** | Clear expectations · psychological safety · develops others |
| **How Spark Builds It** | Hero principle · member as hero even when leading team |
| **How It Is Measured** | Team outcomes · feedback quality · succession evidence |
| **Cross Connections** | Mentoring · Conflict Resolution · Business Strategy |

---

## Group 4 — Communication

**Pillar:** Build Your Influence™ (blueprint) · departments in Build Your Legacy (runtime v1)  
**Council college:** Entrepreneurial Leadership · Creativity & Innovation

| Competency | Slug | Primary departments |
|------------|------|---------------------|
| Listening | `listening` | Communication |
| Writing | `writing` | Writing |
| Public Speaking | `public-speaking` | Speaking |
| Storytelling | `storytelling` | Marketing · Writing |
| Negotiation | `negotiation` | Communication · Sales |
| Teaching | `teaching` | Course Creation |
| Coaching | `coaching` | Coaching |
| Relationship Building | `networking` | Community Building · Communication |
| Conflict Resolution | `negotiation` | Communication · Leadership |

### Listening (`listening`)

| | |
|--|--|
| **Purpose** | Understand before persuading |
| **Description** | Deep attention to customers, team, and partners |
| **Business Importance** | Better products, sales, and culture |
| **Related Competencies** | Sales · Customer Experience · Coaching · Emotional Intelligence |
| **Primary Departments** | Communication |
| **Suggested Experiences** | Simulations · Coaching · Reflection |
| **Mastery Indicators** | Summarizes accurately · asks one strong question at a time |
| **How Spark Builds It** | Spec 105 listening states · models good listening in Companion |
| **How It Is Measured** | Deal quality · fewer misunderstandings · team trust |
| **Cross Connections** | Negotiation · Leadership · Research |

### Writing (`writing`)

| | |
|--|--|
| **Purpose** | Think clearly on the page; persuade and teach in print |
| **Description** | Emails, posts, pages, scripts — member's voice |
| **Business Importance** | Asynchronous scale of influence |
| **Related Competencies** | Storytelling · Messaging · Teaching · Branding |
| **Primary Departments** | Writing |
| **Suggested Experiences** | Create · Knowledge Cards · Apprenticeships |
| **Mastery Indicators** | Publishes consistently · edits for clarity not vanity |
| **How Spark Builds It** | Permission before publish · human voice rules |
| **How It Is Measured** | Asset output · engagement quality · member pride |
| **Cross Connections** | Marketing · Course Creation · Thought Leadership |

### Public Speaking (`public-speaking`)

| | |
|--|--|
| **Purpose** | Hold attention and transfer belief live |
| **Description** | Stage, video, webinars, rooms — presence and structure |
| **Business Importance** | Authority, sales, and team rallying |
| **Related Competencies** | Confidence · Storytelling · Teaching · Courage |
| **Primary Departments** | Speaking |
| **Suggested Experiences** | Simulations · Coaching Sessions · Labs (rehearsal) |
| **Mastery Indicators** | Clear arc · manages nerves · audience leaves with one action |
| **How Spark Builds It** | Low-stakes practice · no toxic "rah rah" |
| **How It Is Measured** | Talks delivered · lead quality · self-reported presence |
| **Cross Connections** | Sales · Networking · Leadership |

### Storytelling (`storytelling`)

| | |
|--|--|
| **Purpose** | Make ideas memorable and emotionally true |
| **Description** | Narrative structure for brand, sales, and teaching |
| **Business Importance** | Differentiation and trust |
| **Related Competencies** | Writing · Marketing · Public Speaking · Branding |
| **Primary Departments** | Marketing · Writing |
| **Suggested Experiences** | Knowledge Cards · Create · Coaching |
| **Mastery Indicators** | Stories serve strategy · avoids manipulation |
| **How Spark Builds It** | StoryBrand-style synthesis · Spark voice |
| **How It Is Measured** | Message retention · conversion on story-led assets |
| **Cross Connections** | Customer Experience · Course Creation |

### Negotiation (`negotiation`)

| | |
|--|--|
| **Purpose** | Reach agreements that preserve relationships |
| **Description** | Preparation, interests, boundaries, and creative options |
| **Business Importance** | Deals, partnerships, hiring comp, client scope |
| **Related Competencies** | Listening · Confidence · Sales · Conflict Resolution |
| **Primary Departments** | Communication · Sales |
| **Suggested Experiences** | Simulations · Thinking Gym · Coaching |
| **Mastery Indicators** | Knows walk-away · finds win-win when possible |
| **How Spark Builds It** | Decision ownership · no pressure tactics |
| **How It Is Measured** | Deal outcomes · relationship preservation |
| **Cross Connections** | Pricing · Hiring · Leadership |

### Teaching (`teaching`)

| | |
|--|--|
| **Purpose** | Transfer capability — not just information |
| **Description** | Designing learning that changes behavior |
| **Business Importance** | Courses, team training, client success |
| **Related Competencies** | Coaching · Storytelling · Writing · Course Creation |
| **Primary Departments** | Course Creation · Institute design meta |
| **Suggested Experiences** | Apprenticeships · Coaching · Knowledge Card authoring path |
| **Mastery Indicators** | Students can apply · simplifies without dumbing down |
| **How Spark Builds It** | Institute standards · competency-first design |
| **How It Is Measured** | Learner outcomes · member teaching evidence |
| **Cross Connections** | Mentoring · Community Building · Legacy |

### Coaching (`coaching`)

| | |
|--|--|
| **Purpose** | Draw out another person's best thinking |
| **Description** | Questions, accountability, and belief — not fixing |
| **Business Importance** | Team development; high-ticket offers |
| **Related Competencies** | Listening · Leadership · Teaching · Emotional Intelligence |
| **Primary Departments** | Coaching |
| **Suggested Experiences** | Coaching Sessions meta · Simulations · Apprenticeships |
| **Mastery Indicators** | Client/team finds own answers · ethical boundaries |
| **How Spark Builds It** | Spark models coaching in Companion · Coach With Shari™ |
| **How It Is Measured** | Client progress · repeat engagement · referrals |
| **Cross Connections** | Mentoring · Sales · Confidence |

### Relationship Building (`networking`)

| | |
|--|--|
| **Purpose** | Cultivate trust over time |
| **Description** | Depth over volume; reciprocity and boundaries |
| **Business Importance** | Sustainable network effects |
| **Related Competencies** | Networking · Listening · Emotional Intelligence |
| **Primary Departments** | Community Building · Communication |
| **Suggested Experiences** | Knowledge Cards · Journal reflection · low-pressure prompts |
| **Mastery Indicators** | Maintains key relationships · says no to draining ties |
| **How Spark Builds It** | Relationship Constitution · no CRM shame |
| **How It Is Measured** | Relationship map quality · collaboration outcomes |
| **Cross Connections** | Sales · Leadership · Mentoring |

### Conflict Resolution (`negotiation`)

| | |
|--|--|
| **Purpose** | Repair and align when tension appears |
| **Description** | De-escalation, clarity, and fair resolution |
| **Business Importance** | Protects team, clients, and partnerships |
| **Related Competencies** | Emotional Regulation · Listening · Leadership · Negotiation |
| **Primary Departments** | Communication · Leadership |
| **Suggested Experiences** | Simulations · Coaching · Knowledge Cards |
| **Mastery Indicators** | Addresses conflict early · separates person from problem |
| **How Spark Builds It** | Emotional safety · repair immediately (Spec 106) |
| **How It Is Measured** | Resolution speed · relationship continuity |
| **Cross Connections** | Customer Experience · Hiring · Culture |

---

## Group 5 — AI

**Pillar:** Build Your Business™  
**Council college:** [College of AI & Emerging Technology](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-ai--emerging-technology)

| Competency | Slug | Primary departments |
|------------|------|---------------------|
| Prompt Engineering | `ai-for-business` | AI for Business |
| AI Research | `research` | AI for Business · Research |
| AI Agents | `ai-for-business` | AI for Business |
| Automation | `automation` | AI for Business · Systems |
| Human-AI Collaboration | `ai-for-business` | AI for Business |
| AI Decision Support | `decision-making` | AI for Business · Decision Making |
| Workflow Design | `automation` | Systems · Operations |
| AI Strategy | `ai-for-business` | AI for Business · Strategy |

### Prompt Engineering (`ai-for-business`)

| | |
|--|--|
| **Purpose** | Get reliable, useful output from AI tools |
| **Description** | Clear instructions, context, iteration, and evaluation |
| **Business Importance** | Productivity multiplier when done well |
| **Related Competencies** | Critical Thinking · Writing · Workflow Design |
| **Primary Departments** | AI for Business |
| **Suggested Experiences** | Labs · Knowledge Cards · Business Mastery Minutes |
| **Mastery Indicators** | Reproducible prompts · verifies outputs · knows limits |
| **How Spark Builds It** | Responsible AI · Spark Filter on fast-changing content |
| **How It Is Measured** | Time saved · error rate · quality of drafts |
| **Cross Connections** | Marketing · Operations · Research |

### AI Research (`research`)

| | |
|--|--|
| **Purpose** | Use AI to gather and synthesize information ethically |
| **Description** | Source checking, synthesis, and knowing when not to trust |
| **Business Importance** | Faster informed decisions |
| **Related Competencies** | Critical Thinking · Learning Agility · Prompt Engineering |
| **Primary Departments** | Research · AI for Business |
| **Suggested Experiences** | Research prep in Companion · Knowledge Cards |
| **Mastery Indicators** | Cites sources · cross-checks · separates fact from draft |
| **How Spark Builds It** | Source Integrity · hidden research work |
| **How It Is Measured** | Decision quality · fewer fact errors |
| **Cross Connections** | Strategic Thinking · Marketing · Finance |

### AI Agents (`ai-for-business`)

| | |
|--|--|
| **Purpose** | Delegate repeatable digital tasks to agents safely |
| **Description** | When to automate, guardrails, and human checkpoints |
| **Business Importance** | Scale without linear headcount |
| **Related Competencies** | Automation · Workflow Design · Operations |
| **Primary Departments** | AI for Business |
| **Suggested Experiences** | Labs · Apprenticeships · Simulations |
| **Mastery Indicators** | Defines boundaries · monitors outcomes · kills bad automations |
| **How Spark Builds It** | Permission before autonomous action · member control |
| **How It Is Measured** | Hours saved · error incidents · ROI judgment |
| **Cross Connections** | Customer Experience · Delegation · Systems |

### Automation (`automation`)

| | |
|--|--|
| **Purpose** | Remove repetitive work that machines should do |
| **Description** | Tools, triggers, and maintenance discipline |
| **Business Importance** | Founder time for high-leverage work |
| **Related Competencies** | Systems · Operations · Workflow Design |
| **Primary Departments** | Automation · Systems |
| **Suggested Experiences** | Labs · Knowledge Cards · SOP-linked paths |
| **Mastery Indicators** | Automates stable processes · documents flows |
| **How Spark Builds It** | Start manual → automate when proven |
| **How It Is Measured** | Time reclaimed · failure recovery time |
| **Cross Connections** | AI Agents · Project Management · ADHD systems |

### Human-AI Collaboration (`ai-for-business`)

| | |
|--|--|
| **Purpose** | Partner with AI without abdicating judgment |
| **Description** | Division of labor: human decides, AI accelerates |
| **Business Importance** | Competitive speed with trust intact |
| **Related Competencies** | Decision Making · Critical Thinking · Prompt Engineering |
| **Primary Departments** | AI for Business |
| **Suggested Experiences** | Coaching · Create workflows · Reflection |
| **Mastery Indicators** | Never ships unreviewed critical work · knows taste vs generation |
| **How Spark Builds It** | Spark as model · permission gates · Hero principle |
| **How It Is Measured** | Quality of hybrid outputs · member confidence |
| **Cross Connections** | Writing · Marketing · Leadership |

### AI Decision Support (`decision-making`)

| | |
|--|--|
| **Purpose** | Use AI to illuminate options — not choose for you |
| **Description** | Scenarios, pros/cons, data pulls — member decides |
| **Business Importance** | Better decisions faster |
| **Related Competencies** | Decision Making · Critical Thinking · Finance |
| **Primary Departments** | Decision Making · AI for Business |
| **Suggested Experiences** | Decision Compass + research · Simulations |
| **Mastery Indicators** | Asks AI for lenses · owns final call |
| **How Spark Builds It** | T-008 ownership · no fake certainty |
| **How It Is Measured** | Decision outcomes · regret rate |
| **Cross Connections** | Strategic Thinking · Pricing · Hiring |

### Workflow Design (`automation`)

| | |
|--|--|
| **Purpose** | Design end-to-end flows that include people and tools |
| **Description** | Mapping steps, handoffs, and failure modes |
| **Business Importance** | Reliable delivery at scale |
| **Related Competencies** | Systems Thinking · Operations · Automation |
| **Primary Departments** | Systems · Operations |
| **Suggested Experiences** | Visual Thinking · Labs · Apprenticeships |
| **Mastery Indicators** | Diagrams workflows · tests edge cases |
| **How Spark Builds It** | Business Brain project links · quiet autosave |
| **How It Is Measured** | Throughput · error rate · team clarity |
| **Cross Connections** | AI Agents · Delegation · Customer Experience |

### AI Strategy (`ai-for-business`)

| | |
|--|--|
| **Purpose** | Choose where AI belongs in the business model |
| **Description** | Roadmap, risk, ethics, and competitive positioning |
| **Business Importance** | Avoids random tool churn |
| **Related Competencies** | Business Strategy · Innovation · Human-AI Collaboration |
| **Primary Departments** | AI for Business · Strategy |
| **Suggested Experiences** | Strategy collections · Coaching · Knowledge Cards |
| **Mastery Indicators** | Written AI policy · prioritized use cases |
| **How Spark Builds It** | Flag fast-changing topics · Spark Filter |
| **How It Is Measured** | ROI on AI bets · team adoption quality |
| **Cross Connections** | Finance · Marketing · Operations |

---

## Group 6 — ADHD Entrepreneurship

**Pillar:** Build Yourself™ (flagship)  
**Council college:** [College of ADHD Entrepreneurship](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-adhd-entrepreneurship)

| Competency | Slug | Primary departments |
|------------|------|---------------------|
| Executive Function | `executive-function` | Executive Function · ADHD Entrepreneurship |
| Planning | `planning` | Executive Function · Productivity |
| Prioritization | `prioritization` | Executive Function · Productivity |
| Working Memory | `executive-function` | Executive Function |
| Task Initiation | `task-initiation` | Executive Function · Focus |
| Time Blindness | `time-management` | Executive Function · Productivity |
| Motivation | `momentum` | Productivity & Momentum |
| Overwhelm Recovery | `recovery` | Resilience & Recovery |
| Attention Management | `focus` | Focus & Attention |
| Energy Management | `energy-management` | Energy Management |

### Executive Function (`executive-function`)

| | |
|--|--|
| **Purpose** | Run the business with a brain that wasn't built for boring admin |
| **Description** | Umbrella capability: plan, prioritize, initiate, regulate, remember |
| **Business Importance** | ADHD entrepreneurs fail from EF gaps, not lack of ideas |
| **Related Competencies** | All ADHD group · Decision Making · Self-awareness |
| **Primary Departments** | Executive Function · ADHD Entrepreneurship |
| **Suggested Experiences** | ADHD-specific Knowledge Cards · Companion routing · Labs |
| **Mastery Indicators** | External systems compensate · shame-free rhythms |
| **How Spark Builds It** | EF-first design (Spec 103) · no surveillance · permission |
| **How It Is Measured** | Meaningful completion · overwhelm frequency · dignity preserved |
| **Cross Connections** | Every business competency — cross-cutting |

### Planning (`planning`)

| | |
|--|--|
| **Purpose** | See the path without over-planning into paralysis |
| **Description** | Good-enough plans with buffers and visual anchors |
| **Business Importance** | Launches and weeks actually happen |
| **Related Competencies** | Prioritization · Project Management · Time Blindness |
| **Primary Departments** | Executive Function · Plan My Day |
| **Suggested Experiences** | Plan My Day · Visual Thinking · Momentum Builder |
| **Mastery Indicators** | Plans fit on one screen · revises without collapse |
| **How Spark Builds It** | Reduce memory burden · Brain holds context |
| **How It Is Measured** | Plan adherence (gentle) · shipped milestones |
| **Cross Connections** | Strategic Thinking · Operations · Delegation |

### Prioritization (`prioritization`)

| | |
|--|--|
| **Purpose** | Choose what matters when everything feels urgent |
| **Description** | Filters, tradeoffs, and "not now" without guilt |
| **Business Importance** | Protects revenue and sanity |
| **Related Competencies** | Decision Making · Focus · Strategic Thinking |
| **Primary Departments** | Executive Function · Productivity |
| **Suggested Experiences** | Thinking Gym · Coaching · Today's Reality |
| **Mastery Indicators** | One primary focus · says no clearly |
| **How Spark Builds It** | One recommendation · max three choices |
| **How It Is Measured** | Completion of chosen priority · reduced thrash |
| **Cross Connections** | Marketing · Sales · Energy Management |

### Working Memory (`executive-function`)

| | |
|--|--|
| **Purpose** | Hold context without keeping it all in your head |
| **Description** | Capture, offload, and trust systems |
| **Business Importance** | Prevents dropped balls and client harm |
| **Related Competencies** | Clear My Mind · Brain · Task Initiation |
| **Primary Departments** | Executive Function |
| **Suggested Experiences** | Clear My Mind · My Thoughts · Companion memory |
| **Mastery Indicators** | Captures immediately · reviews capture rhythm |
| **How Spark Builds It** | Spark remembers so member doesn't (Spec 113) |
| **How It Is Measured** | Fewer "I forgot" incidents · capture habit |
| **Cross Connections** | Planning · Customer Experience · Delegation |

### Task Initiation (`task-initiation`)

| | |
|--|--|
| **Purpose** | Start — especially on important-but-uncomfortable work |
| **Description** | Activation energy, tiny starts, body doubling |
| **Business Importance** | Ideas die in the gap before start |
| **Related Competencies** | Motivation · Focus · Courage · Discipline |
| **Primary Departments** | Executive Function · Focus |
| **Suggested Experiences** | Momentum Builder · Labs · Companion nudges (gentle) |
| **Mastery Indicators** | Uses 5-minute rule · starts before perfect |
| **How Spark Builds It** | No shame · one small action · recovery paths |
| **How It Is Measured** | Start rate on flagged tasks · evidence of shipped work |
| **Cross Connections** | Sales calls · Content · Finance admin |

### Time Blindness (`time-management`)

| | |
|--|--|
| **Purpose** | Feel time passing and honor commitments |
| **Description** | Visual timers, buffers, realistic estimates |
| **Business Importance** | Missed meetings erode trust |
| **Related Competencies** | Planning · Focus · Energy Management |
| **Primary Departments** | Productivity & Momentum |
| **Suggested Experiences** | Focus Timer · Momentum appointments · Knowledge Cards |
| **Mastery Indicators** | Uses external time cues · under-schedules |
| **How Spark Builds It** | Estate time tools · ADHD-native intelligence |
| **How It Is Measured** | On-time rate · calendar realism |
| **Cross Connections** | Project Management · Customer Experience |

### Motivation (`momentum`)

| | |
|--|--|
| **Purpose** | Generate motion without toxic hustle |
| **Description** | Interest, urgency, meaning — ADHD-aware fuel |
| **Business Importance** | Sustained execution between inspiration spikes |
| **Related Competencies** | Purpose · Energy · Habits · Courage |
| **Primary Departments** | Productivity & Momentum |
| **Suggested Experiences** | Momentum Builder · Journal · Evidence Bank wins |
| **Mastery Indicators** | Knows personal fuel · rest without abandonment |
| **How Spark Builds It** | Celebrate transformation not streaks · connection to purpose |
| **How It Is Measured** | Return after low weeks · meaningful action count |
| **Cross Connections** | Marketing · Innovation · Resilience |

### Overwhelm Recovery (`recovery`)

| | |
|--|--|
| **Purpose** | Come back from too much — intact |
| **Description** | Reduce load, restore clarity, one step forward |
| **Business Importance** | Prevents burnout business death |
| **Related Competencies** | Resilience · Emotional Regulation · Prioritization |
| **Primary Departments** | Resilience & Recovery |
| **Suggested Experiences** | Peaceful Places · Clear My Mind · Recovery Knowledge Cards |
| **Mastery Indicators** | Recognizes overwhelm early · uses recovery protocol |
| **How Spark Builds It** | T-007 · Recovery before productivity |
| **How It Is Measured** | Recovery time · assets preserved · return quality |
| **Cross Connections** | Executive Function · Delegation · Operations |

### Attention Management (`focus`)

| | |
|--|--|
| **Purpose** | Steer attention intentionally in a distracting world |
| **Description** | Environment, boundaries, stimulation level |
| **Business Importance** | Deep work on revenue tasks |
| **Related Competencies** | Focus · Energy · Sensory awareness |
| **Primary Departments** | Focus & Attention |
| **Suggested Experiences** | Focus Audio · environment suggestions · Thinking Gym |
| **Mastery Indicators** | Designs workspace · limits notifications during blocks |
| **How Spark Builds It** | Optional environment (Spec 108) · member control |
| **How It Is Measured** | Deep work sessions · distraction self-report |
| **Cross Connections** | Marketing creation · Learning · Leadership |

### Energy Management (`energy-management`)

| | |
|--|--|
| **Purpose** | Match work to usable energy — not fantasy schedules |
| **Description** | Sleep, movement, stimulation, and realistic capacity |
| **Business Importance** | Sustainable pace beats heroic sprints |
| **Related Competencies** | Habits · Planning · Motivation · Well-being |
| **Primary Departments** | Energy Management · Today's Reality |
| **Suggested Experiences** | Today's Reality · Knowledge Cards · Journal |
| **Mastery Indicators** | Schedules hard tasks in peak windows · recovers deliberately |
| **How Spark Builds It** | Adapt My Day · no guilt for low days |
| **How It Is Measured** | Week sustainability · burnout near-miss reduction |
| **Cross Connections** | Delegation · Operations · Personal Growth |

---

## Group 7 — Personal Growth

**Pillar:** Build Yourself™ · Build Your Legacy™  
**Council college:** [Personal Growth](./SPARK_KNOWLEDGE_COUNCIL.md#-college-of-personal-growth) · Creativity

| Competency | Slug | Primary departments |
|------------|------|---------------------|
| Purpose | `purpose` | Legacy Building · Entrepreneur Mindset |
| Values | `purpose` | Personal Leadership |
| Habits | `habits` | Habits & Consistency |
| Reflection | `learning-science` | Journal · Institute reflection |
| Emotional Intelligence | `emotional-intelligence` | Emotional Intelligence |
| Curiosity | `entrepreneur-mindset` | Research · Innovation |
| Self-Compassion | `resilience` | Resilience & Recovery |
| Well-being | `energy-management` | Energy Management |

### Purpose (`purpose`)

| | |
|--|--|
| **Purpose** | Know why the business exists beyond money |
| **Description** | Direction that survives hard seasons |
| **Business Importance** | Attracts aligned customers and team |
| **Related Competencies** | Values · Strategic Thinking · Legacy · Motivation |
| **Primary Departments** | Legacy Building · Entrepreneur Mindset |
| **Suggested Experiences** | Journal · Coaching · Reflection · Knowledge Cards |
| **Mastery Indicators** | Can state purpose in one paragraph · uses it to decide |
| **How Spark Builds It** | Quiet legacy threads · no hustle preaching |
| **How It Is Measured** | Decision alignment · member clarity self-report |
| **Cross Connections** | Branding · Leadership · Mentoring |

### Values (`purpose`)

| | |
|--|--|
| **Purpose** | Act consistently with what matters most |
| **Description** | Non-negotiables for offers, clients, and culture |
| **Business Importance** | Prevents toxic growth and regret deals |
| **Related Competencies** | Purpose · Decision Making · Branding |
| **Primary Departments** | Personal Leadership |
| **Suggested Experiences** | Reflection · Decision Compass · Coaching |
| **Mastery Indicators** | Turns down misaligned money · hires to values |
| **How Spark Builds It** | Memory Center values · ethical Spark Filter |
| **How It Is Measured** | Fewer values violations · team fit |
| **Cross Connections** | Negotiation · Hiring · Customer Experience |

### Habits (`habits`)

| | |
|--|--|
| **Purpose** | Make good choices automatic |
| **Description** | Tiny repeats tied to identity and environment |
| **Business Importance** | Compounds marketing, health, and ops |
| **Related Competencies** | Consistency · Discipline · Energy |
| **Primary Departments** | Habits & Consistency |
| **Suggested Experiences** | Business Mastery Minutes · Momentum · Knowledge Cards |
| **Mastery Indicators** | Few keystone habits maintained · designs environment |
| **How Spark Builds It** | ADHD-friendly · no streak shame |
| **How It Is Measured** | Habit adherence (member-defined) · outcomes linked |
| **Cross Connections** | Focus · Writing · Sales follow-up |

### Reflection (`learning-science`)

| | |
|--|--|
| **Purpose** | Learn from experience deliberately |
| **Description** | After-action review without rumination |
| **Business Importance** | Converts activity into capability |
| **Related Competencies** | Learning Agility · Self-awareness · Growth Mindset |
| **Primary Departments** | Journal · Institute reflection experiences |
| **Suggested Experiences** | Journal · post-experience reflection · Evidence Bank |
| **Mastery Indicators** | Weekly reflection rhythm · changes behavior from insights |
| **How Spark Builds It** | Institute lifecycle: Learn → Reflect → Apply |
| **How It Is Measured** | Documented learnings · changed next actions |
| **Cross Connections** | Decision Making · Coaching · Mentoring |

### Emotional Intelligence (`emotional-intelligence`)

| | |
|--|--|
| **Purpose** | Navigate emotions in self and relationships |
| **Description** | Awareness, regulation, empathy, social skill |
| **Business Importance** | Leadership and client relationships |
| **Related Competencies** | Self-awareness · Listening · Leadership |
| **Primary Departments** | Emotional Intelligence |
| **Suggested Experiences** | Knowledge Cards · Coaching · Simulations |
| **Mastery Indicators** | Reads room · responds proportionally |
| **How Spark Builds It** | Hospitality · emotional safety |
| **How It Is Measured** | Conflict outcomes · team/client feedback |
| **Cross Connections** | Sales · Negotiation · ADHD overwhelm |

### Curiosity (`entrepreneur-mindset`)

| | |
|--|--|
| **Purpose** | Stay open to learning and better questions |
| **Description** | Wonder without impulsive pivoting |
| **Business Importance** | Innovation and market sensing |
| **Related Competencies** | Learning Agility · Research · Opportunity Recognition |
| **Primary Departments** | Research · Innovation |
| **Suggested Experiences** | Observatory · Knowledge Cards · Curiosity prompts |
| **Mastery Indicators** | Explores before committing · asks better questions |
| **How Spark Builds It** | Experience pattern: Curiosity · natural discovery |
| **How It Is Measured** | Quality of experiments · learning velocity |
| **Cross Connections** | Marketing · AI Research · Personal Growth |

### Self-Compassion (`resilience`)

| | |
|--|--|
| **Purpose** | Treat yourself as a capable human on a hard path |
| **Description** | Kind inner voice after mistakes |
| **Business Importance** | Prevents shame spirals that kill businesses |
| **Related Competencies** | Resilience · Emotional Regulation · Courage |
| **Primary Departments** | Resilience & Recovery |
| **Suggested Experiences** | Recovery flows · Journal · Companion support |
| **Mastery Indicators** | Recovers from error in hours not weeks |
| **How Spark Builds It** | No "behind" language · dignity always |
| **How It Is Measured** | Return speed · self-talk improvement (reflection) |
| **Cross Connections** | Overwhelm Recovery · Motivation · Leadership |

### Well-being (`energy-management`)

| | |
|--|--|
| **Purpose** | Sustain the human who runs the business |
| **Description** | Sleep, boundaries, joy, and health as business infrastructure |
| **Business Importance** | Founder health = business health |
| **Related Competencies** | Energy Management · Habits · Resilience |
| **Primary Departments** | Energy Management |
| **Suggested Experiences** | Today's Reality · Peaceful Places · Knowledge Cards |
| **Mastery Indicators** | Protects rest · recognizes burnout signals |
| **How Spark Builds It** | Recovery places · no gamified exhaustion |
| **How It Is Measured** | Sustainable work weeks · member well-being check-ins |
| **Cross Connections** | Delegation · Operations · Legacy |

---

## Competency → Institute experience map

| Experience kind | Primary role in competency growth |
|-----------------|-----------------------------------|
| **Knowledge Card™** | Introduce · clarify · one action |
| **Business Mastery Minute™** | Quick orientation · low EF load |
| **Deep Lesson** | Structured understanding |
| **Apprenticeship™** | Repeated practice with guidance |
| **Business Lab™** | Safe trial · feedback |
| **Simulation™** | Rehearsal before stakes |
| **Thinking Gym™** | Cognitive reps · judgment |
| **Challenge** | Stretch application |
| **Strategy Collection** | Integrated business capability |
| **Coaching Session™** | Personalized capability work |
| **Reflection** | Integrate · compound learning |
| **Make It Mine™** | Apply to member's business |
| **Evidence Bank™** | Prove growth happened |

---

## Runtime alignment

| Asset | Location |
|-------|----------|
| Pillar / department / drawer scaffold | `lib/sparkCompetencyFramework/competencyFrameworkV1.ts` |
| Growth level types | `lib/sparkCompetencyFramework/types.ts` |
| Curriculum competency slugs | `lib/sparkCurriculumMasterIndex/competencies.ts` |
| Competency graph | `lib/momentumInstitute/knowledgeArchitecture/competencyGraph.ts` |
| Growth Profile | `lib/sparkMomentumInstitute/` |
| Knowledge Card `competencyIds` | Institute catalog seeds |

### Expansion protocol

1. Name the capability in this document (all fields).  
2. Add slug to `competencies.ts` if new.  
3. Map to department(s) and pillar(s).  
4. Link Knowledge Cards and experiences to `competencyIds`.  
5. Update competency graph edges for cross-connections.  
6. Pass [Spark Filter™](./SPARK_KNOWLEDGE_COUNCIL.md#the-spark-filter) for any new teaching content.

---

## Success

When this framework is live in product and content:

| The Institute teaches | The Framework develops |
|-----------------------|------------------------|
| Knowledge | Capability |
| Concepts | Confidence |
| Ideas | Decisions |
| Information | Entrepreneurs |

The question Spark answers forever:

> **"What capabilities is this entrepreneur developing?"**

---

*Spark Competency Framework™ — the backbone of personalized learning, coaching, recommendations, Growth Profiles™, and Estate Intelligence™.*
