/**
 * Connections → Services — expandable categories (single source of truth for
 * which services the member uses). Auth + built-in options live here.
 * Destination defaults are remembered quietly via Crystal Actions.
 */

import {
  connectionStatusLabel,
  normalizeConnectionStatus,
  type GoogleConnectionSnapshot,
  type SettingsConnectionStatus,
} from "./settingsConnectionCatalog";
import { isCanvaConnected } from "./canvaConnection";
import { isOutlookCalendarConnected } from "./outlookCalendarConnection";
import type {
  CalendarProviderPreference,
  DocumentsProviderPreference,
  StorageProviderPreference,
} from "./digitalWorkspacePreferences";

export type ServiceCategoryId =
  | "calendar"
  | "documents"
  | "storage"
  | "design";

export type ServiceItemId =
  | "google-calendar"
  | "outlook-calendar"
  | "spark-estate-documents"
  | "google-docs"
  | "microsoft-word"
  | "spark-estate-storage"
  | "google-drive"
  | "canva";

export type ServiceItemKind =
  | "google-oauth"
  | "outlook-local"
  | "canva-local"
  | "built-in"
  | "preference-only";

export type ServiceItemDef = {
  id: ServiceItemId;
  label: string;
  kind: ServiceItemKind;
  /** When selecting a built-in / preference-only item, update this preference. */
  preferenceKey?: "documents" | "storage" | "calendar";
  preferenceValue?:
    | DocumentsProviderPreference
    | StorageProviderPreference
    | CalendarProviderPreference;
};

export type ServiceCategoryDef = {
  id: ServiceCategoryId;
  label: string;
  items: readonly ServiceItemDef[];
};

export const SERVICE_CATEGORIES: readonly ServiceCategoryDef[] = [
  {
    id: "calendar",
    label: "Calendar",
    items: [
      {
        id: "google-calendar",
        label: "Google Calendar",
        kind: "google-oauth",
        preferenceKey: "calendar",
        preferenceValue: "google",
      },
      {
        id: "outlook-calendar",
        label: "Outlook Calendar",
        kind: "outlook-local",
        preferenceKey: "calendar",
        preferenceValue: "outlook",
      },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    items: [
      {
        id: "spark-estate-documents",
        label: "Spark Estate Documents",
        kind: "built-in",
        preferenceKey: "documents",
        preferenceValue: "spark-estate",
      },
      {
        id: "google-docs",
        label: "Google Docs",
        kind: "google-oauth",
        preferenceKey: "documents",
        preferenceValue: "google-docs",
      },
      {
        id: "microsoft-word",
        label: "Microsoft Word",
        kind: "preference-only",
        preferenceKey: "documents",
        preferenceValue: "microsoft-word",
      },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    items: [
      {
        id: "spark-estate-storage",
        label: "Spark Estate Storage",
        kind: "built-in",
        preferenceKey: "storage",
        preferenceValue: "spark-estate",
      },
      {
        id: "google-drive",
        label: "Google Drive",
        kind: "google-oauth",
        preferenceKey: "storage",
        preferenceValue: "google-drive",
      },
      // OneDrive / Dropbox — supported when integrations ship (hidden until then).
    ],
  },
  {
    id: "design",
    label: "Design",
    items: [
      {
        id: "canva",
        label: "Canva",
        kind: "canva-local",
      },
    ],
  },
] as const;

export type ServiceItemState = ServiceItemDef & {
  status: SettingsConnectionStatus;
  statusLabel: string;
  /** Member-facing Connected ✓ when ready */
  showConnectedCheck: boolean;
  connectHref: string | null;
  accountEmail?: string | null;
};

export type ServiceCategoryState = {
  id: ServiceCategoryId;
  label: string;
  items: ServiceItemState[];
  /** How many services in this category are ready */
  connectedCount: number;
};

export type ServiceCategoriesSnapshot = {
  google: GoogleConnectionSnapshot;
  outlookConnected?: boolean;
  canvaConnected?: boolean;
  googleAuthHref?: string;
};

export function resolveServiceItemStatus(
  item: ServiceItemDef,
  snap: ServiceCategoriesSnapshot,
): SettingsConnectionStatus {
  switch (item.kind) {
    case "built-in":
      return "connected";
    case "preference-only":
      // Available without OAuth — treated as ready once selected as preference.
      return "connected";
    case "google-oauth":
      if (!snap.google.configured) return "needs_attention";
      return snap.google.connected ? "connected" : "disconnected";
    case "outlook-local":
      return (snap.outlookConnected ?? isOutlookCalendarConnected())
        ? "connected"
        : "disconnected";
    case "canva-local":
      return (snap.canvaConnected ?? isCanvaConnected())
        ? "connected"
        : "disconnected";
    default:
      return "disconnected";
  }
}

export function buildServiceCategories(
  snap: ServiceCategoriesSnapshot,
): ServiceCategoryState[] {
  const googleHref = snap.googleAuthHref ?? "/api/google/auth";

  return SERVICE_CATEGORIES.map((category) => {
    const items: ServiceItemState[] = category.items.map((item) => {
      const status = resolveServiceItemStatus(item, snap);
      const normalized = normalizeConnectionStatus(status);
      const showConnectedCheck = normalized === "connected";
      return {
        ...item,
        status,
        statusLabel: showConnectedCheck
          ? "Connected ✓"
          : connectionStatusLabel(status),
        showConnectedCheck,
        connectHref:
          item.kind === "google-oauth" && status !== "needs_attention"
            ? googleHref
            : null,
        accountEmail:
          item.kind === "google-oauth" && snap.google.connected
            ? snap.google.email
            : null,
      };
    });
    return {
      id: category.id,
      label: category.label,
      items,
      connectedCount: items.filter((i) => i.showConnectedCheck).length,
    };
  });
}
