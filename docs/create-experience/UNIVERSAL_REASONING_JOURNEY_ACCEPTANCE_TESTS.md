# Universal Reasoning Journey — Acceptance Tests

**Status:** Acceptance standard — the gate BEFORE any implementation.
Nothing in this document authorizes code; implementation begins only after
the founder approves this standard, and every phase is measured against it.
**Foundation:** `CHAT_FIRST_REASONING_EXPERIENCE_RULES.md` (Twelve Rules)
**Design:** `UNIVERSAL_REASONING_JOURNEY_DESIGN.md`
**Prototype:** `/chat-first-reasoning-preview`

**The core decision (Founder, 2026-08-06):** The member should never need to
understand Spark's internal areas. They say "I want to create / plan /
develop / build / improve…" — Spark recognizes the type of work and guides
them through the appropriate reasoning journey. **The journey is the
experience.** Rooms, tools, and capabilities provide expertise and
completion paths.

**Status legend** (every test is graded against *current* architecture,
evidence-checked 2026-08-06):

- **SATISFIED** — production behavior today, verified in code/tests
- **PROTOTYPE** — demonstrated and test-locked in the preview only
- **PARTIAL** — some production machinery exists; incomplete or wrong scope
- **GAP** — nothing satisfies it today

---

## The Master Test

**AT-0.** A member says *"I need to create / build / plan / develop /
improve something"* — anywhere in Spark — and Spark responds as: *"This is
work. Let's help them think it through."* No template, no category, no
"which tool," no re-asking.
**Status: GAP as a whole.** Only chat routes through any intelligence;
dropdown, Chamber, and Boardroom open via direct calls with no recognition
step. The Improve verb is recognized nowhere. (Per-doorway detail in
Section E.)

---

## A. The Eight Stages

### Stage 1 — Understand

**AT-1.1** "I need a newsletter" → Spark acknowledges in its own words and
asks what the member is trying to make happen — before any type, template,
or output is named.
**PROTOTYPE.** Preview does exactly this (test-locked). Production Create
classifies first (`resolveCreateBeginOutcome`) and understands only after
the Build Type is locked (SOP-only discovery gate inside Current Focus).

**AT-1.2** Every journey asks **why this matters** before creating.
**PROTOTYPE.** All five preview journeys ask a why-question (test-locked).
No production surface asks why, anywhere.

**AT-1.3** A fully-formed request skips ceremony — the understanding
questions its wording already answers are never asked.
**PARTIAL.** Signal-pattern prefill exists in `discoveryMode.ts` (chat) and
in the preview; production Create has no pre-classification understanding to
skip.

### Stage 2 — Clarify

**AT-2.1** Spark learns who this is for and who is involved.
**PARTIAL.** SOP discovery gate asks ownership + audience and writes
`ownershipContext` / `intendedAudience` to Working Memory. Other types: only
if a section happens to ask.

**AT-2.2** Spark learns what success looks like, in the member's words.
**PARTIAL.** `desiredResult` derives from the purpose section
(`workingMemory.ts`); asked conversationally only in the preview.

**AT-2.3** Spark learns which constraints matter (time, energy, budget,
non-negotiables).
**GAP.** No surface asks about constraints.

### Stage 3 — Discover (reuse before reinventing)

**AT-3.1** Spark asks what already exists (notes, drafts, past attempts)
and treats it as material.
**PARTIAL.** SOP gate's starting-point question → `existingAssetsFound`;
preview asks it in every journey. Other production types: no.

