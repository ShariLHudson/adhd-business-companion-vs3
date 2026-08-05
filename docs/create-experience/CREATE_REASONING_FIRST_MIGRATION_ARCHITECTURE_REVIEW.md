# Create: Artifact-First → Reasoning-First — Architecture Review

**Version:** 1.0
**Status:** Read-only architecture review. No implementation. Stop condition honored — awaiting approval.
**Triggered by:** the SOP Build Journey pilot (Phases 1–2), which proved the shared infrastructure works but exposed that the member experience above it is still wizard-shaped.
**Scope of this document:** analysis only — current state, what's reusable, what's genuinely missing, cross-system risk, and a recommended sequencing. It does not decide anything; every open question below is a decision for founder review.

---

## Headline finding

**Most of what this handoff asks for already exists in the codebase, disconnected from Create.**

`lib/estateBrain/discoveryMode.ts` + `discoveryRegistry.ts` contain a working, tested, chat-reachable "understand before act" flow — including three pre-authored, non-form discovery questions specifically for SOP:

> *"Is this SOP for your own business, or for a client?"*
> *"Are you starting from scratch, or do you already have a process written down somewhere?"*
> *"Will one person use this, or will multiple people need to follow it?"*

with an intro line — *"I'd be happy to help. Let me understand what you're trying to build."* — that is closer to the handoff's target voice than anything currently reachable from the Create room.

It is **completely walled off from Create** by two guard clauses that fire before this logic ever runs:

```ts
// discoveryMode.ts:77
if (shouldEnterUniversalCreation(t)) return false;

// estateCoaching.ts:143
if (resolveImmediateCreateAction(t)) return false;
```

Both were added deliberately, to prevent double-handling between chat and Create. Reopening them is real, careful work — but this is not a "build reasoning-first from nothing" project. It is "reconnect and extend something that was already built and then fenced off."

This reframes the whole review: the primary risk is not *invention*, it's *cross-system entanglement* — reopening a gate that other logic depends on staying shut.

---

## 1. Current strengths — verified, confirmed reusable as instructed

| Strength | Verified state |
|---|---|
| Build type detection | `resolveCreateBeginOutcome.ts` — keyword/matchTerm classification, confirm-gated. Works, per SOP pilot. Reusable as the *fallback and final confirm step*, not as the entry experience. |
| Registry | `lib/createRegistry/` — 11 items, categories, dual-read adapters. Untouched, still the right long-term source. |
| Section schemas | `createTemplates.ts`, extended in SOP Phase 1 with authored `prompt`/`why` per section. This is genuinely reusable — a reasoning-first entry can still hand off into these same sections once a Build Type is determined. |
| Save system | `lib/creationDurable/` — durable, trust-gated, unchanged all session. Preserve exactly. |
| Resume infrastructure | `resolveCanonicalCurrentFocus`, `RuntimeCreationRecord`, and — as of SOP Phase 2 — `workingMemory` (`desiredResult`, `primaryUser`, `nextHelpfulStep`, 7 more fields). This is more ready than the handoff assumes; see §5. |
| Existing creation records | Unchanged, no migration implied by anything below. |
| Shared wizard shell | `CreateEstateWorkingPanel` + `CurrentFocusInteraction` — one question at a time, non-linear, assist affordances. This shell is not the problem; what feeds it is. |

None of this needs to be replaced. The review below is about what sits *in front of* it.

---

## 2. The core issue, precisely located

The handoff states the entry copy is the problem ("What are you creating?" vs "What are you trying to accomplish?"). Checking this against what actually ships today:

- The **top-level entrance invitation** (`CREATE_ESTATE_ENTRANCE_INVITATION`) already reads: *"Tell me what you're working on, and we'll figure out the best way forward together."* This is already accomplishment-oriented, not artifact-oriented. Phase 0 (2026-08-05) got this right.
- The **composer field label** (`CREATE_ESTATE_WHAT_WOULD_YOU_LIKE_HEADING`) reads *"What would you like to create?"* — this is the literal artifact-first phrase.
- More importantly: **the copy is not really the issue — the mechanism is.** The instant a member submits text, `resolveCreateBeginOutcome` pattern-matches it directly to an artifact type and shows a confirm ("Create SOP"). There is no intermediate step where Spark asks anything before classifying. SOP Phase 1's authored prompts made the *questions inside* the SOP flow feel less form-like, but the *path to get there* is still: type → classify → confirm → begin walking sections. Understanding happens *after* the Build Type is already locked in, not before.

