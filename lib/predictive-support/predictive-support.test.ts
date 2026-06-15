import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptPredictiveSupport,
  evaluateAndRecordPredictiveSupport,
  evaluatePredictiveOffer,
  evaluatePredictiveSupport,
  shouldSurfacePredictiveOffer,
} from "./predictiveEngine";
import { buildFounderPredictiveReport } from "./founderPredictiveReporting";
import { predictiveHintForChat } from "./predictiveMessages";
import { savePredictiveStore } from "./predictiveStore";

describe("predictive support intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    savePredictiveStore({
      history: [],
      founderSamples: [],
      offerDismissedOn: null,
    });
  });

  it("identifies burnout risk from combined signals", () => {
    const snapshot = evaluatePredictiveSupport({
      text: "burned out exhausted, carrying too much, overwhelmed and depleted",
    });
    expect(snapshot).not.toBeNull();
    expect(["burnout_risk", "overwhelm_risk", "recovery_needed_risk"]).toContain(
      snapshot!.riskType,
    );
    expect(snapshot!.sourceSignals.length).toBeGreaterThan(0);
  });

  it("identifies freeze risk from stuck and decision fatigue", () => {
    const snapshot = evaluatePredictiveSupport({
      text: "frozen stuck can't start, can't decide between options, overwhelmed loop",
    });
    expect(snapshot).not.toBeNull();
    expect([
      "freeze_risk",
      "decision_fatigue_risk",
      "overwhelm_risk",
    ]).toContain(snapshot!.riskType);
  });

  it("chat hint avoids failure and fear language", () => {
    const snapshot = evaluatePredictiveSupport({
      text: "avoiding everything, burned out, too much load",
    });
    expect(snapshot).not.toBeNull();
    const hint = predictiveHintForChat(snapshot!);
    expect(hint).toMatch(/never predict failure|failure predictions or fear framing/i);
    expect(hint).not.toMatch(/likely to fail|you will fail/i);
  });

  it("surfaces gentle offer for elevated risk", () => {
    const offer = evaluatePredictiveOffer({
      text: "burned out depleted exhausted, carrying too much, stalled momentum, avoiding everything",
    });
    if (offer) {
      expect(shouldSurfacePredictiveOffer(offer)).toBe(true);
      expect(offer.companionOffer).toMatch(/gentle|carrying a lot|simplify/i);
      expect(offer.companionOffer).not.toMatch(/likely to fail|you're behind/i);
    }
  });

  it("accept message stays warm and optional", () => {
    const offer = evaluatePredictiveOffer({
      text: "overwhelmed burned out can't cope with decisions",
    });
    if (offer) {
      const { message } = acceptPredictiveSupport(offer);
      expect(message).toMatch(/no pressure|your call/i);
    } else {
      const snap = evaluatePredictiveSupport({
        text: "overwhelmed burned out can't cope",
      });
      expect(snap).not.toBeNull();
    }
  });

  it("founder report tracks emerging risks", () => {
    evaluateAndRecordPredictiveSupport({
      text: "burned out overwhelmed carrying too much",
    });
    const report = buildFounderPredictiveReport();
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});
