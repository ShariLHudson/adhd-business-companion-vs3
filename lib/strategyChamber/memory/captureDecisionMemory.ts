/**
 * Capture Strategic Decision Memory from a confirmed Strategy Work Item.
 * Snapshots reasoning with epistemic status — does not copy conversation transcripts.
 */

import { buildIntelligentDecisionRecord } from "../intelligence/engine/buildDecisionRecord";
import { synthesizeStrategyDomains } from "../intelligence/synthesis";
import { getStrategyWorkItem } from "../strategyWorkItemStore";
import type { StrategyOption, StrategyWorkItem } from "../types";
import {
  getStrategicDecisionMemoryByWorkItem,
  newStrategicMemoryId,
  upsertStrategicDecisionMemory,
} from "./strategicMemoryStore";
import type {
  StrategicDecisionMemory,
  StrategicMemoryConfidence,
  StrategicMemoryEntry,
  StrategicMemoryTruthStatus,
  StrategicOptionMemory,
  StrategicSourceReference,
} from "./types";
import { STRATEGIC_MEMORY_MODEL_VERSION } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newEntryId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function workItemSource(item: StrategyWorkItem): StrategicSourceReference {
  return {
    kind: "strategy_work_item",
    id: item.id,
    label: item.title,
  };
}

function mapConfidence(
  level?: StrategyWorkItem["confidenceLevel"],
): StrategicMemoryConfidence {
  if (level === "high") return "high";
  if (level === "low") return "low";
  return "moderate";
}

function entryFromText(
  content: string,
  entryType: StrategicMemoryEntry["entryType"],
  truthStatus: StrategicMemoryTruthStatus,
  source: StrategicSourceReference,
  userConfirmed: boolean,
  confidence: StrategicMemoryConfidence = "moderate",
): StrategicMemoryEntry {
  return {
    id: newEntryId(entryType),
    entryType,
    content: content.trim(),
    recordedAt: nowIso(),
    confidence,
    truthStatus,
    userConfirmed,
    source,
    stillRelevant: true,
  };
}

function mapOptions(options: StrategyOption[] | undefined, chosen?: string): StrategicOptionMemory[] {
  if (!options?.length) return [];
  const chosenNorm = chosen?.trim().toLowerCase() ?? "";
  return options.slice(0, 6).map((o) => ({
    id: o.id,
    title: o.title,
    whyItMayFit: o.whyItMayFit,
    selected: Boolean(
      chosenNorm &&
        (o.title.trim().toLowerCase() === chosenNorm ||
          chosenNorm.includes(o.title.trim().toLowerCase())),
    ),
    sourceOptionId: o.id,
  }));
}

/**
 * True when the member has locked a direction and confirmed the Decision Record.
 */
export function canCaptureStrategicDecisionMemory(item: StrategyWorkItem): boolean {
  return Boolean(
    item.chosenDirection?.trim() && item.decisionRecordConfirmed,
  );
}

/**
 * Build (or refresh) Strategic Decision Memory from a confirmed Work Item.
 * Safe no-op when confirmation gate fails.
 */
