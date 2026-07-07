/**
 * Progressive Discovery Journey™ — KB stage configuration.
 */

import progressiveDiscoveryJson from "@/docs/estate-knowledge-base/progressive-discovery.json";
import type { JourneyStage, JourneyStageId } from "./types";

type ProgressiveDiscoveryFile = {
  stages: JourneyStage[];
  rules?: {
    maxItemsPerResponse?: number;
    minEngagementsToAdvance?: number;
    liveTargetsOnly?: boolean;
  };
  recommendationProfiles?: {
    newMember?: string[];
    establishedMember?: string[];
  };
  discoveryPriorityByProfile?: Record<string, string[]>;
};

const FILE = progressiveDiscoveryJson as ProgressiveDiscoveryFile;

export function getJourneyStages(): JourneyStage[] {
  return [...FILE.stages]
    .filter((stage) => stage.status === "Live")
    .sort((a, b) => a.order - b.order);
}

export function getJourneyStageById(
  stageId: JourneyStageId,
): JourneyStage | null {
  return getJourneyStages().find((stage) => stage.stageId === stageId) ?? null;
}

export function getMaxItemsPerJourneyResponse(): number {
  return FILE.rules?.maxItemsPerResponse ?? 3;
}

export function getMinEngagementsToAdvance(): number {
  return FILE.rules?.minEngagementsToAdvance ?? 2;
}

export function getNewMemberPriorityBands(): string[] {
  return FILE.recommendationProfiles?.newMember ?? ["essential"];
}

export function getEstablishedMemberPriorityBands(): string[] {
  return (
    FILE.recommendationProfiles?.establishedMember ?? ["hidden-treasure"]
  );
}

export function discoveryPrioritiesForBand(
  band: string,
): readonly string[] {
  return FILE.discoveryPriorityByProfile?.[band] ?? ["Helpful"];
}
