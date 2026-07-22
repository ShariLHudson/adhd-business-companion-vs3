/**
 * Defaults settings — which destinations are selectable, and attention when
 * a saved default points at a disconnected or unsupported service.
 */

import {
  DOCUMENTS_PROVIDER_LABELS,
  PRINTING_PREFERENCE_LABELS,
  STORAGE_PROVIDER_LABELS,
  CALENDAR_PROVIDER_LABELS,
  type CalendarProviderPreference,
  type DigitalWorkspacePreferences,
  type DocumentsProviderPreference,
  type PrintingPreference,
  type StorageProviderPreference,
} from "./digitalWorkspacePreferences";

export type DefaultCategory =
  | "documents"
  | "storage"
  | "calendar"
  | "printing";

export type DefaultsConnectionSnapshot = {
  googleConfigured: boolean;
  googleConnected: boolean;
  outlookConnected: boolean;
};

export type DefaultOption<T extends string> = {
  id: T;
  label: string;
  /** Built-in or currently connected — may be selected */
  selectable: boolean;
  /** Show as Connect to use (starts connection flow) */
  connectToUse?: boolean;
};

export type DefaultGroupState<T extends string> = {
  category: DefaultCategory;
  title: string;
  currentId: T;
  currentLabel: string;
  needsAttention: boolean;
  attentionMessage: string | null;
  options: DefaultOption<T>[];
};

const DOCUMENT_ORDER: DocumentsProviderPreference[] = [
  "spark-estate",
  "google-docs",
  "microsoft-word",
  "local",
];

const STORAGE_ORDER: StorageProviderPreference[] = [
  "spark-estate",
  "google-drive",
];

const PRINTING_ORDER: PrintingPreference[] = ["save-pdf", "print-dialog"];

const CALENDAR_ORDER: CalendarProviderPreference[] = ["google", "outlook"];

export function resolveDocumentDefaults(
  prefs: DigitalWorkspacePreferences,
  connections: DefaultsConnectionSnapshot,
): DefaultGroupState<DocumentsProviderPreference> {
  const options: DefaultOption<DocumentsProviderPreference>[] =
    DOCUMENT_ORDER.map((id) => {
      if (id === "google-docs") {
        const selectable =
          connections.googleConfigured && connections.googleConnected;
        return {
          id,
          label: DOCUMENTS_PROVIDER_LABELS[id],
          selectable,
          connectToUse: connections.googleConfigured && !selectable,
        };
      }
      return {
        id,
        label: DOCUMENTS_PROVIDER_LABELS[id],
        selectable: true,
      };
    });

  const currentId = prefs.documents;
  const current = options.find((o) => o.id === currentId);
  const needsAttention = Boolean(current && !current.selectable);
  return {
    category: "documents",
    title: "Documents",
    currentId,
    currentLabel: DOCUMENTS_PROVIDER_LABELS[currentId],
    needsAttention,
    attentionMessage: needsAttention
      ? `${DOCUMENTS_PROVIDER_LABELS[currentId]} is no longer connected. Choose a new documents default.`
      : null,
    options,
  };
}

export function resolveStorageDefaults(
  prefs: DigitalWorkspacePreferences,
  connections: DefaultsConnectionSnapshot,
): DefaultGroupState<StorageProviderPreference> {
  const options: DefaultOption<StorageProviderPreference>[] =
    STORAGE_ORDER.map((id) => {
      if (id === "google-drive") {
        const selectable =
          connections.googleConfigured && connections.googleConnected;
        return {
          id,
          label: STORAGE_PROVIDER_LABELS[id],
          selectable,
          connectToUse: connections.googleConfigured && !selectable,
        };
      }
      return {
        id,
        label: STORAGE_PROVIDER_LABELS[id],
        selectable: true,
      };
    });

  // Legacy OneDrive / Dropbox selections need attention until replaced.
  const currentId = prefs.storage;
  const isLegacyExternal =
    currentId === "onedrive" || currentId === "dropbox";
  const current = options.find((o) => o.id === currentId);
  const needsAttention =
    isLegacyExternal || Boolean(current && !current.selectable);

  const currentLabel = STORAGE_PROVIDER_LABELS[currentId] ?? currentId;

  return {
    category: "storage",
    title: "File Storage",
    currentId,
    currentLabel,
    needsAttention,
    attentionMessage: needsAttention
      ? isLegacyExternal
        ? `${currentLabel} isn’t available yet. Choose a new file storage default.`
        : `${currentLabel} is no longer connected. Choose a new file storage default.`
      : null,
    options: isLegacyExternal
      ? [
          ...options,
          {
            id: currentId,
            label: `${currentLabel} (unavailable)`,
            selectable: false,
          },
        ]
      : options,
  };
}

