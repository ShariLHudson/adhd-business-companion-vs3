// ADHD Business Ecosystem Dashboard — GHL embed + ecosystem intelligence surface.
// Go High Level shows this via custom menu / iframe at /ecosystem/dashboard.

import { buildGhlDashboard } from "@/lib/ghl/buildDashboard";
import type {
  GhlContentOpportunity,
  GhlDashboardPayload,
  GhlPeriod,
  GhlProductSignal,
} from "@/lib/ghl/types";

export const BUSINESS_ECOSYSTEM_DASHBOARD_TITLE =
  "ADHD Business Ecosystem Dashboard";

export const BUSINESS_ECOSYSTEM_DASHBOARD_EMBED_PATH = "/ecosystem/dashboard";

export type BusinessEcosystemDashboardPayload = GhlDashboardPayload & {
  dashboardName: typeof BUSINESS_ECOSYSTEM_DASHBOARD_TITLE;
  embedPath: typeof BUSINESS_ECOSYSTEM_DASHBOARD_EMBED_PATH;
};

export type {
  GhlPeriod as BusinessEcosystemPeriod,
  GhlContentOpportunity as BusinessEcosystemContentOpportunity,
  GhlProductSignal as BusinessEcosystemProductSignal,
};

export type BuildBusinessEcosystemDashboardInput = {
  period?: GhlPeriod;
  productSignals?: GhlProductSignal[];
  contentOpportunities?: GhlContentOpportunity[];
};

export async function buildBusinessEcosystemDashboard(
  input: BuildBusinessEcosystemDashboardInput = {},
): Promise<BusinessEcosystemDashboardPayload> {
  const core = await buildGhlDashboard(input);
  return {
    ...core,
    dashboardName: BUSINESS_ECOSYSTEM_DASHBOARD_TITLE,
    embedPath: BUSINESS_ECOSYSTEM_DASHBOARD_EMBED_PATH,
  };
}
