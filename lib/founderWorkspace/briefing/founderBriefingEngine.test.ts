import { describe, expect, it } from "vitest";

import type { FounderWorkspaceData } from "../types";
import type {
  ProjectIntelligence,
  ProjectIntelligenceDashboard,
} from "../intelligence/types";
import type { FounderTrackingData } from "../tracking/types";

import {
  formatBriefingForGuidance,
  generateFounderDailyBriefing,
} from "./founderBriefingEngine";

const emptyWorkspace: FounderWorkspaceData = {
  projects: [],
  experiments: [],
  notes: [],
};

const emptyDashboard: ProjectIntelligenceDashboard = {
  needingAttention: [],
  stalled: [],
  highMomentum: [],
  opportunities: [],
  openIssues: [],
};

describe("founderBriefingEngine", () => {
  it("picks critical issue as today's focus", () => {
    const tracking: FounderTrackingData = {
      issues: [
        {
          id: "fi-1",
          title: "Time Block not saving",
          description: "Context lost",
          severity: "critical",
          status: "active",
          source: "testing",
          screenshots: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      experiments: [],
    };

    const briefing = generateFounderDailyBriefing({
      workspace: emptyWorkspace,
      analyses: [],
      dashboard: emptyDashboard,
      tracking,
      founderName: "Shari",
      now: new Date("2026-06-09T09:00:00.000Z"),
    });

    expect(briefing.greeting).toBe("Good morning, Shari");
    expect(briefing.todaysFocus.title).toBe("Time Block not saving");
    expect(briefing.stats.criticalIssueCount).toBe(1);
    expect(briefing.suggestedAction.issueId).toBe("fi-1");
    expect(briefing.suggestedAction.label).toContain("Cursor prompt");
  });

  it("formats briefing for guidance chat", () => {
    const briefing = generateFounderDailyBriefing({
      workspace: emptyWorkspace,
      analyses: [] as ProjectIntelligence[],
      dashboard: emptyDashboard,
      tracking: { issues: [], experiments: [] },
    });

    const text = formatBriefingForGuidance(briefing);
    expect(text).toContain("DAILY FOUNDER BRIEFING");
    expect(text).toContain("TODAY'S FOCUS");
    expect(text).toContain("SUGGESTED ACTION");
  });
});
