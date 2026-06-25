/**
 * Cognitive Audit™ — constitutional gate before output.
 * @see constitution.ts — runCognitiveAudit
 */

import type {
  AssembledContext,
  CompanionJudgmentResult,
  CompanionProposal,
} from "./types";

export type CognitiveAuditResult = {
  passed: boolean;
  notes: string[];
};

export function runCognitiveAudit(
  ctx: AssembledContext,
  proposals: CompanionProposal[],
  orientationParagraphs: string[],
): CognitiveAuditResult {
  const notes: string[] = [];

  if (proposals.length > 4 && !ctx.orientationOnly) {
    notes.push("Too many proposals — Decision Filter violated.");
  }

  if (ctx.dayMode === "recovery") {
    const guilt = /\bincomplete\b/i.test(orientationParagraphs.join(" "));
    if (guilt) notes.push("Recovery day must not mention incomplete work.");
  }

  if (ctx.dayMode === "celebration") {
    const copy = orientationParagraphs.join(" ");
    const pushesForward =
      /\b(next step|next phase|strike while)\b/i.test(copy) ||
      /\b(catch up|make up for)\b/i.test(copy);
    if (pushesForward) {
      notes.push("Celebration day must not push next tasks.");
    }
  }

  if (ctx.cycleState === "protected" && proposals.length > 0) {
    notes.push("Protected state must not surface proposals.");
  }

  if (
    (ctx.dayMode === "survival" || ctx.dayMode === "recovery") &&
    proposals.length > 2 &&
    !ctx.orientationOnly
  ) {
    notes.push("Low-capacity day exceeds proposal cap.");
  }

  return { passed: notes.length === 0, notes };
}

export function applyAuditToJudgment(
  judgment: CompanionJudgmentResult,
  audit: CognitiveAuditResult,
): CompanionJudgmentResult {
  return {
    ...judgment,
    auditPassed: audit.passed,
    auditNotes: audit.notes,
    materializeAllowed: audit.passed && judgment.proposals.length >= 0,
  };
}
