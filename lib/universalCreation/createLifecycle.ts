/**
 * Create lifecycle — active vs parked vs completed/exited.
 *
 * Parked Create preserves the Universal Creation session but must not consume
 * unrelated turns. Resume only on explicit return / revision / menu actions.
 */

import type { UniversalCreationSession } from "./types";
import {
  clearUniversalCreationSession,
  loadUniversalCreationSession,
  saveUniversalCreationSession,
} from "./orchestrator";
import { clearFrictionlessPending } from "@/lib/frictionlessActionLayer";
import { clearShariConversationThread } from "@/lib/shariAnswerFirst/conversationContinuity";

export type CreateLifecycleState =
  | "none"
  | "active"
  | "awaiting_input"
  | "parked"
  | "resumed"
  | "completed"
  | "exited"
  | "abandoned";

export type CreateLifecycleSnapshot = {
  state: CreateLifecycleState;
  session: UniversalCreationSession | null;
  documentType: string | null;
  phase: string | null;
  parked: boolean;
  hasDraft: boolean;
};

/**
 * Derive lifecycle from the stored UC session.
 * `lifecycle` on the session is authoritative when set; otherwise infer.
 */
export function getCreateLifecycle(
  session: UniversalCreationSession | null = loadUniversalCreationSession(),
): CreateLifecycleSnapshot {
  if (!session) {
    return {
      state: "none",
      session: null,
      documentType: null,
      phase: null,
      parked: false,
      hasDraft: false,
    };
  }
  const hasDraft = Boolean(session.draftContent?.trim());
  const parked = session.lifecycle === "parked" || Boolean(session.parkedAt);
  if (session.lifecycle === "completed") {
    return {
      state: "completed",
      session,
      documentType: session.documentType,
      phase: session.phase,
      parked: false,
      hasDraft,
    };
  }
  if (session.lifecycle === "exited" || session.lifecycle === "abandoned") {
    return {
      state: session.lifecycle,
      session,
      documentType: session.documentType,
      phase: session.phase,
      parked: false,
      hasDraft,
    };
  }
  if (parked) {
    return {
      state: "parked",
      session,
      documentType: session.documentType,
      phase: session.phase,
      parked: true,
      hasDraft,
    };
  }
  if (
    session.phase === "awaiting_action" ||
    session.phase === "review" ||
    session.phase === "revision" ||
    session.phase === "approval" ||
    session.phase === "discovery" ||
    session.phase === "guided_creation"
  ) {
    const awaiting =
      session.phase === "discovery" ||
      session.phase === "revision" ||
      session.phase === "approval" ||
      session.phase === "awaiting_action";
    return {
      state: awaiting ? "awaiting_input" : "active",
      session,
      documentType: session.documentType,
      phase: session.phase,
      parked: false,
      hasDraft,
    };
  }
  return {
    state: "active",
    session,
    documentType: session.documentType,
    phase: session.phase,
    parked: false,
    hasDraft,
  };
}

export function isCreateParked(
  session: UniversalCreationSession | null = loadUniversalCreationSession(),
): boolean {
  return getCreateLifecycle(session).parked;
}

export function isCreateWorkflowPresent(
  session: UniversalCreationSession | null = loadUniversalCreationSession(),
): boolean {
  const life = getCreateLifecycle(session);
  return (
    life.state === "active" ||
    life.state === "awaiting_input" ||
    life.state === "parked" ||
    life.state === "resumed"
  );
}

/** Soft leave — keep session + draft; mark parked so Create cannot steal turns. */
export function parkCreateWorkflow(reason: string, turn?: number): UniversalCreationSession | null {
  const session = loadUniversalCreationSession();
  if (!session) return null;
  if (session.lifecycle === "exited" || session.lifecycle === "completed") {
    return session;
  }
  const parked: UniversalCreationSession = {
    ...session,
    lifecycle: "parked",
    parkedAt: new Date().toISOString(),
    parkedReason: reason,
    parkedAtTurn: turn ?? session.parkedAtTurn,
  };
  saveUniversalCreationSession(parked);
  // Soft confirmation must not compete while Create is parked.
  clearFrictionlessPending();
  // Stale help-thread binders must not steal the detour answer or Create return.
  clearShariConversationThread();
  return parked;
}

/** Explicit return — clear parked flags; Create may own the turn again. */
export function resumeCreateWorkflow(
  reason = "explicit_return",
): UniversalCreationSession | null {
  const session = loadUniversalCreationSession();
  if (!session) return null;
  if (session.lifecycle === "exited" || session.lifecycle === "completed") {
    return null;
  }
  const resumed: UniversalCreationSession = {
    ...session,
    lifecycle: "resumed",
    parkedAt: undefined,
    parkedReason: undefined,
    resumeReason: reason,
  };
  saveUniversalCreationSession(resumed);
  clearFrictionlessPending();
  return resumed;
}

/** Hard release — destroy session (exit / replace / abandon). */
export function exitCreateWorkflow(reason: "exited" | "completed" | "abandoned"): void {
  clearUniversalCreationSession();
  clearFrictionlessPending();
  clearShariConversationThread();
  void reason;
}

/** Suppress soft confirmation rivalry whenever Create workflow is present. */
export function shouldSuppressSoftConfirmationForCreate(
  session: UniversalCreationSession | null = loadUniversalCreationSession(),
): boolean {
  return isCreateWorkflowPresent(session);
}