So the fix is not a copy change. It's inserting genuine understanding *before* classification, for requests where that classification isn't already unambiguous — which is exactly what `discoveryMode.ts` was built to do and is currently blocked from doing for Create.

---

## 3. Entry-path consistency — confirmed, with the exact divergence point

Verified in code: **Start Freely (typed text) and Browse Categories / Start With Guidance (category clicks) already run through two different functions with different behavior**, for what could be the identical member need.

| Path | Function | Behavior |
|---|---|---|
| Start Freely / search | `resolveCreateBeginOutcome(userText)` | Real (if shallow) classification: matches terms, computes confidence, surfaces `alsoConsidered` alternatives when ambiguous |
| Browse Categories / Start With Guidance | `resolveCatalogCreateConfirm({ label })` | Takes the clicked label directly. `confidence: "high"` is **hardcoded**. No text analysis happens at all. |

This confirms the handoff's concern exactly: the same underlying need — "I need an SOP for onboarding clients" — produces a reasoned confirm if typed, and an unreasoned direct-label confirm if reached by clicking through categories. One conversation model, two mechanisms.

---

## 4. "Help me figure this out" today — confirmed to be a category picker

Verified: `CreateBrowseCategoriesPanel` in `mode="guided"` shows the heading *"What are you hoping to create?"*, then a 7-category grid, then parent-type cards, then an optional subtype question, then confirm. This is the same `CreateBrowseCategoriesPanel` component used for plain Browse — differently framed, not differently reasoned. It never asks about outcome, audience, current situation, existing materials, or constraints. The handoff's characterization is accurate.

---

## 5. Resume behavior — confirmed gap, and a near-miss worth naming

Verified: `CreateWorkspaceResumeList` shows only `title · statusLabel/phaseLabel` (e.g., "Client Onboarding SOP · Shaping"). Clicking Continue reopens Current Focus at the next unanswered section — no narrative, no recap.

**The near-miss:** `RuntimeCreationRecord.workingMemory` — shipped this session in SOP Phase 2 — already holds `desiredResult`, `primaryUser`, and `nextHelpfulStep` for any creation using a Build Type with authored sections. But the resume card's `nextAction` field is **hardcoded to the literal string `"Continue"`** (`CreateEstateEntrancePanel.tsx:279`), never reading from `workingMemory` at all. Closing a meaningful slice of the resume gap the handoff describes may be closer to a *presentation* change (read `workingMemory` into the resume card and the reopening message) than a new *system* — exactly the "use shared Spark reasoning behavior, don't build a new memory system" instruction already followed by construction, not yet by consumption.

This does not fully deliver the handoff's example ("we identified that the goal was helping your assistant handle new clients... we still needed to document the approval process") — that needs `openQuestions`/`decisions`, which are schema-ready but not yet populated (see the SOP handoff's own §10 note). But it's a real, low-risk, high-value first slice.

---

## 6. Secondary views — already closer to the target than the handoff assumes

Verified live (Phase 1 testing): `CreateEstateWorkingPanel` already renders Current Focus as the primary surface and a **separate, secondary "Your plan" panel** (`CreateWorkspaceV2Panel` / the Workshop Map, with Focus/Organized/Full view modes) alongside it — "Secondary to Current Focus — open a step when you want it." This is structurally already the split the handoff asks for: conversation primary, sections/progress secondary and navigable. No architecture change needed here; this requirement is largely already met.

---

## 7. What genuinely needs to change

1. **A pre-classification understanding step**, reusing `discoveryMode.ts`'s pattern (intro line → 2–3 slot-based questions → hand off to classification), available from Create, not gated by `shouldEnterUniversalCreation`.
2. **One reasoning path for all entry surfaces** — Start Freely, Start With Guidance, and Browse Categories should converge on the same understanding-then-classify mechanism instead of Browse Categories/Guidance bypassing it via `resolveCatalogCreateConfirm`.
3. **Resume messaging that reads `workingMemory`** instead of a hardcoded "Continue" and a bare status label.
4. **Coverage beyond one topic** — `DiscoveryTopic` currently has `create_sop`, `focus`, `business_growth`, `research`. A reasoning-first Create needs this pattern extended to (at minimum) the other 7 V1 priority Build Types, or a generic fallback for Build Types without an authored discovery set yet.

