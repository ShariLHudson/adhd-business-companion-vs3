/**
 * Project coach — two-level choices (help need → specific focus).
 */

export type ProjectCoachNeed =
  | "outcome"
  | "planning"
  | "tasks"
  | "roadblocks"
  | "goals"
  | "notes"
  | "appointments"
  | "files"
  | "other";

export type ProjectCoachFocus =
  | "outcome-final"
  | "outcome-12-week"
  | "outcome-weekly"
  | "outcome-metrics"
  | "plan-overview"
  | "plan-tasks"
  | "plan-appointments"
  | "plan-notes"
  | "plan-other"
  | "task-break-down"
  | "task-prioritize"
  | "task-appointments"
  | "task-estimate"
  | "task-next-action";

export type ProjectCoachSelection = {
  need: ProjectCoachNeed;
  focus?: ProjectCoachFocus;
};

export type CoachNeedOption = {
  id: ProjectCoachNeed;
  label: string;
  emoji: string;
};

export type CoachFocusOption = {
  id: ProjectCoachFocus;
  label: string;
};

export const PROJECT_COACH_PRIMARY_NEEDS: CoachNeedOption[] = [
  { id: "outcome", label: "Outcome", emoji: "🎯" },
  { id: "planning", label: "Planning", emoji: "🗺️" },
  { id: "tasks", label: "Tasks", emoji: "✅" },
  { id: "roadblocks", label: "Roadblocks", emoji: "🚧" },
];

export const PROJECT_COACH_MORE_NEEDS: CoachNeedOption[] = [
  { id: "goals", label: "Goals", emoji: "🎯" },
  { id: "notes", label: "Notes", emoji: "📝" },
  { id: "appointments", label: "Momentum Appointments", emoji: "📅" },
  { id: "files", label: "Files", emoji: "📁" },
  { id: "other", label: "Other", emoji: "💬" },
];

const FOCUS_BY_NEED: Partial<Record<ProjectCoachNeed, CoachFocusOption[]>> = {
  planning: [
    { id: "plan-overview", label: "Overview" },
    { id: "plan-tasks", label: "Tasks" },
    { id: "plan-appointments", label: "Momentum Appointments" },
    { id: "plan-notes", label: "Notes" },
    { id: "plan-other", label: "Something Else" },
  ],
  tasks: [
    { id: "task-break-down", label: "Break work into smaller steps" },
    { id: "task-prioritize", label: "Prioritize tasks" },
    { id: "task-appointments", label: "Create momentum appointments" },
    { id: "task-estimate", label: "Estimate effort" },
    { id: "task-next-action", label: "Choose the next action" },
  ],
  outcome: [
    { id: "outcome-final", label: "Final goal" },
    { id: "outcome-12-week", label: "12-week goal" },
    { id: "outcome-weekly", label: "Weekly milestones" },
    { id: "outcome-metrics", label: "Success metrics" },
  ],
};

const FOCUS_PROMPT_BY_NEED: Partial<Record<ProjectCoachNeed, string>> = {
  planning: "What part of this project would you like to plan?",
  tasks: "What would help with tasks?",
  outcome: "Let's define success.",
};

export function coachNeedHasFocusStep(need: ProjectCoachNeed): boolean {
  return Boolean(FOCUS_BY_NEED[need]?.length);
}

export function coachFocusOptions(need: ProjectCoachNeed): CoachFocusOption[] {
  return FOCUS_BY_NEED[need] ?? [];
}

export function coachFocusPrompt(need: ProjectCoachNeed): string {
  return FOCUS_PROMPT_BY_NEED[need] ?? "What would you like to focus on?";
}

export function coachNeedLabel(need: ProjectCoachNeed): string {
  return (
    [...PROJECT_COACH_PRIMARY_NEEDS, ...PROJECT_COACH_MORE_NEEDS].find(
      (n) => n.id === need,
    )?.label ?? need
  );
}

export function coachFocusLabel(focus: ProjectCoachFocus): string {
  for (const options of Object.values(FOCUS_BY_NEED)) {
    const hit = options?.find((o) => o.id === focus);
    if (hit) return hit.label;
  }
  return focus;
}
