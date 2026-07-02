import { describe, expect, it } from "vitest";

import { detectShariBannedPhrases } from "./shariCompanionEngine";
import { SHARI_COMPANION_GOLDEN_SCENARIOS } from "./shariCompanionGoldenScenarios";
import { shariCompanionHintForChat } from "./shariCompanionEngine";

describe("Shari Companion golden scenarios", () => {
  it("defines all ten QA scenarios", () => {
    expect(SHARI_COMPANION_GOLDEN_SCENARIOS).toHaveLength(10);
    const ids = SHARI_COMPANION_GOLDEN_SCENARIOS.map((s) => s.id);
    expect(ids).toContain("difficult-client-call");
    expect(ids).toContain("celebrate");
  });

  for (const scenario of SHARI_COMPANION_GOLDEN_SCENARIOS) {
    it(`${scenario.id}: wrong response uses banned generic phrasing`, () => {
      expect(detectShariBannedPhrases(scenario.wrongGeneric).length).toBeGreaterThan(
        0,
      );
    });

    it(`${scenario.id}: correct response avoids banned phrasing`, () => {
      if (scenario.forbiddenInCorrect) {
        for (const banned of scenario.forbiddenInCorrect) {
          expect(scenario.correctShari.toLowerCase()).not.toContain(
            banned.toLowerCase(),
          );
        }
      }
      expect(detectShariBannedPhrases(scenario.correctShari)).toEqual([]);
    });

    it(`${scenario.id}: hint stack supports emotional-first when applicable`, () => {
      const hint = shariCompanionHintForChat({ userText: scenario.memberMessage });
      expect(hint).toMatch(/SHARI COMPANION ENGINE/i);
      if (scenario.id === "difficult-client-call") {
        expect(hint).toMatch(/DIFFICULT CLIENT CALL/i);
        expect(hint).toMatch(/practice/i);
      }
      if (scenario.id === "go-somewhere") {
        expect(hint).toBeTruthy();
      }
    });
  }
});
