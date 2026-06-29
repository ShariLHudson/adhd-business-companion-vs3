# Spark Intelligence Engine™

**v1.0 — Central reasoning and orchestration for Spark.**

| Field | Value |
|-------|-------|
| **Priority** | Conductor — orchestrates reasoning; does not speak directly to members |
| **Governed by** | [Spark Constitution™](./00-spark-constitution.md) |
| **Consumes** | Objective Engine · Conversation Engine · Memory · Communication Profile · Estate context |
| **Produces** | `UnifiedReasoningResult` → one voice via Communication Intelligence |
| **Status** | Draft v1.0 |

---

## Purpose

The Spark Intelligence Engine™ is the **central reasoning system** that powers every decision inside Spark.

It does **not** communicate directly with members.

Instead, it orchestrates every conversation by coordinating Spark's knowledge, memory, disciplines, communication intelligence, research capabilities, and Estate experience into **one unified response**.

The Intelligence Engine exists so members experience **one intelligent conversation** instead of many disconnected AI systems.

---

## Mission Statement

Spark should **think before it responds**.

Every recommendation should be **intentional**.

Every response should represent the **collective reasoning of Spark** rather than a single AI completion.

The Intelligence Engine serves as the **conductor** of the entire Spark ecosystem.

---

## Core Philosophy

The Intelligence Engine never asks:

> *"What should I say?"*

It asks:

> *"What is the best way to help this member accomplish their objective?"*

Everything else — disciplines, research, memory, knowledge, board review, Estate routing — supports that mission.

Aligns with [Outcome First Rule](./01-spark-objective-engine.md) and the Spark Standard.

---

## Responsibilities

The Intelligence Engine is responsible for:

| Responsibility | Output |
|----------------|--------|
| Understanding context | `contextBundle` |
| Selecting Disciplines | `activeDisciplines[]` |
| Activating Research when necessary | `researchMission?` |
| Consulting Memory | `memoryContext` |
| Using Communication Intelligence | `communicationProfile` (profile consult — not final voice) |
| Evaluating confidence | `reasoningConfidence` |
| Resolving conflicting recommendations | `reconciledRecommendation` |
| Determining next steps | `nextSteps` |
| Generating one unified response | `unifiedDraft` |

No member-facing text ships without Intelligence Engine orchestration completing (or explicitly deferring to Conversation Engine clarification-only path).

---

## Processing Pipeline

Every interaction follows this orchestration sequence. Stages may short-circuit when objective snapshot requires clarification only or when [Performance & Routing](./09-spark-performance-routing-engine.md) selects a shallow path.

```
Spark Constitution™ (policy gate)
    ↓
Spark Performance & Routing Engine™ → RoutingPlan
    ↓
Objective Engine™ → ObjectiveSnapshot
    ↓
Conversation Engine™ → ResponsePlan (structure, mode, momentum)
    ↓
Communication Intelligence™ → Communication Profile loaded
    ↓
Memory Engine™ → factual context, lineage, recall
    ↓
Spark Intelligence Engine™  ← this module (orchestration)
    ↓
Disciplines (domain reasoning)
    ↓
Knowledge Library (canonical frameworks)
    ↓
Research Lab (if required)
    ↓
Board Review (if appropriate)
    ↓
Unified reasoning draft
    ↓
Communication Intelligence™ → voice, evaluation, final copy
    ↓
Spark Response Evaluation Engine™ → final QA gate
    ↓
Member-facing response
```

**Note:** Communication Intelligence appears twice by design:

1. **Profile consult** — before orchestration (preferences inform reasoning format and depth)
2. **Voice render** — after unified draft (Shari test, adaptation, evaluation)

The Intelligence Engine never bypasses Constitution, Objective Engine, or Conversation Engine quality gates.

---

## Discipline Selection

The Intelligence Engine determines which disciplines participate — via [Discipline Orchestrator](./06-discipline-orchestrator.md).

**Discipline catalog (v1.0):**

