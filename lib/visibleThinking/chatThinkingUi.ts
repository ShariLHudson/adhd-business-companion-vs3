/**
 * Visible Thinking chat UI rules — pure helpers for tests and SimpleChat.
 */

export function shouldShowChatVisibleThinking(
  isLoading: boolean,
  _thinkingMessage?: string | null,
): boolean {
  return isLoading;
}

/** Fallback copy until adaptive thinking lines appear. */
export function chatVisibleThinkingCopy(
  thinkingMessage: string | null | undefined,
): string {
  const trimmed = thinkingMessage?.trim();
  return trimmed || "…";
}

/** Identity Bar shows portrait animation only — chat owns thinking copy. */
export function identityBarShowsThinkingCopy(
  isThinking: boolean,
  _thinkingMessage?: string | null,
): boolean {
  return false;
}
