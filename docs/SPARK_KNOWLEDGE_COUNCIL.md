# Spark Knowledge Council™

**The permanent faculty behind the Momentum Institute™**  
**Version:** 2.0  
**Status:** Blueprint complete — colleges defined; runtime registry evolving  
**Module:** `lib/businessBrain/knowledgeCouncil/`

**Parent:** [Spark Business Brain™](./SPARK_BUSINESS_BRAIN.md) · [Momentum Institute Master Blueprint](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md) · [Source Integrity™](./SPARK_BUSINESS_BRAIN.md#source-integrity)

---

## Purpose

The Spark Knowledge Council™ is the **permanent faculty** behind the Momentum Institute™.

**Members will never see the council.**

Instead, they experience **one consistent voice:**

> **Spark.**

Behind the scenes, Spark is informed by the strongest ideas from **multiple disciplines**, synthesizing them into practical, entrepreneur-focused guidance.

The council **evolves over time** as research advances and new fields emerge.

It is the **intellectual foundation** of the Momentum Institute™.

| Members experience | Council holds (internal only) |
|--------------------|-------------------------------|
| One mentor — Spark | Colleges, perspectives, sources |
| Practical capability growth | Synthesis process |
| Trust | Spark Filter™ + Source Integrity™ |

---

## Core principle

> **Spark synthesizes many traditions into one consistent teaching voice.**

Never *"Expert A versus Expert B."*  
Always **Spark's synthesis** — practical, coherent, entrepreneur-focused.

---

## Council structure — Colleges

Instead of one giant list, the Council organizes into **Colleges** — like a university — so every Institute department has a natural intellectual home.

```
Spark Knowledge Council™
└── College (8)
    ├── Departments (Institute alignment)
    ├── Core Perspectives (research fields)
    └── Potential Knowledge Contributors (internal curation only)
         │
         ▼
    Spark Synthesis™ → one teaching voice
         │
         ▼
    Knowledge Cards™ · Lessons · Make It Mine™
```

> **Runtime note:** `lib/businessBrain/knowledgeCouncil/` currently implements **disciplines · sources · schools of thought · department mappings**. College registry is defined in this document first; data migration maps colleges → existing seeds without member-facing change.

---

## 🏛 College of Entrepreneurial Leadership

**Focus:** Who the entrepreneur becomes as a leader of self and others.

### Departments

Entrepreneur Mindset · Confidence · Leadership · Emotional Intelligence · Resilience · Communication · Public Speaking · Networking · Coaching · Mentoring

### Core perspectives

| Field | Informs |
|-------|---------|
| Leadership science | Stewardship, culture, direction |
| Organizational psychology | Teams, behavior, norms |
| Emotional intelligence | Regulation, empathy, influence |
| Adult development | Identity, growth over time |
| Communication research | Clarity, listening, dialogue |
| Behavioral psychology | Habits of leadership action |

### Potential knowledge contributors *(internal only — not member-facing)*

*Curation targets for verified source review. Fame alone is insufficient. Each must pass [Knowledge Source Standards](#knowledge-source-standards) and [Spark Filter™](#the-spark-filter) before teaching.*

| Contributor | Domain signal |
|-------------|---------------|
| Steve Lowell | Public speaking |
| Kerry George | Relationship networking |
| John Maxwell | Leadership development |
| Simon Sinek | Purpose-driven leadership |
| Brené Brown | Courage, vulnerability, leadership |
| Organizational leadership research | Academic corpus |

---

## 🏛 College of Business Growth

**Focus:** How the business reaches, converts, and retains customers ethically.

### Departments

Marketing · Branding · Sales · Pricing · Offers · Customer Experience · Business Strategy · Business Models · Finance

### Core perspectives

Marketing · Consumer psychology · Behavioral economics · Sales psychology · Brand strategy · Small business management

### Potential knowledge contributors *(internal only)*

| Contributor | Domain signal |
|-------------|---------------|
| Donald Miller | StoryBrand / messaging |
| Seth Godin | Marketing philosophy |
| Philip Kotler | Marketing foundations |
| Rory Sutherland | Behavioral economics in marketing |
| Brian Tracy | Sales fundamentals |
| Neil Rackham | SPIN / consultative selling |
| Chris Voss | Negotiation |
| Mike Michalowicz | Founder finance (Profit First) |

---

## 🏛 College of Business Operations

**Focus:** How work gets done reliably as the business scales.

### Departments

Systems · SOPs · Project Management · Hiring · Delegation · Operations · Automation · Productivity

### Core perspectives

Lean operations · Systems design · Operational excellence · Project management · Productivity science

### Potential knowledge contributors *(internal only)*

| Contributor | Domain signal |
|-------------|---------------|
| David Allen | Getting Things Done |
| James Clear | Habit systems |
| Dan Martell | SaaS operations / buyback time |
| Lean methodology | Waste reduction, flow |
| Agile principles | Iteration, delivery |

---

## 🏛 College of AI & Emerging Technology

**One of Spark's signature colleges.**

**Focus:** Practical, ethical AI in real businesses — not hype.

### Departments

AI Foundations · Prompting · AI Agents · Research · Automation · AI Marketing · AI Content · AI Coding · AI Strategy

### Core perspectives

Human-AI collaboration · AI implementation · Automation · Responsible AI · Knowledge management

### Potential knowledge contributors *(internal only)*

| Contributor | Domain signal |
|-------------|---------------|
| Dan Martell | AI for operators |
| Ethan Mollick | AI in work practice |
| Andrew Ng | AI education / implementation |
| OpenAI documentation and research | Product-grounded practice |
| AI workflow research | Emerging methods *(flag fast-changing)* |

---

## 🏛 College of Thinking

**Where Spark becomes truly different.**

**Focus:** Entrepreneurial cognition — judgment, patterns, decisions.

### Departments

Critical Thinking · Strategic Thinking · Systems Thinking · Creative Thinking · Visual Thinking · Pattern Recognition · Opportunity Recognition · Decision Making · Learning Science

### Core perspectives

Cognitive psychology · Decision science · Learning science · Systems theory · Creativity research

### Potential knowledge contributors *(internal only)*

| Contributor | Domain signal |
|-------------|---------------|
| Daniel Kahneman | Judgment and bias |
| Annie Duke | Decision under uncertainty |
| Edward de Bono | Creative thinking methods |
| Shane Parrish | Mental models |
| Barbara Oakley | Learning how to learn |
| Cognitive science research | Academic corpus |

---

## 🏛 College of ADHD Entrepreneurship

**Spark's flagship college.**

**No one else has this combination.**

**Focus:** Building businesses that work with real brains — especially ADHD entrepreneurs.

### Departments

Executive Function · ADHD Business Systems · Working Memory · Planning · Motivation · Time Blindness · Overwhelm · Sensory Processing · Hyperfocus · Recovery

### Core perspectives

Executive function · ADHD coaching · Neuroscience · Occupational therapy · Behavioral science · Learning science

### Potential knowledge contributors *(internal only)*

| Contributor | Domain signal |
|-------------|---------------|
| Russell Barkley | EF / ADHD research |
| Thomas Brown | ADHD executive function model |
| Edward Hallowell | ADHD strengths framing |
| Ari Tuckman | Adult ADHD practice |
| Executive function research | Academic corpus |

*Teaching must be ADHD-friendly by design — reduce load, permission, implementation — per [Momentum Institute Blueprint](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md).*

---

## 🏛 College of Creativity & Innovation

**Focus:** Ideas that become offers, content, and products.

### Departments

Idea Generation · Innovation · Design Thinking · Product Development · Writing · Storytelling · Content Creation

### Core perspectives

Design thinking · Innovation studies · Communication craft · Learning science (teaching through content)

### Potential knowledge contributors *(internal only)*

*To be curated through same standards — link to `src-creative-methods`, `src-innovation-practice`, `src-content-craft` placeholder clusters in runtime registry.*

---

## 🏛 College of Personal Growth

**Focus:** The human capacity behind sustained entrepreneurship.

### Departments

Habits · Purpose · Values · Wellness · Energy · Relationships · Work-Life Harmony

### Core perspectives

Habit formation · Adult development · Behavioral psychology · Resilience research

---

## College → Institute department map (summary)

| College | Primary Institute homes |
|---------|-------------------------|
| Entrepreneurial Leadership | Build Yourself™ · Build Your Influence™ |
| Business Growth | Build Your Business™ |
| Business Operations | Build Your Business™ |
| AI & Emerging Technology | Build Your Business™ (AI) |
| Thinking | Build Your Thinking™ |
| ADHD Entrepreneurship | Build Yourself™ (flagship) |
| Creativity & Innovation | Build Your Thinking™ · Build Your Influence™ |
| Personal Growth | Build Yourself™ |

---

## The Spark Synthesis™

**This is where Spark's intellectual property begins.**

For every topic, Spark does **not** present competing expert opinions.

### Internal synthesis process

| Step | Action |
|------|--------|
| 1 | **Gather** the strongest evidence and enduring principles from trusted, [verified](#knowledge-source-standards) sources |
| 2 | **Identify** areas of broad agreement; clearly note where approaches differ |
| 3 | **Blend** with entrepreneur-focused application and ADHD-friendly teaching methods |
| 4 | **Teach** in Spark's own clear, supportive voice — never as quoted authorities |
| 5 | **Apply** through Make It Mine™ — member's real business |

**The result:** Not *"Expert A versus Expert B."*  
It is **Spark's synthesis** — a practical, coherent learning experience.

### Content layer mapping

| Layer | Synthesis role |
|-------|----------------|
| `facts` | Verified sources only |
| `principles` | Enduring agreed truths |
| `sparkSynthesis` | Steps 2–4 — Spark voice |
| `recommendations` | Entrepreneur application |
| `examples` | Illustrations (sourced when factual) |
| `opinions` | Editorial — labeled, rare |

**Rule:** `sparkSynthesis` must **never** be presented as a direct quote or unsourced claim from a contributor.

---

## Knowledge Source Standards

Every source considered for the Council should meet **one or more** of:

| Criterion | Meaning |
|-----------|---------|
| **Evidence-informed research** | Peer-reviewed or rigorous practice research |
| **Demonstrated real-world success** | Repeatable outcomes in business context |
| **Practical application** | Entrepreneurs can use it this week |
| **Ethical business practices** | No manipulation, exploitation, or harm |
| **Clear teaching ability** | Ideas transmit without jargon walls |
| **Longevity and enduring relevance** | Still true in five years — or flagged as evolving |
| **Respected within its field** | Credible among practitioners and researchers |

**No source should be included simply because they're famous.**

Named contributors in this document are **curation candidates** until:

1. Specific works are registered with `buildVerifiedKnowledgeSource()`  
2. [Spark Filter™](#the-spark-filter) passes  
3. [Source Integrity Checklist](./SPARK_BUSINESS_BRAIN.md#source-integrity) passes for any published lesson  

---

## The Spark Filter™

**Mandatory rule:** Every idea must pass **all five** questions before it becomes part of the Momentum Institute™.

| # | Question | Fail if… |
|---|----------|----------|
| 1 | **Is it accurate?** Is it supported by credible evidence or well-established practice? | Speculative, debunked, or unverified |
| 2 | **Is it practical?** Can an entrepreneur realistically use it? | Academic only, no application path |
| 3 | **Is it ethical?** Does it help people succeed without manipulation or harm? | Dark patterns, shame, exploitation |
| 4 | **Is it timeless or clearly identified as evolving?** If fast-changing (e.g. AI), is that made clear? | Presented as permanent when it isn't |
| 5 | **Can it improve someone's business or entrepreneurial capability?** | Entertainment, trivia, or trend-chasing |

**If any answer is No → it does not belong in the Institute.**

This filter protects Spark as it grows. The Institute must not become a collection of trendy ideas — it must remain a **trusted place** where guidance is thoughtfully selected, synthesized, and designed to help entrepreneurs build better businesses.

**Relationship to Source Integrity™:** Spark Filter™ gates *what enters* the Council; Source Integrity™ gates *what publishes* to members.

---

## Future review process

The Knowledge Council should be **reviewed regularly**.

| Trigger | Action |
|---------|--------|
| New research emerges | Add verified sources; update synthesis |
| Practice evolves (especially AI) | Mark `stale` or update limitation notes |
| Contributor work superseded | Retire or version — preserve history |
| AI recommends updates | Human editorial review **required** — never auto-publish |

Spark continues **evolving without losing its identity**:

- One outward voice  
- Spark Filter™ unchanged  
- No member-facing expert panel  
- Wiser, not noisier  

---

## Runtime registry (technical layer)

The current code registry supports synthesis at department scale:

| Asset | File | v1.1.0 count |
|-------|------|--------------|
| Research disciplines | `disciplines.ts` | 25 |
| Knowledge sources | `sources.ts` | 22 placeholders |
| Schools of thought | `schoolsOfThought.ts` | 20 |
| Department mappings | `departmentCouncil.ts` | 44 |

```typescript
import {
  getKnowledgeCouncil,
  departmentSynthesisContext,
  buildVerifiedKnowledgeSource,
  listTeachingSourcesForDepartment,
} from "@/lib/businessBrain";

const ctx = departmentSynthesisContext("dept-marketing");
// Internal only — slugs, never contributor names to members
```

**Verification:** Only `verified` sources teach final lessons · `lib/businessBrain/sourceIntegrity/`

---

## Source Integrity™ (publish gate)

Before any lesson ships:

1. Are all factual claims sourced?  
2. Are quotes exact?  
3. Is the source real?  
4. Is the source current enough?  
5. Is this fact, opinion, or Spark synthesis?  
6. Are limitations noted?  
7. Is anything speculative clearly labeled?  

Plus: **Spark Filter™** (five questions) for all new Council content.

---

## Expansion protocol

### Add a college department

1. Map to Institute department + pillar ([Master Blueprint](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md))  
2. Document core perspectives  
3. Curate contributors through Spark Filter™ — register **verified works**, not names alone  
4. Update `departmentCouncil.ts` discipline and school links  

### Add a verified source

1. Real title, author/org, reference — `buildVerifiedKnowledgeSource()`  
2. Pass Spark Filter™ + Source Integrity  
3. Link to college perspectives and schools of thought  
4. Never surface to members as a reading list  

### Do not

- Show council, colleges, or contributor names to members  
- Cite unverified candidates in final lessons  
- Include sources for fame alone  
- Present synthesis as expert quotation  
- Skip Spark Filter™ because content is popular online  

---

## Invariants

1. **Internal only** — Council invisible to members  
2. **One voice outward** — Spark, not a faculty panel  
3. **Spark Filter™** — every idea, every time  
4. **Synthesis is IP** — Spark Synthesis™ process is the product  
5. **ADHD Entrepreneurship college** — flagship differentiation  
6. **Evolve with review** — identity stable, knowledge current  
7. **Hero principle** — synthesis serves the member's decisions  

---

## Related documents

- [SPARK_BUSINESS_BRAIN.md](./SPARK_BUSINESS_BRAIN.md)  
- [MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md)  
- [SPARK_MANIFESTO.md](./SPARK_MANIFESTO.md)  
- [SPARK_OPERATING_MANUAL.md](./SPARK_OPERATING_MANUAL.md)  

---

*The Spark Knowledge Council™ is the permanent faculty members never see — and the reason they trust the voice they do.*
