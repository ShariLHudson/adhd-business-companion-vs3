/**
 * Estate Knowledge Registry™ — singleton + query helpers (Phase 1).
 */

import { matchAppFeatures } from "@/lib/appFeatureKnowledge";
import { matchCanonicalPlaceInText } from "@/lib/estate/canonicalEstateRegistry";
import {
  buildEstateKnowledgeRegistry,
  canonicalPlaceIdsMissingMedia,
  mediaBackgroundKeysWithoutCanonicalPlace,
} from "./compileRegistry";
import { ESTATE_KNOWLEDGE_SEMANTIC_GROUPS } from "./semanticGroups";
import type {
  EstateKnowledgeAnswer,
  EstateKnowledgeAnswerIntent,
  EstateKnowledgeAuditReport,
  EstateKnowledgeFeatureEntry,
  EstateKnowledgePlaceEntry,
  EstateKnowledgePlaceQuery,
} from "./types";

let cachedRegistry: ReturnType<typeof buildEstateKnowledgeRegistry> | null = null;

function getRegistryInternal() {
  if (!cachedRegistry) {
    cachedRegistry = buildEstateKnowledgeRegistry();
  }
  return cachedRegistry;
}

/** Force recompile — tests only. */
export function resetEstateKnowledgeRegistryCache(): void {
  cachedRegistry = null;
}

export function getEstateKnowledgeRegistry(): Readonly<{
  places: readonly EstateKnowledgePlaceEntry[];
  features: readonly EstateKnowledgeFeatureEntry[];
  meta: ReturnType<typeof buildEstateKnowledgeRegistry>["meta"];
}> {
  return getRegistryInternal();
}

export function queryPlaces(
  query: EstateKnowledgePlaceQuery = {},
): EstateKnowledgePlaceEntry[] {
  let results = [...getRegistryInternal().places];

  if (query.status) {
    results = results.filter((p) => p.status === query.status);
  }
  if (query.walkable !== undefined) {
    results = results.filter((p) => p.walkable === query.walkable);
  }
  if (query.chatCanDescribe !== undefined) {
    results = results.filter(
      (p) => p.chatCanDescribe === query.chatCanDescribe,
    );
  }
  if (query.group) {
    const group = query.group.toLowerCase();
    results = results.filter(
      (p) =>
        p.groups.includes(group) ||
        p.groups.includes(`need:${group}`) ||
        p.groups.includes(`category:${group}`),
    );
  }
  if (query.text?.trim()) {
    const needle = query.text.trim().toLowerCase();
    results = results.filter((p) => {
      if (p.displayName.toLowerCase().includes(needle)) return true;
      if (p.purpose?.toLowerCase().includes(needle)) return true;
      if (p.primaryFeeling.toLowerCase().includes(needle)) return true;
      return p.synonyms.some((s) => s.toLowerCase().includes(needle));
    });
  }

  return results;
}

export function getPlaceById(
  placeId: string,
): EstateKnowledgePlaceEntry | undefined {
  return getRegistryInternal().places.find((p) => p.id === placeId);
}

export function getPlaceByAlias(
  phrase: string,
): EstateKnowledgePlaceEntry | undefined {
  const normalized = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return undefined;

  const exact = getRegistryInternal().places.find((p) =>
    p.synonyms.some(
      (s) => s.trim().toLowerCase().replace(/\s+/g, " ") === normalized,
    ),
  );
  if (exact) return exact;

  const canonical = matchCanonicalPlaceInText(phrase);
  if (canonical) return getPlaceById(canonical.id);

  return getRegistryInternal().places.find((p) =>
    p.synonyms.some((s) => {
      const alias = s.trim().toLowerCase();
      return alias.length >= 3 && normalized.includes(alias);
    }),
  );
}

export function getPlacesByGroup(group: string): EstateKnowledgePlaceEntry[] {
  return queryPlaces({ group });
}

export function getLivePlaces(): EstateKnowledgePlaceEntry[] {
  return queryPlaces({ status: "live" });
}

export function getPlannedPlaces(): EstateKnowledgePlaceEntry[] {
  return queryPlaces({ status: "planned" });
}

export function getFeatureCatalog(): EstateKnowledgeFeatureEntry[] {
  return [...getRegistryInternal().features];
}

