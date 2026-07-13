/**
 * Connected Calendars — provider-agnostic planning calendar connections.
 * Google uses existing OAuth; Outlook uses a prepared local connection until Graph lands.
 */

import {
  isOutlookCalendarConnected,
  readOutlookCalendarConnection,
} from "@/lib/connections/outlookCalendarConnection";

export type ConnectedCalendarProviderId =
  | "google"
  | "outlook"
  | "apple"
  | "calendly"
  | "acuity"
  | "odoo"
  | "other";

/** Calendar providers Spark plans with — Google live; Outlook prepared. */
export type CalendarProvider = "google" | "outlook";

export type ConnectedCalendarStatus =
  | "connected"
  | "disconnected"
  | "unavailable"
  | "coming-soon";

export type ConnectedCalendarProvider = {
  id: ConnectedCalendarProviderId;
  /** Member-facing label — never hard-code a single vendor as "the calendar". */
  label: string;
  /** Whether this app build can start a connect flow. */
  connectable: boolean;
  status: ConnectedCalendarStatus;
};

export type ConnectedCalendar = {
  id: string;
  providerId: ConnectedCalendarProviderId;
  label: string;
  accountEmail?: string | null;
  connected: boolean;
};

export type ConnectedCalendarsSnapshot = {
  providers: ConnectedCalendarProvider[];
  connections: ConnectedCalendar[];
  /** True when the shared Google OAuth stack is configured in the environment. */
  googleOAuthConfigured: boolean;
};

/** Providers registered for the Planning Calendar (extensible). */
export const CONNECTED_CALENDAR_PROVIDER_CATALOG: readonly Omit<
  ConnectedCalendarProvider,
  "status"
>[] = [
  { id: "google", label: "Google Calendar", connectable: true },
  { id: "outlook", label: "Outlook Calendar", connectable: true },
  { id: "apple", label: "Apple Calendar", connectable: false },
  { id: "calendly", label: "Calendly", connectable: false },
  { id: "acuity", label: "Acuity", connectable: false },
  { id: "odoo", label: "Odoo Appointments", connectable: false },
] as const;

export type UnifiedPlanningEvent = {
  id: string;
  title: string;
  /** YYYY-MM-DD when known */
  date?: string;
  startTime?: string;
  source: "spark-plan" | "spark-appointment" | "connected-calendar";
  providerId?: ConnectedCalendarProviderId;
};

/** Start connect for a provider — reuses existing Google OAuth; Outlook uses Settings local prep. */
export function connectedCalendarAuthHref(
  providerId: ConnectedCalendarProviderId,
  returnTo = "/companion?section=plan-my-day",
): string | null {
  if (providerId === "google") {
    return `/api/google/auth?returnTo=${encodeURIComponent(returnTo)}`;
  }
  // Microsoft Graph OAuth not implemented yet — Settings uses local prepare connect.
  return null;
}

export function isCalendarProvider(
  value: string,
): value is CalendarProvider {
  return value === "google" || value === "outlook";
}

export async function fetchConnectedCalendarsSnapshot(): Promise<ConnectedCalendarsSnapshot> {
  let googleOAuthConfigured = false;
  let googleConnected = false;
  let googleEmail: string | null = null;

  try {
    const res = await fetch("/api/google/status");
    if (res.ok) {
      const data = (await res.json()) as {
        configured?: boolean;
        connected?: boolean;
        email?: string | null;
      };
      googleOAuthConfigured = Boolean(data.configured);
      googleConnected = Boolean(data.connected);
      googleEmail = data.email ?? null;
    }
  } catch {
    /* status unavailable */
  }

  const outlookConnected = isOutlookCalendarConnected();
  const outlookRecord = readOutlookCalendarConnection();

  const providers: ConnectedCalendarProvider[] =
    CONNECTED_CALENDAR_PROVIDER_CATALOG.map((p) => {
      if (p.id === "google") {
        if (!googleOAuthConfigured) {
          return { ...p, status: "unavailable" as const };
        }
        return {
          ...p,
          status: googleConnected
            ? ("connected" as const)
            : ("disconnected" as const),
        };
      }
      if (p.id === "outlook") {
        return {
          ...p,
          status: outlookConnected
            ? ("connected" as const)
            : ("disconnected" as const),
        };
      }
      return { ...p, status: "coming-soon" as const };
    });

  const connections: ConnectedCalendar[] = [];
  if (googleConnected) {
    connections.push({
      id: "google-primary",
      providerId: "google",
      label: "Google Calendar",
      accountEmail: googleEmail,
      connected: true,
    });
  }
  if (outlookConnected) {
    connections.push({
      id: "outlook-primary",
      providerId: "outlook",
      label: "Outlook Calendar",
      accountEmail: outlookRecord.accountEmail ?? null,
      connected: true,
    });
  }

  return { providers, connections, googleOAuthConfigured };
}