export function resolveCalendarDefaults(
  prefs: DigitalWorkspacePreferences,
  connections: DefaultsConnectionSnapshot,
): DefaultGroupState<CalendarProviderPreference> {
  const googleOk =
    connections.googleConfigured && connections.googleConnected;
  const outlookOk = connections.outlookConnected;

  const options: DefaultOption<CalendarProviderPreference>[] =
    CALENDAR_ORDER.map((id) => {
      if (id === "google") {
        return {
          id,
          label: CALENDAR_PROVIDER_LABELS[id],
          selectable: googleOk,
          connectToUse: connections.googleConfigured && !googleOk,
        };
      }
      return {
        id,
        label: CALENDAR_PROVIDER_LABELS[id],
        selectable: outlookOk,
        connectToUse: !outlookOk,
      };
    });

  // Sole connected calendar is shown as current (auto-select).
  let currentId = prefs.calendar;
  if (googleOk && !outlookOk) currentId = "google";
  else if (outlookOk && !googleOk) currentId = "outlook";

  const savedStillValid = Boolean(
    options.find((o) => o.id === prefs.calendar)?.selectable,
  );
  const soleConnected = (googleOk && !outlookOk) || (outlookOk && !googleOk);
  // Sole connected calendar auto-resolves; otherwise flag invalid saved defaults.
  const attention = !savedStillValid && !soleConnected;

  return {
    category: "calendar",
    title: "Calendar",
    currentId,
    currentLabel: CALENDAR_PROVIDER_LABELS[currentId],
    needsAttention: attention,
    attentionMessage: attention
      ? `${CALENDAR_PROVIDER_LABELS[prefs.calendar]} is no longer connected. Choose a new calendar default.`
      : null,
    options,
  };
}

export function resolvePrintingDefaults(
  prefs: DigitalWorkspacePreferences,
): DefaultGroupState<PrintingPreference> {
  const options: DefaultOption<PrintingPreference>[] = PRINTING_ORDER.map(
    (id) => ({
      id,
      label:
        id === "print-dialog"
          ? "Open print dialog"
          : PRINTING_PREFERENCE_LABELS[id],
      selectable: true,
    }),
  );

  const currentId = prefs.printing;
  const legacyProvider = currentId === "preferred-provider";
  const displayId: PrintingPreference = legacyProvider
    ? "save-pdf"
    : currentId;

  return {
    category: "printing",
    title: "Printing",
    currentId: legacyProvider ? currentId : displayId,
    currentLabel: legacyProvider
      ? "Preferred print provider"
      : currentId === "print-dialog"
        ? "Open print dialog"
        : PRINTING_PREFERENCE_LABELS[currentId],
    needsAttention: legacyProvider,
    attentionMessage: legacyProvider
      ? "Preferred print provider isn’t available. Choose Save as PDF or Open print dialog."
      : null,
    options: legacyProvider
      ? [
          ...options,
          {
            id: "preferred-provider",
            label: "Preferred print provider (unavailable)",
            selectable: false,
          },
        ]
      : options,
  };
}

/** When exactly one calendar is connected, persist it as the default. */
export function maybeAutoSelectSoleCalendar(
  prefs: DigitalWorkspacePreferences,
  connections: DefaultsConnectionSnapshot,
): CalendarProviderPreference | null {
  const googleOk =
    connections.googleConfigured && connections.googleConnected;
  const outlookOk = connections.outlookConnected;
  if (googleOk && !outlookOk && prefs.calendar !== "google") return "google";
  if (outlookOk && !googleOk && prefs.calendar !== "outlook") return "outlook";
  return null;
}
