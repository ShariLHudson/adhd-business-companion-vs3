import {
  INTEGRATION_CENTER_PRINCIPLE,
  INTEGRATION_GROUPS,
  ONE_OFFICE_MESSAGE,
  SEARCH_INDEX,
  getIntegration,
} from "../../sample/integrationData";

export const integrationSampleRepository = {
  principle: () => INTEGRATION_CENTER_PRINCIPLE,
  oneOfficeMessage: () => ONE_OFFICE_MESSAGE,
  groups: () => INTEGRATION_GROUPS,
  searchIndex: () => SEARCH_INDEX,
  getIntegration,
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchIntegrationSearch(query: string) {
  const q = normalizeQuery(query);
  if (!q) return SEARCH_INDEX;
  return SEARCH_INDEX.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.integrationName.toLowerCase().includes(q) ||
      item.groupId.replace(/-/g, " ").includes(q),
  );
}
