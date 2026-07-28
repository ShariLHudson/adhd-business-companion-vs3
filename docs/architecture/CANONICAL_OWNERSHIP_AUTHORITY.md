# ADR — Boundary (S4) is the Canonical Conversation-Ownership Authority

**Date:** 2026-07-28 · **Status:** Accepted (documentation-only; no runtime change) ·
**Type:** Architecture Decision Record

Related: [MA01_MA04_OWNERSHIP_GATE_DESIGN.md](MA01_MA04_OWNERSHIP_GATE_DESIGN.md) ·
[MASTER_AUDIT_SYNTHESIS.md](MASTER_AUDIT_SYNTHESIS.md) (theme T1) ·
[ARCHITECTURE_STABILIZATION_ROADMAP.md](ARCHITECTURE_STABILIZATION_ROADMAP.md).

Line numbers are current-branch as mapped 2026-07-28 and may drift; symbols are authoritative.

---

## Decision

**Boundary (S4) is the single canonical conversation-ownership authority for Spark Estate.**
There is exactly one authority that decides who owns a turn. Every other component executes that
decision; none re-decides ownership independently.

## Core contract

- **Boundary decides** the turn's transition **and** the selected owner from a **pure pre-turn
  snapshot** of prior-turn state.
- **Experience machines and handlers execute** that decision (they own *domain execution*, not the
  *ownership decision*).
- **No downstream component independently re-decides ownership.** A component may supply a claim or a
  snapshot input; it may not arbitrate the turn.

This completes the contract Boundary already declares in `lib/conversationBoundary.ts:8-27`:
*"Boundary owns the transition type; each machine stays owner of domain execution and becomes a
client."*

## Evidence

- **Boundary runs early.** `resolveTurnBoundaryDecision` at `CompanionPageClient.tsx:14404`, before any
  state machine ingests the message (`resolveConversationBoundary`, `conversationBoundary.ts:399`).
- **Boundary is snapshot-based and preserves the S4 anti-contamination invariant.**
  `captureBoundaryPreTurnSnapshot` (`conversationBoundaryInputs.ts:149`) is a pure read taken before
  mutation; `resolveTurnBoundaryDecision` reads *only* the snapshot (`:158-163`), so a same-turn
  mutation can never contaminate the decision. Guarded by `conversationBoundaryPreTurnSnapshot.test.ts`.
- **Boundary already serves multiple consumers:** `conversationRouter/routeConversationTurn.ts`,
  `conversationContinuity/resolveContinuityGate.ts`, `frictionlessActionLayer.ts`,
  `universalCreation/createTurnRelationship.ts`, `universalCreation/orchestrator.ts`, and
  `CompanionPageClient.tsx` — **5 production consumers.**
- **D3 proved the client pattern.** Create no longer independently claims a discovery answer; it obeys
  `boundaryGrantsCreateAnswer` (`createTurnRelationship.ts:275`) and executes via the D3 authoritative
  pending-slot binding (`orchestrator.ts:732`).
- **The spine resolver is the weaker candidate.** `resolveConversationOwnership`
  (`conversationSession/ownership/resolveOwnership.ts:90`) runs **late** (`CompanionPageClient.tsx:16826`),
  reads **live, already-mutated** stores, has **one production consumer** (CPC), and is **bypassed by
  ~13 fast-path handlers** that return before line 16826. It also runs **blind to the Boundary
  decision** (no reference to boundary in `resolveOwnership.ts`).

## Current duplication (the problem this ADR closes)

**Create pending-question ownership is represented in *both* authorities, independently:**

- Boundary models it via `pendingCreateQuestionSnapshot()` (`conversationBoundaryInputs.ts:97`), mapping
  the pending discovery slot to a domain-word-free role/affordance shape.
- The spine resolver models it via the `create` claim at priority 90 in the ownership ladder
  (`adaptLegacyOwnership.ts:31`).

