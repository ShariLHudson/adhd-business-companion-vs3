/**
 * Detect the best companion response mode from intelligence inputs.
 */

import type {
  AdaptiveConfidence,
  AdaptiveInput,
  CompanionResponseMode,
} from "./types";

const PLANNING_RE =
  /\b(plan my day|help me plan|map out|priorit(y|ies)|what should i focus on|create a plan|roadmap|schedule my)\b/i;
const REFLECTION_RE =
  /\b(why do i keep|pattern|what does this mean|help me understand|reflect on|what am i learning)\b/i;
const SORTING_RE =
  /\b(too many ideas|so much on my plate|sort this|organize|brain dump|what matters|park|overloaded)\b/i;
const WIN_RE =
  /\b(sent it|finished|completed|shipped|posted|published|got it done|all done|wrapped up)\b/i;
const WIN_NEG =
  /\b(not|haven'?t|almost|need to|trying to|about to)\b/i;

export type ModeCandidate = {
  mode: CompanionResponseMode;
  weight: number;
  reason: string;
};

export function detectResponseModeCandidates(
  input: AdaptiveInput = {},
): ModeCandidate[] {
  const text = input.text?.trim() ?? "";
  const candidates: ModeCandidate[] = [];
  const emotion = input.emotionalState ?? "unclear";
  const load = input.cognitiveLoadLevel;
  const activation = input.activationState;

  if (input.celebrationActive || (text && WIN_RE.test(text) && !WIN_NEG.test(text))) {
    candidates.push({
      mode: "celebration",
      weight: input.celebrationActive ? 10 : 8,
      reason: input.celebrationActive
        ? "Recognition moment or milestone is active"
        : "User signaled a completion or win",
    });
  }

  if (input.winDetected) {
    candidates.push({
      mode: "celebration",
      weight: 9,
      reason: "Recent win detected",
    });
  }

  const heavyLoad =
    load === "heavy" || load === "overloaded" || emotion === "overwhelmed";
  const shutdown = emotion === "overwhelmed" || emotion === "emotional";

  if (shutdown) {
    candidates.push({
      mode: "support",
      weight: 9,
      reason: "Emotional overload or shutdown — support before strategy",
    });
  } else if (heavyLoad) {
    candidates.push({
      mode: "sorting",
      weight: 7,
      reason: "Heavy cognitive load — sort before expanding",
    });
    candidates.push({
      mode: "support",
      weight: 6,
      reason: "Elevated load — lead with relief",
    });
  }

  if (
    activation === "stuck" ||
    activation === "frozen" ||
    emotion === "stuck"
  ) {
    candidates.push({
      mode: "activation",
      weight: 8,
      reason: "Stuck or frozen — tiny step, not a full plan",
    });
  }

  if (input.loopType) {
    candidates.push({
      mode: "reflection",
      weight: 7,
      reason: `Recurring loop pattern (${input.loopType}) — gentle reflection`,
    });
  }

  if (PLANNING_RE.test(text) || input.planningContext) {
    candidates.push({
      mode: "planning",
      weight: 8,
      reason: "Explicit planning request or day-design context",
    });
  }

  if (SORTING_RE.test(text) && !shutdown) {
    candidates.push({
      mode: "sorting",
      weight: 7,
      reason: "User needs to reduce complexity",
    });
  }

  if (REFLECTION_RE.test(text)) {
    candidates.push({
      mode: "reflection",
      weight: 7,
      reason: "User asked for insight or pattern awareness",
    });
  }

  if (emotion === "focused" || emotion === "building") {
    candidates.push({
      mode: "focus",
      weight: 6,
      reason: "User appears ready to execute",
    });
  }

  if (!candidates.length) {
    candidates.push({
      mode: "support",
      weight: 3,
      reason: "Default — warm presence, meet them where they are",
    });
  }

  return candidates.sort((a, b) => b.weight - a.weight);
}

export function pickResponseMode(
  candidates: ModeCandidate[],
): { mode: CompanionResponseMode; reason: string; confidence: AdaptiveConfidence } {
  const top = candidates[0]!;
  const second = candidates[1];
  const confidence: AdaptiveConfidence =
    top.weight >= 8
      ? "high"
      : top.weight >= 6 || (second && second.weight >= 6)
        ? "medium"
        : "low";

  return { mode: top.mode, reason: top.reason, confidence };
}
