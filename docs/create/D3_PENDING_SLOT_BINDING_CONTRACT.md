# D3 — Pending-Slot Binding Contract

**Scope:** D3 only. Not D1 (subject generation), not D5 (draft-timing product decision), not S5.
Boundary (S4/S4.1/S4.2) remains the single ownership authority and is untouched.

## Confirmed defect

In a clean session:

1. "Help me write an email." → Spark asks **"Who is receiving this email?"** (pending slot `email-recipient`).
2. "To update the client on the project timeline." (a *purpose*).
3. The answer is stored as purpose/subject/body while the recipient defaults to **"Client."**

Root cause (code-verified): `advanceUniversalCreation()` does **not** bind the reply to the
question it asked. It runs harvest + `applyEmailDiscoveryDefaults` first — which fabricates
`email-recipient = "Client"` from `/\bclient\b/` over the combined text — then routes the reply
by `evaluateCreationCriticalGap(...).blockingQuestionId`, so the answer lands in `email-purpose`.
The recipient fabrication is one instance of a broader defect: **content-keyword harvest can
satisfy or displace the pending slot before the answer is bound.**

## Violated invariant

> **The pending question owns the next user answer.**

Harvest may enrich *other empty* slots from information genuinely volunteered in the same answer,
but it must never (a) satisfy the pending slot by keyword inference before authoritative binding,
(b) reroute the full answer into a different slot, (c) overwrite the authoritative pending value,
or (d) duplicate the same raw answer across unrelated slots because gap order changed.

## Accepted contract

```
1. Pending-slot AUTHORITATIVE write   answers[pending.id] = userReply.trim()   (literal, first)
2. SUPPLEMENT-only harvest            fill only empty, non-pending slots; never overwrite
3. Gap RECOMPUTATION                  flags/confidence/questionIndex, by stable id
4. NEXT question or DRAFT             gap decides what to ask / whether to draft — never routing
```

- Pending resolved from session state (Phase 1: `questionIndex`, used only as a lookup key; the
  stable `id` is the contract).
- Uncertainty/frustration pre-checks run **before** the write ("I'm not sure" is never captured).
- Critical-gap is consumed **after** binding, only to choose the next question or gate drafting —
  it is no longer the answer-routing authority.
- No valid pending question ⇒ compatibility path: today's behavior, unchanged.

## Why deleting the recipient fabrication alone is insufficient

Deleting the `/\bclient\b/ → "Client"` default removes the ugliest symptom but leaves the routing
wrong. Counterexample, fabrication already gone — asked recipient, answer
*"The whole team, we're strained right now"*: `harvestEmailDiscovery` sets `email-recipient="the
team"`, `who` is satisfied, and the gap engine routes the **full raw reply** into `email-purpose`.
Same defect class, zero fabrication. The fabrication is a *consequence* of the missing binding, not
the cause. Pending-slot binding is the architectural fix; deleting the default is a separate,
necessary cleanup of an independent keyword heuristic (it also fires in `buildInitialSession` and
can fabricate a *non-pending* recipient).

## Phase 1 commit sequence (this PR — behavior correct, session type unchanged)

1. **Infra, behavior-preserving.** Add opt-in `{ supplementOnly, protectSlotId }` to
   `mergeHarvestedAnswers`; default unchanged for all current callers.
2. **Remove the fabrication.** Delete the recipient-default block in `applyEmailDiscoveryDefaults`.
   *Safe to ship alone.*
3. **Rewire routing (core).** `advanceUniversalCreation`: resolve pending → authoritative
   `applyAnswer(pending.id)` → supplement harvest → recompute → gap-decides-next. Remove the two
   answer-routing `applyAnswer(blockingQuestionId / next.id)` calls; set `questionIndex` by id;
   add legacy fallback.
4. **Consistency (optional, same PR).** Pass supplement-only into `draftArtifactTurn`'s merge.

Order matters: 1 → 2 → 3. Each commit independently green; stopping after any commit leaves the
system no worse than before.

## Deferred — Phase 2 (separate PR)

Introduce an explicit `pendingQuestionId` on the session, stamped at every question-return site;
read it for binding instead of deriving from `questionIndex`; compat-fallback for pre-existing
sessions; then remove the implicit `questionIndex`-as-pending assumption. Behavior is already proven
by Phase 1, so this is a pure model-hardening refactor.

## Explicit limitation — multi-intent answers

Phase 1 does **not** split a multi-intent utterance into clean per-slot fragments; that needs
semantics we cannot obtain without banned business-keyword heuristics. The pending slot receives the
**literal reply** (it owns it, verbatim, even if verbose), and other slots are enriched **only** by
harvest's existing *synthesis* — never a verbatim copy of the utterance. Refining "which fragment is
the recipient" is deferred, and must never become a keyword rule. A reply that clearly does not fit
the pending question is captured verbatim (honest capture); fit-detection is a future opt-in hook at
the single, well-defined binding point this contract creates.

## Principle

> **Extract what the user said; never fabricate what they didn't.**
