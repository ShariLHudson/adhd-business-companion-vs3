/**
 * Homestead calm home — conversation must become visible once the member sends.
 */

export type ChatMessageLike = { role: string; content: string };

/** Calm home hides the thread until the member starts talking. */
export function shouldShowHomesteadConversation(
  homeCalm: boolean,
  messages: readonly ChatMessageLike[],
  isLoading: boolean,
): boolean {
  if (!homeCalm) return true;
  if (isLoading) return true;
  if (messages.some((m) => m.role === "user")) return true;
  return messages.length > 0;
}

export function resolveHomesteadChatMessages<T extends ChatMessageLike>(
  homeCalm: boolean,
  messages: readonly T[],
  isLoading: boolean,
): readonly T[] {
  return shouldShowHomesteadConversation(homeCalm, messages, isLoading)
    ? messages
    : [];
}
