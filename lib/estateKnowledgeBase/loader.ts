/**
 * Estate Knowledge Base — registry loaders.
 */

import roomsJson from "@/docs/estate-knowledge-base/rooms.json";
import featuresJson from "@/docs/estate-knowledge-base/features.json";
import toolsJson from "@/docs/estate-knowledge-base/tools.json";
import settingsJson from "@/docs/estate-knowledge-base/settings.json";
import routesJson from "@/docs/estate-knowledge-base/routes.json";
import vocabularyJson from "@/docs/estate-knowledge-base/vocabulary.json";
import discoveryMappingsJson from "@/docs/estate-knowledge-base/discovery-mappings.json";
import sparkcardMappingsJson from "@/docs/estate-knowledge-base/sparkcard-mappings.json";
import momentumMappingsJson from "@/docs/estate-knowledge-base/momentum-mappings.json";

import type {
  DiscoveryMapping,
  DiscoveryTargetRegistry,
  EstateKnowledgeItem,
  EstateKnowledgeRegistryFile,
  EstateKnowledgeRegistryId,
  EstateVocabulary,
  MomentumActivity,
  MomentumEntityMapping,
  SparkCardMapping,
} from "./types";

const REGISTRY_FILES: Record<EstateKnowledgeRegistryId, EstateKnowledgeRegistryFile> = {
  rooms: roomsJson as EstateKnowledgeRegistryFile,
  features: featuresJson as EstateKnowledgeRegistryFile,
  tools: toolsJson as EstateKnowledgeRegistryFile,
  settings: settingsJson as EstateKnowledgeRegistryFile,
  routes: routesJson as EstateKnowledgeRegistryFile,
};

const DISCOVERY_TARGET_TO_REGISTRY: Record<
  DiscoveryTargetRegistry,
  EstateKnowledgeRegistryId
> = {
  "estate-rooms": "rooms",
  "estate-features": "features",
  "estate-tools": "tools",
  "estate-settings": "settings",
  "estate-routes": "routes",
};

export function getKnowledgeRegistry(
  registryId: EstateKnowledgeRegistryId,
): EstateKnowledgeItem[] {
  return REGISTRY_FILES[registryId]?.items ?? [];
}

export function getKnowledgeItem(
  registryId: EstateKnowledgeRegistryId,
  id: string,
): EstateKnowledgeItem | null {
  return getKnowledgeRegistry(registryId).find((item) => item.id === id) ?? null;
}

export function getLiveKnowledgeItems(
  registryId: EstateKnowledgeRegistryId,
): EstateKnowledgeItem[] {
  return getKnowledgeRegistry(registryId).filter((item) => item.status === "Live");
}

export function getEstateVocabulary(): EstateVocabulary {
  return vocabularyJson as EstateVocabulary;
}

export function getDiscoveryMappings(): DiscoveryMapping[] {
  const doc = discoveryMappingsJson as { mappings: DiscoveryMapping[] };
  return doc.mappings ?? [];
}

export function getDiscoveryMappingForSource(
  sourceType: DiscoveryMapping["sourceType"],
  sourceId: string,
): DiscoveryMapping | null {
  return (
    getDiscoveryMappings().find(
      (mapping) =>
        mapping.sourceType === sourceType && mapping.sourceId === sourceId,
    ) ?? null
  );
}

export function getSparkCardMappings(): SparkCardMapping[] {
  const doc = sparkcardMappingsJson as { mappings: SparkCardMapping[] };
  return doc.mappings ?? [];
}

export function getMomentumActivities(): MomentumActivity[] {
  const doc = momentumMappingsJson as { activities: MomentumActivity[] };
  return doc.activities ?? [];
}

export function getMomentumEntityMappings(): MomentumEntityMapping[] {
  const doc = momentumMappingsJson as {
    entityMappings: MomentumEntityMapping[];
  };
  return doc.entityMappings ?? [];
}

/** Bridge for Discovery Key target registries */
export function getEstateIntelligenceRegistry(
  registry: DiscoveryTargetRegistry,
): EstateKnowledgeItem[] {
  return getKnowledgeRegistry(DISCOVERY_TARGET_TO_REGISTRY[registry]);
}

export function getEstateIntelligenceItem(
  registry: DiscoveryTargetRegistry,
  id: string,
): EstateKnowledgeItem | null {
  return getKnowledgeItem(DISCOVERY_TARGET_TO_REGISTRY[registry], id);
}

export function resolveKnowledgeNavigationRoute(
  registryId: EstateKnowledgeRegistryId,
  id: string,
): string | null {
  const item = getKnowledgeItem(registryId, id);
  if (!item || item.status !== "Live") return null;
  return item.route;
}

export function searchKnowledgeItems(query: string): EstateKnowledgeItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const all = (
    Object.keys(REGISTRY_FILES) as EstateKnowledgeRegistryId[]
  ).flatMap((registryId) => getKnowledgeRegistry(registryId));

  return all.filter((item) => {
    if (item.id.toLowerCase().includes(needle)) return true;
    if (item.officialName.toLowerCase().includes(needle)) return true;
    if (item.keywords.some((word) => word.toLowerCase().includes(needle))) {
      return true;
    }
    if (item.tags.some((tag) => tag.toLowerCase().includes(needle))) {
      return true;
    }
    return false;
  });
}
