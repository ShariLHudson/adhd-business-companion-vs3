# MA-01 + MA-04 — Conversation Ownership Gate: Design Note

**Date:** 2026-07-28 · **Type:** design-only (no code changed) · Companion to
[MASTER_AUDIT_SYNTHESIS.md](MASTER_AUDIT_SYNTHESIS.md) and
[ARCHITECTURE_STABILIZATION_ROADMAP.md](ARCHITECTURE_STABILIZATION_ROADMAP.md).

Scope: pressure-test the proposed first implementation slice — general conversation ownership for
"assistant asks/offers → user gives a short acceptance." **No code is proposed for landing here;**
this is the audit + contract that must precede any code. All line numbers are current-branch as
mapped 2026-07-28 and may drift; treat symbols as authoritative, lines as hints.

---

## 0. Phase 0 — MA-34 (login lockout) result

**Status: RESOLVED / deployed / not reproducible in the normal path. No action required.**

- The VIS audit (`002_…`) baseline `17c6e8a` (2026-07-11 **11:05**) reported the auth-token
  persistence fix as *local, uncommitted, not deployed*.
- Commit `8a1ab00a "fix: stabilize authenticated session persistence"` landed **11:39** the same day
  (34 min later), is an **ancestor of the deployed tip `aaa40220`**, and its files
  (`lib/companionStorageRecovery.ts` + `waitForCompanionAuthStorage`/`retryPersistInMemorySession`
  in `lib/companionLoginTransition.ts` + a test) are committed and clean.
- The quota-exceeded edge now has a tested recovery path (retry → `reclaimAggressiveCompanionStorage`
  → `safeLocalStorageSet`) and a graceful `COMPANION_AUTH_SESSION_PERSISTENCE_ERROR` message.
- Firsthand: login on `aaa40220` succeeded 2026-07-27, token persisted.