| Discipline | Domain |
|------------|--------|
| Marketing | Audience, campaigns, positioning |
| Sales | Offers, pipelines, conversations |
| Strategy | Direction, tradeoffs, positioning |
| Wordsmith | Copy, messaging, scripts |
| Creative Direction | Brand, visual, creative assets |
| Research | Investigation, validation |
| Finance | Pricing, margins, cash, projections |
| Leadership | Team, culture, delegation |
| Operations | Systems, delivery, capacity |
| Customer Experience | Retention, journey, support |
| Learning | Skill building, frameworks |
| Automation | Workflows, tools |
| AI Advisor | AI strategy and tooling |
| Brand Strategy | Brand architecture, identity |
| Technology | Stack, build vs. buy, technical feasibility |

**Rules:**

- Activate **only** disciplines required for the objective.
- Avoid unnecessary complexity.
- One **primary** discipline; others advisory unless member requests breadth.
- Discipline outputs are **internal** until reconciled into unified voice.

```ts
type DisciplineContribution = {
  disciplineId: string;
  recommendation: string;
  confidence: ReasoningConfidence;
  rationale: string;
  risks?: string[];
};
```

---

## Research Activation

Research activates **only** when at least one condition is true:

| Trigger | Example |
|---------|---------|
| Current information matters | Market shifted since last conversation |
| Facts require verification | Competitor claim, regulation, statistic |
| Competitive analysis needed | Positioning vs. alternatives |
| Market conditions influence recommendation | Launch timing, pricing in volatile market |
| Member explicitly requests research | *"Look into this for me"* |
| Historical context would improve answer | Prior pivot, past campaign results |

Otherwise use Spark's **internal knowledge** (Knowledge Library, memory, frameworks) — do not launch Research Lab by default.

Output: `researchMission?: { scope, sources, deadline, blocksRecommendation: boolean }`

Low confidence + material stakes → prefer research or clarification over guessing.

---

## Board Review

For **high-impact decisions**, the Intelligence Engine may invoke internal **Board Review** — a structured multi-perspective evaluation, not separate member-facing voices.

**Triggers (examples):**

| Decision type |
|---------------|
| Launching a business |
| Hiring employees |
| Major pricing decisions |
| Large investments |
| Business pivots |
| Strategic partnerships |
| Long-term planning |

**Board evaluates:**

- Risk
- Opportunity
- Long-term consequences
- Strategic alignment
- Customer impact
- Financial implications

**Rules:**

- Board provides **perspective** — not separate responses to the member.
- Output is synthesized into one recommendation with tradeoffs named.
- Board Review is internal; member sees thoughtful unity, not committee chaos.
- Not required for routine or low-stakes turns.

```ts
type BoardReviewResult = {
  triggered: boolean;
  perspectives: Array<{ lens: string; assessment: string; confidence: ReasoningConfidence }>;
  synthesis: string;
  dissent?: string; // reconciled in member copy if material
};
```

---

## Knowledge Sources

The Intelligence Engine combines information from — **no single source dominates without reason**:

| Source | Role |
|--------|------|
| Spark Knowledge Library | Canonical business knowledge, frameworks |
| Business Frameworks | Structured models for reasoning |
| Smart Cards | Quick-reference intelligence cards |
| Research Library | Prior research missions |
| Member Memory | Facts, history, objects (Memory Engine) |
| Communication Intelligence | Preferences, vocabulary, style signals |
| Current Research | Active mission results |
| Estate Context | Active room, workspace state |
| Conversation History | Thread continuity |
| Business Disciplines | Domain contributions |
| External AI reasoning | When permitted, attributed, and governed |

Each source contributes with `provenance` and `weight`. Conflicts trigger Conflict Resolution.

---

## Conflict Resolution

Disciplines may disagree.

**Examples:**

| Tension | Disciplines |
|---------|-------------|
| Lower price vs. margins | Marketing vs. Finance |
| Reposition vs. optimize current offer | Strategy vs. Operations |

**Intelligence Engine must:**

1. Surface the tension internally.
2. Reconcile into **one thoughtful recommendation**.
3. Explain tradeoffs in member copy when the decision matters — without exposing "multiple experts."

Members must **not** receive conflicting advice without explanation.

```ts
type ConflictResolution = {
  conflictDetected: boolean;
  positions: DisciplineContribution[];
  reconciledRecommendation: string;
  tradeoffExplanation?: string;
  confidence: ReasoningConfidence;
};
```

