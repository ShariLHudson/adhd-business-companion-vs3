/**
 * Gather momentum signals from companion activity and intelligence stores.
 */

import { getProjects, getWeekMomentum } from "@/lib/companionStore";
import { getActivationStore } from "@/lib/activation/activationStore";
import { getCognitiveLoadStore } from "@/lib/cognitive-load/loadStore";
import { getDayDesignerStore } from "@/lib/day-designer/dayStore";
import { getRecognitionStore } from "@/lib/recognition/recognitionStore";
import { daysSinceLastActivity } from "@/lib/user-health/userHealthSignals";
import type { MomentumBlocker, MomentumBuilder, MomentumInput, MomentumWin } from "./types";

const MS_DAY = 86_400_000;

const WIN_RE =
  /\b(finished|completed|shipped|posted|sent|published|got it done|made progress|took the first step|decided to)\b/i;
const HELP_RE = /\b(help me|can you help|need help|stuck with)\b/i;
const AVOID_RE =
  /\b(avoiding|putting off|haven't started|can't start|frozen again)\b/i;
const OVERWHELM_RE =
  /\b(overwhelm|too much|burned out|burnt out|exhausted)\b/i;

const BUILDER_LABELS: Record<MomentumBuilder, string> = {
  completed_action: "Completed an action",
  completed_outcome: "Completed an outcome",
  project_progress: "Moved a project forward",
  activation_success: "Got unstuck / activated",
  day_plan_completed: "Completed a day plan",
  asked_for_help: "Asked for help",
  returned_after_absence: "Returned after time away",
  overcame_blocker: "Overcame a blocker",
  reduced_overwhelm: "Reduced overwhelm",
  made_decision: "Made a decision",
  first_step: "Took a first step",
  recognition_milestone: "Reached a milestone",
  conversation_to_action: "Turned conversation into action",
};

const BLOCKER_LABELS: Record<MomentumBlocker, string> = {
  repeated_freezing: "Repeated freezing",
  repeated_overwhelm: "Repeated overwhelm",
  avoidance: "Avoidance patterns",
  rising_cognitive_load: "Rising cognitive load",
  stalled_projects: "Stalled projects",
  decision_paralysis: "Decision paralysis",
  burnout_indicators: "Burnout indicators",
  declining_activity: "Declining activity",
  unfinished_outcomes: "Unfinished outcomes",
};

export function builderLabel(builder: MomentumBuilder): string {
  return BUILDER_LABELS[builder];
}

export function blockerLabel(blocker: MomentumBlocker): string {
  return BLOCKER_LABELS[blocker];
}

export function gatherMomentumInput(
  partial: MomentumInput = {},
): MomentumInput & {
  weekEvents: ReturnType<typeof getWeekMomentum>;
  positiveScore: number;
  negativeScore: number;
} {
  const now = partial.now ?? new Date();
  const since7d = now.getTime() - 7 * MS_DAY;
  const weekEvents = getWeekMomentum();
  const recognition = getRecognitionStore();
  const dayDesigner = getDayDesignerStore();
  const activation = getActivationStore();
  const cog = getCognitiveLoadStore();

  const recentActivation = activation.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const frozenCount = recentActivation.filter((s) =>
    /\b(frozen|stuck)\b/i.test(s.state),
  ).length;
  const movingCount = recentActivation.filter((s) =>
    /\b(moving|recovering)\b/i.test(s.state),
  ).length;

  const recentLoad = cog.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const overloadCount = recentLoad.filter((s) =>
    /\b(heavy|overloaded)\b/i.test(s.level),
  ).length;

  const text = partial.text ?? "";
  let positiveScore = weekEvents.length;
  let negativeScore = 0;

  if (WIN_RE.test(text)) positiveScore += 2;
  if (HELP_RE.test(text)) positiveScore += 1;
  if (AVOID_RE.test(text)) negativeScore += 2;
  if (OVERWHELM_RE.test(text)) negativeScore += 2;
  negativeScore += frozenCount;
  negativeScore += overloadCount;
  positiveScore += movingCount;

  const recognitionRecent =
    partial.recognitionMomentsRecent ??
    recognition.sentLog.filter((e) => new Date(e.at).getTime() >= since7d)
      .length;

  const dayPlansCompleted =
    partial.dayPlansCompleted ?? dayDesigner.plans.length;

  const stalledProjectCount =
    partial.stalledProjectCount ??
    getProjects().filter(
      (p) =>
        p.status !== "completed" &&
        (p.status === "paused" || p.status === "not-started"),
    ).length;

  const daysAway =
    partial.daysSinceLastActivity ?? daysSinceLastActivity(now);

  const priorLoad =
    partial.priorCognitiveLoadLevel ??
    (recentLoad.length >= 2
      ? (recentLoad[recentLoad.length - 2]?.level as MomentumInput["cognitiveLoadLevel"])
      : null);

  return {
    ...partial,
    now,
    recognitionMomentsRecent: recognitionRecent,
    dayPlansCompleted,
    stalledProjectCount,
    daysSinceLastActivity: daysAway,
    priorCognitiveLoadLevel: priorLoad,
    weekEvents,
    positiveScore,
    negativeScore,
  };
}

