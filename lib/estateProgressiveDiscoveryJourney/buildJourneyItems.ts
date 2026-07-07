/**
 * Build journey stage items for progressive discovery responses.
 */

import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import { getEstateIntelligenceItem } from "@/lib/estateKnowledgeBase/loader";
import { getKnowledgeItem } from "@/lib/estateKnowledgeBase/loader";
import type { EstateKnowledgeRegistryId } from "@/lib/estateKnowledgeBase/types";
import discoveryLibraryJson from "@/docs/estate-intelligence/discovery-library.json";
import {
  getJourneyStageById,
  getMaxItemsPerJourneyResponse,
} from "./journeyConfig";
import { journeyItemKey } from "./journeyItemKey";
import { isJourneyItemEngaged } from "./memberJourneyProgress";
import { resolveCurrentJourneyStage } from "./resolveJourneyStage";
import type {
  JourneyItemRef,
  JourneyStageItem,
  MemberJourneyProgress,
} from "./types";

type DiscoveryLibraryItem = {
  id: string;
  status: string;
  title: string;
  discoveryText: string;
  whyItMatters: string | null;
  targetRegistry: string;
  targetId: string;
};

type DiscoveryLibraryFile = {
  items: DiscoveryLibraryItem[];
};

const DISCOVERY_FILE = discoveryLibraryJson as DiscoveryLibraryFile;

const REGISTRY_BY_TYPE: Record<
  Exclude<JourneyItemRef["type"], "discovery">,
  EstateKnowledgeRegistryId
> = {
  room: "rooms",
  feature: "features",
  tool: "tools",
  setting: "settings",
};

function isLiveDiscoveryItem(item: DiscoveryLibraryItem): boolean {
  if (item.status !== "Live") return false;
  const kbItem = getEstateIntelligenceItem(
    item.targetRegistry as "estate-rooms",
    item.targetId,
  );
  return kbItem?.status === "Live";
}

function resolveJourneyItem(
  ref: JourneyItemRef,
  stageId: JourneyStageItem["stageId"],
): JourneyStageItem | null {
  if (ref.type === "discovery") {
    const discovery = DISCOVERY_FILE.items.find((item) => item.id === ref.id);
    if (!discovery || !isLiveDiscoveryItem(discovery)) return null;
    return {
      stageId,
      type: ref.type,
      id: ref.id,
      itemKey: journeyItemKey(ref),
      officialName: discovery.title,
      teaser: discovery.discoveryText,
    };
  }

  const registryId = REGISTRY_BY_TYPE[ref.type];
  const item = getKnowledgeItem(registryId, ref.id);
  if (item && item.status === "Live") {
    return {
      stageId,
      type: ref.type,
      id: ref.id,
      itemKey: journeyItemKey(ref),
      officialName: item.officialName,
      teaser: item.description,
    };
  }

  if (ref.type === "room") {
    const location = getEstateLocationById(ref.id);
    if (location && location.status === "Live") {
      return {
        stageId,
        type: ref.type,
        id: ref.id,
        itemKey: journeyItemKey(ref),
        officialName: location.officialDisplayName,
        teaser: location.memberFacingHint || location.description,
      };
    }
  }

  return null;
}

export function buildJourneyStageItems(
  progress: MemberJourneyProgress,
): { stageId: JourneyStageItem["stageId"]; intro: string; items: JourneyStageItem[] } | null {
  const max = getMaxItemsPerJourneyResponse();
  const currentStage = resolveCurrentJourneyStage(progress);
  const items: JourneyStageItem[] = [];

  const tryStage = (stageId: JourneyStageItem["stageId"]) => {
    const stage = getJourneyStageById(stageId);
    if (!stage) return;

    for (const ref of stage.itemIds) {
      if (items.length >= max) return;
      if (isJourneyItemEngaged(progress, ref)) continue;

      const resolved = resolveJourneyItem(ref, stage.stageId);
      if (resolved) items.push(resolved);
    }
  };

  tryStage(currentStage.stageId);

  if (items.length === 0) {
    const stages = [
      currentStage.stageId,
      "explore",
      "discover-features",
      "personalize",
      "deeper-discovery",
    ] as const;

    for (const stageId of stages) {
      if (stageId === currentStage.stageId) continue;
      tryStage(stageId);
      if (items.length > 0) break;
    }
  }

  if (items.length === 0) return null;

  const introStage = getJourneyStageById(items[0].stageId) ?? currentStage;
  return {
    stageId: introStage.stageId,
    intro: introStage.intro,
    items,
  };
}

export function formatJourneyStageResponse(
  intro: string,
  items: readonly JourneyStageItem[],
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

export function formatJourneyCapabilityOverview(
  progress: MemberJourneyProgress,
  currentLocationName?: string,
): string {
  const built = buildJourneyStageItems(progress);
  if (!built) {
    return "We can talk about anything here — or I can show you a few places when you're curious. What sounds helpful?";
  }

  const locationLine = currentLocationName
    ? `Here in ${currentLocationName}, you can simply talk with me — that's always enough.`
    : "You can always just talk with me here — that's what this place is for.";

  return [
    locationLine,
    "",
    formatJourneyStageResponse(built.intro, built.items),
  ].join("\n");
}
