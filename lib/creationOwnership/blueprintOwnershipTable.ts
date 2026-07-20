/**
 * 050 — Blueprint contributor / advisor tables.
 * Primary owners come from 046 CreateBlueprint.ownerChamberMemberId.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";

export type BlueprintOwnershipEnrichment = {
  blueprintId: string;
  supporting: readonly ChamberMemberId[];
  boardAdvisors?: readonly string[];
  workspaceCoordinator?: ChamberMemberId;
};

/**
 * Standard 050 blueprint collaboration map.
 * Primary owner remains on the Create Blueprint registry.
 */
export const BLUEPRINT_OWNERSHIP_ENRICHMENT: readonly BlueprintOwnershipEnrichment[] =
  [
    {
      blueprintId: "bp-event-plan",
      supporting: [
        "finance",
        "marketing",
        "content",
        "project-management",
        "client-relationships",
        "leadership",
      ],
      workspaceCoordinator: "events",
    },
    {
      blueprintId: "bp-retreat-event",
      supporting: [
        "finance",
        "marketing",
        "content",
        "project-management",
        "client-relationships",
        "leadership",
        "wellness",
      ],
      workspaceCoordinator: "events",
    },
    {
      blueprintId: "bp-workshop",
      supporting: [
        "finance",
        "marketing",
        "content",
        "learning",
        "project-management",
        "client-relationships",
        "leadership",
      ],
      workspaceCoordinator: "events",
    },
    {
      blueprintId: "bp-marketing-strategy",
      supporting: [
        "data-analytics",
        "finance",
        "content",
        "creative-studio",
        "client-relationships",
      ],
    },
    {
      blueprintId: "bp-launch-plan",
      supporting: [
        "data-analytics",
        "finance",
        "content",
        "creative-studio",
        "client-relationships",
      ],
    },
    {
      blueprintId: "bp-book",
      supporting: ["research", "creative-studio", "marketing", "learning"],
    },
    {
      blueprintId: "bp-course",
      supporting: [
        "content",
        "creative-studio",
        "marketing",
        "client-relationships",
      ],
    },
    {
      blueprintId: "bp-leadership-training",
      supporting: ["learning", "content", "events", "client-relationships"],
    },
    {
      blueprintId: "bp-proposal",
      supporting: ["content", "project-management", "marketing", "data-analytics"],
    },
    {
      blueprintId: "bp-budget",
      supporting: ["project-management", "events", "finance"],
    },
    {
      blueprintId: "bp-presentation",
      supporting: ["content", "creative-studio", "events"],
    },
  ];

export function enrichmentForBlueprint(
  blueprintId: string,
): BlueprintOwnershipEnrichment | null {
  return (
    BLUEPRINT_OWNERSHIP_ENRICHMENT.find((e) => e.blueprintId === blueprintId) ??
    null
  );
}