export function detectMomentumBuilders(
  input: ReturnType<typeof gatherMomentumInput>,
): MomentumBuilder[] {
  const builders = new Set<MomentumBuilder>();
  const text = input.text ?? "";

  for (const ev of input.weekEvents) {
    if (ev.type === "complete") builders.add("completed_action");
    if (ev.type === "start" || ev.type === "move") {
      builders.add("project_progress");
    }
    if (ev.type === "resilience") builders.add("returned_after_absence");
    if (ev.type === "start") builders.add("first_step");
  }

  if (WIN_RE.test(text)) builders.add("completed_action");
  if (HELP_RE.test(text)) builders.add("asked_for_help");
  if (/\b(decided|going with|picked)\b/i.test(text)) {
    builders.add("made_decision");
  }
  if (input.activationState === "moving" || input.activationState === "recovering") {
    builders.add("activation_success");
  }
  if ((input.dayPlansCompleted ?? 0) > 0) {
    builders.add("day_plan_completed");
  }
  if ((input.recognitionMomentsRecent ?? 0) > 0) {
    builders.add("recognition_milestone");
  }
  if (
    input.daysSinceLastActivity !== null &&
    input.daysSinceLastActivity !== undefined &&
    input.daysSinceLastActivity >= 3 &&
    input.weekEvents.length > 0
  ) {
    builders.add("returned_after_absence");
  }
  if (
    input.priorCognitiveLoadLevel &&
    input.cognitiveLoadLevel &&
    loadRank(input.cognitiveLoadLevel) < loadRank(input.priorCognitiveLoadLevel)
  ) {
    builders.add("reduced_overwhelm");
  }
  if (input.adaptiveMode === "activation" && WIN_RE.test(text)) {
    builders.add("conversation_to_action");
  }

  return [...builders];
}

export function detectMomentumBlockers(
  input: ReturnType<typeof gatherMomentumInput>,
): MomentumBlocker[] {
  const blockers = new Set<MomentumBlocker>();
  const text = input.text ?? "";

  if (input.activationState === "frozen" || input.activationState === "stuck") {
    blockers.add("repeated_freezing");
  }
  if (
    input.cognitiveLoadLevel === "overloaded" ||
    input.cognitiveLoadLevel === "heavy"
  ) {
    blockers.add("repeated_overwhelm");
  }
  if (AVOID_RE.test(text)) blockers.add("avoidance");
  if (
    input.priorCognitiveLoadLevel &&
    input.cognitiveLoadLevel &&
    loadRank(input.cognitiveLoadLevel) > loadRank(input.priorCognitiveLoadLevel)
  ) {
    blockers.add("rising_cognitive_load");
  }
  if ((input.stalledProjectCount ?? 0) > 0) {
    blockers.add("stalled_projects");
  }
  if (input.adaptiveMode === "sorting" || /\b(can't decide|too many options)\b/i.test(text)) {
    blockers.add("decision_paralysis");
  }
  if (
    input.userHealthStatus === "overloaded" ||
    input.userHealthStatus === "needs_support"
  ) {
    blockers.add("burnout_indicators");
  }
  if (
    input.daysSinceLastActivity !== null &&
    input.daysSinceLastActivity !== undefined &&
    input.daysSinceLastActivity >= 10 &&
    input.weekEvents.length === 0
  ) {
    blockers.add("declining_activity");
  }
  if ((input.stalledProjectCount ?? 0) >= 2) {
    blockers.add("unfinished_outcomes");
  }

  return [...blockers];
}

export function collectRecentWins(
  input: ReturnType<typeof gatherMomentumInput>,
  now = input.now ?? new Date(),
): MomentumWin[] {
  const wins: MomentumWin[] = [];
  for (const ev of input.weekEvents.slice(0, 5)) {
    wins.push({
      id: ev.id,
      label: ev.label || ev.type,
      at: ev.ts,
    });
  }
  if (WIN_RE.test(input.text ?? "")) {
    wins.unshift({
      id: `text-${now.getTime()}`,
      label: "Recent win mentioned in conversation",
      at: now.toISOString(),
    });
  }
  return wins.slice(0, 6);
}

function loadRank(level: NonNullable<MomentumInput["cognitiveLoadLevel"]>): number {
  switch (level) {
    case "light":
      return 1;
    case "moderate":
      return 2;
    case "heavy":
      return 3;
    case "overloaded":
      return 4;
    default:
      return 2;
  }
}
