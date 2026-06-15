import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  adaptiveHintForChat,
  evaluateAdaptiveCompanion,
  evaluateAndRecordAdaptiveCompanion,
} from "./adaptiveEngine";
import { detectResponseModeCandidates } from "./responseModeDetection";
import { buildFounderAdaptiveReport } from "./founderAdaptiveReporting";
import { saveAdaptiveStore } from "./adaptiveStore";

describe("adaptive companion intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveAdaptiveStore({ history: [], founderSamples: [] });
  });

  it("chooses support mode when overwhelmed", () => {
    const decision = evaluateAdaptiveCompanion({
      emotionalState: "overwhelmed",
      cognitiveLoadLevel: "overloaded",
      text: "I can't do any of this",
    });
    expect(decision.mode).toBe("support");
    expect(decision.reason).toMatch(/support|overload|load/i);
  });

  it("chooses activation when stuck or frozen", () => {
    const decision = evaluateAdaptiveCompanion({
      activationState: "frozen",
      emotionalState: "stuck",
      text: "I'm stuck and can't start",
    });
    expect(decision.mode).toBe("activation");
  });

  it("chooses celebration for wins and milestones", () => {
    const win = evaluateAdaptiveCompanion({
      text: "I finished and shipped the newsletter!",
      emotionalState: "building",
    });
    expect(win.mode).toBe("celebration");

    const milestone = evaluateAdaptiveCompanion({
      celebrationActive: true,
      text: "good morning",
    });
    expect(milestone.mode).toBe("celebration");
  });

  it("chooses planning for explicit planning requests", () => {
    const decision = evaluateAdaptiveCompanion({
      text: "Help me plan my day and set priorities",
      cognitiveLoadLevel: "moderate",
      emotionalState: "unclear",
    });
    expect(decision.mode).toBe("planning");
  });

  it("chooses reflection when loop is active", () => {
    const decision = evaluateAdaptiveCompanion({
      loopType: "rsd_loop",
      text: "why do I keep worrying about this",
      cognitiveLoadLevel: "moderate",
    });
    expect(decision.mode).toBe("reflection");
  });

  it("builds prompt block without mode labels for user", () => {
    const decision = evaluateAdaptiveCompanion({
      activationState: "stuck",
      text: "I'm stuck",
    });
    const block = adaptiveHintForChat(decision);
    expect(block).toMatch(/ADAPTIVE COMPANION MODE/i);
    expect(block).toMatch(/tiny next step/i);
    expect(block).not.toMatch(/try harder|lazy|failing/i);
  });

  it("founder report tracks mode distribution", () => {
    evaluateAndRecordAdaptiveCompanion({
      emotionalState: "overwhelmed",
      cognitiveLoadLevel: "heavy",
    });
    evaluateAndRecordAdaptiveCompanion({
      activationState: "stuck",
      text: "stuck",
    });
    const report = buildFounderAdaptiveReport();
    expect(report.sampleSize).toBeGreaterThan(0);
    expect(report.recommendedImprovement.length).toBeGreaterThan(10);
  });

  it("sorting mode for heavy load without shutdown", () => {
    const candidates = detectResponseModeCandidates({
      cognitiveLoadLevel: "heavy",
      emotionalState: "unclear",
      text: "too many ideas on my plate",
    });
    expect(candidates.some((c) => c.mode === "sorting")).toBe(true);
  });
});
