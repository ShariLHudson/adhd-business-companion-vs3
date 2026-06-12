import { describe, expect, it } from "vitest";

import { computeNextStep } from "./nextStepEngine";
import { analyzeProject } from "./projectIntelligence";
import type { ProjectIntelligenceStore } from "./types";

const emptyStore = (): ProjectIntelligenceStore => ({
  issues: [],
  opportunities: [],
  links: [],
  activity: {},
});

describe("project intelligence", () => {
  it("assigns health and next step to a project", () => {
    const project = {
      id: "p1",
      kind: "project" as const,
      title: "Founder Workspace",
      description: "Next: Connect guidance chat\nIssue: Create workflow opens stale content",
      status: "active" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const store = emptyStore();
    const analysis = analyzeProject(project, {
      projects: [project],
      experiments: [],
      notes: [],
    }, store);
    expect(analysis.healthLabel).toBeTruthy();
    expect(analysis.nextStep).toContain("Connect guidance chat");
    expect(analysis.completionScore).toBeGreaterThan(0);
  });

  it("next step engine prefers explicit Next: lines", () => {
    const step = computeNextStep({
      project: {
        id: "p2",
        kind: "project",
        title: "ADHD Ecosystem",
        description: "Next: Build onboarding flow",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      openIssues: [],
      opportunities: [],
      links: [],
      notesAdded: 0,
      experimentsCompleted: 0,
      daysSinceUpdate: 1,
    });
    expect(step).toBe("Build onboarding flow");
  });
});
