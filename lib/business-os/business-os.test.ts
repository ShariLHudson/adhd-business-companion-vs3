import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptBusinessSort,
  evaluateAndRecordBusinessOS,
  evaluateBusinessOS,
  evaluateBusinessOSSortOffer,
  shouldSurfaceBusinessOSSortOffer,
} from "./businessEngine";
import { buildFounderBusinessOSReport } from "./founderBusinessReporting";
import { businessHintForChat } from "./businessMessages";
import { saveBusinessOSStore } from "./businessStore";

describe("business os intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveBusinessOSStore({
      history: [],
      founderSamples: [],
      offerDismissedOn: null,
    });
  });

  it("creates a BusinessOSSnapshot", () => {
    const snapshot = evaluateBusinessOS({
      text: "my business has too many projects and moving pieces",
    });
    expect(snapshot.businessHealth).toBeTruthy();
    expect(snapshot.createdAt).toBeTruthy();
    expect(snapshot.recommendedActions.length).toBeLessThanOrEqual(3);
  });

  it("chat hint avoids hustle and fear language", () => {
    const snapshot = evaluateBusinessOS({ text: "overwhelmed by business" });
    const hint = businessHintForChat(snapshot);
    expect(hint).toMatch(/never hustle|no hustle/i);
    expect(hint).not.toMatch(/hustle harder|you are behind/i);
  });

  it("surfaces sort offer when fragmented", () => {
    const offer = evaluateBusinessOSSortOffer({
      text: "too many moving pieces in my business",
    });
    expect(shouldSurfaceBusinessOSSortOffer(offer)).toBe(true);
    expect(offer?.companionOffer).toMatch(/sort them/i);
  });

  it("accept returns gentle sorting message", () => {
    const offer = evaluateBusinessOSSortOffer({
      text: "business overwhelm priorities",
    });
    expect(offer).not.toBeNull();
    const { message } = acceptBusinessSort(offer!);
    expect(message).toMatch(/no pressure/i);
  });

  it("founder report tracks samples", () => {
    evaluateAndRecordBusinessOS({
      text: "marketing campaign ideas but no focus",
    });
    const report = buildFounderBusinessOSReport();
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});
