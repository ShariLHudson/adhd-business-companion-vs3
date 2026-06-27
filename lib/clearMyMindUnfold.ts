/**
 * Clear My Mind post-Share unfold — gradual clarity, never instant results.
 */

export type ClearMyMindUnfoldStep =
  | "idle"
  | "received"
  | "reflecting"
  | "holding"
  | "connections"
  | "patterns"
  | "possibility";

export const CLEAR_MY_MIND_UNFOLD_ORDER: ClearMyMindUnfoldStep[] = [
  "idle",
  "received",
  "reflecting",
  "holding",
  "connections",
  "patterns",
  "possibility",
];

/** Ms after holdAck before each step activates (cumulative from received). */
export const CLEAR_MY_MIND_UNFOLD_DELAYS: Record<
  Exclude<ClearMyMindUnfoldStep, "idle">,
  number
> = {
  received: 0,
  reflecting: 700,
  holding: 1800,
  connections: 3200,
  patterns: 4800,
  possibility: 6400,
};

export function unfoldStepIndex(step: ClearMyMindUnfoldStep): number {
  return CLEAR_MY_MIND_UNFOLD_ORDER.indexOf(step);
}

export function unfoldReached(
  current: ClearMyMindUnfoldStep,
  target: ClearMyMindUnfoldStep,
): boolean {
  return unfoldStepIndex(current) >= unfoldStepIndex(target);
}

export function maxUnfoldStep(
  a: ClearMyMindUnfoldStep,
  b: ClearMyMindUnfoldStep,
): ClearMyMindUnfoldStep {
  return unfoldStepIndex(a) >= unfoldStepIndex(b) ? a : b;
}

export function nextUnfoldStep(
  current: ClearMyMindUnfoldStep,
): ClearMyMindUnfoldStep | null {
  const idx = unfoldStepIndex(current);
  if (idx < 0 || idx >= CLEAR_MY_MIND_UNFOLD_ORDER.length - 1) {
    return null;
  }
  return CLEAR_MY_MIND_UNFOLD_ORDER[idx + 1] ?? null;
}
