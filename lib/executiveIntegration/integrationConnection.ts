import type {
  ExecutiveIntegration,
  IntegrationConnectionLabel,
  IntegrationStatus,
} from "./types";

export const POSTCRAFT_CAPABILITIES = [
  { id: "pc-cap-open", label: "Open PostCraft" },
  { id: "pc-cap-send", label: "Send content to PostCraft" },
  { id: "pc-cap-analytics", label: "Import PostCraft analytics" },
] as const;

export const GHL_CAPABILITIES = [
  { id: "ghl-cap-open", label: "Open GHL" },
  { id: "ghl-cap-funnel", label: "Prepare funnel" },
  { id: "ghl-cap-email", label: "Prepare email workflow" },
  { id: "ghl-cap-results", label: "Import campaign results" },
] as const;

export type MarketingIntegrationLiveStatus = {
  postcraft: IntegrationConnectionLabel;
  gohighlevel: IntegrationConnectionLabel;
};

export type EcosystemDashboardStatusPayload = {
  ghlApiConfigured?: boolean;
  locationIdConfigured?: boolean;
  ecosystemSignalsLive?: boolean;
  founderDbConfigured?: boolean;
};

export function integrationConnectionLabel(
  status: IntegrationStatus,
): IntegrationConnectionLabel {
  return status === "connected" ? "connected" : "not-connected";
}

export function parseMarketingIntegrationStatus(
  payload: EcosystemDashboardStatusPayload | null | undefined,
): MarketingIntegrationLiveStatus {
  if (!payload) {
    return { postcraft: "not-connected", gohighlevel: "not-connected" };
  }

  const postcraftLive =
    Boolean(payload.ecosystemSignalsLive) || Boolean(payload.founderDbConfigured);
  const ghlLive =
    Boolean(payload.ghlApiConfigured) && Boolean(payload.locationIdConfigured);

  return {
    postcraft: postcraftLive ? "connected" : "not-connected",
    gohighlevel: ghlLive ? "connected" : "not-connected",
  };
}

export function resolveIntegrationConnectionLabel(
  integration: ExecutiveIntegration,
  live?: MarketingIntegrationLiveStatus,
): IntegrationConnectionLabel {
  if (integration.id === "postcraft" && live) return live.postcraft;
  if (integration.id === "gohighlevel" && live) return live.gohighlevel;
  return integrationConnectionLabel(integration.status);
}

export const INTEGRATION_OPEN_ROUTES: Record<string, string> = {
  postcraft: "/ecosystem/dashboard",
  gohighlevel: "/ghl/dashboard",
};

export function resolveIntegrationActionHref(
  integrationId: string,
  actionId: string,
): string | undefined {
  if (actionId.endsWith("-open") || actionId === "pc-open" || actionId === "ghl-open") {
    return INTEGRATION_OPEN_ROUTES[integrationId];
  }
  if (integrationId === "postcraft" && actionId === "pc-send") {
    return "/companion/founder/creation-studio";
  }
  if (integrationId === "postcraft" && actionId === "pc-analytics") {
    return "/ecosystem/dashboard";
  }
  if (integrationId === "gohighlevel" && actionId === "ghl-funnel") {
    return "/ghl/dashboard";
  }
  if (integrationId === "gohighlevel" && actionId === "ghl-email") {
    return "/ghl/dashboard";
  }
  if (integrationId === "gohighlevel" && actionId === "ghl-results") {
    return "/ghl/dashboard";
  }
  return INTEGRATION_OPEN_ROUTES[integrationId];
}
