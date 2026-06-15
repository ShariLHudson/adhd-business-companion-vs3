import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptDecisionNarrow,
  acceptDecisionPark,
  evaluateAndRecordDecision,
  evaluateDecision,
  evaluateDecisionOffer,
  shouldSurfaceDecisionOffer,
} from "./decisionEngine";
import { buildDecisionOffer } from "./decisionMessages";
import { buildFounderDecisionReport } from "./founderDecisionReporting";
import { saveDecisionStore } from "./decisionStore";
import { decisionHintForChat } from "./decisionMessages";

describe("decision intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveDecisionStore({
      history: [],
      founderSamples: [],
      parked: [],
      resolvedCount: 0,
      offerDismissedOn: null,
    });
  });

  it("detects stuck state from can't decide language", () => {
    const snapshot = evaluateDecision({
      text: "I can't decide — I keep going back and forth",
      activationState: "stuck",
    });
    expect(snapshot.decisionState).toBe("stuck");
    expect(snapshot.blockers.length).toBeGreaterThan(0);
  });

  it("parks when cognitive load is overloaded", () => {
    const snapshot = evaluateDecision({
      text: "too many options and I don't know which one",
      cognitiveLoadLevel: "overloaded",
    });
    expect(snapshot.recommendedFrame).toBe("park_it");
    expect(snapshot.suggestedNextStep).toMatch(/park|tiny action/i);
  });

  it("suggests good-enough for research loops", () => {
    const snapshot = evaluateDecision({
      text: "I keep researching and can't pick",
      loopType: "research_loop",
    });
    expect(snapshot.recommendedFrame).toBe("good_enough_choice");
  });

  it("narrows options when too many choices", () => {
    const snapshot = evaluateDecision({
      text: "too many options — should I go with A or B?",
    });
    expect(snapshot.recommendedFrame).toBe("reduce_options");
  });

  it("fear of wrong choice uses reversible frame", () => {
    const snapshot = evaluateDecision({
      text: "What if I pick the wrong thing? I don't want to choose wrong",
    });
    expect(snapshot.recommendedFrame).toBe("reversible_vs_irreversible");
  });

  it("chat hint never prescribes you should", () => {
    const snapshot = evaluateDecision({
      text: "I can't decide what should I do",
    });
    const hint = decisionHintForChat(snapshot);
    expect(hint).toMatch(/Do NOT say/i);
    expect(hint).toMatch(/least friction/i);
    expect(hint).not.toMatch(/^You should/m);
  });

  it("surfaces decision offer when appropriate", () => {
    const offer = evaluateDecisionOffer({
      text: "I can't decide between two paths",
    });
    expect(shouldSurfaceDecisionOffer(offer)).toBe(true);
    expect(offer?.companionOffer).toMatch(/narrow|two/i);
  });

  it("founder report tracks blockers and parked decisions", () => {
    const snapshot = evaluateAndRecordDecision({
      text: "too many options I can't decide",
      cognitiveLoadLevel: "heavy",
    });
    const offer = buildDecisionOffer(snapshot);
    acceptDecisionPark(offer);
    const report = buildFounderDecisionReport();
    expect(report.sampleSize).toBeGreaterThan(0);
    expect(report.parkedCount).toBeGreaterThan(0);
  });

  it("narrow accept returns supportive prompt", () => {
    const snapshot = evaluateDecision({
      text: "I can't decide between option A or option B",
    });
    const offer = buildDecisionOffer(snapshot);
    const { message } = acceptDecisionNarrow(offer);
    expect(message).toMatch(/narrow|Help me/i);
  });
});
