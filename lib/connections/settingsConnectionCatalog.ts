/**
 * Settings → Connected Services catalog.
 * Auth lives here; destination defaults live under Settings → Defaults.
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
  | "disconnected"
  | "needs_attention"
  | "connecting"
  /** @deprecated prefer disconnected — kept for older callers */
  | "not-connected"
  /** @deprecated prefer needs_attention */
  | "unavailable";

export type SettingsConnectionCardDef = {
  id: SettingsConnectionId;
  title: string;
  description: string;
  kind: SettingsConnectionKind;
  /** Shown on Settings → Connected Services */
  visible: true;
  openUrl?: string;
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

/** Member-facing Connected Services cards — Sheets/Forms intentionally omitted. */
export const SETTINGS_CONNECTION_CARDS: readonly SettingsConnectionCardDef[] = [
  {
    id: "google-calendar",
    title: "Google Calendar",
    description: "Add Google events and use them when shaping your day.",
    kind: "google",
    visible: true,
    openUrl: "https://calendar.google.com",
  },
  {
    id: "google-docs",
    title: "Google Docs",
    description: "Save and open documents through Google Docs.",
    kind: "google",
    visible: true,
    openUrl: "https://docs.google.com",
  },
  {
    id: "google-drive",
    title: "Google Drive",
    description: "Save and open files through Google Drive.",
    kind: "google",
    visible: true,
    openUrl: "https://drive.google.com",
  },
  {
    id: "outlook-calendar",
    title: "Outlook Calendar",
    description: "Add Outlook events and use them when shaping your day.",
    kind: "outlook-calendar",
    visible: true,
    openUrl: "https://outlook.office.com/calendar/",
  },
  {
    id: "canva",
    title: "Canva",
    description: "Open your Canva workspace when you’re ready to design.",
    kind: "canva",
    visible: true,
    openUrl: "https://www.canva.com",
  },
] as const;

/** Catalog of services still supported in product code but not shown on Connected Services. */
export const SETTINGS_CONNECTIONS_HIDDEN_FROM_UI: readonly {
  id: SettingsConnectionHiddenId;
  title: string;
  reason: string;
}[] = [
  {
    id: "google-sheets",
    title: "Google Sheets",
    reason: "Roadmap — export/backend retained; hidden from Connected Services UI.",
  },
  {
    id: "google-forms",
    title: "Google Forms",
    reason: "Roadmap — export/backend retained; hidden from Connected Services UI.",
  },
  {
    id: "google-slides",
    title: "Google Slides",
    reason: "Coming soon — preference slot reserved in Defaults.",
  },
  {
    id: "microsoft-excel",
    title: "Microsoft Excel",
    reason: "Coming soon — hidden until a trusted destination path ships.",
  },
  {
    id: "microsoft-word",
    title: "Microsoft Word",
    reason: "Export as Word file under Defaults — not a connected service.",
  },
  {
    id: "onedrive",
    title: "Microsoft OneDrive",
    reason: "Coming soon — hidden until a working integration ships.",
  },
  {
    id: "dropbox",
    title: "Dropbox",
    reason: "Coming soon — hidden until a working integration ships.",
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
    reason: "Configured under Defaults → Printing, not a separate OAuth card.",
  },
  {
    id: "pdf-export",
    title: "PDF Export",
    reason: "Configured under Defaults → Printing (Save as PDF).",
  },
] as const;

export type GoogleConnectionSnapshot = {
  configured: boolean;
  connected: boolean;
  email: string | null;
};

export function normalizeConnectionStatus(
  status: SettingsConnectionStatus,
): "connected" | "disconnected" | "needs_attention" | "connecting" {
  if (status === "connected") return "connected";
  if (status === "connecting") return "connecting";
  if (status === "needs_attention" || status === "unavailable") {
    return "needs_attention";
  }
  return "disconnected";
}

export function connectionStatusLabel(
  status: SettingsConnectionStatus,
): string {
  switch (normalizeConnectionStatus(status)) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting";
    case "needs_attention":
      return "Needs attention";
    default:
      return "Not connected";
  }
}

export function buildSettingsConnectionCards(input: {
  google: GoogleConnectionSnapshot;
  outlookConnected: boolean;
  canvaConnected?: boolean;
  canvaDestinationUrl?: string | null;
  googleAuthHref?: string;
  connectingId?: SettingsConnectionId | null;
}): SettingsConnectionCardState[] {
  const googleHref = input.googleAuthHref ?? "/api/google/auth";

  return SETTINGS_CONNECTION_CARDS.map((card) => {
    if (card.kind === "google") {
      const connecting = input.connectingId === card.id;
      const status: SettingsConnectionStatus = connecting
        ? "connecting"
        : !input.google.configured
          ? "needs_attention"
          : input.google.connected
            ? "connected"
            : "disconnected";
      return {
        ...card,
        status,
        accountEmail: input.google.connected ? input.google.email : null,
        connectLabel: "Connect",
        manageLabel: "Manage",
        connectHref: status === "needs_attention" ? null : googleHref,
      };
    }

    if (card.kind === "canva") {
      const connecting = input.connectingId === card.id;
      const connected = input.canvaConnected === true;
      return {
        ...card,
        status: connecting
          ? "connecting"
          : connected
            ? "connected"
            : "disconnected",
        accountEmail: null,
        destinationUrl: input.canvaDestinationUrl ?? null,
        openUrl: input.canvaDestinationUrl || card.openUrl,
        connectLabel: "Connect",
        manageLabel: "Manage",
        connectHref: null,
      };
    }

    return {
      ...card,
      status: input.connectingId === card.id
        ? "connecting"
        : input.outlookConnected
          ? "connected"
          : "disconnected",
      accountEmail: null,
      connectLabel: "Connect",
      manageLabel: "Manage",
      connectHref: null,
    };
  });
}
