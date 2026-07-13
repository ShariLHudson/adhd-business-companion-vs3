/**
 * Chat request interruption — newer member messages supersede in-flight AI turns.
 * Deterministic local replies never need this; only the companion-chat API path does.
 */

export const CHAT_REQUEST_ABORTED = "companion-chat-aborted";
export const CHAT_REQUEST_TIMEOUT = "companion-chat-timeout";

export function isChatRequestAbortError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message === CHAT_REQUEST_ABORTED ||
    err.message === CHAT_REQUEST_TIMEOUT ||
    err.name === "AbortError"
  );
}

/** True when this turn was superseded by a newer send (or aborted by the member). */
export function isChatRequestSuperseded(
  sendGeneration: number,
  currentGeneration: number,
): boolean {
  return sendGeneration !== currentGeneration;
}

/**
 * Abort the previous in-flight companion-chat request so the newest message wins.
 * Returns a fresh AbortController for the new turn (or null when not starting an API call yet).
 */
export function supersedeInFlightChatRequest(
  previous: AbortController | null,
): void {
  if (!previous) return;
  try {
    previous.abort();
  } catch {
    /* ignore */
  }
}
