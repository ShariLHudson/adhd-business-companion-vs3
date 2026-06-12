// Founder Ecosystem — Phase 16 Execution Model.
// Observes HOW the founder gets work done: starts quickly vs needs warm-up, and
// which scaffolds correlate with progress (time blocks, focus sessions,
// conversation, structured plans). Observational only.

import type { FounderEvent } from "../events";
import type { ExecutionModel, ExecutionTrait, Scored } from "./digitalTwinTypes";
import {
  avgResolutionDays,
  confidenceFromEvidence,
  countType,
} from "./digitalTwinUtil";

export function buildExecutionModel(events: FounderEvent[]): ExecutionModel {
  const scores: Record<ExecutionTrait, number> = {
    "starts-quickly": 0,
    "needs-warm-up": 0,
    "works-best-with-time-blocks": 0,
    "works-best-with-focus-sessions": 0,
    "works-best-with-conversation": 0,
    "works-best-with-structured-plans": 0,
  };

  // Start speed: time from task.created → task.completed.
  const taskGap = avgResolutionDays(events, "task.created", "task.completed", "taskId");
  if (taskGap !== null) {
    if (taskGap <= 1) scores["starts-quickly"] += 3;
    else if (taskGap >= 3) scores["needs-warm-up"] += 3;
  }

  // Scaffolds that correlate with completions.
  const completions = countType(events, "task.completed") + countType(events, "focus.completed");
  const timeBlocks = countType(events, "timeblock.created");
  const focus = countType(events, "focus.completed");
  const coaching = countType(events, "chat.coaching");
  const planning = events.filter(
    (e) => e.type === "timeblock.created" || (e.type === "project.created"),
  ).length;

  if (completions > 0 && timeBlocks > 0) scores["works-best-with-time-blocks"] += Math.min(timeBlocks, 6);
  if (focus > 0) scores["works-best-with-focus-sessions"] += Math.min(focus, 6);
  if (coaching > 0 && completions > 0) scores["works-best-with-conversation"] += Math.min(coaching, 5);
  if (planning >= 2) scores["works-best-with-structured-plans"] += Math.min(planning, 5);

  const traits: Scored<ExecutionTrait>[] = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([value, score]) => ({
      value: value as ExecutionTrait,
      score,
      confidence: confidenceFromEvidence(score),
    }));

  const top = traits[0];
  const observation = top
    ? `You often ${top.value.replace(/-/g, " ").replace("works best with", "work best with")}.`
    : "Not enough completed work yet to read an execution pattern.";

  return { traits, observation };
}
