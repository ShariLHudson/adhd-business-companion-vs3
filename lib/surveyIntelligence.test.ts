import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SURVEY_TEMPLATES,
  SITUATION_SURVEY_MAP,
  assistantOfferedSurveyCreate,
  buildSurveyCreationInput,
  evaluateSurveyIntelligence,
  evaluateSurveyResourceCandidate,
  formatSurveyDraftContent,
  getSurveyFounderMetrics,
  inferSurveyTypeFromAssistantOffer,
  isExplicitSurveyCreateRequest,
  questionsForSurveyLength,
  recordSurveyCreated,
  surveyIntelligenceHintForChat,
  surveyOfferLineForTemplate,
  surveyTypeForSituationId,
} from "./surveyIntelligence";

describe("surveyIntelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
  });

  it("selects Product Validation Survey for market-buying uncertainty", () => {
    const result = evaluateSurveyIntelligence({
      userText: "I don't know if customers would buy this",
    });

    expect(result.surveyType).toBe("product_validation");
    expect(result.template?.name).toBe("Product Validation Survey");
    expect(result.needsSurvey).toBe(true);
  });

  it("matches situation atlas to survey type", () => {
    expect(surveyTypeForSituationId("product-expansion-uncertainty")).toBe(
      "product_validation",
    );
    expect(SITUATION_SURVEY_MAP["pricing-guilt"]).toBe("pricing_feedback");
    expect(SITUATION_SURVEY_MAP["niche-confusion"]).toBe("discovery_research");

    const result = evaluateSurveyIntelligence({
      userText: "I'm still thinking it through",
      situationId: "product-expansion-uncertainty",
      decisionType: "business_expansion",
      discoveryComplete: true,
    });

    expect(result.surveyType).toBe("product_validation");
    expect(result.situationId).toBe("product-expansion-uncertainty");
  });

  it("defers Create routing during business expansion discovery", () => {
    const result = evaluateSurveyIntelligence({
      userText: "I want to add a new product line",
      decisionType: "business_expansion",
      discoveryComplete: false,
    });

    expect(result.surveyType).toBe("product_validation");
    expect(result.shouldDeferSurvey).toBe(true);
    expect(result.shouldOfferCreate).toBe(false);
    expect(surveyIntelligenceHintForChat(result)).toMatch(/DO NOT offer Create/i);
  });

  it("routes to Create when survey confidence is ready", () => {
    const result = evaluateSurveyIntelligence({
      userText: "I don't know if customers would buy this new offer",
      decisionType: "business_expansion",
      discoveryComplete: true,
      situationId: "product-expansion-uncertainty",
    });

    expect(result.shouldOfferCreate).toBe(true);
    expect(result.offerReady).toBe(true);
    expect(result.resource?.id).toBe("survey_template");
  });

  it("generates Product Validation Survey with pre-populated questions", () => {
    const template = SURVEY_TEMPLATES.product_validation;
    const draft = formatSurveyDraftContent(template, "standard");
    const input = buildSurveyCreationInput(template, "standard");

    expect(input.itemType).toBe("Form");
    expect(input.draftContent).toMatch(/Product Validation Survey/);
    expect(input.draftContent).toMatch(
      /Which of our current products do you use most often\?/,
    );
    expect(input.draftContent).toMatch(
      /If we introduced a new product that offered additional benefits/,
    );
    expect(input.draftContent.length).toBeGreaterThan(200);
    expect(questionsForSurveyLength(template, "quick")).toHaveLength(5);
    expect(draft.split(/\d+\./).length).toBeGreaterThan(6);
  });

  it("generates Pricing Feedback Survey focused on value and willingness to pay", () => {
    const result = evaluateSurveyIntelligence({
      userText: "I'm not sure about raising my prices and willingness to pay",
    });

    expect(result.surveyType).toBe("pricing_feedback");
    const draft = formatSurveyDraftContent(
      SURVEY_TEMPLATES.pricing_feedback,
      "standard",
    );
    expect(draft).toMatch(/willingness to pay|value you get/i);
    expect(draft).toMatch(/great deal/i);
  });

  it("generates Discovery Research Survey for audience confusion", () => {
    const result = evaluateSurveyIntelligence({
      userText: "I need market research on customer pain points",
      situationId: "niche-confusion",
    });

    expect(result.surveyType).toBe("discovery_research");
    expect(result.recommendedLength).toBe("deep");
    const draft = formatSurveyDraftContent(
      SURVEY_TEMPLATES.discovery_research,
      "deep",
    );
    expect(draft).toMatch(/biggest challenge/i);
    expect(draft).toMatch(/unmet need/i);
  });

  it("builds permission-first offer copy", () => {
    const line = surveyOfferLineForTemplate(SURVEY_TEMPLATES.product_validation);
    expect(line).toMatch(/customer feedback|real input/i);
    expect(line).toMatch(/Product Validation Survey/i);
    expect(line).toMatch(/Would you like/i);
  });

  it("detects explicit survey create requests and assistant offers", () => {
    expect(isExplicitSurveyCreateRequest("create a product validation survey")).toBe(
      true,
    );
    expect(
      assistantOfferedSurveyCreate(
        "Would you like to create a Product Validation Survey?",
      ),
    ).toBe(true);
    expect(
      inferSurveyTypeFromAssistantOffer(
        "Would you like to create a Pricing Feedback Survey?",
      ),
    ).toBe("pricing_feedback");
  });

  it("evaluates survey resource candidate for knowledge graph", () => {
    const resource = evaluateSurveyResourceCandidate({
      surveyType: "product_validation",
      confidence: 0.8,
      shouldDeferSurvey: false,
      discoveryComplete: true,
    });

    expect(resource?.offerReady).toBe(true);
    expect(resource?.label).toBe("Product Validation Survey");
  });

  it("tracks founder intelligence survey metrics", () => {
    recordSurveyCreated("product_validation", { influencedDecision: true });
    const metrics = getSurveyFounderMetrics();
    expect(metrics.surveysCreated).toBe(1);
    expect(metrics.byType.product_validation).toBe(1);
    expect(metrics.decisionsInfluenced).toBe(1);
  });
});
