/**
 * Detect tentative strategic patterns from confirmed Strategic Memory only.
 * Never uses draft conversation, recommendations, or psychological engines.
 */

import type { StrategicDecisionMemory } from "../memory/types";
import { listStrategicDecisionMemories } from "../memory/strategicMemoryStore";
import {
  findPatternByCategoryFingerprint,
  newStrategicPatternId,
  upsertStrategicPattern,
} from "./patternStore";
import type {
  StrategicPatternCandidate,
  StrategicPatternCategory,
  StrategicPatternConfidence,
  StrategicPatternEvidenceReference,
  StrategicPatternStatus,
} from "./types";
import {
  STRATEGIC_PATTERN_DETECTOR_VERSION,
  STRATEGIC_PATTERN_MIN_CANDIDATE,
  STRATEGIC_PATTERN_MIN_SUPPORTING,
  STRATEGIC_PATTERN_MODEL_VERSION,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newEvidenceId(): string {
  return `spev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Memories eligible as pattern evidence. */
export function listReliableDecisionMemories(): StrategicDecisionMemory[] {
  return listStrategicDecisionMemories().filter(
    (m) =>
      m.status !== "archived" &&
      m.status !== "superseded" &&
      Boolean(m.chosenDirection?.userConfirmed) &&
      Boolean(m.chosenDirection?.direction?.trim()),
  );
}

function normalizeTheme(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function themeKey(text: string): string {
  const words = normalizeTheme(text)
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 6);
  return words.join(" ");
}

function confidenceForCounts(
  supporting: number,
  contradicting: number,
): StrategicPatternConfidence {
  if (supporting >= 4 && contradicting === 0) return "high";
  if (supporting >= STRATEGIC_PATTERN_MIN_SUPPORTING && contradicting <= 1) {
    return "moderate";
  }
  return "low";
}

function statusForCounts(
  supporting: number,
  existingStatus?: StrategicPatternStatus,
): StrategicPatternStatus {
  if (
    existingStatus === "accepted" ||
    existingStatus === "dismissed" ||
    existingStatus === "paused" ||
    existingStatus === "archived" ||
    existingStatus === "superseded"
  ) {
    return existingStatus;
  }
  if (supporting >= STRATEGIC_PATTERN_MIN_SUPPORTING) return "ready_for_review";
  if (supporting >= STRATEGIC_PATTERN_MIN_CANDIDATE) return "candidate";
  return "candidate";
}

function buildPattern(input: {
  category: StrategicPatternCategory;
  title: string;
  tentativeObservation: string;
  possibleStrategicMeaning?: string;
  possibleFutureUse?: string;
  evidence: StrategicPatternEvidenceReference[];
  counterexamples?: StrategicPatternEvidenceReference[];
}): StrategicPatternCandidate | null {
  const supporting = input.evidence.filter(
    (e) => e.relationship === "supports" || e.relationship === "partially_supports",
  );
  if (supporting.length < STRATEGIC_PATTERN_MIN_CANDIDATE) return null;

  const memoryIds = new Set(supporting.map((e) => e.decisionMemoryId));
  const counter = input.counterexamples ?? [];
  const dates = supporting.map((e) => e.occurredAt).sort();
  const first = dates[0]!;
  const last = dates[dates.length - 1]!;
  const ts = nowIso();

  const existing = findPatternByCategoryFingerprint(
    input.category,
    input.title,
  );
  // Do not revive dismissed/paused automatically
  if (
    existing &&
    (existing.status === "dismissed" ||
      existing.status === "paused" ||
      existing.status === "archived")
  ) {
    return existing;
  }

  const supportingCount = memoryIds.size;
  const contradictingCount = new Set(
    counter.map((e) => e.decisionMemoryId),
  ).size;

  const record: StrategicPatternCandidate = {
    id: existing?.id ?? newStrategicPatternId(),
    category: input.category,
    title: input.title,
    tentativeObservation: input.tentativeObservation,
    status: statusForCounts(supportingCount, existing?.status),
    confidence: confidenceForCounts(supportingCount, contradictingCount),
    evidenceReferences: supporting,
    counterexampleReferences: counter,
    relevantDecisionCount: memoryIds.size + contradictingCount,
    supportingDecisionCount: supportingCount,
    contradictingDecisionCount: contradictingCount,
    firstObservedAt: existing?.firstObservedAt ?? first,
    lastObservedAt: last,
    detectionWindowStart: first,
    detectionWindowEnd: last,
    possibleStrategicMeaning: input.possibleStrategicMeaning,
    possibleFutureUse: input.possibleFutureUse,
    userResponse: existing?.userResponse,
    useInFutureReasoning: existing?.useInFutureReasoning ?? false,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    lastReviewedAt: existing?.lastReviewedAt,
    detectorVersion: STRATEGIC_PATTERN_DETECTOR_VERSION,
    version: STRATEGIC_PATTERN_MODEL_VERSION,
  };

  return upsertStrategicPattern(record);
}

function detectRecurringAssumptions(
  memories: StrategicDecisionMemory[],
): StrategicPatternCandidate[] {
  const buckets = new Map<
    string,
    { sample: string; refs: StrategicPatternEvidenceReference[] }
  >();

  for (const m of memories) {
    for (const entry of m.assumptionsAtDecisionTime) {
      if (!entry.stillRelevant || entry.truthStatus === "outdated") continue;
      // Assumptions stay assumed — pattern notes recurrence of the theme, not truth
      const key = themeKey(entry.content);
      if (key.length < 8) continue;
      const bucket = buckets.get(key) ?? { sample: entry.content, refs: [] };
      if (bucket.refs.some((r) => r.decisionMemoryId === m.id)) continue;
      bucket.refs.push({
        id: newEvidenceId(),
        decisionMemoryId: m.id,
        memoryEntryId: entry.id,
        relationship: "supports",
        summary: entry.content.slice(0, 160),
        occurredAt: entry.recordedAt || m.decisionDate || m.createdAt,
        relevance: "high",
      });
      buckets.set(key, bucket);
    }
  }

  const out: StrategicPatternCandidate[] = [];
  for (const [, bucket] of buckets) {
    const pattern = buildPattern({
      category: "recurring_assumption",
      title: `Recurring assumption: ${bucket.sample.slice(0, 72)}`,
      tentativeObservation: `Across several decisions, a similar assumption appeared before evidence was fully gathered: “${bucket.sample}”. This may be worth noticing — it is not a judgment about you.`,
      possibleStrategicMeaning:
        "You may be carrying a familiar concern into new decisions before testing it.",
      possibleFutureUse:
        "When a similar decision appears, we can ask whether this assumption still needs evidence.",
      evidence: bucket.refs,
    });
    if (pattern) out.push(pattern);
  }
  return out;
}

function detectRecurringConstraints(
  memories: StrategicDecisionMemory[],
): StrategicPatternCandidate[] {
  const buckets = new Map<
    string,
    { sample: string; refs: StrategicPatternEvidenceReference[] }
  >();

  for (const m of memories) {
    for (const entry of m.constraintsAtDecisionTime) {
      if (!entry.stillRelevant || entry.truthStatus === "outdated") continue;
      const key = themeKey(entry.content);
      if (key.length < 6) continue;
      const bucket = buckets.get(key) ?? { sample: entry.content, refs: [] };
      if (bucket.refs.some((r) => r.decisionMemoryId === m.id)) continue;
      bucket.refs.push({
        id: newEvidenceId(),
        decisionMemoryId: m.id,
        memoryEntryId: entry.id,
        relationship: "supports",
        summary: entry.content.slice(0, 160),
        occurredAt: entry.recordedAt || m.decisionDate || m.createdAt,
        relevance: "high",
      });
      buckets.set(key, bucket);
    }
  }

  const out: StrategicPatternCandidate[] = [];
  for (const [, bucket] of buckets) {
    const pattern = buildPattern({
      category: "recurring_constraint",
      title: `Recurring constraint: ${bucket.sample.slice(0, 72)}`,
      tentativeObservation: `A similar constraint showed up across more than one strategic decision: “${bucket.sample}”. It may still matter — or it may have changed.`,
      possibleFutureUse:
        "We can check whether this constraint is still binding before narrowing options.",
      evidence: bucket.refs,
    });
    if (pattern) out.push(pattern);
  }
  return out;
}

function detectRevisionPatterns(
  memories: StrategicDecisionMemory[],
): StrategicPatternCandidate[] {
  const withRevisions = memories.filter((m) => m.revisions.length > 0);
  if (withRevisions.length < STRATEGIC_PATTERN_MIN_CANDIDATE) return [];

  const refs: StrategicPatternEvidenceReference[] = withRevisions.map((m) => ({
    id: newEvidenceId(),
    decisionMemoryId: m.id,
    revisionId: m.revisions[m.revisions.length - 1]?.id,
    relationship: "supports" as const,
    summary: `Revised direction: ${m.revisions[m.revisions.length - 1]?.reason ?? "updated"}`,
    occurredAt:
      m.revisions[m.revisions.length - 1]?.revisedAt ||
      m.updatedAt ||
      m.createdAt,
    relevance: "moderate" as const,
  }));

  const pattern = buildPattern({
    category: "decision_revision",
    title: "Directions sometimes change after the first choice",
    tentativeObservation:
      "In more than one decision, the chosen direction was later revised. That can be healthy learning — not a failure — if the new path is grounded in what you learned.",
    possibleStrategicMeaning:
      "Early choices may be provisional until evidence or capacity becomes clearer.",
    possibleFutureUse:
      "We can name what would cause a revision before locking a harder-to-reverse path.",
    evidence: refs,
  });

  return pattern ? [pattern] : [];
}

function detectExperimentFollowThrough(
  memories: StrategicDecisionMemory[],
): StrategicPatternCandidate[] {
  const withExperiments = memories.filter((m) => m.experiments.length > 0);
  const withOutcomes = withExperiments.filter((m) => m.outcomes.length > 0);
  if (withOutcomes.length < STRATEGIC_PATTERN_MIN_CANDIDATE) return [];

  const refs: StrategicPatternEvidenceReference[] = withOutcomes.map((m) => ({
    id: newEvidenceId(),
    decisionMemoryId: m.id,
    experimentId: m.experiments[0]?.id,
    outcomeId: m.outcomes[m.outcomes.length - 1]?.id,
    relationship: "supports" as const,
    summary: m.outcomes[m.outcomes.length - 1]?.whatHappened.slice(0, 160) ?? "",
    occurredAt:
      m.outcomes[m.outcomes.length - 1]?.recordedAt || m.updatedAt || m.createdAt,
    relevance: "high" as const,
  }));

  const pattern = buildPattern({
    category: "experiment_effectiveness",
    title: "Small tests often produce usable follow-up evidence",
    tentativeObservation:
      "Across several decisions, experiments were followed by recorded outcomes. That suggests small tests are already helping you learn before a full commitment.",
    possibleFutureUse:
      "When uncertainty is high, we can prefer one bounded test before a larger move.",
    evidence: refs,
  });

  return pattern ? [pattern] : [];
}

/**
 * Run detectors over reliable Strategic Memory and upsert candidates.
 * Does not auto-accept. Does not write Adaptive Companion prefs.
 */
export function detectStrategicPatterns(opts?: {
  memories?: StrategicDecisionMemory[];
}): StrategicPatternCandidate[] {
  const memories = opts?.memories ?? listReliableDecisionMemories();
  if (memories.length < STRATEGIC_PATTERN_MIN_CANDIDATE) return [];

  const detected = [
    ...detectRecurringAssumptions(memories),
    ...detectRecurringConstraints(memories),
    ...detectRevisionPatterns(memories),
    ...detectExperimentFollowThrough(memories),
  ];

  // Deduplicate by id
  const byId = new Map<string, StrategicPatternCandidate>();
  for (const p of detected) byId.set(p.id, p);
  return [...byId.values()];
}
