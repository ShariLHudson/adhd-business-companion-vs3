/**
 * Settings → Connections catalog.
 * Digital Workspace Preferences: auth + preferred destinations (Prompt 142).
 * Google services share existing OAuth; Sheets/Forms stay in architecture but are hidden from this page.
 */

export type SettingsConnectionId =
  | "google-calendar"
  | "google-docs"
  | "google-drive"
  | "outlook-calendar"
  | "canva";

/** Hidden from Settings UI — keep ids for future roadmap (do not delete backend). */
export type SettingsConnectionHiddenId =
  | "google-sheets"
  | "google-forms"
  | "google-slides"
  | "microsoft-excel"
  | "microsoft-word"
  | "onedrive"
  | "dropbox"
  | "onenote"
  | "notion"
  | "printing"
  | "pdf-export";

export type SettingsConnectionKind = "google" | "outlook-calendar" | "canva";

export type SettingsConnectionStatus =
  | "connected"
  | "not-connected"
  | "unavailable";

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
  /** Canva / URL destinations */
  destinationUrl?: string | null;
  connectLabel: string;
  manageLabel: string;
  /** Existing Google OAuth path, or null when using local prepare flow */
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
    description: "Keep files Spark creates for you in your Google Drive.",
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
  {
    id: "canva",
    title: "Canva",
    description:
      "Save your preferred Canva homepage or workspace link. The Design crystal opens it when you’re ready.",
    kind: "canva",
    visible: true,
  },
] as const;

/** Catalog of services still supported in product code but not shown on Connections. */
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
  {
    id: "google-slides",
    title: "Google Slides",
    reason: "Coming soon — preference slot reserved in Digital Workspace Preferences.",
  },
  {
    id: "microsoft-excel",
    title: "Microsoft Excel",
    reason: "Coming soon — hidden until a trusted destination path ships.",
  },
  {
    id: "microsoft-word",
    title: "Microsoft Word",
    reason:
      "Preference available under Digital Workspace Preferences; OAuth deferred.",
  },
  {
    id: "onedrive",
    title: "Microsoft OneDrive",
    reason: "Coming soon — storage preference reserved.",
  },
  {
    id: "dropbox",
    title: "Dropbox",
    reason: "Coming soon — storage preference reserved.",
  },
  {
    id: "onenote",
    title: "OneNote",
    reason: "Coming soon — hidden until ready.",
  },
  {
    id: "notion",
    title: "Notion",
    reason: "Coming soon — hidden until ready.",
  },
  {
    id: "printing",
    title: "Printing",
    reason: "Configured as a Printing preference, not a separate OAuth card.",
  },
  {
    id: "pdf-export",
    title: "PDF Export",
    reason: "Configured as a Printing preference (Save as PDF).",
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
  canvaConnected?: boolean;
  canvaDestinationUrl?: string | null;
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

    if (card.kind === "canva") {
      const connected = input.canvaConnected === true;
      return {
        ...card,
        status: connected ? "connected" : "not-connected",
        accountEmail: null,
        destinationUrl: input.canvaDestinationUrl ?? null,
        connectLabel: "Connect Canva",
        manageLabel: "Manage Canva",
        connectHref: null,
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
