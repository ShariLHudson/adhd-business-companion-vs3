import {
  matchAlertsForDiscoveries,
  matchDiscoveries,
  relationshipIntelligenceSampleRepository,
} from "../repositories/sample";
import type {
  DiscoveryDetailView,
  RelationshipIntelligenceBootstrap,
  RelationshipIntelligenceSessionView,
} from "../types";

export function getRelationshipIntelligenceBootstrap(): RelationshipIntelligenceBootstrap {
  const discoveries = relationshipIntelligenceSampleRepository.discoveries();
  return {
    featuredDiscoveryId: "disc-seven-conversations",
    founderAlertIds: relationshipIntelligenceSampleRepository.alerts().map((a) => a.id),
    discoveryCount: discoveries.length,
    categoriesRepresented: [...new Set(discoveries.map((d) => d.category))],
  };
}

export function composeDiscoverySession(query: string): RelationshipIntelligenceSessionView | null {
  const trimmed = query.trim();
  const discoveries = trimmed ? matchDiscoveries(trimmed) : relationshipIntelligenceSampleRepository.discoveries();
  if (discoveries.length === 0) return null;
  return {
    product: "founder",
    query: trimmed || "What might we be missing?",
    discoveries,
    founderAlerts: matchAlertsForDiscoveries(discoveries.map((d) => d.id)),
    generatedAt: new Date().toISOString(),
  };
}

export function composeDiscoveryDetail(discoveryId: string): DiscoveryDetailView | null {
  const discovery = relationshipIntelligenceSampleRepository.getDiscovery(discoveryId);
  if (!discovery) return null;
  return {
    product: "founder",
    discovery,
    founderAlert: relationshipIntelligenceSampleRepository.getAlertForDiscovery(discoveryId),
    generatedAt: new Date().toISOString(),
  };
}

export class ExecutiveRelationshipIntelligenceService {
  compose(query: string) {
    return composeDiscoverySession(query);
  }

  composeDetail(discoveryId: string) {
    return composeDiscoveryDetail(discoveryId);
  }

  bootstrap() {
    return getRelationshipIntelligenceBootstrap();
  }

  sampleRepository() {
    return relationshipIntelligenceSampleRepository;
  }
}

export const executiveRelationshipIntelligenceService = new ExecutiveRelationshipIntelligenceService();
