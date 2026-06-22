/**
 * Sprint 2C-2 — Trust Inspector read-only query API (observe-only).
 */

import { isProfileLearningEnabled, isTrustInspectorEnabled } from "./featureFlags";
import { getIntelligenceProfile } from "./profileStore";
import { resolveSignalTraitMapping } from "./signalMapping";
import { getTrustCollectionDiagnostics } from "./trustDiagnostics";
import {
  getTrustAuditLog as getPersistedTrustAuditLog,
  type TrustAuditEntry,
} from "./trustEvolutionAudit";
import type { TraitScore } from "./types";
import { runTrustValidationScenarios } from "./trustValidationScenarios";

export type { TrustAuditEntry } from "./trustEvolutionAudit";

export type TrustAuditLogFilter = {
  sessionId?: string;
  trustCategory?: string;
  reason?: string;
  evolve?: boolean;
  limit?: number;
};

export type TrustInspectorSummary = {
  recorded: number;
  evolved: number;
  blocked: number;
  blockedByReason: Record<string, number>;
  unknownBuckets: number;
  systemCaused: number;
  renderOnly: number;
  trustInspectorEnabled: boolean;
  profileLearningEnabled: boolean;
};

export type TrustTraitStatus = "unset" | "learning" | "stable";

export type TrustTraitSnapshotItem = {
  path: string;
  score: number | null;
  confidence: number | null;
  observations: number;
  lastUpdated: string | null;
  status: TrustTraitStatus;
  recentEvidence: TrustAuditEntry[];
};

export type TrustTraitSnapshot = Record<
  | "responds_to_suggestions"
  | "ignores_generic_suggestions"
  | "momentum_from_interventions"
  | "disengages_from_nagging",
  TrustTraitSnapshotItem
>;

const TRUST_TRAIT_KEYS = [
  "responds_to_suggestions",
  "ignores_generic_suggestions",
  "momentum_from_interventions",
  "disengages_from_nagging",
] as const;

const RENDER_ONLY_CATEGORIES = new Set([
  "offer_rendered",
  "offer_suppressed",
  "offer_blocked",
  "trust.offer_rendered",
  "trust.offer_suppressed",
  "trust.offer_blocked",
]);

const SYSTEM_CAUSATION_TYPES = new Set([
  "system_suppressed",
  "system_blocked",
]);

function traitPathForKey(
  key: (typeof TRUST_TRAIT_KEYS)[number],
): string {
  return `relationship.trust.${key}`;
}

function isRenderOnlyEntry(entry: TrustAuditEntry): boolean {
  return (
    RENDER_ONLY_CATEGORIES.has(entry.busCategory) ||
    RENDER_ONLY_CATEGORIES.has(entry.trustCategory) ||
    entry.reason === "render_only_signal"
  );
}

function isSystemCausedEntry(entry: TrustAuditEntry): boolean {
  return (
    entry.reason === "system_causation" ||
    (entry.causationType !== undefined &&
      SYSTEM_CAUSATION_TYPES.has(entry.causationType))
  );
}

function isUnknownBucketEntry(entry: TrustAuditEntry): boolean {
  return (
    entry.attributionError === "unknown_intervention_bucket" ||
    entry.reason === "unknown_intervention_bucket"
  );
}

function summarizeFromAudit(entries: TrustAuditEntry[]): Omit<
  TrustInspectorSummary,
  "trustInspectorEnabled" | "profileLearningEnabled"
> {
  const blockedByReason: Record<string, number> = {};
  let evolved = 0;
  let blocked = 0;
  let unknownBuckets = 0;
  let systemCaused = 0;
  let renderOnly = 0;

  for (const entry of entries) {
    if (entry.evolve) {
      evolved += 1;
    } else {
      blocked += 1;
      blockedByReason[entry.reason] = (blockedByReason[entry.reason] ?? 0) + 1;
    }
    if (isUnknownBucketEntry(entry)) unknownBuckets += 1;
    if (isSystemCausedEntry(entry)) systemCaused += 1;
    if (isRenderOnlyEntry(entry)) renderOnly += 1;
  }

  return {
    recorded: entries.length,
    evolved,
    blocked,
    blockedByReason,
    unknownBuckets,
    systemCaused,
    renderOnly,
  };
}

function summarizeFromDiagnostics(): Omit<
  TrustInspectorSummary,
  "trustInspectorEnabled" | "profileLearningEnabled" | "unknownBuckets" | "systemCaused" | "renderOnly"
> {
  const diag = getTrustCollectionDiagnostics();
  return {
    recorded: diag.recorded,
    evolved: diag.evolved,
    blocked: diag.blocked,
    blockedByReason: { ...diag.blockedByReason },
  };
}

function entryAffectsTraitPath(entry: TrustAuditEntry, path: string): boolean {
  if (entry.traitDeltas.some((d) => d.path === path)) return true;
  const mapping = resolveSignalTraitMapping(entry.busCategory);
  return mapping?.paths.includes(path) ?? false;
}

function computeTraitStatus(
  trait: TraitScore | undefined,
): TrustTraitStatus {
  if (!trait || trait.observations === 0) return "unset";
  if (trait.observations >= 3 && trait.confidence >= 0.2) return "stable";
  return "learning";
}

function recentEvidenceForTrait(
  entries: TrustAuditEntry[],
  path: string,
  limit = 5,
): TrustAuditEntry[] {
  return entries
    .filter((entry) => entryAffectsTraitPath(entry, path))
    .slice(0, limit);
}

