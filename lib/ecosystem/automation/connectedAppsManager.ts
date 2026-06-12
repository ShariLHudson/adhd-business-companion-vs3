// Founder Ecosystem — Phase 14 Connected Apps Manager.
// Tracks which external tools are connected so the orchestrator only offers
// automations the founder can actually run, and gives honest guidance when a
// tool is disconnected. Pure.

import type {
  ConnectedApp,
  ConnectedAppId,
  AppStatus,
  ToolCategory,
} from "./automationTypes";

const APP_META: Record<ConnectedAppId, { label: string; category: ToolCategory[] }> = {
  google: { label: "Google Workspace", category: ["documents"] },
  ghl: { label: "GoHighLevel", category: ["marketing", "communications", "calendar"] },
  claude: { label: "Claude", category: ["ai-partners"] },
  canva: { label: "Canva", category: ["marketing"] },
  odoo: { label: "Odoo", category: ["projects"] },
  calendar: { label: "Google Calendar", category: ["calendar"] },
  email: { label: "Email", category: ["communications"] },
};

const ALL_APPS: ConnectedAppId[] = ["google", "ghl", "claude", "canva", "odoo", "calendar", "email"];

/** Default registry — everything disconnected until the founder connects it. */
export function defaultConnectedApps(now: Date = new Date()): ConnectedApp[] {
  return ALL_APPS.map((app) => ({
    app,
    label: APP_META[app].label,
    status: "disconnected" as AppStatus,
    category: APP_META[app].category,
    lastCheckedAt: now.toISOString(),
  }));
}

/** Build a registry from a connection map the host provides. */
export function buildConnectedApps(
  connected: Partial<Record<ConnectedAppId, AppStatus>>,
  now: Date = new Date(),
): ConnectedApp[] {
  return ALL_APPS.map((app) => ({
    app,
    label: APP_META[app].label,
    status: connected[app] ?? "disconnected",
    category: APP_META[app].category,
    lastCheckedAt: now.toISOString(),
  }));
}

export function setAppStatus(
  apps: ConnectedApp[],
  app: ConnectedAppId,
  status: AppStatus,
  note?: string,
): ConnectedApp[] {
  return apps.map((a) =>
    a.app === app ? { ...a, status, note, lastCheckedAt: new Date().toISOString() } : a,
  );
}

export const isConnected = (apps: ConnectedApp[], app: ConnectedAppId): boolean =>
  apps.some((a) => a.app === app && a.status === "connected");

export const connectedApps = (apps: ConnectedApp[]) =>
  apps.filter((a) => a.status === "connected");

export const appsNeedingAttention = (apps: ConnectedApp[]) =>
  apps.filter((a) => a.status === "needs-attention");

export type ConnectedAppsSummary = {
  connected: number;
  disconnected: number;
  needsAttention: number;
  apps: ConnectedApp[];
};

export function summarizeConnectedApps(apps: ConnectedApp[]): ConnectedAppsSummary {
  return {
    connected: apps.filter((a) => a.status === "connected").length,
    disconnected: apps.filter((a) => a.status === "disconnected").length,
    needsAttention: apps.filter((a) => a.status === "needs-attention").length,
    apps,
  };
}
