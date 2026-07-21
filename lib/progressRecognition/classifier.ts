/**
 * 101 — Explainable recognition classification.
 * Detection creates candidates only — never auto-creates Evidence.
 */

import type {
  ProgressSourceType,
  RecognitionCandidate,
  RecognitionCandidateKind,
} from "./contracts";
import { getRecognitionPreferences, maySuggestRecognition } from "./preferences";

export type ProgressSignal = {
  sourceType: ProgressSourceType;
  sourceId: string;
  title: string;
  workId?: string;
  projectId?: string;
  blueprintId?: string;
  /** Member-stated or inferred. */
  factors?: readonly string[];
  /** 0–100 internal significance. */
  significanceHint?: number;
  /** Explicit discovery / lesson text — required for Evidence candidates. */
  discoveryText?: string;
  problemSolved?: string;
  pattern?: string;
  whoHelped?: readonly string[];
  isTrivialClick?: boolean;
  isMajorDeliverable?: boolean;
  isLaunchOrDelivery?: boolean;
  isMeaningfulSection?: boolean;
  isMilestone?: boolean;
  returnedAfterStuck?: boolean;
  clarifiedDecision?: boolean;
  durableBusinessAsset?: boolean;
};

function newCandidateId(kind: RecognitionCandidateKind): string {
  return `cand-${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function scoreWin(signal: ProgressSignal): { score: number; factors: string[] } {
  const factors: string[] = [...(signal.factors ?? [])];
  let score = signal.significanceHint ?? 0;
  if (signal.isMeaningfulSection) {
    score += 35;
    factors.push("meaningful_section");
  }
  if (signal.isMilestone) {
    score += 40;
    factors.push("milestone");
  }
  if (signal.returnedAfterStuck) {
    score += 30;
    factors.push("returned_after_stuck");
  }
  if (signal.clarifiedDecision) {
    score += 28;
    factors.push("clarified_decision");
  }
  if (signal.projectId) {
    score += 10;
    factors.push("project_linked");
  }
  if (signal.isTrivialClick) {
    score = Math.min(score, 8);
    factors.push("trivial_suppressed");
  }
  return { score: Math.min(100, score), factors };
}

function scoreAccomplishment(
  signal: ProgressSignal,
): { score: number; factors: string[] } {
  const factors: string[] = [...(signal.factors ?? [])];
  let score = signal.significanceHint ?? 0;
  if (signal.isMajorDeliverable) {
    score += 45;
    factors.push("major_deliverable");
  }
  if (signal.isLaunchOrDelivery) {
    score += 50;
    factors.push("launch_or_delivery");
  }
  if (signal.durableBusinessAsset) {
    score += 40;
    factors.push("durable_business_asset");
  }
  if (signal.sourceType === "blueprint" && signal.isMajorDeliverable) {
    score += 15;
    factors.push("blueprint_complete");
  }
  if (signal.isTrivialClick) {
    score = 0;
    factors.push("trivial_suppressed");
  }
  return { score: Math.min(100, score), factors };
}

function hasEvidenceSignal(signal: ProgressSignal): boolean {
  return Boolean(
    signal.discoveryText?.trim() ||
      signal.problemSolved?.trim() ||
      signal.pattern?.trim() ||
      (signal.whoHelped && signal.whoHelped.length > 0),
  );
}

/**
 * Classify a progress signal into zero or more distinct candidates.
 * Completions alone never become Evidence candidates.
 */
export function classifyProgressRecognition(
  signal: ProgressSignal,
  nowIso: string = new Date().toISOString(),
): RecognitionCandidate[] {
  if (!maySuggestRecognition(getRecognitionPreferences())) return [];
  if (signal.isTrivialClick && !hasEvidenceSignal(signal)) return [];

  const out: RecognitionCandidate[] = [];
  const win = scoreWin(signal);
  const acc = scoreAccomplishment(signal);

  // Prefer accomplishment when clearly durable; otherwise win for momentum
  if (acc.score >= 55) {
    out.push({
      candidateId: newCandidateId("accomplishment"),
      kind: "accomplishment",
      title: signal.title,
      explanation:
        "This looks like a durable achievement — worth considering for the Hall of Accomplishments.",
      sourceType: signal.sourceType,
      sourceId: signal.sourceId,
      workId: signal.workId,
      projectId: signal.projectId,
      blueprintId: signal.blueprintId,
      significanceScore: acc.score,
      factors: acc.factors,
      detectedAt: nowIso,
    });
  } else if (win.score >= 28) {
    out.push({
      candidateId: newCandidateId("win"),
      kind: "win",
      title: signal.title,
      explanation:
        "This looks like meaningful momentum — worth considering as a win.",
      sourceType: signal.sourceType,
      sourceId: signal.sourceId,
      workId: signal.workId,
      projectId: signal.projectId,
      blueprintId: signal.blueprintId,
      significanceScore: win.score,
      factors: win.factors,
      detectedAt: nowIso,
    });
  }

  if (hasEvidenceSignal(signal)) {
    out.push({
      candidateId: newCandidateId("evidence"),
      kind: "evidence",
      title: signal.discoveryText?.trim() || signal.problemSolved?.trim() || signal.title,
      explanation:
        "There appears to be a discovery or lesson here — that belongs in the Evidence Vault, separate from a win or accomplishment.",
      sourceType: signal.sourceType,
      sourceId: signal.sourceId,
      workId: signal.workId,
      projectId: signal.projectId,
      blueprintId: signal.blueprintId,
      significanceScore: 50,
      factors: ["discovery_or_lesson"],
      detectedAt: nowIso,
    });
  }

  return out;
}

/** Completions that must not auto-create Evidence. */
export const NEVER_AUTO_EVIDENCE_COMPLETION_KINDS = [
  "task_completed",
  "section_saved",
  "milestone_reached",
  "project_finished",
  "campaign_launched",
  "client_signed",
  "revenue_target_reached",
] as const;

export function completionMayBecomeEvidenceWithoutDiscovery(
  _completionKind: (typeof NEVER_AUTO_EVIDENCE_COMPLETION_KINDS)[number],
): false {
  return false;
}
