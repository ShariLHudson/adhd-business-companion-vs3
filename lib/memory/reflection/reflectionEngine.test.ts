// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { saveCaptureEntry } from "@/lib/capture/saveCaptureEntry";
import {
  createReflectionReport,
  isReflectionRequest,
} from "./createReflectionReport";
import type { UserMemoryEntry } from "../types";
import { REFLECTION_INSUFFICIENT_SUMMARY } from "./types";

function journalEntry(i: number, content: string): UserMemoryEntry {
  return {
    id: `jr-test-${i}`,
    type: "journal",
    content,
    title: `Entry ${i}`,
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    tags: [],
  };
}

describe("reflection engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("1. ten+ journal entries → themes and patterns", () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      journalEntry(
        i,
        i % 2 === 0
          ? "Felt anxious before the client call but relief after I finished."
          : "Delayed the launch until deadline pressure, then shipped and felt relief.",
      ),
    );

    const report = createReflectionReport({
      timeRange: { preset: "month" },
      entries,
    });

    expect(report.insufficientData).toBe(false);
    expect(report.entryCount).toBe(12);
    expect(report.themes.length).toBeGreaterThan(0);
    expect(report.emotionalPatterns.length).toBeGreaterThan(0);
    expect(report.summary).not.toContain("Not enough data");
  });

  it("2. mixed journal + evidence → cross-category insights", () => {
    const entries: UserMemoryEntry[] = [
      ...Array.from({ length: 5 }, (_, i) =>
        journalEntry(i, "Overwhelmed today but took one small step."),
      ),
      {
        id: "ev-1",
        type: "evidence",
        content: "Helped a client launch — proud of the impact.",
        title: "Client Impact",
        timestamp: new Date().toISOString(),
        tags: ["Client Impact"],
      },
      {
        id: "pf-1",
        type: "portfolio",
        content: "Shipped the workshop landing page.",
        title: "Workshop",
        timestamp: new Date().toISOString(),
        tags: [],
      },
    ];

    const report = createReflectionReport({
      timeRange: { preset: "month" },
      entries,
    });

    expect(report.wins.length).toBeGreaterThan(0);
    expect(
      report.insights.some((line) => line.includes("journal, portfolio, and evidence")) ||
        report.wins.length >= 2,
    ).toBe(true);
  });

  it("3. no data → safe empty response", () => {
    const report = createReflectionReport({
      timeRange: { preset: "week" },
      entries: [],
    });
    expect(report.insufficientData).toBe(true);
    expect(report.summary).toBe(REFLECTION_INSUFFICIENT_SUMMARY);
    expect(report.themes).toEqual([]);
    expect(report.insights).toEqual([]);
  });

  it("4. works from live store without chat", () => {
    for (let i = 0; i < 4; i++) {
      saveCaptureEntry("journal", `Journal note ${i} about decision fatigue.`);
    }
    const report = createReflectionReport({ timeRange: { preset: "all" } });
    expect(report.entryCount).toBeGreaterThanOrEqual(4);
    expect(report.insufficientData).toBe(false);
  });

  it("detects weekly reflection request phrase", () => {
    expect(isReflectionRequest("weekly reflection")).toBe(true);
    expect(isReflectionRequest("I feel overwhelmed")).toBe(false);
  });

  it("detects delay → pressure → action → relief cycle", () => {
    const entries = [
      journalEntry(
        0,
        "I kept delaying the proposal. Deadline pressure built. Finally sent it and felt relief.",
      ),
      journalEntry(
        1,
        "Avoided the call until the meeting was tomorrow. Completed prep and felt calmer.",
      ),
    ];
    const report = createReflectionReport({
      timeRange: { preset: "week" },
      entries,
    });
    expect(report.behaviorPatterns.some((p) => p.includes("delay"))).toBe(true);
  });
});
