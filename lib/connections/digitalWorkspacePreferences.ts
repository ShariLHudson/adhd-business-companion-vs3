/**
 * Digital Workspace Preferences — preferred destinations for Spark Hands.
 * Connections owns which services are available. Crystal Actions remember
 * destination choices quietly (no separate Defaults settings page).
 */

const STORAGE_KEY = "companion-digital-workspace-preferences-v1";

export type DocumentsProviderPreference =
  | "google-docs"
  | "microsoft-word"
  | "spark-estate"
  | "local";

export type PrintingPreference = "print-dialog" | "save-pdf" | "preferred-provider";

export type CalendarProviderPreference = "google" | "outlook";

export type StorageProviderPreference =
  | "spark-estate"
  | "google-drive"
  | "onedrive"
  | "dropbox";

export type EmailProviderPreference = "gmail" | "outlook";

export type DigitalWorkspacePreferences = {
  /** Document crystal default destination */
  documents: DocumentsProviderPreference;
  /** Print crystal default workflow */
  printing: PrintingPreference;
  /** When both calendars are connected, which Schedule uses first */
  calendar: CalendarProviderPreference;
  /** Store crystal preferred hand */
  storage: StorageProviderPreference;
  /** Future email hand — preference only until OAuth ships */
  email: EmailProviderPreference;
  /** Optional preferred homepage/workspace URLs for URL-based hands */
  destinationUrls: {
    microsoftWord?: string | null;
    oneDrive?: string | null;
    dropbox?: string | null;
    notion?: string | null;
    oneNote?: string | null;
  };
  updatedAt?: string;
};

export const DEFAULT_DIGITAL_WORKSPACE_PREFERENCES: DigitalWorkspacePreferences =
  {
    /** Built-in fallbacks — no connection required for a calm first visit. */
    documents: "spark-estate",
    printing: "save-pdf",
    calendar: "google",
    storage: "spark-estate",
    email: "gmail",
    destinationUrls: {},
  };

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

function isDocuments(
  value: unknown,
): value is DocumentsProviderPreference {
  return (
    value === "google-docs" ||
    value === "microsoft-word" ||
    value === "spark-estate" ||
    value === "local"
  );
}

function isPrinting(value: unknown): value is PrintingPreference {
  return (
    value === "print-dialog" ||
    value === "save-pdf" ||
    value === "preferred-provider"
  );
}

function isCalendar(value: unknown): value is CalendarProviderPreference {
  return value === "google" || value === "outlook";
}

function isStorage(value: unknown): value is StorageProviderPreference {
  return (
    value === "spark-estate" ||
    value === "google-drive" ||
    value === "onedrive" ||
    value === "dropbox"
  );
}

function isEmail(value: unknown): value is EmailProviderPreference {
  return value === "gmail" || value === "outlook";
}

export function readDigitalWorkspacePreferences(): DigitalWorkspacePreferences {
  if (!hasStorage()) return { ...DEFAULT_DIGITAL_WORKSPACE_PREFERENCES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DIGITAL_WORKSPACE_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<DigitalWorkspacePreferences>;
    return {
      documents: isDocuments(parsed.documents)
        ? parsed.documents
        : DEFAULT_DIGITAL_WORKSPACE_PREFERENCES.documents,
      printing: isPrinting(parsed.printing)
        ? parsed.printing
        : DEFAULT_DIGITAL_WORKSPACE_PREFERENCES.printing,
      calendar: isCalendar(parsed.calendar)
        ? parsed.calendar
        : DEFAULT_DIGITAL_WORKSPACE_PREFERENCES.calendar,
      storage: isStorage(parsed.storage)
        ? parsed.storage
        : DEFAULT_DIGITAL_WORKSPACE_PREFERENCES.storage,
      email: isEmail(parsed.email)
        ? parsed.email
        : DEFAULT_DIGITAL_WORKSPACE_PREFERENCES.email,
      destinationUrls: {
        microsoftWord: parsed.destinationUrls?.microsoftWord ?? null,
        oneDrive: parsed.destinationUrls?.oneDrive ?? null,
        dropbox: parsed.destinationUrls?.dropbox ?? null,
        notion: parsed.destinationUrls?.notion ?? null,
        oneNote: parsed.destinationUrls?.oneNote ?? null,
      },
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return { ...DEFAULT_DIGITAL_WORKSPACE_PREFERENCES };
  }
}

export function writeDigitalWorkspacePreferences(
  patch: Partial<
    Omit<DigitalWorkspacePreferences, "destinationUrls">
  > & {
    destinationUrls?: Partial<DigitalWorkspacePreferences["destinationUrls"]>;
  },
): DigitalWorkspacePreferences {
  const current = readDigitalWorkspacePreferences();
  const next: DigitalWorkspacePreferences = {
    ...current,
    ...patch,
    destinationUrls: {
      ...current.destinationUrls,
      ...patch.destinationUrls,
    },
    updatedAt: new Date().toISOString(),
  };
  if (!hasStorage()) return next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new Event("companion-digital-workspace-preferences-updated"),
    );
  } catch {
    /* ignore */
  }
  return next;
}

export function resetDigitalWorkspacePreferencesForTests(): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const DOCUMENTS_PROVIDER_LABELS: Record<
  DocumentsProviderPreference,
  string
> = {
  "google-docs": "Google Docs",
  "microsoft-word": "Microsoft Word file",
  "spark-estate": "Spark Estate Documents",
  local: "Local Documents",
};

export const PRINTING_PREFERENCE_LABELS: Record<PrintingPreference, string> = {
  "print-dialog": "Open print dialog",
  "save-pdf": "Save as PDF",
  "preferred-provider": "Preferred print provider",
};

export const STORAGE_PROVIDER_LABELS: Record<StorageProviderPreference, string> =
  {
    "spark-estate": "Spark Estate",
    "google-drive": "Google Drive",
    onedrive: "OneDrive",
    dropbox: "Dropbox",
  };

export const CALENDAR_PROVIDER_LABELS: Record<
  CalendarProviderPreference,
  string
> = {
  google: "Google Calendar",
  outlook: "Outlook Calendar",
};
