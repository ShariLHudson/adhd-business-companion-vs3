import { isForbiddenVisibleThinkingMessage } from "./forbidden";
import {
  messagePoolsForKind,
  tierForElapsedMs,
  VISIBLE_THINKING_REVEAL_MS,
} from "./messages";
import type { EvaluateVisibleThinkingInput } from "./types";

function pickFromPool(
  pool: readonly string[],
  seed: number,
  used: ReadonlySet<string>,
): string | null {
  if (pool.length === 0) return null;
  const start = Math.abs(seed) % pool.length;
  for (let i = 0; i < pool.length; i += 1) {
    const candidate = pool[(start + i) % pool.length]!;
    if (!used.has(candidate) && !isForbiddenVisibleThinkingMessage(candidate)) {
      return candidate;
    }
  }
  const fallback = pool.find(
    (line) => !isForbiddenVisibleThinkingMessage(line),
  );
  return fallback ?? null;
}

/**
 * Visible Thinking — returns null until reveal threshold (Relationship Before Speed).
 */
export function evaluateVisibleThinking(
  input: EvaluateVisibleThinkingInput,
): string | null {
  if (input.elapsedMs < VISIBLE_THINKING_REVEAL_MS) return null;

  const tier = tierForElapsedMs(input.elapsedMs);
  const used = input.usedMessages ?? new Set<string>();
  const pools = messagePoolsForKind(input.context.kind, {
    workspaceBeside: input.context.workspaceBeside,
  });
  const pool = pools[tier];
  const seed = (input.context.seed ?? 0) + tier.length + pool.length;
  return pickFromPool(pool, seed, used);
}
