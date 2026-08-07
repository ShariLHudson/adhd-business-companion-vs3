# Work Recognition Acceptance Tests

**Status:** Phase A + Phase B shipped and verified. Newsletter case tracked as an open gap (see below) — not yet fixed.
**As of:** 2026-08-07.
**Founder-specified contract.** These four examples are the acceptance contract for Universal Work Recognition's core distinction: someone who knows what they want to work on and needs forward movement, vs. someone who is genuinely stuck and needs help clarifying. Grading follows the convention established in `UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md`: **SATISFIED** / **PARTIAL** / **GAP**, with file:line evidence for every claim.

Runnable coverage: `lib/estateBrain/workRecognitionFallthrough.test.ts` ("Phase B — create/plan verbs" and "Phase B — preserving the uncertainty/clear-intent distinction" describe blocks) and `lib/conversationStabilization/murkyFallbackGate.test.ts` (Phase A).

---

## 1. "I want to create a workshop."

**Expected:** recognized as work intent; does not ask "what feels murky"; begins the understanding journey.

**Grade: SATISFIED.**

- `detectWorkRecognitionShape("I want to create a workshop.")` returns `{ verb: "create", acknowledgment: "I'd love to help you create that." }` — `lib/estateBrain/workRecognitionFallthrough.ts` (`EXPLICIT_VERB_RE`, Phase B).
- `resolveWorkRecognitionNewRecognition(...)` returns `{ kind: "question", ... }` — the first `entranceUnderstanding.ts` question, with a saved session (`result.session.topic` is truthy) — this **is** "begins the understanding journey."
- Confirmed via direct pipeline trace (Explore agent, 2026-08-07) that nothing earlier in `lib/frictionlessActionLayer.ts`'s `resolveFrictionlessActionImpl` claims this phrasing today — `shouldEnterUniversalCreation` returns `false` (`orchestrator.ts:194`, exploratory-framing veto), `isSimpleCreateRequest` returns `false` (`createFastPath.ts:109`, no artifact type inferred for "workshop"), and event-domain requests are explicitly excluded from document-type classification (`orchestrator.ts:145-151`). So Work Recognition's late fallthrough (`frictionlessActionLayer.ts:4478`) is the first and only claimant — safe by construction (see that file's own header comment).
- "Does not ask 'what feels murky'" — verified two ways: (1) the message returned by `resolveWorkRecognitionNewRecognition` is an `entranceUnderstanding.ts` question, never `activeTopicGate.ts`'s `SPECIALTY_CLARIFY` text; (2) Phase A's independent fix (`lib/conversationStabilization/activeTopicGate.ts`) means even if this phrase reached the murky-fallback path via some other surface, `expressesClearWorkIntent` would block the uncertainty question there too — belt and suspenders, not a single point of failure.

Tests: `lib/estateBrain/workRecognitionFallthrough.test.ts` → "Phase B — create/plan verbs" (2 tests).

---

## 2. "I want to create a newsletter."

**Expected:** recognized as work intent; asks purpose/audience questions before workspace.

**Grade: GAP.** Not fixed in Phase A or B — flagged, not silently skipped.

- `detectWorkRecognitionShape("I want to create a newsletter.")` **does** return `{ verb: "create", ... }` — the shape detector itself is correct and ready.
- But the live chat pipeline never gives it the chance. `isSimpleCreateRequest("I want to create a newsletter.")` returns `true` (`createFastPath.ts:138` — "newsletter" resolves via `ARTIFACT_INFERENCE`), so the CREATE FAST PATH block claims the turn at `lib/frictionlessActionLayer.ts:4269`, several steps before Work Recognition's fallthrough at line 4478 ever runs. Inside that block, `resolveCreateFoundationClassification("...newsletter...").routeDirectlyToCreateFoundation` is `true` (`lib/creationIdentity/createFoundationRouting.ts:110` — newsletter is one of the Create-Foundation-direct types, alongside SOP and proposal), so `resolveFrictionlessActionImpl` deliberately steps aside with an empty `"none"` decision (`frictionlessActionLayer.ts:4281`) — intending a hand-off to "Create Foundation."
- **No UI code completes that hand-off for a bare chat message.** Grepping every `.tsx` file in the repo for `resolveCreateFoundationClassification` / `routeDirectlyToCreateFoundation` / "Create Foundation" returns zero matches — the deterministic layer steps aside, but nothing opens the Create entrance in response. The practical effect today: a bare "I want to create a newsletter." in chat likely falls through to a generic LLM completion rather than any structured journey — which is exactly the "Chat still behaves like a traditional AI assistant" symptom `CHAT_REASONING_JOURNEY_GAP_REVIEW.md` named.
- **Why this wasn't folded into Phase B:** the gate that intercepts it (`shouldRouteDirectlyToCreateFoundation` / `resolveCreateFoundationClassification`) is, by its own header comment, the "sole authority gate used by continuity, CREATE_FAST_PATH, and frictionless" — at least 3 other call sites (`frictionlessActionLayer.ts:1517-1521`, `:1959-1962`, `:4279-4283`, `:4505-4508`, `:4521-4524`) depend on its exact current behavior, including active-Create-session continuity. Changing it safely requires mapping all of those consumers first — real risk of regressing working Create flows, not something to do inside "broader Work Recognition for workshop/event/build/develop/improve," which the founder scoped as the safe, additive fallthrough-only work. This is closer to the previously-identified "Phase C: converge chat's create goal onto the shared journey" — deliberately deferred as higher-risk in `UNIVERSAL_DOORWAY_CONVERGENCE_MAP.md`.
- **Recommendation:** treat as its own reviewed slice (call it Phase B-2 or fold into Phase C) — map every `resolveCreateFoundationClassification` consumer, decide whether Create-Foundation-direct types should open `entranceUnderstanding.ts`'s journey directly from chat (reusing the same production Create entrance flow, not a new engine) instead of silently returning "none," and verify against the existing Create continuity test suite before landing.

Test: `lib/estateBrain/workRecognitionFallthrough.test.ts` → "known gap (not fixed by this seam)" — proves the module itself is correct in isolation and documents exactly where and why the live pipeline never reaches it.

---

## 3. "I need to plan a two-day ADHD business retreat."

**Expected:** recognized as planning work; can activate Events intelligence later.

**Grade: SATISFIED** (recognition) **+ architecturally ready** (Events intelligence hook — nothing new built, nothing needed to be).

- `detectWorkRecognitionShape(...)` returns `{ verb: "plan", acknowledgment: "Let's think this through together before diving in." }` — `EXPLICIT_VERB_RE` now includes `plan` (Phase B).
- `resolveWorkRecognitionNewRecognition(...)` returns `{ kind: "question", ... }` with a saved session — begins the journey, same as the workshop case. Confirmed unclaimed by anything earlier in the pipeline for the same reasons as case 1 (`shouldEnterUniversalCreation` false at `orchestrator.ts:201`; event-domain exclusion at `orchestrator.ts:145-151`; `PLAN_STRATEGY_RE`/`isMomentumForwardIntent` require the literal phrase "business plan," not "business retreat," so they don't intercept it either).
- "Can activate Events intelligence later" — per the **Intelligence-Ready Architecture** global rule (hooks today, engines tomorrow), this does not require building Events intelligence now. The session this recognizes is a plain `entranceUnderstanding.ts` `EntranceUnderstandingSession`; when Step 2 (opening a workspace from the journey) eventually lands, an event-shaped topic already flows through the same `bindEventRecord`/`eventRecordId` machinery Create's own entrance already uses for guided/event domains (`app/companion/CompanionPageClient.tsx`'s `startFreshCreateFromEstate`, this session's earlier Working-Memory bug fix). No new field, hook, or engine was needed to keep that door open — confirmed, not assumed, by reading `entranceUnderstanding.ts`'s session type (topic/answers only, no workspace-type lock-in).

Tests: `lib/estateBrain/workRecognitionFallthrough.test.ts` → "Phase B — create/plan verbs" (retreat case, 1 test) + verb-confinement guard (1 test, shared with case 1).

---

## 4. "I'm stuck trying to figure out my workshop."

**Expected:** remains support/clarification mode.

**Grade: SATISFIED** — via a different, correctly-scoped mechanism than initially assumed. Documented precisely so the distinction stays intentional, not accidental.

- `detectWorkRecognitionShape("I'm stuck trying to figure out my workshop.")` returns `null` — no verb-lead-in phrase matches ("I'm stuck" isn't `i need to` / `i want to` / `help me` / `i'd like to`), so Work Recognition never claims this turn as new work. This is the "preserve the distinction" requirement holding at the source.
- Direct pipeline trace (2026-08-07) shows the actual claimant today is **Friction First** (`tryFrictionFirstFlow`, `lib/frictionlessActionLayer.ts:4326-4327`), via `GENERAL_STUCK_RE`'s literal "i'm stuck" match (`lib/sparkCompanion/frictionFirst/struggleSignals.ts:30-31`) — not the Phase A murky-fallback fix in `activeTopicGate.ts`, and well before Work Recognition's own late fallthrough (line 4478) is ever reached. Friction First's reply is an ADHD-friction acknowledgment plus one clarifying question — a genuine support/clarification response, matching the acceptance test's intent even though it arrives via a different, pre-existing mechanism.
- The Phase A fix (`expressesGenuineUncertainty`/`expressesClearWorkIntent` in `activeTopicGate.ts`) still matters as a second line of defense for the narrower "murky" SPECIALTY_CLARIFY path specifically — verified directly in `murkyFallbackGate.test.ts`, including this exact phrase. Belt and suspenders: two independent mechanisms (Friction First's own stuck-detection, and Work Recognition's shape detector correctly returning null) both keep this turn out of "new work" recognition.

Test: `lib/estateBrain/workRecognitionFallthrough.test.ts` → "Phase B — preserving the uncertainty/clear-intent distinction" (1 test, at the `detectWorkRecognitionShape`/`resolveWorkRecognitionNewRecognition` level — Friction First's own ownership of this phrase is out of this module's scope to test, and already covered by `lib/adhdEmotionalFrictionIntelligence.test.ts`/Friction First's own suite).

---

## Summary table

| # | Input | Expected | Grade |
|---|---|---|---|
| 1 | "I want to create a workshop." | recognized, no murky question, begins journey | **SATISFIED** |
| 2 | "I want to create a newsletter." | recognized, asks purpose/audience before workspace | **GAP** — Create-Foundation-direct routing intercepts earlier; tracked, not fixed |
| 3 | "I need to plan a two-day ADHD business retreat." | recognized as planning, Events-intelligence-ready | **SATISFIED** |
| 4 | "I'm stuck trying to figure out my workshop." | stays support/clarification | **SATISFIED** (via Friction First, not Work Recognition — confirmed intentional) |

---

## Evidence Matrix

- **Sources used:** direct pipeline trace (Explore agent, read-only, 2026-08-07, obeying the Subagent Safety Rule) against the current `feat/create-chat-first-reasoning` worktree; `lib/estateBrain/workRecognitionFallthrough.ts` and its test suite (29 tests, all passing); `lib/conversationStabilization/activeTopicGate.ts` and `murkyFallbackGate.test.ts` (Phase A, 8 tests); `lib/creationIdentity/createFoundationRouting.ts`; `docs/create-experience/CHAT_REASONING_JOURNEY_GAP_REVIEW.md`; `docs/create-experience/UNIVERSAL_DOORWAY_CONVERGENCE_MAP.md`.
- **Confidence:** High for cases 1, 3, 4 — directly traced and test-verified. High for case 2's diagnosis (root cause precisely located, multiple call sites cited) though the fix itself is intentionally not attempted here.
- **Regression sweep (Phase B):** `lib/frictionlessActionLayer.test.ts`, `lib/companionFrictionlessAcceptanceGate.test.ts`, `lib/frictionlessCreateBoundary.s4.test.ts`, `lib/universalCreation/*`, `lib/estateBrain/*`, `lib/sparkCompanion/frictionFirst/*`, `lib/adhdEmotionalFrictionIntelligence.test.ts` — 260 passing, 12 failing, confirmed pre-existing via direct A/B comparison (file backup/restore, not git stash; identical 12 failures with the Phase B change fully absent). Typecheck clean on the touched file.

**Decision Owner:** Founder. Case 2's recommended follow-up (Phase B-2 / fold into Phase C) is proposed, not started.
