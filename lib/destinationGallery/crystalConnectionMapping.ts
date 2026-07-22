/**
 * Destination Gallery — Crystal → Spark Hand → Connection → Destination
 *
 * Capability model only. Does not open external sites, add OAuth, or replace
 * Settings → Connections. Wire activation UI in a later pass.
 *
 * @see docs/estate/recognition/library/155_SPARK_HANDS_ARCHITECTURE.md
 * @see docs/estate/recognition/library/156_DESTINATION_GALLERY_ARCHITECTURE.md
 * @see lib/connections/settingsConnectionCatalog.ts
 */

import type { GoogleConnectionSnapshot } from "@/lib/connections";
import type { SettingsConnectionId } from "@/lib/connections";
import type { DestinationCrystalId } from "./constants";

/**
 * Connection refs crystals may require.
 * Live ids match Settings → Connections. Planned ids must join that catalog
 * before member connect UI ships — never invent a parallel OAuth surface.
 */
export type CrystalConnectionRefId =
  | SettingsConnectionId
  | "canva"
  | "onedrive"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "pinterest"
  | "youtube";

export type CrystalConnectionCatalogPresence =
  /** Card exists in Settings → Connections today */
  | "settings-live"
  /** Named in Hands / Gallery docs; not yet a Settings connection card */
  | "planned"
  /** Social profile URL field on Connections page — not OAuth */
  | "profile-url-only";

export type CrystalConnectionRequirement = {
  id: CrystalConnectionRefId;
  title: string;
  presence: CrystalConnectionCatalogPresence;
};

/**
 * What the member can do with this crystal given current connection state.
 * Invisible machinery — crystals stay outcome objects, not app menus.
 */
export type CrystalConnectionActionKind =
  /** At least one required connection is ready (or none required). */
  | "ready"
  /** Required connection missing — route to Connections, never external site. */
  | "needs_connection"
  /** Some but not all multi-connection crystals are ready. */
  | "partial"
  /** Env/config cannot support the hand (e.g. Google OAuth not configured). */
  | "unavailable"
  /** Local-only (Print) — no Spark Connection required. */
  | "local_only";

export type CrystalConnectionCapability = {
  crystalId: DestinationCrystalId;
  /** Member-facing outcome / hand label for this mapping */
  displayLabel: string;
  purpose: string;
  requiredConnections: readonly CrystalConnectionRequirement[];
  futureConnections?: readonly CrystalConnectionRequirement[];
  /** Share / publish crystals require explicit approval before going live */
  requiresPublishApproval?: boolean;
  missingConnectionMessage: string;
  readyActionMessage: string;
};

export type CrystalConnectionSnapshot = {
  google: GoogleConnectionSnapshot;
  outlookConnected: boolean;
  /** Always false until Canva joins Settings → Connections */
  canvaConnected?: boolean;
  /**
   * Optional social profile presence (URL saved ≠ OAuth publish).
   * Keys match CrystalConnectionRefId social ids.
   */
  socialProfiles?: Partial<
    Record<
      "linkedin" | "facebook" | "instagram" | "pinterest" | "youtube",
      boolean
    >
  >;
};

export type ResolvedCrystalConnection = {
  crystalId: DestinationCrystalId;
  displayLabel: string;
  purpose: string;
  action: CrystalConnectionActionKind;
  /** Connections considered satisfied for this resolution */
  satisfiedConnectionIds: CrystalConnectionRefId[];
  /** Required connections still missing or unavailable */
  missingConnectionIds: CrystalConnectionRefId[];
  requiresPublishApproval: boolean;
  /** Open Settings → Connections when needs_connection / partial */
  shouldOpenConnections: boolean;
  memberMessage: string;
};

const GOOGLE_CALENDAR: CrystalConnectionRequirement = {
  id: "google-calendar",
  title: "Google Calendar",
  presence: "settings-live",
};

const OUTLOOK_CALENDAR: CrystalConnectionRequirement = {
  id: "outlook-calendar",
  title: "Outlook Calendar",
  presence: "settings-live",
};

const GOOGLE_DOCS: CrystalConnectionRequirement = {
  id: "google-docs",
  title: "Google Docs",
  presence: "settings-live",
};

const GOOGLE_DRIVE: CrystalConnectionRequirement = {
  id: "google-drive",
  title: "Google Drive",
  presence: "settings-live",
};

const ONEDRIVE_FUTURE: CrystalConnectionRequirement = {
  id: "onedrive",
  title: "OneDrive",
  presence: "planned",
};

