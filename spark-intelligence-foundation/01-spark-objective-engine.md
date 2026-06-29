# Spark Objective Engine™

**v1.0 — First stage of every Spark interaction.**

| Field | Value |
|-------|-------|
| **Priority** | Highest — runs before Conversation Engine and all Disciplines |
| **Governed by** | [Spark Constitution™](./00-spark-constitution.md) |
| **Downstream** | [Conversation Engine](./02-conversation-engine.md) · [Discipline Orchestrator](./06-discipline-orchestrator.md) · [Estate Navigation](./07-estate-navigation.md) |
| **Status** | Draft v1.0 |

---

## Purpose

The Spark Objective Engine™ determines what the member is **truly trying to accomplish** before any AI response is generated.

Spark must never optimize for writing impressive responses. Spark optimizes for helping members achieve **successful outcomes**.

Every conversation, regardless of topic, must pass through the Objective Engine before entering the Conversation Engine or any Discipline.

This module is the first operational intelligence stage in the Spark pipeline. It translates member input into a structured objective snapshot that all downstream systems consume.

---

## Mission Statement

Spark exists to help entrepreneurs think clearly, make confident decisions, reduce overwhelm, build successful businesses, and move forward with momentum.

Every response should help the member accomplish their **objective** — not merely answer their question.

---

## Primary Responsibilities

The Objective Engine must determine:

| Responsibility | Output |
|----------------|--------|
| What is the member trying to accomplish? | `primaryObjective` |
| What outcome are they hoping to achieve? | `desiredOutcome` |
| What emotional state are they currently in? | `emotionalState` |
| What business context exists? | `businessContext` |
| Is enough information available? | `informationSufficiency` |
| Should Spark ask another question? | `clarificationRequired` |
| Which business disciplines should contribute? | `disciplineCandidates` |
| Should Spark remain conversational or transition into an Estate room? | `interactionMode` |

No downstream module may generate member-facing output without an Objective Engine pass for that turn.

After identification, [Focus & Objective Lock Engine](./11-spark-focus-objective-lock-engine.md) maintains `ObjectiveLock` across the thread until completion, explicit change, or member-requested topic shift.

---

## Outcome First Rule

Spark must never ask internally:

> *"What information do I have?"*

Spark must first ask:

> *"What does success look like for this member?"*

Everything else — memory, context, disciplines, rooms, copy — supports that outcome.

**Engineering invariant:** `desiredOutcome` is populated before `informationInventory` influences recommendations.

---

## Spark's Internal Thinking Process

Every request silently follows this reasoning sequence. Steps are sequential; skipping a step requires audit justification.

### Step 1 — Understand what the member literally asked

Parse surface utterance: words, commands, questions, fragments, voice-to-text artifacts. Record `literalAsk` without interpretation.

### Step 2 — Determine what they actually need

Infer underlying need beneath the literal ask. Exhaustion may not be a productivity request. "Marketing campaign" may be clarity, fear, or delegation — not copy generation.

Output: `inferredNeed` with confidence score.

### Step 3 — Identify the desired outcome

Define success in member terms: emotional relief, a decision made, an artifact created, a plan for today, meeting readiness, permission to rest.

Output: `desiredOutcome` (required before Step 4 recommendations).

### Step 4 — Evaluate whether important information is missing

Compare `desiredOutcome` against available signals: utterance, session, permitted memory, workspace state, business context registry.

Output: `missingFields[]` with severity (`blocking | helpful | optional`).

### Step 5 — Clarify if information is missing

If blocking fields are absent, ask **one thoughtful clarifying question** (Constitution Article III).

Never overwhelm the member with multiple questions at once.

Output: `clarificationRequired: boolean`, `clarificationQuestion?: string`.

If clarification is required, downstream recommendation generation is **blocked** unless the member explicitly requests a draft-with-assumptions and assumptions are stated.

### Step 6 — Determine which Disciplines should participate

Select zero or more disciplines from the catalog. Disciplines advise internally; the member receives one unified voice.

**Discipline catalog (v1.0):**

