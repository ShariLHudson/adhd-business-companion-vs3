// Founder Ecosystem — Phase 16 Success Model (digital twin).
// What behaviors precede successful outcomes for THIS founder — time blocking,
// breaking tasks down, project planning, daily check-ins, specific advisor
// guidance. Observational only.

import type { FounderEvent } from "../events";
import type { BehaviorDriver, SuccessModel } from "./digitalTwinTypes";
import { clamp, countType } from "./digitalTwinUtil";

const sameDay = (a: string, b: string) => a.slice(0, 10) === b.slice(0, 10);

export function buildSuccessModel(events: FounderEvent[]): SuccessModel {
  const completions = events.filter(
    (e) => e.type === "task.completed" || e.type === "focus.completed" || e.type === "document.exported",
  );
  const completionDays = new Set(completions.map((e) => e.ts.slice(0, 10)));

  const patterns: BehaviorDriver[] = [];
  const add = (factor: string, evidence: number, mult: number) => {
    if (evidence > 0) patterns.push({ factor, evidence, weight: clamp(evidence * mult) });
  };

  // Time blocking on days that also had completions.
  const blocksOnWinDays = events.filter(
    (e) => e.type === "timeblock.created" && completionDays.has(e.ts.slice(0, 10)),
  ).length;
  add("Time blocking", blocksOnWinDays, 16);

  // Breaking tasks down: multiple small tasks created then completed.
  const tasksCompleted = countType(events, "task.completed");
  add("Breaking tasks down", tasksCompleted >= 3 ? tasksCompleted : 0, 8);

  // Focus sessions preceding completions same day.
  const focusOnWinDays = events.filter(
    (e) => e.type === "focus.completed" && completionDays.has(e.ts.slice(0, 10)),
  ).length;
  add("Focus sessions", focusOnWinDays, 14);

  // Project planning (project + doc created) ahead of completions.
  const planning = events.filter((e) => e.type === "project.created" || e.type === "document.created").length;
  add("Project planning", planning >= 2 && completions.length > 0 ? planning : 0, 8);

  // Daily check-ins on productive days.
  const checkinWinDays = events.filter(
    (e) => e.type === "checkin.recorded" && completionDays.has(e.ts.slice(0, 10)),
  ).length;
  add("Daily check-ins", checkinWinDays, 12);

  // Assisted-action acceptance (specific guidance → progress).
  const assisted = events.filter(
    (e) =>
      e.type === "assisted_action.accepted" &&
      completions.some((c) => sameDay(c.ts, e.ts)),
  ).length;
  add("Specific advisor guidance", assisted, 12);

  patterns.sort((a, b) => b.weight - a.weight);
  const top = patterns[0];
  const observation = top
    ? `You often succeed when you lean on ${top.factor.toLowerCase()}.`
    : "Not enough completed outcomes yet to read a success pattern.";

  return { patterns, observation };
}
