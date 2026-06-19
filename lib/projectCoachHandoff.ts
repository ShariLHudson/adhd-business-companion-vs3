/**
 * Project coach handoff — first message when Work With Shari opens beside a project.
 */

import type { WorkspaceContext } from "./workspaceAwareness";
import type { WorkspaceFieldId } from "./workspaceAwareness";
import type { ProjectCoachAutoStart } from "./projectCoachAutoStart";
import { buildProjectCoachAutoStart } from "./projectCoachAutoStart";
import type {
  ProjectCoachFocus,
  ProjectCoachNeed,
  ProjectCoachSelection,
} from "./projectCoachChoices";
import {
  coachFocusLabel,
  coachNeedLabel,
  PROJECT_COACH_MORE_NEEDS,
  PROJECT_COACH_PRIMARY_NEEDS,
} from "./projectCoachChoices";

/** Legacy topic id — still used in coaching session routing. */
export type ProjectCoachTopic =
  | "title"
  | "outcome"
  | "goals"
  | "tasks"
  | "planning"
  | "roadblocks"
  | "notes"
  | "appointments"
  | "files"
  | "other";

/** @deprecated Use PROJECT_COACH_PRIMARY_NEEDS / PROJECT_COACH_MORE_NEEDS */
export const PROJECT_COACH_TOPICS: {
  id: ProjectCoachTopic;
  label: string;
  emoji: string;
}[] = [
  ...PROJECT_COACH_PRIMARY_NEEDS.map((n) => ({
    id: n.id as ProjectCoachTopic,
    label: n.label,
    emoji: n.emoji,
  })),
  ...PROJECT_COACH_MORE_NEEDS.map((n) => ({
    id: n.id as ProjectCoachTopic,
    label: n.label,
    emoji: n.emoji,
  })),
];

function isUntitledName(name: string | null | undefined): boolean {
  const n = name?.trim() ?? "";
  return !n || /^untitled/i.test(n);
}

export type ProjectCoachHandoff = ProjectCoachAutoStart & {
  showTopicPicker?: boolean;
};

/** Context-aware opening — project name + topic picker when a real project is selected. */
export function buildProjectCoachHandoff(
  ctx: WorkspaceContext | null,
): ProjectCoachHandoff | null {
  if (!ctx || ctx.section !== "projects") return null;

  if (ctx.view === "detail" && ctx.selectedItemId) {
    const name = ctx.selectedItemName?.trim() ?? "";
    if (!isUntitledName(name)) {
      return {
        content: `I see you're working on ${name}. What kind of help do you need right now?`,
        focusField: null,
        showTopicPicker: true,
      };
    }
  }

  return buildProjectCoachAutoStart(ctx);
}

export function topicFromSelection(
  selection: ProjectCoachSelection,
): ProjectCoachTopic {
  return selection.need as ProjectCoachTopic;
}

function projectSuffix(ctx: WorkspaceContext | null): string {
  const name = ctx?.selectedItemName?.trim();
  if (!name || isUntitledName(name)) return "";
  return ` for ${name}`;
}

