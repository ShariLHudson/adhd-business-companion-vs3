/** Plan My Day — same plan, multiple views. */

export type PlanningViewMode =
  | "list"
  | "timeline"
  | "cards"
  | "kanban"
  | "visual-focus";

export type PlanItemColumn = "ready" | "doing" | "done" | "parked";

export type PlanLifeDomain =
  | "business"
  | "health"
  | "learning"
  | "personal"
  | "relationships";

export type PlanItemPriority = "low" | "medium" | "high";

export type PlanDayItem = {
  id: string;
  title: string;
  durationMinutes?: number;
  flexible?: boolean;
  /** Life area — explicit pick or inferred from title when missing. */
  category?: PlanLifeDomain;
  priority?: PlanItemPriority;
  /** 24h HH:MM for timeline view */
  startTime?: string;
  /** YYYY-MM-DD — target day for this task */
  dueDate?: string;
  column: PlanItemColumn;
  done: boolean;
  notes?: string;
  projectId?: string;
  /** Linked momentum appointment, when seeded from a time block */
  sourceTimeBlockId?: string;
  relatedFileLabels?: string[];
  createdAt?: string;
  /** Hidden from active list until this ISO timestamp */
  snoozedUntil?: string;
  /** Completed but kept visible for reference */
  keptForReference?: boolean;
  /** Higher = shown first in Visual Focus when multiple items are Doing */
  focusRank?: number;
};

export const PLAN_PRIORITY_OPTIONS: {
  value: PlanItemPriority;
  label: string;
}[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const KANBAN_COLUMNS: {
  id: PlanItemColumn;
  label: string;
  hint: string;
}[] = [
  { id: "ready", label: "Ready", hint: "Planned but not started" },
  { id: "doing", label: "Doing", hint: "Currently being worked on" },
  { id: "done", label: "Done", hint: "Completed" },
  { id: "parked", label: "Parked", hint: "Not doing today" },
];

export const PLANNING_VIEW_OPTIONS: {
  id: PlanningViewMode;
  label: string;
  desc: string;
}[] = [
  {
    id: "list",
    label: "List",
    desc: "Simple checklist — today’s focus at a glance.",
  },
  {
    id: "timeline",
    label: "Timeline",
    desc: "See your day in time blocks.",
  },
  {
    id: "cards",
    label: "Cards",
    desc: "Visual separation with duration on each card.",
  },
  {
    id: "kanban",
    label: "Kanban",
    desc: "Ready · Doing · Done · Parked — drag tasks as you go.",
  },
  {
    id: "visual-focus",
    label: "Visual Focus",
    desc: "One thing at a time. No clutter.",
  },
];
