/**
 * Conversation State — Spark remembers where the conversation is.
 */

import type { SparkConversationState } from "./types";

const STORAGE_KEY = "spark-conversation-state-v1";

const EMPTY_STATE: SparkConversationState = {
  currentRoomId: null,
  currentTask: null,
  currentWorkflow: null,
  currentDocument: null,
  currentResearch: null,
  currentExpert: null,
  currentVisualModel: null,
  conversationGoal: null,
  activeCapabilityId: null,
  discoveryComplete: false,
  updatedAt: new Date(0).toISOString(),
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readConversationState(): SparkConversationState {
  if (!canUseStorage()) return { ...EMPTY_STATE };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    return { ...EMPTY_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function writeConversationState(
  patch: Partial<SparkConversationState>,
): SparkConversationState {
  const next: SparkConversationState = {
    ...readConversationState(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (canUseStorage()) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }
  return next;
}

export function clearConversationWorkflow(): SparkConversationState {
  return writeConversationState({
    currentTask: null,
    currentWorkflow: null,
    currentDocument: null,
    currentResearch: null,
    currentExpert: null,
    currentVisualModel: null,
    activeCapabilityId: null,
    discoveryComplete: false,
  });
}

export function setConversationGoal(goal: string | null): SparkConversationState {
  return writeConversationState({ conversationGoal: goal });
}

export function setActiveCapability(
  capabilityId: string | null,
  extras?: Partial<SparkConversationState>,
): SparkConversationState {
  return writeConversationState({
    activeCapabilityId: capabilityId,
    ...extras,
  });
}

export function setCurrentRoom(roomId: string | null): SparkConversationState {
  return writeConversationState({ currentRoomId: roomId });
}

/** True when we already know this — avoid re-asking. */
export function conversationAlreadyKnows(
  slot: keyof Pick<
    SparkConversationState,
    | "currentRoomId"
    | "currentTask"
    | "conversationGoal"
    | "activeCapabilityId"
    | "currentDocument"
  >,
): boolean {
  const state = readConversationState();
  const value = state[slot];
  return typeof value === "string" && value.trim().length > 0;
}

export function conversationStateHint(): string | null {
  const s = readConversationState();
  const parts: string[] = [];
  if (s.conversationGoal) parts.push(`Goal: ${s.conversationGoal}`);
  if (s.activeCapabilityId) parts.push(`Capability: ${s.activeCapabilityId}`);
  if (s.currentRoomId) parts.push(`Room: ${s.currentRoomId}`);
  if (s.currentDocument) parts.push(`Document: ${s.currentDocument}`);
  if (s.currentWorkflow) parts.push(`Workflow: ${s.currentWorkflow}`);
  if (!parts.length) return null;
  return `Conversation continuity (do not restart or re-ask): ${parts.join(" · ")}`;
}
