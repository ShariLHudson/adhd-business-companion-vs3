import { describe, expect, it } from "vitest";

import { generateCursorPrompt } from "./cursorPrompt";
import {
  experimentFromIssue,
  markIssueReadyForRetest,
  retestIssuePass,
  upsertIssue,
} from "./store";
import type { FounderTrackedIssue } from "./types";

describe("founder tracking", () => {
  it("generates cursor prompt from issue", () => {
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
    const prompt = generateCursorPrompt(issue);
    expect(prompt).toContain("Create opens stale draft");
    expect(prompt).toContain("Success Tests:");
    expect(prompt).toContain("app/companion/page.tsx");
  });

  it("moves issue to retest then pass", () => {
    let data = upsertIssue(
      { issues: [], experiments: [] },
      {
        title: "Focus audio",
        description: "Audio does not open",
        severity: "medium",
        status: "active",
        source: "testing",
        screenshots: [],
      },
    );
    const id = data.issues[0]!.id;
    data = markIssueReadyForRetest(data, id);
    expect(data.issues[0]?.status).toBe("retest");
    data = retestIssuePass(data, id);
    expect(data.issues[0]?.status).toBe("fixed");
  });

  it("creates experiment from issue", () => {
    const input = experimentFromIssue({
      id: "fi-2",
      title: "Workspace buttons disappear",
      description: "Buttons vanish on mobile",
      severity: "high",
      status: "active",
      source: "testing",
      screenshots: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(input.relatedIssueId).toBe("fi-2");
    expect(input.hypothesis).toContain("Workspace buttons");
  });
});
