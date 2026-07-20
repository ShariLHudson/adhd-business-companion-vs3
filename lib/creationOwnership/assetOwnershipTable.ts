/**
 * 050 — Asset-type ownership enrichments / alignments.
 * Primary owners prefer Event Asset Registry / Create Assets; this table
 * supplies contributors, workspace coordinator, and rare primary overrides.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";

export type AssetOwnershipEnrichment = {
  assetTypeId: string;
  /** Override only when registry and 050 must align */
  primaryOwner?: ChamberMemberId;
  supporting: readonly ChamberMemberId[];
  boardAdvisors?: readonly string[];
  /** Events remains workspace coordinator for event-connected assets */
  workspaceCoordinator?: ChamberMemberId;
  aliases?: readonly string[];
};

/**
 * Event reference scenario + cross-workspace asset ownership.
 */
export const ASSET_OWNERSHIP_ENRICHMENT: readonly AssetOwnershipEnrichment[] = [
  {
    assetTypeId: "agenda",
    primaryOwner: "events",
    supporting: ["content", "leadership", "project-management", "learning"],
    workspaceCoordinator: "events",
    aliases: ["event agenda", "workshop agenda"],
  },
  {
    assetTypeId: "registration_confirmation_email",
    primaryOwner: "content",
    supporting: ["events", "marketing", "client-relationships"],
    workspaceCoordinator: "events",
    aliases: ["confirmation email", "registration confirmation"],
  },
  {
    assetTypeId: "event_budget",
    primaryOwner: "finance",
    supporting: ["events", "project-management"],
    workspaceCoordinator: "events",
    aliases: ["budget", "event budget"],
  },
  {
    assetTypeId: "attendee_workbook",
    primaryOwner: "content",
    supporting: ["events", "learning", "creative-studio"],
    workspaceCoordinator: "events",
    aliases: ["workbook", "workshop workbook"],
  },
  {
    assetTypeId: "presentation_deck",
    primaryOwner: "creative-studio",
    supporting: ["content", "events", "presentations"],
    workspaceCoordinator: "events",
    aliases: ["presentation", "slides", "deck"],
  },
  {
    assetTypeId: "registration_form",
    primaryOwner: "events",
    supporting: ["content", "client-relationships", "marketing"],
    workspaceCoordinator: "events",
  },
];

export function enrichmentForAsset(
  assetTypeId: string,
): AssetOwnershipEnrichment | null {
  return (
    ASSET_OWNERSHIP_ENRICHMENT.find((e) => e.assetTypeId === assetTypeId) ??
    null
  );
}
