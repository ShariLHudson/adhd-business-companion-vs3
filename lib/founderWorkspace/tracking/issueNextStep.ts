import type { FounderTrackedExperiment, FounderTrackedIssue } from "./types";

export function issueNextStep(
  issue: FounderTrackedIssue,
  linkedExperiment?: FounderTrackedExperiment,
): string {
  if (issue.status === "retest") {
    return linkedExperiment?.testPlan
      ? `Run retest: ${linkedExperiment.testPlan}`
      : `Retest: confirm "${issue.title}" is resolved.`;
  }
  if (issue.status === "fixed") return "No action — verified fixed.";
  if (issue.status === "parked") return "Unpark when ready to address.";
  if (issue.status === "new") {
    return "Triage severity and set to Active when ready to fix.";
  }
  if (!linkedExperiment) {
    return "Turn into an experiment with a clear hypothesis and test plan.";
  }
  if (linkedExperiment.status === "idea") {
    return `Start testing: ${linkedExperiment.testPlan || linkedExperiment.hypothesis}`;
  }
  if (linkedExperiment.status === "testing") {
    return "Record result and mark experiment Successful or Failed.";
  }
  if (issue.likelyFiles) {
    return `Generate Cursor prompt and fix files: ${issue.likelyFiles}`;
  }
  return `Implement fix for: ${issue.currentBehavior || issue.title}`;
}
