import { describe, expect, it } from "vitest";
import {
  CHAMBER_PERSPECTIVE_CHOICES,
  recommendChamberMembersForPerspective,
} from "@/lib/chamber/chamberPerspectiveGuide";

describe("chamberPerspectiveGuide", () => {
  it("offers the six perspective choices", () => {
    expect(CHAMBER_PERSPECTIVE_CHOICES).toHaveLength(6);
    expect(CHAMBER_PERSPECTIVE_CHOICES.map((c) => c.id)).toContain("decide");
    expect(CHAMBER_PERSPECTIVE_CHOICES.map((c) => c.label)).toContain(
      "I’m not sure",
    );
  });

  it("recommends at most three members with fit explanations", () => {
    for (const choice of CHAMBER_PERSPECTIVE_CHOICES) {
      const recs = recommendChamberMembersForPerspective(choice.id);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.length).toBeLessThanOrEqual(3);
      for (const rec of recs) {
        expect(rec.member.id).toBeTruthy();
        expect(rec.whyFits.length).toBeGreaterThan(10);
        expect(rec.canHelpWith.length).toBeGreaterThan(10);
      }
    }
  });
});
