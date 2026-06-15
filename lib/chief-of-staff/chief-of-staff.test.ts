import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptChiefPerspective,
  evaluateAndRecordChiefOfStaff,
  evaluateChiefOfStaff,
  evaluateChiefOffer,
  shouldSurfaceChiefOffer,
} from "./chiefEngine";
import { buildFounderChiefReport } from "./founderChiefReporting";
import { chiefHintForChat } from "./chiefMessages";
import { saveChiefStore } from "./chiefStore";

describe("chief of staff intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveChiefStore({
      history: [],
      founderSamples: [],
      offerDismissedOn: null,
    });
  });

  it("creates a ChiefOfStaffSnapshot with ignore list", () => {
    const snapshot = evaluateChiefOfStaff({
      text: "chief of staff what matters most today",
    });
    expect(snapshot.overallAssessment).toBeTruthy();
    expect(snapshot.projectsToIgnore.length).toBeGreaterThan(0);
    expect(snapshot.recommendedActions.length).toBeLessThanOrEqual(3);
  });

  it("chat hint avoids guilt and pressure", () => {
    const snapshot = evaluateChiefOfStaff({ text: "overwhelmed priorities" });
    const hint = chiefHintForChat(snapshot);
    expect(hint).toMatch(/never hustle|guilt/i);
    expect(hint).toMatch(/Avoid:/i);
  });

  it("surfaces chief offer when stretched", () => {
    const offer = evaluateChiefOffer({
      text: "chief of staff perspective what should I ignore",
    });
    expect(shouldSurfaceChiefOffer(offer)).toBe(true);
    expect(offer?.introLine).toMatch(/Chief of Staff/i);
  });

  it("accept returns focus and ignore list", () => {
    const offer = evaluateChiefOffer({
      text: "what matters most chief of staff",
    });
    expect(offer).not.toBeNull();
    const { message } = acceptChiefPerspective(offer!);
    expect(message).toMatch(/safely ignore/i);
    expect(message).not.toMatch(/you're behind/i);
  });

  it("founder report tracks assessments", () => {
    evaluateAndRecordChiefOfStaff({
      text: "prioritize my business overwhelm",
    });
    const report = buildFounderChiefReport();
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});
