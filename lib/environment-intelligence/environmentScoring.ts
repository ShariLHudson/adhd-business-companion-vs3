/**
 * Score environment snapshot — focus fit, recovery fit, confidence.
 */

import {
  collectEnvironmentSignals,
  detectEnvironmentType,
  inferClutterLevel,
  inferInterruptionLevel,
  inferSensoryLoad,
  pickAdjustment,
  signalScore,
} from "./environmentSignals";
import type {
  EnvironmentConfidence,
  EnvironmentFit,
  EnvironmentInput,
  EnvironmentSnapshot,
} from "./types";

function inferFocusFit(
  sensory: ReturnType<typeof inferSensoryLoad>,
  interruptions: ReturnType<typeof inferInterruptionLevel>,
  clutter: ReturnType<typeof inferClutterLevel>,
  envType: EnvironmentSnapshot["environmentType"],
): EnvironmentFit {
  let score = 2;
  if (sensory === "low") score += 1;
  if (sensory === "high") score -= 1;
  if (sensory === "overwhelming") score -= 2;
  if (interruptions === "quiet") score += 1;
  if (interruptions === "frequent") score -= 1;
  if (interruptions === "constant") score -= 2;
  if (clutter === "clear" || clutter === "manageable") score += 0;
  if (clutter === "distracting") score -= 1;
  if (clutter === "overwhelming") score -= 2;
  if (envType === "coffee_shop" && sensory === "moderate") score += 0;
  if (score >= 3) return "excellent";
  if (score >= 2) return "good";
  if (score >= 1) return "okay";
  return "poor";
}

function inferRecoveryFit(
  sensory: ReturnType<typeof inferSensoryLoad>,
  envType: EnvironmentSnapshot["environmentType"],
  signals: ReturnType<typeof collectEnvironmentSignals>,
): EnvironmentFit {
  const ids = new Set(signals.map((s) => s.id));
  if (ids.has("working_from_bed") || sensory === "overwhelming") return "poor";
  if (envType === "outdoors" && sensory === "low") return "good";
  if (sensory === "high") return "poor";
  if (sensory === "moderate") return "okay";
  return "good";
}

export function scoreEnvironment(
  input: EnvironmentInput,
  now = input.now ?? new Date(),
): EnvironmentSnapshot | null {
  const signals = collectEnvironmentSignals(input);
  const text = input.text?.trim() ?? "";
  if (!signals.length && !input.dayEnvironment) return null;

  const environmentType = detectEnvironmentType(text, input.dayEnvironment);
  const sensoryLoad = inferSensoryLoad(signals);
  const interruptionLevel = inferInterruptionLevel(signals);
  const clutterLevel = inferClutterLevel(signals);
  const focusFit = inferFocusFit(
    sensoryLoad,
    interruptionLevel,
    clutterLevel,
    environmentType,
  );
  const recoveryFit = inferRecoveryFit(sensoryLoad, environmentType, signals);
  const recommendedAdjustment = pickAdjustment(signals, input);

  const weight = signalScore(signals);
  const confidence: EnvironmentConfidence =
    weight >= 5 || sensoryLoad === "overwhelming"
      ? "high"
      : weight >= 2 || Boolean(input.dayEnvironment)
        ? "medium"
        : "low";

  const hasFriction =
    focusFit === "poor" ||
    sensoryLoad === "high" ||
    sensoryLoad === "overwhelming" ||
    clutterLevel === "distracting" ||
    clutterLevel === "overwhelming";

  if (!hasFriction && weight < 2) return null;

  return {
    environmentType,
    sensoryLoad,
    interruptionLevel,
    clutterLevel,
    focusFit,
    recoveryFit,
    recommendedAdjustment,
    confidence,
    createdAt: now.toISOString(),
  };
}
