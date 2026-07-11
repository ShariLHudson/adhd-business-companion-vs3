/**
 * Load Progressive Discovery Curriculum KB documents.
 */

import curriculumJson from "@/docs/estate-knowledge-base/progressive-discovery-curriculum.json";
import collectionsJson from "@/docs/estate-knowledge-base/discovery-collections.json";
import prerequisitesJson from "@/docs/estate-knowledge-base/discovery-prerequisites.json";
import type {
  DiscoveryCollection,
  DiscoveryCollectionsDoc,
  DiscoveryPrerequisite,
  DiscoveryPrerequisitesDoc,
  ProgressiveDiscoveryCurriculum,
} from "./types";
import type { JourneyStageId } from "@/lib/estateProgressiveDiscoveryJourney";

const curriculum = curriculumJson as ProgressiveDiscoveryCurriculum;
const collectionsDoc = collectionsJson as DiscoveryCollectionsDoc;
const prerequisitesDoc = prerequisitesJson as DiscoveryPrerequisitesDoc;

export function getProgressiveDiscoveryCurriculum(): ProgressiveDiscoveryCurriculum {
  return curriculum;
}

export function getDiscoveryCollections(): DiscoveryCollection[] {
  return collectionsDoc.collections ?? [];
}

export function getLiveDiscoveryCollections(): DiscoveryCollection[] {
  return getDiscoveryCollections().filter((c) => c.status === "Live");
}

export function getDiscoveryCollectionById(
  collectionId: string,
): DiscoveryCollection | null {
  return getDiscoveryCollections().find((c) => c.collectionId === collectionId) ?? null;
}

export function getDiscoveryPrerequisites(): DiscoveryPrerequisite[] {
  return prerequisitesDoc.prerequisites ?? [];
}

export function getPrerequisitesForTarget(
  targetType: DiscoveryPrerequisite["targetType"],
  targetId: string,
): DiscoveryPrerequisite[] {
  return getDiscoveryPrerequisites().filter(
    (p) => p.targetType === targetType && p.targetId === targetId,
  );
}

export function getCollectionIdsForJourneyStage(
  stageId: JourneyStageId,
): string[] {
  return curriculum.journeyStageToCollections[stageId] ?? [];
}

export function getCurriculumRules() {
  return curriculum.rules;
}

export function maxCurriculumDiscoveriesPerResponse(): number {
  return curriculum.rules.maxDiscoveriesPerResponse ?? 1;
}

export function collectionIdsForAudience(
  profile: "newMember" | "returningMember" | "establishedMember",
): string[] {
  return curriculum.audienceProfiles[profile]?.collectionOrder ?? [];
}

export function discoveryCollectionForDiscoveryId(
  discoveryId: string,
): DiscoveryCollection | null {
  for (const collection of getDiscoveryCollections()) {
    if (
      collection.items.some(
        (item) => item.refType === "discovery" && item.refId === discoveryId,
      )
    ) {
      return collection;
    }
  }
  return null;
}

export function curriculumOrderIndexForDiscovery(
  discoveryId: string,
): { collectionOrder: number; itemOrder: number; collectionId: string } | null {
  for (const collection of getDiscoveryCollections()) {
    const item = collection.items.find(
      (entry) => entry.refType === "discovery" && entry.refId === discoveryId,
    );
    if (item) {
      return {
        collectionId: collection.collectionId,
        collectionOrder: collection.order,
        itemOrder: item.order,
      };
    }
  }
  return null;
}