Two authorities encode the same fact and can disagree. Worse, the **converse** owners
(confirmation offer, chamber, board, collection) are modeled **only** in the spine ladder and are
invisible to Boundary — the snapshot comment explicitly leaves "other awaiting phases … null here"
(`conversationBoundaryInputs.ts:92-95`). So today one axis is double-owned and the rest is spine-only:
the definition of two competing authorities.

## Target responsibilities

- **Boundary (canonical):** transition classification **and** owner selection —
  interrupt/park/switch/cancel/continue/return, and *which experience holds the turn*. The single
  decision point.
- **Spine ownership layer (`resolveOwnership.ts`, `ownershipStore.ts`, `claimTurnOwnership.ts`):**
  **persistence and execution support only** — record the armed owner
  (`status:"awaiting_user"` + `expectedReply`, `ownership/types.ts:76`) for Boundary to read next turn,
  and apply the owner Boundary selected. It stops *deciding*.
- **Chamber, Board, Research, confirmation, collection, and other active experiences:** **snapshot
  inputs / claims** to Boundary, not independent authorities. Their locks
  (e.g. `chamber/chamberConversationLock.ts:26`) become `activeWork`/claim inputs.
- **Fast-path handlers in `handleSend`:** **consumers** of the already-computed Boundary decision — they
  honor it, they do not resolve ownership themselves.

## Migration direction (direction only — not scheduled here)

1. **Generalize the Boundary snapshot beyond Create** — evolve `pendingCreateQuestionSnapshot` into a
   `pendingOwnerSnapshot` that also models confirmation/chamber/board/collection, using the existing
   role/affordance abstraction (no domain words in Boundary).
2. **Incorporate armed owners using existing ownership records** — read the current
   `status:"awaiting_user"` + `expectedReply` the spine already stores; do not invent a new record.
3. **Preserve pure pre-turn inputs** — the generalized snapshot stays a pre-mutation read; the S4
   invariant is non-negotiable.
4. **Demote `resolveOwnership` from decision authority to execution/persistence support.**
5. **Make pre-gate handlers honor Boundary** rather than reading legacy `awaitingUserConfirmationRef`.
6. **Avoid creating a second gate or a new competing ownership system** — the entire point is *one*
   authority. Adding an early resolver alongside Boundary would recreate the defect.

## Non-goals

- No runtime changes in this step.
- No Phase-4 migration yet.
- No broad `handleSend` rewrite.
- No new persistent ownership model unless later evidence proves it necessary.
- Do **not** reopen D3 or S4/S4.1/S4.2.

## Consequences and risks

**Benefits**
- One decision point; the "two authorities" meta-defect (synthesis T1) is closed at the source.
- Preserves the hard-won S4 anti-contamination invariant instead of fighting it.
- Most of the ecosystem is *already* a Boundary client (5 consumers); little re-wiring.
- Makes MA-04 smaller (see below), not larger.

**Migration cost**
- Phase-4-scale: generalizing the snapshot and demoting the resolver touches the ownership layer and,
  eventually, `handleSend`. Real work, sequenced later.

**Compatibility**
- The spine's stored ownership record (`awaiting_user`/`expectedReply`) is reused, not replaced —
  arming (`CompanionPageClient.tsx:21355`) keeps working. Chamber/board locks continue to function as
  claim inputs during migration.

**Risk of NOT deciding**
- Leaving two decision authorities in place guarantees divergence: the late spine resolver and the
  early Boundary can select different owners for the same turn, and fast-path handlers obey neither.
  Every new feature that "adds an ownership check" deepens the split. This ADR exists to stop that.

## Relationship to MA-04

With Boundary canonical, **MA-04 is now a narrow compliance fix, not a new resolver.** The correct
MA-04 is: *the fast-path handlers in `handleSend` must obey the Boundary decision that is already
computed early (14404).* MA-04 **must not** introduce a separate early ownership resolver or a second
gate — doing so would reintroduce exactly the competing-authority defect this ADR removes.
