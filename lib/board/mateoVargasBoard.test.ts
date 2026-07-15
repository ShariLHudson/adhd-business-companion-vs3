/**
 * Mateo Vargas — Devil’s Advocate visible Board Director.
 * Design sheet is reference only; portrait photo is the only runtime image.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { CHAMBER_MEMBERS } from "@/lib/chamber/chamberMemberRegistry";
import {
  MATEO_VARGAS_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  getDirectorAccordionSections,
  getMateoVargas,
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

describe("Mateo Vargas — visible Devil’s Advocate Director", () => {
  it("exists as Optional Director with portrait photo only", () => {
    const mateo = getMateoVargas();
    expect(mateo.id).toBe("devils-advocate");
    expect(mateo.name).toBe("Mateo Vargas");
    expect(mateo.boardRole).toBe("Devil’s Advocate Director");
    expect(mateo.isCoreDirector).toBe(false);
    expect(mateo.isOptionalDirector).toBe(true);
    expect(mateo.portraitPath).toBe(
      "/board-of-directors/mateo-vargas-portrait.png",
    );
    expect(mateo.portraitPath).not.toMatch(/dominic|vale|devils-advocate\.png/i);
  });

  it("is visible in Meet the Directors with the approved Directors", () => {
    expect(VISIBLE_BOARD_DIRECTOR_IDS).toEqual([...VISIBLE_IDS]);
    expect(listVisibleBoardDirectors().map((d) => d.name)).toEqual([
      ...VISIBLE_NAMES,
    ]);
  });

  it("resolves aliases without Chamber IDs", () => {
    expect(resolveBoardDirectorAlias("mateo vargas")?.id).toBe(
      "devils-advocate",
    );
    expect(resolveBoardDirectorAlias("Devil's Advocate")?.id).toBe(
      "devils-advocate",
    );
    expect(MATEO_VARGAS_DIRECTOR_ID).toBe("devils-advocate");
    expect(CHAMBER_MEMBERS.some((m) => m.id === "devils-advocate")).toBe(false);
  });

  it("carries approved welcome, philosophy, and decision lens", () => {
    const mateo = getMateoVargas();
    expect(mateo.philosophy).toMatch(/tough questions/i);
    expect(mateo.openingMessage).toMatch(
      /challenge assumptions|strongest path/i,
    );
    expect(mateo.decisionLens).toEqual([
      "Critical Thinking",
      "Risk Awareness",
      "Blind Spot Detection",
    ]);
    expect(mateo.signature).toMatch(/challenge/i);
  });

  it("builds Meet Mateo CTA and accordion sections from registry", () => {
    const mateo = getMateoVargas();
    expect(meetDirectorCtaLabel(mateo)).toBe("Meet Mateo");
    expect(getDirectorAccordionSections(mateo).length).toBe(7);
    expect(resolveBoardDirectorPortraitPath(mateo)).toBe(
      "/board-of-directors/mateo-vargas-portrait.png",
    );
  });
});
