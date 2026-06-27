/**
 * Relationship Protection — anti-intrusion, anti-dependency.
 * @see constitution.ts — applyRelationshipProtection
 */

import type { AssembledContext, CompanionJudgmentResult } from "./types";

export function applyRelationshipProtection(
  ctx: AssembledContext,
  judgment: CompanionJudgmentResult,
): CompanionJudgmentResult {
  if (ctx.cycleState === "protected") {
    return {
      ...judgment,
      proposals: [],
      materializeAllowed: false,
      orientation: {
        ...judgment.orientation,
        invitation: null,
      },
    };
  }

  if (ctx.dayMode === "celebration") {
    return {
      ...judgment,
      proposals: [],
      materializeAllowed: false,
    };
  }

  return judgment;
}
