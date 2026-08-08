/**
 * Work Identity & Commitment Recognition — types (Slice 0).
 *
 * Inert foundation only (docs/estate/WORK_IDENTITY_IMPLEMENTATION_PLAN.md
 * §1, "Slice 0 — inert foundation"). These types represent the vocabulary
 * the approved design documents already defined — nothing here is read or
 * written by any live conversation flow yet:
 *
 *  - docs/estate/WORK_IDENTITY_MODEL.md                  — the `WorkId` concept
 *  - docs/estate/WORK_IDENTITY_TRANSITION_RULES.md        — the five verbs
 *  - docs/estate/COMMITMENT_RECOGNITION_DESIGN_REVIEW.md  — the Recognition
 *    Layer Contract (§7) and Recognition Acceptance Tests (§10)
 *
 * No function in this module creates, stores, or mutates anything. A
 * `WorkId` is just a string reference here — deciding *when* a fresh one
 * is generated and persisted is explicitly out of scope for this slice
 * (see resolveCommitmentGate.ts's own doc comment, and
 * WORK_IDENTITY_IMPLEMENTATION_PLAN.md §1's Slice 1).
 */

/**
 * A reference to one piece of work's canonical identity
 * (WORK_IDENTITY_MODEL.md §1). A plain string alias, not branded — Slice 0
 * has no code that constructs one, so there is nothing yet to distinguish
 * a `WorkId` from any other string at the type level.
 */
export type WorkId = string;

/**
 * The vocabulary a piece of work is described by — mirrors whatever
 * string Universal Creation's own document-type detection already
 * produces, kept as a plain string here so this module has no compile
 * dependency on Universal Creation's own type list
 * (WORK_IDENTITY_MODEL.md §1's `kind` field).
 */
export type WorkIdentityKind = string;

/**
 * Something named but not yet chosen — WORK_IDENTITY_TRANSITION_RULES.md
 * §7's "possibility": a name in the founder's own words, and a detected
 * kind if one is known. Deliberately carries no `WorkId` — that is the
 * entire point of a possibility
 * (COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §1).
 */
export interface NamedPossibility {
  readonly name: string;
  readonly kind?: WorkIdentityKind;
}

/**
 * The five verbs from WORK_IDENTITY_TRANSITION_RULES.md §0, represented as
 * a discriminated union so a future slice can describe "what should
 * happen" as plain data before ever executing it. Nothing in Slice 0
 * constructs a value of this type — it exists so the vocabulary is
 * shared and reviewable before any code produces or consumes one.
 */
export type WorkIdentityTransitionEvent =
  | { readonly verb: "create"; readonly workId: WorkId; readonly kind: WorkIdentityKind }
  | {
      readonly verb: "attach";
      readonly workId: WorkId;
      readonly target: "session_artifact" | "saved_work_item" | "project" | "research_state";
    }
  | { readonly verb: "pause"; readonly workId: WorkId; readonly reason: string }
  | { readonly verb: "resume"; readonly workId: WorkId }
  | { readonly verb: "close"; readonly workId: WorkId; readonly via: "completion" | "abandonment" };

/**
 * The three-way outcome of a single commitment-recognition decision
 * (COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §7). Modeled as the result of
 * an event, not a persisted status (§1 of that document) — a fresh
 * decision is made every turn, never read back from storage.
 *
 *  - "commit"  — the founder crossed the commitment boundary this turn.
 *  - "explore" — still exploration; no boundary crossed.
 *  - "clarify" — genuinely ambiguous; ask, never guess (§8, §9).
 */
export type CommitmentGateOutcome = "commit" | "explore" | "clarify";

/**
 * Traceable reason codes behind a gate decision — one per rule named in
 * COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §4–§9. Exported so tests (and,
 * eventually, logging) can assert *why* a decision was made, not just
 * *what* it was.
 */
export type CommitmentGateReason =
  | "support_gate_pause"
  | "named_selection"
  | "explicit_transition_phrase"
  | "ambiguous_referent"
  | "unselected_multiple_possibilities"
  | "genuine_confusion"
  | "decision_hedge"
  | "explicit_deferral"
  | "outcome_doubt_with_commitment"
  | "unhedged_commitment"
  | "help_seeking_commitment"
  | "naming_without_volition"
  | "no_work_signal"
  | "no_signal";

/**
 * Structurally identical to `SupportGateTier`
 * (lib/workStatePriority/resolveSupportGate.ts), declared locally rather
 * than imported (Slice 1B Remediation,
 * docs/estate/WORK_IDENTITY_SLICE_1B_REMEDIATION.md): the Work Identity
 * layer must not import into the orchestration / emotion-detection
 * layers, even for a type. Callers that already hold a real
 * `SupportGateTier` value can pass it here directly — TypeScript's
 * structural typing makes the two interchangeable without a shared
 * import (both are exactly `"pause" | "soften" | "proceed"`).
 */
export type CommitmentSupportGateTier = "pause" | "soften" | "proceed";

/** Input to `resolveCommitmentGate` — everything it is allowed to see. */
export interface CommitmentRecognitionContext {
  readonly userText: string;
  /**
   * Computed upstream by `resolveSupportGate` (Work State Priority Model)
   * — never recomputed here. A strict precondition
   * (COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §7, step 1): "pause" always
   * wins over anything the text alone would suggest.
   */
  readonly supportGateTier: CommitmentSupportGateTier;
  /**
   * Whatever possibilities are already named in this conversation, if
   * any — used only for referent resolution (§8), never mutated.
   */
  readonly activePossibilities?: readonly NamedPossibility[];
}

/** Output of `resolveCommitmentGate` — a decision, never a side effect. */
export interface CommitmentGateResult {
  readonly outcome: CommitmentGateOutcome;
  readonly reason: CommitmentGateReason;
  /** Set only when `outcome === "commit"` via a resolved reference (§8). */
  readonly matchedPossibility?: NamedPossibility;
  /** Set only when `outcome === "clarify"` due to referent ambiguity (§8). */
  readonly candidatePossibilities?: readonly NamedPossibility[];
}
