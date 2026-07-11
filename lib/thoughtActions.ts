/**
 * Clear My Mind — thought-level actions from Mental Landscape (PR 4C).
 * Create workflows perform real work (Projects, Calendar, Journal, Decisions, etc.).
 */

import {
  deleteBrainDump,
  logMomentum,
  updateBrainDump,
  type BrainDumpEntry,
} from "./companionStore";
import {
  routeBrainDumpEntry,
  type ClearMindRoute,
  type RouteTrustResult,
} from "./brainDumpRouting";
import { createJournalEntry } from "./growthJournalStore";
import type { AppSection } from "./companionUi";

export type ThoughtAction =
  | "do-now"
  | "today"
  | "this-week"
  | "mark-done"
  | "schedule"
  | "add-to-calendar"
  | "move-to-project"
  | "research"
  | "waiting"
  | "someday"
  | "parking-lot"
  | "reference"
  | "journal"
  | "decision"
  | "workflow"
  | "plan-my-day"
  | "keep-here"
  | "delete";

export type ThoughtActionResult = RouteTrustResult & {
  action: ThoughtAction;
  /** Thought no longer appears in the active mental landscape. */
  removedFromLandscape?: boolean;
  /** Optional section to open after a successful create. */
  opensSection?: AppSection;
};

export const THOUGHT_ACTION_ORDER: ThoughtAction[] = [
  "do-now",
  "today",
  "this-week",
  "schedule",
  "move-to-project",
  "research",
  "waiting",
  "someday",
  "parking-lot",
  "reference",
  "journal",
  "decision",
  "workflow",
  "mark-done",
  "add-to-calendar",
  "plan-my-day",
  "keep-here",
  "delete",
];

export const THOUGHT_ACTION_LABEL: Record<ThoughtAction, string> = {
  "do-now": "Do Now",
  today: "Today",
  "this-week": "This Week",
  "mark-done": "Mark Done",
  schedule: "Reminder",
  "add-to-calendar": "Add to Calendar",
  "move-to-project": "Move to Project",
  research: "Research",
  waiting: "Waiting",
  someday: "Someday",
  "parking-lot": "Parking Lot",
  reference: "Reference",
  journal: "Journal",
  decision: "Decision Compass",
  workflow: "Create Workflow",
  "plan-my-day": "Move to Plan My Day",
  "keep-here": "Keep in My Thoughts",
  delete: "Delete",
};

const ROUTE_BY_ACTION: Partial<Record<ThoughtAction, ClearMindRoute>> = {
  "do-now": "plan-my-day",
  today: "plan-my-day",
  "this-week": "plan-my-day",
  schedule: "reminder",
  "add-to-calendar": "time-block",
  "move-to-project": "project",
  "plan-my-day": "plan-my-day",
  "keep-here": "done",
};

const CATEGORY_BY_ACTION: Partial<Record<ThoughtAction, string>> = {
  research: "Research",
  waiting: "Waiting",
  someday: "Someday",
  "parking-lot": "Parking Lot",
  reference: "Reference",
};

function withAction(
  result: RouteTrustResult,
  action: ThoughtAction,
  removedFromLandscape?: boolean,
  opensSection?: AppSection,
): ThoughtActionResult {
  return { ...result, action, removedFromLandscape, opensSection };
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

  if (action === "journal") {
    const { ok } = createJournalEntry({
      body: text,
      title: text.slice(0, 80),
      type: "journal",
      sourcePage: "clear_my_mind",
      tags: ["clear-my-mind"],
      originatedFromId: entry.id,
    });
    updateBrainDump(entry.id, {
      category: "Journal",
      topic: "Journal",
      routedAction: "journal",
      sorted: true,
    });
    logMomentum("note", `Journal: ${text.slice(0, 60)}`);
    return {
      ok,
      headline: ok
        ? `Saved to Journal: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`
        : "Couldn't save to Journal.",
      savedWhere: "Journal Gazebo",
      seeWhere: "Open **Journal** to keep writing.",
      route: "done",
      action,
      opensSection: "growth-journal",
    };
  }

  if (action === "decision") {
    updateBrainDump(entry.id, {
      category: "Decision",
      topic: "Decision",
      routedAction: "decision",
      sorted: true,
    });
    logMomentum("note", `Decision: ${text.slice(0, 60)}`);
    return {
      ok: true,
      headline: `Opening Decision Compass with this thought.`,
      savedWhere: "Decision Compass",
      seeWhere: "We'll work the decision there — your thought is tagged.",
      route: "done",
      action,
      opensSection: "decision-compass",
    };
  }

  if (action === "workflow") {
    updateBrainDump(entry.id, {
      category: "Workflow",
      topic: "Workflow",
      routedAction: "workflow",
      sorted: true,
    });
    logMomentum("note", `Workflow: ${text.slice(0, 60)}`);
    return {
      ok: true,
      headline: `Opening Create with this thought as a seed.`,
      savedWhere: "Create",
      seeWhere: "Continue in **Create** — your thought is ready to shape.",
      route: "done",
      action,
      opensSection: "content-generator",
    };
  }

  const category = CATEGORY_BY_ACTION[action];
  if (category) {
    updateBrainDump(entry.id, { category, topic: category });
    logMomentum("note", `${category}: ${text.slice(0, 60)}`);
    return {
      ok: true,
      headline: `Moved to ${category}: "${text}"`,
      savedWhere: "Clear My Mind",
      seeWhere: `You'll find this under ${category}.`,
      route: "task",
      action,
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
  const opensSection = thoughtActionOpensSection(action) ?? undefined;
  return withAction(result, action, removedFromLandscape, opensSection ?? undefined);
}

export function thoughtActionOpensSection(
  action: ThoughtAction,
): AppSection | null {
  if (action === "add-to-calendar") return "time-block";
  if (action === "schedule") return null;
  if (action === "move-to-project") return "projects";
  if (
    action === "plan-my-day" ||
    action === "do-now" ||
    action === "today" ||
    action === "this-week"
  ) {
    return "plan-my-day";
  }
  if (action === "journal") return "growth-journal";
  if (action === "decision") return "decision-compass";
  if (action === "workflow") return "content-generator";
  return null;
}
