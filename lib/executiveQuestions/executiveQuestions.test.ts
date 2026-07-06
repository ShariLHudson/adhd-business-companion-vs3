import { describe, expect, it } from "vitest";

import {
  EXECUTIVE_QUESTION_CATALOG,
  buildExecutiveQuestion,
  composeExecutiveAnswer,
  executiveQuestionService,
  filterExecutiveQuestions,
  listCatalogByCategory,
  listQuestionRelationships,
  relationshipsForQuestion,
} from "./index";

describe("Executive Questions™ Framework", () => {
  it("question catalog defines all eight categories", () => {
    const categories = new Set(EXECUTIVE_QUESTION_CATALOG.map((q) => q.category));
    expect(categories.has("product")).toBe(true);
    expect(categories.has("customers")).toBe(true);
    expect(categories.has("content")).toBe(true);
    expect(categories.has("business")).toBe(true);
    expect(categories.has("technology")).toBe(true);
    expect(categories.has("founder")).toBe(true);
    expect(categories.has("marketing")).toBe(true);
    expect(categories.has("team")).toBe(true);
    expect(EXECUTIVE_QUESTION_CATALOG.length).toBeGreaterThanOrEqual(30);
  });

  it("question builder enriches definitions with relationships", () => {
    const built = buildExecutiveQuestion(
      EXECUTIVE_QUESTION_CATALOG.find((q) => q.id === "product-build-next")!,
    );
    expect(built.title).toBe("What should we build next?");
    expect(built.relationshipCount).toBeGreaterThan(0);
    expect(built.requiredEvidence.length).toBeGreaterThan(0);
    expect(built.possibleSources.length).toBeGreaterThan(0);
  });

  it("relationships connect questions to missions and products loosely", () => {
    const rels = relationshipsForQuestion("product-build-next");
    expect(rels.some((r) => r.relatedKind === "mission")).toBe(true);
    expect(listQuestionRelationships().length).toBeGreaterThan(5);
  });

  it("composeExecutiveAnswer assembles sample answer with evidence", () => {
    const composed = composeExecutiveAnswer("product-build-next");
    expect(composed).not.toBeNull();
    expect(composed!.answer.summary.headline).toContain("Listening Rooms");
    expect(composed!.answer.evidence.length).toBeGreaterThan(0);
    expect(composed!.answer.recommendedActions.length).toBeGreaterThan(0);
    expect(composed!.answer.confidence.level).toBeTruthy();
  });

  it("content question sample matches decision fatigue series example", () => {
    const composed = composeExecutiveAnswer("content-create-next");
    expect(composed!.answer.summary.headline).toContain("Decision fatigue");
    expect(composed!.answer.supportingResearch.length).toBeGreaterThan(0);
  });

  it("filtering supports today, mission, and priority", () => {
    const today = filterExecutiveQuestions(EXECUTIVE_QUESTION_CATALOG, {
      timeHorizon: "today",
    });
    expect(today.length).toBeGreaterThan(0);

    const mission = filterExecutiveQuestions(EXECUTIVE_QUESTION_CATALOG, {
      missionId: "listening-rooms",
    });
    expect(mission.some((q) => q.id === "product-build-next")).toBe(true);

    const critical = filterExecutiveQuestions(EXECUTIVE_QUESTION_CATALOG, {
      priorityLevel: "critical",
    });
    expect(critical.every((q) => q.priority.level === "critical")).toBe(true);
  });

  it("priority ranking orders recommended questions", () => {
    const recommended = executiveQuestionService.listRecommendedQuestions();
    expect(recommended.length).toBeGreaterThan(0);
    for (let i = 1; i < recommended.length; i++) {
      expect(recommended[i - 1].priority.score).toBeGreaterThanOrEqual(
        recommended[i].priority.score,
      );
    }
  });

  it("public API lists and retrieves questions by category", () => {
    const product = executiveQuestionService.getQuestionsByCategory("product");
    expect(product.length).toBe(4);
    expect(listCatalogByCategory("team").length).toBe(3);
    expect(executiveQuestionService.getQuestion("founder-attention-today")?.category).toBe(
      "founder",
    );
    expect(executiveQuestionService.listQuestions().length).toBe(
      EXECUTIVE_QUESTION_CATALOG.length,
    );
  });

  it("placeholder answer exists for questions without sample data", () => {
    const composed = composeExecutiveAnswer("technology-products-launched");
    expect(composed!.answer.summary.headline).toContain("pending");
    expect(composed!.answer.recommendedActions.length).toBeGreaterThan(0);
  });
});
