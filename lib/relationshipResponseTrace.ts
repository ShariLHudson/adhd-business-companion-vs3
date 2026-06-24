/**
 * P0.3 — End-to-end relationship response trace (dev diagnostics).
 */

import { extractFirstParagraph } from "./relationshipResponseContract";
import type { RelationshipMemoryConfidence } from "./relationshipIntelligencePrompt";

export type RelationshipResponseTraceStage =
  | "pre-llm"
  | "post-llm"
  | "post-enforcement"
  | "api-return"
  | "ui-receive"
  | "ui-render";

export type RelationshipResponseTraceLog = {
  responseId: string;
  stage: RelationshipResponseTraceStage;
  firstParagraph: string;
  relationshipResponseRewritten?: boolean;
  memoryConfidence?: RelationshipMemoryConfidence | string | null;
  relationshipLeadParagraphLength?: number;
  enforcementRan?: boolean;
  skipReason?: string | null;
  violationReason?: string | null;
};

export type RelationshipResponseUiTrace = {
  responseId: string;
  rewritten: boolean;
  memoryConfidence: string | null;
  relationshipLeadParagraphLength: number;
  enforcementRan: boolean;
  enforcementSkipReason: string | null;
  violationReason: string | null;
  firstParagraphAtApiReceive: string;
  firstParagraphAfterDirectives: string;
  firstParagraphAtRender: string;
  confidenceObservationsCount?: number;
  confidenceSignalCount?: number;
  confidenceResultReason?: string;
  confidenceFloorApplied?: boolean;
};

const TRACE_ENABLED =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export function createRelationshipResponseId(now = Date.now()): string {
  return `rr-${now}-${Math.random().toString(36).slice(2, 9)}`;
}

export function firstParagraphForTrace(text: string): string {
  const para = extractFirstParagraph(text);
  return para.slice(0, 280);
}

export function logRelationshipResponseTrace(
  payload: RelationshipResponseTraceLog,
): void {
  if (!TRACE_ENABLED) return;
  console.warn("[relationship-response-trace]", payload);
}

export function buildRelationshipResponseTraceSummary(input: {
  responseId: string;
  memoryConfidence?: RelationshipMemoryConfidence | null;
  relationshipLeadParagraphLength?: number;
  llmRawMessage?: string;
  enforcedMessage?: string;
  enforcementRewritten?: boolean;
  enforcementRan?: boolean;
  enforcementSkipReason?: string | null;
  violationReason?: string | null;
}): Record<string, unknown> {
  return {
    relationshipResponseId: input.responseId,
    memoryConfidence: input.memoryConfidence ?? null,
    relationshipLeadParagraphLength: input.relationshipLeadParagraphLength ?? 0,
    llmRawFirstParagraph: input.llmRawMessage
      ? firstParagraphForTrace(input.llmRawMessage)
      : undefined,
    postEnforcementFirstParagraph: input.enforcedMessage
      ? firstParagraphForTrace(input.enforcedMessage)
      : undefined,
    relationshipResponseRewritten: Boolean(input.enforcementRewritten),
    relationshipEnforcementRan: Boolean(input.enforcementRan),
    relationshipEnforcementSkipReason: input.enforcementSkipReason ?? null,
    relationshipResponseRewriteReason: input.violationReason ?? null,
  };
}