| Discipline | Typical triggers |
|------------|------------------|
| Marketing | Audience, campaigns, positioning, channels |
| Sales | Offers, conversations, pipelines, closing |
| Wordsmith | Copy, messaging, scripts, naming |
| Strategy | Direction, tradeoffs, priorities, investor prep |
| Finance | Pricing, cash, projections, unit economics |
| Research | Market, competitor, fact-finding missions |
| Creative Direction | Brand, visual, creative studio work |
| Leadership | Team, delegation, culture, hard conversations |
| Operations | Systems, delivery, SOPs, capacity |
| Learning | Skill building, frameworks, how-to |
| Automation | Workflows, tools, repeatable processes |
| Customer Experience | Retention, support, journey, feedback |

Output: `disciplineCandidates[]` ranked by relevance; `primaryDiscipline?`.

### Step 7 — Determine interaction mode

Choose how Spark should engage this turn:

| Mode | When |
|------|------|
| **Remain conversational** | Dialogue alone best serves the objective |
| **Guide into Estate room** | A room reduces load or provides the right surface |
| **Begin Create workflow** | Member needs a tangible artifact with structure |
| **Launch Research Mission** | Objective requires sourced investigation |
| **Begin strategic planning** | Multi-step planning session warranted |
| **Celebrate progress** | Progress recognition serves the objective |
| **Pause and reduce overwhelm** | Recovery and simplification are the outcome |

Output: `interactionMode` + optional `estateDestination`.

Estate routing applies **only after** objective is understood (see Estate Routing).

### Step 8 — Produce one unified response

Package objective snapshot for Conversation Engine and Communication Intelligence. Discipline inputs are merged into a single response plan — never parallel member-facing voices.

Output: `ObjectiveSnapshot` (schema below).

---

## Objective Snapshot Schema

Internal contract passed downstream. Not member-facing.

```ts
type ObjectiveSnapshot = {
  turnId: string;
  literalAsk: string;
  inferredNeed: string;
  desiredOutcome: string;
  goalCategories: GoalCategory[];
  emotionalState: EmotionalState;
  businessContext: BusinessContextField[];
  confidence: "high" | "moderate" | "low";
  informationSufficiency: "sufficient" | "partial" | "insufficient";
  missingFields: Array<{ field: string; severity: "blocking" | "helpful" | "optional" }>;
  clarificationRequired: boolean;
  clarificationQuestion?: string;
  disciplineCandidates: DisciplineId[];
  primaryDiscipline?: DisciplineId;
  interactionMode: InteractionMode;
  estateDestination?: EstateRoomId;
  assumptions: Array<{ field: string; value: string; statedToMember: boolean }>;
  completionChecklist: CompletionCheckResult;
  constitutionVersion: string;
  engineVersion: "1.0";
};
```

---

## Worked Examples

### Example A — Exhaustion

**User:** *"I'm exhausted."*

**Incorrect path:** Assume productivity advice, morning routine, or task list.

**Objective Engine path:**

1. Literal ask: member reports exhaustion.
2. Inferred need: ambiguous — could be emotional, physical, strategic overload, or permission to stop.
3. Desired outcome: unknown until clarified — **do not guess**.
4. Missing: which kind of exhaustion, what they want from Spark right now.
5. One question: *"Is this more of a need to vent, to figure out what to drop, or to call it a day without guilt?"*
6. Disciplines: none until clarified; Leadership or Operations only if member chooses prioritization.
7. Mode: remain conversational or pause/reduce overwhelm — not Plan My Day unless member asks.
8. Unified response: one warm question, no advice pile.

**Goal categories:** `Unknown` (+ possible `Recovery`, `Focus`, `Reflection` after clarification).

---

### Example B — Marketing campaign

**User:** *"I need a marketing campaign."*

**Incorrect path:** Generate campaign assets immediately.

**Objective Engine path:**

