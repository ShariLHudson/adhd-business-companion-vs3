# Create Reasoning-First Migration — Implementation Plan

**Version:** 1.0
**Status:** Planning artifact. No code changes. Stop condition: review only — implementation begins after approval.
**Governing review:** [`CREATE_REASONING_FIRST_MIGRATION_ARCHITECTURE_REVIEW.md`](./CREATE_REASONING_FIRST_MIGRATION_ARCHITECTURE_REVIEW.md)
**Purpose:** Convert Create from artifact-first to reasoning-first by reconnecting existing Spark reasoning capability — not by building new architecture.

**The pattern to protect, stated once so every phase below can be checked against it:** the three SOP discovery questions found in `discoveryRegistry.ts` — *for whom, from what starting point, for how many people* — are not SOP questions. They are shape: **purpose, audience, starting point, complexity, ownership.** Nothing in this plan should be authored as if it only serves SOP. Every file touched should read as obviously reusable by Proposal, Workshop, Client Onboarding, Inventory, or Financial Planning the day those Build Types get discovery questions of their own.

---

## Non-negotiables (repeated because they bind every phase)

- Do not create SOP-specific intelligence.
- Do not create a new reasoning engine.
- Do not replace the registry.
- Do not replace the Build Type system.
- Do not create a new memory system.
- Same Build Type. Same knowledge. Better Spark experience.

---

## What the architecture review changed about this plan's shape

Two findings from the review narrow Phase 1 to something smaller and more honest than "fix entry-path consistency" sounds like on its own. Recording them here so the phase below isn't read as doing less than was asked — it's doing what was actually found, not what was assumed before looking.

1. **Text preservation across entry paths already works.** Traced `resolveCatalogCreateConfirm` → `confirmCreateBeginToOpen`: typed text (`requestText`) already flows through to `text`/title on every path, including category clicks. This was not a live defect. It gets a regression test (§Phase 1A) so it can't silently regress, not a behavior change.
2. **Direct category clicks correctly skip ambiguity-matching.** A member who clicks "SOP" from a category grid has already disambiguated by clicking — there is nothing for `resolveCatalogCreateConfirm` to reason about, and hardcoding `confidence: "high"` there is correct, not a bug. The review's framing of this as an inconsistency to *fix* was slightly overstated; it is an intentional, appropriate asymmetry that should be documented so nobody "fixes" it into forced reasoning over an unambiguous click later.

What *is* a real, concrete, previously-unnoticed gap, found while re-checking this: **the member's own opening words are captured (`originalRequest`) but never acknowledged.** Whatever a member types — "I need an SOP for onboarding clients" — the first Focus question is always the same cold, generic authored prompt ("What should someone be able to accomplish after following this SOP?"), as if nothing had been said yet. This is the actual, fixable "preserve original intent" gap, and it is the one that most directly serves the acceptance test — *"I am thinking with Shari," not "I am filling out a template."*

---

## Phase 1 — Entry-path consistency, intent preservation, resume narrative

No touch to `resolveCreateBeginOutcome`, `openDecision.ts`, `discoveryMode.ts`, or any chat-shared routing. Everything here is presentation-and-plumbing work on data that already exists.

### 1A — Lock in entry-path text preservation with a regression test

**Files involved:** `lib/createEstate/resolveCreateBeginOutcome.test.ts` (or a new focused test file)

**Reuse points:** `resolveCatalogCreateConfirm`, `confirmCreateBeginToOpen` — unchanged, already correct.

**Behavior:** no behavior change. A new test asserts: typed text entering via `requestCatalogConfirm`'s `requestText` param survives into the `open` outcome's `text` field identically to how free-text Start Freely would carry it. This closes the review's §3 finding by proving it's true today and keeping it true.

**Risk:** none — test-only.

**Acceptance criteria:** test passes now, and would fail if a future change silently dropped `requestText` on the catalog path.

### 1B — Acknowledge the member's original request in the first question

**Files involved:**
- `lib/currentFocus/resolveCanonicalFocus.ts` — `focusFromRuntimeRecord`, the "no next section answered yet" branch
- `lib/currentFocus/creationRecord.ts` — `RuntimeCreationRecord.originalRequest` (already exists, already populated — read-only here)

**Reuse points:** `originalRequest` is already captured and stored on every creation record via `deriveCreationIdentity`/`resolveHumanReadableTitle` — this phase only reads it where it currently goes unread.

