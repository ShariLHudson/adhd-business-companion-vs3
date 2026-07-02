import { describe, expect, it } from "vitest";
import { evaluateEstateIntelligence } from "./estateIntelligence";
import { workspaceOfferFromEstateEvaluation, estateHighConfidenceRoutingActive } from "./estateOffer";

describe("estateOffer", () => {
  it("creates workspace offer for overwhelmed journey", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "I'm overwhelmed and don't know where to start.",
      activeSection: "home",
      overwhelmed: true,
    });
    const offer = workspaceOfferFromEstateEvaluation(evaluation);
    expect(offer?.section).toBe("momentum-builder");
    expect(offer?.line).toMatch(/Momentum Builder/i);
  });

  it("creates workspace offer for peaceful place question", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "What is a peaceful place?",
      activeSection: "home",
    });
    const offer = workspaceOfferFromEstateEvaluation(evaluation);
    expect(offer?.section).toBe("focus-audio");
  });

  it("estate routing is active for high-confidence matches", () => {
    const evaluation = evaluateEstateIntelligence({
      userText: "I'm overwhelmed.",
      activeSection: "home",
      overwhelmed: true,
    });
    expect(estateHighConfidenceRoutingActive(evaluation)).toBe(true);
  });
});