function detectAnswerIntent(text: string): {
  intent: EstateKnowledgeAnswerIntent;
  needGroup?: string;
  matchedPlaceId?: string;
} {
  const t = text.trim().toLowerCase();
  if (!t) return { intent: "unknown" };

  if (
    /\b(?:what features?|what tools|what can spark do|what does spark do)\b/i.test(
      text,
    )
  ) {
    return { intent: "feature_catalog" };
  }

  if (/\bhow (?:do i|to) (?:use )?clear my mind\b/i.test(text)) {
    return { intent: "feature_how_to", matchedPlaceId: "clear-my-mind" };
  }

  if (/\bwhat (?:rooms|places) (?:are|do you have|exist)\b/i.test(text)) {
    return { intent: "room_catalog" };
  }

  if (
    /\b(?:near|by|with) (?:the )?water\b/i.test(text) ||
    /\bsomewhere (?:near|by) water\b/i.test(text) ||
    /\bwater(?:side|'?s edge)\b/i.test(text)
  ) {
    return { intent: "places_by_need", needGroup: "water" };
  }

  if (
    /\b(?:somewhere to read|place to read|want to read|quiet read)\b/i.test(
      text,
    ) ||
    /\bread(?:ing)? (?:nook|room|spot)\b/i.test(text)
  ) {
    return { intent: "places_by_need", needGroup: "reading" };
  }

  if (
    /\b(?:treehouse|possibility house|house of possibility|discovery chest|cabinet of chapters)\b/i.test(
      text,
    )
  ) {
    return { intent: "places_by_need", needGroup: "treehouse" };
  }

  if (
    /\b(?:butterfly conservatory|ocean conservatory|the conservatory)\b/i.test(
      text,
    )
  ) {
    const place = getPlaceByAlias(text);
    return {
      intent: "room_story",
      matchedPlaceId: place?.id ?? "conservatory",
    };
  }

  const placeMatch = matchCanonicalPlaceInText(text);
  if (
    placeMatch &&
    /\b(?:tell me about|what is|what's|history of)\b/i.test(text)
  ) {
    return { intent: "room_story", matchedPlaceId: placeMatch.id };
  }

  return { intent: "unknown" };
}

function summarizePlaces(places: EstateKnowledgePlaceEntry[]): string {
  if (places.length === 0) return "No matching Estate places in the registry.";
  const names = places.slice(0, 12).map((p) => p.displayName);
  const suffix =
    places.length > 12 ? ` — and ${places.length - 12} more in the registry.` : ".";
  return `The Estate includes ${names.join(", ")}${suffix}`;
}

export function answerEstateKnowledgeQuery(
  userText: string,
): EstateKnowledgeAnswer {
  const query = userText.trim();
  const { intent, needGroup, matchedPlaceId } = detectAnswerIntent(query);
  const registry = getRegistryInternal();

  switch (intent) {
    case "places_by_need": {
      const places = needGroup ? getPlacesByGroup(needGroup) : [];
      return {
        query,
        intent,
        needGroup,
        placeIds: places.map((p) => p.id),
        featureIds: [],
        summary: summarizePlaces(places),
        places,
      };
    }
    case "room_catalog": {
      const places = registry.places.filter((p) => p.chatCanDescribe);
      return {
        query,
        intent,
        placeIds: places.map((p) => p.id),
        featureIds: [],
        summary: summarizePlaces(places),
        places,
      };
    }
    case "room_story": {
      const place =
        (matchedPlaceId ? getPlaceById(matchedPlaceId) : undefined) ??
        getPlaceByAlias(query);
      const places = place ? [place] : [];
      const summary = place
        ? `${place.displayName} — ${place.primaryFeeling}${place.guidebook ? `. Guidebook: ${place.guidebook.title}.` : ""}`
        : "Could not resolve which Estate place you mean.";
      return {
        query,
        intent,
        matchedPlaceId: place?.id,
        placeIds: places.map((p) => p.id),
        featureIds: [],
        summary,
        places,
      };
    }
    case "feature_catalog": {
      const features = registry.features.filter(
        (f) => f.kind === "app-feature" || f.kind === "estate-experience",
      );
      const names = [
        ...new Set(
          features.slice(0, 16).map((f) => f.name),
        ),
      ];
      return {
        query,
        intent,
        placeIds: [],
        featureIds: features.map((f) => f.id),
        summary: `Spark features and experiences include ${names.join(", ")}.`,
        places: [],
      };
    }
    case "feature_how_to": {
      const features = matchAppFeatures(query);
      const clearMind = getPlaceById("clear-my-mind");
      const featureIds = features.map((f) => f.id);
      const howTo =
        features[0]?.howTo ??
        clearMind?.activities[0] ??
        "Capture thoughts one at a time — no pressure to organize yet.";
      return {
        query,
        intent,
        matchedPlaceId: "clear-my-mind",
        placeIds: clearMind ? [clearMind.id] : [],
        featureIds,
        summary: `Clear My Mind — ${howTo}`,
        places: clearMind ? [clearMind] : [],
      };
    }
    default:
      return {
        query,
        intent: "unknown",
        placeIds: [],
        featureIds: [],
        summary: "No Estate knowledge query intent matched.",
        places: [],
      };
  }
}

export function runEstateKnowledgeAudit(): EstateKnowledgeAuditReport {
  const registry = getRegistryInternal();
  const places = registry.places;

  const canonicalNotKnownToChat = places
    .filter((p) => !p.chatCanDescribe)
    .map((p) => p.id);

  const plannedOfferedAsWalkable = places
    .filter((p) => p.offeredInWanderMenu && !p.walkable)
    .map((p) => p.id);

  const walkableWithoutBrain = places
    .filter((p) => p.walkable && !p.brainEntryId)
    .map((p) => p.id);

  const experiencesInBrain = new Set(
    registry.features
      .filter((f) => f.kind === "estate-experience")
      .map((f) => f.id.replace(/^experience:/, "")),
  );
  const featureGaps: string[] = [
    ...walkableWithoutBrain.map((id) => `walkable_place_missing_brain:${id}`),
  ];
  if (!experiencesInBrain.has("explore")) {
    featureGaps.push("experience:explore_not_in_feature_catalog");
  }

  return {
    generatedAt: new Date().toISOString(),
    registryVersion: registry.meta.registryVersion,
    counts: {
      totalPlaces: places.length,
      live: places.filter((p) => p.status === "live").length,
      planned: places.filter((p) => p.status === "planned").length,
      hidden: places.filter((p) => p.status === "hidden").length,
      broken: places.filter((p) => p.status === "broken").length,
      walkable: places.filter((p) => p.walkable).length,
      chatCanDescribe: places.filter((p) => p.chatCanDescribe).length,
      withGuidebook: places.filter((p) => p.guidebook).length,
      withBrainEntry: places.filter((p) => p.brainEntryId).length,
      features: registry.features.length,
    },
    canonicalNotKnownToChat,
    mediaKeysWithoutRegistryPlace: mediaBackgroundKeysWithoutCanonicalPlace(),
    registryPlacesMissingMedia: canonicalPlaceIdsMissingMedia(places),
    plannedOfferedAsWalkable,
    featureGaps,
  };
}

export function formatEstateKnowledgeAuditReport(
  report: EstateKnowledgeAuditReport = runEstateKnowledgeAudit(),
): string {
  const lines = [
    "=== Estate Knowledge Registry Audit (Phase 1) ===",
    `Generated: ${report.generatedAt}`,
    `Registry version: ${report.registryVersion}`,
    "",
    "Counts:",
    `  total places: ${report.counts.totalPlaces}`,
    `  live: ${report.counts.live}`,
    `  planned: ${report.counts.planned}`,
    `  hidden: ${report.counts.hidden}`,
    `  broken: ${report.counts.broken}`,
    `  walkable: ${report.counts.walkable}`,
    `  chat can describe: ${report.counts.chatCanDescribe}`,
    `  with guidebook: ${report.counts.withGuidebook}`,
    `  with brain entry: ${report.counts.withBrainEntry}`,
    `  features in catalog: ${report.counts.features}`,
    "",
    `Canonical places not known to chat (${report.canonicalNotKnownToChat.length}):`,
    report.canonicalNotKnownToChat.length
      ? report.canonicalNotKnownToChat.map((id) => `  - ${id}`).join("\n")
      : "  (none)",
    "",
    `Media background keys without registry place (${report.mediaKeysWithoutRegistryPlace.length}):`,
    report.mediaKeysWithoutRegistryPlace.length
      ? report.mediaKeysWithoutRegistryPlace.map((id) => `  - ${id}`).join("\n")
      : "  (none)",
    "",
    `Registry places missing media (${report.registryPlacesMissingMedia.length}):`,
    report.registryPlacesMissingMedia.length
      ? report.registryPlacesMissingMedia.map((id) => `  - ${id}`).join("\n")
      : "  (none)",
    "",
    `Planned/non-walkable offered in wander menu (${report.plannedOfferedAsWalkable.length}):`,
    report.plannedOfferedAsWalkable.length
      ? report.plannedOfferedAsWalkable.map((id) => `  - ${id}`).join("\n")
      : "  (none)",
    "",
    `Feature gaps (${report.featureGaps.length}):`,
    report.featureGaps.length
      ? report.featureGaps.map((g) => `  - ${g}`).join("\n")
      : "  (none)",
  ];
  return lines.join("\n");
}

/** Dev helper — semantic group ids compiled into the registry. */
export function listEstateKnowledgeSemanticGroups(): string[] {
  return Object.keys(ESTATE_KNOWLEDGE_SEMANTIC_GROUPS);
}
