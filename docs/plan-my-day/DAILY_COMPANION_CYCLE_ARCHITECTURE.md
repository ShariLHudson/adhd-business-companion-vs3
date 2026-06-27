# Daily Companion Cycle Architecture
## Plan My Day — Canonical Source of Truth

**Version:** 2.0 (Sprint 2 readiness)  
**Status:** Approved for implementation  
**Supersedes:** Sprint 1 reasoning-only drafts; subordinate to `docs-companion-intelligence/21_Companion_Constitution.md`

**Related documents:**
- [COMPANION_JUDGMENT_REPORT.md](./COMPANION_JUDGMENT_REPORT.md) — Sprint 1.75 validation (ten simulations + judgment report)
- [../ARCHITECTURAL_GUARDRAILS.md](../ARCHITECTURAL_GUARDRAILS.md) — Plan My Day workspace rules (§3)

**Implementation fixtures:** `lib/planMyDay/dailyCompanionCycle/fixtures/`

---

## What Plan My Day Is

Plan My Day is **not a planner**. It is the **Daily Companion Cycle** — the visible daily reasoning surface of Companion Brain Intelligence.

| Is | Is not |
|----|--------|
| Companion prepares; user judges | Blank board on entry |
| Orientation before tasks | Task management software |
| Momentum over urgency | Productivity dashboard |
| Permission through exclusion | Infinite backlog |
| Silent learning after the day | Surveys, journaling, pop-ups |

**The board is not the beginning.** The board is where a **confirmed** plan lives.

---

## Constitutional Foundation

Every decision must satisfy:

- Companion Constitution (Three Laws)
- Product Constitution (seven articles + Conversation Governance)
- Cognitive Growth Principle (`lib/cognitiveGrowthPrinciple.ts`)
- Architectural Guardrails §3 (Plan My Day)
- Relationship Phase Constitution (one voice, permission-based offers)

### Mapping

| Sprint language | Repo anchor |
|-----------------|-------------|
| Flawless Brain Intelligence | Companion Brain Intelligence |
| Stewardship Oath | Companion carries load; user keeps agency |
| Dual Mandate | Help today + strengthen thinking skills |
| Cognitive Audit | Pre-render + post-reflection gates |
| Relevance Safeguard | Suppress low-value / wrong-time signals |
| Decision Filter | ≤3 meaningful choices; one momentum anchor |
| Stewardship Review | Evaluation checklist (below) |

### Learning rule (absolute)

**Learning improves judgment. Learning never overrides agency.**

The Companion Brain may update: timing, priority, permission, momentum, confidence, and relationship judgment.

It may **never** silently change user goals, commitments, or intentions.

---

# Part I — Sprint 1: Daily Reasoning Architecture

## Mission

Create **orientation** before obligation:

> *"I know where I am"* before *"I know what I have to do."*

## The Companion Thinks First

Before the page renders, Shari silently answers:

1. What already exists in the brain?
2. What happened yesterday?
3. What is unfinished?
4. What matters most?
5. What future commitments influence today?
6. What opportunities exist today?
7. What unnecessary cognitive load can I carry?
8. What capability can I strengthen?
9. What can safely wait?
10. What should NOT be on today's plan?
11. What one action creates the greatest positive momentum?
12. What does the user need to know?
13. What does the user NOT need to think about today?

## Journey placement

Optimize long-term trajectory, not today's busyness:

```
Future Vision → Current Season → This Month → This Week → Today → Right Now
```

Sprint 2 computes **This Week** and **Today** links; Season/Vision read from Goals + My Journey when present.

## Reasoning phases (0–7)

| Phase | Name | Visibility | Purpose |
|-------|------|------------|---------|
| 0 | Context assembly | Silent | Read-only snapshot from ecosystem |
| 1 | Situation awareness | Silent | Understand brain load |
| 2 | Journey placement | Silent | Connect today to week/month |
| 3 | Momentum selection | Silent | One chain-reaction anchor |
| 3b | Confidence selection | Silent | Self-trust action (may differ) |
| 4 | Permission curation | Silent | What does NOT belong today |
| 5 | Scope realism | Silent | Adapt My Day alignment |
| 6 | Cognitive Audit | Silent | Constitutional gate |
| 7 | Render contract | User-facing | Orientation + confirmation |