Default bias when irreconcilable: favor **member objective**, **risk transparency**, and **Spark Standard** (one meaningful step forward).

---

## Confidence Evaluation

Internally classify reasoning confidence:

| Level | Meaning | Required behavior |
|-------|---------|-------------------|
| **Very High** | Strong context, aligned disciplines, verified facts | Recommend clearly |
| **High** | Good context, minor gaps | Recommend with light caveats |
| **Moderate** | Some assumptions stated | Recommend with assumptions labeled |
| **Low** | Material unknowns | Clarification, research, or transparency |
| **Unknown** | Cannot reason responsibly | One clarifying question; no strong prescription |

**Low confidence requires:** clarification, research, and/or transparency (Constitution Article VII).

Spark must never hide uncertainty.

`reasoningConfidence` propagates to Conversation Engine closure and Communication Evaluation.

---

## Reasoning Rules

The Intelligence Engine prioritizes:

| Priority | Over |
|----------|------|
| Accuracy | Speed |
| Clarity | Complexity |
| Business value | Impressive language |
| Practical execution | Theory |
| Member success | Completeness |
| Progress | Perfection |

Matches Constitution Core Philosophy and [Conversation Engine](./02-conversation-engine.md) momentum principle.

---

## Estate Awareness

The Intelligence Engine determines whether another Estate room would improve the experience — consuming `ObjectiveSnapshot.estateDestination` and orchestration needs.

| Room | When orchestration favors it |
|------|------------------------------|
| Creative Studio | Create mode, artifact needed |
| Strategy Room | High-stakes planning, Board Review follow-through |
| Observatory | Pattern view before decision |
| Research Lab | Active research mission |
| White Gazebo | Reflection, processing |
| Celebration Garden | Celebration mode |
| Library | Learning, reference assets |
| Operations Office | Systems and execution planning |

Navigation must feel **natural — not forced**. Conversation Engine drafts invitations; Estate Navigation executes on acceptance.

---

## Member Awareness

Always consider in `contextBundle`:

| Signal | Source |
|--------|--------|
| Business goals | Memory, objectives |
| Current projects | Memory, workspace |
| Communication preferences | Communication Profile |
| Learning preferences | Communication Profile |
| Existing knowledge | Memory, Knowledge Library |
| Current workload | Memory, conversational signals |
| Emotional state | Objective Snapshot |
| Long-term vision | Memory (narrative), goals |
| Previous conversations | Thread + Memory Engine |
| Known strengths | Pattern intelligence (future), memory |
| Known challenges | Pattern intelligence (future), memory |

Observe patterns — **never conclude identity** for the member (Constitution, Ethical Foundation).

---

## Unified Response Rule

Regardless of how many disciplines, sources, or board perspectives participate:

> Spark produces **one seamless response**.

Members must never feel they are speaking to multiple experts.

Spark speaks with **one voice**.

**Implementation:**

```ts
type UnifiedReasoningResult = {
  objectiveId: string;
  contextBundle: ContextBundle;
  activeDisciplines: string[];
  disciplineContributions: DisciplineContribution[];
  researchMission?: ResearchMission;
  boardReview?: BoardReviewResult;
  conflictResolution?: ConflictResolution;
  reasoningConfidence: ReasoningConfidence;
  reconciledRecommendation: string;
  nextSteps: string[];
  unifiedDraft: string; // pre-voice; Communication Intelligence polishes
  businessStandardImpact: BusinessStandardImpact[];
  evaluationChecklist: IntelligenceEvaluationResult;
  engineVersion: "1.0";
};
```

---

## Business Standard

Every recommendation should improve **at least one** of:

| Dimension |
|-----------|
| Time |
| Revenue |
| Clarity |
| Confidence |
| Execution |
| Learning |
| Organization |
| Relationships |
| Decision Quality |
| Long-Term Growth |

If a recommendation cannot map to at least one dimension, reconsider whether it serves the objective.

`businessStandardImpact: Array<{ dimension, mechanism }>` — internal audit field.

---

## Evaluation Checklist

Before handing off to Communication Intelligence for voice render, silently verify:

