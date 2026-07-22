/**
 * Progressive Board outcome actions after “Use This Recommendation” (Prompt 145).
 * Primary action first; secondary options revealed after acceptance.
 */

export type BoardOutcomePrimaryActionId = "use-recommendation";

export type BoardOutcomeSecondaryActionId =
  | "add-to-current-project"
  | "add-to-plan-my-day"
  | "create-task"
  | "create-reminder"
  | "save-to-evidence"
  | "record-as-decision"
  | "share-board-history"
  | "discuss-chamber-member"
  | "view-related-strategy";

export const BOARD_OUTCOME_PRIMARY = {
  id: "use-recommendation" as const,
  label: "Use This Recommendation",
  testId: "board-outcome-use-recommendation",
};

export const BOARD_OUTCOME_SECONDARY: readonly {
  id: BoardOutcomeSecondaryActionId;
  label: string;
  testId: string;
}[] = [
  {
    id: "add-to-current-project",
    label: "Add to Current Project",
    testId: "board-outcome-add-project",
  },
  {
    id: "add-to-plan-my-day",
    label: "Add to Plan My Day",
    testId: "board-outcome-plan-my-day",
  },
  {
    id: "create-task",
    label: "Create a Task",
    testId: "board-outcome-create-task",
  },
  {
    id: "create-reminder",
    label: "Create a Reminder",
    testId: "board-outcome-create-reminder",
  },
  {
    id: "save-to-evidence",
    label: "Save to Evidence",
    testId: "board-outcome-save-evidence",
  },
  {
    id: "record-as-decision",
    label: "Record as a Decision",
    testId: "board-outcome-record-decision",
  },
  {
    id: "share-board-history",
    label: "Share with My Board History",
    testId: "board-outcome-board-history",
  },
  {
    id: "discuss-chamber-member",
    label: "Discuss with a Chamber Member",
    testId: "board-outcome-chamber",
  },
  {
    id: "view-related-strategy",
    label: "View Related Strategy",
    testId: "board-outcome-strategy",
  },
] as const;

/** Progressive disclosure — reveal in batches of three. */
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
