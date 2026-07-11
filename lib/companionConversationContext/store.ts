/**
 * Session storage for Companion Conversation Context.
 */

import type {
  CompanionConversationState,
  CompanionPendingAction,
} from "./types";
import { COMPANION_CONTEXT_STORAGE_KEY } from "./types";

const EMPTY_STATE: CompanionConversationState = {
  activeSession: "none",
  currentLocation: null,
  currentArea: null,
  lastAssistantQuestion: null,
  pendingAction: null,
  lastDiscussedEntity: null,
  lastKnowledgeAnswerType: null,
  lastUserGoal: null,
  currentTopic: null,
  emotionalPivotDetected: false,
  updatedAtTurn: 0,
};

let memoryState: CompanionConversationState | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function isCompanionConversationContextEnabled(): boolean {
  if (typeof process !== "undefined" && process.env) {
    const flag = process.env.NEXT_PUBLIC_COMPANION_CONVERSATION_CONTEXT;
    if (flag === "0" || flag === "false") return false;
  }
  return true;
}

export function readCompanionConversationState(): CompanionConversationState {
  if (!canUseStorage()) {
    return { ...(memoryState ?? EMPTY_STATE) };
  }
  try {
    const raw = sessionStorage.getItem(COMPANION_CONTEXT_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    return { ...EMPTY_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function writeCompanionConversationState(
  patch: Partial<CompanionConversationState>,
): CompanionConversationState {
  const next: CompanionConversationState = {
    ...readCompanionConversationState(),
    ...patch,
  };
  if (canUseStorage()) {
    try {
      sessionStorage.setItem(COMPANION_CONTEXT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  } else {
    memoryState = next;
  }
  return next;
}

export function clearCompanionConversationState(): void {
  if (canUseStorage()) {
    try {
      sessionStorage.removeItem(COMPANION_CONTEXT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  memoryState = null;
}

export function resetCompanionConversationStateForTests(): void {
  clearCompanionConversationState();
  memoryState = null;
}

export function isCompanionPendingExpired(
  pending: CompanionPendingAction,
  currentTurn: number,
): boolean {
  return currentTurn > pending.expiresAtTurn;
}
