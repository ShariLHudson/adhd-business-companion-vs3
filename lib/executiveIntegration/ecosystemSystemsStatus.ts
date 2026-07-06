import type { MarketingIntegrationLiveStatus } from "./integrationConnection";

export type EcosystemSystemStatusKind = "connected" | "planned" | "not-connected";

export type EcosystemSystemStatusRow = {
  id: string;
  system: string;
  statusKind: EcosystemSystemStatusKind;
  statusLabel: string;
  purpose: string;
  lastSync: string;
};

type EcosystemSystemDefinition = {
  id: string;
  system: string;
  purpose: string;
  alwaysConnected?: boolean;
  alwaysPlanned?: boolean;
  connectedLastSync?: string;
  marketingKey?: keyof MarketingIntegrationLiveStatus;
  connectedMarketingLastSync?: string;
};

const ECOSYSTEM_SYSTEM_DEFINITIONS: readonly EcosystemSystemDefinition[] = [
  {
    id: "founder",
    system: "Founder",
    purpose: "Executive HQ",
    alwaysConnected: true,
    connectedLastSync: "Live",
  },
  {
    id: "companion",
    system: "Spark Companion",
    purpose: "Member Experience",
    alwaysConnected: true,
    connectedLastSync: "Live",
  },
  {
    id: "postcraft",
    system: "PostCraft™",
    purpose: "Content & Marketing",
    marketingKey: "postcraft",
    connectedMarketingLastSync: "2 min ago",
  },
  {
    id: "gohighlevel",
    system: "GoHighLevel",
    purpose: "CRM & Automations",
    marketingKey: "gohighlevel",
    connectedMarketingLastSync: "1 min ago",
  },
  {
    id: "github",
    system: "GitHub",
    purpose: "Development",
    alwaysConnected: true,
    connectedLastSync: "Live",
  },
  {
    id: "cursor",
    system: "Cursor",
    purpose: "Development Assistant",
    alwaysConnected: true,
    connectedLastSync: "Live",
  },
  {
    id: "google-drive",
    system: "Google Drive",
    purpose: "Documents",
    alwaysPlanned: true,
  },
  {
    id: "microsoft-365",
    system: "Microsoft 365",
    purpose: "Email & Calendar",
    alwaysPlanned: true,
  },
] as const;

export const ECOSYSTEM_SYSTEMS_STATUS_HEADLINE =
  "Connected systems at a glance — Founder orchestrates every department.";

function resolveMarketingConnected(
  live: MarketingIntegrationLiveStatus | undefined,
  key: keyof MarketingIntegrationLiveStatus,
): boolean {
  return live?.[key] === "connected";
}

export function composeEcosystemSystemsStatus(
  live?: MarketingIntegrationLiveStatus,
): EcosystemSystemStatusRow[] {
  return ECOSYSTEM_SYSTEM_DEFINITIONS.map((definition) => {
    if (definition.alwaysPlanned) {
      return {
        id: definition.id,
        system: definition.system,
        statusKind: "planned",
        statusLabel: "Planned",
        purpose: definition.purpose,
        lastSync: "Not Connected",
      };
    }

    if (definition.alwaysConnected) {
      return {
        id: definition.id,
        system: definition.system,
        statusKind: "connected",
        statusLabel: "Connected",
        purpose: definition.purpose,
        lastSync: definition.connectedLastSync ?? "Live",
      };
    }

    if (definition.marketingKey) {
      const connected = resolveMarketingConnected(live, definition.marketingKey);
      return {
        id: definition.id,
        system: definition.system,
        statusKind: connected ? "connected" : "not-connected",
        statusLabel: connected ? "Connected" : "Not connected",
        purpose: definition.purpose,
        lastSync: connected
          ? (definition.connectedMarketingLastSync ?? "Live")
          : "Not Connected",
      };
    }

    return {
      id: definition.id,
      system: definition.system,
      statusKind: "not-connected",
      statusLabel: "Not connected",
      purpose: definition.purpose,
      lastSync: "Not Connected",
    };
  });
}
