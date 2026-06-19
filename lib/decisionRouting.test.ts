import { describe, expect, it } from "vitest";
import { activitiesForCategory } from "./companionActivities";
import {
  chatPhraseOffersDecisionCompass,
  decisionCompassOpensSplitWorkspace,
  guidedExerciseOpensDecisionCompass,
  helpMeRightNowDecisionMenuItem,
  helpMeRightNowOpensDecisionCompass,
  howDoIDecisionSearchOpensCompass,
  isDecisionCompassActivityId,
  isQuickTwoOptionActivityId,
  noHelpMeRightNowItemRoutesToQuickTwoOption,
  quickTwoOptionFirstHourStepText,
  quickTwoOptionIsLegacyStepHelper,
} from "./decisionRouting";
import { HELP_ME_RIGHT_NOW_MENU } from "./focusToolDefinitions";
import { guidedExerciseMenu } from "./guidedExercises";
import { homeResumeItemFromActivityId } from "./homeResumeItem";

describe("decisionRouting", () => {
  it("1. Help Me Right Now decision opens ADHD Decision Compass", () => {
    const item = helpMeRightNowDecisionMenuItem();
    expect(item).toBeDefined();
    expect(item?.title).toBe("ADHD Decision Compass");
    expect(item?.activityId).toBe("decision-compass");
    expect(helpMeRightNowOpensDecisionCompass(item!)).toBe(true);
  });

  it("2. Help Me Right Now does not open two-option", () => {
    expect(
      HELP_ME_RIGHT_NOW_MENU.some((row) => row.activityId === "two-option"),
    ).toBe(false);
    for (const row of HELP_ME_RIGHT_NOW_MENU) {
      if (row.title.toLowerCase().includes("decision")) {
        expect(row.activityId).toBe("decision-compass");
      }
    }
  });

  it("3. Guided Exercises shows Compass and Quick Two Option Choice as separate tools", () => {
    const menu = guidedExerciseMenu();
    const compass = menu.find((row) => row.activityId === "decision-compass");
    const quick = menu.find((row) => row.activityId === "two-option");
    expect(compass?.title).toBe("ADHD Decision Compass");
    expect(quick?.title).toBe("Quick Two Option Choice");
    expect(guidedExerciseOpensDecisionCompass("decision-compass")).toBe(true);
    expect(guidedExerciseOpensDecisionCompass("two-option")).toBe(false);
    const compassIdx = menu.findIndex((r) => r.activityId === "decision-compass");
    const quickIdx = menu.findIndex((r) => r.activityId === "two-option");
    expect(compassIdx).toBeGreaterThanOrEqual(0);
    expect(quickIdx).toBeGreaterThan(compassIdx);
  });

  it("4. Decision Compass opens split workspace with visual canvas", () => {
    expect(decisionCompassOpensSplitWorkspace()).toBe(true);
    expect(isDecisionCompassActivityId("decision-compass")).toBe(true);
  });

  it("5. Quick Two Option Choice opens legacy 4-step helper", () => {
    expect(quickTwoOptionIsLegacyStepHelper()).toBe(true);
    const legacy = quickTwoOptionFirstHourStepText();
    expect(legacy).toMatch(/first hour/i);
  });

  it("6. How Do I decision search opens ADHD Decision Compass", () => {
    const terms = [
      "decision",
      "decision maker",
      "help me decide",
      "compare options",
      "choose between",
      "should I hire or wait",
      "option A or B",
    ];
    for (const term of terms) {
      expect(howDoIDecisionSearchOpensCompass(term), term).toBe(true);
    }
  });

  it("7. Chat decision request offers ADHD Decision Compass", () => {
    const phrases = [
      "I need help deciding",
      "I need to make a decision",
      "help me choose between these",
      "compare two options",
      "should I launch now or wait",
      "open decision compass",
    ];
    for (const phrase of phrases) {
      expect(chatPhraseOffersDecisionCompass(phrase), phrase).toBe(true);
    }
  });

  it("8. Resume distinguishes decision-compass from two-option", () => {
    const compass = homeResumeItemFromActivityId(
      "decision-compass",
      "2026-06-12T12:00:00.000Z",
    );
    const quick = homeResumeItemFromActivityId(
      "two-option",
      "2026-06-12T12:00:00.000Z",
    );
    expect(compass?.kind).toBe("decision-compass");
    expect(quick?.kind).toBe("quick-two-option");
    expect(compass?.kind).not.toBe(quick?.kind);
    expect(isQuickTwoOptionActivityId("two-option")).toBe(true);
  });

  it("9. No menu item named quick-decision-compass points to two-option", () => {
    expect(noHelpMeRightNowItemRoutesToQuickTwoOption()).toBe(true);
    expect(
      HELP_ME_RIGHT_NOW_MENU.some((row) => row.id === "quick-decision-compass"),
    ).toBe(false);
  });

  it("Decide category lists Compass above Quick Two Option Choice", () => {
    const decide = activitiesForCategory("decide");
    const compassIdx = decide.findIndex((a) => a.id === "decision-compass");
    const quickIdx = decide.findIndex((a) => a.id === "two-option");
    expect(compassIdx).toBeGreaterThanOrEqual(0);
    expect(quickIdx).toBeGreaterThan(compassIdx);
    expect(decide[compassIdx]?.title).toBe("ADHD Decision Compass");
    expect(decide[quickIdx]?.title).toBe("Quick Two Option Choice");
  });
});
