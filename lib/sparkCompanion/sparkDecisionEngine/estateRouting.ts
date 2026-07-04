import type {
  EstateRouteSuggestion,
  SparkDecisionFrictionType,
  SparkPrimaryIntent,
} from "./types";
import type { SparkLandscapeId } from "@/lib/sparkCompanion/sparkLandscapes/types";

/** Estate adds value only when a place genuinely improves the moment — never mandatory. */
export function suggestEstateRoute(input: {
  intent: SparkPrimaryIntent;
  friction: SparkDecisionFrictionType;
  currentPlaceId?: string | null;
  landscape?: SparkLandscapeId;
}): EstateRouteSuggestion | null {
  if (input.currentPlaceId) return null;

  if (input.landscape === "crossroads" || input.friction === "prioritization") {
    return {
      placeId: "round-table",
      reason: "Crossroads — reduce decisions, compare choices",
      optional: true,
    };
  }

  if (input.landscape === "mirror_pond" || input.friction === "confidence") {
    return {
      placeId: "hall-of-accomplishments",
      reason: "Mirror Pond — restore perspective with evidence",
      optional: true,
    };
  }

  if (input.landscape === "fog") {
    return {
      placeId: "peaceful-places",
      reason: "Fog — simplify, reduce pressure",
      optional: true,
    };
  }

  if (input.landscape === "maze") {
    return {
      placeId: "clear-my-mind",
      reason: "Maze — organize thoughts before solving",
      optional: true,
    };
  }

  if (input.landscape === "bridge") {
    return {
      placeId: "momentum-room",
      reason: "Bridge — next plank, celebrate starting",
      optional: true,
    };
  }

  if (input.landscape === "campfire") {
    return {
      placeId: "pond",
      reason: "Campfire — presence, listen more than solve",
      optional: true,
    };
  }

  if (input.intent === "LEARN" || input.friction === "knowledge") {
    return {
      placeId: "library",
      reason: "learning — Library grows understanding without overload",
      optional: true,
    };
  }

  if (input.friction === "capacity") {
    return {
      placeId: "pool",
      reason: "restoration — Pool reduces pressure",
      optional: true,
    };
  }

  if (input.friction === "clarity" && input.intent === "THINK") {
    return {
      placeId: "pond",
      reason: "quiet thinking — Pond, no solving required",
      optional: true,
    };
  }

  if (input.intent === "CREATE") {
    return {
      placeId: "creative-studio",
      reason: "creating — Creative Studio for build energy",
      optional: true,
    };
  }

  if (input.friction === "emotional_weight") {
    return {
      placeId: "journal-gazebo",
      reason: "reflection — Journal Gazebo when story needs space",
      optional: true,
    };
  }

  if (input.intent === "SUPPORT" && input.friction === "capacity") {
    return {
      placeId: "peaceful-places",
      reason: "restoration — Peaceful Places for focus or calm",
      optional: true,
    };
  }

  return null;
}

export const ESTATE_ROUTE_FORBIDDEN = [
  "Open the Library",
  "Navigate to",
  "Launch",
  "Choose a room",
] as const;
