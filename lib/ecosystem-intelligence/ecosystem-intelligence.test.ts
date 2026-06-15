import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateAndRecordEcosystem,
  evaluateEcosystem,
  ecosystemGuidanceForChat,
  isSuppressed,
} from "./ecosystemEngine";
import { buildFounderEcosystemReport } from "./founderEcosystemReporting";
import { saveEcosystemStore } from "./ecosystemStore";

describe("ecosystem intelligence hub", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveEcosystemStore({ history: [], founderSamples: [] });
  });

  it("creates an EcosystemSnapshot with one top priority", () => {
    const snapshot = evaluateEcosystem({
      text: "burned out, overloaded, can't focus on anything",
    });
    expect(snapshot.topSignal).toBeTruthy();
    expect(snapshot.recommendedSurface).toBeTruthy();
    expect(snapshot.activeIntelligenceLayers.length).toBeGreaterThan(0);
    expect(snapshot.priorityReason.length).toBeGreaterThan(0);
  });

  it("prioritizes recovery over opportunity", () => {
    const snapshot = evaluateEcosystem({
      text: "burned out exhausted depleted, also have a business opportunity idea",
    });
    expect(isSuppressed(snapshot, "opportunity_offer")).toBe(true);
    expect(snapshot.topSignal).not.toBe("opportunity_explore");
  });

  it("suppresses opportunity when activation is stuck", () => {
    const snapshot = evaluateEcosystem({
      text: "frozen stuck can't start, also want to explore new offer",
      activationOfferActive: true,
    });
    expect(isSuppressed(snapshot, "opportunity_offer")).toBe(true);
  });

  it("provides one clean companion guidance summary", () => {
    const snapshot = evaluateEcosystem({
      text: "high cognitive load, declining energy, stalled momentum",
    });
    const guidance = ecosystemGuidanceForChat(snapshot);
    expect(guidance).toMatch(/ECOSYSTEM GUIDANCE/i);
    expect(guidance).toMatch(/Current priority:/i);
    expect(guidance).toMatch(/Suggested tone:/i);
    expect(guidance).toMatch(/Avoid:/i);
    expect(guidance).not.toMatch(/hustle harder/i);
  });

  it("founder report tracks ecosystem health", () => {
    evaluateAndRecordEcosystem({
      text: "overwhelmed with too many business pieces",
    });
    const report = buildFounderEcosystemReport();
    expect(report.sampleSize).toBeGreaterThan(0);
    expect(report.recommendedSystemImprovement.length).toBeGreaterThan(10);
  });
});
