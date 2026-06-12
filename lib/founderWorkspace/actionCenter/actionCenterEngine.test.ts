import { describe, expect, it } from "vitest";

import type { FounderDailyBriefing } from "../briefing/founderBriefingEngine";
import type { FounderTrackingData } from "../tracking/types";

import {
  experimentDraftFromTask,
  resolveRecommendedTask,
} from "./actionCenterEngine";

const baseBriefing: FounderDailyBriefing = {
  generatedAt: new Date().toISOString(),
  greeting: "Good morning",
  todaysFocus: { title: "Ship onboarding", reason: "Users are dropping off." },
  projectsNeedingAttention: [],
  openIssues: [],
  activeExperiments: [],
  opportunities: [],
  suggestedAction: {
    label: "Create Cursor prompt to fix Google Docs export",
    detail: "Turn this issue into an actionable fix prompt for Cursor.",
    navigateTo: "issue",
    issueId: "fi-1",
  },
  canWait: [],
  stats: {
    criticalIssueCount: 1,
    openIssueCount: 1,
    projectsNeedingAttentionCount: 0,
    retestCount: 0,
    activeExperimentCount: 0,
  },
};

const tracking: FounderTrackingData = {
  issues: [
    {
      id: "fi-1",
      title: "Google Docs workflow broken",
      description: "Export fails silently",
      severity: "high",
      status: "active",
      source: "founder",
      screenshots: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  experiments: [],
};

describe("resolveRecommendedTask", () => {
  it("resolves issue from suggested action with cursor context", () => {
    const task = resolveRecommendedTask({
      briefing: baseBriefing,
      tracking,
      analyses: [],
      workspace: { projects: [], experiments: [], notes: [] },
    });
    expect(task.title).toBe("Google Docs workflow broken");
    expect(task.impact).toBe("high");
    expect(task.cursorContext?.kind).toBe("bug_fix");
    expect(task.navigateTo).toBe("issue");
    expect(task.itemId).toBe("fi-1");
  });

  it("builds experiment draft linked to issue", () => {
    const task = resolveRecommendedTask({
      briefing: baseBriefing,
      tracking,
      analyses: [],
      workspace: { projects: [], experiments: [], notes: [] },
    });
    const draft = experimentDraftFromTask(task);
    expect(draft.relatedIssueId).toBe("fi-1");
    expect(draft.title).toContain("Google Docs");
  });
});
