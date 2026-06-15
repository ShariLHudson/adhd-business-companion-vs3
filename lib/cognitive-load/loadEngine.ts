/**
 * Cognitive Load Intelligence — how much is the user carrying right now?
 */

import {
  getBrainDumps,
  getDayState,
  getProjects,
  getTimeBlocks,
  todayStr,
} from "@/lib/companionStore";
import { userIntelligenceEngine } from "@/lib/ecosystem/userIntelligenceEngine";
import { collectLoadContributors } from "./loadFactors";
import {
  buildCompanionLoadOffer,
  buildLoadRecommendations,
  buildLoadSummaryText,
  buildLoadSummaries,
} from "./loadMessages";
import { buildCognitiveLoadScore } from "./loadScoring";
import {
  isLoadOfferDismissedToday,
  notifyCognitiveLoadUpdated,
  priorCognitiveLoadScore,
  recordCognitiveLoadSnapshot,
} from "./loadStore";
import type {
  CognitiveLoadInput,
  CognitiveLoadResult,
  CognitiveLoadSnapshot,
} from "./types";

/** Gather signals from the companion app (client-only). */
export function gatherCognitiveLoadInput(
  partial: CognitiveLoadInput = {},
): CognitiveLoadInput {
  const now = partial.now ?? new Date();
  const today = todayStr();
  const projects = partial.projects ?? getProjects();
  const brainDumps = getBrainDumps();
  const allBlocks = getTimeBlocks();

  const openBrainDumpCount =
    partial.openBrainDumpCount ??
    brainDumps.filter((e) => !e.done).length;
  const projectsMissingNextAction =
    partial.projectsMissingNextAction ??
    projects.filter(
      (p) =>
        p.status !== "completed" &&
        p.horizon === "now" &&
        !p.nextAction?.trim(),
    ).length;
  const stalledProjectCount =
    partial.stalledProjectCount ??
    projects.filter(
      (p) =>
        p.status === "paused" ||
        (p.status === "not-started" && p.horizon === "now"),
    ).length;

  const blocksToday = allBlocks.filter((b) => b.date === today);
  const missedBlocksToday =
    partial.missedBlocksToday ??
    blocksToday.filter((b) => b.status === "missed").length;
  const overdueTaskCount =
    partial.overdueTaskCount ??
    allBlocks.filter(
      (b) =>
        b.status === "missed" ||
        (b.date < today && b.status === "pending"),
    ).length;

  return {
    ...partial,
    now,
    projects,
    openBrainDumpCount,
    projectsMissingNextAction,
    stalledProjectCount,
    overdueTaskCount,
    dayState: partial.dayState ?? getDayState(),
    timeBlocksToday: partial.timeBlocksToday ?? blocksToday.length,
    missedBlocksToday,
    signalCounts:
      partial.signalCounts ?? userIntelligenceEngine.getCounts(),
    priorScore: partial.priorScore ?? priorCognitiveLoadScore(now),
  };
}

export function buildCognitiveLoadSnapshot(
  result: CognitiveLoadResult,
): CognitiveLoadSnapshot {
  return {
    score: result.score.value,
    level: result.score.level,
    contributors: result.score.contributors,
    summary: buildLoadSummaryText(result.score),
    recommendations: result.recommendations.map((r) => r.text),
    createdAt: result.score.computedAt,
  };
}

/** Evaluate cognitive load from input signals. */
export function evaluateCognitiveLoad(
  input: CognitiveLoadInput = {},
): CognitiveLoadResult {
  const now = input.now ?? new Date();
  const contributors = collectLoadContributors(input);
  const score = buildCognitiveLoadScore(contributors, now);
  const summaries = buildLoadSummaries(score);
  const recommendations = buildLoadRecommendations(score);
  const companionOffer = buildCompanionLoadOffer(
    score.level,
    isLoadOfferDismissedToday(now),
  );

  return { score, summaries, recommendations, companionOffer };
}

/** Evaluate, persist full snapshot, and return result. */
export function evaluateAndRecordCognitiveLoad(
  partial: CognitiveLoadInput = {},
): CognitiveLoadResult {
  const input = gatherCognitiveLoadInput(partial);
  const result = evaluateCognitiveLoad(input);
  recordCognitiveLoadSnapshot(buildCognitiveLoadSnapshot(result));
  notifyCognitiveLoadUpdated();
  return result;
}
