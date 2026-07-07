/**
 * Prerequisite engine — curriculum gates without member-facing requirements.
 */

import type { MemberJourneyProgress } from "@/lib/estateProgressiveDiscoveryJourney";
import { journeyItemKey } from "@/lib/estateProgressiveDiscoveryJourney/journeyItemKey";
import {
  getDiscoveryPrerequisites,
  getPrerequisitesForTarget,
} from "./curriculumConfig";
import type {
  DiscoveryPrerequisite,
  PrerequisiteEngagement,
  PrerequisiteRequirement,
} from "./types";

function engagementMet(
  requirement: PrerequisiteRequirement,
  progress: MemberJourneyProgress,
): boolean {
  const { type, id, minEngagement } = requirement;

  switch (type) {
    case "discovery": {
      const viewed = progress.discoveriesViewed.includes(id);
      const saved = progress.savedDiscoveries.includes(id);
      if (minEngagement === "saved") return saved;
      if (minEngagement === "viewed") return viewed || saved;
      return viewed;
    }
    case "room": {
      const visits = progress.roomsVisited.filter((room) => room === id).length;
      if (minEngagement === "visited") return visits > 0;
      if (minEngagement === "explored") return visits >= 2;
      return visits > 0;
    }
    case "feature": {
      const explored = progress.featuresExplored.includes(id);
      if (minEngagement === "explored" || minEngagement === "visited") {
        return explored;
      }
      return explored;
    }
    case "tool":
    case "setting": {
      const key = journeyItemKey({
        type,
        id,
      });
      return progress.journeyItemsIntroduced.includes(key);
    }
    default:
      return true;
  }
}

export function arePrerequisitesMet(
  prerequisite: DiscoveryPrerequisite,
  progress: MemberJourneyProgress,
): boolean {
  return prerequisite.requires.every((req) => engagementMet(req, progress));
}

export function isTargetEligibleByPrerequisites(
  targetType: DiscoveryPrerequisite["targetType"],
  targetId: string,
  progress: MemberJourneyProgress,
): boolean {
  const rules = getDiscoveryPrerequisites();
  if (!rules.length) return true;

  const gates = getPrerequisitesForTarget(targetType, targetId);
  if (!gates.length) return true;

  return gates.every((gate) => arePrerequisitesMet(gate, progress));
}

export function isDiscoveryEligibleByCurriculum(
  discoveryId: string,
  progress: MemberJourneyProgress,
): boolean {
  return isTargetEligibleByPrerequisites("discovery", discoveryId, progress);
}

export function unmetPrerequisiteReasons(
  targetType: DiscoveryPrerequisite["targetType"],
  targetId: string,
  progress: MemberJourneyProgress,
): string[] {
  const gates = getPrerequisitesForTarget(targetType, targetId);
  const reasons: string[] = [];

  for (const gate of gates) {
    if (!arePrerequisitesMet(gate, progress)) {
      reasons.push(gate.reason ?? gate.id);
    }
  }

  return reasons;
}

export type PrerequisiteEngagementLevel = PrerequisiteEngagement;
