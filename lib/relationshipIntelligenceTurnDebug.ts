/**
 * Per-turn relationship intelligence diagnostics (development only).
 * Console prefix: [relationship-intelligence-debug]
 */

import { getCurrentRelationshipPhase } from "./companionRelationshipPhases";
import {
  auditRelationshipConfidenceInputs,
  logRelationshipConfidenceAudit,
  logRelationshipObservationsAudit,
  type RelationshipMemoryConfidence,
} from "./relationshipMemoryConfidence";
import { isRelationshipResponseContractActive } from "./relationshipResponseContract";

const ENABLED =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export const RELATIONSHIP_QA_PROBE_MESSAGE =
  "Why do I keep building new things instead of finishing what I already started?";

export const GENERIC_OPENING_VIOLATIONS = [
  /^this is a common\b/i,
  /^it seems like\b/i,
  /^it sounds like\b/i,
  /^many people\b/i,
  /^many entrepreneurs\b/i,
  /^people with adhd\b/i,
  /^it's common for\b/i,
  /^a lot of (?:people|founders|entrepreneurs)\b/i,
];

export type RelationshipTurnDebugClientMeta = {
  memoryConfidence: RelationshipMemoryConfidence;
  relationshipPhase: number;
  relationshipPhaseName: string;
  relationshipPriorityBlockLength: number;
  relationshipPriorityBlock: string | null;
  relationshipPrioritySentToApi: boolean;
  relationshipLeadParagraph: string | null;
  relationshipContractActive: boolean;
  activeHintNames: string[];
  confidenceObservationsCount: number;
  confidenceSignalCount: number;
  confidenceResultReason: string;
  confidenceLegacyResult: RelationshipMemoryConfidence;
  confidenceFloorApplied: boolean;
};

export type RelationshipTurnDebugApiPayload = {
  relationshipPriorityReceivedByApi: boolean;
  relationshipPriorityBlockLength: number;
  relationshipPriorityBlock: string | null;
  priorityPrepended: boolean;
  finalPromptFirst2000: string;
  finalPromptLast2000: string;
  finalPromptTotalLength: number;
};

export type RelationshipTurnDebugFull = RelationshipTurnDebugClientMeta &
  Partial<RelationshipTurnDebugApiPayload> & {
    userText: string;
    assistantResponsePreview?: string;
    genericOpeningViolation?: string | null;
    relationshipContractViolation?: string | null;
    relationshipResponseRewritten?: boolean;
    relationshipResponseRewriteReason?: string | null;
    relationshipEnforcementRan?: boolean;
    relationshipEnforcementSkipReason?: string | null;
    relationshipResponseId?: string | null;
    uiTraceFirstParagraphAtReceive?: string | null;
    uiTraceFirstParagraphAtRender?: string | null;
    phase?: "pre-api" | "post-api";
  };

export function isRelationshipQaProbeMessage(text: string): boolean {
  return /building new things instead of finishing/i.test(text.trim());
}

export function buildRelationshipTurnDebugClientMeta(input: {
  userText: string;
  relationshipPriorityBlock: string | null;
  activeHintNames: string[];
  relationshipLeadParagraph?: string | null;
}): RelationshipTurnDebugClientMeta {
  const current = getCurrentRelationshipPhase();
  const block = input.relationshipPriorityBlock;
  const confidenceAudit = auditRelationshipConfidenceInputs();
  logRelationshipConfidenceAudit(confidenceAudit);
  logRelationshipObservationsAudit({ userText: input.userText });
  const memoryConfidence = confidenceAudit.result;
  return {
    memoryConfidence,
    relationshipPhase: current.number,
    relationshipPhaseName: current.name,
    relationshipPriorityBlockLength: block?.length ?? 0,
    relationshipPriorityBlock: block,
    relationshipPrioritySentToApi: Boolean(block?.trim()),
    relationshipLeadParagraph: input.relationshipLeadParagraph ?? null,
    relationshipContractActive: isRelationshipResponseContractActive(memoryConfidence),
    activeHintNames: input.activeHintNames,
    confidenceObservationsCount: confidenceAudit.observationsCount,
    confidenceSignalCount: confidenceAudit.signalCount,
    confidenceResultReason: confidenceAudit.resultReason,
    confidenceLegacyResult: confidenceAudit.legacyResult,
    confidenceFloorApplied: confidenceAudit.wouldHaveBeenNone,
  };
}

