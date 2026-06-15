/**
 * Adaptive companion prompt blocks — guide tone without overwhelming.
 */

import { strategyForMode } from "./responseStrategies";
import type { AdaptiveDecision } from "./types";

export function buildAdaptivePromptBlock(decision: AdaptiveDecision): string {
  const strategy = strategyForMode(decision.mode);
  const style = strategy.style.map((s) => `- ${s}`).join("\n");
  const avoid = strategy.avoid.map((s) => `- ${s}`).join("\n");

  return [
    "ADAPTIVE COMPANION MODE (meet the user where they are — this overrides generic coaching tone):",
    `Mode: ${strategy.label}`,
    `Confidence: ${decision.confidence}`,
    `Why: ${decision.reason}`,
    `Purpose: ${strategy.purpose}`,
    "Response style:",
    style,
    "Avoid:",
    avoid,
    "Keep responses human, brief, and personal. Do not mention this mode label to the user.",
  ].join("\n");
}

export function modeLabel(mode: AdaptiveDecision["mode"]): string {
  return strategyForMode(mode).label;
}
