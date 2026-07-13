/**
 * Visible Thinking chat UI rules — pure helpers for tests and SimpleChat.
 */

/** Soft presence — the flame carries the moment; no “Thinking…” software copy. */
export const CHAT_THINKING_LABEL = "" as const;

/**
 * Show the Spark presence flame only when loading has been revealed.
 * Callers delay reveal (~200ms) so fast turns never flicker.
 * Empty string = flame-only (no “Thinking…” copy).
 */
export function shouldShowChatVisibleThinking(
  isLoading: boolean,
  thinkingMessage?: string | null,
  awaitingUserConfirmation = false,
): boolean {
  if (awaitingUserConfirmation) return false;
  if (!isLoading) return false;
  return thinkingMessage !== null && thinkingMessage !== undefined;
}

export function chatVisibleThinkingCopy(
  thinkingMessage?: string | null,
): string {
  const trimmed = thinkingMessage?.trim();
  if (!trimmed || /^thinking…?$/i.test(trimmed) || /^thinking\.\.\.?$/i.test(trimmed)) {
    return "";
  }
  return trimmed;
}

/** Identity Bar shows portrait animation only — chat owns thinking copy. */
export function identityBarShowsThinkingCopy(
  isThinking: boolean,
  _thinkingMessage?: string | null,
): boolean {
  return false;
}
