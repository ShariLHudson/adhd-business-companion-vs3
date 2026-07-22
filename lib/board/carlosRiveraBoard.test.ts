/**
 * Carlos Rivera — Values & Trust visible Board Director.
 * Design sheet is reference only; portrait photo is the only runtime image.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { CHAMBER_MEMBERS } from "@/lib/chamber/chamberMemberRegistry";
import {
  CARLOS_RIVERA_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  getCarlosRivera,
  getDirectorAccordionSections,
  listVisibleBoardDirectors,
  meetDirectorCtaLabel,
  resolveBoardDirectorAlias,
  resolveBoardDirectorPortraitPath,
} from "@/lib/board";

const VISIBLE_IDS = [
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
] as const;

const VISIBLE_NAMES = [
  "Thomas Ellison",
  "Shari Menon",
  "David Kim",
  "Victoria Hayes",
  "Melissa Grant",
  "Marcus Whitaker",
  "Sofia Ramirez",
  "James Holloway",
  "Laura Bennett",
  "Maya Chen",
  "Carlos Rivera",
  "Mateo Vargas",
] as const;

describe("Carlos Rivera — visible Values & Trust Director", () => {
  it("exists as Optional Director with portrait photo only", () => {
    const carlos = getCarlosRivera();
    expect(carlos.id).toBe("values-trust");
    expect(carlos.name).toBe("Carlos Rivera");
    expect(carlos.boardRole).toBe("Values and Trust Director");
    expect(carlos.isCoreDirector).toBe(false);
    expect(carlos.isOptionalDirector).toBe(true);
    expect(carlos.portraitPath).toBe(
      "/board-of-directors/carlos-rivera-values-and-trust.png",
    );
    expect(carlos.portraitPath).not.toMatch(/amara|delgado|carlos-rivera-portrait/i);
  });

  it("is visible in Meet the Directors with the approved Directors", () => {
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toEqual([...VISIBLE_IDS]);
    expect(listVisibleBoardDirectors().map((d) => d.name)).toEqual([
      ...VISIBLE_NAMES,
    ]);
  });

  it("resolves aliases without Chamber IDs", () => {
    expect(resolveBoardDirectorAlias("carlos rivera")?.id).toBe("values-trust");
    expect(resolveBoardDirectorAlias("Values & Trust")?.id).toBe("values-trust");
    expect(CARLOS_RIVERA_DIRECTOR_ID).toBe("values-trust");
    expect(CHAMBER_MEMBERS.some((m) => m.id === "values-trust")).toBe(false);
  });

  it("carries approved welcome, philosophy, and decision lens", () => {
    const carlos = getCarlosRivera();
    expect(carlos.philosophy).toMatch(/heartbeat of any great organization/i);
    expect(carlos.openingMessage).toMatch(/legacy of trust/i);
    expect(carlos.decisionLens).toEqual([
      "Values Alignment",
      "Trust Building",
      "Culture",
      "Transparency",
      "Ethical Leadership",
    ]);
    expect(carlos.signature).toMatch(/leading with values/i);
  });

  it("builds Meet Carlos CTA and accordion sections from registry", () => {
    const carlos = getCarlosRivera();
    expect(meetDirectorCtaLabel(carlos)).toBe("Meet Carlos");
    expect(getDirectorAccordionSections(carlos).length).toBe(7);
    expect(resolveBoardDirectorPortraitPath(carlos)).toBe(
      "/board-of-directors/carlos-rivera-values-and-trust.png",
    );
  });
});
