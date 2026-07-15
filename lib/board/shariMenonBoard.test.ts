/**
 * Shari Menon — Vice Chair visible Board Director.
 * Design sheet is reference only; portrait photo is the only runtime image.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { CHAMBER_MEMBERS } from "@/lib/chamber/chamberMemberRegistry";
import {
  SHARI_MENON_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  getDirectorAccordionSections,
  getShariMenon,
  listVisibleBoardDirectors,
  meetDirectorCtaLabel,
  resolveBoardDirectorAlias,
  resolveBoardDirectorPortraitPath,
} from "@/lib/board";

describe("Shari Menon — visible Vice Chair", () => {
  it("exists as Core Director with portrait photo only", () => {
    const shari = getShariMenon();
    expect(shari.id).toBe("vice-chair");
    expect(shari.name).toBe("Shari Menon");
    expect(shari.boardRole).toBe("Vice Chair");
    expect(shari.isCoreDirector).toBe(true);
    expect(shari.isOptionalDirector).toBe(false);
    expect(shari.portraitPath).toBe(
      "/board-of-directors/shari-menon-portrait.png",
    );
    expect(shari.portraitPath).not.toMatch(/vice-chair\.png|chair-of-the-board/);
  });

  it("is visible in Meet the Directors beside Thomas", () => {
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toHaveLength(12);
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toContain("vice-chair");
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
    expect(resolveBoardDirectorAlias("shari menon")?.id).toBe("vice-chair");
    expect(resolveBoardDirectorAlias("Vice Chair")?.id).toBe("vice-chair");
    expect(SHARI_MENON_DIRECTOR_ID).toBe("vice-chair");
    expect(
      CHAMBER_MEMBERS.some((m) => m.id === "vice-chair"),
    ).toBe(false);
  });

  it("carries approved welcome, philosophy, and decision lens", () => {
    const shari = getShariMenon();
    expect(shari.philosophy).toMatch(/steady, reliable progress/i);
    expect(shari.openingMessage).toMatch(/measurable, lasting results/i);
    expect(shari.decisionLens).toEqual([
      "Follow-Through",
      "Board Continuity",
      "Practical Impact",
    ]);
    expect(shari.signature).toMatch(/aligned/i);
  });

  it("builds Meet Shari CTA and accordion sections from registry", () => {
    const shari = getShariMenon();
    expect(meetDirectorCtaLabel(shari)).toBe("Meet Shari");
    expect(getDirectorAccordionSections(shari).length).toBe(7);
    expect(resolveBoardDirectorPortraitPath(shari)).toBe(
      "/board-of-directors/shari-menon-portrait.png",
    );
  });
});
