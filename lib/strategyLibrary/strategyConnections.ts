/**
 * Strategy Library → execution connections (128–132).
 * Strategy Library owns the record; other areas contribute with permission.
 */

import { addQuickPlanItem } from "@/lib/planMyDay/planDayItems";
import { saveProject } from "@/lib/companionStore";
import {
  createReminderFromContent,
  createRhythmFromContent,
} from "@/lib/rhythms/fromContent";
import type { Strategy } from "@/lib/strategySystem";

export type StrategyConnectionResult =
  | { ok: true; kind: string; message: string }
  | { ok: false; kind: string; message: string };

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

export function connectStrategyToProject(
  strategy: Strategy,
): StrategyConnectionResult {
  saveProject({
    name: strategy.title,
    goal: strategy.problem,
    nextAction: strategy.steps[0] ?? "",
    horizon: "now",
    status: "in-progress",
  });
  return {
    ok: true,
    kind: "project",
    message: `Connected “${strategy.title}” to a Project. Open Projects when you are ready.`,
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
