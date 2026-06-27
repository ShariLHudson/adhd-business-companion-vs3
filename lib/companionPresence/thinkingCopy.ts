import { evaluateVisibleThinking } from "../visibleThinking";

/** Quiet thinking lines — felt, not loading UI. Visible Thinking constitutional copy. */
export const COMPANION_THINKING_LINES = [
  "Give me just a second...",
  "One moment...",
  "I'm thinking about what you've shared...",
] as const;

export function companionThinkingMessage(seed = 0): string {
  return (
    evaluateVisibleThinking({
      context: { kind: "general", seed },
      elapsedMs: 1200,
    }) ?? COMPANION_THINKING_LINES[Math.abs(seed) % COMPANION_THINKING_LINES.length]
  );
}
