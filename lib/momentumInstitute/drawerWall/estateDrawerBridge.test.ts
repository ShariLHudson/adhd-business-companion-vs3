import { describe, expect, it } from "vitest";
import { workspaceOfferFromEstateEvaluation } from "@/lib/estateIntelligence/estateOffer";
import type { EstateIntelligenceEvaluation } from "@/lib/estateIntelligence/types";
import { LIBRARY_ENTRY } from "@/lib/estateIntelligence/registrations/knowledge";
import "@/lib/momentumInstitute/catalog/bootstrapPhase1Catalog";

function libraryEvaluation(userText: string): EstateIntelligenceEvaluation {
  return {
    userText,
    bestMatch: {
      entry: LIBRARY_ENTRY,
      score: 22,
      confidence: "high",
      confidenceScore: 0.9,
      reasons: ["test"],
    },
    route: {
      primaryEntry: LIBRARY_ENTRY,
      invitation:
        "The Momentum Institute has wonderful resources on that topic. Would you like to explore them together?",
      primarySection: "momentum-institute",
      suppressGenericDefinition: false,
    },
    suppressed: false,
  };
}

describe("Institute drawer estate offers", () => {
  it("attaches drawer id and invitation when member language matches", () => {
    const offer = workspaceOfferFromEstateEvaluation(
      libraryEvaluation("I need help with confidence"),
    );
    expect(offer?.section).toBe("momentum-institute");
    expect(offer?.instituteDrawerId).toBe("drawer-confidence");
    expect(offer?.line).toContain("just the drawer");
    expect(offer?.line).toContain("Confidence");
  });

  it("keeps generic library invitation when no drawer matches", () => {
    const offer = workspaceOfferFromEstateEvaluation(
      libraryEvaluation("teach me about business"),
    );
    expect(offer?.instituteDrawerId).toBeUndefined();
    expect(offer?.line).toContain("Momentum Institute");
  });
});
