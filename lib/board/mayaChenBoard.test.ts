/**
 * Maya Chen — Technology & Future visible Board Director.
 * Design sheet is reference only; portrait photo is the only runtime image.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { CHAMBER_MEMBERS } from "@/lib/chamber/chamberMemberRegistry";
import {
  MAYA_CHEN_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  getDirectorAccordionSections,
  getMayaChen,
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

describe("Maya Chen — visible Technology & Future Director", () => {
  it("exists as Optional Director with portrait photo only", () => {
    const maya = getMayaChen();
    expect(maya.id).toBe("technology-future");
    expect(maya.name).toBe("Maya Chen");
    expect(maya.boardRole).toBe("Technology and Future Director");
    expect(maya.isCoreDirector).toBe(false);
    expect(maya.isOptionalDirector).toBe(true);
    expect(maya.portraitPath).toBe(
      "/board-of-directors/maya-chen-portrait.png",
    );
    expect(maya.portraitPath).not.toMatch(/rowan|quill|technology-and-future/i);
  });

  it("is visible in Meet the Directors with the approved Directors", () => {
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toEqual([...VISIBLE_IDS]);
    expect(listVisibleBoardDirectors().map((d) => d.name)).toEqual([
      ...VISIBLE_NAMES,
    ]);
  });

  it("resolves aliases without Chamber IDs", () => {
    expect(resolveBoardDirectorAlias("maya chen")?.id).toBe("technology-future");
    expect(resolveBoardDirectorAlias("Technology & Future")?.id).toBe(
      "technology-future",
    );
    expect(MAYA_CHEN_DIRECTOR_ID).toBe("technology-future");
    expect(
      CHAMBER_MEMBERS.some((m) => m.id === "technology-future"),
    ).toBe(false);
  });

  it("carries approved welcome, philosophy, and decision lens", () => {
    const maya = getMayaChen();
    expect(maya.philosophy).toMatch(/choices we make today/i);
    expect(maya.openingMessage).toMatch(/future we'll be proud to pass on/i);
    expect(maya.decisionLens).toEqual([
      "Innovation",
      "Future Readiness",
      "Scalability",
    ]);
    expect(maya.signature).toMatch(/future-ready/i);
  });

  it("builds Meet Maya CTA and accordion sections from registry", () => {
    const maya = getMayaChen();
    expect(meetDirectorCtaLabel(maya)).toBe("Meet Maya");
    expect(getDirectorAccordionSections(maya).length).toBe(7);
    expect(resolveBoardDirectorPortraitPath(maya)).toBe(
      "/board-of-directors/maya-chen-portrait.png",
    );
  });
});
