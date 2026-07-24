/**
 * Thomas Ellison — first visible Board Director (MVP).
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import {
  CHAMBER_MEMBER_IDS,
  CHAMBER_MEMBERS,
} from "@/lib/chamber/chamberMemberRegistry";
import {
  BOARD_DIRECTORS,
  getBoardDirectorById,
  getDirectorAccordionSections,
  listVisibleBoardDirectors,
  resolveBoardDirectorAlias,
  THOMAS_ELLISON_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  toggleDirectorAccordion,
} from "@/lib/board";
import {
  answerIntakeStep,
  createBoardDirectorDiscussion,
  createEmptyBoardDirectorIntake,
  ensureChairInIntake,
  isIntakeComplete,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import {
  addDirectorToBoardReview,
  createEmptyBoardReviewState,
  isDirectorIncludedInBoardReview,
  removeDirectorFromBoardReview,
} from "@/lib/board/boardReview";

describe("Thomas Ellison — visible Board Director", () => {
  it("exists in the Board registry with Board ID board-chair", () => {
    const thomas = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);
    expect(thomas?.id).toBe("board-chair");
    expect(thomas?.name).toBe("Thomas Ellison");
    expect(thomas?.boardRole).toBe("Chair of the Board");
    expect(thomas?.isCoreDirector).toBe(true);
    expect(thomas?.portraitPath).toBe(
      "/board-of-directors/thomas-ellison-portrait.png",
    );
  });

  it("resolves thomas-ellison alias to the Board Chair", () => {
    expect(resolveBoardDirectorAlias("thomas-ellison")?.id).toBe("board-chair");
    expect(resolveBoardDirectorAlias("Thomas Ellison")?.id).toBe("board-chair");
  });

  it("does not use a Chamber ID", () => {
    expect(CHAMBER_MEMBER_IDS).not.toContain("board-chair");
    expect(CHAMBER_MEMBER_IDS).not.toContain("thomas-ellison");
    const thomas = getBoardDirectorById("board-chair")!;
    expect(thomas.portraitPath?.startsWith("/chamber")).toBe(false);
    expect(thomas.portraitPath?.startsWith("/momentum-chamber")).toBe(false);
  });

  it("is among the visible Directors in Meet the Directors", () => {
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toHaveLength(12);
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("board-chair");
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("strategy-director");
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("financial-stewardship");
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("customer-market");
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("growth-opportunity");
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("risk-resilience");
    const visible = listVisibleBoardDirectors();
    expect(visible.map((d) => d.id)).toEqual([
      "board-chair",
      "vice-chair",
      "founder-advocate",
      "strategy-director",
      "financial-stewardship",
      "operations-capacity",
      "customer-market",
      "growth-opportunity",
      "risk-resilience",
      "technology-future",
      "values-trust",
      "devils-advocate",
    ]);
    expect(BOARD_DIRECTORS.length).toBe(12);
  });

  it("does not appear in Chamber roster", () => {
    const chamberIds = CHAMBER_MEMBERS.map((m) => m.id);
    const chamberNames = CHAMBER_MEMBERS.map((m) => m.displayName.toLowerCase());
    expect(chamberIds).not.toContain("board-chair");
    expect(chamberNames.some((n) => n.includes("thomas ellison"))).toBe(false);
  });

  it("carries approved purpose, philosophy, lenses, and welcome", () => {
    const thomas = getBoardDirectorById("board-chair")!;
    expect(thomas.purpose).toContain("long-term strength");
    expect(thomas.philosophy).toMatch(/today.s opportunity/);
    expect(thomas.signature).toBe(
      "Helping founders build businesses worth keeping.",
    );
    expect(thomas.openingMessage).toContain("long-term success");
    expect(thomas.decisionLens).toEqual([
      "Long-Term Direction",
      "Board Alignment",
      "Clear Recommendation",
    ]);
  });

  it("accordion sections include all seven profile panels", () => {
    const sections = getDirectorAccordionSections(
      getBoardDirectorById("board-chair")!,
    );
    expect(sections.map((s) => s.title)).toEqual([
      "How I Think",
      "What I Protect",
      "Questions I'll Ask",
      "When You'll Want Me",
      "You'll enjoy working with me if…",
      "A Decision I Helped Guide",
      "How I Work With Founders",
    ]);
    expect(sections.every((s) => s.preview.length > 0)).toBe(true);
    expect(toggleDirectorAccordion(null, "how-i-think")).toBe("how-i-think");
    expect(toggleDirectorAccordion("how-i-think", "what-i-protect")).toBe(
      "what-i-protect",
    );
  });
});

describe("Board Review selection — Board IDs only", () => {
  it("adds and removes Thomas without starting discussion", () => {
    let review = createEmptyBoardReviewState();
    review = addDirectorToBoardReview(review, "board-chair");
    expect(isDirectorIncludedInBoardReview(review, "board-chair")).toBe(true);
    expect(review.reviewStarted).toBe(false);
    review = removeDirectorFromBoardReview(review, "board-chair");
    expect(isDirectorIncludedInBoardReview(review, "board-chair")).toBe(false);
  });

  it("keeps Board selection IDs separate from Chamber IDs", () => {
    const review = addDirectorToBoardReview(
      createEmptyBoardReviewState(),
      "board-chair",
    );
    for (const id of review.selectedDirectorIds) {
      expect(CHAMBER_MEMBER_IDS).not.toContain(id);
    }
  });
});

describe("Board Director discussion intake", () => {
  it("keeps Chair optional when none selected", () => {
    const empty = createEmptyBoardDirectorIntake([]);
    expect(empty.chairConfirmed).toBe(false);
    const stillOptional = ensureChairInIntake(empty);
    expect(stillOptional.directorIds).not.toContain("board-chair");
    expect(stillOptional.chairConfirmed).toBe(false);
  });

  it("asks one question at a time and only includes selected Directors", () => {
    let intake = createEmptyBoardDirectorIntake(["board-chair"]);
    expect(isIntakeComplete(intake)).toBe(false);
    intake = answerIntakeStep(intake, "Whether to expand into a new offer");
    intake = answerIntakeStep(intake, "Cash is tight and timing matters");
    intake = answerIntakeStep(intake, "Expand now, wait, or pilot");
    intake = answerIntakeStep(intake, "Capacity and brand risk");
    expect(isIntakeComplete(intake)).toBe(true);

    const record = createBoardDirectorDiscussion(intake);
    expect(record.directorIds).toEqual(["board-chair"]);
    expect(record.turns.some((t) => t.role === "chair")).toBe(true);
    expect(
      record.turns.every((t) => !/Shari Menon|Vice Chair/.test(t.text)),
    ).toBe(true);
  });
});