/** Filtered audit log, newest first. Does not mutate storage. */
export function getTrustAuditLog(opts?: TrustAuditLogFilter): TrustAuditEntry[] {
  let entries = [...getPersistedTrustAuditLog()].reverse();

  if (opts?.sessionId) {
    entries = entries.filter((e) => e.sessionId === opts.sessionId);
  }
  if (opts?.trustCategory) {
    entries = entries.filter((e) => e.trustCategory === opts.trustCategory);
  }
  if (opts?.reason) {
    entries = entries.filter((e) => e.reason === opts.reason);
  }
  if (opts?.evolve !== undefined) {
    entries = entries.filter((e) => e.evolve === opts.evolve);
  }
  if (opts?.limit !== undefined && opts.limit >= 0) {
    entries = entries.slice(0, opts.limit);
  }

  return entries;
}

export function getTrustInspectorSummary(): TrustInspectorSummary {
  const flags = {
    trustInspectorEnabled: isTrustInspectorEnabled(),
    profileLearningEnabled: isProfileLearningEnabled(),
  };

  const auditEntries = getPersistedTrustAuditLog();
  if (auditEntries.length > 0) {
    return { ...summarizeFromAudit(auditEntries), ...flags };
  }

  const diagFallback = summarizeFromDiagnostics();
  return {
    ...diagFallback,
    unknownBuckets: 0,
    systemCaused: 0,
    renderOnly: 0,
    ...flags,
  };
}

export function getTrustTraitSnapshot(): TrustTraitSnapshot {
  const trust = getIntelligenceProfile().relationship.trust;
  const auditNewestFirst = getTrustAuditLog();

  const snapshot = {} as TrustTraitSnapshot;
  for (const key of TRUST_TRAIT_KEYS) {
    const path = traitPathForKey(key);
    const trait = trust[key];
    snapshot[key] = {
      path,
      score: trait?.score ?? null,
      confidence: trait?.confidence ?? null,
      observations: trait?.observations ?? 0,
      lastUpdated: trait?.lastUpdated ?? null,
      status: computeTraitStatus(trait),
      recentEvidence: recentEvidenceForTrait(auditNewestFirst, path),
    };
  }
  return snapshot;
}

function formatBlockedReasons(reasons: Record<string, number>): string {
  const keys = Object.keys(reasons);
  if (keys.length === 0) return "  (none)";
  return keys
    .map((k) => `  ${k}: ${reasons[k]}`)
    .join("\n");
}

function formatTraitLine(item: TrustTraitSnapshotItem): string {
  const score = item.score !== null ? item.score.toFixed(1) : "—";
  const conf =
    item.confidence !== null ? item.confidence.toFixed(3) : "—";
  return `  ${item.path}: status=${item.status} score=${score} conf=${conf} obs=${item.observations} updated=${item.lastUpdated ?? "—"}`;
}

function formatAuditEntry(entry: TrustAuditEntry): string {
  const bucket = entry.interventionBucket ?? "—";
  const deltas =
    entry.traitDeltas.length > 0
      ? ` deltas=${entry.traitDeltas.map((d) => d.path).join(",")}`
      : "";
  return `  [${entry.at}] ${entry.trustCategory} offer=${entry.offerKey ?? "—"} bucket=${bucket} evolve=${entry.evolve} reason=${entry.reason}${deltas}`;
}

/** Readable text report for console inspection. */
export function buildTrustInspectorReport(): string {
  const summary = getTrustInspectorSummary();
  const traits = getTrustTraitSnapshot();
  const recent = getTrustAuditLog({ limit: 10 });

  const lines: string[] = [
    "=== Companion Trust Inspector ===",
    "",
    "Summary:",
    `  recorded: ${summary.recorded}`,
    `  evolved: ${summary.evolved}`,
    `  blocked: ${summary.blocked}`,
    `  unknownBuckets: ${summary.unknownBuckets}`,
    `  systemCaused: ${summary.systemCaused}`,
    `  renderOnly: ${summary.renderOnly}`,
    `  trustInspectorEnabled: ${summary.trustInspectorEnabled}`,
    `  profileLearningEnabled: ${summary.profileLearningEnabled}`,
    "",
    "Blocked by reason:",
    formatBlockedReasons(summary.blockedByReason),
    "",
    "Trust traits:",
    ...TRUST_TRAIT_KEYS.map((k) => formatTraitLine(traits[k])),
    "",
    "Last 10 audit entries (newest first):",
  ];

  if (recent.length === 0) {
    lines.push("  (none)");
  } else {
    lines.push(...recent.map(formatAuditEntry));
  }

  return lines.join("\n");
}

type TrustInspectorWindow = Window & {
  __companionTrustInspector?: () => string;
  __companionTrustAuditLog?: () => TrustAuditEntry[];
  __companionTrustTraits?: () => TrustTraitSnapshot;
  __companionTrustScenarios?: () => ReturnType<typeof runTrustValidationScenarios>;
};

function clearTrustInspectorWindow(): void {
  if (typeof window === "undefined") return;
  const win = window as TrustInspectorWindow;
  delete win.__companionTrustInspector;
  delete win.__companionTrustAuditLog;
  delete win.__companionTrustTraits;
  delete win.__companionTrustScenarios;
}

/** Dev console helpers — only when inspector flag is ON. SSR-safe; never throws. */
export function exposeTrustInspectorToWindow(): void {
  if (typeof window === "undefined") return;
  try {
    if (!isTrustInspectorEnabled()) {
      clearTrustInspectorWindow();
      return;
    }
    const win = window as TrustInspectorWindow;
    win.__companionTrustInspector = () => buildTrustInspectorReport();
    win.__companionTrustAuditLog = () => getTrustAuditLog();
    win.__companionTrustTraits = () => getTrustTraitSnapshot();
    win.__companionTrustScenarios = () => runTrustValidationScenarios();
  } catch {
    /* noop */
  }
}
