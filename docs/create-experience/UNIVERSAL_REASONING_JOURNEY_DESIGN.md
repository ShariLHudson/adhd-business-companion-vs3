# The Universal Spark Reasoning Journey — Design

**Status:** Proposed — for founder review
**Decision Owner:** Founder
**Foundation:** `CHAT_FIRST_REASONING_EXPERIENCE_RULES.md` (the Twelve Rules)
**Prototype:** `/chat-first-reasoning-preview` — the Create preview is the
working model of the journey this document generalizes.
**Companions:** `CHAT_FIRST_REASONING_EXPERIENCE_ARCHITECTURE.md` ·
`CHAT_FIRST_REASONING_EXPERIENCE_HANDOFF.md` (Create production plan)

---

## The acceptance test (Founder, 2026-08-06)

> A member can say: **"I need to create / build / plan / develop / improve
> something"** — anywhere in Spark. And Spark knows: **"This is work. Let's
> help them think it through."**

Everything below exists to make that sentence true from every doorway.

## 1. The core idea: one journey, many doorways

There is **one reasoning journey** (Rule 2's ten steps), and it is **not a
place**. It travels with the member. Create, Projects, Strategies, Business
Build, Chamber, and Board are rooms the same conversation can move through —
each room lends the journey its expertise and its way of finishing, but none
of them owns a private copy of the thinking process.

This honors the Navigation Golden Rule (the member never needs to know where
a feature lives) and the One Companion principle (one shared brain, never
per-screen engines).

The journey has three shared parts:

### Part A — Work Recognition (the front door, everywhere)

One shared seam — call it `recognizeWork(text, source)` — that every surface
consults. It answers three questions:

1. **Is this work?** The five moves — create, plan, develop, build, improve —
   plus outcome-shaped requests that don't use those verbs ("my onboarding is
   chaos", "I want more clients").
2. **Which move is it?** Create → communication/content that connects ·
   Plan → meaningful experiences · Develop → repeatable systems/processes ·
   Build → ideas into assets/growth · **Improve → make existing work better**
   (the fifth move always starts from something that already exists).
3. **Is there enough clarity to name a Build Journey?** High → acknowledge
   and begin discovery immediately (never re-ask). Not yet → one
   forward-moving question, never "tell me again."

**Not a new engine.** Recognition unifies detectors that already exist —
`detectEstateIntent`, `resolveCreateBeginOutcome`'s artifact resolution,
`understandUniversalRequest`, `isResearchIntent`, the strategy intent gate —
behind one function, scoped by `source` so each caller's existing behavior
changes deliberately, never accidentally (the ADR-013 `sourceExperience`
discipline).

### Part B — The Journey Runtime (the thinking, shared)

Exactly what the preview prototypes, generalized:

| Rule 2 step | Runtime behavior | Exists today |
|---|---|---|
| 1–4 Understand (outcome → why → who → what exists) | One question at a time, each answer acknowledged and written to Working Memory | Preview (authored); production: discoveryRegistry + Phase 2 gate (SOP) |
| 5 Identify missing / decisions | "One thing we haven't settled yet…" — open decisions named, not forced | Preview; `workingMemory.openQuestions`/`decisions` fields exist, unpopulated |
| 6 Suggest options / next steps | One suggestion at the moment it helps (Rule 9) | Partially (nextHelpfulStep) |
| 7 Research loop | Offer → member decides → **how should I use it** → apply → return to exact point (Rules 6–7) | Preview; runtime: `lib/research/` + `researchThis.ts` handoff |
| 8 Create together | **Area-specific finish** — see Part C. Always behind the explicit consent gate (130 / Rule 12) | Create: Current Focus. Others: varies |
| 9 Support implementation | Where it lives, first use, who it reaches | Not built (V2 for all areas) |
| 10 Learn and improve | The Improve move re-enters the journey on existing work | Not built (V2) |

The journey's continuity is **Estate Working Memory** on the work record
itself (Rule 8): goals, decisions, ideas, research, open questions, context,
next helpful step. One record per piece of work, regardless of which rooms
the conversation visited. Returning members get a narrative resume, never a
restart.

### Part C — What "create together" means per area

The journey is identical through step 7. Step 8 is where areas genuinely
differ — and it's the *only* place they differ:

| Area | The finish | Exists today |
|---|---|---|
| **Create** | An artifact, shaped section-by-section in Current Focus | Yes — implementation #1, per the handoff doc |
| **Projects** | A project home with pieces and active work | Yes — Project Homes' own create flow (`create-purpose → create-why → create-pieces → create-home`) **already asks purpose and why**; converge those steps onto the journey's questions instead of keeping a parallel set |
| **Strategies** | A decision + a strategy work item | Yes — Strategy Chamber's `guidedJourney.ts` / `conversationGuidance.ts` / `answerIntake.ts` is a **second, independent reasoning-journey implementation** with its own resume recap; converge, don't keep two |
| **Business Build** | A business asset / growth commitment | **No single area exists** — "Business Build" currently names two unrelated systems (Business Strategy Builder; My Business Estate). Recommendation: do **not** build a third; Business Build journeys are long journeys whose finishes land in existing surfaces. Needs a founder naming decision. |
| **Future areas** | Whatever the area finishes | A journey definition + Knowledge Fingers — content, not engines |

## 2. The four doorways

Ground truth first: today, **only Chat routes through intelligence.** The
dropdown, Chamber, and Boardroom all open via direct `open*Core()` calls with
no recognition step. That is why the acceptance test currently fails
everywhere except (partially) chat.

### Doorway 1 — Chat

- Chat consults `recognizeWork` before coaching/navigation routing. Work →
  the journey begins **in the conversation, without navigating anywhere**
  (Coaching Before Navigation preserved; rooms come later, when the finish
  needs one).
- The existing guards (`shouldEnterUniversalCreation`,
  `resolveImmediateCreateAction`) are re-scoped, not deleted — the
  architecture review §8 risk analysis applies verbatim.
- Chat is also where **Improve** most often enters ("my newsletter isn't
  working") — recognition maps it to existing work via the registry before
  ever offering to create something new.

### Doorway 2 — Chamber of Momentum (continue what's in motion)

- Chamber conversation **already flows through the shared chat thread** —
  a member talking to a Chamber specialist is already in the one
  conversation. So: Chamber members act as **Knowledge Finger voices inside
  an active journey**, not a separate consultation.
- Chamber becomes the natural **resume doorway**: it should read journey
  Working Memory (`resumeWorkSignals` / active work — it reads neither
  today) and greet with momentum: where you were, what you decided, the next
  helpful step. The unrendered `ChamberMomentumCard` / `ChamberMomentumPathArea`
  components already model exactly this shape — revive that design, wired to
  real journey memory, rather than inventing a new surface.

### Doorway 3 — Round Table Boardroom (decisions inside journeys)

- The Board is where a journey goes when **step 5 surfaces a decision too
  heavy for one question** — pricing, positioning, a pivot.
- The plumbing already exists inbound: **Call the Board**
  (`lib/board/callTheBoard.ts`) carries project/strategy/work context into a
  board intake. The design adds the return trip: the Board's recorded
  decision writes back to the journey's `workingMemory.decisions`, and the
  member **returns to the exact point they paused** — the Rule 6 return
  contract, generalized from research to every detour.
- A member who walks into the Boardroom cold saying "I need to build a
  membership program" gets recognition too: the Board can convene *around*
  a new journey, with understanding first (Rule 1 applies in every room).

### Doorway 4 — Dropdown navigation (intentional entry, same journey)

- Selection stays a **direct, predictable open** — no re-routing behind the
  member's back (132: intentional navigation must never surprise).
- What changes is **what each area lands on**: every work area's landing
  surface becomes its variant of the same conversational entrance ("What
  would you like to create, plan, develop, or build?"), not a category grid
  or a form. The dropdown navigates to a *doorway of the journey*; it is
  never a second reasoning path around it.
- The menu itself (`welcomeHomeNavigationStructure.ts`) stays hand-authored
  and calm — the Golden Rule is honored by the rooms, not by making the menu
  intelligent.

## 3. What exists vs. what's missing (evidence-checked 2026-08-06)

**Exists and is reusable:** the preview (journey prototype) · discovery
question data + the SOP Phase 2 gate · Working Memory on
`RuntimeCreationRecord` with durable round-trip · the 130 confirm gate ·
research engine + research→creation handoff · Call the Board inbound
context · Strategy Chamber's guided journey (as the second implementation to
converge) · Projects' purpose/why create steps (as questions to converge) ·
chat's routing stack and guards · Chamber/Board sharing the chat thread.

**Missing:** the shared `recognizeWork` seam · the Improve move · Chamber
reading any work memory · the Board's decision write-back + return trip ·
dropdown landings unified on the conversational entrance · one journey
runtime instead of two (Create + Strategy Chamber) · implementation/improve
steps (9–10) anywhere.

## 4. Build order (each phase independently shippable, no big bang)

1. **Create production reconnection** — already specified in the handoff
   doc. Proves the journey runtime in one area. *(Blocked only on founder
   preview approval.)*
2. **`recognizeWork` seam, chat first** — unify existing detectors behind
   one scoped function; chat consults it; acceptance test passes in chat,
   including the Improve verb mapping to existing work.
3. **Chamber resume doorway** — Chamber reads journey Working Memory;
   revive the momentum-card shape with real data.
4. **Board round trip** — journey decision → Call the Board (existing) →
   decision written back → return to exact point.
5. **Dropdown landing convergence** — each work area's landing becomes its
   conversational entrance (Create's is done in phase 1; Projects next,
   converging its purpose/why steps).
6. **Strategy convergence** — fold Strategy Chamber's guided journey onto
   the shared runtime (hardest; last; its handoff engine becomes journey
   moves).

## 5. Non-goals

- No new reasoning engine, registry, taxonomy, or memory system (pilot
  non-negotiables hold estate-wide).
- No removal of direct navigation; no chat behavior changes except behind
  explicitly scoped recognition.
- No third "Business Build" system before the founder names what Business
  Build is.
- Consent before creation (130) in every room, every doorway, always.

## 6. Acceptance tests

1. **The founder's test, per doorway:** "I need to ___ something" (each of
   the five verbs) typed in chat, in Chamber, in the Boardroom, or after
   arriving anywhere via the dropdown → Spark acknowledges it as work and
   asks the first understanding question. No template, no category, no
   "which tool do you want."
2. "My client onboarding is a mess" (no verb) → recognized as work
   (Develop) → journey begins.
3. "I want to improve my newsletter" → recognized as Improve → Spark finds
   the existing newsletter work and resumes its journey — it does not offer
   to create a second newsletter.
4. A journey pauses for a Board decision → decision recorded → member
   returns to the exact question they left, decision visible in Working
   Memory.
5. A journey started in chat is resumable from Chamber with a narrative
   recap; nothing is re-asked (Rule 5).
6. Every path to a finish still lands on an explicit confirm before any
   Work exists (Rule 12 / 130).
7. Chat regression guard: all existing routing/coaching/discovery tests pass
   unmodified until a phase explicitly and deliberately changes them.

---

## Evidence Matrix

- **Sources Used:** repo exploration 2026-08-06 — chat stack
  (`routeEstateIntelligence.ts`, `estateCoaching.ts`, `discoveryMode.ts`,
  guards), Chamber (`ChamberOfMomentumEntryPanel.tsx`, `lib/chamber/`,
  unrendered momentum components), Boardroom (`BoardroomRoomPanel.tsx`,
  `lib/board/callTheBoard.ts`, `lib/boardroom/`), navigation
  (`EstateRoomExperienceMenu.tsx`, `welcomeHomeNavigationStructure.ts`,
  direct `open*Core` wiring), Projects (`ProjectHomesPrototypePanel.tsx`
  create flow, `listActiveWork.ts`), Strategy Chamber
  (`lib/strategyChamber/guidedJourney.ts`, `executeHandoff.ts`), Business
  Build evidence report (`docs/reviews/projects-business-build-evidence-report.md`).
- **Sources Missing:** live render-path verification of
  `business-estate/redesign/*`; runtime status of the 273/278 context
  prefill families.
- **Confidence:** High on what exists and where the doorways bypass
  intelligence (Observed). Moderate on Business Build (two-system ambiguity
  is documented but its intended meaning is a founder decision).

**Approval Status:** Proposed

```
Decision:   One reasoning journey (Rule 2), one Work Recognition seam, four
            doorways (chat in-conversation; Chamber = resume; Board =
            decisions with write-back; dropdown = intentional entry to the
            same conversational landing). Areas differ only at step 8.
            Convergence over invention: Strategy Chamber and Projects fold
            onto the shared runtime; no third Business Build system.
Reason:     The acceptance test fails today because three of four doorways
            bypass intelligence entirely, and two parallel journey runtimes
            already exist. Recognition + convergence closes both.
Date:       2026-08-06
Approved by:
Supersedes: —
Related systems: see Evidence Matrix
```
