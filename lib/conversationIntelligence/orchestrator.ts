/**
 * Pass 1 shell — priority engine entry + side effects.
 * Pass 2 will expand into full conversation intelligence orchestration.
 */

import { clearFrictionlessPending } from "@/lib/frictionlessActionLayer";
import { clearPendingChoice, loadPendingChoice } from "@/lib/pendingChoice/manager";
import { loadFrictionlessPending } from "@/lib/frictionlessActionLayer";
import { loadUniversalCreationSession } from "@/lib/universalCreation";
import { resolveConversationPriority } from "./priorityEngine";
import type {
  ConversationPriorityInput,
  ConversationPriorityVerdict,
} from "./types";

export type { ConversationPriorityInput, ConversationPriorityVerdict } from "./types";
export {
  detectContinuationKind,
  isRestorationUserTurn,
  resolveConversationPriority,
  stalePendingsToClearOnTopicShift,
} from "./priorityEngine";

/** Default on — set NEXT_PUBLIC_CONVERSATION_PRIORITY_ENGINE=0 to disable. */
export function isConversationPriorityEngineEnabled(): boolean {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CONVERSATION_PRIORITY_ENGINE === "0"
  ) {
    return false;
  }
  return true;
}

export function applyConversationPriorityClears(
  verdict: ConversationPriorityVerdict,
): void {
  if (typeof window === "undefined") return;
  for (const kind of verdict.stalePendingsToClear) {
    if (kind === "frictionless") clearFrictionlessPending();
    if (kind === "pending_choice") clearPendingChoice();
  }
}

export function resolveTurnPriority(
  input: Omit<
    ConversationPriorityInput,
    "hasUniversalCreationSession" | "pendingChoiceState" | "frictionlessPending"
  > &
    Partial<
      Pick<
        ConversationPriorityInput,
        | "hasUniversalCreationSession"
        | "pendingChoiceState"
        | "frictionlessPending"
      >
    >,
): ConversationPriorityVerdict {
  return resolveConversationPriority({
    hasUniversalCreationSession:
      input.hasUniversalCreationSession ??
      Boolean(loadUniversalCreationSession()),
    pendingChoiceState:
      input.pendingChoiceState !== undefined
        ? input.pendingChoiceState
        : loadPendingChoice(),
    frictionlessPending:
      input.frictionlessPending !== undefined
        ? input.frictionlessPending
        : loadFrictionlessPending(),
    userText: input.userText,
    lastAssistantText: input.lastAssistantText,
    currentTurn: input.currentTurn,
  });
}
