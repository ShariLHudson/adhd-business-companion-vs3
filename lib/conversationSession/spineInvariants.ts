/**
 * Development-only ConversationSession spine invariants.
 * Never throw in production; never surface to members.
 */

export type SpineInvariantKind =
  | "responder_without_conversation_id"
  | "projection_conversation_id_mismatch"
  | "assistant_emission_after_turn_consumed"
  | "assistant_render_without_spine_commit"
  | "user_render_without_spine_commit"
  | "certification_transcript_differs_from_spine"
  | "projection_transcript_length_mismatch"
  | "append_helper_bypassed";

type SpineTurnGate = {
  conversationId: string | null;
  turnConsumed: boolean;
  finalOwner: string | null;
  lastCommittedRole: "user" | "assistant" | null;
  lastCommitSource: string | null;
};

let turnGate: SpineTurnGate = {
  conversationId: null,
  turnConsumed: false,
  finalOwner: null,
  lastCommittedRole: null,
  lastCommitSource: null,
};

function isDev(): boolean {
  return (
    typeof process !== "undefined" && process.env.NODE_ENV !== "production"
  );
}

export function logSpineInvariant(
  kind: SpineInvariantKind,
  detail?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isDev()) return;
  try {
    // eslint-disable-next-line no-console
    console.debug("[conversation-spine]", kind, detail ?? {});
  } catch {
    /* ignore */
  }
}

/** Call when a Companion turn begins under a spine conversationId. */
export function markSpineTurnStarted(conversationId: string | null): void {
  turnGate = {
    conversationId: conversationId?.trim() || null,
    turnConsumed: false,
    finalOwner: null,
    lastCommittedRole: null,
    lastCommitSource: null,
  };
  if (!turnGate.conversationId) {
    logSpineInvariant("responder_without_conversation_id", {
      phase: "turn_start",
    });
  }
}

/** Call when turn authority / decision is finished for the turn. */
export function markSpineTurnAuthorityConsumed(finalOwner?: string | null): void {
  turnGate = {
    ...turnGate,
    turnConsumed: true,
    finalOwner: finalOwner ?? turnGate.finalOwner,
  };
}

export function markSpineTranscriptCommitted(
  role: "user" | "assistant",
  source?: string | null,
): void {
  turnGate = {
    ...turnGate,
    lastCommittedRole: role,
    lastCommitSource: source ?? null,
  };
}

export function assertSpineAssistantEmissionAllowed(owner: string): void {
  if (!turnGate.conversationId) {
    logSpineInvariant("responder_without_conversation_id", {
      phase: "assistant_emission",
      owner,
    });
  }
  if (turnGate.turnConsumed) {
    logSpineInvariant("assistant_emission_after_turn_consumed", {
      owner,
      priorFinalOwner: turnGate.finalOwner,
      conversationId: turnGate.conversationId,
    });
  }
}

export function reportProjectionConversationIdMismatch(input: {
  projection: string;
  projectionConversationId: string | null | undefined;
  spineConversationId: string | null | undefined;
}): void {
  logSpineInvariant("projection_conversation_id_mismatch", {
    projection: input.projection,
    projectionConversationId: input.projectionConversationId ?? null,
    spineConversationId: input.spineConversationId ?? null,
  });
}

/** Test helper */
export function resetSpineTurnGateForTests(): void {
  turnGate = {
    conversationId: null,
    turnConsumed: false,
    finalOwner: null,
    lastCommittedRole: null,
    lastCommitSource: null,
  };
}

export function getSpineTurnGateForTests(): SpineTurnGate {
  return { ...turnGate };
}
