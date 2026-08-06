# Business Build™ — Role Definition within the Universal Reasoning Journey

| Field | Value |
|-------|-------|
| **Status** | Pre-implementation definition — **no screens, no engine, no code** |
| **Date** | 2026-08-06 |
| **Mode** | Architecture clarity only |
| **Authority** | Estate Architectural Authority · Relationship Constitution · Specs 100–131 · Founder Decision 2026-08-05 (Projects vs Business Build) |
| **Related** | [Alignment Review](./SPARK_ESTATE_REASONING_AND_EXPERIENCE_STANDARDS_ALIGNMENT_REVIEW.md) · Build Type Catalog · Knowledge Finger Index · Create / Business Development Studio Experience Spec |

---

## Purpose of this document

Answer what **Business Build** means *before* implementation — so Spark does not invent a third business OS, confuse Create with business structure, or route every “build something” request into Projects or SOPs.

This document defines a **role in the Universal Reasoning Journey**, not a new runtime engine and not a new member-facing dashboard.

---

## 1. Naming clarity (founder-approved boundary)

On **2026-08-05**, the founder approved:

| System | Role | Store |
|--------|------|-------|
| **Projects** (+ Project Homes) | Source of truth for **outcome-based work** | `companion-projects-v1` |
| **My Business Estate** | Structured **business-building environment** | Own profile store (when present) |
| **Business Strategy Builder** | Conversation-based **strategy** workflow | Ephemeral (no durable store) |

**“Business Build” was retired as an official system name** because it ambiguously pointed at more than one experience.

### How this document uses the name

| Use | Meaning |
|-----|---------|
| **Business Build (role)** | The *kind of help* Spark gives when the member is designing or strengthening the **business itself** — offers, systems, CX, revenue, growth, identity, people served |
| **Not** | A fourth store, a merged Projects+business schema, a new Guided Creation engine, or a catalog wall of “business tools” |

**Official Estate place language (member-facing):** remain **Business** experience / **Boardroom** (Estate Registry) and **My Business Estate** as the structured business-building environment when that surface is live.

**Internal / architecture language:** “Business Build journey” or “business-structure work” may be used so specs stay clear — without resurrecting a colliding product system name.

If a single official product name is needed later, prefer **My Business Estate** (place) + **Business Development** (journey family) over reintroducing “Business Build” in UI strings.

---

## 2. Repository inventory (what exists today)

### Present / live (or partially wired)

| Area | What exists | Notes |
|------|-------------|--------|
| **Create** | Estate Registry → Create Studio; `lib/universalCreation/`; Create catalog (Email, SOP, Proposal, Offer-adjacent builders, Workshop, etc.) | Shared creation spine; Create Studio Spec = Business Development Studio *entrance*, not a separate OS |
| **Projects** | `companion-projects-v1`, Project Homes view | Outcome / follow-through work — not business profile |
| **Strategies** | Business Strategy Builder (`lib/businessStrategyBuilder.ts`, dock); Playbook/Strategies legacy map → Business; Create type “Business Strategy” | Strategy = direction/decisions; often ephemeral |
| **Offers** | Offer Build Type (uploaded catalog); Create / Business tools list Offers; cross-workspace Client Avatar guidance | Offer is a **Build Type** under Sell & Serve — may start in Create conversation |
| **Systems / SOPs** | SOP + Checklist Build Types; Process Transfer Finger; Create → SOP | Process transfer ≠ business-model design |
| **People served** | Client Avatars / Ideal Client (`companionStore`, Create catalog) | Closest live stand-in for “People I Help” |
| **Business Profile** | Legacy map → Business experience | Stable facts about the business |
| **Estate Brain Business** | Boardroom tools: Client Avatars, Products, Services, Offers, Pricing, Funnels, CRM, Marketing Calendar, Sales, Launches, Analytics, Content Library, SOP Library | Capability/tool map — not a Business Build engine |
| **“Business Building” strings** | Estate Brain labels, SIOS/ADHD OS tags, Momentum catalog titles | Naming drift — cleanup handoff-gated; not a defined journey |

### Named but not found as live Estate systems

| Name | Status in repo |
|------|----------------|
| **Brand Studio** | No dedicated Estate place/tool named this; brand/positioning appear in Create, Strategy, Knowledge Domains |
| **Identity Office** | No dedicated place; identity appears in Chamber/visual-studio identity docs and companion identity helpers — **not** a Business Build surface |
| **People I Help** | No dedicated place; **Client Avatars / Ideal Client** is the live analog |
| **My Business Estate** | Referenced in founder decision + alignment review; **no matching component/store files found on this branch** at definition time — treat as approved *environment role*, not assumed runtime |
| **Universal Reasoning Journey** | Described across Phase 11 / Guided Creation / Finger Activation Matrix uploads; **not** a single named package in `docs/` yet — map to existing conversation + `universalCreation` orchestration |
| **Spark Experience Library** | Member Journey Library + Experience validation assets (validation layer); not a product “library UI” for Business Build |
| **Knowledge Fingers** | Specs in uploads / alignment review; reasoning-pattern layer — not templates |
| **Working Memory** | Spec 112/117 + session/continue; Finger docs’ “Estate Working Memory” maps here — do not invent a fourth memory OS |

