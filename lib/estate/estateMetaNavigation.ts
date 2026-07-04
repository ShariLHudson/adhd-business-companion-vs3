/**
 * Meta estate navigation — "another room", room lists, soft place proposals.
 * Prevents false "unknown place" replies when members mean the map, not a room name.
 */

import {
  formatEstatePlaceSuggestionMenu,
  pinQuietSuggestionOrder,
} from "./estatePlaceIdentityLock";
import {
  formatEstateWanderMenu,
  formatVagueWanderClusterMenu,
} from "./estateWanderNavigation";
import { resolveEstatePlace, shouldNavigateFromResolution } from "./resolveEstatePlace";
import { resolveEstatePlaceIdFromUserText } from "./estateRoomAliasRegistry";
import { estateNavigateCommandForPlace } from "@/lib/estateIntelligence/estateCommandRouter";
import {
  isAnotherRoomRequest,
  isEstateRoomListOrMapRequest,
  isMetaNavigationDestinationPhrase,
} from "./estateMetaNavigationPhrases";

export {
  hasHardEstateNavigationIntent,
  isAnotherRoomRequest,
  isEstateRoomListOrMapRequest,
  isMetaNavigationDestinationPhrase,
} from "./estateMetaNavigationPhrases";

const SOFT_PLACE_RE =
  /\b(?:how\s+about|what\s+about|maybe)\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i;

/** Common room-name typos → alias text for resolution. */
const SOFT_PLACE_TYPO_ALIASES: Readonly<Record<string, string>> = {
  "musci room": "music room",
  musci: "music room",
  "music roon": "music room",
  "musc room": "music room",
  baarn: "barn",
  "the baarn": "barn",
  gazeebo: "gazebo",
  "the gazeebo": "gazebo",
  journel: "journal",
  "the journel": "journal",
  observatry: "observatory",
};

const DEFAULT_EXPLORATORY_PLACE_IDS = [
  "coffee-house",
  "music-room",
  "conservatory",
  "momentum-institute",
  "peaceful-places",
  "apple-orchard",
  "creative-studio",
] as const;

export function normalizeSoftPlacePhrase(phrase: string): string {
  const trimmed = phrase.trim().replace(/[™®.!?]+$/g, "");
  const bare = trimmed.replace(/^(?:the|a|an)\s+/i, "").trim();
  const lower = bare.toLowerCase();
  return SOFT_PLACE_TYPO_ALIASES[lower] ?? bare;
}

export function extractSoftPlaceProposal(text: string): string | null {
  const match = text.trim().match(SOFT_PLACE_RE);
  if (!match?.[1]?.trim()) return null;
  return normalizeSoftPlacePhrase(match[1].trim());
}

export function pickExploratoryPlaceIds(
  excludePlaceId?: string | null,
): string[] {
  const filtered = DEFAULT_EXPLORATORY_PLACE_IDS.filter(
    (id) => id !== excludePlaceId,
  );
  return pinQuietSuggestionOrder([...filtered]).slice(0, 3);
}

export function formatEstateRoomPickerLine(
  excludePlaceId?: string | null,
): string {
  return formatEstateWanderMenu(excludePlaceId).line;
}

export type MetaEstateNavigationTurn =
  | {
      type: "navigate";
      command: ReturnType<typeof estateNavigateCommandForPlace>;
    }
  | { type: "offer"; line: string; placeIds: string[] };

/**
 * Meta navigation turns — room picker menus and soft place proposals.
 * Returns null when this module does not apply.
 */
export function evaluateMetaEstateNavigationTurn(input: {
  userText: string;
  currentPlaceId?: string | null;
}): MetaEstateNavigationTurn | null {
  const text = input.userText.trim();
  if (!text) return null;

  const softPhrase = extractSoftPlaceProposal(text);
  if (softPhrase && !isMetaNavigationDestinationPhrase(softPhrase)) {
    const resolution = resolveEstatePlace(softPhrase);
    if (shouldNavigateFromResolution(resolution) && resolution.placeId) {
      const command = estateNavigateCommandForPlace(
        resolution.placeId,
        text,
        { explicitActivityRequested: resolution.explicitActivityRequested },
      );
      if (command) {
        return { type: "navigate", command };
      }
    }
    const aliasPlaceId = resolveEstatePlaceIdFromUserText(softPhrase);
    if (aliasPlaceId) {
      const command = estateNavigateCommandForPlace(aliasPlaceId, text);
      if (command) {
        return { type: "navigate", command };
      }
    }
  }

  if (isAnotherRoomRequest(text) || isEstateRoomListOrMapRequest(text)) {
    const wander = formatEstateWanderMenu(input.currentPlaceId);
    return {
      type: "offer",
      line: wander.line,
      placeIds: wander.placeIds,
    };
  }

  return null;
}
