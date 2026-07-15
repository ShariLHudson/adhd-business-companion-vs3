/**
 * David Kim — Founder Advocate visible Board Director.
 * Design sheet is reference only; portrait photo is the only runtime image.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { CHAMBER_MEMBERS } from "@/lib/chamber/chamberMemberRegistry";
import {
  DAVID_KIM_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  getDavidKim,
  getDirectorAccordionSections,
  listVisibleBoardDirectors,
  meetDirectorCtaLabel,
  resolveBoardDirectorAlias,
  resolveBoardDirectorPortraitPath,
} from "@/lib/board";

describe("David Kim — visible Founder Advocate Director", () => {
  it("exists as Core Director with portrait photo only", () => {
    const david = getDavidKim();
    expect(david.id).toBe("founder-advocate");
    expect(david.name).toBe("David Kim");
    expect(david.boardRole).toBe("Founder Advocate Director");
    expect(david.isCoreDirector).toBe(true);
    expect(david.isOptionalDirector).toBe(false);
    expect(david.portraitPath).toBe(
      "/board-of-directors/david-kim-portrait.png",
    );
    expect(david.portraitPath).not.toMatch(/mira|solano|founder-advocate\.png/i);
  });

  it("is visible in Meet the Directors with Thomas, Shari, and Marcus", () => {
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toHaveLength(12);
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("founder-advocate");
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
    expect(resolveBoardDirectorAlias("david kim")?.id).toBe("founder-advocate");
    expect(resolveBoardDirectorAlias("Founder Advocate")?.id).toBe(
      "founder-advocate",
    );
    expect(DAVID_KIM_DIRECTOR_ID).toBe("founder-advocate");
    expect(
      CHAMBER_MEMBERS.some((m) => m.id === "founder-advocate"),
    ).toBe(false);
  });

  it("carries approved welcome, philosophy, and decision lens", () => {
    const david = getDavidKim();
    expect(david.philosophy).toMatch(/heartbeat of this business/i);
    expect(david.openingMessage).toMatch(/mission at the center/i);
    expect(david.decisionLens).toEqual([
      "Vision Alignment",
      "Founder Success",
      "Mission Guardian",
    ]);
    expect(david.signature).toMatch(/vision champion/i);
  });

  it("builds Meet David CTA and accordion sections from registry", () => {
    const david = getDavidKim();
    expect(meetDirectorCtaLabel(david)).toBe("Meet David");
    expect(getDirectorAccordionSections(david).length).toBe(7);
    expect(resolveBoardDirectorPortraitPath(david)).toBe(
      "/board-of-directors/david-kim-portrait.png",
    );
  });
});
