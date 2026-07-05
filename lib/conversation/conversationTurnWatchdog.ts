/**
 * Turn watchdog — cancel stuck turns so the next message starts clean.
 */

export const TURN_WATCHDOG_TIMEOUT_MS = 9_000;

export const STUCK_TURN_RECOVERY_MESSAGE =
  "Something got tangled for a second, but I'm still here.";

export type TurnWatchdogHandle = {
  generation: number;
  turn: number;
};

let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
let activeWatchdogGeneration: number | null = null;

export function clearConversationTurnWatchdog(): void {
  if (watchdogTimer != null) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
  activeWatchdogGeneration = null;
}

export function startConversationTurnWatchdog(
  handle: TurnWatchdogHandle,
  onStuck: (handle: TurnWatchdogHandle) => void,
  timeoutMs: number = TURN_WATCHDOG_TIMEOUT_MS,
): void {
  clearConversationTurnWatchdog();
  activeWatchdogGeneration = handle.generation;
  watchdogTimer = setTimeout(() => {
    watchdogTimer = null;
    if (activeWatchdogGeneration !== handle.generation) return;
    activeWatchdogGeneration = null;
    onStuck(handle);
  }, timeoutMs);
}

export function isConversationTurnWatchdogActive(generation: number): boolean {
  return activeWatchdogGeneration === generation;
}

/** Remove empty stream placeholders, then append the stuck-turn recovery line once. */
export function appendStuckTurnRecoveryMessage<
  T extends { role: string; content: string },
>(messages: readonly T[]): T[] {
  const copy = [...messages];
  while (
    copy.length > 0 &&
    copy[copy.length - 1]?.role === "assistant" &&
    !copy[copy.length - 1]!.content.trim()
  ) {
    copy.pop();
  }
  const last = copy[copy.length - 1];
  if (last?.role === "assistant") {
    if (last.content === STUCK_TURN_RECOVERY_MESSAGE) return copy;
    if (last.content.trim()) return copy;
  }
  return [
    ...copy,
    { role: "assistant", content: STUCK_TURN_RECOVERY_MESSAGE } as T,
  ];
}
