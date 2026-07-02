/**
 * Review stage — only after enough sections have substance.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceV2";
import { facilitatedSectionSummary } from "./sectionStatus";

const MIN_FILLED_RATIO = 0.6;
const MIN_FILLED_SECTIONS = 2;

export function hasSolidWorkingDraft(workflow: CreateWorkflowState): boolean {
  const sections = workspaceV2Sections(workflow);
  const filled = sections.filter((s) => s.skipped || s.content.trim()).length;
  if (filled < MIN_FILLED_SECTIONS) return false;
  if (sections.length === 0) return false;
  return filled / sections.length >= MIN_FILLED_RATIO;
}

export function canOfferWorkingDraftReview(
  workflow: CreateWorkflowState,
): boolean {
  if (workflow.draftStatus === "ready" && workflow.buildApproved) return false;
  return hasSolidWorkingDraft(workflow);
}

export function buildWorkingDraftReviewOffer(): string {
  return (
    "We have a solid working draft. Would you like to review it together before we decide what to do next?"
  );
}

export function buildWorkingDraftLanguageRules(): string {
  return [
    "FACILITATED CREATION LANGUAGE (mandatory):",
    '- Say "Here is what we have so far" or "This is a working draft" — never "finished", "complete", "final version", or "ready to print" unless the member explicitly asks to finalize.',
    '- Offer next steps: edit, expand, simplify, research more, save to Portfolio™, export, print, turn into another asset, or come back later.',
    "- One question at a time when facilitating sections.",
    "- Only update the section the member just answered.",
    "- Never prefill sections the member has not provided.",
  ].join("\n");
}

export function facilitatedProgressLine(workflow: CreateWorkflowState): string {
  const { total, complete, notStarted } = facilitatedSectionSummary(workflow);
  return `${complete} of ${total} sections have content (${notStarted} not started).`;
}
