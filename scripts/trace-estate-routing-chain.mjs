/**
 * Trace complete estate routing chain for diagnostic phrases.
 * Run: node scripts/trace-estate-routing-chain.mjs [phrase...]
 */

import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Vitest/ts path aliases — load compiled modules via dynamic import after registering tsx
const phrases = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["butterflies", "apple orchard", "stables", "personal deck", "swing"];

async function loadModules() {
  const { register } = await import("tsx/esm/api");
  register();
  const base = pathToFileURL(path.join(root, "lib/estate/")).href;

  const [
    { classifyCompanionIntent },
    { resolveEstateRoutingDecision, routingDecisionToPlaceResolution },
    { resolveEstatePlace },
    { resolveEstatePlaceIdFromUserText, resolveEstateRoomAliasExact, resolveEstateRoomAliasBounded },
    {
      findPlaceByAlias,
      findPlacesByIntent,
      getNavigationOptions,
      resolveManifestNavigation,
      resolveManifestExactLegacyPlaceId,
      resolveSingleManifestLegacyPlaceFromPhrase,
    },
    { shouldRouteThroughEstateKernel },
  ] = await Promise.all([
    import(new URL("../lib/companionTurn/classifyCompanionIntent.ts", base)),
    import(new URL("estateRoutingRegistry.ts", base)),
    import(new URL("resolveEstatePlace.ts", base)),
    import(new URL("estateRoomAliasRegistry.ts", base)),
    import(new URL("manifest/estatePlaceMasterManifest.ts", base)),
    import(new URL("estateKernelGate.ts", base)),
  ]);

  return {
    classifyCompanionIntent,
    resolveEstateRoutingDecision,
    routingDecisionToPlaceResolution,
    resolveEstatePlace,
    resolveEstatePlaceIdFromUserText,
    resolveEstateRoomAliasExact,
    resolveEstateRoomAliasBounded,
    findPlaceByAlias,
    findPlacesByIntent,
    getNavigationOptions,
    resolveManifestNavigation,
    resolveManifestExactLegacyPlaceId,
    resolveSingleManifestLegacyPlaceFromPhrase,
    shouldRouteThroughEstateKernel,
  };
}

function summarizeManifestMatches(places) {
  return places.map((p) => ({
    placeId: p.place_id,
    legacyPlaceId: p.legacy_place_id,
    officialName: p.official_name,
  }));
}

