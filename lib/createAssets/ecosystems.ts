/**
 * 047 — Creation ecosystems reference shared assets (never hard-code copies).
 */

import type { CreationEcosystemDefinition } from "./types";

export const CREATION_ECOSYSTEMS: readonly CreationEcosystemDefinition[] = [
  {
    id: "eco-retreat-weekend",
    blueprintId: "bp-retreat-event",
    label: "Retreat Weekend",
    primaryAssetId: "asset-event-plan",
    assets: [
      { assetId: "asset-event-plan", required: true, suggestAfterSignals: ["ecosystem_started"] },
      // Venue unlock — prioritize what organizers usually create next
      {
        assetId: "asset-registration-form",
        suggestAfterSignals: ["venue", "dates"],
      },
      {
        assetId: "asset-venue-notes",
        contextLabel: "Venue Timeline",
        suggestAfterSignals: ["venue"],
      },
      {
        assetId: "asset-vendor-list",
        contextLabel: "Vendor Checklist",
        suggestAfterSignals: ["venue"],
      },
      { assetId: "asset-budget", suggestAfterSignals: ["budget"] },
      { assetId: "asset-timeline", suggestAfterSignals: ["dates", "outcomes"] },
      { assetId: "asset-venue-comparison", suggestAfterSignals: ["format", "audience"] },
      { assetId: "asset-confirmation-email", suggestAfterSignals: ["registration"] },
      { assetId: "asset-reminder-email", suggestAfterSignals: ["registration", "dates"] },
      { assetId: "asset-packing-list", suggestAfterSignals: ["venue", "format"] },
      { assetId: "asset-welcome-guide", suggestAfterSignals: ["venue", "audience"] },
      { assetId: "asset-agenda", suggestAfterSignals: ["outcomes", "dates"] },
      { assetId: "asset-session-plans", suggestAfterSignals: ["agenda"] },
      { assetId: "asset-speaker-packet", suggestAfterSignals: ["speakers", "agenda"] },
      { assetId: "asset-speaker-agreement", suggestAfterSignals: ["speakers"] },
      { assetId: "asset-volunteer-handbook", suggestAfterSignals: ["volunteers", "venue"] },
      { assetId: "asset-volunteer-schedule", suggestAfterSignals: ["volunteers", "agenda"] },
      { assetId: "asset-run-of-show", suggestAfterSignals: ["agenda", "venue"] },
      { assetId: "asset-tech-checklist", suggestAfterSignals: ["venue", "technology"] },
      { assetId: "asset-accessibility-plan", suggestAfterSignals: ["venue", "audience"] },
      { assetId: "asset-emergency-plan", suggestAfterSignals: ["venue"] },
      { assetId: "asset-thank-you-email", suggestAfterSignals: ["follow_up", "delivery"] },
      { assetId: "asset-debrief", suggestAfterSignals: ["follow_up", "debrief"] },
      { assetId: "asset-archive", suggestAfterSignals: ["debrief", "archive"] },
      { assetId: "asset-sponsor-package", suggestAfterSignals: ["sponsors", "budget"] },
    ],
  },
  {
    id: "eco-event-plan",
    blueprintId: "bp-event-plan",
    label: "Event",
    primaryAssetId: "asset-event-plan",
    assets: [
      { assetId: "asset-event-plan", required: true, suggestAfterSignals: ["ecosystem_started"] },
      { assetId: "asset-budget", suggestAfterSignals: ["outcomes", "budget"] },
      { assetId: "asset-timeline", suggestAfterSignals: ["dates"] },
      { assetId: "asset-venue-notes", suggestAfterSignals: ["venue"] },
      { assetId: "asset-registration-form", suggestAfterSignals: ["venue", "dates"] },
      { assetId: "asset-confirmation-email", suggestAfterSignals: ["registration"] },
      { assetId: "asset-agenda", suggestAfterSignals: ["outcomes"] },
      { assetId: "asset-speaker-packet", suggestAfterSignals: ["speakers"] },
      { assetId: "asset-vendor-list", suggestAfterSignals: ["venue"] },
      { assetId: "asset-run-of-show", suggestAfterSignals: ["agenda"] },
      { assetId: "asset-tech-checklist", suggestAfterSignals: ["technology", "venue"] },
      { assetId: "asset-thank-you-email", suggestAfterSignals: ["follow_up"] },
      { assetId: "asset-debrief", suggestAfterSignals: ["debrief"] },
    ],
  },
  {
    id: "eco-workshop",
    blueprintId: "bp-workshop",
    label: "Workshop",
    primaryAssetId: "asset-event-plan",
    assets: [
      { assetId: "asset-event-plan", required: true, suggestAfterSignals: ["ecosystem_started"] },
      { assetId: "asset-agenda", suggestAfterSignals: ["outcomes"] },
      { assetId: "asset-session-plans", suggestAfterSignals: ["agenda"] },
      { assetId: "asset-registration-form", suggestAfterSignals: ["dates"] },
      { assetId: "asset-confirmation-email", suggestAfterSignals: ["registration"] },
      { assetId: "asset-tech-checklist", suggestAfterSignals: ["format", "technology"] },
      { assetId: "asset-thank-you-email", suggestAfterSignals: ["follow_up"] },
    ],
  },
  {
    id: "eco-launch",
    blueprintId: "bp-launch-plan",
    label: "Product Launch",
    primaryAssetId: "asset-email-sequence",
    assets: [
      {
        assetId: "asset-email-sequence",
        required: true,
        suggestAfterSignals: ["ecosystem_started", "launch"],
      },
      { assetId: "asset-timeline", suggestAfterSignals: ["outcomes", "dates"] },
      { assetId: "asset-budget", suggestAfterSignals: ["budget"] },
      { assetId: "asset-checklist", suggestAfterSignals: ["preparation"] },
    ],
  },
];

const BY_ID = new Map(CREATION_ECOSYSTEMS.map((e) => [e.id, e]));
const BY_BLUEPRINT = new Map(CREATION_ECOSYSTEMS.map((e) => [e.blueprintId, e]));

export function getCreationEcosystemById(
  id: string,
): CreationEcosystemDefinition | null {
  return BY_ID.get(id) ?? null;
}

export function getCreationEcosystemForBlueprint(
  blueprintId: string,
): CreationEcosystemDefinition | null {
  return BY_BLUEPRINT.get(blueprintId) ?? null;
}

export function listCreationEcosystems(): readonly CreationEcosystemDefinition[] {
  return CREATION_ECOSYSTEMS;
}