---

## 8. Cross-system risk — what reopening the gate actually touches

This is the section that most needs founder attention before any implementation.

- **`shouldEnterUniversalCreation` / `resolveImmediateCreateAction` are shared with chat routing**, not Create-only. `routeEstateIntelligence.ts`, `estateCoaching.ts`, and `discoveryMode.ts` all branch on them to decide whether the *main conversation* should discovery-mode, coach, or hand off to Create. Loosening the Create-side guard without scoping it correctly risks the exact class of regression this session already hit once during the ADR-013 routing work (Fix B) — a shared function's behavior changing for a caller that wasn't the intended target. The same `sourceExperience`-style scoping discipline used there will likely be needed again here.
- **`resolveCreateBeginOutcome` is also the function ADR-013's boundary logic depends on** (`openDecision.ts`). Any change to when/how classification runs must be checked against that boundary — it must keep routing single-artifact requests to Current Focus and coordinated requests to Creation Workspace correctly.
- **`discoveryMode`'s session state is chat-shaped** (`estate-discovery-session-v1`, driven by `startDiscoveryTurn` inside the conversation loop). Bringing it into Create means either genuinely sharing that session mechanism (preferred — this *is* "shared Spark reasoning behavior") or building a parallel one (forbidden by the handoff's own non-negotiables). Confirming the session state can be safely entered/exited from the Create surface, not just chat, is real design work, not a given.
- **Confirm-gate preservation**: `resolveImmediateCreateAction` ultimately still needs to land on a `confirm` outcome before anything is created — the pilot's non-negotiable ("never silently create") must survive a reasoning step being inserted in front of it.
- **Registry coverage gap**: extending discovery beyond SOP means either authoring `DiscoveryQuestion` sets for the other 7 V1 items (real content work, per Build Type, matching the SOP Knowledge Finger pattern) or explicitly deciding what happens for a Build Type with no authored discovery yet (fall through to today's direct classification — not a gap that blocks the SOP-specific work, but worth deciding now rather than mid-build).

---

## 9. Non-negotiables cross-check

| Instruction | Assessment |
|---|---|
| No SOP-specific conversation engine | Satisfied by design — `discoveryMode.ts` is already generic across topics; reconnecting it serves every Build Type, not just SOP |
| No new wizard | Not proposed — `CreateEstateWorkingPanel`/`CurrentFocusInteraction` remain the section-answering shell once a Build Type is determined |
| No separate guidance system | The opposite of what's proposed — the ask is to *stop* having Browse Categories/Guidance be a separate, unreasoned system and *merge* it into the one that already exists |
| No new memory system | `workingMemory` (SOP Phase 2) already covers a meaningful slice; extending it (openQuestions, decisions — already in the approved 10-field schema, just unpopulated) is additive, not new |

---

## 10. Recommended safest next phase

**Not full implementation.** Given the cross-system risk in §8, the safest next step is narrower than "build reasoning-first Create":

1. A founder decision on the specific mechanism: reconnect `discoveryMode.ts` with a scoped, Create-aware entry condition (reuse), vs. a smaller first slice that only fixes the confirmed, lower-risk gaps — entry-path consistency (§3) and resume messaging reading `workingMemory` (§5) — before touching the chat/Create shared-routing surface at all.
2. If reconnection is approved: a dedicated safety check on exactly how `shouldEnterUniversalCreation`/`resolveImmediateCreateAction` get scoped so Create gains discovery mode without changing chat's existing behavior — the same class of check that produced the `sourceExperience` fix during ADR-013 work.
3. Only after that: extend `DISCOVERY_QUESTIONS` beyond `create_sop` to the other V1 Build Types, one at a time, following the SOP Knowledge Finger's authoring pattern.

## Stop condition

This is a review. Nothing has been implemented and nothing has been committed to change behavior — only this document has been added. Awaiting direction on the decision in §10 before any code changes begin.
