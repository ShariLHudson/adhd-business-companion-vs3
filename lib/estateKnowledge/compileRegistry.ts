/**
 * Compile Estate Knowledge Registry from existing sources (Phase 1 — read-only).
 */

import { getEstateGuideSpreadForPlaceId } from "@/data/estateGuideSpreads";
import { APP_FEATURES } from "@/lib/appFeatureKnowledge";
import {
  CANONICAL_ESTATE_REGISTRY,
  CANONICAL_ESTATE_REGISTRY_VERSION,
} from "@/lib/estate/canonicalEstateRegistry";
import type { CanonicalEstatePlace } from "@/lib/estate/canonicalEstateRegistryTypes";
import { resolveEstateMount } from "@/lib/estate/estateMountRegistry";
import {
  CANONICAL_PLACE_BACKGROUNDS,
  CANONICAL_PLACE_BACKGROUND_FALLBACKS,
  resolveCanonicalPlaceAmbience,
  resolveCanonicalPlaceBackground,
  resolveCanonicalPlaceBackgroundCandidates,
} from "@/lib/estate/estatePlaceMedia";
import { ESTATE_WANDER_PLACE_ORDER } from "@/lib/estate/estateWanderNavigation";
import { isLiveEstatePlace } from "@/lib/estate/liveEstatePlace";
import {
  estateBrainEntryBySpaceId,
  estateBrainExperiences,
  estateBrainSpaces,
} from "@/lib/estateBrain/knowledgeRegistry";
import { ESTATE_KNOWLEDGE_SEMANTIC_GROUPS } from "./semanticGroups";
import type {
  EstateKnowledgeFeatureEntry,
  EstateKnowledgeGuidebookRef,
  EstateKnowledgePlaceEntry,
  EstateKnowledgePlaceStatus,
} from "./types";

export const ESTATE_KNOWLEDGE_REGISTRY_VERSION = "1.0.0" as const;

const WANDER_MENU_IDS = new Set<string>(ESTATE_WANDER_PLACE_ORDER);

function normalizePath(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.replace(/%20/g, " ").toLowerCase();
}

function pathsDiverge(a: string | null, b: string | null): boolean {
  const na = normalizePath(a);
  const nb = normalizePath(b);
  if (!na || !nb) return false;
  return na !== nb;
}

function deriveKnowledgeStatus(
  place: CanonicalEstatePlace,
  brokenReasons: string[],
): EstateKnowledgePlaceStatus {
  if (brokenReasons.length > 0) return "broken";
  if (place.status === "future") return "hidden";
  if (place.status === "planned") return "planned";
  return "live";
}

function buildGroups(place: CanonicalEstatePlace): string[] {
  const groups = new Set<string>([`category:${place.category}`]);
  for (const profile of place.suggestionProfiles ?? []) {
    groups.add(`need:${profile}`);
  }
  for (const [groupName, ids] of Object.entries(ESTATE_KNOWLEDGE_SEMANTIC_GROUPS)) {
    if ((ids as readonly string[]).includes(place.id)) {
      groups.add(groupName);
    }
  }
  const brain = estateBrainEntryBySpaceId(place.id);
  for (const need of brain?.userNeeds ?? []) {
    groups.add(`need:${need}`);
  }
  if (place.parentPlaceId?.startsWith("house-possibility")) {
    groups.add("treehouse");
  }
  return [...groups].sort();
}

function buildSynonyms(place: CanonicalEstatePlace): string[] {
  const set = new Set<string>();
  set.add(place.officialName.replace(/™/g, "").trim());
  for (const alias of place.aliases) {
    set.add(alias);
  }
  const brain = estateBrainEntryBySpaceId(place.id);
  for (const alias of brain?.aliases ?? []) {
    set.add(alias);
  }
  return [...set].filter(Boolean);
}

function buildActivities(place: CanonicalEstatePlace): string[] {
  const brain = estateBrainEntryBySpaceId(place.id);
  const fromBrain = brain?.suggestedActivities ?? [];
  const fromActions = place.availableActions ?? [];
  return [...new Set([...fromBrain, ...fromActions])];
}

function buildEmotionalUses(place: CanonicalEstatePlace): string[] {
  const uses = new Set<string>();
  if (place.primaryFeeling) uses.add(place.primaryFeeling);
  if (place.purpose) uses.add(place.purpose);
  for (const profile of place.suggestionProfiles ?? []) {
    uses.add(profile);
  }
  const brain = estateBrainEntryBySpaceId(place.id);
  if (brain?.purpose) uses.add(brain.purpose);
  for (const need of brain?.userNeeds ?? []) {
    uses.add(need);
  }
  return [...uses];
}

function buildGuidebookRef(placeId: string): EstateKnowledgeGuidebookRef | null {
  const spread = getEstateGuideSpreadForPlaceId(placeId);
  if (!spread) return null;
  return {
    spreadId: spread.id,
    title: spread.title,
    epigraph: spread.epigraph,
    openingLine: spread.openingLine,
    tagline: spread.guideSubtitle,
  };
}

