import { describe, it } from "vitest";
import { classifyCompanionIntent } from "@/lib/companionTurn/classifyCompanionIntent";
import { shouldRouteThroughEstateKernel } from "@/lib/estate/estateKernelGate";
import {
  resolveEstateRoutingDecision,
  routingDecisionToPlaceResolution,
} from "@/lib/estate/estateRoutingRegistry";
import { resolveEstatePlace } from "@/lib/estate/resolveEstatePlace";
import {
  resolveEstatePlaceIdFromUserText,
  resolveEstateRoomAliasExact,
  resolveEstateRoomAliasBounded,
} from "@/lib/estate/estateRoomAliasRegistry";
import {
  findPlaceByAlias,
  findPlacesByIntent,
  getNavigationOptions,
  resolveManifestNavigation,
  resolveManifestExactLegacyPlaceId,
  resolveSingleManifestLegacyPlaceFromPhrase,
} from "@/lib/estate/manifest/estatePlaceMasterManifest";

const PHRASES = [
  "butterflies",
  "apple orchard",
  "stables",
  "personal deck",
  "swing",
] as const;

function trace(userText: string) {
  const manifestAlias = findPlaceByAlias(userText);
  const manifestIntent = findPlacesByIntent(userText);
  const manifestNav = resolveManifestNavigation(userText);
  const manifestAmbiguity = getNavigationOptions(userText);

  const routingDecision = resolveEstateRoutingDecision(userText);
  const estatePlace = resolveEstatePlace(userText);
  const classified = classifyCompanionIntent({ userText });

  let resolverRanFirst: string;
  if (manifestAmbiguity.kind === "suggest") {
    resolverRanFirst =
      "getNavigationOptions → ambiguity (runs inside resolveManifestNavigation first)";
  } else if (manifestNav.kind === "navigate") {
    resolverRanFirst = `resolveManifestNavigation → ${manifestNav.matchedBy}`;
  } else if (manifestNav.kind === "suggest") {
    resolverRanFirst = "resolveManifestNavigation → ambiguous alias/intent";
  } else if (routingDecision.reason?.includes("exclusive")) {
    resolverRanFirst = "matchExclusivePhrase (estateRoutingRegistry)";
  } else {
    resolverRanFirst = `resolveEstateRoutingDecision → ${routingDecision.reason}`;
  }

  let finalPlaceId: string | null = null;
  let whyWon = routingDecision.reason ?? estatePlace.reason;

  if (routingDecision.kind === "navigate") {
    finalPlaceId = routingDecision.subspaceId ?? routingDecision.placeId ?? null;
    whyWon = `${routingDecision.reason}${routingDecision.matchedAlias ? ` — matched "${routingDecision.matchedAlias}"` : ""}`;
  } else if (routingDecision.kind === "suggest") {
    finalPlaceId = `[choose: ${routingDecision.suggestedPlaceIds?.join(" | ")}]`;
    whyWon = routingDecision.reason ?? "ambiguous destination";
  } else if (resolveEstatePlaceIdFromUserText(userText)) {
    finalPlaceId = resolveEstatePlaceIdFromUserText(userText);
    whyWon = "alias registry only (routing returned none)";
  }

  return {
    rawUserText: userText,
    intentClassification: {
      kind: classified.kind,
      planType: classified.plan.type,
      estateKernelRequired: shouldRouteThroughEstateKernel(userText),
    },
    resolverRanFirst,
    manifestMatches: {
      exactAlias: resolveManifestExactLegacyPlaceId(userText),
      aliasMatches: manifestAlias.map((p) => ({
        legacy: p.legacy_place_id,
        name: p.official_name,
      })),
      intentMatches: manifestIntent.map((p) => ({
        legacy: p.legacy_place_id,
        name: p.official_name,
      })),
      singlePhrase: resolveSingleManifestLegacyPlaceFromPhrase(userText),
      navigationKind: manifestNav.kind,
      ambiguityIds:
        manifestAmbiguity.kind === "suggest"
          ? manifestAmbiguity.options.map((o) => o.legacyPlaceId)
          : null,
    },
    legacyMatches: {
      exact: resolveEstateRoomAliasExact(userText),
      bounded: resolveEstateRoomAliasBounded(userText),
      fromUserText: resolveEstatePlaceIdFromUserText(userText),
    },
    routingDecision: {
      kind: routingDecision.kind,
      placeId: routingDecision.placeId,
      subspaceId: routingDecision.subspaceId,
      suggestedPlaceIds: routingDecision.suggestedPlaceIds,
      reason: routingDecision.reason,
      matchedAlias: routingDecision.matchedAlias,
    },
    resolveEstatePlace: {
      kind: estatePlace.kind,
      placeId: estatePlace.placeId,
      reason: estatePlace.reason,
    },
    finalSelectedPlaceId: finalPlaceId,
    whyFinalDestinationWon: whyWon,
  };
}

describe("estate routing chain trace", () => {
  it.each(PHRASES)('trace "%s"', (phrase) => {
    const result = trace(phrase);
    console.log("\n" + JSON.stringify(result, null, 2));
  });
});
