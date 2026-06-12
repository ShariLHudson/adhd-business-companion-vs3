import { describe, expect, it } from "vitest";

import type { FounderWorkspaceItem } from "./types";
import type {
  FounderTrackedExperiment,
  FounderTrackedIssue,
} from "./tracking/types";
import {
  generateBugFixPrompt,
  generateCursorPrompt,
  generateExperimentPrompt,
  generateFeaturePrompt,
  generateRetestPrompt,
} from "./cursorPromptGenerator";

const issue: FounderTrackedIssue = {
  id: "fi-1",
  title: "Create opens stale draft",
  description: "Old content appears",
  severity: "high",
  status: "active",
  source: "testing",
  screenshots: [],
  currentBehavior: "Create shows previous draft",
  expectedBehavior: "Create starts blank unless user resumes",
  likelyFiles: "app/companion/page.tsx",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const project: FounderWorkspaceItem = {
  id: "p1",
  kind: "project",
  title: "Launch funnel",
  description: "Build onboarding UI with new API route for signup",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const experiment: FounderTrackedExperiment = {
  id: "fe-1",
  title: "CTA color test",
  hypothesis: "Orange CTA increases signups",
  testPlan: "1. Deploy variant\n2. Measure 7 days",
  expectedOutcome: "10% lift",
  result: "",
  status: "testing",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("cursorPromptGenerator", () => {
  it("generates bug fix prompt from issue", () => {
    const prompt = generateBugFixPrompt(issue);
    expect(prompt).toContain("Problem:");
    expect(prompt).toContain("Current Behavior:");
    expect(prompt).toContain("Expected Behavior:");
    expect(prompt).toContain("Files Likely Involved:");
    expect(prompt).toContain("app/companion/page.tsx");
    expect(prompt).toContain("Ready to paste into Cursor.");
  });

  it("generates feature prompt from project", () => {
    const prompt = generateFeaturePrompt(project);
    expect(prompt).toContain("Goal:");
    expect(prompt).toContain("UI Requirements:");
    expect(prompt).toContain("Backend Requirements:");
    expect(prompt).toContain("Data Model:");
    expect(prompt).toContain("Success Tests:");
  });

  it("generates experiment prompt", () => {
    const prompt = generateExperimentPrompt(experiment, issue);
    expect(prompt).toContain("Hypothesis:");
    expect(prompt).toContain("Test Plan:");
    expect(prompt).toContain("Success Criteria:");
    expect(prompt).toContain("Linked issue:");
  });

  it("generates retest prompt", () => {
    const retestIssue = { ...issue, status: "retest" as const };
    const prompt = generateRetestPrompt(retestIssue, experiment);
    expect(prompt).toContain("Original Issue:");
    expect(prompt).toContain("Fix Applied:");
    expect(prompt).toContain("Pass/Fail Criteria:");
  });

  it("routes generateCursorPrompt by kind", () => {
    expect(generateCursorPrompt({ kind: "bug_fix", issue })).toContain("Problem:");
    expect(generateCursorPrompt({ kind: "feature", project })).toContain("Goal:");
    expect(
      generateCursorPrompt({ kind: "experiment", experiment }),
    ).toContain("Hypothesis:");
    expect(
      generateCursorPrompt({ kind: "retest", issue: { ...issue, status: "retest" } }),
    ).toContain("Test Steps:");
  });
});
