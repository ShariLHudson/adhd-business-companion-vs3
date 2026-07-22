/**
 * Spec 133 — Explore Ideas discovery (search, categories, recommendations, preview).
 */

import { describe, expect, it } from "vitest";
import { EXPLORE_IDEA_CATEGORY_CARDS } from "./categories";
import { buildExploreIdeaPreview } from "./ideaPreview";
import {
  buildExploreIdeaRecommendations,
  recentLabelsFromWorkspaces,
} from "./recommendations";
import { listExploreIdeaResults, queryExploreIdeas } from "./search";
import { EXPLORE_IDEA_SOURCE_CHIPS } from "./types";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";

describe("Spec 133 — Explore Ideas search model", () => {
  it("lists unified catalog results without architecture jargon", () => {
    const results = listExploreIdeaResults();
    expect(results.length).toBeGreaterThan(5);
    expect(results.every((r) => r.label && r.catalogItem)).toBe(true);
    expect(JSON.stringify(results)).not.toMatch(/Work Type|Blueprint Registry/i);
  });

  it("one search returns one flat result list", () => {
    const results = queryExploreIdeas({ search: "email" });
    expect(results.some((r) => /email/i.test(r.label))).toBe(true);
    expect(results.every((r) => r.id && r.source)).toBe(true);
  });

  it("category click uses the same result list as search", () => {
    const bySearch = queryExploreIdeas({ search: "email" });
    const byCategory = queryExploreIdeas({ categoryId: "writing" });
    expect(byCategory.length).toBeGreaterThan(0);
    expect(bySearch.length).toBeGreaterThan(0);
    // Same model shape
    expect(byCategory[0]).toHaveProperty("catalogItem");
    expect(bySearch[0]).toHaveProperty("catalogItem");
  });

  it("events category prefers event-shaped ideas", () => {
    const results = queryExploreIdeas({ categoryId: "events" });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((r) =>
        /event|workshop|retreat|webinar/i.test(r.label),
      ),
    ).toBe(true);
  });

  it("source chips are explained — never bare Spark alone", () => {
    expect(EXPLORE_IDEA_SOURCE_CHIPS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "spark_recommended",
          label: "Spark Recommended",
          explanation: "Built by Spark Estate",
        }),
        expect.objectContaining({
          id: "company",
          explanation: "Created by your organization",
        }),
        expect.objectContaining({
          id: "personal",
          explanation: "Created by you",
        }),
        expect.objectContaining({
          id: "recent",
          explanation: "Used recently",
        }),
      ]),
    );
  });

  it("has seven outcome category cards — not framework family tabs", () => {
    expect(EXPLORE_IDEA_CATEGORY_CARDS.map((c) => c.id)).toEqual([
      "marketing",
      "planning",
      "writing",
      "business",
      "events",
      "learning",
      "relationships",
    ]);
  });
});

describe("Spec 133 — recommendations and preview", () => {
  it("recommends from marketing context without generic pad beyond 3", () => {
    const recs = buildExploreIdeaRecommendations({
      workspaces: [
        {
          id: "w1",
          title: "Spring campaign",
          kindLabel: "Marketing Plan",
          phaseLabel: "Planning",
          updatedAt: new Date().toISOString(),
          eventRecordId: "e1",
          creationRecordId: "c1",
          projectHomeId: null,
          nextAction: "Continue",
        },
      ],
      suggestionContext: {
        kindLabel: "Marketing Plan",
        workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
      },
    });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(3);
    expect(recs[0]?.reason.length).toBeGreaterThan(8);
  });

  it("recent labels come from active workspaces", () => {
    expect(
      recentLabelsFromWorkspaces([
        {
          id: "a",
          title: "A",
          kindLabel: "Email",
          phaseLabel: "Writing",
          updatedAt: "2026-07-21T12:00:00.000Z",
          eventRecordId: "e1",
          creationRecordId: "c1",
          projectHomeId: null,
          nextAction: "Continue",
        },
        {
          id: "b",
          title: "B",
          kindLabel: "Email",
          phaseLabel: "Writing",
          updatedAt: "2026-07-20T12:00:00.000Z",
          eventRecordId: "e2",
          creationRecordId: "c2",
          projectHomeId: null,
          nextAction: "Continue",
        },
      ]),
    ).toEqual(["Email"]);
  });

  it("preview includes Who for, Time, Difficulty, Expected outcome, Best when", () => {
    const idea = queryExploreIdeas({ search: "email" }).find(
      (r) => r.label === "Email",
    );
    expect(idea).toBeTruthy();
    const preview = buildExploreIdeaPreview(idea!);
    expect(preview.whoFor).toBeTruthy();
    expect(preview.time).toBeTruthy();
    expect(preview.difficulty).toBeTruthy();
    expect(preview.expectedOutcome).toBeTruthy();
    expect(preview.bestWhen).toBeTruthy();
  });

  it("marks recent labels in query results", () => {
    const results = queryExploreIdeas({
      search: "email",
      recentLabels: ["Email"],
    });
    const email = results.find((r) => r.label === "Email");
    expect(email?.source).toBe("recent");
  });
});
