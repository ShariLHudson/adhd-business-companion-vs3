import { describe, expect, it } from "vitest";
import { CompanionBrain } from "@/lib/companionBrain";
import { mapFixtureToCompanionMemory } from "@/lib/planMyDay/companionBrainClient/mapFixtureToMemory";
import { NORMAL_TUESDAY } from "@/lib/planMyDay/dailyCompanionCycle/fixtures/simulations";
import {
  buildMorningResultsPresentation,
  parseMindCapture,
} from "./morningConversation";

describe("morningConversation", () => {
  it("parses lines and list-like captures", () => {
    expect(
      parseMindCapture("Finish ecosystem\nCall the doctor\n- Grocery shopping"),
    ).toEqual(["Finish ecosystem", "Call the doctor", "Grocery shopping"]);
  });

  it("builds priorities from judgment with remainder buckets", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const presentation = buildMorningResultsPresentation(
      judgment,
      "Finish ecosystem\nCall doctor\nGrocery\nLaundry\nTaxes",
    );

    expect(presentation.introLines.length).toBeGreaterThan(0);
    expect(presentation.priorities.length).toBeGreaterThan(0);
    expect(presentation.directionQuestion).toMatch(/right direction/i);
    expect(
      presentation.laterThisWeek.length + presentation.canWait.length,
    ).toBeGreaterThan(0);
  });
});
