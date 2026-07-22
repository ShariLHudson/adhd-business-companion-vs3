/**
 * Board outcome actions after a Decision Record (Prompt 145 + simplification).
 * At most three visible finish-line choices; less common actions live under More.
 */

export type BoardOutcomePrimaryActionId = "use-next-step";

export type BoardOutcomeNextStepChoiceId =
  | "add-to-plan"
  | "add-to-project";

export type BoardOutcomeSecondaryActionId =
  | "save-decision"
  | "add-to-plan"
  | "add-to-project"
  | "create-reminder"
  | "save-to-evidence"
  | "export"
  | "print"
  | "delete-discussion"
  /** @deprecated Prefer save-decision / structured record — kept for callers mid-migration */
  | "record-as-decision"
  /** @deprecated Prefer add-to-project */
  | "add-to-current-project"
  /** @deprecated Prefer add-to-plan */
  | "add-to-plan-my-day"
  /** @deprecated Consolidated into Use This Next Step */
  | "create-task"
  | "share-board-history"
  | "discuss-chamber-member"
  | "view-related-strategy";

export const BOARD_OUTCOME_PRIMARY = {
  id: "use-next-step" as const,
  label: "Use This Next Step",
  testId: "board-outcome-use-recommendation",
};

/** Visible finish-line actions when the decision is not yet saved. */
export const BOARD_OUTCOME_VISIBLE_SECONDARY: readonly {
  id: BoardOutcomeSecondaryActionId;
  label: string;
  testId: string;
}[] = [
  {
    id: "save-decision",
    label: "Save Decision",
    testId: "board-outcome-record-decision",
  },
] as const;

/** Contextual choice under Use This Next Step */
export const BOARD_OUTCOME_NEXT_STEP_CHOICES: readonly {
  id: BoardOutcomeNextStepChoiceId;
  label: string;
  testId: string;
  hint: string;
}[] = [
  {
    id: "add-to-plan",
    label: "Add to Plan",
    testId: "board-outcome-plan-my-day",
    hint: "For work intended for today or a specific day.",
  },
  {
    id: "add-to-project",
    label: "Add to Project",
    testId: "board-outcome-add-project",
    hint: "When the action belongs to a multi-step project.",
  },
] as const;

/** Less common actions — More menu only */
export const BOARD_OUTCOME_MORE: readonly {
  id: BoardOutcomeSecondaryActionId;
  label: string;
  testId: string;
}[] = [
  {
    id: "create-reminder",
    label: "Create Reminder",
    testId: "board-outcome-create-reminder",
  },
  {
    id: "save-to-evidence",
    label: "Save to Evidence",
    testId: "board-outcome-save-evidence",
  },
  {
    id: "export",
    label: "Export",
    testId: "board-outcome-export",
  },
  {
    id: "print",
    label: "Print",
    testId: "board-outcome-print",
  },
  {
    id: "delete-discussion",
    label: "Delete Discussion",
    testId: "board-outcome-delete",
  },
] as const;

/** @deprecated Use BOARD_OUTCOME_VISIBLE_SECONDARY + BOARD_OUTCOME_MORE */
export const BOARD_OUTCOME_SECONDARY: readonly {
  id: BoardOutcomeSecondaryActionId;
  label: string;
  testId: string;
}[] = [
  ...BOARD_OUTCOME_VISIBLE_SECONDARY,
  {
    id: "add-to-project",
    label: "Add to Project",
    testId: "board-outcome-add-project",
  },
  {
    id: "add-to-plan",
    label: "Add to Plan",
    testId: "board-outcome-plan-my-day",
  },
  ...BOARD_OUTCOME_MORE,
] as const;

export function recommendNextStepDestination(params: {
  hasProjectContext?: boolean;
  mentionsTodayOrDay?: boolean;
}): BoardOutcomeNextStepChoiceId {
  if (params.hasProjectContext && !params.mentionsTodayOrDay) {
    return "add-to-project";
  }
  if (params.mentionsTodayOrDay) return "add-to-plan";
  return params.hasProjectContext ? "add-to-project" : "add-to-plan";
}

/** Progressive disclosure — reveal in batches of three (legacy callers). */
export function visibleSecondaryOutcomeActions(
  revealedCount: number,
): (typeof BOARD_OUTCOME_SECONDARY)[number][] {
  const n = Math.max(0, Math.min(revealedCount, BOARD_OUTCOME_SECONDARY.length));
  return BOARD_OUTCOME_SECONDARY.slice(0, n);
}

export function nextRevealCount(current: number): number {
  if (current <= 0) return 3;
  return Math.min(current + 3, BOARD_OUTCOME_SECONDARY.length);
}
