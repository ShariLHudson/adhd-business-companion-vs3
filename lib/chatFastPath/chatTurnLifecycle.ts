/**
 * Chat turn lifecycle — every member send must finalize exactly once.
 * Loading never sticks; visible chat paths always get a reply when loading started.
 */

import { buildFailSafeChatReply } from "./chatTurnGuarantee";

export type ChatTurnState = {
  started: boolean;
  finalized: boolean;
  loadingStarted: boolean;
  assistantReplied: boolean;
};

export function createChatTurnState(): ChatTurnState {
  return {
    started: false,
    finalized: false,
    loadingStarted: false,
    assistantReplied: false,
  };
}

export function markChatTurnStarted(state: ChatTurnState): void {
  state.started = true;
}

export function markChatTurnLoading(state: ChatTurnState): void {
  state.loadingStarted = true;
}

export function markAssistantReplied(state: ChatTurnState): void {
  state.assistantReplied = true;
}

export function isChatTurnFinalized(state: ChatTurnState): boolean {
  return state.finalized;
}

export function finalizeChatTurn(
  state: ChatTurnState,
  onFinalize: () => void,
): void {
  if (state.finalized) return;
  state.finalized = true;
  onFinalize();
}

export function needsFailSafeAssistantReply(state: ChatTurnState): boolean {
  return state.loadingStarted && !state.assistantReplied;
}

export type GuaranteeChatTurnCompletionInput = {
  state: ChatTurnState;
  ensureVisibleReply: () => void;
  finish: () => void;
};

/**
 * Idempotent safety net — call from handleSend `finally`.
 * Adds fallback copy only when loading was shown and no assistant reply was recorded.
 */
export function guaranteeChatTurnCompletion(
  input: GuaranteeChatTurnCompletionInput,
): void {
  const { state, ensureVisibleReply, finish } = input;

  if (needsFailSafeAssistantReply(state)) {
    ensureVisibleReply();
  }

  if (!isChatTurnFinalized(state)) {
    finalizeChatTurn(state, finish);
  }
}