### Existing “Business Build” references

- Founder Decision Record + cleanup handoff (retire system name)
- Alignment review §12
- Informal tags: `business_building`, “Business Building” discovery labels
- No approved prior spec that defined Business Build as one intentional product (evidence review: Documented layer was empty)

---

## 3. Problems Business Build should solve

Business Build exists so ADHD founders can strengthen the **business as a living structure** without having to know which tool, document, or room owns that work.

### Member problems

1. **Unclear business shape** — “I have services, but not a real offer.” / “People don’t understand what I sell.”
2. **Broken or missing customer journey** — onboarding chaos, uneven experience, no clear path from interest → trust → buy → success.
3. **No operating system for the business** — delivery, handoffs, and repeatable systems don’t exist or live only in the founder’s head (beyond a single SOP).
4. **Revenue model fog** — pricing, packages, and how money actually works are vague or contradictory.
5. **Growth without a plan** — “I need to grow” with no coherent priorities, channels, or capacity reality.
6. **Scattered business truth** — identity, people served, offers, and systems contradict each other across chats and docs.
7. **Tool confusion** — they ask for an SOP, a project, a strategy, or a Create document when what they need is **business design**.

### Spark / Estate problems (internal)

- Prevent routing every business sentence into Create templates or Projects tasks.
- Keep **business structure** distinct from **execution work** and **process documents**.
- Give Knowledge Fingers and Build Types a clear **family** for business-structure outcomes without a new engine.

---

## 4. What makes Business Build different

### One-line distinctions

| Area | Job | Business Build is… |
|------|-----|--------------------|
| **Create** | Turn a need into a **usable artifact** (doc, email, offer one-pager, SOP, workshop outline) through Free ↔ Guided creation | **Not** Create itself. Create is often the *workshop* where a Business Build **result** is assembled. Business Build is the *why / shape of the business*; Create is *making the thing*. |
| **Projects** | Carry a **defined outcome** to completion (milestones, next actions, follow-through) | **Not** a Project. A growth plan may *spawn* Projects later; designing the plan is Business Build. |
| **Strategies** | Choose **direction** under uncertainty (positioning bet, priority, competitive move) | Strategy decides *where to go*; Business Build designs *what the business is / how it works* so strategy has something to steer. Strategy Builder remains separate and often ephemeral. |
| **SOPs / processes** | **Transfer** how work gets done so someone else (or future self) can execute | Process Transfer Finger → SOP/Checklist Builds. A business *system* may include SOPs, but Business Build owns the **system design** (roles, flow, capacity, handoffs), not the document format. |

### Contrast table (member language → correct role)

| Member says | Likely role | Why |
|-------------|-------------|-----|
| “Write an email announcing my new package” | **Create** | Artifact / communication |
| “Help me finish launching the Q3 offer by Friday” | **Projects** | Outcome + timeline |
| “Should I niche down or stay broad?” | **Strategies** | Decision under uncertainty |
| “Document how we onboard clients” | **SOP / Process Transfer** | Repeatable procedure |
| “Create a new offer for exhausted founders” | **Business Build** → may produce Offer Build Type via Create | Designs the offer as business structure |
| “Develop our customer experience” | **Business Build** | Journey/system design; may later Create onboarding docs |
| “Build a business system for delivery” | **Business Build** | Ops design; SOPs are outputs/supporting Builds |
| “Improve our revenue model” | **Business Build** | Model design; strategy may decide among options |
| “Develop a growth plan” | **Business Build** (plan design) → Projects for execution | Plan vs doing the work |

### Relationship diagram (conceptual)

```
Universal Reasoning Journey (shared)
        │
        ├─ Understand need & confidence
        ├─ Activate Knowledge Finger(s)
        ├─ Choose support path
        │
        ├─ Business Build (role) ──► business structure / model / CX / growth design
        │         │
        │         ├─ may use Create (`universalCreation`) for Offer, Onboarding, Marketing Plan…
        │         ├─ may later suggest Projects for execution
        │         ├─ may consult Strategy Builder for bets/decisions
        │         └─ may spawn Process Transfer Builds (SOPs) as *parts* of a system
        │
        ├─ Create (entrance / artifact craft)
        ├─ Projects (outcome execution)
        └─ Strategies (directional decisions)
```

