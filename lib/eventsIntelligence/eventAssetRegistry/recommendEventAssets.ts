/**
 * Deterministic Event Asset recommendations (050 / 052A).
 * Focused set for Workspace UI — never dump the full registry.
 */

import type { EventRecord } from "../types";
import { EVENT_ASSET_DEFINITIONS } from "./definitions";
import { isEventTypeApplicable } from "./query";
import { listEventAssetInstances } from "./instances";
import type {
  EventAssetDefinition,
  EventAssetRecommendation,
  EventAssetRecommendationBand,
  FormatApplicability,
  RecommendEventAssetsOptions,
} from "./types";

function contextBlob(record: EventRecord, extra?: string): string {
  return [
    record.title,
    record.purpose,
    record.audience,
    record.outcomes,
    record.conversationContext,
    extra ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function signalsFromRecord(record: EventRecord): Set<string> {
  const s = new Set<string>(["ecosystem_started"]);
  if (record.outcomes.trim()) s.add("outcomes");
  if (record.audience.trim()) s.add("audience");
  if (record.purpose.trim()) s.add("purpose");
  if (record.dates.trim()) s.add("dates");
  if (record.venue.trim()) s.add("venue");
  if (record.budget.trim()) s.add("budget");
  if (record.format !== "unspecified") s.add("format");
  for (const sec of record.sections) {
    if (sec.content.trim() || sec.status === "confirmed") s.add(sec.id);
  }
  const blob = contextBlob(record);
  if (/\bbeta\b|\btest(?:ing|er)?\b/.test(blob)) s.add("beta_testing");
  return s;
}

function formatOk(
  applicability: FormatApplicability,
  format: EventRecord["format"],
): { ok: boolean; defer: boolean } {
  if (applicability.mode === "all") return { ok: true, defer: false };
  if (applicability.mode === "include") {
    if (format === "unspecified") return { ok: true, defer: true };
    return { ok: applicability.formats.includes(format), defer: false };
  }
  if (applicability.mode === "exclude") {
    if (format === "unspecified") return { ok: true, defer: true };
    return { ok: !applicability.formats.includes(format), defer: false };
  }
  // defer_until_format
  if (format === "unspecified") return { ok: true, defer: true };
  return { ok: applicability.prefer.includes(format), defer: false };
}

function fieldPresent(record: EventRecord, field: string): boolean {
  switch (field) {
    case "event_type":
      return Boolean(record.eventTypeLabel);
    case "title":
      return Boolean(record.title.trim());
    case "purpose":
      return Boolean(record.purpose.trim());
    case "audience":
      return Boolean(record.audience.trim());
    case "outcomes":
      return Boolean(record.outcomes.trim());
    case "format":
      return record.format !== "unspecified";
    case "dates":
      return Boolean(record.dates.trim());
    case "venue":
      return Boolean(record.venue.trim());
    case "budget":
      return Boolean(record.budget.trim());
    case "beta_testing":
      return /\bbeta\b|\btest(?:ing|er)?\b/i.test(contextBlob(record));
    default:
      return Boolean(
        record.sections.find((s) => s.id === field)?.content.trim(),
      );
  }
}

function scoreDefinition(
  def: EventAssetDefinition,
  record: EventRecord,
  signals: Set<string>,
  blob: string,
  multiDay: boolean,
): {
  band: EventAssetRecommendationBand;
  reason: string;
  priority: number;
} | null {
  if (def.status === "deprecated") return null;

  if (!isEventTypeApplicable(def.applicableEventTypes, record.eventType)) {
    return {
      band: "not_applicable",
      reason: "Not applicable to this event type.",
      priority: 999,
    };
  }

  const fmt = formatOk(def.formatApplicability, record.format);
  if (!fmt.ok) {
    return {
      band: "not_applicable",
      reason: "Not applicable to this format.",
      priority: 999,
    };
  }

  // Core capabilities belong in focus whenever the event type/format applies
  if (def.requiredLevel === "core") {
    return {
      band: fmt.defer ? "recommended_now" : "required_now",
      reason: "Core asset for this creation workspace.",
      priority: 1,
    };
  }

  for (const rule of def.recommendationRules) {
    if (rule.requireMultiDay && !multiDay) continue;
    if (rule.formatApplicability) {
      const f = formatOk(rule.formatApplicability, record.format);
      if (!f.ok) continue;
    }
    if (
      rule.requireContext?.length &&
      !rule.requireContext.every((c) => fieldPresent(record, c))
    ) {
      continue;
    }
    if (
      rule.outcomeKeywords?.length &&
      !rule.outcomeKeywords.some((k) => blob.includes(k.toLowerCase()))
    ) {
      continue;
    }
    if (
      rule.afterSignals?.length &&
      !rule.afterSignals.some((sig) => signals.has(sig))
    ) {
      continue;
    }

    const band =
      rule.bandHint ??
      (def.requiredLevel === "conditional" ? "recommended_now" : "optional");
    return {
      band,
      reason: rule.description,
      priority: rule.priority ?? 5,
    };
  }

  // Foundation progress unlocks high-priority conditionals even before venue/dates
  const foundationReady =
    signals.has("outcomes") || signals.has("audience") || signals.has("purpose");
  const highPriority = def.recommendationRules.some(
    (r) => (r.priority ?? 99) <= 2,
  );
  if (
    foundationReady &&
    def.requiredLevel === "conditional" &&
    highPriority
  ) {
    return {
      band: "recommended_now",
      reason: "Usually created next once purpose and audience are clear.",
      priority: 3,
    };
  }

  if (/\bbeta\b|\btest(?:ing|er)?\b/.test(blob)) {
    if (
      def.assetTypeId.includes("beta") ||
      def.recommendationRules.some((r) =>
        r.outcomeKeywords?.some((k) => /beta|test/i.test(k)),
      )
    ) {
      return {
        band: "recommended_now",
        reason: "Relevant because beta testing is part of this event.",
        priority: 2,
      };
    }
  }

  const phaseMatch = def.lifecyclePhases.includes(record.lifecyclePhase);
  if (def.requiredLevel === "conditional" && phaseMatch) {
    return {
      band: "recommended_later",
      reason: "Relevant later in this lifecycle phase.",
      priority: 8,
    };
  }
  if (def.requiredLevel === "optional") {
    return {
      band: "optional",
      reason: "Optional capability in the registry.",
      priority: 20,
    };
  }
  return {
    band: "recommended_later",
    reason: "Available in the capability registry.",
    priority: 15,
  };
}

export type RecommendEventAssetsResult = {
  focused: EventAssetRecommendation[];
  byBand: Record<EventAssetRecommendationBand, EventAssetRecommendation[]>;
  all: EventAssetRecommendation[];
};

/**
 * Recommend assets for an Event Record. Focused list for UI; full bands for tests.
 */
export function recommendEventAssets(
  record: EventRecord,
  options: RecommendEventAssetsOptions = {},
): RecommendEventAssetsResult {
  const focusLimit = options.focusLimit ?? 12;
  const includeLater = options.includeLater ?? true;
  const multiDay =
    options.multiDay ??
    (/\bmulti-?day\b|weekend\b/i.test(
      `${record.dates} ${record.title} ${record.eventTypeLabel}`,
    ) ||
      record.eventType === "retreat" ||
      record.eventType === "multi_day");

  const existing = new Set([
    ...(options.existingAssetTypeIds ?? []),
    ...listEventAssetInstances(record.id).map((i) => i.assetTypeId),
  ]);

  const signals = signalsFromRecord(record);
  const blob = contextBlob(record, options.contextText);

  const all: EventAssetRecommendation[] = [];

  for (const def of EVENT_ASSET_DEFINITIONS) {
    if (existing.has(def.assetTypeId)) {
      all.push({
        assetTypeId: def.assetTypeId,
        canonicalName: def.canonicalName,
        userFacingName: def.userFacingName,
        band: "already_created",
        category: def.category,
        reason: "Already created for this event.",
        priority: 0,
        primaryChamberOwner: def.primaryChamberOwner,
      });
      continue;
    }

    const scored = scoreDefinition(def, record, signals, blob, multiDay);
    if (!scored) continue;

    all.push({
      assetTypeId: def.assetTypeId,
      canonicalName: def.canonicalName,
      userFacingName: def.userFacingName,
      band: scored.band,
      category: def.category,
      reason: scored.reason,
      priority: scored.priority,
      primaryChamberOwner: def.primaryChamberOwner,
    });
  }

  const byBand: Record<EventAssetRecommendationBand, EventAssetRecommendation[]> =
    {
      required_now: [],
      recommended_now: [],
      recommended_later: [],
      optional: [],
      not_applicable: [],
      already_created: [],
    };

  for (const r of all) {
    byBand[r.band].push(r);
  }

  for (const band of Object.keys(byBand) as EventAssetRecommendationBand[]) {
    byBand[band].sort((a, b) => a.priority - b.priority || a.assetTypeId.localeCompare(b.assetTypeId));
  }

  const focused = [
    ...byBand.required_now,
    ...byBand.recommended_now,
  ].slice(0, focusLimit);

  return {
    focused,
    byBand,
    all: includeLater
      ? all
      : [...byBand.already_created, ...focused, ...byBand.recommended_later.slice(0, 5)],
  };
}

/** Recommendations scoped to one Workspace section (052A). */
export function recommendAssetsForSection(
  record: EventRecord,
  sectionId: string,
  options?: RecommendEventAssetsOptions,
): EventAssetRecommendation[] {
  const { byBand } = recommendEventAssets(record, {
    ...options,
    focusLimit: options?.focusLimit ?? 8,
  });
  const pool = [
    ...byBand.required_now,
    ...byBand.recommended_now,
    ...byBand.recommended_later,
    ...byBand.optional,
  ];
  return pool
    .filter((r) => {
      const def = EVENT_ASSET_DEFINITIONS.find(
        (d) => d.assetTypeId === r.assetTypeId,
      );
      return def?.eventSections.includes(sectionId as never);
    })
    .slice(0, options?.focusLimit ?? 8);
}
