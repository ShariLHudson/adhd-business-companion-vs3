import { describe, expect, it } from "vitest";

import {
  composeFounderExecutiveAnswer,
  getFounderDecisionQuestions,
  getFounderExecutiveQuestionsBundle,
  getFounderMissionQuestions,
  getFounderRecommendedQuestion,
  getFounderTodaysQuestions,
} from "./executiveQuestionsBridge";

describe("Founder Executive Questions bridge", () => {
  it("returns today's questions without UI wiring", () => {
    const today = getFounderTodaysQuestions();
    expect(today.length).toBeGreaterThan(0);
    expect(today.some((q) => q.category === "founder")).toBe(true);
  });

  it("returns recommended question with composed sample answer", () => {
    const recommended = getFounderRecommendedQuestion();
    expect(recommended).not.toBeNull();
    expect(recommended!.answer.summary.headline).toBeTruthy();
    expect(recommended!.question.id).toBeTruthy();
  });

  it("mission and decision question helpers scope correctly", () => {
    const mission = getFounderMissionQuestions("listening-rooms");
    expect(mission.some((q) => q.id === "product-build-next")).toBe(true);

    const decisions = getFounderDecisionQuestions();
    expect(decisions.some((q) => q.id === "founder-decision-waiting")).toBe(true);
  });

  it("bundle assembles founder executive question surfaces", () => {
    const bundle = getFounderExecutiveQuestionsBundle();
    expect(bundle.product).toBe("founder");
    expect(bundle.todaysQuestions.length).toBeGreaterThan(0);
    expect(bundle.missionQuestions.length).toBeGreaterThan(0);
    expect(bundle.recommendedQuestion).not.toBeNull();
  });

  it("composeFounderExecutiveAnswer uses founder context", () => {
    const answer = composeFounderExecutiveAnswer("founder-mission-forward");
    expect(answer?.answer.relatedMissions.length).toBeGreaterThan(0);
  });
});