export function captureStrategicDecisionMemory(
  strategyWorkItemId: string,
  opts?: { force?: boolean },
): StrategicDecisionMemory | null {
  const item = getStrategyWorkItem(strategyWorkItemId);
  if (!item) return null;
  if (!opts?.force && !canCaptureStrategicDecisionMemory(item)) return null;

  const existing = getStrategicDecisionMemoryByWorkItem(item.id);
  const source = workItemSource(item);
  const ts = nowIso();
  const recordView = buildIntelligentDecisionRecord(item);
  const synthesis = synthesizeStrategyDomains(item);
  const confidence = mapConfidence(item.confidenceLevel);

  const knownContext = [
    ...(item.knownFacts ?? []).map((c) =>
      entryFromText(c, "evidence", "reported", source, true, confidence),
    ),
    ...(item.observations ?? []).slice(0, 4).map((c) =>
      entryFromText(c, "context", "observed", source, false, "moderate"),
    ),
    ...(item.currentReality
      ? [
          entryFromText(
            item.currentReality,
            "context",
            "reported",
            source,
            true,
            confidence,
          ),
        ]
      : []),
  ].slice(0, 8);

  const assumptions = (item.assumptions ?? []).map((c) =>
    entryFromText(c, "assumption", "assumed", source, true, "moderate"),
  );

  const constraints = (item.constraints ?? []).map((c) =>
    entryFromText(c, "constraint", "reported", source, true, confidence),
  );

  const unknowns = (item.unknowns ?? []).map((c) =>
    entryFromText(c, "unknown", "unknown", source, true, "low"),
  );

  const tradeoffs = (
    item.tradeoffs?.length
      ? item.tradeoffs
      : recordView.tradeoffsSummary ?? []
  ).map((c) =>
    entryFromText(c, "tradeoff", "interpreted", source, true, confidence),
  );

  const risks = (item.risks ?? []).map((c) =>
    entryFromText(c, "risk", "interpreted", source, true, confidence),
  );

  const experiments = (item.experiments ?? []).map((summary) => ({
    id: newEntryId("experiment"),
    summary,
    status: "planned" as const,
    recordedAt: ts,
    truthStatus: "reported" as const,
    userConfirmed: true,
    source,
  }));

  const reviewTriggers: StrategicDecisionMemory["reviewTriggers"] = [];
  if (item.reviewDate?.trim()) {
    reviewTriggers.push({
      id: newEntryId("review"),
      trigger: `Scheduled review: ${item.reviewDate}`,
      nextReviewDate: item.reviewDate,
      active: true,
      recordedAt: ts,
      source,
    });
  }
  if (recordView.whatWouldChangeTheDecision?.trim()) {
    reviewTriggers.push({
      id: newEntryId("review"),
      trigger: recordView.whatWouldChangeTheDecision.trim(),
      nextReviewDate: item.reviewDate ?? null,
      active: true,
      recordedAt: ts,
      source: { kind: "decision_record", id: item.id, label: "what would change" },
    });
  }
  for (const signal of item.successSignals ?? []) {
    reviewTriggers.push({
      id: newEntryId("review"),
      trigger: `Success signal to watch: ${signal}`,
      active: true,
      recordedAt: ts,
      source,
    });
  }

  // Recommendation is historical context only — never a confirmed decision
  const recommendationAtDecisionTime =
    existing?.recommendationAtDecisionTime ??
    (synthesis.memberFacingRecommendation?.trim()
      ? {
          summary: synthesis.memberFacingRecommendation.trim(),
          recordedAt: ts,
          isDecision: false as const,
        }
      : recordView.companionRecommendation?.trim()
        ? {
            summary: recordView.companionRecommendation.trim(),
            recordedAt: ts,
            isDecision: false as const,
          }
        : undefined);

  // Prefer the member's stated question; synthesis may refine only when absent
  const strategicQuestion =
    item.decisionStatement?.trim() ||
    synthesis.strategicQuestion?.trim() ||
    item.title;

  const summaryParts = [
    item.chosenDirection?.trim()
      ? `Chose: ${item.chosenDirection.trim()}`
      : null,
    item.decisionRationale?.trim()
      ? `Because: ${item.decisionRationale.trim()}`
      : null,
  ].filter(Boolean);

  const record: StrategicDecisionMemory = {
    id: existing?.id ?? newStrategicMemoryId(),
    strategyWorkItemId: item.id,
    decisionRecordId: `decision_view:${item.id}`,
    title: item.title,
    strategicQuestion,
    summary: summaryParts.join(" — ") || item.plainLanguageSummary,
    primaryDomainId:
      synthesis.selection.primaryDomainId || item.strategyType || undefined,
    secondaryDomainId: synthesis.selection.secondaryDomainId,
    status: item.reviewDate ? "awaiting_review" : "active",
    confidence,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    decisionDate: existing?.decisionDate ?? ts,
    nextReviewDate: item.reviewDate ?? existing?.nextReviewDate ?? null,
    goalAtDecisionTime: item.desiredDirection?.trim() || undefined,
    knownContextAtDecisionTime: knownContext,
    assumptionsAtDecisionTime: assumptions,
    constraintsAtDecisionTime: constraints,
    unknownsAtDecisionTime: unknowns,
    optionsConsidered: mapOptions(item.optionsConsidered, item.chosenDirection),
    chosenDirection: item.chosenDirection?.trim()
      ? {
          direction: item.chosenDirection.trim(),
          rationale: item.decisionRationale?.trim() || undefined,
          decidedAt: existing?.chosenDirection?.decidedAt ?? ts,
          userConfirmed: Boolean(item.decisionRecordConfirmed),
          notChosen: item.notChosen?.filter(Boolean),
        }
      : existing?.chosenDirection,
    recommendationAtDecisionTime,
    tradeoffsAccepted: tradeoffs,
    risksAccepted: risks,
    experiments: experiments.length
      ? experiments
      : existing?.experiments ?? [],
    reviewTriggers: reviewTriggers.length
      ? reviewTriggers
      : existing?.reviewTriggers ?? [],
    outcomes: existing?.outcomes ?? [],
    revisions: existing?.revisions ?? [],
    sourceReferences: [
      source,
      { kind: "decision_record", id: item.id, label: "Confirmed Decision Record" },
    ],
    relatedWorkItemIds: existing?.relatedWorkItemIds,
    relatedDecisionMemoryIds: existing?.relatedDecisionMemoryIds,
    recommendedNextDestination: item.recommendedNextDestination ?? null,
    version: STRATEGIC_MEMORY_MODEL_VERSION,
  };

  return upsertStrategicDecisionMemory(record);
}

/**
 * Capture when Work Item patch flips confirmation on.
 */
export function maybeCaptureStrategicMemoryAfterWorkUpdate(
  previous: StrategyWorkItem | null,
  next: StrategyWorkItem,
): StrategicDecisionMemory | null {
  const justConfirmed =
    Boolean(next.decisionRecordConfirmed) &&
    Boolean(next.chosenDirection?.trim()) &&
    !previous?.decisionRecordConfirmed;
  const directionLockedWithConfirm =
    Boolean(next.decisionRecordConfirmed) &&
    Boolean(next.chosenDirection?.trim()) &&
    Boolean(previous?.decisionRecordConfirmed) &&
    previous?.chosenDirection?.trim() !== next.chosenDirection?.trim();

  if (justConfirmed || directionLockedWithConfirm) {
    return captureStrategicDecisionMemory(next.id);
  }
  return getStrategicDecisionMemoryByWorkItem(next.id);
}