**Behavior:** when the *first* Focus of a fresh creation is presented (no sections answered yet) and `originalRequest` holds real content beyond a bare type label (e.g., not just "Create SOP"), prefix or fold it into the opening line — not by rewriting the authored question, but by acknowledging what was already said before asking it. Example shape: *"For onboarding clients — what should someone be able to accomplish after following this SOP?"* rather than the question alone. Build-Type-agnostic: reads whatever `originalRequest` holds for any Build Type with an authored first prompt, not SOP-specific.

**Risk:**
- `originalRequest` can be noisy or already fully generic (e.g., member clicked a category with no typed text) — must degrade gracefully to today's plain question, not force an awkward acknowledgment out of nothing.
- Must not repeat this acknowledgment on every subsequent section — only the opening one, or it becomes noise instead of the intended effect.
- This is a copy/behavior change to a widely-used shared function (`resolveCanonicalFocus.ts`) — every Build Type's first question is affected. Needs the same discipline as SOP Phase 1's additive `prompt`/`why` change: prove other Build Types' first questions are unchanged when `originalRequest` is generic or absent.

**Tests:** first-question text includes an acknowledgment when `originalRequest` has real content; unchanged (today's plain question) when it doesn't; acknowledgment appears once, not on later sections; existing Build Types' first-question tests still pass unmodified.

**Acceptance criteria:** typing "I need an SOP for onboarding clients" and confirming produces a first question that references "onboarding clients," not a cold generic opener. A category click with no typed text produces today's unchanged question.

### 1C — Resume narrative reads Working Memory instead of a hardcoded string

**Files involved:**
- `components/companion/CreateEstateEntrancePanel.tsx` — `resumeWorkId()`'s hardcoded `nextAction: "Continue"` / `phaseLabel: "In progress"`
- `lib/activeWorkspaceRegistry/registry.ts:222` — `currentFocusTitle: focus.title` (currently the raw section label, e.g. "Purpose")
- `lib/currentFocus/creationRecord.ts` — `RuntimeCreationRecord.workingMemory.nextHelpfulStep` (already exists, SOP Phase 2)
- `components/companion/CreateWorkspaceResumeList.tsx` — the display line reading `ws.statusLabel || ws.phaseLabel`

**Reuse points:** this is the clearest possible case of "use what's already built." `currentFocusTitle` is an existing, already-wired field consumed by `continueCardProjection.ts`, `humanReadableIdentity.ts`, and `matchResumeIntent.ts` — nothing new needs to be plumbed, only what feeds it needs to improve. `workingMemory.nextHelpfulStep` already produces exactly the right shape of string ("Continue with Intended User").

**Behavior:** wherever a continuation card's next-step text is set, prefer `workingMemory.nextHelpfulStep` when present, falling back to today's section-label or hardcoded "Continue" when absent (old records, or a Build Type with no Working Memory yet — this is why the D5 gate's hydrate-safety work matters here, not just for SOP). No new field, no new store — an existing field's source data improves.

**Risk:**
- `registerCreationDestinationWorkspace`/`registry.ts` is shared across every Build Type and several call sites (event records, non-event runtime records) — verify the fallback chain doesn't regress any of them.
- Does not by itself deliver the architecture review's full resume example (*"we identified the goal was... we still needed to document the approval process"*) — that needs `openQuestions`/`decisions`, which exist in the approved 10-field schema but aren't populated yet (SOP Phase 2's own honest limitation). This phase closes the "next step" half of resume narrative, not the "recap of decisions" half. Naming that explicitly so it isn't mistaken for full coverage.

**Tests:** a resumed SOP with `workingMemory.nextHelpfulStep` set shows that text on the continuation card; a resumed creation without Working Memory (pre-existing record, or non-SOP Build Type) shows today's fallback unchanged; non-regression across the other three UWE-backed Build Types (event_plan, marketing_plan, business_plan, facebook_community).

**Acceptance criteria:** leaving an SOP mid-conversation and returning shows a specific next step ("Continue with Intended User"), not a bare "Continue." Every other Build Type's resume behavior is unchanged.

### Phase 1 commit boundary

Two commits: (a) 1A + 1B together — both are "read `originalRequest`/preserve intent" work touching the same reasoning-entry surface; (b) 1C alone — touches a different, resume-specific surface and has its own, separable risk (registry fallback chain across Build Types).

### Phase 1 browser journey

Type "I need an SOP for onboarding clients" → confirm → first question acknowledges "onboarding clients" → answer one section → leave → return via Continue Working → continuation card shows the real next step, not "Continue."

---

## Phase 2 — Design only: a safe Create/discoveryMode integration point

**This phase produces a design, not code.** Per the review's §8, the risk here is real: `shouldEnterUniversalCreation` and `resolveImmediateCreateAction` are shared with chat routing (`routeEstateIntelligence.ts`, `estateCoaching.ts`), not Create-only. The goal of this phase is to answer, on paper, exactly how Create gains discovery-mode reasoning without chat's existing behavior changing at all — before a single line of shared code moves.

### What needs deciding, precisely

1. **The scoping mechanism.** ADR-013's `sourceExperience` parameter is the precedent: `openDecision.ts` gates its narrowed behavior on `isCreateBeginBoundary = input.sourceExperience === "create"`, leaving every other caller's behavior untouched, proven by `exploratoryCreateRouting.test.ts` staying green. The equivalent question here: can `shouldEnterDiscoveryMode`/`shouldEnterUniversalCreation` accept (or be wrapped with) a similar caller-identity signal so Create can *opt into* discovery mode without chat's existing gate behavior changing for chat callers?
2. **Where the Create-side call site would live.** Candidates: inside `resolveCreateBeginOutcome` itself (before classification, ask discovery questions first when the topic is covered and the request is ambiguous enough to benefit) — or as a distinct pre-step in `CreateEstateEntrancePanel.tsx` before `resolveCreateBeginOutcome` is ever called. The first keeps one function as the single reasoning entry point (matches "one reasoning path"); the second is more isolated but risks becoming a second gate for the same decision the review's §3 already flagged as duplicative. **Recommendation to validate in this phase: extend inside `resolveCreateBeginOutcome`, not beside it** — for the same reason SOP Phase 1's `prompt`/`why` fields were made optional additions to an existing type rather than a parallel structure: one path, additively extended, not two paths kept in sync by hand.
3. **Session-state sharing.** `discoveryMode`'s session (`estate-discovery-session-v1`, `startDiscoveryTurn`) is chat-turn-shaped. Determine whether Create can drive the same session mechanism turn-by-turn (preferred — this is the literal "shared Spark reasoning behavior" instruction) or whether Create's already-existing Focus/section turn-taking (`resolveCanonicalCurrentFocus`, `submitCurrentFocusResponse`) should be the turn driver instead, with `discoveryMode` supplying only the question content (`DISCOVERY_QUESTIONS`, `DISCOVERY_INTROS`) and confidence signals (`signalPatterns`). **The latter reuses more of what Create Phase 1/2 already proved works** (durable save, resume, non-linear answering) and avoids running two independent turn-taking systems in the same room. This is the shape to validate first.
4. **The confirm gate must survive unchanged.** Whatever the mechanism, it must still terminate in a `confirm` outcome — discovery questions inform which Build Type gets classified, they never bypass the "never silently create" gate.
5. **Coverage decision.** `DISCOVERY_QUESTIONS` covers one Create topic (`create_sop`) today. Decide whether Phase 2's design should assume immediate authoring of question sets for the other 7 V1 Build Types (real content work, one Knowledge-Finger-style pass per type) or an explicit, honest fallback: Build Types without authored discovery questions keep today's direct classification, unchanged, until their questions are authored. **Recommend the fallback** — matches "do not build more Build Types" and keeps this phase's blast radius to design plus SOP's already-authored three questions.

### Deliverable of Phase 2 (when it runs)

A follow-up document — `CREATE_REASONING_FIRST_MIGRATION_PHASE2_INTEGRATION_DESIGN.md` — answering the five points above concretely, plus the same architectural-safety-check discipline used before every implementation this session: cross-system effects, dependencies, routing implications, ownership conflicts. **No code in Phase 2 either**, until that design is reviewed and approved on its own, separately from this plan.

---

## Acceptance test, restated

A founder should feel: *"I am thinking with Shari."* Not: *"I am filling out an SOP template."*

Phase 1 alone does not fully deliver that feeling — it removes a cold open and a dead-end resume, which are real, felt improvements, but the actual *thinking together* experience is Phase 2's discovery-question reconnection. Naming this honestly: Phase 1 is preparation and quick, safe wins; Phase 2 is where the acceptance test starts to be met.

---

## Stop condition

This is a plan. No code has been written or committed beyond this document. Awaiting review before Phase 1 implementation begins.
