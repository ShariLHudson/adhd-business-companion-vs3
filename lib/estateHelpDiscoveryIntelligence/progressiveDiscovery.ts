/**
 * Progressive discovery — delegates to Progressive Discovery Journey™.
 */

import {
  buildJourneyStageItems,
  createEmptyMemberJourneyProgress,
  formatJourneyCapabilityOverview,
  formatJourneyStageResponse,
} from "@/lib/estateProgressiveDiscoveryJourney";
import type {
  HelpDiscoveryContext,
  ProgressiveDiscoveryItem,
} from "./types";

export function buildProgressiveDiscoveryItems(
  context: HelpDiscoveryContext = {},
): { intro: string; items: ProgressiveDiscoveryItem[] } | null {
  const progress =
    context.journeyProgress ??
    createEmptyMemberJourneyProgress(context.memberId ?? "anonymous");

  const built = buildJourneyStageItems(progress);
  if (!built) return null;

  return {
    intro: built.intro,
    items: built.items.map((item) => ({
      type: item.type === "discovery" ? "tool" : item.type,
      id: item.id,
      officialName: item.officialName,
      teaser: item.teaser,
    })),
  };
}

export function formatProgressiveDiscoveryResponse(
  intro: string,
  items: readonly ProgressiveDiscoveryItem[],
): string {
  const lines = items.map(
    (item) => `${item.officialName} — ${item.teaser}`,
  );

  return [
    intro,
    "",
    ...lines,
    "",
    "Want to explore one of these, or keep talking here?",
  ].join("\n");
}

export function formatCapabilityOverviewResponse(
  context: HelpDiscoveryContext,
  currentLocationName?: string,
): string {
  const progress =
    context.journeyProgress ??
    createEmptyMemberJourneyProgress(context.memberId ?? "anonymous");

  return formatJourneyCapabilityOverview(progress, currentLocationName);
}
