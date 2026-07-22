/**
 * Prompt 142 — preference-aware crystal launch plans.
 * Never silent-fail; every click yields navigate, open URL, prepared UI, or Connections.
 */

import type { DigitalWorkspacePreferences } from "@/lib/connections/digitalWorkspacePreferences";
import {
  DOCUMENTS_PROVIDER_LABELS,
  PRINTING_PREFERENCE_LABELS,
} from "@/lib/connections/digitalWorkspacePreferences";
import type { DestinationCrystalId } from "./constants";
import {
  resolveCrystalConnection,
  type CrystalConnectionSnapshot,
  type ResolvedCrystalConnection,
} from "./crystalConnectionMapping";
import { getDestinationCrystalRegistryEntry } from "./destinationRegistry";

export type CrystalLaunchKind =
  | "open_calendar"
  | "open_external_url"
  | "prepared_document"
  | "prepared_store"
  | "prepared_share"
  | "prepared_print"
  | "needs_connection"
  | "unavailable";

export type CrystalLaunchPlan = {
  crystalId: DestinationCrystalId;
  kind: CrystalLaunchKind;
  title: string;
  body: string;
  /** Open in new tab when kind is open_external_url */
  externalUrl?: string | null;
  /** Offer one-click path to Settings → Connections */
  shouldOpenConnections: boolean;
  /** Preference label for prepared document/print surfaces */
  preferenceLabel?: string;
  connection: ResolvedCrystalConnection;
};

export type CrystalLaunchContext = {
  connections: CrystalConnectionSnapshot;
  preferences: DigitalWorkspacePreferences;
  /** Canva destination URL when connected */
  canvaDestinationUrl?: string | null;
};

function documentBody(preferences: DigitalWorkspacePreferences): string {
  const label = DOCUMENTS_PROVIDER_LABELS[preferences.documents];
  switch (preferences.documents) {
    case "google-docs":
      return `When you're ready, Spark can send written work to ${label}. Nothing leaves until you choose.`;
    case "microsoft-word":
      return `Your Document preference is ${label}. Connect or update that destination in Connections when you're ready.`;
    case "spark-estate":
      return `I'll keep this with your Spark Estate Documents. You can change the Document preference anytime in Connections.`;
    case "local":
      return `You prefer Local Documents — download a copy from here when something is ready.`;
    default:
      return `When you're ready, Spark can send written work to your preferred document destination.`;
  }
}

function printBody(preferences: DigitalWorkspacePreferences): string {
  const label = PRINTING_PREFERENCE_LABELS[preferences.printing];
  if (preferences.printing === "print-dialog") {
    return `Your Printing preference is ${label}. When there's something ready, we can open print from here.`;
  }
  if (preferences.printing === "save-pdf") {
    return `Your Printing preference is ${label}. We can download a PDF copy when there's something ready to send.`;
  }
  return `Your Printing preference is ${label}. We'll use the workflow you saved in Connections.`;
}

/**
 * Resolve what happens when a Destination Gallery crystal is activated.
 */
