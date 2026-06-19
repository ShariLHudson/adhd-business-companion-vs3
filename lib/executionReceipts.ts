/**
 * Execution save receipts — clear feedback after project/file actions.
 */

import { saveReceipt } from "./saveExportTrust";

export function receiptProjectCreated(
  projectName: string,
  milestoneCount: number,
  taskCount: number,
): string {
  return `Created a new project "${projectName}" with ${milestoneCount} milestone${milestoneCount === 1 ? "" : "s"} and ${taskCount} task${taskCount === 1 ? "" : "s"}.`;
}

export function receiptAddedToProject(
  projectName: string,
  milestoneCount: number,
  taskCount: number,
): string {
  return `Added to ${projectName} — ${milestoneCount} section${milestoneCount === 1 ? "" : "s"}, ${taskCount} task${taskCount === 1 ? "" : "s"}.`;
}

export function receiptDecisionSavedOnly(location: string): string {
  return `${saveReceipt("saved-work")} Find it in ${location}.`;
}

export function receiptGoogleAddedToProject(projectName?: string): string {
  return projectName
    ? `Added the Google file to ${projectName}.`
    : "Added the Google file to your project files.";
}

export function receiptExecutionFailed(): string {
  return saveReceipt("google-fail");
}
