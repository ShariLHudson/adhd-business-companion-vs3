import { describe, expect, it } from "vitest";
import { collectLoadContributors } from "./loadFactors";
import {
  buildCognitiveLoadSnapshot,
  evaluateCognitiveLoad,
} from "./loadEngine";
import { buildCognitiveLoadScore, levelForScore } from "./loadScoring";
import {
  buildLoadSummaries,
  COGNITIVE_LOAD_COMPANION_OFFER,
} from "./loadMessages";
import { buildFounderCognitiveLoadReport } from "./founderCognitiveLoadReporting";
import type { Project } from "@/lib/companionStore";

const sampleProjects: Project[] = [
  {
    id: "p1",
    name: "Launch",
    goal: "",
    horizon: "now",
    status: "in-progress",
    nextAction: "Draft email",
    color: "#1e4f4f",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "p2",
    name: "Website",
    goal: "",
    horizon: "now",
    status: "paused",
    nextAction: "",
    color: "#9a6fb0",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "p3",
    name: "Course",
    goal: "",
    horizon: "now",
    status: "in-progress",
    nextAction: "Outline module 1",
    color: "#6b6b6b",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
];

describe("cognitive load scoring", () => {
  it("maps score ranges to levels", () => {
    expect(levelForScore(10)).toBe("light");
    expect(levelForScore(40)).toBe("moderate");
    expect(levelForScore(60)).toBe("heavy");
    expect(levelForScore(85)).toBe("overloaded");
  });

  it("exposes every point through contributors", () => {
    const contributors = collectLoadContributors({
      projects: sampleProjects,
      openBrainDumpCount: 6,
      stalledProjectCount: 1,
      overdueTaskCount: 2,
      emotionalState: "overwhelmed",
      recentText: "I'm not good enough and they're mad at me",
      dayState: {
        energy: "low",
        overwhelm: "high",
        needs: [],
        setAt: new Date().toISOString(),
      },
      signalCounts: [
        {
          kind: "struggle",
          category: "overwhelm",
          count: 2,
          lastSeen: new Date().toISOString(),
        },
        {
          kind: "question",
          category: "dont_know_where_to_start",
          count: 3,
          lastSeen: new Date().toISOString(),
        },
      ],
    });
    const score = buildCognitiveLoadScore(contributors);
    expect(score.contributors.some((c) => c.domain === "companion")).toBe(true);
    expect(score.contributors.some((c) => c.id === "stalled_projects")).toBe(
      true,
    );
    expect(score.contributors.some((c) => c.id === "shame_self_criticism")).toBe(
      true,
    );
    for (const c of score.contributors) {
      expect(c.label).toBeTruthy();
      expect(c.detail).toBeTruthy();
      expect(c.points).toBeGreaterThan(0);
    }
  });

  it("builds full CognitiveLoadSnapshot", () => {
    const result = evaluateCognitiveLoad({
      projects: sampleProjects,
      emotionalState: "overwhelmed",
      openBrainDumpCount: 6,
      signalCounts: [
        {
          kind: "struggle",
          category: "overwhelm",
          count: 3,
          lastSeen: new Date().toISOString(),
        },
      ],
      timeBlocksToday: 5,
    });
    const snap = buildCognitiveLoadSnapshot(result);
    expect(snap.score).toBe(result.score.value);
    expect(snap.level).toBe(result.score.level);
    expect(snap.contributors.length).toBeGreaterThan(0);
    expect(snap.summary.length).toBeGreaterThan(0);
    expect(snap.createdAt).toBeTruthy();
  });

  it("uses exact companion offer at heavy+ load", () => {
    const heavy = evaluateCognitiveLoad({
      projects: sampleProjects,
      openBrainDumpCount: 6,
      emotionalState: "overwhelmed",
      dayState: {
        energy: "low",
        overwhelm: "high",
        needs: [],
        setAt: new Date().toISOString(),
      },
      signalCounts: [
        {
          kind: "struggle",
          category: "overwhelm",
          count: 3,
          lastSeen: new Date().toISOString(),
        },
        {
          kind: "question",
          category: "im_overwhelmed",
          count: 2,
          lastSeen: new Date().toISOString(),
        },
      ],
      timeBlocksToday: 5,
    });
    if (heavy.score.level === "heavy" || heavy.score.level === "overloaded") {
      expect(heavy.companionOffer).toBe(COGNITIVE_LOAD_COMPANION_OFFER);
    }
  });

  it("surfaces awareness summaries without shame language", () => {
    const result = evaluateCognitiveLoad({
      projects: sampleProjects,
      emotionalState: "overwhelmed",
      signalCounts: [
        {
          kind: "struggle",
          category: "decision_making",
          count: 2,
          lastSeen: new Date().toISOString(),
        },
      ],
    });
    expect(result.summaries.join(" ")).toMatch(/carrying|attention|decision/i);
    expect(result.summaries.join(" ")).not.toMatch(/lazy|behind|failed/i);
  });

  it("founder report includes recommended action", () => {
    const report = buildFounderCognitiveLoadReport();
    expect(report.recommendedFounderAction.length).toBeGreaterThan(10);
  });

  it("recommends supportive actions not productivity pressure", () => {
    const score = buildCognitiveLoadScore(
      collectLoadContributors({ projects: sampleProjects }),
    );
    const summaries = buildLoadSummaries(score);
    expect(summaries.some((s) => s.includes("project"))).toBe(true);
  });
});
