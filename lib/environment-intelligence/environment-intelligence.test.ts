import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptEnvironmentAdjust,
  evaluateAndRecordEnvironment,
  evaluateEnvironment,
  evaluateEnvironmentOffer,
  shouldSurfaceEnvironmentOffer,
} from "./environmentEngine";
import { buildFounderEnvironmentReport } from "./founderEnvironmentReporting";
import { environmentHintForChat } from "./environmentMessages";
import { saveEnvironmentStore } from "./environmentStore";

describe("environment intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveEnvironmentStore({
      history: [],
      founderSamples: [],
      helpfulAdjustments: {} as never,
      offerDismissedOn: null,
    });
  });

  it("detects sensory overload from noise and clutter", () => {
    const snapshot = evaluateEnvironment({
      text: "too noisy, messy desk, sensory overload",
    });
    expect(snapshot).not.toBeNull();
    expect(snapshot!.sensoryLoad).toMatch(/high|overwhelming/);
  });

  it("suggests tiny adjustment not whole room clean", () => {
    const snapshot = evaluateEnvironment({
      text: "too many tabs open, visual overwhelm",
    });
    expect(snapshot?.recommendedAdjustment).toBe("close_extra_tabs");
    const hint = environmentHintForChat(snapshot!);
    expect(hint).toMatch(/never shame clutter/i);
  });

  it("surfaces environment offer", () => {
    const offer = evaluateEnvironmentOffer({
      text: "can't focus, too many tabs and notifications",
    });
    expect(shouldSurfaceEnvironmentOffer(offer)).toBe(true);
  });

  it("accept records helpful adjustment", () => {
    const offer = evaluateEnvironmentOffer({
      text: "working from bed and can't focus",
    });
    expect(offer).not.toBeNull();
    const { message } = acceptEnvironmentAdjust(offer!);
    expect(message).toMatch(/environment adjustment/i);
  });

  it("founder report tracks friction points", () => {
    evaluateAndRecordEnvironment({
      text: "noisy and cluttered desk",
    });
    const report = buildFounderEnvironmentReport();
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});