function tracePhrase(mods, userText) {
  const {
    classifyCompanionIntent,
    resolveEstateRoutingDecision,
    routingDecisionToPlaceResolution,
    resolveEstatePlace,
    resolveEstatePlaceIdFromUserText,
    resolveEstateRoomAliasExact,
    resolveEstateRoomAliasBounded,
    findPlaceByAlias,
    findPlacesByIntent,
    getNavigationOptions,
    resolveManifestNavigation,
    resolveManifestExactLegacyPlaceId,
    resolveSingleManifestLegacyPlaceFromPhrase,
    shouldRouteThroughEstateKernel,
  } = mods;

  const manifestAlias = findPlaceByAlias(userText);
  const manifestIntent = findPlacesByIntent(userText);
  const manifestNav = resolveManifestNavigation(userText);
  const manifestAmbiguity = getNavigationOptions(userText);
  const manifestExact = resolveManifestExactLegacyPlaceId(userText);
  const manifestSingle = resolveSingleManifestLegacyPlaceFromPhrase(userText);

  const legacyExact = resolveEstateRoomAliasExact(userText);
  const legacyBounded = resolveEstateRoomAliasBounded(userText);
  const aliasRegistryId = resolveEstatePlaceIdFromUserText(userText);

  const routingDecision = resolveEstateRoutingDecision(userText);
  const routingResolution = routingDecisionToPlaceResolution(routingDecision);
  const estatePlace = resolveEstatePlace(userText);
  const classified = classifyCompanionIntent({ userText });

  let resolverOrder = [];
  if (manifestAmbiguity.kind === "suggest") {
    resolverOrder.push("getNavigationOptions (manifest ambiguity) → suggest");
  }
  if (manifestNav.kind === "navigate") {
    resolverOrder.push(`resolveManifestNavigation → navigate (${manifestNav.matchedBy})`);
  } else if (manifestNav.kind === "suggest") {
    resolverOrder.push("resolveManifestNavigation → suggest");
  }
  if (routingDecision.reason?.includes("exclusive")) {
    resolverOrder.unshift("matchExclusivePhrase (estateRoutingRegistry)");
  }
  if (!resolverOrder.length && routingDecision.kind === "navigate") {
    resolverOrder.push(`resolveEstateRoutingDecision → ${routingDecision.reason}`);
  }
  if (!resolverOrder.length && routingDecision.kind === "suggest") {
    resolverOrder.push(`resolveEstateRoutingDecision → ${routingDecision.reason}`);
  }
  if (!resolverOrder.length && routingDecision.kind === "none") {
    resolverOrder.push("resolveEstateRoutingDecision → none");
  }

  let finalPlaceId = null;
  let whyWon = routingDecision.reason ?? estatePlace.reason;

  if (routingDecision.kind === "navigate") {
    finalPlaceId = routingDecision.subspaceId ?? routingDecision.placeId;
    whyWon = `${routingDecision.reason}${routingDecision.matchedAlias ? ` (alias: "${routingDecision.matchedAlias}")` : ""}`;
  } else if (routingDecision.kind === "suggest") {
    finalPlaceId = `(choice list: ${routingDecision.suggestedPlaceIds?.join(", ")})`;
    whyWon = routingDecision.reason ?? "ambiguous — member must choose";
  } else if (aliasRegistryId) {
    finalPlaceId = aliasRegistryId;
    whyWon = "estateRoomAliasRegistry resolved after routing returned none";
  } else if (estatePlace.placeId) {
    finalPlaceId = estatePlace.placeId;
    whyWon = estatePlace.reason;
  }

  return {
    rawUserText: userText,
    intentClassification: {
      kind: classified.kind,
      planType: classified.plan.type,
      estateKernelRequired: shouldRouteThroughEstateKernel(userText),
    },
    resolverRanFirst:
      manifestAmbiguity.kind === "suggest"
        ? "getNavigationOptions (before resolveManifestNavigation in routing)"
        : manifestNav.kind !== "none"
          ? "resolveManifestNavigation (via matchManifestNavigation in estateRoutingRegistry)"
          : routingDecision.reason?.includes("exclusive")
            ? "matchExclusivePhrase"
            : "resolveEstateRoutingDecision (canonical registry longest-alias path)",
    resolverChain: resolverOrder,
    manifestMatches: {
      exactAlias: manifestExact,
      aliasMatches: summarizeManifestMatches(manifestAlias),
      intentMatches: summarizeManifestMatches(manifestIntent),
      singlePhraseResolve: manifestSingle,
      navigationResult: {
        kind: manifestNav.kind,
        ...(manifestNav.kind === "navigate"
          ? {
              legacyPlaceId: manifestNav.legacyPlaceId,
              matchedBy: manifestNav.matchedBy,
            }
          : manifestNav.kind === "suggest"
            ? {
                options: manifestNav.options.map((o) => o.legacyPlaceId),
              }
            : {}),
      },
      ambiguityOptions:
        manifestAmbiguity.kind === "suggest"
          ? manifestAmbiguity.options.map((o) => o.legacyPlaceId)
          : null,
    },
    legacyMatches: {
      exact: legacyExact,
      bounded: legacyBounded,
      aliasRegistryFromUserText: aliasRegistryId,
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

const mods = await loadModules();

for (const phrase of phrases) {
  console.log("\n" + "=".repeat(72));
  console.log(JSON.stringify(tracePhrase(mods, phrase), null, 2));
}