const CANVA: CrystalConnectionRequirement = {
  id: "canva",
  title: "Canva",
  presence: "settings-live",
};

const SOCIAL_CONNECTIONS: readonly CrystalConnectionRequirement[] = [
  { id: "linkedin", title: "LinkedIn", presence: "profile-url-only" },
  { id: "facebook", title: "Facebook", presence: "profile-url-only" },
  { id: "instagram", title: "Instagram", presence: "profile-url-only" },
  { id: "pinterest", title: "Pinterest", presence: "profile-url-only" },
  { id: "youtube", title: "YouTube", presence: "planned" },
] as const;

/**
 * Canonical crystal → required Spark Connections map.
 * Crystal IDs must stay stable (schedule, write, save, spark-social-media, print, create).
 */
export const CRYSTAL_CONNECTION_CAPABILITIES: Record<
  DestinationCrystalId,
  CrystalConnectionCapability
> = {
  schedule: {
    crystalId: "schedule",
    displayLabel: "Schedule",
    purpose: "Schedule events, reminders, and rhythms.",
    requiredConnections: [GOOGLE_CALENDAR, OUTLOOK_CALENDAR],
    missingConnectionMessage:
      "Connect Google Calendar or Outlook Calendar to use this crystal.",
    readyActionMessage: "Open Schedule workflow.",
  },
  write: {
    crystalId: "write",
    displayLabel: "Document",
    purpose: "Create and store written documents.",
    requiredConnections: [GOOGLE_DOCS],
    missingConnectionMessage: "Connect Google Docs to use this crystal.",
    readyActionMessage: "Open Document workflow.",
  },
  save: {
    crystalId: "save",
    displayLabel: "Store",
    purpose: "Store files and resources.",
    requiredConnections: [GOOGLE_DRIVE],
    futureConnections: [ONEDRIVE_FUTURE],
    missingConnectionMessage: "Connect Google Drive to use this crystal.",
    readyActionMessage: "Open Store workflow.",
  },
  "spark-social-media": {
    crystalId: "spark-social-media",
    displayLabel: "Share",
    purpose: "Prepare and share content. No automatic publishing.",
    requiredConnections: SOCIAL_CONNECTIONS,
    requiresPublishApproval: true,
    missingConnectionMessage:
      "Add a social profile in Connections to prepare sharing from this crystal.",
    readyActionMessage:
      "Prepare to share — approval required before anything is published.",
  },
  print: {
    crystalId: "print",
    displayLabel: "Print",
    purpose: "PDF, export, and print.",
    requiredConnections: [],
    missingConnectionMessage: "",
    readyActionMessage: "Open Print or PDF workflow.",
  },
  create: {
    crystalId: "create",
    displayLabel: "Canva",
    purpose: "Send visual work to Canva. Never open legacy Create workspace.",
    requiredConnections: [CANVA],
    missingConnectionMessage: "Connect Canva to use this crystal.",
    readyActionMessage: "Open Canva design workflow.",
  },
};

export function getCrystalConnectionCapability(
  crystalId: DestinationCrystalId,
): CrystalConnectionCapability {
  return CRYSTAL_CONNECTION_CAPABILITIES[crystalId];
}

function isConnectionSatisfied(
  requirement: CrystalConnectionRequirement,
  snapshot: CrystalConnectionSnapshot,
): { satisfied: boolean; unavailable: boolean } {
  switch (requirement.id) {
    case "google-calendar":
    case "google-docs":
    case "google-drive":
      if (!snapshot.google.configured) {
        return { satisfied: false, unavailable: true };
      }
      return {
        satisfied: snapshot.google.connected,
        unavailable: false,
      };
    case "outlook-calendar":
      return {
        satisfied: snapshot.outlookConnected,
        unavailable: false,
      };
    case "canva":
      return {
        satisfied: snapshot.canvaConnected === true,
        unavailable: false,
      };
    case "onedrive":
      return { satisfied: false, unavailable: false };
    case "linkedin":
    case "facebook":
    case "instagram":
    case "pinterest":
    case "youtube":
      return {
        satisfied: snapshot.socialProfiles?.[requirement.id] === true,
        unavailable: false,
      };
    default:
      return { satisfied: false, unavailable: false };
  }
}

/**
 * Resolve connection-aware capability for a crystal from a Connections snapshot.
 * Does not navigate, open OAuth, or mutate settings.
 */
