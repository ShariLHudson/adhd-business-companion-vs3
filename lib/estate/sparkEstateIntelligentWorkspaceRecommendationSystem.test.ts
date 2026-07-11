import { describe, expect, it } from "vitest";

import {
  assessSparkEstateWorkspaceComplexity,
  assessSparkEstateWorkspaceRecommendationCompliance,
  buildSparkEstateWorkspaceRecommendationLanguage,
  formatSparkEstateWorkspaceRecommendationReport,
  getSparkEstateWorkspaceMemoryPreferences,
  recordSparkEstateWorkspaceChoice,
  resolveSparkEstateWorkspaceRecommendation,
  SPARK_ESTATE_WORKSPACE_LANGUAGE_AVOID,
  SPARK_ESTATE_WORKSPACE_LANGUAGE_USE,
  SPARK_ESTATE_WORKSPACE_RECOMMENDATION_PRINCIPLE,
  SPARK_ESTATE_WORKSPACE_RECOMMENDATION_TRIGGERS,
  SPARK_ESTATE_WORKSPACE_SELECTION_FLOW,
  SPARK_ESTATE_WORKSPACE_SUCCESS_TEST,
  SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE,
  verifySparkEstateIntelligentWorkspaceRecommendationSystem,
} from "./sparkEstateIntelligentWorkspaceRecommendationSystem";

describe("sparkEstateIntelligentWorkspaceRecommendationSystem", () => {
  it("defines guide-not-force principle and intelligence vs workspace distinction", () => {
    expect(SPARK_ESTATE_WORKSPACE_RECOMMENDATION_PRINCIPLE).toContain("not force");
    expect(SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE.intelligence.examples).toHaveLength(4);
    expect(SPARK_ESTATE_WORKSPACE_VS_INTELLIGENCE.workspace.examples).toHaveLength(4);
    expect(SPARK_ESTATE_WORKSPACE_RECOMMENDATION_TRIGGERS).toHaveLength(4);
    expect(SPARK_ESTATE_WORKSPACE_SELECTION_FLOW).toHaveLength(7);
  });

  it("recommends Chamber for sales funnel with two clear options", () => {
    const recommendation = resolveSparkEstateWorkspaceRecommendation({
      text: "I need to create a sales funnel.",
    });
    expect(recommendation.shouldRecommend).toBe(true);
    expect(recommendation.complexity).toBe("complex");
    expect(recommendation.recommendedWorkspace?.id).toBe("chamber");
    expect(recommendation.openingLine).toContain("two options");
    expect(recommendation.stayOption.label).toBe("Stay where you are");
    expect(recommendation.intelligencesNeeded).toContain("marketing");
    expect(recommendation.useUniversalCreationJourney).toBe(true);

    const language = buildSparkEstateWorkspaceRecommendationLanguage(recommendation);
    expect(language).toContain(SPARK_ESTATE_WORKSPACE_LANGUAGE_USE[0].replace("...", ""));
    expect(language).not.toContain(SPARK_ESTATE_WORKSPACE_LANGUAGE_AVOID[0]);
  });

  it("recommends template workspace for reusable templates", () => {
    const recommendation = resolveSparkEstateWorkspaceRecommendation({
      text: "I need a client onboarding template.",
    });
    expect(recommendation.shouldRecommend).toBe(true);
    expect(recommendation.recommendedWorkspace?.id).toBe("templates");
    expect(recommendation.recommendedWorkspace?.section).toBe("templates-library");
  });

  it("recommends Chamber for workshop planning", () => {
    const recommendation = resolveSparkEstateWorkspaceRecommendation({
      text: "I need to plan my workshop.",
    });
    expect(recommendation.shouldRecommend).toBe(true);
    expect(recommendation.recommendedWorkspace?.id).toBe("chamber");
    expect(assessSparkEstateWorkspaceComplexity("I need to plan my workshop.")).toBe(
      "complex",
    );
  });

  it("aligns with routing, rooms, creation journey, and memory preferences", () => {
    const compliance = assessSparkEstateWorkspaceRecommendationCompliance();
    expect(compliance.intelligenceRoutingBridgeReady).toBe(true);
    expect(compliance.roomIntelligenceBridgeReady).toBe(true);
    expect(compliance.creationJourneyBridgeReady).toBe(true);
    expect(compliance.languageRulesReady).toBe(true);
    expect(compliance.memberExperienceRulesReady).toBe(true);

    const stayChoice = recordSparkEstateWorkspaceChoice({ choice: "stay" });
    expect(stayChoice.prefersConversation).toBe(true);
    expect(getSparkEstateWorkspaceMemoryPreferences()?.workspaceStyle).toBe("conversation");

    const guidedChoice = recordSparkEstateWorkspaceChoice({
      choice: "recommended",
      workspaceId: "chamber",
    });
    expect(guidedChoice.prefersGuidedRooms).toBe(true);
    expect(guidedChoice.workspaceStyle).toBe("chamber");
  });

  it("verifies success test and formats a readable report", () => {
    const verification = verifySparkEstateIntelligentWorkspaceRecommendationSystem();
    expect(verification.workspaces).toBe(5);
    expect(verification.recommendationReady).toBe(true);
    expect(verification.choicePreserved).toBe(true);
    expect(SPARK_ESTATE_WORKSPACE_SUCCESS_TEST).toContain("still get to decide");

    const report = formatSparkEstateWorkspaceRecommendationReport();
    expect(report).toContain("Selection flow");
    expect(report).toContain("Chamber of Momentum");
    expect(report).toContain("Compliance checks");
  });
});
