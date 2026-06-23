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
import {
  buildFounderMissionControl,
  buildCapabilityHealth,
  buildUserFrictionHeatmap,
  generateFounderDailyBrief,
  generateFounderWeeklyBrief,
  getCursorPromptForPriority,
} from "./founderMissionControl";
import { buildFounderIntelligenceDashboard } from "./founderIntelligence";

describe("founderMissionControl", () => {
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

  it("builds mission control executive summary", () => {
    const mc = buildFounderMissionControl();
    expect(mc.ecosystemHealth).toBeGreaterThanOrEqual(0);
    expect(mc.companionHealth.length).toBe(6);
    expect(mc.topPriorities.length).toBeLessThanOrEqual(5);
    expect(mc.alerts).toBeDefined();
    expect(mc.misfireCenter).toBeDefined();
    expect(mc.dailyBrief).toBeDefined();
    expect(mc.weeklyBrief).toBeDefined();
  });

  it("generates daily brief with priorities and health scores", () => {
    for (let i = 0; i < 5; i++) {
      captureBehaviorEvent({ capability: "clear_my_mind", eventType: "offer_dismissed" });
    }
    const brief = generateFounderDailyBrief({ founderName: "Shari" });
    expect(brief.greeting).toMatch(/Shari/);
    expect(brief.companionHealthScore).toBeGreaterThanOrEqual(0);
    expect(brief.trustStatus).toBeTruthy();
    expect(brief.confidenceStatus).toBeTruthy();
    expect(brief.retentionRisk).toBeTruthy();
    expect(brief.priorities.length).toBeLessThanOrEqual(3);
    expect(brief.wins.length).toBeGreaterThan(0);
  });

  it("generates weekly brief with wins and problems", () => {
    recordMistake({
      signalKind: "explicit_correction",
      misunderstanding: "wrong_problem",
      userText: "You're missing the point about pricing",
    });
    const dashboard = buildFounderIntelligenceDashboard();
    const weekly = generateFounderWeeklyBrief(dashboard);
    expect(weekly.headline).toMatch(/Companion Health/);
    expect(weekly.biggestProblems.length).toBeGreaterThanOrEqual(0);
    expect(weekly.roadmapPriorities.length).toBeLessThanOrEqual(5);
  });

  it("builds capability health with top and weak performers", () => {
    for (let i = 0; i < 5; i++) {
      recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "recommended" });
      recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "accepted" });
      recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "completed" });
    }
    for (let i = 0; i < 5; i++) {
      recordInterventionLifecycle({ interventionId: "decision_compass", stage: "recommended" });
      recordInterventionLifecycle({ interventionId: "decision_compass", stage: "dismissed" });
    }
    const caps = buildCapabilityHealth();
    expect(caps.length).toBeGreaterThan(0);
    expect(caps.some((c) => c.performance === "top" || c.performance === "weak")).toBe(true);
  });

  it("builds friction heatmap from user signals", () => {
    recordMistake({
      signalKind: "explicit_correction",
      misunderstanding: "wrong_problem",
      userText: "I feel overwhelmed and can't launch my offer",
    });
    const heatmap = buildUserFrictionHeatmap();
    expect(heatmap.some((h) => h.source === "Overwhelm" || h.source === "Launch resistance")).toBe(
      true,
    );
  });

  it("includes misfire center recovery metrics", () => {
    recordMistake({
      signalKind: "explicit_correction",
      misunderstanding: "wrong_intervention",
      userText: "No. That's not what I meant.",
      interventionId: "decision_compass",
    });
    const mc = buildFounderMissionControl();
    expect(mc.misfireCenter.userCorrections).toBeGreaterThan(0);
    expect(mc.misfireCenter.recentCorrections.length).toBeGreaterThan(0);
  });

  it("produces cursor prompt for top priority", () => {
    for (let i = 0; i < 6; i++) {
      captureBehaviorEvent({ capability: "decision_compass", eventType: "offer_dismissed" });
    }
    const mc = buildFounderMissionControl();
    const top = mc.topPriorities[0];
    if (top) {
      const prompt = getCursorPromptForPriority(top);
      expect(prompt).toMatch(/Founder|fix|companion/i);
    }
  });

  it("includes trust-safe user communication summaries", () => {
    const mc = buildFounderMissionControl();
    expect(mc.recentlyImproved.items.length).toBeGreaterThan(0);
    expect(mc.whatsNew.items.length).toBeGreaterThan(0);
    expect(mc.priorityCommunication.length).toBeLessThanOrEqual(5);
    for (const item of mc.recentlyImproved.items) {
      expect(item.toLowerCase()).not.toMatch(/\bbug\b|\bdefect\b/);
    }
  });
});
