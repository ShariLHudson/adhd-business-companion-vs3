import { integrationSampleRepository, matchIntegrationSearch } from "../repositories/sample";
import type {
  ExecutiveIntegrationBootstrap,
  ExecutiveIntegrationCenterView,
  IntegrationSearchView,
} from "../types";

export function getExecutiveIntegrationBootstrap(): ExecutiveIntegrationBootstrap {
  const groups = integrationSampleRepository.groups();
  const all = groups.flatMap((g) => g.integrations);
  return {
    principle: integrationSampleRepository.principle(),
    oneOfficeMessage: integrationSampleRepository.oneOfficeMessage(),
    connectedCount: all.filter((i) => i.status === "connected").length,
    needsConfigurationCount: all.filter((i) => i.status === "needs-configuration").length,
    groupCount: groups.length,
  };
}

export function composeIntegrationCenterView(): ExecutiveIntegrationCenterView {
  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    groups: integrationSampleRepository.groups(),
    searchIndex: integrationSampleRepository.searchIndex(),
  };
}

export function composeIntegrationSearch(query: string): IntegrationSearchView {
  return {
    product: "founder",
    query: query.trim() || "company search",
    results: matchIntegrationSearch(query),
    generatedAt: new Date().toISOString(),
  };
}

export class ExecutiveIntegrationService {
  center() {
    return composeIntegrationCenterView();
  }

  search(query: string) {
    return composeIntegrationSearch(query);
  }

  bootstrap() {
    return getExecutiveIntegrationBootstrap();
  }

  sampleRepository() {
    return integrationSampleRepository;
  }
}

export const executiveIntegrationService = new ExecutiveIntegrationService();
