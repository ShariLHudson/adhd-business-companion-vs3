/**
 * Visible Thinking chat UI rules — pure helpers for tests and SimpleChat.
 */

export function shouldShowChatVisibleThinking(
  isLoading: boolean,
  thinkingMessage: string | null | undefined,
): boolean {
  return Boolean(isLoading && thinkingMessage?.trim());
}

/** Identity Bar shows portrait animation only — chat owns thinking copy. */
export function identityBarShowsThinkingCopy(
  isThinking: boolean,
  _thinkingMessage?: string | null,
): boolean {
  return false;
}
