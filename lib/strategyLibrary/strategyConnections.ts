/**
 * Strategy Library → execution connections (128–132, Prompt 143).
 * Strategy Library owns the record; other areas contribute with permission.
 * Never silently create a new Project — Current Focus is the default.
 */

import { addQuickPlanItem } from "@/lib/planMyDay/planDayItems";
import {
  getProjects,
  saveProjectWithResult,
} from "@/lib/companionProjectsStore";
import {
  createReminderFromContent,
  createRhythmFromContent,
} from "@/lib/rhythms/fromContent";
import type { Strategy } from "@/lib/strategySystem";
import { pickActiveProject } from "./pickActiveProject";

export type StrategyConnectionResult =
  | {
      ok: true;
      kind: string;
      message: string;
      projectId?: string;
      createdProject?: boolean;
    }
  | {
      ok: false;
      kind: string;
      message: string;
      /** Member must choose or explicitly create */
      needsProjectChoice?: boolean;
    };

export type ConnectStrategyToProjectOptions = {
  /** Only when the member explicitly asks for a new Project */
  createNew?: boolean;
  /** Optional explicit project id (picker) */
  projectId?: string;
};

export function connectStrategyStepToPlanMyDay(
  strategy: Strategy,
  stepIndex = 0,
): StrategyConnectionResult {
  const step = strategy.steps[stepIndex] ?? strategy.title;
  const title = step.slice(0, 120);
  addQuickPlanItem({
    title,
    column: "today",
    notes: `From strategy: ${strategy.title}`,
    source: "manual",
    durationMinutes: strategy.timeMin,
  });
  return {
    ok: true,
    kind: "plan-my-day",
    message: `Added “${title}” to today’s plan.`,
  };
}

/**
 * Connect a strategy to a Project.
 * Default: Current Focus. Never create a project unless createNew is true.
 */
export function connectStrategyToProject(
  strategy: Strategy,
  options: ConnectStrategyToProjectOptions = {},
): StrategyConnectionResult {
  if (options.createNew === true) {
    const result = saveProjectWithResult({
      name: strategy.title,
      goal: strategy.problem,
      nextAction: strategy.steps[0] ?? "",
      horizon: "now",
      status: "in-progress",
      notes: `Started from Strategy Library: ${strategy.title}`,
    });
    if (!result.persisted || !result.project) {
      return {
        ok: false,
        kind: "project",
        message: "I couldn’t create that Project just now. Try again in a moment.",
      };
    }
    return {
      ok: true,
      kind: "project",
      message: `Started a new Project for “${strategy.title}”. Open Projects when you’re ready.`,
      projectId: result.project.id,
      createdProject: true,
    };
  }

  const target = options.projectId
    ? getProjects().find((p) => p.id === options.projectId && !p.archived)
    : pickActiveProject();

  if (!target) {
    return {
      ok: false,
      kind: "project",
      needsProjectChoice: true,
      message:
        "There’s no Current Focus project yet. Open Projects to choose one — or ask me to start a new Project.",
    };
  }

  const strategyLine = `Strategy: ${strategy.title}`;
  const existingNotes = (target.notes ?? "").trim();
  const notes = existingNotes.includes(strategyLine)
    ? existingNotes
    : [existingNotes, strategyLine].filter(Boolean).join("\n");
  const nextAction =
    (strategy.steps[0] ?? strategy.title).slice(0, 200) || target.nextAction;

  const result = saveProjectWithResult({
    id: target.id,
    nextAction,
    notes,
    status:
      target.status === "not-started" || target.status === "paused"
        ? "in-progress"
        : target.status,
  });

  if (!result.persisted) {
    return {
      ok: false,
      kind: "project",
      message: "I couldn’t update that Project just now. Try again in a moment.",
    };
  }

  return {
    ok: true,
    kind: "project",
    message: `Connected “${strategy.title}” to your Current Focus: ${target.name}.`,
    projectId: target.id,
    createdProject: false,
  };
}

export function connectStrategyStepToReminder(
  strategy: Strategy,
  stepIndex = 0,
): StrategyConnectionResult {
  const step = strategy.steps[stepIndex] ?? strategy.title;
  const scheduledAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toISOString();
  const result = createReminderFromContent({
    title: step.slice(0, 120),
    message: `Strategy follow-up: ${strategy.title}`,
    scheduledAt,
    source: "conversation",
  });
  if (!result.ok) {
    return {
      ok: false,
      kind: "reminder",
      message: "Could not create that reminder yet.",
    };
  }
  return {
    ok: true,
    kind: "reminder",
    message: result.duplicate
      ? "A similar reminder already exists — I kept that one."
      : `Reminder set for tomorrow: “${step.slice(0, 80)}”.`,
  };
}

export function connectStrategyToRhythm(
  strategy: Strategy,
): StrategyConnectionResult {
  const title = `Review: ${strategy.title}`.slice(0, 120);
  const result = createRhythmFromContent({
    title,
    details: strategy.problem,
    cadence: "weekly",
    source: "conversation",
    category: "business",
  });
  if (!result.ok) {
    return {
      ok: false,
      kind: "rhythm",
      message: result.ask ?? "Could not create that rhythm yet.",
    };
  }
  return {
    ok: true,
    kind: "rhythm",
    message: result.duplicate
      ? "A similar rhythm already exists — I kept that one."
      : `Weekly rhythm created: “${title}”.`,
  };
}
