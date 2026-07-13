/**
 * Settings → Connections catalog.
 * Google services share existing OAuth; Sheets/Forms stay in architecture but are hidden from this page.
 */

export type SettingsConnectionId =
  | "google-calendar"
  | "google-docs"
  | "google-drive"
  | "outlook-calendar";

/** Hidden from Settings UI — keep ids for future roadmap (do not delete backend). */
export type SettingsConnectionHiddenId = "google-sheets" | "google-forms";

export type SettingsConnectionKind = "google" | "outlook-calendar";

export type SettingsConnectionStatus = "connected" | "not-connected" | "unavailable";

export type SettingsConnectionCardDef = {
  id: SettingsConnectionId;
  title: string;
  description: string;
  kind: SettingsConnectionKind;
  /** Shown on Settings → Connections */
  visible: true;
};

export type SettingsConnectionCardState = SettingsConnectionCardDef & {
  status: SettingsConnectionStatus;
  accountEmail?: string | null;
  connectLabel: string;
  manageLabel: string;
  /** Existing Google OAuth path, or null when using Outlook local prepare flow */
  connectHref: string | null;
};

/** Member-facing Connections cards — Sheets/Forms intentionally omitted. */
export const SETTINGS_CONNECTION_CARDS: readonly SettingsConnectionCardDef[] = [
  {
    id: "google-calendar",
    title: "Google Calendar",
    description:
      "Connect Google Calendar so Spark can include your appointments in daily planning.",
    kind: "google",
    visible: true,
  },
  {
    id: "google-docs",
    title: "Google Docs",
    description:
      "Save drafts and documents directly to Google Docs when you choose to export.",
    kind: "google",
    visible: true,
  },
  {
    id: "google-drive",
    title: "Google Drive",
    description:
      "Keep files Spark creates for you in your Google Drive.",
    kind: "google",
    visible: true,
  },
  {
    id: "outlook-calendar",
    title: "Outlook Calendar",
    description:
      "Connect your Microsoft Outlook calendar so Spark can include your appointments in your daily planning.",
    kind: "outlook-calendar",
    visible: true,
  },
] as const;

/** Catalog of Google services still supported in product code but not shown on Connections. */
export const SETTINGS_CONNECTIONS_HIDDEN_FROM_UI: readonly {
  id: SettingsConnectionHiddenId;
  title: string;
  reason: string;
}[] = [
  {
    id: "google-sheets",
    title: "Google Sheets",
    reason: "Roadmap — export/backend retained; hidden from Connections UI.",
  },
  {
    id: "google-forms",
    title: "Google Forms",
    reason: "Roadmap — export/backend retained; hidden from Connections UI.",
  },
] as const;

export type GoogleConnectionSnapshot = {
  configured: boolean;
  connected: boolean;
  email: string | null;
};

export function buildSettingsConnectionCards(input: {
  google: GoogleConnectionSnapshot;
  outlookConnected: boolean;
  googleAuthHref?: string;
}): SettingsConnectionCardState[] {
  const googleHref = input.googleAuthHref ?? "/api/google/auth";

  return SETTINGS_CONNECTION_CARDS.map((card) => {
    if (card.kind === "google") {
      const status: SettingsConnectionStatus = !input.google.configured
        ? "unavailable"
        : input.google.connected
          ? "connected"
          : "not-connected";
      return {
        ...card,
        status,
        accountEmail: input.google.connected ? input.google.email : null,
        connectLabel:
          card.id === "google-calendar"
            ? "Connect Google Calendar"
            : card.id === "google-docs"
              ? "Connect Google Docs"
              : "Connect Google Drive",
        manageLabel: "Manage Connection",
        connectHref: status === "unavailable" ? null : googleHref,
      };
    }

    return {
      ...card,
      status: input.outlookConnected ? "connected" : "not-connected",
      accountEmail: null,
      connectLabel: "Connect Outlook Calendar",
      manageLabel: "Manage Connection",
      connectHref: null,
    };
  });
}
