export type FounderIssueSeverity = "low" | "medium" | "high" | "critical";

export type FounderIssueStatus =
  | "new"
  | "active"
  | "retest"
  | "fixed"
  | "parked";

export type FounderIssueSource =
  | "testing"
  | "user_report"
  | "founder"
  | "guidance"
  | "other";

export type FounderTrackedIssue = {
  id: string;
  title: string;
  description: string;
  severity: FounderIssueSeverity;
  status: FounderIssueStatus;
  source: FounderIssueSource;
  relatedProjectId?: string;
  relatedProjectTitle?: string;
  screenshots: string[];
  expectedBehavior?: string;
  currentBehavior?: string;
  likelyFiles?: string;
  createdAt: string;
  updatedAt: string;
};

export type FounderExperimentStatus =
  | "idea"
  | "testing"
  | "successful"
  | "failed"
  | "parked";

export type FounderTrackedExperiment = {
  id: string;
  title: string;
  hypothesis: string;
  relatedIssueId?: string;
  relatedProjectId?: string;
  relatedProjectTitle?: string;
  testPlan: string;
  expectedOutcome: string;
  result: string;
  status: FounderExperimentStatus;
  createdAt: string;
  updatedAt: string;
};

export type FounderTrackingData = {
  issues: FounderTrackedIssue[];
  experiments: FounderTrackedExperiment[];
};

export type FounderTrackingSection = "issue" | "dev_experiment" | "retest";

export const ISSUE_SEVERITIES: { value: FounderIssueSeverity; label: string }[] =
  [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

export const ISSUE_STATUSES: { value: FounderIssueStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "retest", label: "Retest" },
  { value: "fixed", label: "Done" },
  { value: "parked", label: "Parked" },
];

export const EXPERIMENT_STATUSES: {
  value: FounderExperimentStatus;
  label: string;
}[] = [
  { value: "idea", label: "Idea" },
  { value: "testing", label: "Testing" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "parked", label: "Parked" },
];

export function issueSeverityLabel(s: FounderIssueSeverity): string {
  return ISSUE_SEVERITIES.find((x) => x.value === s)?.label ?? s;
}

export function issueStatusLabel(s: FounderIssueStatus): string {
  return ISSUE_STATUSES.find((x) => x.value === s)?.label ?? s;
}

export function experimentStatusLabel(s: FounderExperimentStatus): string {
  return EXPERIMENT_STATUSES.find((x) => x.value === s)?.label ?? s;
}
