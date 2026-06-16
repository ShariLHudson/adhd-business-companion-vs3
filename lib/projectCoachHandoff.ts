/**
 * Project coach handoff — first message when Work With Shari opens beside a project.
 */

import type { WorkspaceContext } from "./workspaceAwareness";
import type { ProjectCoachAutoStart } from "./projectCoachAutoStart";
import { buildProjectCoachAutoStart } from "./projectCoachAutoStart";

export type ProjectCoachTopic =
  | "title"
  | "outcome"
  | "goals"
  | "tasks"
  | "planning"
  | "roadblocks"
  | "other";

export const PROJECT_COACH_TOPICS: {
  id: ProjectCoachTopic;
  label: string;
  emoji: string;
}[] = [
  { id: "title", label: "Title", emoji: "📌" },
  { id: "outcome", label: "Outcome", emoji: "🎯" },
  { id: "goals", label: "Goals", emoji: "🏁" },
  { id: "tasks", label: "Tasks", emoji: "✅" },
  { id: "planning", label: "Planning", emoji: "🗺️" },
  { id: "roadblocks", label: "Roadblocks", emoji: "🧱" },
  { id: "other", label: "Other", emoji: "💬" },
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
        content: `I see you're working on **${name}**. Would you like help with goals, tasks, planning, or next steps?`,
        focusField: null,
        showTopicPicker: true,
      };
    }
  }

  return buildProjectCoachAutoStart(ctx);
}

export function projectCoachTopicOpener(
  topic: ProjectCoachTopic,
  ctx: WorkspaceContext | null,
): { content: string; focusField: import("./workspaceAwareness").WorkspaceFieldId | null } {
  const name = ctx?.selectedItemName?.trim();
  const named = name && !isUntitledName(name) ? ` for **${name}**` : "";

  switch (topic) {
    case "title":
      return {
        content: `[[focus:project-title]]Let's work on the title${named}. What is this project ultimately trying to accomplish? (A short name is fine.)`,
        focusField: "project-title",
      };
    case "outcome":
      return {
        content: `[[focus:project-goal]]What does success look like${named}? One clear sentence.`,
        focusField: "project-goal",
      };
    case "goals":
      return {
        content: `[[focus:project-goals]]Let's add one clear goal${named}. What's the first goal?`,
        focusField: "project-goals",
      };
    case "tasks":
      return {
        content: `[[focus:project-tasks]]What's the first task that moves this forward? We'll add it to your project.`,
        focusField: "project-tasks",
      };
    case "planning":
      return {
        content: `Let's sketch a light plan${named}. What's the next milestone or phase you're trying to reach?`,
        focusField: null,
      };
    case "roadblocks":
      return {
        content: `What's blocking you${named}? One sentence — we'll find the smallest way through.`,
        focusField: null,
      };
    default:
      return {
        content: `I'm with you on this project${named}. What do you need help with right now?`,
        focusField: null,
      };
  }
}

export function projectCoachTopicLabel(topic: ProjectCoachTopic): string {
  return PROJECT_COACH_TOPICS.find((t) => t.id === topic)?.label ?? topic;
}