**Rule:** Business Build does **not** own conversation engine, voice, memory architecture, or Create orchestration. It **selects** them.

---

## 5. What types of member requests should enter Business Build

Enter Business Build when the underlying need is to **design, clarify, or strengthen how the business works** — not merely to produce a document or finish a task.

### Strong entry signals

- Create / redesign a **new offer**, package, membership, or service promise
- Develop or repair **customer experience** (from first contact through early success)
- Build or improve a **business system** (delivery, ops, handoffs, capacity)
- Improve **revenue model**, pricing architecture, or monetization logic
- Develop a **growth plan** or growth system (channels + capacity + offer fit)
- Clarify **who we help**, what we stand for, and how that shows up in offers/CX (People I Help / identity *as business context* — not Identity Office UI)
- Align **brand promise** with offers and experience (Brand *reasoning* — not a Brand Studio product)
- “My business feels scattered / I don’t know what I actually sell”

### Weak / wrong entry (route elsewhere)

| Signal | Prefer |
|--------|--------|
| Single email, post, proposal draft, slide deck | **Create** |
| Checklist or one SOP for a known process | **Process Transfer** Build |
| “Get this launched this week” with clear deliverable | **Projects** |
| Pure decision between two known options | **Strategies** / Decide mode |
| Overwhelm with many ideas, no business-structure ask | Clear My Mind / organize (MJ-001 pattern) **before** Business Build |
| Workshop content ideas everywhere | Organize first — not Offer/Workshop production |

### Confidence gate (Universal Reasoning Journey)

| Confidence | Action |
|------------|--------|
| **High** — clear business-structure need | Enter Business Build path; quietly prepare relevant Finger + Build Type |
| **Medium** — could be Create artifact or business design | One clarifying question: *Are we designing how the business works, or making something you’ll use today?* |
| **Low** | Stay in Listening / Clarifying — do not open a “business builder” |

---

## 6. What Business Build should produce

Business Build produces **usable business structure**, not a feature tour.

### Primary outputs (living business assets)

- Offer definition(s) and offer suite clarity
- Customer experience map / onboarding path
- Revenue / pricing model summary
- Growth plan (priorities, channels, capacity constraints)
- Business system design (how delivery works end-to-end)
- Clear picture of **people helped** + promise (feeds Client Avatar / Business Profile)
- Alignment notes: identity ↔ offer ↔ experience ↔ systems

### Secondary / supporting outputs (via Create / Process Transfer — not owned exclusively by Business Build)

- Offer one-pager, sales page inputs
- Client onboarding document / checklist
- Marketing plan artifact
- SOPs and checklists that *implement* a designed system
- Proposal templates tied to an offer

### Certainty of completion (Spec 113 spirit)

Before a natural pause, the member should know:

1. **What we clarified** about the business  
2. **Where it lives** (Business Profile / Assets / Create work / conversation continuity — as wired)  
3. **What can happen next** (refine · Create a specific artifact · Project for execution · keep talking)

### What it must not produce

- A Projects board as the primary “business”
- A wall of templates labeled Business Build
- Auto-created Projects from every strategy chat (founder: no auto Project from Strategy Builder)
- A new parallel “business OS” store that duplicates Projects or Create

---

## 7. How Business Build uses the four layers

### Universal Reasoning Journey

Business Build is a **path within** the shared journey — not a fork that replaces it.

Shared stages (Phase 11 / Guided Creation spirit):

**Understand → Discover → Define → Build → Review → Improve → Complete → Remember**

Conversation flow remains: **Connect → Clarify → Guide → Create → Review → Continue**.

Business Build specializes the middle: after understanding, Spark activates **business-structure** reasoning before jumping to a document template.

Activation pipeline (Finger matrix):

```
Member language → Underlying need → Knowledge Finger(s)
  → Possible Build Type(s) → Capabilities → Outcome
```

Example: “create a new offer” → need: package transformation for a specific audience → Fingers: Product Development + Customer Discovery + Sales → Build Type: Offer → Capabilities: Working Memory, Research, Client Avatar, Documents → Outcome: clear offer the member can sell and deliver.

### Spark Experience Library

Treat as the **validation & experience pattern library** (Member Journey Library, Experience Constitution, Spec 103 patterns) — not a runtime feature picker.

Business Build must satisfy:

- Companion-first (Shari, not modules)
- Cognitive load ↓ · Relief Test · Future Me Test
- MJ-style situations: organize before produce when ideas are scattered
- Experience patterns: Discovery · Clarity · Creation · Decision · Practice — primary often **Clarity + Creation**

Business Build **does not** become a new entry in a member-facing “experience catalog.”

### Knowledge Fingers

