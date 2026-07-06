import {
  FOUNDER_ALERTS,
  RELATIONSHIP_INTELLIGENCE_PRINCIPLE,
  SAMPLE_DISCOVERIES,
  getAlertForDiscovery,
  getFounderAlert,
  getSampleDiscovery,
} from "../../sample/discoveryIntelligenceData";

export const relationshipIntelligenceSampleRepository = {
  principle: () => RELATIONSHIP_INTELLIGENCE_PRINCIPLE,
  discoveries: () => SAMPLE_DISCOVERIES,
  alerts: () => FOUNDER_ALERTS,
  getDiscovery: (id: string) => getSampleDiscovery(id),
  getAlert: (id: string) => getFounderAlert(id),
  getAlertForDiscovery: (discoveryId: string) => getAlertForDiscovery(discoveryId),
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchDiscoveries(query: string) {
  const q = normalizeQuery(query);
  if (!q || q.includes("what might we be missing") || q.includes("discover")) {
    return SAMPLE_DISCOVERIES;
  }
  if (q.includes("customer") || q.includes("conversation") || q.includes("pattern")) {
    return SAMPLE_DISCOVERIES.filter((d) => d.category === "hidden-customer-patterns");
  }
  if (q.includes("butterfly") || q.includes("membership") || q.includes("workshop")) {
    return SAMPLE_DISCOVERIES.filter((d) => d.id === "disc-butterfly-restart" || d.category === "emerging-opportunities");
  }
  if (q.includes("postcraft") || q.includes("founder") || q.includes("marketing")) {
    return SAMPLE_DISCOVERIES.filter((d) => d.category === "marketing-relationships" || d.category === "founder-habits");
  }
  if (q.includes("pricing") || q.includes("gap") || q.includes("research")) {
    return SAMPLE_DISCOVERIES.filter((d) => d.category === "research-relationships");
  }
  if (q.includes("habit") || q.includes("sprint")) {
    return SAMPLE_DISCOVERIES.filter((d) => d.category === "founder-habits");
  }
  if (q.includes("listening")) {
    return SAMPLE_DISCOVERIES.filter((d) =>
      d.relatedProductIds.includes("listening-rooms") || d.headline.toLowerCase().includes("listening"),
    );
  }
  return SAMPLE_DISCOVERIES.slice(0, 3);
}

export function matchAlertsForDiscoveries(discoveryIds: string[]) {
  const ids = new Set(discoveryIds);
  return FOUNDER_ALERTS.filter((a) => ids.has(a.discoveryId));
}
