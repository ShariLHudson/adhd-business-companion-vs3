/**
 * Finalize gate — no print/export/publish until ready.
 */

import type { ArtifactStatus, ArtifactNextAction } from "./types";

const FINALIZE_ACTIONS: ReadonlySet<ArtifactNextAction> = new Set([
  "finalize",
  "export",
  "print",
  "publish",
]);

export function canOfferFinalizeActions(status: ArtifactStatus): boolean {
  return status === "ready_to_finalize" || status === "finalized";
}

export function canOfferNextAction(
  status: ArtifactStatus,
  action: ArtifactNextAction,
): boolean {
  if (!FINALIZE_ACTIONS.has(action)) return true;
  return canOfferFinalizeActions(status);
}

export function finalizeBlockedLanguage(): string {
  return [
    "ARTIFACT FINALIZE GATE (mandatory):",
    "Do NOT offer print, export, publish, send, or save as complete.",
    'Use: "working draft", "what we have so far", "current version", "still shaping this", "needs review".',
    "Only offer finalize/export/print when artifact status is ready_to_finalize or finalized.",
  ].join("\n");
}

export function workingDraftLanguageRules(): string {
  return [
    "WORKING DRAFT LANGUAGE:",
    '- "Here is what we have so far."',
    '- "This is a working draft."',
    '- "We can keep shaping this."',
    "- Never imply the artifact is finished unless the member explicitly asks to finalize.",
  ].join("\n");
}