export function resolveCrystalConnection(
  crystalId: DestinationCrystalId,
  snapshot: CrystalConnectionSnapshot,
): ResolvedCrystalConnection {
  const capability = getCrystalConnectionCapability(crystalId);
  const required = capability.requiredConnections;

  if (required.length === 0) {
    return {
      crystalId,
      displayLabel: capability.displayLabel,
      purpose: capability.purpose,
      action: "local_only",
      satisfiedConnectionIds: [],
      missingConnectionIds: [],
      requiresPublishApproval: false,
      shouldOpenConnections: false,
      memberMessage: capability.readyActionMessage,
    };
  }

  const satisfiedConnectionIds: CrystalConnectionRefId[] = [];
  const missingConnectionIds: CrystalConnectionRefId[] = [];
  let anyUnavailable = false;

  for (const requirement of required) {
    const { satisfied, unavailable } = isConnectionSatisfied(
      requirement,
      snapshot,
    );
    if (satisfied) {
      satisfiedConnectionIds.push(requirement.id);
    } else {
      missingConnectionIds.push(requirement.id);
      if (unavailable) anyUnavailable = true;
    }
  }

  const allSatisfied = missingConnectionIds.length === 0;
  const noneSatisfied = satisfiedConnectionIds.length === 0;
  const requiresPublishApproval = capability.requiresPublishApproval === true;

  // Schedule: either Google Calendar or Outlook is enough.
  if (crystalId === "schedule") {
    const calendarReady = satisfiedConnectionIds.length > 0;
    if (calendarReady) {
      return {
        crystalId,
        displayLabel: capability.displayLabel,
        purpose: capability.purpose,
        action: "ready",
        satisfiedConnectionIds,
        missingConnectionIds,
        requiresPublishApproval: false,
        shouldOpenConnections: false,
        memberMessage: capability.readyActionMessage,
      };
    }
    const googleUnavailable =
      !snapshot.google.configured && !snapshot.outlookConnected;
    return {
      crystalId,
      displayLabel: capability.displayLabel,
      purpose: capability.purpose,
      action: googleUnavailable ? "unavailable" : "needs_connection",
      satisfiedConnectionIds,
      missingConnectionIds,
      requiresPublishApproval: false,
      shouldOpenConnections: !googleUnavailable,
      memberMessage: googleUnavailable
        ? "Calendar connections are not available yet."
        : capability.missingConnectionMessage,
    };
  }

  // Share: any one prepared profile is enough to prepare (never auto-publish).
  if (crystalId === "spark-social-media") {
    if (satisfiedConnectionIds.length > 0) {
      return {
        crystalId,
        displayLabel: capability.displayLabel,
        purpose: capability.purpose,
        action: allSatisfied ? "ready" : "partial",
        satisfiedConnectionIds,
        missingConnectionIds,
        requiresPublishApproval,
        shouldOpenConnections: false,
        memberMessage: capability.readyActionMessage,
      };
    }
    return {
      crystalId,
      displayLabel: capability.displayLabel,
      purpose: capability.purpose,
      action: "needs_connection",
      satisfiedConnectionIds,
      missingConnectionIds,
      requiresPublishApproval,
      shouldOpenConnections: true,
      memberMessage: capability.missingConnectionMessage,
    };
  }

  if (allSatisfied) {
    return {
      crystalId,
      displayLabel: capability.displayLabel,
      purpose: capability.purpose,
      action: "ready",
      satisfiedConnectionIds,
      missingConnectionIds,
      requiresPublishApproval,
      shouldOpenConnections: false,
      memberMessage: capability.readyActionMessage,
    };
  }

  if (anyUnavailable && noneSatisfied) {
    return {
      crystalId,
      displayLabel: capability.displayLabel,
      purpose: capability.purpose,
      action: "unavailable",
      satisfiedConnectionIds,
      missingConnectionIds,
      requiresPublishApproval,
      shouldOpenConnections: false,
      memberMessage: `${capability.displayLabel} is not available to connect yet.`,
    };
  }

  return {
    crystalId,
    displayLabel: capability.displayLabel,
    purpose: capability.purpose,
    action: "needs_connection",
    satisfiedConnectionIds,
    missingConnectionIds,
    requiresPublishApproval,
    shouldOpenConnections: true,
    memberMessage: capability.missingConnectionMessage,
  };
}

/** Crystal IDs that must never route to legacy Create / content-generator. */
export const CRYSTALS_FORBIDDEN_LEGACY_CREATE: readonly DestinationCrystalId[] =
  ["create"] as const;
