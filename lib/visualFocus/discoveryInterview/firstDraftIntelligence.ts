/**
 * Spark First Draft Intelligence (244).
 * Shared thinking order + member-facing draft line.
 */

/** Spark thinking order before / while building a first draft. */
export const SPARK_FIRST_DRAFT_THINKING_ORDER = [
  "Purpose",
  "Themes",
  "Natural groups",
  "Relationships",
  "Priorities",
  "Missing pieces",
  "Risks",
  "Opportunities",
  "Suggested next steps",
] as const;

export const SPARK_FIRST_DRAFT_MEMBER_LINE =
  "I think this is a strong starting point. We can refine it together." as const;

export type FirstDraftRequirements = {
  logicallyGrouped: boolean;
  duplicatesRemoved: boolean;
  gapsHighlighted: boolean;
  missingBranchesSuggested: boolean;
  groupingExplained: boolean;
};

export function evaluateFirstDraftRequirements(input: {
  explanation: string;
  duplicates: string[];
  suggestedGaps: string[];
  suggestedBranches: string[];
  branchCount: number;
}): FirstDraftRequirements {
  return {
    logicallyGrouped: input.branchCount > 0 && input.explanation.length > 0,
    duplicatesRemoved: true,
    gapsHighlighted: input.suggestedGaps.length > 0 || input.branchCount > 0,
    missingBranchesSuggested: input.suggestedBranches.length > 0,
    groupingExplained: /group|centered|folded|prompt/i.test(input.explanation),
  };
}

export function formatFirstDraftReviewMessage(explanation: string): string {
  const trimmed = explanation.trim();
  if (!trimmed) return SPARK_FIRST_DRAFT_MEMBER_LINE;
  if (trimmed.includes(SPARK_FIRST_DRAFT_MEMBER_LINE)) return trimmed;
  return `${trimmed} ${SPARK_FIRST_DRAFT_MEMBER_LINE}`;
}
