/**
 * Curriculum-aware discovery selection — thoughtful journey, not random notes.
 */

import type { DiscoveryLibraryItem } from "@/lib/estateDiscovery/types";
import type { MemberJourneyProgress } from "@/lib/estateProgressiveDiscoveryJourney";
import {
  deriveMemberTenure,
  resolveCurrentJourneyStage,
} from "@/lib/estateProgressiveDiscoveryJourney";
import {
  collectionIdsForAudience,
  curriculumOrderIndexForDiscovery,
  getCollectionIdsForJourneyStage,
  getLiveDiscoveryCollections,
} from "./curriculumConfig";
import { isDiscoveryEligibleByCurriculum } from "./prerequisiteEngine";
import type { CurriculumDiscoveryRank } from "./types";

function activeCollectionIds(progress: MemberJourneyProgress): string[] {
  const tenure = deriveMemberTenure(progress);
  const profile =
    tenure === "established"
      ? "establishedMember"
      : tenure === "returning"
        ? "returningMember"
        : "newMember";

  const stage = resolveCurrentJourneyStage(progress);
  const stageCollections = getCollectionIdsForJourneyStage(stage.stageId);
  const profileCollections = collectionIdsForAudience(profile);

  const merged = new Set<string>([...stageCollections, ...profileCollections]);
  return [...merged];
}

function collectionRank(
  collectionId: string,
  activeIds: string[],
): number {
  const index = activeIds.indexOf(collectionId);
  return index >= 0 ? index : activeIds.length + 100;
}

export function rankDiscoveryForCurriculum(
  discoveryId: string,
  progress: MemberJourneyProgress,
): CurriculumDiscoveryRank {
  const activeIds = activeCollectionIds(progress);
  const order = curriculumOrderIndexForDiscovery(discoveryId);
  const prerequisitesMet = isDiscoveryEligibleByCurriculum(
    discoveryId,
    progress,
  );

  return {
    discoveryId,
    collectionId: order?.collectionId ?? null,
    collectionOrder: order
      ? collectionRank(order.collectionId, activeIds) * 1000 + order.collectionOrder
      : 999_999,
    itemOrder: order?.itemOrder ?? 999,
    prerequisitesMet,
  };
}

/**
 * Sort discovery library items for Discovery Key / Help & Discovery.
 * Curriculum order and prerequisites win over random priority.
 */
export function sortDiscoveriesByCurriculum(
  items: DiscoveryLibraryItem[],
  progress: MemberJourneyProgress,
): DiscoveryLibraryItem[] {
  const liveCollectionDiscoveryIds = new Set(
    getLiveDiscoveryCollections().flatMap((collection) =>
      collection.items
        .filter((item) => item.refType === "discovery" && item.status !== "Draft")
        .map((item) => item.refId),
    ),
  );

  return [...items].sort((a, b) => {
    const rankA = rankDiscoveryForCurriculum(a.id, progress);
    const rankB = rankDiscoveryForCurriculum(b.id, progress);

    if (rankA.prerequisitesMet !== rankB.prerequisitesMet) {
      return rankA.prerequisitesMet ? -1 : 1;
    }

    if (rankA.collectionOrder !== rankB.collectionOrder) {
      return rankA.collectionOrder - rankB.collectionOrder;
    }

    if (rankA.itemOrder !== rankB.itemOrder) {
      return rankA.itemOrder - rankB.itemOrder;
    }

    const aInLiveCollection = liveCollectionDiscoveryIds.has(a.id) ? 0 : 1;
    const bInLiveCollection = liveCollectionDiscoveryIds.has(b.id) ? 0 : 1;
    if (aInLiveCollection !== bInLiveCollection) {
      return aInLiveCollection - bInLiveCollection;
    }

    const aSeen = progress.discoveriesViewed.includes(a.id) ? 1 : 0;
    const bSeen = progress.discoveriesViewed.includes(b.id) ? 1 : 0;
    if (aSeen !== bSeen) return aSeen - bSeen;

    return a.id.localeCompare(b.id);
  });
}

export function filterDiscoveriesByCurriculumPrerequisites(
  items: DiscoveryLibraryItem[],
  progress: MemberJourneyProgress,
): DiscoveryLibraryItem[] {
  return items.filter((item) =>
    isDiscoveryEligibleByCurriculum(item.id, progress),
  );
}
