/**
 * 060 — Single entry: every Workspace asks the same engine.
 */

import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { collectEventRecommendationCandidates } from "./eventCandidates";
import { rankAndLimitRecommendations } from "./rankAndLimit";
import type { RecommendationPack } from "./types";

export type RecommendForWorkspaceInput = {
  domain: "event" | "generic";
  eventRecord?: EventRecord | null;
  returningSession?: boolean;
};

/**
 * Platform Recommendation Engine — one ranked pack for the Workspace.
 */
export function recommendForWorkspace(
  input: RecommendForWorkspaceInput,
): RecommendationPack {
  if (input.domain === "event" && input.eventRecord) {
    const candidates = collectEventRecommendationCandidates(input.eventRecord);
    return rankAndLimitRecommendations(candidates, {
      returningSession: input.returningSession,
    });
  }

  return rankAndLimitRecommendations([], {
    returningSession: input.returningSession,
  });
}

export function recommendForEventWorkspace(
  record: EventRecord,
  options?: { returningSession?: boolean },
): RecommendationPack {
  return recommendForWorkspace({
    domain: "event",
    eventRecord: record,
    returningSession: options?.returningSession,
  });
}
