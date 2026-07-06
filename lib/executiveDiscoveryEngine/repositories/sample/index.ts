import {
  DISCOVERY_ENGINE_ALERTS,
  DISCOVERY_ENGINE_PRINCIPLE,
  SAMPLE_FINDINGS,
  getAlertForFinding,
  getDiscoveryEngineAlert,
  getSampleFinding,
} from "../../sample/discoveryEngineData";

export const discoveryEngineSampleRepository = {
  principle: () => DISCOVERY_ENGINE_PRINCIPLE,
  findings: () => SAMPLE_FINDINGS,
  alerts: () => DISCOVERY_ENGINE_ALERTS,
  getFinding: (id: string) => getSampleFinding(id),
  getAlert: (id: string) => getDiscoveryEngineAlert(id),
  getAlertForFinding: (findingId: string) => getAlertForFinding(findingId),
};

export function matchFindings(query: string) {
  const q = query.trim().toLowerCase();
  if (!q || q.includes("today") || q.includes("brief") || q.includes("away")) {
    return SAMPLE_FINDINGS;
  }
  if (q.includes("workshop") || q.includes("membership") || q.includes("revenue")) {
    return SAMPLE_FINDINGS.filter((f) => f.id === "ede-butterfly-chain" || f.category === "revenue-opportunities");
  }
  if (q.includes("customer") || q.includes("restart") || q.includes("guilt")) {
    return SAMPLE_FINDINGS.filter((f) => f.category === "emerging-customer-needs");
  }
  if (q.includes("marketing") || q.includes("postcraft") || q.includes("quote")) {
    return SAMPLE_FINDINGS.filter((f) => f.category === "marketing-opportunities");
  }
  if (q.includes("pricing") || q.includes("research") || q.includes("gap")) {
    return SAMPLE_FINDINGS.filter((f) => f.category === "research-opportunities");
  }
  if (q.includes("sprint") || q.includes("habit") || q.includes("productivity")) {
    return SAMPLE_FINDINGS.filter((f) => f.category === "founder-productivity");
  }
  if (q.includes("competitive") || q.includes("risk") || q.includes("ai")) {
    return SAMPLE_FINDINGS.filter((f) => f.category === "competitive-risks");
  }
  return SAMPLE_FINDINGS.slice(0, 3);
}
