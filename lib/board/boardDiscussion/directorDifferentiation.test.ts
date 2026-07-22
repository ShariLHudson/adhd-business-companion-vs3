/**
 * Boardroom simplification — Director differentiation + recommendation variance.
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  CORE_BOARD_DIRECTOR_IDS,
  SHARED_PROHIBITED_BOARD_PHRASES,
  buildDecisionRecordFromDiscussion,
  buildDirectorPerspectiveTurns,
  recommendBoardDirectorsForDecision,
  recommendedMatchesCoreBoard,
} from "@/lib/board";

const DECISION_TYPES = [
  "Should I hire a part-time marketing assistant?",
  "Should we raise prices on our core offer?",
  "Should I enter a partnership with another coach?",
  "Should we invest in a new technology platform?",
  "A key customer is unhappy — what should we do?",
  "Should we make a major financial investment this quarter?",
  "What direction should the business take next year?",
  "Is this marketing approach ethically right for us?",
  "My workload is unsustainable — how do we decide what to cut?",
  "What is the biggest risk in expanding into a new market?",
] as const;

describe("Recommended vs Core Board", () => {
  it("never returns the exact Core Board set as Recommended by default", () => {
    expect(recommendedMatchesCoreBoard("general decision")).toBe(false);
    expect(recommendedMatchesCoreBoard("hire an assistant")).toBe(false);
    const rec = recommendBoardDirectorsForDecision("general decision");
    expect(rec.directorIds).not.toEqual([...CORE_BOARD_DIRECTOR_IDS]);
  });

  it("varies recommended Directors by decision type", () => {
    const sets = DECISION_TYPES.map((d) =>
      recommendBoardDirectorsForDecision(d).directorIds.join("|"),
    );
    const unique = new Set(sets);
    expect(unique.size).toBeGreaterThan(3);
  });
});

describe("Director response differentiation", () => {
  for (const decision of DECISION_TYPES) {
    it(`produces distinct voices for: ${decision.slice(0, 48)}`, () => {
      const ids = recommendBoardDirectorsForDecision(decision).directorIds;
      const turns = buildDirectorPerspectiveTurns(
        { decision },
        ids,
        { addressName: "Shari" },
      );
      expect(turns.length).toBeGreaterThan(0);
      const texts = turns.map((t) => t.text);
      for (const phrase of SHARED_PROHIBITED_BOARD_PHRASES) {
        for (const text of texts) {
          expect(text).not.toContain(phrase);
        }
      }
      // Every Director text should differ from every other
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          expect(texts[i]).not.toEqual(texts[j]);
        }
      }
      // Preferred name appears naturally at least once across perspectives
      expect(texts.join("\n")).toMatch(/Shari/);
    });
  }

  it("Decision Record synthesizes instead of repeating a Director turn", () => {
    const decision = "Should I hire a part-time marketing assistant?";
    const ids = recommendBoardDirectorsForDecision(decision).directorIds;
    const turns = buildDirectorPerspectiveTurns(
      { decision, "why-now": "Demand is rising", concerns: "Cash" },
      ids,
      { addressName: "Shari" },
    );
    const record = buildDecisionRecordFromDiscussion({
      id: "bdd-test",
      title: decision,
      createdAt: new Date().toISOString(),
      directorIds: ids,
      answers: {
        decision,
        "why-now": "Demand is rising",
        options: "Hire / Wait / Contractor",
        concerns: "Cash",
      },
      turns,
      sourceContext: { projectId: "p1", projectName: "Marketing Ops" },
    });
    expect(record.summary).toMatch(/Decision:/);
    expect(record.summary).toMatch(/Strongest points of agreement/i);
    expect(record.summary).toMatch(/Important differences/i);
    expect(record.relatedWork?.some((r) => r.sourceType === "board")).toBe(
      true,
    );
    for (const turn of turns) {
      expect(record.summary).not.toBe(turn.text);
      expect(record.finalRecommendation).not.toBe(turn.text);
    }
    expect(record.summary).not.toMatch(/reached consensus/i);
  });
});
