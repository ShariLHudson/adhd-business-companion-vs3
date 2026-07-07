/**
 * Journey-aware Discovery Key selection — approved KB only, no overwhelm.
 */

import { getLiveDiscoveryLibraryItems } from "@/lib/estateDiscovery/discoveryLibraryLoader";
import type {
  DiscoveryHistoryStore,
  DiscoveryLibraryItem,
  DiscoveryMemberContext,
  DiscoveryPriority,
} from "@/lib/estateDiscovery/types";
import {
  discoveryPrioritiesForBand,
  getEstablishedMemberPriorityBands,
  getNewMemberPriorityBands,
} from "./journeyConfig";
import { resolveCurrentJourneyStage } from "./resolveJourneyStage";
import type {
  JourneyDiscoveryPick,
  MemberJourneyProgress,
} from "./types";
import { isEstablishedMember } from "./resolveJourneyStage";
import { isDiscoveryBlockedByHistory } from "@/lib/estateDiscovery/discoveryHistoryPolicy";
import { discoveryTriggersMatch } from "@/lib/estateDiscovery/discoveryTriggerEvaluator";
import { validateDiscoveryRecord } from "@/lib/estateDiscovery/discoveryLibraryEngine";
import {
  isDiscoveryEligibleByCurriculum,
  sortDiscoveriesByCurriculum,
} from "@/lib/estateProgressiveDiscoveryCurriculum";
import { formatDiscoveryCompanionFallback } from "@/lib/estateDiscovery/discoveryCompanionResponse";
import { getDiscoveryLibraryItem } from "@/lib/estateDiscovery/discoveryLibraryLoader";

const PRIORITY_ORDER: Record<DiscoveryPriority, number> = {
  Essential: 0,
  Helpful: 1,
  Delight: 2,
  Personalized: 3,
};

function allowedPriorities(progress: MemberJourneyProgress): Set<string> {
  const bands = isEstablishedMember(progress)
    ? getEstablishedMemberPriorityBands()
    : getNewMemberPriorityBands();

  const priorities = new Set<string>();
  for (const band of bands) {
    for (const priority of discoveryPrioritiesForBand(band)) {
      priorities.add(priority);
    }
  }
  return priorities;
}

function stageDiscoveryIds(progress: MemberJourneyProgress): Set<string> {
  const stage = resolveCurrentJourneyStage(progress);
  return new Set(
    stage.itemIds
      .filter((ref) => ref.type === "discovery")
      .map((ref) => ref.id),
  );
}

export function sortJourneyDiscoveries(
  items: DiscoveryLibraryItem[],
  progress: MemberJourneyProgress,
): DiscoveryLibraryItem[] {
  const curriculumSorted = sortDiscoveriesByCurriculum(items, progress);
  const stageIds = stageDiscoveryIds(progress);
  const allowed = allowedPriorities(progress);

  return [...curriculumSorted].sort((a, b) => {
    const aStage = stageIds.has(a.id) ? 0 : 1;
    const bStage = stageIds.has(b.id) ? 0 : 1;
    if (aStage !== bStage) return aStage - bStage;

    const aAllowed = allowed.has(a.priority) ? 0 : 1;
    const bAllowed = allowed.has(b.priority) ? 0 : 1;
    if (aAllowed !== bAllowed) return aAllowed - bAllowed;

    const priorityDiff =
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const aSeen = progress.discoveriesViewed.includes(a.id) ? 1 : 0;
    const bSeen = progress.discoveriesViewed.includes(b.id) ? 1 : 0;
    if (aSeen !== bSeen) return aSeen - bSeen;

    return a.id.localeCompare(b.id);
  });
}

export type PickJourneyDiscoveryInput = {
  progress: MemberJourneyProgress;
  memberContext: DiscoveryMemberContext;
  historyStore: DiscoveryHistoryStore;
  currentRoomId?: string;
};

export function pickJourneyDiscovery(
  input: PickJourneyDiscoveryInput,
): JourneyDiscoveryPick | null {
  const candidates = sortJourneyDiscoveries(
    getLiveDiscoveryLibraryItems(),
    input.progress,
  );

  for (const item of candidates) {
    if (input.progress.discoveriesViewed.includes(item.id)) {
      continue;
    }

    if (!isDiscoveryEligibleByCurriculum(item.id, input.progress)) {
      continue;
    }

    if (
      isDiscoveryBlockedByHistory(
        input.historyStore,
        input.progress.memberId,
        item.id,
      )
    ) {
      continue;
    }

    if (!discoveryTriggersMatch(item, input.memberContext)) {
      continue;
    }

    const validation = validateDiscoveryRecord(item);
    if (!validation.valid) continue;

    if (
      item.relatedRoom &&
      input.currentRoomId &&
      item.relatedRoom !== input.currentRoomId
    ) {
      continue;
    }

    return {
      discoveryId: item.id,
      title: item.title,
      discoveryText: item.discoveryText,
      whyItMatters: item.whyItMatters,
      priority: item.priority,
      stageId: resolveCurrentJourneyStage(input.progress).stageId,
    };
  }

  return null;
}

export function formatJourneyDiscoveryResponse(
  pick: JourneyDiscoveryPick,
): string {
  const item = getDiscoveryLibraryItem(pick.discoveryId);
  if (item?.companionResponse?.trim()) {
    return item.companionResponse.trim();
  }

  return formatDiscoveryCompanionFallback({
    title: pick.title,
    discoveryText: pick.discoveryText,
    whyItMatters: pick.whyItMatters,
    companionResponse: null,
  });
}

