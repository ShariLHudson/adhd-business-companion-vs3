import { describe, expect, it } from "vitest";

import { buildFounderGuidanceContext, detectLikelyIssues } from "./buildContext";

describe("buildFounderGuidanceContext", () => {
  it("includes workspace items and active tab", () => {
    const context = buildFounderGuidanceContext({
      workspace: {
        projects: [
          {
            id: "p1",
            kind: "project",
            title: "Launch",
            description: "Beta ship",
            status: "active",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
          },
        ],
        experiments: [],
        notes: [],
      },
      activeTab: "project",
      selectedItem: null,
    });
    expect(context).toContain("Launch");
    expect(context).toContain("Active tab: project");
  });

  it("detects likely issues by keywords", () => {
    const issues = detectLikelyIssues({
      projects: [],
      experiments: [],
      notes: [
        {
          id: "n1",
          kind: "note",
          title: "Login bug",
          description: "Users cannot sign in",
          status: "new",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    expect(issues).toHaveLength(1);
  });
});
