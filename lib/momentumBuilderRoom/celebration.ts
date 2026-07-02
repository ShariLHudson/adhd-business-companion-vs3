/**
 * Momentum Builder™ — quiet celebration hooks (V1 architecture).
 */

import type { MomentumBuilderCelebrationKind } from "./estateIntegration";
import type { TodaysPath } from "./types";

export function resolveCelebrationKind(input: {
  todaysPath: TodaysPath | null;
  hadPathBefore: boolean;
}): MomentumBuilderCelebrationKind | null {
  if (!input.todaysPath) return null;
  if (!input.hadPathBefore) return "path_ready";
  if (input.todaysPath.firstStep) return "first_step_named";
  return null;
}

export const MOMENTUM_BUILDER_CELEBRATION_COPY = {
  path_ready: "Nice work.",
  first_step_named: "Nice work.",
  easy_win_complete: "Nice work.",
  focus_session_complete: "Nice work.",
} as const satisfies Record<MomentumBuilderCelebrationKind, string>;
