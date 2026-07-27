/**
 * Soft-Boundary Conversation Architecture — Stage S2: Suspension Primitive
 * (PURE, UNWIRED, store-agnostic).
 *
 * Generalizes the EXISTING, proven `createLifecycle` "parked" model
 * (parkCreateWorkflow / resumeCreateWorkflow — a single-slot Create park) into
 * ONE shared `SuspendedContext` record so that active topics and intent
 * workflows can be suspended and resumed the same way Create already is —
 * instead of the current three single-slot, domain-specific mechanisms.
 *
 * This module is NOT imported by any production code and changes NO behavior.
 * It is the data structure + operations only; wiring is later stages.
 *
 * Design (from S1 review): Create is the first proven producer. The record is
 * a superset of S1's `BoundarySuspendedItem`, so the boundary decision can read
 * a projection of the suspension stack to drive `return_to_suspended_topic`.
 */

import type { BoundarySuspendedItem } from "./conversationBoundary";
import type { UniversalCreationSession } from "./universalCreation/types";

export type SuspendedContextKind = "topic" | "workflow" | "create";

export type SuspendedContext = {
  /** Stable id used as the boundary decision's returnTargetId. */
  id: string;
  kind: SuspendedContextKind;
  /** Which domain record to restore (topicId / workflowId / create documentType). */
  sourceRef: string;
  /** Human-readable "what was happening" — matched against return language. */
  summary: string;
  /**
   * Optional natural-language cue so a future resume can sound conversational
   * ("the email you were drafting") without reconstructing full context.
   */
  resumeHint?: string;
  /** Why it was suspended (e.g. "temporary_detour", "emotional_urgency", "switch_topic"). */
  reason: string;
  suspendedAtTurn: number;
};

export type SuspensionState = {
  /** Bounded LIFO stack — most-recently-suspended is last. */
  readonly stack: readonly SuspendedContext[];
};

/**
 * Bounded depth. Interruptions nest shallowly in real conversation; a small cap
 * prevents unbounded growth. Pushing beyond the cap drops the OLDEST entry
 * (that work expires rather than accumulating silently).
 */
export const MAX_SUSPENSION_DEPTH = 2;

export function emptySuspensionState(): SuspensionState {
  return { stack: [] };
}

function makeId(kind: SuspendedContextKind, sourceRef: string, turn: number): string {
  return `${kind}:${sourceRef}:${turn}`;
}

/**
 * Suspend a context (push). Idempotent per sourceRef: re-suspending the same
 * source replaces its prior entry (no duplicates). Enforces MAX_SUSPENSION_DEPTH
 * by dropping the oldest.
 */
export function suspend(
  state: SuspensionState,
  input: Omit<SuspendedContext, "id"> & { id?: string },
): SuspensionState {
  const id = input.id ?? makeId(input.kind, input.sourceRef, input.suspendedAtTurn);
  const context: SuspendedContext = { ...input, id };
  // Drop any existing entry for the same source (replace, don't duplicate).
  const withoutSource = state.stack.filter((c) => c.sourceRef !== context.sourceRef);
  let next = [...withoutSource, context];
  if (next.length > MAX_SUSPENSION_DEPTH) {
    next = next.slice(next.length - MAX_SUSPENSION_DEPTH); // keep newest N
  }
  return { stack: next };
}

/**
 * Resume (pop) a suspended context. With `id`, resumes that specific entry;
 * without, resumes the most recent. Returns the new state and the resumed
 * context (null if nothing matched).
 */
export function resume(
  state: SuspensionState,
  id?: string,
): { state: SuspensionState; resumed: SuspendedContext | null } {
  if (!state.stack.length) return { state, resumed: null };
  if (id) {
    const found = state.stack.find((c) => c.id === id) ?? null;
    if (!found) return { state, resumed: null };
    return { state: { stack: state.stack.filter((c) => c.id !== id) }, resumed: found };
  }
  const resumed = state.stack[state.stack.length - 1]!;
  return { state: { stack: state.stack.slice(0, -1) }, resumed };
}

export function peekMostRecent(state: SuspensionState): SuspendedContext | null {
  return state.stack.length ? state.stack[state.stack.length - 1]! : null;
}

export function findSuspendedById(
  state: SuspensionState,
  id: string,
): SuspendedContext | null {
  return state.stack.find((c) => c.id === id) ?? null;
}

export function listSuspended(state: SuspensionState): readonly SuspendedContext[] {
  return state.stack;
}

export function hasSuspended(state: SuspensionState): boolean {
  return state.stack.length > 0;
}

/** State factory/reset — returns a fresh empty state (not a mutating clear). */
export function resetSuspensionState(): SuspensionState {
  return emptySuspensionState();
}

// ── S1 ↔ S2 seam: project the stack for the boundary decision ────────────────

export function toBoundarySuspendedItem(c: SuspendedContext): BoundarySuspendedItem {
  return { id: c.id, summary: c.summary, suspendedAtTurn: c.suspendedAtTurn };
}

export function toBoundarySuspendedItems(
  state: SuspensionState,
): BoundarySuspendedItem[] {
  return state.stack.map(toBoundarySuspendedItem);
}

// ── First producer: generalize the parked Create model ──────────────────────

/** Natural conversational cue for a resume, e.g. "the email you were drafting". */
export function buildResumeHint(input: {
  kind: SuspendedContextKind;
  summary: string;
  artifactLabel?: string | null;
}): string {
  const noun = input.artifactLabel?.trim();
  if (noun) return `the ${noun} you were working on`;
  const s = input.summary.trim();
  if (s) return `what we were working on — ${s}`;
  return "what we were working on";
}

/**
 * Map a PARKED Universal Creation session into the shared SuspendedContext —
 * proving Create is the first producer of the generalized model. Pure: takes
 * the session as data, never reads a store, never mutates createLifecycle.
 * Returns null unless the session is genuinely parked.
 */
export function suspendedContextFromParkedCreate(
  session: UniversalCreationSession | null,
): SuspendedContext | null {
  if (!session || session.lifecycle !== "parked") return null;
  const turn = session.parkedAtTurn ?? session.startedAtTurn;
  const artifactLabel = session.documentType;
  const summary = (session.originalUserText ?? "").trim() || `${artifactLabel} draft`;
  return {
    id: makeId("create", artifactLabel, turn),
    kind: "create",
    sourceRef: artifactLabel,
    summary,
    resumeHint: buildResumeHint({ kind: "create", summary, artifactLabel }),
    reason: session.parkedReason ?? "parked",
    suspendedAtTurn: turn,
  };
}
