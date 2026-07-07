/**
 * Discovery Key System™ — orchestrates engine, placement, note, history, navigation.
 */

import { selectNextDiscovery } from "./discoveryEngine";
import {
  getDefaultDiscoveryHistoryStore,
  recordDiscoveryCompleted,
  recordDiscoveryDestinationVisited,
  recordDiscoveryIgnored,
  recordDiscoveryOpened,
  recordDiscoverySavedForLater,
  recordDiscoveryShown,
} from "./discoveryHistory";
import { toDiscoveryNoteData } from "./discoveryNotePresentation";
import { selectDiscoveryKeyPlacement } from "./roomPlacementLibrary";
import {
  loadMemberJourneyProgress,
  recordDiscoverySaved,
  recordDiscoveryViewed,
  recordRoomVisit,
  saveMemberJourneyProgress,
  syncJourneyProgressFromDiscoveryHistory,
} from "@/lib/estateProgressiveDiscoveryJourney";
import type { MemberJourneyProgress } from "@/lib/estateProgressiveDiscoveryJourney";
import type {
  DiscoveryHistoryContext,
  DiscoveryHistoryStore,
  DiscoveryKeySession,
  DiscoveryMemberContext,
  DiscoveryNoteData,
} from "./types";

export type EvaluateDiscoveryKeyInput = {
  memberId: string;
  currentRoomId: string;
  memberContext: DiscoveryMemberContext;
  historyStore?: DiscoveryHistoryStore;
  journeyProgress?: MemberJourneyProgress;
};

export type DiscoveryKeySessionState = {
  session: DiscoveryKeySession;
  noteData: DiscoveryNoteData;
};

function historyContextFromSession(
  session: DiscoveryKeySession,
): DiscoveryHistoryContext {
  return {
    roomWhereShown: session.placementRoomId,
    placementLocation: session.placement.locationId,
    destinationRoute: session.selection.destinationRoute ?? undefined,
  };
}

export function evaluateDiscoveryKeySession(
  input: EvaluateDiscoveryKeyInput,
): DiscoveryKeySessionState | null {
  const historyStore = input.historyStore ?? getDefaultDiscoveryHistoryStore();
  const journeyProgress =
    input.journeyProgress ??
    syncJourneyProgressFromDiscoveryHistory(
      loadMemberJourneyProgress(input.memberId),
      historyStore,
    );

  const selection = selectNextDiscovery({
    memberId: input.memberId,
    currentRoomId: input.currentRoomId,
    memberContext: input.memberContext,
    historyStore,
    journeyProgress,
  });

  if (!selection) return null;

  const placement = selectDiscoveryKeyPlacement({
    roomId: input.currentRoomId,
    discoveryId: selection.discoveryId,
    activeSeasonId: input.memberContext.activeSeasonId,
  });

  if (!placement) return null;

  const session: DiscoveryKeySession = {
    discoveryId: selection.discoveryId,
    placementRoomId: input.currentRoomId,
    selection,
    placement,
  };

  return {
    session,
    noteData: toDiscoveryNoteData(selection),
  };
}

export type CompleteDiscoveryKeyInput = {
  memberId: string;
  discoveryId: string;
  outcome: "completed" | "saved" | "ignored" | "destination_visited";
  context?: DiscoveryHistoryContext;
  historyStore?: DiscoveryHistoryStore;
};

export function completeDiscoveryKeySession(
  input: CompleteDiscoveryKeyInput,
): void {
  const store = input.historyStore ?? getDefaultDiscoveryHistoryStore();
  const { memberId, discoveryId, context, outcome } = input;

  switch (outcome) {
    case "completed":
      recordDiscoveryCompleted(store, memberId, discoveryId, context);
      break;
    case "saved":
      recordDiscoverySavedForLater(store, memberId, discoveryId, context);
      break;
    case "ignored":
      recordDiscoveryIgnored(store, memberId, discoveryId, context);
      break;
    case "destination_visited":
      recordDiscoveryDestinationVisited(store, memberId, discoveryId, context);
      break;
    default:
      break;
  }

  let journeyProgress = syncJourneyProgressFromDiscoveryHistory(
    loadMemberJourneyProgress(memberId),
    store,
  );
  journeyProgress = recordDiscoveryViewed(journeyProgress, discoveryId);
  if (outcome === "saved") {
    journeyProgress = recordDiscoverySaved(journeyProgress, discoveryId);
  }
  if (context?.roomWhereShown) {
    journeyProgress = recordRoomVisit(journeyProgress, context.roomWhereShown);
  }
  saveMemberJourneyProgress(journeyProgress);
}

export function markDiscoveryKeyShown(
  memberId: string,
  session: DiscoveryKeySession,
  historyStore?: DiscoveryHistoryStore,
): void {
  recordDiscoveryShown(
    historyStore ?? getDefaultDiscoveryHistoryStore(),
    memberId,
    session.discoveryId,
    historyContextFromSession(session),
  );
}

export function markDiscoveryKeyOpened(
  memberId: string,
  session: DiscoveryKeySession,
  historyStore?: DiscoveryHistoryStore,
): void {
  recordDiscoveryOpened(
    historyStore ?? getDefaultDiscoveryHistoryStore(),
    memberId,
    session.discoveryId,
    historyContextFromSession(session),
  );
}

export function buildDiscoveryMemberContextFromEstateMemory(input?: {
  roomVisitCounts?: Record<string, number>;
  featuresUsed?: string[];
  activeSeasonId?: string | null;
  favoriteRoomIds?: string[];
}): DiscoveryMemberContext {
  return {
    roomVisitCounts: input?.roomVisitCounts ?? {},
    featuresUsed: input?.featuresUsed ?? [],
    activeSeasonId: input?.activeSeasonId ?? null,
    favoriteRoomIds: input?.favoriteRoomIds ?? [],
  };
}
