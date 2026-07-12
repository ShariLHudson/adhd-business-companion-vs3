/**
 * Director relationships — registry, engine, metadata.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { BOARD_DIRECTOR_IDS } from "@/lib/board/types";
import {
  buildBoardDiscussionSupportSnapshot,
  getBoardDirectorMetadata,
  getDirectRecommendationsForDirector,
  getDirectorRelationshipProfile,
  listDirectorRelationshipProfiles,
  recommendDirectorsFromRelationships,
} from "@/lib/board/relationships";
import { suggestDirectorsFromBoardRelationships } from "@/lib/board/boardReview";

describe("Director relationship registry", () => {
  it("defines a profile for every Director", () => {
    expect(listDirectorRelationshipProfiles()).toHaveLength(
      BOARD_DIRECTOR_IDS.length,
    );
    for (const id of BOARD_DIRECTOR_IDS) {
      const profile = getDirectorRelationshipProfile(id);
      expect(profile).toBeTruthy();
      expect(profile!.oftenWorksWith.length).toBeGreaterThan(0);
      expect(profile!.providesBalance.length).toBeGreaterThan(0);
      expect(profile!.recommends.length).toBeGreaterThan(0);
      expect(profile!.inviteForDecisions.length).toBeGreaterThan(0);
      expect(profile!.discussionAffinity.speakingOrderBias).toBeGreaterThanOrEqual(
        0,
      );
    }
  });

  it("Thomas recommends Financial Stewardship and Risk & Resilience", () => {
    expect(getDirectRecommendationsForDirector("board-chair")).toEqual([
      "financial-stewardship",
      "risk-resilience",
    ]);
  });

  it("Technology recommends Growth and Operations", () => {
    expect(getDirectRecommendationsForDirector("technology-future")).toEqual([
      "growth-opportunity",
      "operations-capacity",
    ]);
  });

  it("Devil's Advocate recommends Risk and Chair", () => {
    expect(getDirectRecommendationsForDirector("devils-advocate")).toEqual([
      "risk-resilience",
      "board-chair",
    ]);
  });
});

describe("Relationship recommendation engine", () => {
  it("ranks from seed Director recommends without auto-including anyone", () => {
    const result = recommendDirectorsFromRelationships({
      seedDirectorIds: ["board-chair"],
      excludeDirectorIds: ["board-chair"],
      limit: 4,
    });
    expect(result.recommendations.map((r) => r.directorId)).toEqual(
      expect.arrayContaining(["financial-stewardship", "risk-resilience"]),
    );
    expect(result.recommendations.every((r) => r.directorId !== "board-chair")).toBe(
      true,
    );
  });

  it("uses decision cues for invite-for-decision rules", () => {
    const tech = recommendDirectorsFromRelationships({
      decisionText: "Should we invest in a new automation platform?",
      seedDirectorIds: ["technology-future"],
      excludeDirectorIds: ["technology-future"],
      limit: 5,
    });
    const ids = tech.recommendations.map((r) => r.directorId);
    expect(ids).toEqual(
      expect.arrayContaining(["growth-opportunity", "operations-capacity"]),
    );
  });

  it("never auto-adds Devil's Advocate — only offers", () => {
    const result = recommendDirectorsFromRelationships({
      decisionText: "We are launching a new offer with a big pricing change.",
      seedDirectorIds: ["board-chair"],
      excludeDirectorIds: ["board-chair"],
    });
    expect(result.recommendations.some((r) => r.directorId === "devils-advocate")).toBe(
      false,
    );
    expect(result.offerDevilsAdvocate).toBe(true);
  });
});

describe("Director metadata + discussion support", () => {
  it("combines definition and relationships", () => {
    const meta = getBoardDirectorMetadata("board-chair");
    expect(meta?.director.name).toBe("Thomas Ellison");
    expect(meta?.relationships.recommends).toEqual([
      "financial-stewardship",
      "risk-resilience",
    ]);
  });

  it("builds speaking order for future Board discussions", () => {
    const snap = buildBoardDiscussionSupportSnapshot([
      "devils-advocate",
      "board-chair",
      "founder-advocate",
    ]);
    expect(snap.speakingOrder[0]).toBe("board-chair");
    expect(snap.speakingOrder).toContain("devils-advocate");
  });
});

describe("Board Review suggestion compatibility", () => {
  it("still suggests from relationships without UI changes", () => {
    const suggestions = suggestDirectorsFromBoardRelationships(
      ["board-chair"],
      "board-chair",
    );
    expect(suggestions).toEqual(
      expect.arrayContaining(["financial-stewardship", "risk-resilience"]),
    );
  });
});
