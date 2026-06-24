/** Plan My Day — same plan, multiple views. */

export type PlanningViewMode =
  | "list"
  | "timeline"
  | "cards"
  | "kanban";

export type PlanItemColumn = "ready" | "today" | "doing" | "done" | "parked";

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
  /** Higher = shown first when multiple items are Doing */
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
  { id: "ready", label: "Considering Today", hint: "Ideas still on your radar" },
  { id: "today", label: "Today's Focus", hint: "What matters most today" },
  { id: "doing", label: "In Progress", hint: "What you are working on now" },
];

export const PLANNING_VIEW_OPTIONS: {
  id: PlanningViewMode;
  label: string;
  desc: string;
}[] = [
  {
    id: "list",
    label: "List",
    desc: "Today's focus at a glance — a daily decision list, not long-term storage.",
  },
  {
    id: "timeline",
    label: "Timeline",
    desc: "See what fits in the time you actually have today.",
  },
  {
    id: "cards",
    label: "Cards",
    desc: "Visual separation for what belongs in today's plan.",
  },
  {
    id: "kanban",
    label: "Kanban",
    desc: "Considering Today → Today's Focus → In Progress — complete to archive.",
  },
];
