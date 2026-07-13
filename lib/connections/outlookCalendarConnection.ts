/**
 * Outlook Calendar connection — Settings / Connected Calendars prep.
 * Stores connection intent locally until Microsoft Graph OAuth is implemented.
 * Does not call Graph APIs.
 */

const STORAGE_KEY = "companion-outlook-calendar-connection-v1";

export type OutlookCalendarConnectionRecord = {
  connected: boolean;
  connectedAt?: string;
  /** Reserved for future Microsoft account email from Graph */
  accountEmail?: string | null;
  provider: "outlook";
  /** Architecture marker — Graph tokens will live here later */
  graphReady: false;
};

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

export function readOutlookCalendarConnection(): OutlookCalendarConnectionRecord {
  if (!hasStorage()) {
    return { connected: false, provider: "outlook", graphReady: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { connected: false, provider: "outlook", graphReady: false };
    }
    const parsed = JSON.parse(raw) as Partial<OutlookCalendarConnectionRecord>;
    return {
      connected: Boolean(parsed.connected),
      connectedAt: parsed.connectedAt,
      accountEmail: parsed.accountEmail ?? null,
      provider: "outlook",
      graphReady: false,
    };
  } catch {
    return { connected: false, provider: "outlook", graphReady: false };
  }
}

export function isOutlookCalendarConnected(): boolean {
  return readOutlookCalendarConnection().connected;
}

/** Prepare / mark Outlook Calendar connected (UI + architecture only). */
export function connectOutlookCalendarLocal(): OutlookCalendarConnectionRecord {
  const record: OutlookCalendarConnectionRecord = {
    connected: true,
    connectedAt: new Date().toISOString(),
    accountEmail: null,
    provider: "outlook",
    graphReady: false,
  };
  if (hasStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      window.dispatchEvent(new Event("companion-outlook-calendar-updated"));
    } catch {
      /* ignore */
    }
  }
  return record;
}

export function disconnectOutlookCalendarLocal(): OutlookCalendarConnectionRecord {
  const record: OutlookCalendarConnectionRecord = {
    connected: false,
    provider: "outlook",
    graphReady: false,
  };
  if (hasStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      window.dispatchEvent(new Event("companion-outlook-calendar-updated"));
    } catch {
      /* ignore */
    }
  }
  return record;
}

export function resetOutlookCalendarConnectionForTests(): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