## Intelligence inputs (Tier A)

| Source | Use |
|--------|-----|
| Adapt My Day | Capacity, energy, motivation, vibe |
| Clear My Mind | Preparation cards, pull candidates |
| Yesterday's plan | Carry-forward, behavior themes |
| Projects / Goals | Next actions, deadlines, journey |
| `planBehaviorLearning` | Defer/complete themes |
| `momentum-intelligence` | Flow protection signals |
| `planRealityAlignment` | Capacity mismatch patterns |

## Intelligence outputs

Core artifact: `DailyReasoningResult` (`lib/planMyDay/dailyCompanionCycle/types.ts`)

- OrientationBrief
- JourneyPlacement
- MomentumRecommendation
- ConfidenceRecommendation
- PreparedProposal[] (not plan items until confirmed)
- PermissionBrief (exclusions + reasons)
- ConfirmationContract (confirm / adjust / decline / swap / reduce)
- RegisteredPrediction[] (for Phase 8 review)

## User interaction philosophy

| User verbs | Companion never |
|------------|-----------------|
| Confirm, Adjust, Decline, Move, Swap, Reduce, Accept | Auto-materialize |
| | Build the plan from scratch |
| | Stack unlimited choices |

---

# Part II — Sprint 1.5: Reflection Intelligence

## Phase 8 — Silent post-day reasoning

**Not:** journaling, surveys, pop-ups, another page.

**Purpose:** Transform today's experience into tomorrow's wisdom.

### Reflection questions (internal)

- What surprised me?
- Which predictions were accurate / inaccurate?
- Did the momentum anchor create momentum?
- Were permission exclusions correct?
- Did the user decide better than before?
- What capability / confidence appeared stronger?
- What cognitive load did I still leave?
- What should I understand differently tomorrow?

### Memory vs reflection vs wisdom

| | Memory | Reflection | Wisdom |
|---|--------|------------|--------|
| Role | Stores events | Interprets meaning | Integrates over time |
| Updates | Raw data | Judgment weights | Earned lessons |
| User sees | Their content | Nothing (Sprint 2) | Rare, permission-based (future) |

Module: `wisdomIntelligence.ts` — long horizon only (≥60 days). Daily reflection **feeds** wisdom; does not replace it.

## Daily Learning Loop

```
Yesterday → Reflection Intelligence → Updated Companion Brain
    → Today's Reasoning → Orientation → Partnership
    → Observation → Reflection → Tomorrow's Brain
```

## Learning signals (internal, not dashboards)

`prediction-accuracy` · `momentum-success` · `permission-accuracy` · `decision-confidence` · `planning-confidence` · `follow-through-trend` · `recovery-speed` · `overwhelm-reduction` · `capability-growth` · `confidence-growth`

Emit at Phase 8 only. Cap per day. Negative signals calibrate — never shame.

## CompanionBrainState

Persisted judgment only (`companion-brain-state-v1`). Bounded patches: ±0.05 per weight per day; max 3 categories per day.

---

# Part III — Sprint 1.75: Companion Judgment Validation

Ten Human Reality Test simulations validated judgment across:

1. Normal Tuesday  
2. High Energy Launch Day  
3. Low Energy Day  
4. Overwhelm Day  
5. Hyperfocus Day  
6. Recovery Day  
7. Health Day  
8. Family First Day  
9. Creative Day  
10. Celebration Day  

**+ recommended:** Day After Launch

**Verdict:** Architecture passes with refinements R1–R5 (integrated below).

Full narrative: [COMPANION_JUDGMENT_REPORT.md](./COMPANION_JUDGMENT_REPORT.md)

---

# Part IV — Approved Refinements (R1–R5)

## R1 — DayMode

```typescript
type DayMode =
  | "normal"
  | "survival"
  | "family"
  | "health"
  | "celebration"
  | "hyperfocus"
  | "recovery"
  | "creative";
```

**Guides:** reasoning tone, proposal count, permission depth, plan reduction/protection/pause.

