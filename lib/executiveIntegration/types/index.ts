/** Executive Integration Center — One Office Principle bridge to external systems. */

export type IntegrationGroupId =
  | "communication"
  | "development"
  | "marketing"
  | "operations"
  | "business"
  | "ai"
  | "social-media"
  | "productivity"
  | "research";

export type IntegrationStatus =
  | "connected"
  | "needs-configuration"
  | "offline"
  | "future"
  | "unavailable";

export type IntegrationCapability = {
  id: string;
  label: string;
};

export type IntegrationConnectionLabel = "connected" | "not-connected";

export type IntegrationQuickActionKind =
  | "open"
  | "resume"
  | "continue"
  | "prepare"
  | "review"
  | "compose"
  | "research"
  | "launch";

export type IntegrationQuickAction = {
  id: string;
  kind: IntegrationQuickActionKind;
  label: string;
};

export type IntegrationHighlight = {
  id: string;
  label: string;
  value: string;
};

export type ExecutiveIntegration = {
  id: string;
  name: string;
  groupId: IntegrationGroupId;
  tagline: string;
  status: IntegrationStatus;
  lastConnectedAt?: string;
  lastActivityAt?: string;
  lastActivitySummary?: string;
  highlights: IntegrationHighlight[];
  /** Plain-English capabilities — what this integration will do for Shari */
  capabilities: IntegrationCapability[];
  quickActions: IntegrationQuickAction[];
  openUrl?: string;
  orchestrationNote: string;
};

export type IntegrationGroup = {
  id: IntegrationGroupId;
  label: string;
  purpose: string;
  integrations: ExecutiveIntegration[];
};

export type IntegrationSearchResult = {
  id: string;
  integrationId: string;
  integrationName: string;
  groupId: IntegrationGroupId;
  title: string;
  summary: string;
  openUrl?: string;
};

export type ExecutiveIntegrationBootstrap = {
  principle: string;
  oneOfficeMessage: string;
  connectedCount: number;
  needsConfigurationCount: number;
  groupCount: number;
};

export type ExecutiveIntegrationCenterView = {
  product: "founder";
  generatedAt: string;
  groups: IntegrationGroup[];
  searchIndex: IntegrationSearchResult[];
};

export type IntegrationSearchView = {
  product: "founder";
  query: string;
  results: IntegrationSearchResult[];
  generatedAt: string;
};
