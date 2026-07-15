/**
 * Marcus Whitaker — Operations & Capacity visible Board Director.
 * Design sheet is reference only; portrait photo is the only runtime image.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { CHAMBER_MEMBERS } from "@/lib/chamber/chamberMemberRegistry";
import {
  MARCUS_WHITAKER_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  getDirectorAccordionSections,
  getMarcusWhitaker,
  listVisibleBoardDirectors,
  meetDirectorCtaLabel,
  resolveBoardDirectorAlias,
  resolveBoardDirectorPortraitPath,
} from "@/lib/board";

describe("Marcus Whitaker — visible Operations & Capacity Director", () => {
  it("exists as Core Director with portrait photo only", () => {
    const marcus = getMarcusWhitaker();
    expect(marcus.id).toBe("operations-capacity");
    expect(marcus.name).toBe("Marcus Whitaker");
    expect(marcus.boardRole).toBe("Operations and Capacity Director");
    expect(marcus.isCoreDirector).toBe(true);
    expect(marcus.isOptionalDirector).toBe(false);
    expect(marcus.portraitPath).toBe(
      "/board-of-directors/marcus-whitaker-portrait.png",
    );
    expect(marcus.portraitPath).not.toMatch(
      /operations-and-capacity|priya|nandakumar/i,
    );
  });

  it("is visible in Meet the Directors with Thomas and Shari", () => {
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toHaveLength(12);
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("operations-capacity");
    expect(listVisibleBoardDirectors().map((d) => d.name)).toEqual([
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
    ]);
  });

  it("resolves aliases without Chamber IDs", () => {
    expect(resolveBoardDirectorAlias("marcus whitaker")?.id).toBe(
      "operations-capacity",
    );
    expect(resolveBoardDirectorAlias("Operations & Capacity")?.id).toBe(
      "operations-capacity",
    );
    expect(MARCUS_WHITAKER_DIRECTOR_ID).toBe("operations-capacity");
    expect(
      CHAMBER_MEMBERS.some((m) => m.id === "operations-capacity"),
    ).toBe(false);
  });

  it("carries approved welcome, philosophy, and decision lens", () => {
    const marcus = getMarcusWhitaker();
    expect(marcus.philosophy).toMatch(/strong operations create stability/i);
    expect(marcus.openingMessage).toMatch(/without losing our soul/i);
    expect(marcus.decisionLens).toEqual([
      "Operational Efficiency",
      "Capacity Building",
      "Process Optimization",
    ]);
    expect(marcus.signature).toMatch(/streamlining operations/i);
  });

  it("builds Meet Marcus CTA and accordion sections from registry", () => {
    const marcus = getMarcusWhitaker();
    expect(meetDirectorCtaLabel(marcus)).toBe("Meet Marcus");
    expect(getDirectorAccordionSections(marcus).length).toBe(7);
    expect(resolveBoardDirectorPortraitPath(marcus)).toBe(
      "/board-of-directors/marcus-whitaker-portrait.png",
    );
  });
});
