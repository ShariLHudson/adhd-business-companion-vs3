import type {
  FounderTrackedExperiment,
  FounderTrackedIssue,
  FounderTrackingData,
} from "./types";

const STORAGE_KEY = "founder-issues-experiments-v1";

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function empty(): FounderTrackingData {
  return { issues: [], experiments: [] };
}

export function loadFounderTracking(): FounderTrackingData {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as FounderTrackingData;
    return {
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      experiments: Array.isArray(parsed.experiments) ? parsed.experiments : [],
    };
  } catch {
    return empty();
  }
}

export function saveFounderTracking(data: FounderTrackingData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export type FounderIssueInput = Omit<
  FounderTrackedIssue,
  "id" | "createdAt" | "updatedAt"
> & { id?: string };

export type FounderExperimentInput = Omit<
  FounderTrackedExperiment,
  "id" | "createdAt" | "updatedAt"
> & { id?: string };

export function upsertIssue(
  data: FounderTrackingData,
  input: FounderIssueInput,
): FounderTrackingData {
  const now = new Date().toISOString();
  if (input.id) {
    return {
      ...data,
      issues: data.issues.map((issue) =>
        issue.id === input.id
          ? {
              ...issue,
              ...input,
              id: input.id,
              updatedAt: now,
            }
          : issue,
      ),
    };
  }
  const issue: FounderTrackedIssue = {
    id: newId("fi"),
    title: input.title.trim() || "Untitled issue",
    description: input.description.trim(),
    severity: input.severity,
    status: input.status,
    source: input.source,
    relatedProjectId: input.relatedProjectId,
    relatedProjectTitle: input.relatedProjectTitle,
    screenshots: input.screenshots ?? [],
    expectedBehavior: input.expectedBehavior,
    currentBehavior: input.currentBehavior,
    likelyFiles: input.likelyFiles,
    createdAt: now,
    updatedAt: now,
  };
  return { ...data, issues: [issue, ...data.issues] };
}

export function upsertExperiment(
  data: FounderTrackingData,
  input: FounderExperimentInput,
): FounderTrackingData {
  const now = new Date().toISOString();
  if (input.id) {
    return {
      ...data,
      experiments: data.experiments.map((exp) =>
        exp.id === input.id
          ? { ...exp, ...input, id: input.id, updatedAt: now }
          : exp,
      ),
    };
  }
  const experiment: FounderTrackedExperiment = {
    id: newId("fe"),
    title: input.title.trim() || "Untitled experiment",
    hypothesis: input.hypothesis.trim(),
    relatedIssueId: input.relatedIssueId,
    relatedProjectId: input.relatedProjectId,
    relatedProjectTitle: input.relatedProjectTitle,
    testPlan: input.testPlan.trim(),
    expectedOutcome: input.expectedOutcome.trim(),
    result: input.result.trim(),
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
  return { ...data, experiments: [experiment, ...data.experiments] };
}

export function removeIssue(
  data: FounderTrackingData,
  id: string,
): FounderTrackingData {
  return {
    ...data,
    issues: data.issues.filter((i) => i.id !== id),
    experiments: data.experiments.map((e) =>
      e.relatedIssueId === id ? { ...e, relatedIssueId: undefined } : e,
    ),
  };
}

export function removeExperiment(
  data: FounderTrackingData,
  id: string,
): FounderTrackingData {
  return {
    ...data,
    experiments: data.experiments.filter((e) => e.id !== id),
  };
}

export function markIssueReadyForRetest(
  data: FounderTrackingData,
  id: string,
): FounderTrackingData {
  return upsertIssue(data, {
    ...data.issues.find((i) => i.id === id)!,
    status: "retest",
  });
}

export function retestIssuePass(
  data: FounderTrackingData,
  id: string,
): FounderTrackingData {
  const issue = data.issues.find((i) => i.id === id);
  if (!issue) return data;
  return upsertIssue(data, {
    ...issue,
    status: "fixed",
    description: `${issue.description}\n\n[Retest passed ${new Date().toLocaleDateString()}]`.trim(),
  });
}

export function retestIssueFail(
  data: FounderTrackingData,
  id: string,
): FounderTrackingData {
  const issue = data.issues.find((i) => i.id === id);
  if (!issue) return data;
  return upsertIssue(data, {
    ...issue,
    status: "active",
    description: `${issue.description}\n\n[Retest failed ${new Date().toLocaleDateString()} — back to active]`.trim(),
  });
}

export function experimentFromIssue(
  issue: FounderTrackedIssue,
): FounderExperimentInput {
  return {
    title: `Experiment: ${issue.title}`,
    hypothesis: `If we address "${issue.title}", users will no longer see: ${issue.currentBehavior || issue.description}`,
    relatedIssueId: issue.id,
    testPlan: issue.expectedBehavior
      ? `Verify: ${issue.expectedBehavior}`
      : `Reproduce issue, apply fix, confirm "${issue.title}" no longer occurs.`,
    expectedOutcome: issue.expectedBehavior || "Issue no longer reproduces in testing.",
    result: "",
    status: "idea",
  };
}

export function getRetestQueue(data: FounderTrackingData): FounderTrackedIssue[] {
  return data.issues.filter((i) => i.status === "retest");
}

export function getCriticalIssues(
  data: FounderTrackingData,
): FounderTrackedIssue[] {
  return data.issues.filter(
    (i) =>
      (i.severity === "critical" || i.severity === "high") &&
      i.status !== "fixed" &&
      i.status !== "parked",
  );
}