| DayMode | Proposal bias | Permission | Momentum |
|---------|---------------|------------|----------|
| normal | 2–4 | collapsed summary | anchor required |
| survival | 0–2 | collapsed | optional |
| family | 0–1 business | collapsed | one courtesy action |
| health | 1–2 health | business excluded | health anchor |
| celebration | 0 | none | none |
| hyperfocus | 0 | none | none (protected) |
| recovery | 0–1 | collapsed | none default |
| creative | 1–2 | collapsed | ExplorationBlock |

**Resolver:** Phase 0 sets `DayMode` from Adapt My Day, CMM captures, cooldowns, hyperfocus session, celebration evidence.

## R2 — CycleState: protected

```typescript
type CycleState =
  | "reasoning"
  | "orienting"
  | "confirming"
  | "living"
  | "protected";
```

When `protected` (hyperfocus, or user in flow per `companionActionBias`):

- Do not interrupt
- Do not replan
- Do not surface new proposals
- Offer only gentle minimal orientation if user opened plan

**Skips Phase 7 proposal rendering entirely.**

## R3 — orientationOnly + collapsed permission

For overwhelm (`motivation=overwhelmed`), survival, recovery, high cognitive load:

- `orientationType`: `short` | `orientationOnly` | `minimal`
- `permissionDisplay`: `collapsedSummary` (count + expand on demand)
- `orientationOnly: true` → ≤1 proposal; empty materialization valid

**Default reduces thinking, not explains everything.**

## R4 — ExplorationBlock proposal type

```typescript
type ExplorationBlockProposal = {
  kind: "explorationBlock";
  id: string;
  label: string;
  durationMinutes: number;
  purpose: string;
};
```

Creative days: timeboxed ideation **without** `PlanDayItem` until user confirms execution phase.

Respects creative energy — does not convert sparks into obligations.

## R5 — celebrationCooldown / survivalCooldown

Stored in `CompanionBrainState.activeCooldowns`:

### celebrationCooldown (24h)

After celebration days:

- No immediate next tasks
- No achievement → productivity pivot
- No evening "ready for tomorrow?" push
- Reflection suppresses forward-planning framing

### survivalCooldown (24h)

After survival / recovery days:

- No backlog compensation next day
- No "catch up" framing
- Light orientation only; ≤2 low-friction proposals unless user asks

---

# Part V — Daily Companion Cycle (complete)

```
Observe → Understand → Prepare → Orient → Partner → Support
    → Observe → Reflect → Learn → Grow → Repeat
```

### UI layers (after reasoning exists)

| Layer | Content | Existing code |
|-------|---------|---------------|
| 0 | Orchestrator (invisible) | **New** |
| 1 | Orientation Surface | **New** |
| 2 | Confirmation Surface | **New** |
| 3 | Living Board | `PlanMyDayPanel.tsx` |

Entry state machine: `reasoning` → `orienting` → `confirming` → `living` | `protected`

---

# Part VI — Implementation Order

**Do not begin UI before reasoning layer + fixture tests pass.**

| Step | Module | Path |
|------|--------|------|
| 1 | Types | `dailyCompanionCycle/types.ts` ✓ |
| 2 | Input adapters | `dailyCompanionCycle/inputs/` |
| 3 | Orchestrator | `dailyCompanionCycle/orchestrator.ts` |
| 4 | DayMode resolver | `dailyCompanionCycle/dayModeResolver.ts` |
| 5 | CycleState resolver | `dailyCompanionCycle/cycleStateResolver.ts` |
| 6 | Momentum selector | `dailyCompanionCycle/momentumSelector.ts` |
| 7 | Confidence selector | `dailyCompanionCycle/confidenceSelector.ts` |
| 8 | Permission curator | `dailyCompanionCycle/permissionCurator.ts` |
| 9 | Cognitive Audit gate | `dailyCompanionCycle/cognitiveAudit.ts` |
| 10 | Reflection engine | `dailyCompanionCycle/reflection/` |
| 11 | Learning signal emitter | `dailyCompanionCycle/signals/` |
| 12 | Unit tests from fixtures | `simulationFixtures.test.ts` + orchestrator tests |
| 13 | Minimal orientation surface | `components/...` |
| 14 | Confirmation surface | `components/...` |
| 15 | Materialize into `planDayItems` | wire to `PlanMyDayPanel` |

---

