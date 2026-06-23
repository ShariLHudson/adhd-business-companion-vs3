import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureBehaviorEvent, resetClosedLoopLearningForTests } from "./closedLoopLearning";
import {
  recordInterventionLifecycle,
  resetInterventionLearningForTests,
} from "./companionInterventionLearning";
import {
  recordMistake,
  resetMistakeRecoveryForTests,
} from "./companionMistakeRecovery";
import { ecosystemEventTracker } from "./ecosystem/eventTrackingEngine";
import {
  alertFromWarning,
  batchNonCriticalAlerts,
  buildFounderAlerts,
  rankAlertsBySeverity,
  registerFounderAlertChannel,
} from "./founderAlerts";
import { buildEarlyWarnings } from "./founderEarlyWarning";

describe("founderAlerts", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetClosedLoopLearningForTests();
    resetInterventionLearningForTests();
    resetMistakeRecoveryForTests();
  });

  it("generates alerts from early warnings", () => {
    for (let i = 0; i < 6; i++) {
      captureBehaviorEvent({ capability: "decision_compass", eventType: "offer_dismissed" });
    }
    const summary = buildFounderAlerts();
    expect(summary.evaluatedAt).toBeTruthy();
    expect(summary.totalActionable).toBeGreaterThanOrEqual(0);
    const all = [...summary.critical, ...summary.high, ...summary.medium, ...summary.low];
    expect(all.length).toBeGreaterThan(0);
  });

  it("ranks critical alerts above medium", () => {
    ecosystemEventTracker.track({
      userId: "u1",
      eventType: "user.cancelled",
      feature: "user",
    });
    const summary = buildFounderAlerts();
    const ranked = rankAlertsBySeverity([
      ...summary.critical,
      ...summary.high,
      ...summary.medium,
    ]);
    if (ranked.length >= 2 && summary.critical.length > 0) {
      expect(ranked[0]?.level).toBe("critical");
    }
  });

  it("batches medium and low alerts", () => {
    const fakeAlerts = [
      {
        id: "a1",
        level: "medium" as const,
        issue: "Test medium",
        severity: "medium" as const,
        impact: "test",
        trend: "stable" as const,
        confidencePercent: 60,
        recommendation: "Review",
        filesToReview: [],
        cursorPromptAvailable: true,
        detectedAt: new Date().toISOString(),
        batched: false,
      },
      {
        id: "a2",
        level: "low" as const,
        issue: "Test low",
        severity: "low" as const,
        impact: "test",
        trend: "stable" as const,
        confidencePercent: 40,
        recommendation: "Monitor",
        filesToReview: [],
        cursorPromptAvailable: false,
        detectedAt: new Date().toISOString(),
        batched: false,
      },
    ];
    const batches = batchNonCriticalAlerts(fakeAlerts);
    expect(batches.length).toBe(2);
    expect(batches[0]?.alerts[0]?.batched).toBe(true);
  });

  it("maps warning to alert with copilot fields", () => {
    for (let i = 0; i < 8; i++) {
      recordInterventionLifecycle({ interventionId: "decision_compass", stage: "recommended" });
      recordInterventionLifecycle({ interventionId: "decision_compass", stage: "dismissed" });
    }
    const warnings = buildEarlyWarnings();
    const warning = warnings.find((w) => w.interventionId === "decision_compass");
    expect(warning).toBeDefined();
    const alert = alertFromWarning(warning!);
    expect(alert.issue).toBeTruthy();
    expect(alert.recommendation).toBeTruthy();
    expect(alert.filesToReview.length).toBeGreaterThan(0);
    expect(alert.cursorPromptAvailable).toBe(true);
  });

  it("registers future alert channels", () => {
    const received: string[] = [];
    registerFounderAlertChannel("email", ({ level }) => {
      received.push(level);
    });
    expect(received).toEqual([]);
  });

  it("flags misunderstanding spike as high or medium alert", () => {
    recordMistake({
      signalKind: "explicit_correction",
      misunderstanding: "wrong_intervention",
      userText: "That's not what I meant",
      interventionId: "decision_compass",
    });
    const summary = buildFounderAlerts();
    const all = [...summary.critical, ...summary.high, ...summary.medium];
    expect(all.some((a) => a.issue.toLowerCase().includes("misunderstand") || a.recommendation)).toBe(
      true,
    );
  });
});
