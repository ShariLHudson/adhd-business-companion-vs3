/** Quiet thinking lines — felt, not loading UI. */
export const COMPANION_THINKING_LINES = [
  "Thinking…",
  "Give me a moment…",
  "Let me sit with that…",
] as const;

export function companionThinkingMessage(seed = 0): string {
  return COMPANION_THINKING_LINES[Math.abs(seed) % COMPANION_THINKING_LINES.length];
}