No unrelated auth behavior was inspected or changed. **Recommended action:** mark matrix row MA-34
`RESOLVED (8a1ab00a, deployed)`; do not implement anything. (Matrix edit deferred — outside this
note's one-file scope.)

---

## 1. What the code audit changed (read this first)

The MA-01/MA-04 findings were written against P3's baseline `2144d535`. On the **current** deploy
branch, two of the three assumptions are already satisfied:

| Assumption (from P3/roadmap) | Current-branch reality |
|---|---|
| MA-01: "a free-form assistant offer arms **no** owner" | **Already armed.** `CompanionPageClient.tsx:21355` → `shouldArmPendingQuestion` (`conversationConfirmationGate.ts:83`) → `beginSpineOwnership({owner:"confirmation", reason:"free_form_assistant_offer", status:"awaiting_user", expectedReply:{kind:"confirmation"}})`. |
| Option 1 / MA-17: clarification kills the pending offer | **Already guarded.** `pendingAcceptanceAuthority.ts:384`: `if (isClarificationRequest(t)) return false;` inside `topicChangeInvalidatesOffer`. |
| MA-04: the armed owner is consulted **before** the fast-path handlers | **Still true — this is the real gap.** |

**Consequence:** the first slice is **not** "build an ownership system." Arming exists; the Boundary
(S4) is already a general per-turn authority. The remaining defect is **ordering + fragmentation**:
the armed owner is resolved too late, and "short acceptance" is classified by 8 competing regexes.
The design goal is therefore to **consult existing authorities earlier — not to add a new one.**

---

## 2. Current conversation flow (as mapped)

### 2.1 Two ownership authorities already exist (plus ad-hoc locks)

1. **Conversation Boundary (S4)** — `lib/conversationBoundary.ts` `resolveConversationBoundary` (399).
   Computed **once, pre-turn** at `CompanionPageClient.tsx:14404` from a pre-message snapshot
   (`conversationBoundaryInputs.ts:149`), returns a transition decision
   (`answer_pending_question | interrupt_and_suspend | switch_topic | cancel_current_workflow | …`),
   and is **threaded to Create/D3 as a client** (`createTurnRelationship.ts:275` `boundaryGrantsCreateAnswer`).
   Self-contract (`conversationBoundary.ts:8-27`): *"Boundary owns the transition type; each machine
   is a client."* Its inputs already include `pendingQuestion` and `pendingOffer`.
2. **Spine ownership resolver** — `lib/conversationSession/ownership/resolveOwnership.ts:90`
   `resolveConversationOwnership` opens the turn-gate (`beginOwnershipTurnGate`,
   `claimTurnOwnership.ts:64`), collects claims via a priority ladder
   (`adaptLegacyOwnership.ts:31` — create 90, collection_offer 80, confirmation 70, chamber 68,
   board 66, …), and selects one. It carries the armed-owner record
   `ConversationOwnership{status:"awaiting_user", expectedReply}` (`ownership/types.ts:76`).
   **It runs at `CompanionPageClient.tsx:16826` — ~2,400 lines into `handleSend`.**
3. **Ad-hoc specialist locks** — chamber (`chamber/chamberConversationLock.ts:26`
   `buildChamberSpecialistPrimaryTurn`, `owner:"chamber:<id>"`), board/boardroom entry state, research
   via arbitration goal. These assert ownership through `PrimaryTurnDecision`/section locks, **outside**
   both authorities above.
4. **Legacy projection** — `awaitingUserConfirmationRef` (`conversationConfirmationGate.ts:55`) is the
   pre-spine armed-owner mirror the fast-path handlers actually read.

### 2.2 `handleSend` ordering (the MA-04 gap)

`handleSend` starts `CompanionPageClient.tsx:14382`. Boundary decision at 14404. Spine ownership
resolution at **16826**. **Between them, ~13 fast-path handlers can `return` first**, each reading
only the **legacy** `awaitingUserConfirmationRef`, never the spine `awaiting_user`/`expectedReply`:

client-avatar accept (14639) · hard Create exit (14679) · strategy action (14808) · business-estate
nav (14877) · navigate effect (14924) · continuity `clear_owner_continue` (14967) / `destination`
(15001) / `route_to_owner` (15043) · my-day opener (15146) · universal-capability (15183) ·
client-avatar exploration offer (15232) · clear-my-mind lock (15261/15284/15308) · stop-ambience (~15329).

So an offer armed on turn N (spine `awaiting_user`) is not guaranteed to be honored on turn N+1: a
pre-gate handler can steal or clear the turn before `resolveConversationOwnership` sees it.

### 2.3 Short-acceptance classification is fragmented (8+ regexes)

`isBareGenericAcceptance` (`pendingAcceptanceAuthority.ts:81`) is the nominal authority but is one of
**≥8** acceptance regexes (P3 F7 confirmed and understated):

`GENERIC_ACCEPTANCE_RE` (pendingAcceptanceAuthority:26) · `ACTION_ACCEPTANCE_RE` (assistedActionBridge:27)
· `AFFIRMATION_RE` (frictionlessActionLayer:555) · `AFFIRMATION_RE` (companionAutoLaunch:17) · `ACCEPT_RE`
(conversationConfirmationGate:113) · `ACTIVE_QUESTION_BINDING_RE` (conversationConfirmationGate:129,
the only one covering "continue/next/that one/option two") · `SHORT_ACCEPT_RE` (pendingAction:155) ·
`SAVE_READY_RE` (pendingAction:158).

Coverage gaps that matter: bare **"do it"** is missed by the two "authority" regexes; **"continue"/"next"**
are covered *only* by `ACTIVE_QUESTION_BINDING_RE`, which is deliberately isolated from the shared
predicate. A gate that keys on "short acceptance" must standardize on one predicate or it will accept
inconsistently by path.

---

## 3. Proposed contract (precise)

The seven required properties, mapped to **existing** mechanisms (nothing new invented):

1. **Assistant question/offer arms an owner for the next turn.** → *Exists.* Keep
   `shouldArmPendingQuestion` → `beginSpineOwnership(status:"awaiting_user", expectedReply)`
   (CPC:21355). Widen arming coverage only if §7's audit shows offer types that don't arm.
2. **The ownership gate is consulted before unrelated fast-path handlers.** → *New ordering.* Consult
   the **already-armed** owner (spine `getSpineOwnership().status==="awaiting_user"` + the
   already-computed Boundary decision) at the **top** of `handleSend`, right after 14412 — before the
   ~13 pre-gate handlers.
3. **A short acceptance is interpreted in the armed owner's context, not as free-floating.** → Reuse
   `resolveConversationOwnership`'s `isActiveQuestionAcceptance` + `AWAITING_REPLY_OWNERS`
   (resolveOwnership:267) via **one** acceptance predicate.
4. **The owner receives the turn before other systems classify/route/reflect/suggest.** → The early
   consult routes an owned+accepted turn through the existing owner-continue path and sets a
   `turnClaimedByOwner` flag the pre-gate handlers check.
5. **Supplementation may not steal or reroute the owned answer.** → This is the D3 contract, one layer
   up: the owner writes first; other extractors supplement only. For Create the D3 slot-binding
   (`advanceUniversalCreation`, orchestrator:732) already enforces it.
6. **Clarifications, explicit topic changes, emotional/safety needs, cancellations still behave.** →
   Reuse Boundary precedence: emotional urgency = rule #1 `interrupt_and_suspend`
   (conversationBoundary:411); cancel (417); clarification-exempt already at
   pendingAcceptanceAuthority:384. The early consult must **defer to Boundary** for these, never override.
7. **Ownership expires/clears so stale offers don't resume.** → Reuse existing expiry (below §8); add none.

---

## 4. Files / functions likely to change

| File | Function(s) | Change (design intent) |
|---|---|---|
| `app/companion/CompanionPageClient.tsx` | `handleSend` (14382) | Add ONE early "armed-owner consult" just after the Boundary decision (≈14412); add a `turnClaimedByOwner` guard to the ~13 pre-gate handlers so they defer. **Hot path — the whole risk lives here.** |
| `lib/conversationConfirmationGate.ts` | new/rationalized predicate | A single `isShortAcceptanceOfArmedOwner(text, expectedReply)` that composes `ACCEPT_RE` + `ACTIVE_QUESTION_BINDING_RE` so "yes/ok/sure/do it/let's go/continue/next/that one" are covered once. |
| `lib/conversationSession/ownership/resolveOwnership.ts` | `resolveConversationOwnership` | Possibly expose a cheap `peekArmedOwner()` so the early consult doesn't open the full turn-gate twice. |
| `lib/pendingAcceptanceAuthority.ts` | `isBareGenericAcceptance` | Re-point the shared predicate at the unified one (no behavior change intended, dedupe only). |

**Not changed:** `conversationBoundary.ts` decision logic, `universalCreation/*` (D3), Create
relationship, arbitration, chamber/board internals. The slice is *consultation ordering + one
predicate*, not new engines.

---

## 5. Current vs proposed control flow

**Current**
```
handleSend:
  14404  boundaryDecision = resolveTurnBoundaryDecision(snapshot)   // computed, mostly only Create reads it
  14444  createRel = classifyCreateTurnRelationship(boundaryDecision)
  ~14639…15329  ~13 FAST-PATH handlers may return (read legacy awaitingUserConfirmationRef only)
  16826  resolveConversationOwnership(...)  ← armed owner finally consulted (too late)
  18548+ LLM dispatch
```

**Proposed (additive, flag-guarded)**
```
handleSend:
  14404  boundaryDecision = resolveTurnBoundaryDecision(snapshot)
  ~14413 [NEW] if OWNERSHIP_GATE_EARLY_CONSULT:
            armed = peekArmedOwner()                        // spine awaiting_user + expectedReply
            if armed && isShortAcceptanceOfArmedOwner(text, armed.expectedReply)
               && boundaryDecision.decision NOT in {interrupt_and_suspend, cancel_current_workflow, switch_topic}:
                 route via existing owner-continue path (resolveConversationOwnership / Create)
                 set turnClaimedByOwner = true              // then fall through OR return
  ~14639…15329  each fast-path handler: `if (turnClaimedByOwner) skip`
  16826  resolveConversationOwnership(...)  (unchanged; now usually already satisfied)
```
Boundary still wins for emotional/cancel/topic-change (property 6). Create-owned turns defer to the
existing D3 path (property 5). Absence of an armed owner → unchanged behavior.

---

## 6. Must MA-01 and MA-04 ship together?

**No — and that is the key finding.** MA-01's arming already exists, so MA-04 can ship *on top of it*.
The slice is effectively **MA-04 alone** (early consult + one predicate), with a small MA-01 *coverage
check* (confirm every offer type that should arm actually calls `beginSpineOwnership`). They would only
be inseparable if arming were absent — it isn't.

---

## 7. State model — reuse vs new

**Smallest safe state model: reuse only. No new persistent state.**

- **Reused (armed owner):** spine `ConversationOwnership{status:"awaiting_user", expectedReply}`
  (`ownership/types.ts:76`); Boundary `pendingOffer`/`pendingQuestion` snapshot inputs; legacy
  `awaitingUserConfirmationRef`; `PendingAcceptanceRecord` (`pendingAcceptanceAuthority.ts:43`,
  turn/panel metadata).
- **Reused (acceptance):** `ACCEPT_RE` + `ACTIVE_QUESTION_BINDING_RE` (composed, not extended).
- **New state required:** ideally **none**. At most one transient in-scope boolean `turnClaimedByOwner`
  (local to a `handleSend` call — not persisted) and one feature flag `OWNERSHIP_GATE_EARLY_CONSULT`.

## 8. Stale-owner prevention (reused, none added)

`PENDING_ACCEPTANCE_TURN_LIMIT = 2` (pendingAcceptanceAuthority:54) · frictionless `PENDING_TURN_LIMIT
= 3` · pendingChoice `10min` wall-clock · panel-change expiry (`isPendingAcceptanceExpired`:124) ·
topic-change invalidation with clarification exemption (:376/:384) · reload resets the useRef/React
state · spine foreign-session rejection (`rejectForeignUniversalCreationSession`, orchestrator:212).
The early consult must honor these — i.e., `peekArmedOwner()` returns null if the record is expired.

## 9. Compatibility fallback

If no armed owner, or `peekArmedOwner()` returns null/expired, or the flag is off → **skip the early
consult entirely** and run today's flow (resolver at 16826). The change is strictly additive; its
absence is current behavior.

## 10. Rollback

Single feature flag `OWNERSHIP_GATE_EARLY_CONSULT` (default off → ship dark, enable after tests).
Rollback = flip the flag; the pre-gate `if (turnClaimedByOwner)` guards are inert when the flag never
sets it. No data migration, no persisted state to unwind.

## 11. Blast radius

**High, and concentrated in the worst file.** The change lives in `handleSend` (the ~15k-line monolith,
MA-20) and touches the ~13 pre-gate handlers. This is the single most important honest caveat: the
highest-leverage fix touches the highest-risk file, *before* the Phase-4 monolith split that would make
it safe. Everything else (predicate, peek) is low-radius pure functions.

## 12. Edge cases

- Bare "yes" with **two** armed owners (e.g. a confirmation offer + a live Create question) → priority
  ladder decides (create 90 > confirmation 70); must be deterministic, not first-match.
- "yes, but make it warmer" (acceptance **+** modifier) → owner receives it; modifier supplements (D3 rule).
- "do it" (missed by the authority regex today) → must be covered by the unified predicate.
- Acceptance after the offer already expired (turn 3+) → `peekArmedOwner()` null → free-floating (correct).
- Numbered choice ("option 2") while a confirmation owner is armed → pendingChoice vs confirmation:
  ladder + `expectedReply.kind` must disambiguate.
- Reload mid-offer → useRef/React state gone; spine ownership may persist → must re-validate against
  turn limits.

## 13. Risks to existing systems

| System | Risk | Mitigation |
|---|---|---|
| **D3 / Create** | Early consult double-handles a discovery answer that Boundary already grants to Create | Defer Create-owned turns to the existing `advanceUniversalCreation` path; never re-bind slots in the gate |
| **S4 / S4.1 / S4.2 (Boundary)** | Adding a **third** transition authority (the meta-defect) | Consult the **existing** Boundary + spine owner; do not create a new gate. Boundary emotional/cancel/topic precedence always wins |
| **Board / Chamber / Research** | Their ad-hoc locks (`buildChamberSpecialistPrimaryTurn`) become a competing owner | Treat them as claim sources already in the ladder (chamber 68/board 66); gate consults the ladder, does not bypass it |
| **General chat** | Regression when no owner is armed | Fallback = unchanged; covered by test C/J |
| **Arbitration** | Adding a third arbitration pass (double-pass already flagged, ARB note) | Consume the existing result; add no new arbitration call |

---

## 14. Required test plan (10 categories, ~16–20 cases)

| # | Scenario | Expected | Mechanism / new-or-existing |
|---|---|---|---|
| A | Assistant offers help → "yes" | Offered action owns & continues | armed `awaiting_user` + acceptance → owner-continue; **new** gate test |
| B | Assistant asks a direct question → "yes" | Answer applied to that question where semantically valid | Boundary `answer_pending_question` → Create/owner; **new** |
| C | "yes" with no armed owner | No stale workflow resumes | `peekArmedOwner()` null → fallthrough; **new** |
| D | Offer, then explicit topic change | Prior owner cleared/parked | Boundary `switch_topic` + `topicChangeInvalidatesOffer`; **new + existing** |
| E | Question, then clarification | Owner preserved unless convo moves on | `isClarificationRequest` exemption (:384); **existing, add gate test** |
| F | "I'm overwhelmed" mid-offer | S4 behavior preserved; **define** park/retain/clear | Boundary rule #1 `interrupt_and_suspend`; owner **parked** (recommended); **new decision + test** |
| G | Create has a pending question | D3 authoritative binding remains authoritative, not duplicated | gate defers to `advanceUniversalCreation`; **regression guard** |
| H | Multiple possible owners | Deterministic priority, no double-handling | `OWNERSHIP_PRIORITY` ladder; **new** |
| I | Reload / restored session | No invalid stale offer resumes | turn-limit + foreign-session revalidation; **new** |
| J | Board / Chamber / Research / general offers | Same contract, no destination-specific hacks | claim ladder sources; **new per-surface** |
| — | "do it" / "continue" / "next" acceptance | Recognized once, consistently | unified predicate; **new predicate unit tests** |

Add the acceptance-predicate unit tests (words × expectedReply kinds) as a standalone, pre-hot-path
deliverable — they are pure and de-risk the gate.

---

## 15. Option 1 vs Option 2 — sequencing

| Axis | Option 1: MA-17 clarification guard | Option 2: MA-04 ownership-gate slice |
|---|---|---|
| User-visible severity | Low now — **already implemented** (:384) | High — "assistant offers, you say yes, nothing happens" |
| Architectural leverage | Minimal (single guard) | High — closes the pre-gate ordering gap; dissolves several downstream findings |
| Implementation risk | ~zero (already done) | **High** — `handleSend` hot path in the monolith |
| Testability | Trivial | Good (10 categories) but integration-heavy |
| Reversibility | n/a | Clean (single flag) |
| Overlap with proven D3 pattern | Low | **High** — same "authority owns; others supplement" contract |

**Recommendation: Option 2 (MA-04), but split into two commits and gated —** (2a) land the **unified
acceptance predicate + its pure unit tests** first (zero hot-path risk, unblocks everything), then
(2b) the flag-guarded early consult in `handleSend`. Option 1 is effectively already shipped, so it is
not a meaningful "first slice." Do **not** attempt 2b before the acceptance predicate exists and before
the Phase-0 build re-verification (MA-35/37) is green.

---

## 16. Report summary

- **MA-34:** resolved & deployed (`8a1ab00a`, ancestor of `aaa40220`); no action.
- **Recommended first slice:** **MA-04**, as two gated commits — (2a) unified acceptance predicate +
  tests, then (2b) flag-guarded early armed-owner consult in `handleSend`. MA-01 arming already exists;
  MA-17 already exists.
- **MA-01 + MA-04 inseparable?** **No.** Arming exists; MA-04 ships on top. The pairing is not a joint build.
- **Implementation surface:** `CompanionPageClient.tsx handleSend` (early consult + ~13 handler defers)
  · `conversationConfirmationGate.ts` (one predicate) · `resolveOwnership.ts` (`peekArmedOwner`) ·
  `pendingAcceptanceAuthority.ts` (re-point predicate). One feature flag. No new persistent state.
- **Tests:** ~16–20 cases across 10 categories (A–J) + acceptance-predicate unit matrix.
- **Reuses existing architecture / competing system?** **Reuses.** The design explicitly extends the
  existing Boundary (S4) + spine ownership + claim ladder and forbids a new gate. Building a separate
  ownership authority would itself be the meta-defect; this note is structured to prevent that.

### Decisions (resolved 2026-07-28)

1. **Hot-path risk: RESOLVED — do not implement the early `handleSend` compliance change yet.**
   Phase 2b remains **deferred** until the predicate work (Phase 2a) is complete and reviewed. Ship 2a
   (the pure predicate + tests) now; 2b waits for explicit approval.
2. **Canonical authority: RESOLVED — Boundary (S4) is canonical.** See
   [CANONICAL_OWNERSHIP_AUTHORITY.md](CANONICAL_OWNERSHIP_AUTHORITY.md). Consequence for this slice:
   MA-04 is a **narrow compliance fix** — the fast-path handlers must obey the Boundary decision
   already computed early (14404); MA-04 must **not** add a separate early ownership resolver or a
   second gate. This supersedes any wording above that framed MA-04 as "consult the spine armed-owner
   early." Unifying the two authorities (demoting `resolveOwnership` to execution/persistence) is a
   separate Phase-4 item, not part of this slice.
3. **Emotional-interruption semantics: RESOLVED — "park, don't lose."** When Boundary identifies an
   emotional interruption (e.g. "I'm overwhelmed"): the current owner is **parked/suspended**; the
   emotional need owns the immediate turn; the prior owner is **not silently cleared**; it may be
   resumed later **only when contextually appropriate**; there is **no automatic forced return**. This
   is Boundary behavior (rule #1 `interrupt_and_suspend`) — the Phase-2a predicate merely returns
   `false` for "okay, I'm overwhelmed" so acceptance never consumes an emotional interruption.
4. **Predicate scope: RESOLVED — keep this slice narrow.** Unify only the authority-related
   short-acceptance predicate needed by MA-04 (`isShortAcceptanceOfArmedOwner`, sourced from the
   canonical `isBareGenericAcceptance` vocabulary). **Do not** collapse all eight regex/predicate
   systems — broader consolidation is a separate MA-11 concern.
