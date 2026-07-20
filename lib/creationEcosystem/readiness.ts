/**
 * 049 — Readiness Engine
 * Every new / completed asset updates section and overall readiness.
 */

import type { CreationEcosystemRecord } from "@/lib/createAssets";
import { getCreateAssetById } from "@/lib/createAssets";
import type { CreationReadinessSnapshot } from "./types";
import { listAssetRelationshipCards } from "./relationshipRegistry";

const AREA_FOR_ASSET: Record<string, string> = {
  "asset-event-plan": "Foundation",
  "asset-agenda": "Learning Materials",
  "asset-session-plans": "Learning Materials",
  "asset-registration-form": "Registration",
  "asset-confirmation-email": "Registration",
  "asset-reminder-email": "Registration",
  "asset-budget": "Operations",
  "asset-venue-notes": "Operations",
  "asset-vendor-list": "Operations",
  "asset-run-of-show": "Delivery",
  "asset-tech-checklist": "Delivery",
  "asset-speaker-packet": "Program",
  "asset-welcome-guide": "Attendee Experience",
  "asset-volunteer-handbook": "Staffing",
  "asset-thank-you-email": "Follow-up",
  "asset-debrief": "Follow-up",
};

export function computeCreationReadiness(input: {
  creationId: string;
  ecosystem?: CreationEcosystemRecord | null;
  /** Expected asset def ids for this creation (from ecosystem definition) */
  expectedAssetIds?: readonly string[];
}): CreationReadinessSnapshot {
  const cards = listAssetRelationshipCards(input.creationId);
  const instances = input.ecosystem?.instances ?? [];
  const expected =
    input.expectedAssetIds && input.expectedAssetIds.length
      ? input.expectedAssetIds
      : instances.map((i) => i.assetId);

  const byArea: Record<string, { done: number; total: number }> = {};

  const mark = (area: string, done: boolean) => {
    if (!byArea[area]) byArea[area] = { done: 0, total: 0 };
    byArea[area]!.total += 1;
    if (done) byArea[area]!.done += 1;
  };

  const doneIds = new Set([
    ...instances
      .filter((i) => i.status === "complete" || i.status === "drafting")
      .map((i) => i.assetId),
    ...cards
      .filter((c) => c.status === "draft" || c.status === "approved" || c.status === "in_review")
      .map((c) => c.assetDefId),
  ]);

  const completeIds = new Set([
    ...instances.filter((i) => i.status === "complete").map((i) => i.assetId),
    ...cards.filter((c) => c.status === "approved").map((c) => c.assetDefId),
  ]);

  const pool = expected.length
    ? expected
    : [...new Set([...doneIds, ...completeIds])];

  for (const assetId of pool) {
    const area = AREA_FOR_ASSET[assetId] ?? "Other";
    const def = getCreateAssetById(assetId);
    void def;
    mark(area, completeIds.has(assetId) || doneIds.has(assetId));
  }

  // Weight: complete = 1, drafting = 0.55, missing = 0
  let score = 0;
  let weight = 0;
  for (const assetId of pool) {
    weight += 1;
    if (completeIds.has(assetId)) score += 1;
    else if (doneIds.has(assetId)) score += 0.55;
  }

  const overallPercent =
    weight === 0 ? 0 : Math.round((score / weight) * 100);

  const byAreaPercent: Record<string, number> = {};
  for (const [area, v] of Object.entries(byArea)) {
    byAreaPercent[area] =
      v.total === 0 ? 0 : Math.round((v.done / v.total) * 100);
  }

  return {
    creationId: input.creationId,
    overallPercent,
    byArea: byAreaPercent,
    updatedAt: new Date().toISOString(),
  };
}