Fingers supply **how Spark thinks** during Business Build. They do not own the journey UI.

| Typical Business Build need | Primary Finger(s) (prefer Index names) |
|----------------------------|----------------------------------------|
| New / improved offer | Product Development · Customer Discovery · Sales |
| Customer experience | Experience Design · Customer Discovery · Ops |
| Business system | Operations Management · Process Transfer · Execution Reliability |
| Revenue model | Strategic Decision Support · Product Development · Sales |
| Growth plan | Strategic Decision Support · Sales · Marketing domain knowledge |
| Brand / promise alignment | Relationship Communication · Customer Discovery · Strategic Decision Support |

Fingers declare Working Memory *needs*; they do not store memory.

### Working Memory

Map “Estate Working Memory” language → **Spec 112 Companion Memory + Spec 117 Business Brain + session continuity**.

During Business Build, preserve (when permission-appropriate):

- Why this business work matters now
- Audience / people helped (observed → confirm before durable)
- Decisions about offer, pricing, CX, systems
- Open questions and risks
- Connections to existing Assets / Client Avatars / prior plans
- Next meaningful step

Do **not**: invent a Business-Build-only memory engine; remember moods; assert Candidate facts as Active.

---

## 8. Role in the Estate

### Place

- **Experience:** Business (Estate Registry)  
- **Space:** Boardroom (`round-table`) — atmosphere for business thinking  
- **Entrance often:** Create / conversation anywhere (Room Independence) — journey continues; place optional  

Business Build is **conversation-led business design** that may invite Boardroom / My Business Estate when environment helps — never forced (Spec 108).

### Architectural role

```
Orchestration (reusable): Reasoning · Activation · Guided Creation (`universalCreation`)
        ↓
Business Knowledge Library / Domains (expertise home)
        ↓
Knowledge Fingers (situation reasoning)
        ↓
Business Build (journey family / role) — selects business-structure Build Types
        ↓
Build Types: Offer · Client Onboarding · Marketing Plan · (future system/CX builds)
        ↓
Capabilities: Working Memory · Research · Client Avatar · Documents · (later Projects)
```

### Boundaries (One Concept · One Owner · One Source of Truth)

| Concern | Owner |
|---------|-------|
| Conversation / voice / guardrails | Specs 105–111 · Relationship Constitution |
| Creation orchestration | `universalCreation` / Guided Creation (one engine) |
| Business structure journey selection | **Business Build role** (this definition) |
| Outcome execution | **Projects** |
| Directional strategy chat | **Business Strategy Builder** |
| Durable business profile / estate context | **My Business Estate** / Business Profile (when live) |
| Process documents | Process Transfer → SOP/Checklist Builds |
| Memory storage | Spec 112/117 |
| Expertise content | Knowledge Domains / Chamber — not Business Build |

### Explicit non-goals (pre-implementation)

- No new engine  
- No screen design in this phase  
- No merge of Projects + business stores  
- No Project↔business typed link in v1 (founder)  
- No Brand Studio / Identity Office / People I Help as new places until mapped in Estate Registry under existing Business/Create experiences  
- No replacement of Create Studio as the Free ↔ Guided entrance  

---

## 9. Definition (canonical)

> **Business Build** is the Universal Reasoning Journey role in which Spark helps a member design or strengthen the **structure of their business** — offers, customer experience, operating systems, revenue logic, and growth design — by activating Knowledge Fingers and existing Create/Build Types, while keeping Projects (execution), Strategies (direction), and SOPs (process transfer) in their proper jobs.

Members experience one conversation with Shari.  
They never manage “Business Build” as software.

---

## 10. Acceptance checks (for future implementation handoffs)

Before any implementation claims “Business Build”:

- [ ] Uses existing Guided Creation / `universalCreation` — no second engine  
- [ ] Entry criteria distinguish Create / Projects / Strategies / SOP  
- [ ] Outputs are business structure + optional Create artifacts — not a Projects board  
- [ ] Working Memory maps to Spec 112/117  
- [ ] Fingers provide reasoning only  
- [ ] No member-facing “Business Build” system name without founder rename decision  
- [ ] My Business Estate / Strategy Builder / Projects remain separate stores  
- [ ] Passes Shari / Hospitality / cognitive-load gates  

---

## 11. Recommended next (still not implementation)

1. Founder confirm: keep **Business Build** as internal journey-role language, or prefer **Business Development** everywhere.  
2. Map Boardroom tools ↔ Business Build entry matrix (Offer, CX, Systems, Revenue, Growth).  
3. Align Offer / Client Onboarding / Marketing Plan Build Types as first Business Build–served catalog — still on shared engine.  
4. Only then: implementation handoff (Wire), Observation Mode + Rule of Three respected.
