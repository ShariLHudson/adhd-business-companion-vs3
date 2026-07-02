/**
 * Layer 2 — Hidden Strategy Engine.
 * Wraps existing strategy systems; never exposes methods to members.
 *
 * @see docs/MOMENTUM_BUILDER_ROOM_ARCHITECTURE.md
 */

import { recommendStrategyFromUserText } from "@/lib/strategyIntelligence";
import { resolveSituation } from "@/lib/adhdEntrepreneurSituationAtlas";
import type {
  GuidedPracticeOffer,
  HiddenStrategySelection,
  MomentumConversationDiscovery,
  MomentumRoomOrchestration,
} from "./types";
import { proposeGuidedPracticeOffer } from "./guidedPracticeBridge";

export type HiddenStrategyOrchestrationInput = {
  discovery: MomentumConversationDiscovery;
  now?: Date;
};

export type HiddenStrategyOrchestrationResult = MomentumRoomOrchestration;

/** Select invisible strategy approach from conversation discovery. */
export function orchestrateHiddenStrategy(
  input: HiddenStrategyOrchestrationInput,
): HiddenStrategyOrchestrationResult {
  const { discovery } = input;
  const now = input.now ?? new Date();
  const text = discovery.rawMemberText;

  const hiddenStrategy = selectHiddenStrategy(text, discovery);
  const guidedPracticeOffer = proposeGuidedPracticeOffer({
    discovery,
    hiddenStrategy,
  });

  return {
    hiddenStrategy,
    guidedPracticeOffer,
    orchestratedAt: now.toISOString(),
  };
}

function selectHiddenStrategy(
  text: string,
  discovery: MomentumConversationDiscovery,
): HiddenStrategySelection {
  if (
    discovery.emotionalState === "overwhelmed" ||
    discovery.roadblocks.some((r) => /overwhelm|stuck/i.test(r.label))
  ) {
    return {
      strategyId: null,
      situationId: "recovery",
      confidence: "high",
      approach: "recover",
    };
  }

  const resolution = resolveSituation({ userText: text, messages: [] });
  const recommendation = recommendStrategyFromUserText(text);

  const approach = mapApproach(resolution.situationId, discovery);
  const confidence =
    recommendation?.confidence ??
    (resolution.matched ? "medium" : "low");

  return {
    strategyId: recommendation?.strategyId ?? null,
    situationId: resolution.situationId ?? recommendation?.situationId ?? null,
    confidence,
    approach,
  };
}

function mapApproach(
  situationId: string | null | undefined,
  discovery: MomentumConversationDiscovery,
): HiddenStrategySelection["approach"] {
  if (!situationId) {
    if (discovery.priorities.length > 1) return "prioritize";
    if (discovery.energy === "low") return "break_down";
    return "clarify";
  }

  if (/priorit|choose|decide|pick/.test(situationId)) return "decide";
  if (/overwhelm|stuck|start|procrastinat/.test(situationId)) return "break_down";
  if (/plan|schedule|day/.test(situationId)) return "prioritize";
  if (/win|celebrat|progress/.test(situationId)) return "celebrate";
  return "clarify";
}

/** Dev-only introspection — never pass to member UI. */
export function describeHiddenStrategyInternal(
  orchestration: MomentumRoomOrchestration,
): string {
  const { hiddenStrategy, guidedPracticeOffer } = orchestration;
  const parts = [
    `approach=${hiddenStrategy.approach}`,
    `confidence=${hiddenStrategy.confidence}`,
  ];
  if (hiddenStrategy.strategyId) {
    parts.push(`strategyId=${hiddenStrategy.strategyId}`);
  }
  if (guidedPracticeOffer) {
    parts.push(`practice=${guidedPracticeOffer.builderId}`);
  }
  return parts.join(" ");
}

export type { GuidedPracticeOffer, HiddenStrategySelection };
