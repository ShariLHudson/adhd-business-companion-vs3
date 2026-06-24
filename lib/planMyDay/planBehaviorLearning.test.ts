import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCompanionPlanObservations,
  recordPlanBehaviorEvent,
  resetPlanBehaviorForTests,
} from "./planBehaviorLearning";

describe("planBehaviorLearning", () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
    });
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  afterEach(() => {
    resetPlanBehaviorForTests();
    vi.unstubAllGlobals();
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  it("surfaces supportive observation after repeated marketing deferrals", () => {
    const now = Date.parse("2026-06-15T12:00:00.000Z");
    for (let i = 0; i < 3; i++) {
      recordPlanBehaviorEvent({
        kind: "deferred",
        planItemId: `id-${i}`,
        title: "Write marketing email sequence",
      });
    }
    const observations = buildCompanionPlanObservations(now);
    expect(observations.some((o) => /marketing/i.test(o))).toBe(true);
  });

  it("notes morning completion tendency", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T08:00:00.000Z"));
    for (let i = 0; i < 5; i++) {
      recordPlanBehaviorEvent({
        kind: "completed",
        planItemId: `c-${i}`,
        title: "Client deliverable",
      });
      vi.advanceTimersByTime(3_600_000);
    }
    const observations = buildCompanionPlanObservations(Date.now());
    expect(observations.some((o) => /morning/i.test(o))).toBe(true);
    vi.useRealTimers();
  });
});
