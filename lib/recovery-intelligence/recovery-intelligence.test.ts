import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateAndRecordRecovery,
  evaluateRecovery,
  recoveryHintForChat,
  recoveryOverridesProductivity,
  recoveryWelcomeLine,
} from "./recoveryEngine";
import { buildFounderRecoveryReport } from "./founderRecoveryReporting";
import { saveRecoveryStore } from "./recoveryStore";

describe("recovery intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveRecoveryStore({ history: [], founderSamples: [] });
  });

  it("detects burnout risk from overload and exhaustion", () => {
    const snapshot = evaluateRecovery({
      text: "I'm burned out and exhausted, can't cope",
      cognitiveLoadLevel: "overloaded",
      emotionalState: "overwhelmed",
    });
    expect(snapshot.recoveryLevel).toBe("burnout_risk");
    expect(snapshot.riskLevel).toBe("high");
    expect(snapshot.recoveryNeeds).toContain("recovery_day");
  });

  it("detects depleted state with heavy load", () => {
    const snapshot = evaluateRecovery({
      text: "mentally exhausted and tired",
      cognitiveLoadLevel: "heavy",
      activationState: "frozen",
    });
    expect(["depleted", "burnout_risk"]).toContain(snapshot.recoveryLevel);
  });

  it("recovery overrides productivity at high risk", () => {
    const snapshot = evaluateRecovery({
      cognitiveLoadLevel: "overloaded",
      userHealthStatus: "overloaded",
    });
    expect(recoveryOverridesProductivity(snapshot)).toBe(true);
  });

  it("welcome line gives permission without hustle", () => {
    const snapshot = evaluateRecovery({
      text: "burned out",
      cognitiveLoadLevel: "overloaded",
    });
    const line = recoveryWelcomeLine(snapshot);
    expect(line).toMatch(/lighter day|recovery/i);
    expect(line).not.toMatch(/hustle|grind|push harder/i);
  });

  it("chat hint avoids productivity pressure", () => {
    const snapshot = evaluateRecovery({
      text: "exhausted decision fatigue",
      cognitiveLoadLevel: "heavy",
    });
    const hint = recoveryHintForChat(snapshot);
    expect(hint).toMatch(/don't have to earn recovery/i);
    expect(hint).toMatch(/Avoid: hustle/i);
  });

  it("fully recovered when load is light and moving", () => {
    const snapshot = evaluateRecovery({
      cognitiveLoadLevel: "light",
      activationState: "moving",
      userHealthStatus: "supported",
    });
    expect(snapshot.recoveryLevel).toBe("fully_recovered");
    expect(recoveryOverridesProductivity(snapshot)).toBe(false);
  });

  it("founder report tracks burnout and needs", () => {
    evaluateAndRecordRecovery({
      text: "burned out exhausted",
      cognitiveLoadLevel: "overloaded",
    });
    evaluateAndRecordRecovery({
      text: "decision fatigue can't decide",
      cognitiveLoadLevel: "heavy",
    });
    const report = buildFounderRecoveryReport();
    expect(report.sampleSize).toBe(2);
    expect(report.recoveryImprovements.length).toBeGreaterThan(0);
    expect(report.recommendedFounderAction.length).toBeGreaterThan(10);
  });
});
