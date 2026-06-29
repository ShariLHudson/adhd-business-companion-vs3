import { describe, expect, it, beforeEach } from "vitest";

import { clearCache } from "./cache";
import { clearTelemetry, getTelemetrySummary } from "./telemetry";
import { runCoreTrustPerformance } from "./trustPerformanceEngine";

describe("Spark Core Trust & Performance Engine v1.0", () => {
  beforeEach(() => {
    clearCache();
    clearTelemetry();
  });

  const base = {
    turnId: "t1",
    threadId: "thread-1",
    memberMessage: "",
  };

  it("intent detection under 100ms for simple definition", () => {
    const result = runCoreTrustPerformance({
      ...base,
      memberMessage: "What is churn rate?",
    });

    expect(result.ingress.complexityLevel).toBe(1);
    expect(result.ingress.latencyBudget.totalResponseMaxMs).toBe(1000);
    expect(result.ingress.disciplinesActive).toEqual([]);
    expect(result.ingress.goldenRulePassed).toBe(true);
    expect(result.delivery.streaming.streamTokens).toBe(false);
    expect(getTelemetrySummary().avgIntentMs).toBeLessThan(100);
  });

  it("deep research streams immediately and runs background job", () => {
    const result = runCoreTrustPerformance({
      ...base,
      memberMessage: "Do a comprehensive competitor analysis of the coaching market.",
    });

    expect(result.ingress.complexityLevel).toBeGreaterThanOrEqual(4);
    expect(result.delivery.streaming.enabled).toBe(true);
    expect(result.delivery.streaming.immediateAck).toBe(true);
    expect(result.delivery.backgroundJobs.length).toBeGreaterThan(0);
  });

  it("never activates all disciplines on simple request", () => {
    const result = runCoreTrustPerformance({
      ...base,
      memberMessage: "What is a value proposition?",
    });

    expect(result.ingress.modulesActive.length).toBeLessThanOrEqual(2);
    expect(result.ingress.disciplinesActive.length).toBe(0);
  });

  it("graceful degradation when service unhealthy", () => {
    const result = runCoreTrustPerformance(
      {
        ...base,
        memberMessage: "Research current market trends for executive coaching.",
      },
      {
        serviceLatencies: [
          { name: "research-api", latencyMs: 5000, thresholdMs: 2000 },
        ],
      },
    );

    expect(result.delivery.degradedMode).toBe(true);
    expect(result.delivery.fallback).toBeTruthy();
    expect(result.ingress.complexityLevel).toBeLessThanOrEqual(2);
  });

  it("core four egress on good draft", () => {
    const result = runCoreTrustPerformance(
      {
        ...base,
        memberMessage: "Help me prepare for a sales meeting.",
      },
      {
        draftText:
          "Start with what you want them to decide. Next step: write three questions you'd love them to answer.",
      },
    );

    expect(result.egress?.approved).toBe(true);
    expect(result.egress?.coreFour.trust).toBe(true);
    expect(result.egress?.coreFour.focus).toBe(true);
  });

  it("detects slow modules in telemetry", () => {
    runCoreTrustPerformance(
      { ...base, memberMessage: "Plan my Q3 marketing priorities." },
      {
        moduleTimings: [
          { name: "intelligence-engine", durationMs: 800, budgetMs: 200 },
        ],
      },
    );

    const summary = getTelemetrySummary();
    expect(Object.keys(summary.slowModuleCounts).length).toBeGreaterThan(0);
  });

  it("warm loads active room", () => {
    const result = runCoreTrustPerformance({
      ...base,
      memberMessage: "Help me write copy.",
      activeRoom: "creative-studio",
    });

    expect(result.ingress.warmLoadRooms).toContain("creative-studio");
  });
});
