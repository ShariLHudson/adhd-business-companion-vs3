/**
 * 051 Phase 5 — Change impact (wraps 049 assetsNeedingReviewAfterChange).
 */

import { assetsNeedingReviewAfterChange } from "@/lib/creationEcosystem";

export type ChangeImpactResult = {
  changedField: string;
  affectedAssetKeys: string[];
  reviewRequired: boolean;
  explanation: string;
};

const FIELD_HINTS: Record<string, string> = {
  audience:
    "Audience changes may affect landing pages, registration, emails, workbook examples, presentations, accessibility, pricing, and promotion.",
  dates:
    "Date changes may affect timelines, reminders, venues, speakers, vendors, tasks, and marketing calendars.",
  purpose: "Purpose changes may affect nearly every asset — review recommended.",
};

export function evaluateChangeImpact(input: {
  creationId: string;
  changedField: string;
  /** Optional: concrete entity that changed (section / decision / asset) */
  changedId?: string;
}): ChangeImpactResult {
  const affected = assetsNeedingReviewAfterChange({
    creationId: input.creationId,
    changedKind: "section",
    changedId: input.changedId ?? input.changedField,
  });
  const keys = affected.map((a) => a.assetInstanceKey);
  return {
    changedField: input.changedField,
    affectedAssetKeys: keys,
    reviewRequired: keys.length > 0 || Boolean(FIELD_HINTS[input.changedField]),
    explanation:
      FIELD_HINTS[input.changedField] ??
      "Related assets may need a guided review. Nothing was overwritten.",
  };
}