**AT-3.2** Spark uses what it already knows — business profile, prior work,
earlier answers — and references it instead of re-collecting it.
**GAP at runtime.** The 273/278 standards family ("never ask the same
question twice", blueprint context prefill) is documented governance;
runtime prefill unverified. `contextAwareSuggestions` uses active work for
suggestions only.

**AT-3.3** "I want to improve my newsletter" → Spark finds the existing
newsletter work and re-enters its journey; it does not offer to create a
second newsletter.
**GAP.** No Improve move exists. Nearest relative: the Anywhere-Origin
continue-vs-new clarify (`resolveGuidedBeginOpen`) for same-type guided
work.

### Stage 4 — Think Together

**AT-4.1** Unsettled decisions are named one at a time, as observations,
never as blockers ("One thing we haven't settled yet…").
**PROTOTYPE.** Preview's open-decision beat (test-locked).
`workingMemory.openQuestions` / `decisions` fields exist in production but
are never populated.

**AT-4.2** When a genuine choice exists, Spark offers at most three calm
options with tradeoffs — and a recommendation when asked.
**PARTIAL.** Implemented for Build-Type choice only (131 `alsoConsidered`).
Not for in-journey decisions.

**AT-4.3** The member feels guided, not processed: every question carries
its why when helpful; no numbered steps, progress percentages, or stage
names are ever shown.
**PARTIAL.** Section `prompt`/`why` authored fields exist (SOP Build Journey
Phase 1); preview enforces a banned-vocabulary test. Production Browse
Categories and the three-button entrance still expose a category picker.

### Stage 5 — Research When Helpful

**AT-5.1** The member can say "Research this" at any point in a journey and
get the consent-first flow — never a mode switch or a navigation away.
**PROTOTYPE** for in-journey; **PARTIAL** in chat, where research intent
routes to the Research Library *destination* (`researchRouting.ts`) —
capability exists, but as a place.

**AT-5.2** Spark proactively offers research when a decision rests on
guesswork ("One thing we might want to look into…").
**GAP.** `capabilityRegistry` models research levels, but nothing offers
research inside a creation journey unprompted.

**AT-5.3** Spark asks **how** the member wants findings used (ideas /
examples / evidence / comparison / recommendations / inspiration /
validation) before gathering.
**PROTOTYPE** (two-choice version, test-locked). No production equivalent.

**AT-5.4** Findings are honest about their mode — interpretation vs. sourced
evidence; a citation never appears without a real retrieval provider.
**SATISFIED.** `lib/research/` two-mode engine with guardrails
(`findingMayShowCitation`; `providerUnavailable` never silently falls back).

**AT-5.5** Research and the decisions it shaped persist in Working Memory
with the work.
**GAP.** Working Memory has no research field; `researchCollection` /
Research Library persistence live separately from work records.

**AT-5.6** After research — used or declined — Spark returns the member to
the exact question or decision they paused on.
**PROTOTYPE** (test-locked). The runtime `researchThis.ts` handoff moves
research *toward* creation but has no return contract.

### Stage 6 — Create the Right Outcome

**AT-6.1** Nothing is ever created without the member's explicit yes — from
any path: typed, chip, catalog, chat handoff, future doorways.
**SATISFIED.** The 130 One Creation Rule: `resolveCreateBeginOutcome` never
returns open; catalog picks confirm; certification tests pin it. Preserve as
a permanent regression test.

**AT-6.2** The outcome type follows understanding, not keywords — "a flyer
for my workshop" is a Flyer, "five-day content plan" never collapses to a
post.
**SATISFIED.** 131 implementation (promotional-intent detection, universal
request understanding, preservation checks) with tests.

**AT-6.3** Each verb reaches a real, verb-appropriate finish (Create →
content; Plan → experience; Develop → system; Build → asset; Improve →
better existing work).
**PARTIAL.** Four guided packages (Event, Marketing, Business Plan, FB
Community) plus authored SOP/Checklist/Document sections are real; ~26
catalog items share one generic content generator; Improve has no finish at
all.

**AT-6.4** The member's own wording remains the identity of the work —
titles never read as template names.
**SATISFIED.** Phase 1A tests + `createTitleFromIntent`.

### Stage 7 — Implement

**AT-7.1** After creation, Spark offers to turn the work into action —
next steps, a project, a plan, calendar-shaped follow-through — as an
offer, never an automatic conversion.
**GAP.** Nearest relatives: Strategy Chamber's `buildProjectHandoff`;
`nextUses.ts`. Nothing journey-integrated.

**AT-7.2** Implementation artifacts stay connected to the same work record
(lineage, no duplicate records).
**GAP.** Intelligence-Ready hooks (`originatedFromId`) exist as types;
nothing writes them from a journey.

### Stage 8 — Learn

**AT-8.1** After real use, Spark can ask what worked, what changed, what
should improve — and capture it with the work.
**GAP.**

**AT-8.2** An Improve journey reads prior learning instead of starting
blind.
**GAP.**

---

## B. Universal Experience Rules

### ADHD Founder Lens (Rule 3)

**AT-B1** One meaningful question at a time, everywhere — never a form, a
field list, or a multi-question message.
**PARTIAL.** Current Focus and the preview honor this; the
ContentGeneratorPanel path and Browse flows predate it.

**AT-B2** Return without reconstruction: resuming any journey gives a
narrative — where you were, what you decided, the next helpful step —
never a bare "Continue."
**SATISFIED (Create).** Phase 1C: `nextHelpfulStep` on the real resume card;
recomputed honestly mid-discovery. Other areas: Strategy Chamber has its own
recap (second runtime); Chamber/Board/Projects read no journey memory.

**AT-B3** Leaving mid-journey is always safe: progress persists (or Spark
says honestly that it can't persist), and nothing shames, counts streaks, or
shows an "incomplete" state.
**SATISFIED (Create)** via durable-save trust gates (P0.5) — including the
honest refusal to fake progress when signed out.

**AT-B4** No solution requires the member to become someone else to use it
— maintenance-light, imperfect-day-tolerant. (Review criterion for every
journey definition; not automatable.)

### Shari Conversation Style (Rule 4)

**AT-B5** Member-facing journey copy never says template, category,
checklist-as-UI, form, survey, stage, or any internal architecture word.
**PROTOTYPE** (banned-vocabulary test). **Production GAP:** the entrance
literally renders "Browse Categories."

**AT-B6** Every meaningful answer is reflected before the next question
arrives — the member sees their words landed.
**PROTOTYPE** for per-answer acknowledgment; **PARTIAL** in production
(Phase 1B acknowledges the original request on the first Focus question;
section answers are not individually reflected).

**AT-B7** Questions carry their why when it helps ("Because the right level
of detail depends on who's holding it").
**PARTIAL.** Authored `why` per section exists (SOP fully authored); most
types lack authored content.

### Never Make the Member Repeat Themselves (Rule 5)

**AT-B8** An answer given at the entrance (or in chat) is never re-asked
after the workspace opens — same fact, same journey, asked once.
**PARTIAL.** SOP discovery answers persist and the gate skips resolved
questions (Phase 2); the entrance→journey handoff that would make this true
end-to-end is designed (handoff doc) but deliberately unbuilt.

**AT-B9** A correction ("actually, make it a checklist") is honored without
the member re-describing anything, and the correction is remembered.
**SATISFIED.** 131 Rule 3 (`switchCreateBeginConfirmType` +
`intentCorrectionHooks`).

---

## C. Entry Point Tests

**AT-E1 — Chat.** *"I need to create a newsletter."* → Spark recognizes
work and enters the reasoning journey **in the conversation** — no
navigation required, understanding before any type confirm.
**PARTIAL.** Chat recognizes create-intents (`resolveImmediateCreateAction`)
but hands straight to the Create surface classification-first; conversation
understanding (discovery mode) covers only 4 topics and is explicitly gated
*away* from create requests (`shouldEnterUniversalCreation` guard).

**AT-E2 — Create dropdown.** Selecting Create opens the same reasoning
journey. No separate form path, no category-first screen.
**GAP.** Today it opens the three-button entrance with Browse Categories.
(Phase 1 of the design's build order; production plan already specified in
the handoff doc.)

**AT-E3 — Chamber.** *"I need help deciding whether to change my offer."*
→ Chamber expertise enters the journey: the specialist's voice joins the
same conversation, the thinking lands in the same Working Memory.
**GAP** for recognition and memory (Chamber reads no work state).
**PARTIAL** infrastructure: Chamber conversation already flows through the
shared chat thread, so no new input surface is needed.

**AT-E4 — Board.** *"I need help deciding whether to hire someone."* → the
Board provides decision support; the recorded decision is written into the
journey's Working Memory; the member returns to the exact point they
paused.
**PARTIAL.** Inbound context passing exists (`callTheBoard.ts` carries
project/strategy/work context; `recordDecision` exists in the Boardroom).
The write-back and the return trip do not exist.

**AT-E5 — Projects.** *"I need to launch this program."* → project planning
uses the same reasoning pattern (outcome → why → who → exists → decisions),
one runtime, then finishes as a project home.
**PARTIAL.** Project Homes' create flow already asks purpose and why — the
right pattern in a **separate** runtime. ADR-013 routes coordinated
requests to Creation Workspace; the mapping between that boundary and the
journey must be explicit before convergence.

---

## D. Guardrails (standing, every phase)

**AT-G1** One journey runtime. The count of parallel reasoning-journey
implementations goes **down** (today: two — Create + Strategy Chamber's
`guidedJourney`), never up.
**AT-G2** Chat regression: all existing routing / coaching / discovery
tests pass unmodified except where a phase changes behavior deliberately
and documents it.
**AT-G3** No new engines, no new Build Types, no room redesigns, and no
replacement of an existing system without a written mapping — consolidation
only.
**AT-G4** The 130 consent gate survives every phase (see AT-6.1).

---

## E. Existing Assets Reviewed (founder's list)

| Asset | What was found (2026-08-06) |
|---|---|
| Spark Experience Library | **Founder clarification (2026-08-06):** `lib/sparkExperiencePatterns/` (twelve interaction patterns + flow stages, per `docs/EXPERIENCE_PATTERNS.md`) is **part of — not equal to — the Spark Experience Library.** The library as a whole (behavior rules, conversation style, journey-facing experience files) is larger and partly still to be authored; no single module implements it today. |
| Knowledge Fingers | Authored as docs (SOP Knowledge Finger spec + framework); runtime expertise is hard-coded per guided package (`lib/universalWorkEngine/packages/**`). No runtime Finger registry. |
| Create reasoning-first preview | `/chat-first-reasoning-preview` — 5 journeys, 19 tests; the prototype this standard generalizes. |
| SOP discovery gate | `lib/currentFocus/sopDiscoveryFocus.ts` + `applyDiscoveryAnswerToRuntimeCreationRecord` — the shipped proof that discovery answers persist and are never re-asked. |
| Working Memory architecture | 12-field `workingMemory` on `RuntimeCreationRecord`, durable round-trip via `workflowSnapshot`; 3 fields auto-populate honestly. |
| Research capability | `lib/research/` (two honest modes) · `researchRouting` (chat) · `researchThis.ts` (research→creation handoff) · Research Library destination. |
| Existing Chamber journey | `lib/estate/chamberProjectEngine.ts` + `ChamberProjectEntryPanel` (outcome + next-action doorway, separate section) · `chamberOfMomentumMemory/Intelligence/Routing` · two unrendered momentum components modeling the resume card. |
| Board context passing | `lib/board/callTheBoard.ts` (work context in) · Boardroom `recordDecision` · Strategy Chamber `buildBoardBriefing`. Inbound only — no write-back. |

---

## F. Gap Register (what stands between today and the standard)

Ranked by how much of the standard each unblocks:

1. **Understanding before classification in production Create** — converts
   AT-1.x, AT-2.x, most of AT-B6/B8 from PROTOTYPE to SATISFIED. Already
   fully specified (`CHAT_FIRST_REASONING_EXPERIENCE_HANDOFF.md`).
2. **The shared Work Recognition seam (five moves incl. Improve)** —
   unblocks AT-0, AT-E1, AT-3.3; nothing else can pass "anywhere in Spark"
   without it.
3. **Research inside the journey** (proactive offer, use-choice, WM
   persistence, exact-point return) — AT-5.2/5.3/5.5/5.6.
4. **Doorway wiring** — Chamber memory + resume (AT-E3, AT-B2 beyond
   Create); Board write-back + return (AT-E4); dropdown landing (AT-E2).
5. **Runtime convergence** — Projects and Strategy Chamber onto one journey
   runtime (AT-E5, AT-G1).
6. **Implement + Learn stages** (AT-7.x, AT-8.x) — greenfield for every
   area; deliberately last, after the journey's front half is real.
7. **Context reuse at runtime** (AT-3.2) — depends on the 273/278 families
   moving from paperwork to verified runtime behavior.

---

**Approval Status:** Proposed — awaiting founder approval of this standard.
**Decision Owner:** Founder.
Nothing below line one of any implementation begins until this document is
approved; each build-order phase then cites the ATs it converts.
