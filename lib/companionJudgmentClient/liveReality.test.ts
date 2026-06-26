import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { CompanionBrain } from "@/lib/companionBrain";
import { mapFixtureToCompanionMemory } from "@/lib/planMyDay/companionBrainClient/mapFixtureToMemory";
import { LOW_ENERGY, NORMAL_TUESDAY } from "@/lib/planMyDay/dailyCompanionCycle/fixtures/simulations";
import { formatAdaptationMessage } from "./adaptationMessage";
import { detectMeaningfulShift } from "./detectMeaningfulShift";
import {
  publishRealitySignal,
  reEvaluateLiveJudgment,
} from "./liveEcosystem";
import {
  readLiveJudgment,
  resetLiveJudgmentForTests,
} from "./liveJudgmentStore";

describe("formatAdaptationMessage", () => {
  it("never sounds like software", () => {
    const memory = mapFixtureToCompanionMemory(LOW_ENERGY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const msg = formatAdaptationMessage(
      judgment,
      { source: "todays-reality", kind: "day-state", at: new Date().toISOString() },
      null,
    );
    expect(msg).not.toMatch(/plan updated|task due|incomplete/i);
    expect(msg.length).toBeGreaterThan(10);
  });
});

describe("detectMeaningfulShift", () => {
  it("detects day mode change", () => {
    const normal = CompanionBrain.runReasoningCycle(
      mapFixtureToCompanionMemory(NORMAL_TUESDAY),
    ).judgment;
    const low = CompanionBrain.runReasoningCycle(
      mapFixtureToCompanionMemory(LOW_ENERGY),
    ).judgment;
    expect(
      detectMeaningfulShift(normal, low, {
        source: "todays-reality",
        kind: "day-state",
        at: new Date().toISOString(),
      }),
    ).toBe(true);
  });
});

describe("realityFromCapture", () => {
  it("detects reality-relevant capture text", async () => {
    const { captureAffectsLiveReality } = await import("./realityFromCapture");
    expect(captureAffectsLiveReality("I'm exhausted and can't focus")).toBe(true);
    expect(captureAffectsLiveReality("buy milk")).toBe(false);
  });
});

describe("workspaceIntelligence", () => {
  it("registers consume and contribute roles", async () => {
    const { workspaceIntelligenceFor } = await import("./workspaceIntelligence");
    const reality = workspaceIntelligenceFor("todays-reality");
    expect(reality?.contributes).toContain("todays-reality");
    const plan = workspaceIntelligenceFor("plan-my-day");
    expect(plan?.consumes).toContain("live-judgment");
  });
});

describe("liveEcosystem", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    resetLiveJudgmentForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetLiveJudgmentForTests();
  });

  it("re-evaluates judgment on reality signal", () => {
    const result = publishRealitySignal({
      source: "todays-reality",
      kind: "day-state",
      at: new Date().toISOString(),
    });
    expect(result.snapshot.cycle.judgment.dayMode).toBeTruthy();
    expect(readLiveJudgment()?.revision).toBe(1);
  });

  it("increments revision on subsequent evaluations", () => {
    reEvaluateLiveJudgment({
      source: "todays-reality",
      kind: "day-state",
      at: new Date().toISOString(),
    });
    reEvaluateLiveJudgment({
      source: "todays-reality",
      kind: "day-state",
      at: new Date().toISOString(),
    });
    expect(readLiveJudgment()?.revision).toBe(2);
  });
});