function compilePlaceEntry(place: CanonicalEstatePlace): EstateKnowledgePlaceEntry {
  const mediaPrimary = resolveCanonicalPlaceBackground(place.id);
  const mediaFallbacks = (
    CANONICAL_PLACE_BACKGROUND_FALLBACKS[place.id] ?? []
  ).filter((url) => url !== mediaPrimary);
  const ambience = resolveCanonicalPlaceAmbience(place.id);
  const mount = resolveEstateMount(place.id);
  const guidebook = buildGuidebookRef(place.id);
  const brain = estateBrainEntryBySpaceId(place.id);
  const walkable = isLiveEstatePlace(place.id);
  const offeredInWanderMenu = WANDER_MENU_IDS.has(place.id);

  const brokenReasons: string[] = [];

  if (offeredInWanderMenu && !walkable) {
    brokenReasons.push("offered_in_wander_menu_but_not_walkable");
  }
  if (walkable && !mediaPrimary && !place.backgroundImage) {
    brokenReasons.push("walkable_without_background_media");
  }
  if (
    place.backgroundImage &&
    mediaPrimary &&
    pathsDiverge(place.backgroundImage, mediaPrimary)
  ) {
    brokenReasons.push("registry_background_differs_from_media_map");
  }
  if (walkable && !brain && !guidebook && !place.purpose) {
    brokenReasons.push("walkable_without_chat_description_source");
  }

  const chatCanDescribe = Boolean(brain || guidebook);

  return {
    id: place.id,
    displayName: place.officialName,
    status: deriveKnowledgeStatus(place, brokenReasons),
    canonicalStatus: place.status,
    category: place.category,
    groups: buildGroups(place),
    synonyms: buildSynonyms(place),
    emotionalUses: buildEmotionalUses(place),
    activities: buildActivities(place),
    relatedPlaces: [...place.relatedPlaces],
    media: {
      backgroundImage: mediaPrimary,
      backgroundFallbacks: mediaFallbacks,
      registryBackgroundImage: place.backgroundImage,
      audio: ambience
        ? { src: ambience.src, character: ambience.character }
        : null,
      videos: [],
    },
    routeDestination: mount
      ? {
          appSection: mount.appSection,
          experienceTier: mount.experienceTier,
          navigable: mount.navigable,
          shellComponent: mount.shellComponent,
        }
      : null,
    guidebook,
    walkable,
    chatCanDescribe,
    offeredInWanderMenu,
    brainEntryId: brain?.id ?? null,
    purpose: place.purpose,
    primaryFeeling: place.primaryFeeling,
    brokenReasons,
  };
}

function compileFeatureCatalog(): EstateKnowledgeFeatureEntry[] {
  const features: EstateKnowledgeFeatureEntry[] = APP_FEATURES.map((f) => ({
    id: f.id,
    name: f.name,
    kind: "app-feature" as const,
    howTo: f.howTo,
    navigation: f.navigation,
  }));

  for (const experience of estateBrainExperiences()) {
    features.push({
      id: `experience:${experience.id}`,
      name: experience.name,
      kind: "estate-experience",
      howTo: experience.description,
      relatedPlaceIds: [experience.spaceId, ...experience.relatedSpaceIds],
    });
    for (const tool of experience.tools) {
      features.push({
        id: `tool:${experience.id}:${tool.toLowerCase().replace(/\s+/g, "-")}`,
        name: tool,
        kind: "estate-space-tool",
        howTo: experience.description,
        relatedPlaceIds: [experience.spaceId],
      });
    }
  }

  for (const space of estateBrainSpaces()) {
    if (features.some((f) => f.id === `experience:${space.id}`)) continue;
    for (const tool of space.tools) {
      features.push({
        id: `tool:${space.id}:${tool.toLowerCase().replace(/\s+/g, "-")}`,
        name: tool,
        kind: "estate-space-tool",
        howTo: space.description,
        relatedPlaceIds: [space.spaceId],
      });
    }
  }

  return features;
}

export function buildEstateKnowledgeRegistry(): {
  places: readonly EstateKnowledgePlaceEntry[];
  features: readonly EstateKnowledgeFeatureEntry[];
  meta: {
    registryVersion: string;
    canonicalRegistryVersion: string;
    compiledAt: string;
  };
} {
  const places = CANONICAL_ESTATE_REGISTRY.map(compilePlaceEntry);
  return {
    places,
    features: compileFeatureCatalog(),
    meta: {
      registryVersion: ESTATE_KNOWLEDGE_REGISTRY_VERSION,
      canonicalRegistryVersion: CANONICAL_ESTATE_REGISTRY_VERSION,
      compiledAt: new Date().toISOString(),
    },
  };
}

/** Background map keys not tied to a canonical place id. */
export function mediaBackgroundKeysWithoutCanonicalPlace(): string[] {
  const canonicalIds = new Set(CANONICAL_ESTATE_REGISTRY.map((p) => p.id));
  return Object.keys(CANONICAL_PLACE_BACKGROUNDS).filter(
    (key) => !canonicalIds.has(key),
  );
}

/** Canonical ids with no resolved background from media or registry. */
export function canonicalPlaceIdsMissingMedia(
  places: readonly EstateKnowledgePlaceEntry[],
): string[] {
  return places
    .filter(
      (p) =>
        !p.media.backgroundImage &&
        !p.media.registryBackgroundImage &&
        p.media.backgroundFallbacks.length === 0,
    )
    .map((p) => p.id);
}
