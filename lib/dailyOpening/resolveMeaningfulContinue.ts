/**
 * Meaningful unfinished work for Today's Welcome Card.
 * Prefers saved progress / projects / Business Estate work over brief chats or room hops.
 */

import {
  resolveCompanionContinue,
  type CompanionContinueOption,
  type CompanionContinueResolution,
} from "@/lib/companionLedContinue";

const PREFERRED_KINDS: CompanionContinueOption["kind"][] = [
  "project",
  "workspace",
  "document",
  "visual-thinking",
  "research",
  "plan-my-day",
];

function optionsFromResolution(
  resolution: CompanionContinueResolution,
): CompanionContinueOption[] {
  if (resolution.mode === "single") return [resolution.option];
  if (resolution.mode === "choose") return resolution.options;
  return [];
}

function scoreOption(option: CompanionContinueOption): number {
  const kindScore = PREFERRED_KINDS.indexOf(option.kind);
  const kindRank = kindScore === -1 ? 50 : kindScore;
  // Prefer options that can resume a concrete home item / workflow.
  const resumeBonus = option.homeResumeItem ? -5 : 0;
  // Deprioritize loose conversation cues for the welcome card.
  const conversationPenalty = option.kind === "conversation" ? 20 : 0;
  return kindRank + resumeBonus + conversationPenalty + option.priority;
}

/**
 * Best continue option for Today's Welcome Card Choice 1.
 * Skips empty / onboarding; prefers concrete unfinished work over chat topics.
 */
export function resolveMeaningfulContinueForWelcome(
  continueResolution?: CompanionContinueResolution,
): CompanionContinueOption | null {
  const resolution = continueResolution ?? resolveCompanionContinue();
  if (resolution.mode === "onboarding" || resolution.mode === "empty") {
    return null;
  }

  const options = optionsFromResolution(resolution);
  if (options.length === 0) return null;

  const ranked = [...options].sort((a, b) => {
    const scoreDiff = scoreOption(a) - scoreOption(b);
    if (scoreDiff !== 0) return scoreDiff;
    return b.lastTouchedAt.localeCompare(a.lastTouchedAt);
  });

  // Prefer non-conversation when anything concrete exists.
  const concrete = ranked.find((o) => o.kind !== "conversation");
  return concrete ?? ranked[0] ?? null;
}
