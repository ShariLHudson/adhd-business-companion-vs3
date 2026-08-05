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
import {
  DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
  type CalendarProviderPreference,
  type DigitalWorkspacePreferences,
  type DocumentsProviderPreference,
  type StorageProviderPreference,
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
  /** Honest, kind-aware badge text — "Connected ✓" only for a verified,
   * authenticated connection. Built-in / local choices read "Selected" or
   * "Prepared" so members never mistake a preference for a real integration. */
  statusLabel: string;
  /** True only for a verified, authenticated connection (Google OAuth, Canva). */
  showConnectedCheck: boolean;
  /** True when this destination is currently active/usable — includes the
   * member's built-in/local choice, not just authenticated connections.
   * Drives the "N ready" category count. */
  ready: boolean;
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
  /**
   * Current Digital Workspace preference. "built-in" and "preference-only"
   * items are local choices, not authenticated connections — they only read
   * as the member's active choice when they actually match it. Defaults to
   * the product's out-of-the-box preference (Spark Estate Documents/Storage).
   */
  preferences?: Pick<DigitalWorkspacePreferences, "documents" | "storage">;
};

/** True when a "built-in"/"preference-only" item is the member's current pick. */
function isSelectedLocalPreference(
  item: ServiceItemDef,
  snap: ServiceCategoriesSnapshot,
): boolean {
  if (!item.preferenceKey || item.preferenceValue == null) return false;
  const preferences = snap.preferences ?? DEFAULT_DIGITAL_WORKSPACE_PREFERENCES;
  if (item.preferenceKey !== "documents" && item.preferenceKey !== "storage") {
    return false;
  }
  return preferences[item.preferenceKey] === item.preferenceValue;
}

export function resolveServiceItemStatus(
  item: ServiceItemDef,
  snap: ServiceCategoriesSnapshot,
): SettingsConnectionStatus {
  switch (item.kind) {
    case "built-in":
    case "preference-only":
      // Not an authenticated connection — "connected" here only means "this
      // is the member's current local choice," gated on the real preference.
      return isSelectedLocalPreference(item, snap) ? "connected" : "disconnected";
    case "google-oauth":
      if (!snap.google.configured) return "needs_attention";
      return snap.google.connected ? "connected" : "disconnected";
    case "outlook-local":
      // No Microsoft Graph OAuth exists yet — "connected" here means "the
      // member started local prep," never a verified account connection.
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

/** Kinds backed by a real, verified authentication handshake. */
function isAuthenticatedKind(kind: ServiceItemKind): boolean {
  return kind === "google-oauth" || kind === "canva-local";
}

export function buildServiceCategories(
  snap: ServiceCategoriesSnapshot,
): ServiceCategoryState[] {
  const googleHref = snap.googleAuthHref ?? "/api/google/auth";

  return SERVICE_CATEGORIES.map((category) => {
    const items: ServiceItemState[] = category.items.map((item) => {
      const status = resolveServiceItemStatus(item, snap);
      const normalized = normalizeConnectionStatus(status);
      const active = normalized === "connected";
      const authenticated = isAuthenticatedKind(item.kind);
      const showConnectedCheck = authenticated && active;

      let statusLabel: string;
      if (active) {
        statusLabel = authenticated
          ? "Connected ✓"
          : item.kind === "outlook-local"
            ? "Prepared ✓"
            : "Selected ✓";
      } else if (normalized === "needs_attention") {
        statusLabel = "Needs attention";
      } else {
        statusLabel = authenticated || item.kind === "outlook-local"
          ? connectionStatusLabel(status)
          : "Select";
      }

      return {
        ...item,
        status,
        statusLabel,
        showConnectedCheck,
        ready: active,
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
      connectedCount: items.filter((i) => i.ready).length,
    };
  });
}
