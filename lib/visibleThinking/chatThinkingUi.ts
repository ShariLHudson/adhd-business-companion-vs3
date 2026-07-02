/**
 * Visible Thinking chat UI rules — pure helpers for tests and SimpleChat.
 */

/** Single calm label while the model responds — no rotating "still with you" copy. */
export const CHAT_THINKING_LABEL = "Thinking…" as const;

export function shouldShowChatVisibleThinking(
  isLoading: boolean,
  _thinkingMessage?: string | null,
  awaitingUserConfirmation = false,
): boolean {
  if (awaitingUserConfirmation) return false;
  return isLoading;
}

export function chatVisibleThinkingCopy(
  _thinkingMessage?: string | null,
): string {
  return CHAT_THINKING_LABEL;
}

/** Identity Bar shows portrait animation only — chat owns thinking copy. */
export function identityBarShowsThinkingCopy(
  isThinking: boolean,
  _thinkingMessage?: string | null,
): boolean {
  return false;
}