export function buildRelationshipTurnDebugApiPayload(input: {
  relationshipIntelligencePriority?: string;
  finalSystem: string;
}): RelationshipTurnDebugApiPayload {
  const block = input.relationshipIntelligencePriority?.trim() ?? "";
  return {
    relationshipPriorityReceivedByApi: Boolean(block),
    relationshipPriorityBlockLength: block.length,
    relationshipPriorityBlock: block || null,
    priorityPrepended: input.finalSystem.startsWith("# RELATIONSHIP INTELLIGENCE"),
    finalPromptFirst2000: input.finalSystem.slice(0, 2000),
    finalPromptLast2000: input.finalSystem.slice(-2000),
    finalPromptTotalLength: input.finalSystem.length,
  };
}

export function detectGenericOpeningViolation(response: string): string | null {
  const trimmed = response.trim();
  for (const pattern of GENERIC_OPENING_VIOLATIONS) {
    if (pattern.test(trimmed)) {
      return pattern.source;
    }
  }
  return null;
}

export function warnIfGenericOpeningDespitePriority(
  relationshipPriorityBlockLength: number,
  assistantResponse: string,
  userText?: string,
): void {
  if (!ENABLED) return;
  if (relationshipPriorityBlockLength <= 0) return;

  const violation = detectGenericOpeningViolation(assistantResponse);
  if (!violation) return;

  console.warn(
    "[relationship-intelligence-debug] GENERIC OPENING VIOLATION — priority block was sent but response used banned opener",
    {
      userText: userText?.slice(0, 120),
      relationshipPriorityBlockLength,
      violationPattern: violation,
      responseOpening: assistantResponse.trim().slice(0, 200),
      expected: "Response should begin with observed pattern (I've noticed / From our conversations / One pattern I've seen)",
    },
  );
}

export function logRelationshipIntelligenceTurnDebug(
  payload: RelationshipTurnDebugFull,
): void {
  if (!ENABLED) return;

  const emphasize =
    isRelationshipQaProbeMessage(payload.userText) ||
    payload.relationshipPriorityBlockLength > 0;

  const logFn = emphasize ? console.warn : console.debug;

  logFn("[relationship-intelligence-debug] turn", {
    userText: payload.userText.slice(0, 160),
    memoryConfidence: payload.memoryConfidence,
    relationshipPhase: payload.relationshipPhase,
    relationshipPhaseName: payload.relationshipPhaseName,
    relationshipPriorityBlockLength: payload.relationshipPriorityBlockLength,
    relationshipPriorityBlock: payload.relationshipPriorityBlock,
    relationshipPrioritySentToApi: payload.relationshipPrioritySentToApi,
    relationshipLeadParagraph: payload.relationshipLeadParagraph,
    relationshipContractActive: payload.relationshipContractActive,
    relationshipPriorityReceivedByApi: payload.relationshipPriorityReceivedByApi,
    priorityPrepended: payload.priorityPrepended,
    activeHintNames: payload.activeHintNames,
    finalPromptTotalLength: payload.finalPromptTotalLength,
    finalPromptFirst2000: payload.finalPromptFirst2000,
    finalPromptLast2000: payload.finalPromptLast2000,
    assistantResponsePreview: payload.assistantResponsePreview?.slice(0, 300),
    genericOpeningViolation: payload.genericOpeningViolation,
    relationshipContractViolation: payload.relationshipContractViolation,
    relationshipResponseRewritten: payload.relationshipResponseRewritten,
    relationshipResponseRewriteReason: payload.relationshipResponseRewriteReason,
    relationshipEnforcementRan: payload.relationshipEnforcementRan,
    relationshipEnforcementSkipReason: payload.relationshipEnforcementSkipReason,
    confidenceObservationsCount: payload.confidenceObservationsCount,
    confidenceSignalCount: payload.confidenceSignalCount,
    confidenceResultReason: payload.confidenceResultReason,
    confidenceLegacyResult: payload.confidenceLegacyResult,
    confidenceFloorApplied: payload.confidenceFloorApplied,
  });
}
