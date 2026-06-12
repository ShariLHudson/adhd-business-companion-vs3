import { describe, expect, it } from "vitest";

import {
  classifyUserSignals,
  MemoryUserSignalSink,
  UserIntelligenceEngine,
} from "./userIntelligenceEngine";

describe("classifyUserSignals", () => {
  it("categorizes struggles, questions, and emotions", () => {
    const out = classifyUserSignals(
      "I'm overwhelmed and don't know where to start. What should I work on?",
      "overwhelmed",
    );
    expect(out.struggles).toContain("overwhelm");
    expect(out.questions).toContain("what_should_i_work_on");
    expect(out.questions).toContain("dont_know_where_to_start");
    expect(out.emotions.length).toBeGreaterThan(0);
  });

  it("detects marketing and content struggles", () => {
    const out = classifyUserSignals(
      "I need help with marketing and writing my newsletter draft",
    );
    expect(out.struggles).toContain("marketing");
    expect(out.struggles).toContain("content_creation");
  });
});

describe("UserIntelligenceEngine", () => {
  it("stores signals without conversation text", () => {
    const engine = new UserIntelligenceEngine(new MemoryUserSignalSink());
    engine.observeUserSignals({
      userId: "usr-1",
      text: "I'm frustrated and can't focus — help me prioritize my launch content",
      emotionalState: "emotional",
      source: "chat",
    });

    const stored = engine.query({ userId: "usr-1" });
    expect(stored.length).toBeGreaterThan(0);
    expect(engine.storageIsSignalOnly()).toBe(true);
    for (const row of stored) {
      expect(row).not.toHaveProperty("text");
      expect(row).not.toHaveProperty("message");
      expect(row).not.toHaveProperty("content");
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("tracks counts and trends", () => {
    const engine = new UserIntelligenceEngine(new MemoryUserSignalSink());
    const now = new Date("2026-06-12T12:00:00.000Z");
    const recent = new Date(now.getTime() - 2 * 86_400_000).toISOString();
    const older = new Date(now.getTime() - 10 * 86_400_000).toISOString();

    engine.recordSignal({
      userId: "usr-2",
      kind: "struggle",
      category: "overwhelm",
      timestamp: recent,
    });
    engine.recordSignal({
      userId: "usr-2",
      kind: "struggle",
      category: "overwhelm",
      timestamp: recent,
    });
    engine.recordSignal({
      userId: "usr-2",
      kind: "question",
      category: "help_me_prioritize",
      timestamp: older,
    });

    const counts = engine.getCounts("usr-2");
    const overwhelm = counts.find((c) => c.category === "overwhelm");
    expect(overwhelm?.count).toBe(2);

    const daily = engine.getDailyCounts("usr-2", 30);
    expect(daily.length).toBeGreaterThan(0);

    const trends = engine.getTrends("usr-2", now);
    expect(trends.some((t) => t.category === "overwhelm")).toBe(true);
  });

  it("supports querying by kind and category", () => {
    const engine = new UserIntelligenceEngine(new MemoryUserSignalSink());
    engine.observeUserSignals({
      userId: "usr-3",
      text: "I'm hopeful but confused about what to do next",
      source: "chat",
    });
    const emotions = engine.query({
      userId: "usr-3",
      kind: "emotion",
      category: "hopeful",
    });
    expect(emotions.length).toBe(1);
  });
});
