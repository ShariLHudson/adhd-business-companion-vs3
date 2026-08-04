/**
 * Clear My Mind — thought-level actions from Mental Landscape (PR 4C).
 */

import {
  deleteBrainDump,
  logMomentum,
  updateBrainDump,
  type BrainDumpEntry,
} from "./companionStore";
import { createOutcomeGoal } from "./goals/outcomeGoals";
import {
  routeBrainDumpEntry,
  type ClearMindRoute,
  type RouteTrustResult,
} from "./brainDumpRouting";

export type ThoughtAction =
  | "mark-done"
  | "schedule"
  | "add-to-calendar"
  | "move-to-project"
  | "convert-to-goal"
  | "plan-my-day"
  | "keep-here"
  | "delete";

export type ThoughtActionResult = RouteTrustResult & {
  action: ThoughtAction;
  /** Thought no longer appears in the active mental landscape. */
  removedFromLandscape?: boolean;
};

export const THOUGHT_ACTION_ORDER: ThoughtAction[] = [
  "mark-done",
  "schedule",
  "add-to-calendar",
  "move-to-project",
  "convert-to-goal",
  "plan-my-day",
  "keep-here",
  "delete",
];

export const THOUGHT_ACTION_LABEL: Record<ThoughtAction, string> = {
  "mark-done": "Mark Done",
  schedule: "Schedule",
  "add-to-calendar": "Add to Calendar",
  "move-to-project": "Move to Project",
  "convert-to-goal": "Convert to Goal",
  "plan-my-day": "Move to Plan My Day",
  "keep-here": "Keep Here",
  delete: "Delete",
};

const ROUTE_BY_ACTION: Partial<Record<ThoughtAction, ClearMindRoute>> = {
  schedule: "reminder",
  "add-to-calendar": "time-block",
  "move-to-project": "project",
  "plan-my-day": "plan-my-day",
  "keep-here": "done",
};

function withAction(
  result: RouteTrustResult,
  action: ThoughtAction,
  removedFromLandscape?: boolean,
): ThoughtActionResult {
  return { ...result, action, removedFromLandscape };
}

export function applyThoughtAction(
  entry: BrainDumpEntry,
  action: ThoughtAction,
): ThoughtActionResult {
  const text = entry.text.trim();
  if (!text && action !== "delete") {
    return {
      ok: false,
      headline: "Nothing to act on.",
      savedWhere: "",
      seeWhere: "",
      route: "task",
      action,
    };
  }

  if (action === "mark-done") {
    updateBrainDump(entry.id, { done: true });
    logMomentum("complete", `Done: ${text.slice(0, 60)}`);
    return {
      ok: true,
      headline: `Marked as done: "${text}"`,
      savedWhere: "Clear My Mind",
      seeWhere: "This thought is handled — it won't keep showing in your landscape.",
      route: "task",
      action,
      removedFromLandscape: true,
    };
  }

  if (action === "delete") {
    deleteBrainDump(entry.id);
    logMomentum("reset", `Removed thought: ${text.slice(0, 60)}`);
    return {
      ok: true,
      headline: `Removed: "${text}"`,
      savedWhere: "Clear My Mind",
      seeWhere: "This thought was deleted from your saved items.",
      route: "task",
      action,
      removedFromLandscape: true,
    };
  }

  if (action === "convert-to-goal") {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    const goal = createOutcomeGoal({
      statement: text.slice(0, 120),
      metric: "Progress",
      targetValue: 1,
      deadline: deadline.toISOString().slice(0, 10),
      definitionOfDone: "Converted from a Clear My Mind thought.",
      whyItMatters: text,
    });
    updateBrainDump(entry.id, {
      outcomeGoalId: goal.id,
      done: true,
      routedAction: "goal",
    });
    return {
      ok: true,
      headline: `Goal created: "${goal.statement}"`,
      savedWhere: "Growth Center → Outcome Goals™",
      seeWhere: "Open Growth to track progress on this outcome.",
      route: "task",
      action,
      removedFromLandscape: true,
    };
  }

  const route = ROUTE_BY_ACTION[action];
  if (!route) {
    return {
      ok: false,
      headline: "Unknown action.",
      savedWhere: "",
      seeWhere: "",
      route: "task",
      action,
    };
  }

  const result = routeBrainDumpEntry(entry, route);
  const removedFromLandscape = route === "project" && result.ok;
  return withAction(result, action, removedFromLandscape);
}

export function thoughtActionOpensSection(
  action: ThoughtAction,
): "time-block" | "projects" | "plan-my-day" | "outcome-goals" | null {
  if (action === "add-to-calendar") return "time-block";
  if (action === "move-to-project") return "projects";
  if (action === "convert-to-goal") return "outcome-goals";
  if (action === "plan-my-day") return "plan-my-day";
  return null;
}