export function resolveCrystalLaunch(
  crystalId: DestinationCrystalId,
  context: CrystalLaunchContext,
): CrystalLaunchPlan {
  const entry = getDestinationCrystalRegistryEntry(crystalId);
  const connection = resolveCrystalConnection(crystalId, context.connections);

  if (crystalId === "schedule") {
    if (connection.action === "ready") {
      return {
        crystalId,
        kind: "open_calendar",
        title: entry.userFacingLabel,
        body: "Opening your Calendar so we can place this work on your day.",
        shouldOpenConnections: false,
        connection,
      };
    }
    return {
      crystalId,
      kind: "needs_connection",
      title: entry.userFacingLabel,
      body: connection.memberMessage,
      shouldOpenConnections: connection.shouldOpenConnections,
      connection,
    };
  }

  if (crystalId === "create") {
    if (
      connection.action === "ready" &&
      context.canvaDestinationUrl &&
      context.canvaDestinationUrl.trim()
    ) {
      return {
        crystalId,
        kind: "open_external_url",
        title: "Design",
        body: "Opening your Canva workspace.",
        externalUrl: context.canvaDestinationUrl.trim(),
        shouldOpenConnections: false,
        connection,
      };
    }
    return {
      crystalId,
      kind: "needs_connection",
      title: "Design",
      body:
        "Canva hasn’t been connected yet. Add your Canva link in Connections, and this crystal will open it right away.",
      shouldOpenConnections: true,
      connection: {
        ...connection,
        shouldOpenConnections: true,
        action: "needs_connection",
        memberMessage:
          "Canva hasn’t been connected yet. Add your Canva link in Connections, and this crystal will open it right away.",
      },
    };
  }

  if (crystalId === "write") {
    const prefs = context.preferences;
    if (
      prefs.documents === "microsoft-word" &&
      !prefs.destinationUrls.microsoftWord
    ) {
      return {
        crystalId,
        kind: "needs_connection",
        title: entry.userFacingLabel,
        body: "Microsoft Word is your Document preference, but a destination link hasn’t been saved yet. Add it in Connections.",
        shouldOpenConnections: true,
        preferenceLabel: DOCUMENTS_PROVIDER_LABELS[prefs.documents],
        connection,
      };
    }
    if (
      prefs.documents === "microsoft-word" &&
      prefs.destinationUrls.microsoftWord
    ) {
      return {
        crystalId,
        kind: "open_external_url",
        title: entry.userFacingLabel,
        body: "Opening your Microsoft Word destination.",
        externalUrl: prefs.destinationUrls.microsoftWord,
        shouldOpenConnections: false,
        preferenceLabel: DOCUMENTS_PROVIDER_LABELS[prefs.documents],
        connection,
      };
    }
    return {
      crystalId,
      kind: "prepared_document",
      title: entry.userFacingLabel,
      body: documentBody(prefs),
      shouldOpenConnections:
        prefs.documents === "google-docs" && connection.action !== "ready",
      preferenceLabel: DOCUMENTS_PROVIDER_LABELS[prefs.documents],
      connection,
    };
  }

  if (crystalId === "save") {
    return {
      crystalId,
      kind: "prepared_store",
      title: entry.userFacingLabel,
      body:
        connection.action === "ready"
          ? "Your Store preference is ready. Spark can keep files in the connected storage hand when you choose — we won’t open Drive just to browse."
          : connection.memberMessage,
      shouldOpenConnections: connection.action !== "ready",
      preferenceLabel: context.preferences.storage,
      connection,
    };
  }

  if (crystalId === "spark-social-media") {
    if (connection.action === "ready" || connection.action === "partial") {
      return {
        crystalId,
        kind: "prepared_share",
        title: entry.userFacingLabel,
        body: "I'll prepare this for sharing. Nothing is published — you approve before anything goes live.",
        shouldOpenConnections: false,
        connection,
      };
    }
    return {
      crystalId,
      kind: "needs_connection",
      title: entry.userFacingLabel,
      body: connection.memberMessage,
      shouldOpenConnections: true,
      connection,
    };
  }

  if (crystalId === "print") {
    return {
      crystalId,
      kind: "prepared_print",
      title: entry.userFacingLabel,
      body: printBody(context.preferences),
      shouldOpenConnections: false,
      preferenceLabel: PRINTING_PREFERENCE_LABELS[context.preferences.printing],
      connection,
    };
  }

  return {
    crystalId,
    kind: "unavailable",
    title: entry.userFacingLabel,
    body: "This destination isn’t ready yet.",
    shouldOpenConnections: false,
    connection,
  };
}

/** True when launch leaves the Destination Gallery scene. */
export function crystalLaunchLeavesGallery(kind: CrystalLaunchKind): boolean {
  return kind === "open_calendar" || kind === "open_external_url";
}
