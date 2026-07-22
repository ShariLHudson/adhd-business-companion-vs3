/**
 * Canonical Destination Gallery crystal registry (Prompt 142).
 * Source of truth for crystal identity, launch, fallback, and status.
 *
 * @see docs/estate/recognition/library/156_DESTINATION_GALLERY_ARCHITECTURE.md
 */

import type { DestinationCrystalId } from "./constants";
import type { CrystalConnectionRefId } from "./crystalConnectionMapping";

/** Member-visible functional state — must match real launch capability. */
export type CrystalFunctionalStatus =
  | "connected"
  | "available_to_connect"
  | "coming_soon"
  | "disabled";

export type CrystalDestinationType =
  | "estate_place"
  | "external_service"
  | "local_workflow"
  | "prepared_share";

export type CrystalLaunchBehavior =
  | "open_estate_calendar"
  | "open_preferred_document_destination"
  | "open_preferred_storage_destination"
  | "prepare_share_for_approval"
  | "run_preferred_print_workflow"
  | "open_canva_destination"
  | "open_connections_settings"
  | "hidden_until_ready";

export type CrystalFallbackBehavior =
  | "explain_and_open_connections"
  | "stay_in_gallery_prepared"
  | "honest_unavailable"
  | "hide_crystal";

export type DestinationCrystalRegistryEntry = {
  crystalName: string;
  internalId: DestinationCrystalId;
  userFacingLabel: string;
  destinationType: CrystalDestinationType;
  requiredConnection: CrystalConnectionRefId | null;
  /** Alternate connections that also satisfy readiness (OR) */
  alternateConnections?: readonly CrystalConnectionRefId[];
  launchBehavior: CrystalLaunchBehavior;
  fallbackBehavior: CrystalFallbackBehavior;
  /** Product status for this crystal in the gallery */
  status: CrystalFunctionalStatus;
  /** When false, crystal must not appear in the gallery hit field */
  visibleInGallery: boolean;
};

/**
 * Every Destination Gallery crystal — decorative / non-working crystals forbidden.
 * Coming Soon entries stay hidden until intentionally enabled.
 */
export const DESTINATION_CRYSTAL_REGISTRY: readonly DestinationCrystalRegistryEntry[] =
  [
    {
      crystalName: "Schedule",
      internalId: "schedule",
      userFacingLabel: "Schedule",
      destinationType: "estate_place",
      requiredConnection: "google-calendar",
      alternateConnections: ["outlook-calendar"],
      launchBehavior: "open_estate_calendar",
      fallbackBehavior: "explain_and_open_connections",
      status: "available_to_connect",
      visibleInGallery: true,
    },
    {
      crystalName: "Document",
      internalId: "write",
      userFacingLabel: "Document",
      destinationType: "external_service",
      requiredConnection: "google-docs",
      launchBehavior: "open_preferred_document_destination",
      fallbackBehavior: "explain_and_open_connections",
      status: "available_to_connect",
      visibleInGallery: true,
    },
    {
      crystalName: "Store",
      internalId: "save",
      userFacingLabel: "Store",
      destinationType: "external_service",
      requiredConnection: "google-drive",
      launchBehavior: "open_preferred_storage_destination",
      fallbackBehavior: "explain_and_open_connections",
      status: "available_to_connect",
      visibleInGallery: true,
    },
    {
      crystalName: "Share",
      internalId: "spark-social-media",
      userFacingLabel: "Share",
      destinationType: "prepared_share",
      requiredConnection: "linkedin",
      alternateConnections: [
        "facebook",
        "instagram",
        "pinterest",
        "youtube",
      ],
      launchBehavior: "prepare_share_for_approval",
      fallbackBehavior: "explain_and_open_connections",
      status: "available_to_connect",
      visibleInGallery: true,
    },
    {
      crystalName: "Print",
      internalId: "print",
      userFacingLabel: "Print",
      destinationType: "local_workflow",
      requiredConnection: null,
      launchBehavior: "run_preferred_print_workflow",
      fallbackBehavior: "stay_in_gallery_prepared",
      status: "connected",
      visibleInGallery: true,
    },
    {
      crystalName: "Design",
      internalId: "create",
      userFacingLabel: "Design",
      destinationType: "external_service",
      requiredConnection: "canva",
      launchBehavior: "open_canva_destination",
      fallbackBehavior: "explain_and_open_connections",
      status: "available_to_connect",
      visibleInGallery: true,
    },
  ] as const;

export function getDestinationCrystalRegistryEntry(
  id: DestinationCrystalId,
): DestinationCrystalRegistryEntry {
  const entry = DESTINATION_CRYSTAL_REGISTRY.find((e) => e.internalId === id);
  if (!entry) {
    throw new Error(`Unknown destination crystal: ${id}`);
  }
  return entry;
}

export function listVisibleDestinationCrystals(): DestinationCrystalRegistryEntry[] {
  return DESTINATION_CRYSTAL_REGISTRY.filter((e) => e.visibleInGallery);
}

/**
 * Resolve functional status from live connection capability.
 * Visual state must match actual functionality.
 */
export function resolveCrystalFunctionalStatus(input: {
  crystalId: DestinationCrystalId;
  connectionAction:
    | "ready"
    | "needs_connection"
    | "partial"
    | "unavailable"
    | "local_only";
}): CrystalFunctionalStatus {
  const entry = getDestinationCrystalRegistryEntry(input.crystalId);
  if (!entry.visibleInGallery || entry.status === "coming_soon") {
    return "coming_soon";
  }
  if (entry.status === "disabled") return "disabled";

  switch (input.connectionAction) {
    case "ready":
    case "local_only":
    case "partial":
      return "connected";
    case "needs_connection":
      return "available_to_connect";
    case "unavailable":
      return "disabled";
    default:
      return "available_to_connect";
  }
}