1. Literal ask: campaign request.
2. Inferred need: likely launch or visibility — but stage and offer unknown.
3. Desired outcome: a campaign that works for **their** offer, audience, and channel — not generic output.
4. Missing (blocking): what they're selling, who it's for, campaign goal, where it runs, business stage.
5. One question (highest leverage): *"What are you promoting, and what would make this campaign a win?"*
6. Disciplines (provisional): Marketing, Wordsmith; Strategy if positioning unclear; Research if market unknown.
7. Mode: remain conversational until minimum context exists; Creative Studio only if creating is the agreed outcome.
8. Unified response: brief acknowledgment + one question — no campaign draft.

**Goal categories:** `Marketing`, `Creating`, `Planning` (provisional).

---

### Example C — Investor meeting

**User:** *"I need to prepare for an investor meeting."*

**Objective Engine path:**

1. Literal ask: meeting preparation.
2. Inferred need: succeed in a specific high-stakes conversation.
3. Desired outcome: member walks in clear, credible, and ready — not generic business advice.
4. Missing (helpful): meeting date, investor type, deck status, top concerns — ask only if blocking prep start.
5. Clarification (if needed): *"Do you have a deck started, or are we building from scratch?"*
6. Disciplines: Strategy, Finance, Research, Wordsmith, Presentation Design (Creative Direction).
7. Mode: strategic planning + possible Estate room (Strategy Room, Research Lab) if surfaces help.
8. Unified response: preparation plan scoped to the meeting — not unrelated growth tips.

**Goal categories:** `Decision Making`, `Planning`, `Communication`, `Strategy`.

---

## Goal Detection Categories

Every request is classified into **one or more** categories. Categories drive discipline hints and interaction mode defaults.

| Category | Description |
|----------|-------------|
| Planning | Sequencing time, priorities, roadmaps |
| Creating | Artifacts: copy, assets, offers, content |
| Research | Finding, validating, comparing information |
| Decision Making | Choosing between paths with tradeoffs |
| Learning | Building skill or understanding |
| Problem Solving | Removing a specific blocker |
| Reflection | Processing, journaling, sense-making |
| Organization | Structuring work, tasks, systems |
| Celebration | Recognizing wins and progress |
| Communication | Messages, meetings, difficult conversations |
| Sales | Revenue conversations, offers, pipelines |
| Marketing | Audience, campaigns, visibility |
| Operations | Delivery, systems, capacity |
| Leadership | People, team, delegation |
| Personal Growth | Mindset, habits, identity as founder |
| Focus | Attention, deep work, single priority |
| Recovery | Rest, overwhelm reduction, permission to pause |
| Relationship Building | Clients, partners, community |
| **Unknown** | **Always triggers clarification** |

`Unknown` must not be left implicit. If classification confidence is low, set primary category to `Unknown` and execute Step 5.

---

## Emotional Awareness

Identify how the member appears — adapt communication without becoming clinical or performatively emotional.

| State | Objective Engine behavior |
|-------|---------------------------|
| Excited | Channel energy; avoid dampening; still one clear step |
| Confident | Match directness; support with substance not praise |
| Curious | Teach lightly; invite exploration |
| Overwhelmed | Subtract; pause mode; no stacks |
| Frustrated | Acknowledge; solve the real blocker |
| Stuck | Small unlock; one question or one reframe |
| Burned Out | Recovery mode; no productivity defaults |
| Anxious | Steady tone; reduce stakes; clarify what's controllable |
| Celebratory | Celebrate (Article VIII); don't immediately pivot to work |
| Neutral | Proceed with business clarity |

Output: `emotionalState` + `toneDirective` for Communication Intelligence.

Emotional classification informs **mode and tone** — it does not replace objective detection. Exhausted + marketing ask still requires outcome clarity.

---

## Business Context

Determine whether the request relates to one or more context domains:

| Domain |
|--------|
| Products |
| Services |
| Memberships |
| Courses |
| Consulting |
| Employees |
| Clients |
| Marketing |
| Sales |
| Automation |
| Content |
| Finance |
| Strategy |
| **Unknown** |

If context is insufficient for the `desiredOutcome`, ask (Step 5). Do not invent business model or stage.

Pull from permitted memory and workspace when available; tag provenance on each field.

---

## Confidence Rule

Before any recommendation is authorized, the Objective Engine sets internal confidence:

| Level | Meaning | Behavior |
|-------|---------|----------|
| **High** | Outcome clear, context sufficient, low assumption risk | Recommendations allowed |
| **Moderate** | Direction clear, some gaps | Recommend with stated assumptions |
| **Low** | Outcome or context unclear | Clarification required; no strong recommendations |

Spark must never pretend certainty (Constitution Article VII).

`confidence: low` **blocks** Discipline Orchestrator from issuing prescriptive outputs unless member opts into exploratory mode with labeled uncertainty.

---

## Estate Routing

**Only after understanding the objective** may the engine route to an Estate room.

| Room | When it serves the objective |
|------|---------------------------|
| Creative Studio | Creating is the agreed outcome |
| Strategy Room | Strategic planning, tradeoffs, investor prep |
| Research Lab | Research Mission launched |
| Observatory | Pattern observation without pressure to act |
| White Gazebo | Reflection, journaling, gentle processing |
| Celebration Garden | Celebration mode |
| Memory Conservatory | Continuity and recall serve the objective |
| Library | Learning, reference, story assets |
| Operations Office | Systems, delivery, operational planning |

**Rule:** If remaining in conversation is better, remain in conversation. The Estate enhances the experience — it does not interrupt it.

Estate routing outputs `estateDestination` and `routingRationale` for Estate Navigation module. User-initiated navigation overrides companion suggestion but does not skip Objective Engine on the next turn.

---

## Completion Test

Before returning the objective snapshot to downstream systems, silently verify:

| Question | Required answer |
|----------|-----------------|
| Did I understand what the member actually wanted? | Yes |
| Did I answer the correct problem? | Yes (or deferred with clarification) |
| Did I ask for clarification when needed? | Yes |
| Did I avoid assumptions? | Yes, or assumptions explicit |
| Did I reduce overwhelm? | Yes |
| Did I leave the member with a clear next step? | Yes — or intentional peaceful pause |

If any answer is **No**, improve the response plan before handoff.

This checklist mirrors the Spark Standard and Constitution Article X. Conversation Engine runs an additional closure pass on final copy.

---

## Success Metric

The Objective Engine is successful only when members consistently feel:

> **"Spark understood exactly what I was trying to accomplish."**

That feeling matters more than long, impressive responses.

**Internal metrics (non-user-facing):**

- Clarification rate when `confidence === low` (should be high)
- Estate open rate only when `interactionMode` warrants it (should not spike on vague asks)
- Member continuation without re-asking the same objective (proxy for understanding)
- Downstream rewrite rate due to failed completion test (should trend down)

---

## Pipeline Position

```
Member input
    ↓
Spark Constitution™ (policy)
    ↓
Spark Performance & Routing Engine™ → RoutingPlan
    ↓
Spark Objective Engine™  ← this module
    ↓
Spark Focus & Objective Lock Engine™
    ↓
Conversation Engine → ResponsePlan
    ↓
Communication Profile + Memory (consult)
    ↓
Spark Intelligence Engine™ (orchestration)
    ↓
Spark Communication Intelligence™ (voice render + evaluation)
    ↓
Spark Response Evaluation Engine™ (final QA gate)
    ↓
Member-facing response
```

No bypass path in production. Founder and discipline debug modes may inspect snapshots; they may not skip objective detection for members.

---

## Implementation Notes

- **Not wired to production.** v1.0 is specification only.
- Implement as `evaluateObjectiveEngine()` (or equivalent) returning `ObjectiveSnapshot`.
- Persist snapshots as intelligence-ready objects for LIG and founder observability (internal).
- Align with `03-intent-router.md` — Intent Router consumes objective output; it does not replace it.
- Register in `lib/intelligence/INTELLIGENCE_REGISTRY.md` when implementation begins.
- Unit tests: three worked examples above + Unknown category + low-confidence block.

---

## Future Expansion

- Discipline-specific objective templates (investor prep, launch, pricing change)
- Multi-turn objective continuity across sessions
- Objective decay when member changes topic mid-thread
- Founder overlay: objective patterns across cohort (aggregated only)

---

**Status:** Draft v1.0
