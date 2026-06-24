import type { VisualThinkingPipelineStage } from "../visualFocus/companionIntelligence/types";
import type { CompanionIntelligencePipelineStage } from "./types";
import { COMPANION_INTELLIGENCE_PIPELINE_ORDER } from "./types";

/** Maps Visual Thinking™ stages onto the ecosystem intelligence pipeline. */
export const VISUAL_THINKING_TO_ECOSYSTEM_STAGE: Record<
  VisualThinkingPipelineStage,
  CompanionIntelligencePipelineStage
> = {
  understand: "understanding",
  clarify: "clarification",
  structure: "framework_selection",
  visualize: "interactive_experience",
  insights: "insights",
  recommendations: "recommendations",
  learn: "learning_signals",
  feed_founder: "future_intelligence",
};

export function ecosystemStageIndex(
  stage: CompanionIntelligencePipelineStage,
): number {
  return COMPANION_INTELLIGENCE_PIPELINE_ORDER.indexOf(stage);
}

export function isValidEcosystemPipelineAdvance(
  from: CompanionIntelligencePipelineStage,
  to: CompanionIntelligencePipelineStage,
): boolean {
  if (from === to) return true;
  if (to === "clarification" || to === "pattern_recognition") return true;
  const fromIdx = ecosystemStageIndex(from);
  const toIdx = ecosystemStageIndex(to);
  if (fromIdx < 0 || toIdx < 0) return false;
  return toIdx >= fromIdx;
}

export function mapVisualThinkingStageToEcosystem(
  stage: VisualThinkingPipelineStage,
): CompanionIntelligencePipelineStage {
  return VISUAL_THINKING_TO_ECOSYSTEM_STAGE[stage];
}
