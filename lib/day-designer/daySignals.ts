/**
 * Gather day-planning signals from app state — no forced structure.
 */

import type { EmotionalState } from "@/lib/companionEmotions";
import {
  getDayState,
  getOpenProjectTasks,
  getProjects,
  getTimeBlocks,
  type DayLevel,
  type Project,
} from "@/lib/companionStore";
import { filterTimeBankBlocks, DEFAULT_TIME_BANK_FILTERS } from "@/lib/timeBank";
import type { ActivationState } from "@/lib/activation/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { LoopType } from "@/lib/loop-intelligence/types";
import type { DayDesignerContext, DayDesignerInput, DayPriority } from "./types";

function timeOfDay(
  hour: number,
): "morning" | "afternoon" | "evening" {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function projectToPriority(project: Project): DayPriority {
  const urgent =
    project.status === "active-focus" || project.horizon === "now";
  return {
    id: project.id,
    label: project.nextAction?.trim()
      ? `${project.name}: ${project.nextAction}`
      : project.name,
    estimatedMinutes: 30,
    urgency: urgent ? "high" : "medium",
    energyNeeded:
      project.status === "active-focus" ? "high" : "medium",
    importance: urgent ? "high" : "medium",
  };
}

export function gatherDayDesignerContext(
  partial: DayDesignerInput = {},
): DayDesignerContext {
  const now = partial.now ?? new Date();
  const hour = now.getHours();
  const day = getDayState();
  const projects = getProjects().filter(
    (p) =>
      p.status !== "completed" &&
      p.status !== "paused" &&
      (p.horizon === "now" || p.status === "active-focus"),
  );

  const bankBlocks = filterTimeBankBlocks(
    getTimeBlocks(),
    DEFAULT_TIME_BANK_FILTERS,
  ).slice(0, 6);

  const timeBankPriorities: DayPriority[] = bankBlocks.map((b) => {
    const proj = b.projectId
      ? projects.find((p) => p.id === b.projectId)
      : undefined;
    const prefix = proj ? `${proj.name}: ` : "";
    return {
      id: `bank-${b.id}`,
      label: `${prefix}${b.title}`,
      estimatedMinutes: b.durationMin,
      urgency: "medium",
      energyNeeded:
        b.energy === "high" ? "high" : b.energy === "low" ? "low" : "medium",
      importance: b.projectId ? "high" : "medium",
    };
  });

  const projectTaskPriorities: DayPriority[] = getOpenProjectTasks(8).map(
    (task) => {
      const proj = projects.find((p) => p.id === task.projectId);
      return {
        id: `task-${task.id}`,
        label: proj ? `${proj.name} → ${task.title}` : task.title,
        estimatedMinutes: task.kind === "subtask" ? 15 : 25,
        urgency: "medium",
        energyNeeded: "medium",
        importance: "high",
      };
    },
  );

  return {
    now,
    emotionalState: partial.emotionalState ?? "unclear",
    cognitiveLoadLevel: partial.cognitiveLoadLevel ?? null,
    activationState: partial.activationState ?? null,
    primaryLoopType: partial.primaryLoopType ?? null,
    dayEnergy: day?.energy ?? null,
    dayOverwhelm: day?.overwhelm ?? null,
    projectPriorities: projects.slice(0, 5).map(projectToPriority),
    timeBankPriorities,
    projectTaskPriorities,
    timeOfDay: timeOfDay(hour),
    hour,
  };
}

export function effectiveEnergy(
  context: DayDesignerContext,
  answerEnergy?: DayLevel,
): DayLevel {
  if (answerEnergy) return answerEnergy;
  if (context.dayEnergy) return context.dayEnergy;
  if (
    context.emotionalState === "overwhelmed" ||
    context.emotionalState === "emotional"
  ) {
    return "low";
  }
  if (
    context.emotionalState === "focused" ||
    context.emotionalState === "building"
  ) {
    return "high";
  }
  return "medium";
}

export function isOverloaded(context: DayDesignerContext): boolean {
  return (
    context.cognitiveLoadLevel === "heavy" ||
    context.cognitiveLoadLevel === "overloaded" ||
    context.dayOverwhelm === "high" ||
    context.emotionalState === "overwhelmed"
  );
}

export function isStuckOrFrozen(context: DayDesignerContext): boolean {
  return (
    context.activationState === "stuck" ||
    context.activationState === "frozen" ||
    context.emotionalState === "stuck"
  );
}

export function hasActiveLoop(context: DayDesignerContext): boolean {
  return context.primaryLoopType != null;
}

export function hasCreativeEnergy(context: DayDesignerContext): boolean {
  return (
    context.emotionalState === "building" ||
    (effectiveEnergy(context) === "high" &&
      context.timeOfDay === "morning")
  );
}
