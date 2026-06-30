/**
 * Spec 130 — The Wisdom Loop™
 * Final internal reasoning before every Spark response.
 */

import { summarizeHiddenIntent } from "@/lib/sparkConversation/hiddenIntent";
import { buildWisdomLoopPromptHint } from "./buildWisdomPromptHint";
import { recommendJudgment } from "./companionJudgment";
import { recommendSynthesis } from "./conversationSynthesis";
import { recommendGentleChallenge } from "./gentleChallenge";
import {
  recommendEmotionalBlocker,
  summarizeEmotionalBlocker,
} from "./emotionalBlocker";
import { planFutureBenefit } from "./futureBenefit";
import { recommendInsight } from "./insightGeneration";
import { assessMemberNeed } from "./memberNeed";
import { recommendMentorMoment } from "./mentorMoments";
import {
  discoverOutcome,
  summarizeOutcomeDiscovery,
} from "./outcomeDiscovery";
import { recognizeWorkspaceOpportunity } from "./opportunityRecognition";
import { detectHiddenIntentForLoop, runThinkingPause } from "./thinkingPause";
import type { WisdomLoopInput, WisdomLoopResult } from "./types";

export function runWisdomLoop(input: WisdomLoopInput): WisdomLoopResult {
  const hiddenIntent = detectHiddenIntentForLoop(input.memberMessage);
  const outcomeDiscovery = discoverOutcome(input.memberMessage, hiddenIntent);
  const memberNeed = assessMemberNeed(input.memberMessage);
  const thinkingPause = runThinkingPause({
    memberMessage: input.memberMessage,
    hiddenIntent,
  });

  const hiddenIntentSummary = hiddenIntent
    ? summarizeHiddenIntent(hiddenIntent)
    : null;

  const insight = recommendInsight(input.messageHistory);
  const judgment = recommendJudgment(input.memberMessage);
  const gentleChallenge = recommendGentleChallenge(input.memberMessage);
  const emotionalBlocker = recommendEmotionalBlocker(input.memberMessage);
  const synthesis = recommendSynthesis(input.memberMessage, input.messageHistory);
  const opportunity = emotionalBlocker?.depth === "explore"
    ? null
    : recognizeWorkspaceOpportunity(input.memberMessage);
  const mentorMoment = recommendMentorMoment(input.memberMessage, input.messageHistory);
  const futureBenefit = planFutureBenefit(
    input.memberMessage,
    outcomeDiscovery.hopedSuccess,
  );

  const devSummaries: string[] = [
    `Need: ${memberNeed.primary}`,
    summarizeOutcomeDiscovery(outcomeDiscovery),
    thinkingPause.emotionUnderneath
      ? `Emotion: ${thinkingPause.emotionUnderneath}`
      : "Emotion: none detected",
  ];
  if (hiddenIntentSummary) devSummaries.push(hiddenIntentSummary);
  if (insight?.due) devSummaries.push(`Insight due at turn ${insight.turnCount}`);
  if (opportunity) devSummaries.push(`Opportunity: ${opportunity.label}`);
  if (gentleChallenge) devSummaries.push("Gentle challenge appropriate");
  if (emotionalBlocker) {
    devSummaries.push(summarizeEmotionalBlocker(emotionalBlocker));
  }
  if (thinkingPause.cognitiveOverload) {
    devSummaries.push("Cognitive load reduction appropriate");
  }

  const partial: WisdomLoopResult = {
    thinkingPause,
    memberNeed,
    hiddenIntentSummary,
    outcomeDiscovery,
    insight,
    judgment,
    gentleChallenge,
    emotionalBlocker,
    synthesis,
    opportunity,
    mentorMoment,
    futureBenefit,
    promptHint: "",
    devSummaries,
  };

  return {
    ...partial,
    promptHint: buildWisdomLoopPromptHint(partial),
  };
}