# Part VII — Testing Strategy

## Fixture regression gate

Eleven fixtures in `lib/planMyDay/dailyCompanionCycle/fixtures/simulations.ts`:

Each defines: input context, expected DayMode, CycleState, orientation type, proposal count range, momentum/confidence/permission/reflection behavior, prohibited behaviors.

Run: `npm test -- lib/planMyDay/dailyCompanionCycle/simulationFixtures.test.ts`

## Acceptance criteria (before UI)

- [ ] All simulation fixtures pass orchestrator assertions
- [ ] DayMode resolves correctly per fixture
- [ ] `protected` prevents proposals and interruption
- [ ] Overwhelm keeps orientation short (`orientationOnly`)
- [ ] Creative mode emits `ExplorationBlock`
- [ ] Cooldowns prevent next-day pressure (Day After Launch fixture)
- [ ] No user goals silently changed
- [ ] No proposals materialized without confirmation
- [ ] Reasoning output explainable (prediction IDs + reasons)
- [ ] Companion becomes wiser, not busier (proposal count does not increase run-over-run on same input)

## Stewardship Review (every PR)

**Canonical law:** [Product Constitution — The Stewardship Review](../PRODUCT_CONSTITUTION.md#the-stewardship-review)

- What cognitive load is carried?
- What capability is strengthened?
- Who does this help the user become?
- Does this make today's work easier?
- Does this make tomorrow's person stronger?
- Wiser or busier companion?
- Stronger relationship?
- **Drift Test:** Software or companionship?

---

# Part VIII — Constitutional Guardrails

### Forbidden

- Auto-open or auto-populate plan from CMM
- Done column / permanent graveyard on board
- Productivity scores, streaks, shame metrics
- Generic motivation without evidence
- Reflection UI in Sprint 2
- Judgment patches without bounds
- Goal/commitment modification via learning

### Required

- Consent before materialization
- ≤3 meaningful choices on confirmation surface
- Permission exclusions visible (collapsed by default per R3)
- Provenance on every confirmed `PlanDayItem`
- `writeBrainDumps` / storage verification on persist
- Hyperfocus respects `companionActionBias`

---

# Part IX — Known Risks

| Risk | Mitigation |
|------|------------|
| Overfitting one day | EWMA smoothing; minimum evidence counts |
| Surveillance feeling | Silent reflection; no user dashboards |
| Dependency creep | Track user-initiated ratio; positive signal |
| False encouragement | Evidence refs + cooldowns |
| Post-launch crash day | Day After Launch fixture + celebrationCooldown |
| Stale Adapt My Day | Orient to unknown capacity; no punishment |
| Existing users expect kanban first | Consent path to skip to board |
| Orchestrator complexity | Fixture gate before UI |

---

# Part X — Deferred Future Work

| Item | Sprint |
|------|--------|
| Future Reflection stories ("you've become faster at deciding") | Post-V1 |
| Full Season/Vision orientation UI | Post-V1 |
| Chat-first replanning loop | Post-V1 |
| Pull From Clear My Mind chips in panel | UX punch list |
| Wisdom Intelligence panel integration | Phase 9 cadence |
| Founder dashboard aggregates | Founder Intelligence only |
| Midnight background reflection job | Optional enhancement |
| Screen certification walkthrough | After UI complete |

---

# Appendix — Module layout

```
lib/planMyDay/dailyCompanionCycle/
  types.ts                    # Canonical types (Sprint 2 step 1) ✓
  index.ts
  fixtures/
    types.ts
    simulations.ts            # 11 judgment fixtures ✓
    validateFixture.ts
    index.ts
  simulationFixtures.test.ts  # Fixture gate ✓
  inputs/                     # Step 2
  dayModeResolver.ts          # Step 4
  cycleStateResolver.ts       # Step 5
  momentumSelector.ts         # Step 6
  confidenceSelector.ts       # Step 7
  permissionCurator.ts        # Step 8
  cognitiveAudit.ts           # Step 9
  orchestrator.ts             # Step 3
  reflection/                 # Step 10
  signals/                    # Step 11
```

---

*The Constitution is the foundation. The Daily Companion Cycle is its first living expression. Sprint 2 begins with the orchestrator — not the board.*