| Question | Required |
|----------|----------|
| Did we understand the objective? | Yes |
| Did we activate the correct disciplines? | Yes |
| Did we gather enough information? | Yes, or uncertainty stated |
| Did we avoid assumptions? | Yes, or assumptions explicit |
| Did we balance competing perspectives? | Yes, if conflict existed |
| Did we create clarity? | Yes |
| Did we move the member forward? | Yes |

If any answer is **No**, improve reasoning before unified draft.

```ts
type IntelligenceEvaluationResult = {
  objectiveUnderstood: boolean;
  disciplinesCorrect: boolean;
  informationSufficient: boolean;
  assumptionsAvoided: boolean;
  perspectivesBalanced: boolean;
  clarityCreated: boolean;
  movedForward: boolean;
  pass: boolean;
};
```

---

## Long-Term Learning

Every completed interaction is an opportunity to improve — **invisibly** to the member (Intelligence Paradox).

Spark should learn (internal, intelligence-ready):

| Learning target |
|-----------------|
| Which recommendations worked |
| Which workflows members preferred |
| Which disciplines were most helpful |
| What communication style produced best outcomes |
| How members define success |

The Intelligence Engine feeds enrichment hooks (`intelligenceMeta`, LIG edges) without requiring members to "train AI."

**Architecture alignment:**

- Enrichable, not duplicated — `lib/intelligence/intelligenceReadyTypes.ts`
- Registry updates — `lib/intelligence/INTELLIGENCE_REGISTRY.md`
- Founder overlays aggregate; member private content stays bounded

---

## Intelligence-Ready Architecture

The Intelligence Engine enforces platform-wide intelligence rules (inherited from foundation architecture):

| Principle | Enforcement |
|-----------|-------------|
| Build once, enrich forever | Reasoning outputs attach to living objects |
| Relationships over content | LIG edges on recommendations and decisions |
| Hooks today, engines tomorrow | Optional metadata on every orchestration result |
| Invisible evolution | Learning writes are async, non-blocking |
| Never bulk-expose intelligenceMeta in UI | Unless feature explicitly requires |

---

## Success Metric

The Intelligence Engine succeeds when members consistently feel:

| Feeling |
|---------|
| *"It feels like Spark thought this through."* |
| *"It understood my situation."* |
| *"It connected the right ideas."* |
| *"It gave me exactly the help I needed."* |
| *"I trust its recommendations."* |

The member should **never think about the Intelligence Engine**.

They should simply experience thoughtful, consistent, high-quality guidance.

**Internal metrics:**

- Discipline activation precision (right disciplines, not over-activation)
- Conflict resolution rate without member-reported contradiction
- Research activation appropriateness (not over-researching simple asks)
- Board Review trigger accuracy on high-stakes turns
- Evaluation checklist failure / rewrite rate

---

## Pipeline Boundaries

| Module | Boundary |
|--------|----------|
| **Objective Engine** | What member wants — Intelligence Engine does not re-derive |
| **Conversation Engine** | Dialogue structure — Intelligence Engine fills substance |
| **Communication Intelligence** | Profile + voice — not domain reasoning |
| **Memory Engine** | Facts — Intelligence Engine queries, does not invent |
| **Discipline Orchestrator** | Executes discipline packs — Intelligence Engine selects and reconciles |
| **Estate Navigation** | Executes navigation — Intelligence Engine recommends when |

---

## Implementation Notes

- **Not wired to production.** v1.0 is specification only.
- Implement as `orchestrateSparkIntelligence(input: OrchestrationInput): UnifiedReasoningResult`.
- Single audit trace per turn: which sources, disciplines, and gates fired.
- Align with existing `lib/*Intelligence*.ts`, `lib/companionIntelligenceRouter.ts`, phase ecosystem docs.
- Board Review and Research Lab are spec placeholders until dedicated foundation docs exist.
- Knowledge Library integration TBD — register when module is specified.

---

## Future Expansion

- Observatory integration for pattern-aware reasoning without conclusion
- Executive Team internal roles (spec only)
- Automated A/B of orchestration policies with member opt-in
- Real-time confidence escalation to human founder review (founder systems)

---

**Status:** Draft v1.0
