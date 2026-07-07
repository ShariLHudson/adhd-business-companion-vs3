/**
 * Resolve the member's current journey stage from quiet progress signals.
 */

import {
  getJourneyStages,
  getMinEngagementsToAdvance,
} from "./journeyConfig";
import { isJourneyItemEngaged } from "./memberJourneyProgress";
import type {
  JourneyStage,
  JourneyStageId,
  MemberJourneyProgress,
  MemberTenure,
} from "./types";

function engagedCountInStage(
  progress: MemberJourneyProgress,
  stage: JourneyStage,
): number {
  return stage.itemIds.filter((ref) => isJourneyItemEngaged(progress, ref))
    .length;
}

export function resolveCurrentJourneyStage(
  progress: MemberJourneyProgress,
): JourneyStage {
  const stages = getJourneyStages();
  const minAdvance = getMinEngagementsToAdvance();

  for (const stage of stages) {
    const engaged = engagedCountInStage(progress, stage);
    const total = stage.itemIds.length;

    if (engaged < minAdvance && engaged < total) {
      return stage;
    }
  }

  return stages[stages.length - 1] ?? stages[0];
}

export function resolveCurrentJourneyStageId(
  progress: MemberJourneyProgress,
): JourneyStageId {
  return resolveCurrentJourneyStage(progress).stageId;
}

export function deriveMemberTenure(
  progress: MemberJourneyProgress,
): MemberTenure {
  const stageId = resolveCurrentJourneyStageId(progress);
  const totalEngagements =
    progress.roomsVisited.length +
    progress.featuresExplored.length +
    progress.discoveriesViewed.length;

  if (stageId === "deeper-discovery" || totalEngagements >= 8) {
    return "established";
  }

  if (
    stageId === "welcome" &&
    totalEngagements === 0 &&
    progress.journeyItemsIntroduced.length === 0
  ) {
    return "new";
  }

  return "returning";
}

/** Legacy Help & Discovery stage mapping. */
export function deriveMemberStageFromJourney(
  progress: MemberJourneyProgress,
): "new" | "returning" | "established" {
  return deriveMemberTenure(progress);
}

export function isEstablishedMember(progress: MemberJourneyProgress): boolean {
  return deriveMemberTenure(progress) === "established";
}