export function projectCoachTopicOpener(
  selection: ProjectCoachSelection,
  ctx: WorkspaceContext | null,
): { content: string; focusField: WorkspaceFieldId | null } {
  const suffix = projectSuffix(ctx);
  const { need, focus } = selection;

  if (need === "outcome" && focus) {
    switch (focus) {
      case "outcome-final":
        return {
          content: `[[focus:project-goal]]Let's name the final goal${suffix}. What does done look like when this project is complete?`,
          focusField: "project-goal",
        };
      case "outcome-12-week":
        return {
          content: `What should be true in 12 weeks${suffix}? One clear sentence.`,
          focusField: "project-goal",
        };
      case "outcome-weekly":
        return {
          content: `What weekly milestones would show you're on track${suffix}? Start with this week.`,
          focusField: null,
        };
      case "outcome-metrics":
        return {
          content: `How will you know this worked${suffix}? Name one or two success metrics.`,
          focusField: null,
        };
      default:
        break;
    }
  }

  if (need === "planning" && focus) {
    switch (focus) {
      case "plan-overview":
        return {
          content: `[[focus:project-goal]]Let's shape the overview${suffix}. What's the outcome in one sentence?`,
          focusField: "project-goal",
        };
      case "plan-tasks":
        return {
          content: `[[focus:project-tasks]]Which tasks belong on the plan${suffix}? Name the first one.`,
          focusField: "project-tasks",
        };
      case "plan-appointments":
        return {
          content: `Which momentum appointment would move this forward${suffix}? When and for how long?`,
          focusField: null,
        };
      case "plan-notes":
        return {
          content: `What should we capture in notes${suffix}? A quick brain dump is fine.`,
          focusField: null,
        };
      case "plan-other":
        return {
          content: `What part of the plan feels unclear${suffix}? Tell me in one sentence.`,
          focusField: null,
        };
      default:
        break;
    }
  }

  if (need === "tasks" && focus) {
    switch (focus) {
      case "task-break-down":
        return {
          content: `[[focus:project-tasks]]Which task feels too big${suffix}? We'll break it into smaller steps.`,
          focusField: "project-tasks",
        };
      case "task-prioritize":
        return {
          content: `Which tasks are on your plate${suffix}? We'll pick what matters most first.`,
          focusField: "project-tasks",
        };
      case "task-appointments":
        return {
          content: `What task deserves a momentum appointment${suffix}? Name it and we'll place it on your day.`,
          focusField: null,
        };
      case "task-estimate":
        return {
          content: `Which task are you unsure about time-wise${suffix}? We'll estimate effort together.`,
          focusField: "project-tasks",
        };
      case "task-next-action":
        return {
          content: `[[focus:project-next-action]]What's the single next action${suffix}? The smallest honest step.`,
          focusField: "project-next-action",
        };
      default:
        break;
    }
  }

  switch (need) {
    case "outcome":
      return {
        content: `[[focus:project-goal]]What does success look like${suffix}? One clear sentence.`,
        focusField: "project-goal",
      };
    case "goals":
      return {
        content: `[[focus:project-goals]]Let's add one clear goal${suffix}. What's the first goal?`,
        focusField: "project-goals",
      };
    case "tasks":
      return {
        content: `[[focus:project-tasks]]What's the first task that moves this forward? We'll add it to your project.`,
        focusField: "project-tasks",
      };
    case "planning":
      return {
        content: `Let's sketch a light plan${suffix}. What's the next milestone or phase you're trying to reach?`,
        focusField: null,
      };
    case "roadblocks":
      return {
        content: `What's blocking you${suffix}? One sentence — we'll find the smallest way through.`,
        focusField: null,
      };
    case "notes":
      return {
        content: `What should we jot in project notes${suffix}? Quick bullets are fine.`,
        focusField: null,
      };
    case "appointments":
      return {
        content: `What momentum appointment would help${suffix}? When and what will you work on?`,
        focusField: null,
      };
    case "files":
      return {
        content: `What file or link should we track${suffix}? Tell me what to add or organize.`,
        focusField: null,
      };
    default:
      return {
        content: `I'm with you on this project${suffix}. What do you need help with right now?`,
        focusField: null,
      };
  }
}

/** @deprecated Use coachNeedLabel */
export function projectCoachTopicLabel(topic: ProjectCoachTopic): string {
  return coachNeedLabel(topic as ProjectCoachNeed);
}

export type { ProjectCoachFocus, ProjectCoachNeed, ProjectCoachSelection };

export function projectCoachSelectionLabel(
  selection: ProjectCoachSelection,
): string {
  if (selection.focus) {
    return `${coachNeedLabel(selection.need)} — ${coachFocusLabel(selection.focus)}`;
  }
  return coachNeedLabel(selection.need);
}
