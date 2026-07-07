/**
 * Sync journey progress from Discovery History™ and estate signals.
 */

import type { DiscoveryHistoryStore } from "@/lib/estateDiscovery/types";
import type { DiscoveryMemberContext } from "@/lib/estateDiscovery/types";
import {
  createEmptyMemberJourneyProgress,
  recordDiscoverySaved,
  recordDiscoveryViewed,
  recordFeatureExplored,
  recordRoomVisit,
} from "./memberJourneyProgress";
import type { MemberJourneyProgress } from "./types";

const VIEWED_STATUSES = new Set([
  "shown",
  "opened",
  "completed",
  "saved",
  "destination_visited",
]);

export function syncJourneyProgressFromDiscoveryHistory(
  progress: MemberJourneyProgress,
  historyStore: DiscoveryHistoryStore,
): MemberJourneyProgress {
  let next = progress;

  for (const entry of historyStore.list(progress.memberId)) {
    if (!VIEWED_STATUSES.has(entry.status)) continue;

    next = recordDiscoveryViewed(next, entry.discoveryId);

    if (entry.status === "saved") {
      next = recordDiscoverySaved(next, entry.discoveryId);
    }

    if (entry.roomWhereShown) {
      next = recordRoomVisit(next, entry.roomWhereShown);
    }
  }

  return next;
}

export function mergeJourneyProgressWithMemberContext(
  progress: MemberJourneyProgress,
  context: DiscoveryMemberContext,
): MemberJourneyProgress {
  let next = progress;

  for (const [roomId, count] of Object.entries(context.roomVisitCounts)) {
    if (count > 0) {
      next = recordRoomVisit(next, roomId);
    }
  }

  for (const featureId of context.featuresUsed) {
    next = recordFeatureExplored(next, featureId);
  }

  return next;
}

export function buildJourneyProgressSnapshot(input: {
  memberId: string;
  historyStore?: DiscoveryHistoryStore;
  memberContext?: DiscoveryMemberContext;
}): MemberJourneyProgress {
  let progress = createEmptyMemberJourneyProgress(input.memberId);

  if (input.memberContext) {
    progress = mergeJourneyProgressWithMemberContext(
      progress,
      input.memberContext,
    );
  }

  if (input.historyStore) {
    progress = syncJourneyProgressFromDiscoveryHistory(
      progress,
      input.historyStore,
    );
  }

  return progress;
}

export function buildDiscoveryMemberContextFromJourney(
  progress: MemberJourneyProgress,
): DiscoveryMemberContext {
  const roomVisitCounts: Record<string, number> = {};
  for (const roomId of progress.roomsVisited) {
    roomVisitCounts[roomId] = Math.max(roomVisitCounts[roomId] ?? 0, 1);
  }

  return {
    roomVisitCounts,
    featuresUsed: [...progress.featuresExplored],
    favoriteRoomIds: progress.interestsShown
      .filter((interest) => interest.startsWith("room:"))
      .map((interest) => interest.slice("room:".length)),
  };
}
