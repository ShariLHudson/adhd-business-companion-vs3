import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateAndRecordMomentum,
  evaluateMomentum,
  evaluateMomentumOffer,
  shouldSurfaceMomentumOffer,
} from "./momentumEngine";
import { buildFounderMomentumReport } from "./founderMomentumReporting";
import { momentumHintForChat } from "./momentumMessages";
import { saveMomentumStore } from "./momentumStore";

describe("momentum intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveMomentumStore({ history: [], founderSamples: [], offerDismissedOn: null });
  });

  it("detects building momentum from wins", () => {
    const snapshot = evaluateMomentum({
      text: "I finished and shipped it today",
      activationState: "moving",
    });
    expect(["building", "steady", "strong"]).toContain(snapshot.momentumLevel);
    expect(snapshot.momentumBuilders.length).toBeGreaterThan(0);
  });

  it("detects stalled momentum from overwhelm", () => {
    const snapshot = evaluateMomentum({
      text: "avoiding everything, burned out",
      activationState: "frozen",
      cognitiveLoadLevel: "overloaded",
      userHealthStatus: "overloaded",
    });
    expect(snapshot.momentumLevel).toBe("stalled");
  });

  it("chat hint avoids hype language", () => {
    const snapshot = evaluateMomentum({ text: "made progress" });
    const hint = momentumHintForChat(snapshot);
    expect(hint).toMatch(/no hype/i);
    expect(hint).not.toMatch(/hustle harder|grind/i);
  });

  it("surfaces offer for rebuilding momentum", () => {
    const offer = evaluateMomentumOffer({
      text: "I'm back and took the first step",
      activationState: "recovering",
    });
    expect(shouldSurfaceMomentumOffer(offer)).toBe(true);
  });

  it("founder report tracks distribution", () => {
    evaluateAndRecordMomentum({
      text: "finished a task",
      activationState: "moving",
    });
    const report = buildFounderMomentumReport();
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});
