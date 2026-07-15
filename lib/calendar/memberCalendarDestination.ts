/**
 * Resolve which external calendar the member is using (Google, Outlook, …)
 * so "Calendar" / "My Calendar" opens their calendar — not a hard-coded vendor.
 */
import type {
  CalendarProvider,
  ConnectedCalendarsSnapshot,
} from "@/lib/connectedCalendars";

const PREFERRED_PROVIDER_KEY = "companion-preferred-calendar-provider-v1";

export const MEMBER_CALENDAR_EXTERNAL_URLS: Record<CalendarProvider, string> = {
  google: "https://calendar.google.com",
  outlook: "https://outlook.office.com/calendar/",
};

export type MemberCalendarOpenTarget =
  | {
      kind: "external";
      provider: CalendarProvider;
      label: string;
      url: string;
    }
  | {
      kind: "connect";
    }
  | {
      kind: "choose";
      providers: CalendarProvider[];
    };

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

export function readPreferredCalendarProvider(): CalendarProvider | null {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(PREFERRED_PROVIDER_KEY);
    if (raw === "google" || raw === "outlook") return raw;
    return null;
  } catch {
    return null;
  }
}

export function rememberPreferredCalendarProvider(
  provider: CalendarProvider,
): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(PREFERRED_PROVIDER_KEY, provider);
  } catch {
    /* ignore */
  }
}

export function memberCalendarExternalUrl(provider: CalendarProvider): string {
  return MEMBER_CALENDAR_EXTERNAL_URLS[provider];
}

export function memberCalendarLabel(provider: CalendarProvider): string {
  return provider === "google" ? "Google Calendar" : "Outlook Calendar";
}

/** Connected calendar providers only (google / outlook today). */
export function connectedCalendarProviders(
  snapshot: ConnectedCalendarsSnapshot,
): CalendarProvider[] {
  const ids = new Set(
    snapshot.connections
      .filter((c) => c.connected)
      .map((c) => c.providerId)
      .filter((id): id is CalendarProvider => id === "google" || id === "outlook"),
  );
  return (["google", "outlook"] as const).filter((id) => ids.has(id));
}

/**
 * Pick the calendar the member is using:
 * 1) preferred provider if still connected
 * 2) sole connected provider
 * 3) choose when both are connected and no preference
 * 4) connect UI when none
 */
export function resolveMemberCalendarOpenTarget(
  snapshot: ConnectedCalendarsSnapshot,
  preferred: CalendarProvider | null = readPreferredCalendarProvider(),
): MemberCalendarOpenTarget {
  const connected = connectedCalendarProviders(snapshot);

  if (connected.length === 0) {
    return { kind: "connect" };
  }

  if (preferred && connected.includes(preferred)) {
    return {
      kind: "external",
      provider: preferred,
      label: memberCalendarLabel(preferred),
      url: memberCalendarExternalUrl(preferred),
    };
  }

  if (connected.length === 1) {
    const provider = connected[0]!;
    return {
      kind: "external",
      provider,
      label: memberCalendarLabel(provider),
      url: memberCalendarExternalUrl(provider),
    };
  }

  return { kind: "choose", providers: connected };
}

/** Open the member's calendar in the browser; remembers preference. */
export function openMemberCalendarExternal(provider: CalendarProvider): void {
  rememberPreferredCalendarProvider(provider);
  if (typeof window === "undefined") return;
  window.open(
    memberCalendarExternalUrl(provider),
    "_blank",
    "noopener,noreferrer",
  );
}
