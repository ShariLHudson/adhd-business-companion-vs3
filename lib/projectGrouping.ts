import { todayStr, type Project, type ProjectStatus, type TimeBlock } from "./companionStore";

export type ProjectListGroup = "active" | "not-started" | "completed";

export const PROJECT_LIST_GROUP_LABEL: Record<ProjectListGroup, string> = {
  active: "Active Projects",
  "not-started": "Not Started",
  completed: "Completed",
};

export function projectListGroup(status: ProjectStatus): ProjectListGroup {
  if (status === "completed") return "completed";
  if (status === "not-started") return "not-started";
  return "active";
}

export function groupProjectsByList(projects: Project[]): Record<ProjectListGroup, Project[]> {
  const groups: Record<ProjectListGroup, Project[]> = {
    active: [],
    "not-started": [],
    completed: [],
  };
  for (const p of projects) {
    groups[projectListGroup(p.status)].push(p);
  }
  return groups;
}

export type TimeBlockDateGroup = "today" | "week" | "upcoming" | "bank" | "completed";

export const TIME_BLOCK_GROUP_LABEL: Record<TimeBlockDateGroup, string> = {
  today: "Today",
  week: "This Week",
  upcoming: "Upcoming",
  bank: "Time Bank",
  completed: "Completed",
};

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function timeBlockDateGroup(block: TimeBlock): TimeBlockDateGroup {
  if (block.status === "completed" || block.status === "missed" || block.status === "not-today") return "completed";
  if (!block.date) return "bank";
  const today = todayStr();
  if (block.date === today) return "today";
  if (block.date > today && block.date <= addDays(today, 6)) return "week";
  if (block.date > addDays(today, 6)) return "upcoming";
  return "upcoming";
}

export function groupTimeBlocksByDate(
  blocks: TimeBlock[],
): Record<TimeBlockDateGroup, TimeBlock[]> {
  const groups: Record<TimeBlockDateGroup, TimeBlock[]> = {
    today: [],
    week: [],
    upcoming: [],
    bank: [],
    completed: [],
  };
  for (const b of blocks) {
    groups[timeBlockDateGroup(b)].push(b);
  }
  return groups;
}
