import type { FounderWorkspaceItem } from "./types";
import type {
  FounderTrackedExperiment,
  FounderTrackedIssue,
} from "./tracking/types";
import {
  experimentStatusLabel,
  issueSeverityLabel,
  issueStatusLabel,
} from "./tracking/types";

export type CursorPromptKind = "bug_fix" | "feature" | "experiment" | "retest";

export type CursorPromptInput =
  | { kind: "bug_fix"; issue: FounderTrackedIssue }
  | { kind: "feature"; project: FounderWorkspaceItem }
  | {
      kind: "experiment";
      experiment: FounderTrackedExperiment;
      relatedIssue?: FounderTrackedIssue;
    }
  | {
      kind: "retest";
      issue: FounderTrackedIssue;
      linkedExperiment?: FounderTrackedExperiment;
    };

const FOOTER = "Ready to paste into Cursor.";

function section(label: string, body: string): string {
  return `${label}:\n${body.trim() || "(not specified)"}`;
}

function numberedTests(lines: string[]): string {
  return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
}

export function generateBugFixPrompt(issue: FounderTrackedIssue): string {
  const implementation = [
    `Fix: ${issue.title}`,
    `- Severity: ${issueSeverityLabel(issue.severity)} | Status: ${issueStatusLabel(issue.status)}`,
    issue.relatedProjectTitle
      ? `- Related project: ${issue.relatedProjectTitle}`
      : null,
    `- Minimize scope; match existing app patterns in companion-app.`,
    `- Founder-only tracking — do not expose in user-facing navigation.`,
  ]
    .filter(Boolean)
    .join("\n");

  const successTests = numberedTests([
    "Reproduce the original problem (should fail before fix).",
    "Apply the fix with the smallest correct diff.",
    `Verify: ${issue.expectedBehavior || "expected behavior occurs consistently"}.`,
    "Confirm no regression in related companion flows.",
  ]);

  return [
    section("Problem", issue.title),
    section(
      "Current Behavior",
      issue.currentBehavior || issue.description || "",
    ),
    section("Expected Behavior", issue.expectedBehavior || ""),
    section("Files Likely Involved", issue.likelyFiles || ""),
    section("Implementation Requirements", implementation),
    section("Success Tests", successTests),
    FOOTER,
  ].join("\n\n");
}

function inferRequirements(description: string): {
  ui: string;
  backend: string;
  dataModel: string;
} {
  const text = description.toLowerCase();
  const ui =
    /\b(ui|ux|layout|button|panel|modal|screen|design)\b/.test(text)
      ? description
      : "Match existing companion UI patterns (founder workspace styling, ADHD-friendly copy).";
  const backend =
    /\b(api|route|server|supabase|sync|auth)\b/.test(text)
      ? description
      : "Extend existing Next.js API routes and lib modules; no new infrastructure unless required.";
  const dataModel =
    /\b(data|store|localStorage|schema|model)\b/.test(text)
      ? description
      : "Use existing FounderWorkspaceItem / tracking types where applicable.";
  return { ui, backend, dataModel };
}

export function generateFeaturePrompt(project: FounderWorkspaceItem): string {
  const desc = project.description.trim() || "(add project description in workspace)";
  const { ui, backend, dataModel } = inferRequirements(desc);

  const successTests = numberedTests([
    `Change advances the goal: ${project.title}`,
    "Scoped diff — no unrelated refactors.",
    "Founder can verify outcome in under 5 minutes.",
    "No regression in /companion user flows.",
  ]);

  return [
    section("Goal", `${project.title}\n\n${desc}`),
    section("Requirements", desc),
    section("UI Requirements", ui),
    section("Backend Requirements", backend),
    section("Data Model", dataModel),
    section("Success Tests", successTests),
    FOOTER,
  ].join("\n\n");
}

export function generateExperimentPrompt(
  experiment: FounderTrackedExperiment,
  relatedIssue?: FounderTrackedIssue,
): string {
  const currentState = relatedIssue
    ? `Linked issue: ${relatedIssue.title} (${issueStatusLabel(relatedIssue.status)})\n${relatedIssue.currentBehavior || relatedIssue.description || ""}`
    : `Status: ${experimentStatusLabel(experiment.status)}${experiment.result ? `\nResult so far: ${experiment.result}` : ""}`;

  const proposedChange =
    experiment.hypothesis.trim() ||
    experiment.testPlan.trim() ||
    "(describe the change to test)";

  const successCriteria = numberedTests([
    experiment.expectedOutcome || "Expected outcome is measurable.",
    "Test plan steps completed and results recorded.",
    "Decision: ship, iterate, or park based on outcome.",
  ]);

  return [
    section("Hypothesis", experiment.hypothesis),
    section("Current State", currentState),
    section("Proposed Change", proposedChange),
    section("Test Plan", experiment.testPlan),
    section("Expected Outcome", experiment.expectedOutcome),
    section("Success Criteria", successCriteria),
    FOOTER,
  ].join("\n\n");
}

export function generateRetestPrompt(
  issue: FounderTrackedIssue,
  linkedExperiment?: FounderTrackedExperiment,
): string {
  const fixApplied =
    issue.status === "retest"
      ? `Fix marked ready for retest (updated ${new Date(issue.updatedAt).toLocaleString()}).`
      : "Fix applied — verify in retest queue.";

  const testSteps = numberedTests([
    `Reproduce original issue context: ${issue.currentBehavior || issue.description || issue.title}`,
    "Exercise the fixed flow on desktop and mobile if relevant.",
    `Confirm: ${issue.expectedBehavior || "expected behavior"}`,
    linkedExperiment
      ? `Cross-check experiment "${linkedExperiment.title}" if applicable.`
      : "Record pass or fail in founder retest queue.",
  ]);

  const passFail = [
    "PASS: expected behavior is consistent; no regression in related flows.",
    "FAIL: original or new defect observed — return issue to Active and note findings.",
  ].join("\n");

  return [
    section(
      "Original Issue",
      `${issue.title}\n${issue.description}\nSeverity: ${issueSeverityLabel(issue.severity)}`,
    ),
    section(
      "Fix Applied",
      `${fixApplied}${linkedExperiment ? `\nRelated experiment: ${linkedExperiment.title}` : ""}`,
    ),
    section("Test Steps", testSteps),
    section("Expected Result", issue.expectedBehavior || ""),
    section("Pass/Fail Criteria", passFail),
    FOOTER,
  ].join("\n\n");
}

export function generateCursorPrompt(
  input: CursorPromptInput,
  extraNotes?: string,
): string {
  let body: string;
  switch (input.kind) {
    case "bug_fix":
      body = generateBugFixPrompt(input.issue);
      break;
    case "feature":
      body = generateFeaturePrompt(input.project);
      break;
    case "experiment":
      body = generateExperimentPrompt(input.experiment, input.relatedIssue);
      break;
    case "retest":
      body = generateRetestPrompt(input.issue, input.linkedExperiment);
      break;
  }
  if (!extraNotes?.trim()) return body;
  return `${body}\n\nAdditional founder notes:\n${extraNotes.trim()}`;
}

export function promptTitleForInput(input: CursorPromptInput): string {
  switch (input.kind) {
    case "bug_fix":
      return `Bug fix: ${input.issue.title}`;
    case "feature":
      return `Feature: ${input.project.title}`;
    case "experiment":
      return `Experiment: ${input.experiment.title}`;
    case "retest":
      return `Retest: ${input.issue.title}`;
  }
}
