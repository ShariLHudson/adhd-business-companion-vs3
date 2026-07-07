/**
 * Discovery Engine™ — selects the next eligible discovery for a member.
 * No UI; consumed by Estate Intelligence Engine and Discovery Key system.
 */

import { validateDiscoveryRecord } from "./discoveryLibraryEngine";
import { getLiveDiscoveryLibraryItems } from "./discoveryLibraryLoader";
import {
  discoveryHistorySortBias,
  isDiscoveryBlockedByHistory,
} from "./discoveryHistoryPolicy";
import { discoveryTriggersMatch } from "./discoveryTriggerEvaluator";
import { parseCompanionSectionFromRoute, isResolvableDiscoveryRoute } from "./discoveryNavigation";
import { selectDiscoveryKeyPlacement } from "./roomPlacementLibrary";
import { sortJourneyDiscoveries } from "@/lib/estateProgressiveDiscoveryJourney";
import {
  createEmptyMemberJourneyProgress,
  type MemberJourneyProgress,
} from "@/lib/estateProgressiveDiscoveryJourney";
import {
  isDiscoveryEligibleByCurriculum,
  sortDiscoveriesByCurriculum,
} from "@/lib/estateProgressiveDiscoveryCurriculum";
import type {
  DiscoveryEngineSelection,
  DiscoveryHistoryStore,
  DiscoveryLibraryItem,
  DiscoveryMemberContext,
  DiscoveryPriority,
} from "./types";

const PRIORITY_ORDER: Record<DiscoveryPriority, number> = {
  Essential: 0,
  Helpful: 1,
  Delight: 2,
  Personalized: 3,
};

function toSelection(
  item: DiscoveryLibraryItem,
  resolvedRoute: string | null,
): DiscoveryEngineSelection {
  const destinationSection = parseCompanionSectionFromRoute(resolvedRoute);

  return {
    discoveryId: item.id,
    category: item.category,
    title: item.title,
    subtitle: item.subtitle,
    destinationRoute: resolvedRoute,
    destinationSection,
    image: item.image,
    discoveryText: item.discoveryText,
    whyItMatters: item.whyItMatters,
    foodForThought: item.foodForThought,
    primaryButton: item.primaryButton ?? "",
    companionResponse: item.companionResponse ?? null,
    saveAllowed: item.saveAllowed !== false,
    relatedRoom: item.relatedRoom,
    priority: item.priority,
  };
}

function sortCandidates(
  items: DiscoveryLibraryItem[],
  store: DiscoveryHistoryStore,
  memberId: string,
): DiscoveryLibraryItem[] {
  return [...items].sort((a, b) => {
    const priorityDiff =
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const historyDiff =
      discoveryHistorySortBias(store, memberId, a.id) -
      discoveryHistorySortBias(store, memberId, b.id);
    if (historyDiff !== 0) return historyDiff;

    return a.id.localeCompare(b.id);
  });
}

export type SelectNextDiscoveryInput = {
  memberId: string;
  currentRoomId: string;
  memberContext: DiscoveryMemberContext;
  historyStore: DiscoveryHistoryStore;
  journeyProgress?: MemberJourneyProgress;
};

export function selectNextDiscovery(
  input: SelectNextDiscoveryInput,
): DiscoveryEngineSelection | null {
  const baseCandidates = getLiveDiscoveryLibraryItems();
  const progressForCurriculum =
    input.journeyProgress ??
    ({
      ...createEmptyMemberJourneyProgress(input.memberId),
      roomsVisited: input.currentRoomId
        ? [input.currentRoomId]
        : [],
      featuresExplored: [...(input.memberContext.featuresUsed ?? [])],
    } satisfies MemberJourneyProgress);

  const candidates = input.journeyProgress
    ? sortJourneyDiscoveries(baseCandidates, input.journeyProgress)
    : sortDiscoveriesByCurriculum(
        sortCandidates(baseCandidates, input.historyStore, input.memberId),
        progressForCurriculum,
      );

  for (const item of candidates) {
    if (item.relatedRoom && item.relatedRoom !== input.currentRoomId) {
      continue;
    }

    if (
      !isDiscoveryEligibleByCurriculum(item.id, progressForCurriculum)
    ) {
      continue;
    }

    if (
      isDiscoveryBlockedByHistory(
        input.historyStore,
        input.memberId,
        item.id,
      )
    ) {
      continue;
    }

    if (!discoveryTriggersMatch(item, input.memberContext)) {
      continue;
    }

    const validation = validateDiscoveryRecord(item);
    if (!validation.valid) {
      continue;
    }

    const route = validation.resolvedRoute;
    if (route && !isResolvableDiscoveryRoute(route)) {
      continue;
    }

    const placement = selectDiscoveryKeyPlacement({
      roomId: input.currentRoomId,
      discoveryId: item.id,
      activeSeasonId: input.memberContext.activeSeasonId,
    });
    if (!placement) {
      continue;
    }

    return toSelection(item, route);
  }

  return null;
}
