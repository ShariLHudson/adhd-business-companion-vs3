/**
 * Board of Directors registry — Slice 1 separation & roster tests
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import {
  CHAMBER_MEMBER_IDS,
  CHAMBER_MEMBERS,
  CHAMBER_MEMBER_ASSET_BASE,
} from "@/lib/chamber/chamberMemberRegistry";
import {
  BOARD_DIRECTOR_ASSET_BASE,
  BOARD_DIRECTORS,
  ensureChairIncluded,
  getBoardDirectorById,
  getDevilsAdvocate,
  listCoreBoardDirectors,
  listOptionalBoardDirectors,
  recommendBoardDirectorsForDecision,
  recommendationIncludesDevilsAdvocateAutomatically,
  resolveBoardDirectorGalleryCardPath,
  resolveBoardDirectorPortraitPath,
  BOARD_DIRECTOR_IDS,
  BOARD_GROUP_NAME,
  BOARDROOM_DESTINATION_NAME,
  BOARD_MEMBER_TITLE,
  BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE,
  BOARD_MAY_AUTO_OPEN_CHAMBER,
  BOARD_MAY_AUTO_UPDATE_PROFILE,
  BOARD_MAY_AUTO_UPDATE_AVATAR,
  CORE_BOARD_DIRECTOR_IDS,
  BOARD_DISCUSSIONS_STORAGE_KEY,
  BOARD_DECISION_STATUSES,
} from "@/lib/board";

describe("Board of Directors — Slice 1 registry", () => {
  it("uses official Board naming (not Chamber language)", () => {
    expect(BOARDROOM_DESTINATION_NAME).toBe("Round Table Boardroom");
    expect(BOARD_GROUP_NAME).toBe("Board of Directors");
    expect(BOARD_MEMBER_TITLE).toBe("Director");
  });

  it("has a separate Board registry with all required roles", () => {
    expect(BOARD_DIRECTOR_IDS).toHaveLength(12);
    expect(BOARD_DIRECTORS).toHaveLength(12);

    const roles = BOARD_DIRECTORS.map((d) => d.boardRole);
    expect(roles).toContain("Chair of the Board");
    expect(roles).toContain("Vice Chair");
    expect(roles).toContain("Founder Advocate Director");
    expect(roles).toContain("Strategy Director");
    expect(roles).toContain("Financial Stewardship Director");
    expect(roles).toContain("Operations and Capacity Director");
    expect(roles).toContain("Customer and Market Director");
    expect(roles).toContain("Growth and Opportunity Director");
    expect(roles).toContain("Risk and Resilience Director");
    expect(roles).toContain("Technology and Future Director");
    expect(roles).toContain("Values and Trust Director");
    expect(roles).toContain("Devil’s Advocate Director");
  });

  it("assigns distinct named characters to each Director", () => {
    const names = BOARD_DIRECTORS.map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it("Board registry is separate from Chamber — no shared IDs", () => {
    const chamberIds = new Set<string>(CHAMBER_MEMBER_IDS);
    for (const id of BOARD_DIRECTOR_IDS) {
      expect(chamberIds.has(id)).toBe(false);
    }
  });

  it("Board registry resolves portraits without Chamber paths", () => {
    const chamberPaths = new Set(
      CHAMBER_MEMBERS.map((m) => m.cardImagePath),
    );
    const chair = getBoardDirectorById("board-chair")!;
    expect(chair.portraitPath).toBe(
      `${BOARD_DIRECTOR_ASSET_BASE}/thomas-ellison-portrait.png`,
    );
    for (const d of BOARD_DIRECTORS) {
      const path = resolveBoardDirectorPortraitPath(d);
      expect(path.startsWith(BOARD_DIRECTOR_ASSET_BASE)).toBe(true);
      expect(path.startsWith(CHAMBER_MEMBER_ASSET_BASE)).toBe(false);
      expect(chamberPaths.has(path)).toBe(false);
      expect(path).not.toMatch(/momentum-chamber-members/);
      expect(path).not.toMatch(/chair-of-the-board|vice-chair\.png/);
    }
  });

  it("wires Victoria Hayes and Sofia Ramirez to their own portrait assets", () => {
    const victoria = getBoardDirectorById("strategy-director")!;
    const sofia = getBoardDirectorById("customer-market")!;
    const chair = getBoardDirectorById("board-chair")!;

    expect(victoria.portraitPath).toBe(
      `${BOARD_DIRECTOR_ASSET_BASE}/victoria-hayes-strategy-director.png`,
    );
    expect(sofia.portraitPath).toBe(
      `${BOARD_DIRECTOR_ASSET_BASE}/sofia-ramirez-customer-and-market-director.png`,
    );
    expect(victoria.galleryCardPath).toBe(
      `${BOARD_DIRECTOR_ASSET_BASE}/strategy-director-gallery-portrait.png`,
    );
    expect(sofia.galleryCardPath).toBe(
      `${BOARD_DIRECTOR_ASSET_BASE}/customer-market-gallery-portrait.png`,
    );

    expect(resolveBoardDirectorPortraitPath(victoria)).toBe(
      victoria.portraitPath,
    );
    expect(resolveBoardDirectorPortraitPath(sofia)).toBe(sofia.portraitPath);
    expect(resolveBoardDirectorPortraitPath(victoria)).not.toBe(
      chair.portraitPath,
    );
    expect(resolveBoardDirectorPortraitPath(sofia)).not.toBe(
      chair.portraitPath,
    );
  });

  it("wires Carlos Rivera to values-and-trust portrait asset", () => {
    const carlos = getBoardDirectorById("values-trust")!;
    const chair = getBoardDirectorById("board-chair")!;

    expect(carlos.portraitPath).toBe(
      `${BOARD_DIRECTOR_ASSET_BASE}/carlos-rivera-values-and-trust.png`,
    );
    expect(carlos.galleryCardPath).toBe(
      `${BOARD_DIRECTOR_ASSET_BASE}/values-trust-gallery-portrait.png`,
    );
    expect(resolveBoardDirectorPortraitPath(carlos)).toBe(carlos.portraitPath);
    expect(resolveBoardDirectorPortraitPath(carlos)).not.toBe(
      chair.portraitPath,
    );
  });

  it("wires Melissa, James, and Laura to their own portraits — not Chairman", () => {
    const chair = getBoardDirectorById("board-chair")!;
    const melissa = getBoardDirectorById("financial-stewardship")!;
    const james = getBoardDirectorById("growth-opportunity")!;
    const laura = getBoardDirectorById("risk-resilience")!;
    expect(melissa.portraitPath).toContain("melissa-grant");
    expect(james.portraitPath).toContain("james-holloway");
    expect(laura.portraitPath).toContain("laura-bennett");
    for (const d of [melissa, james, laura]) {
      expect(resolveBoardDirectorPortraitPath(d)).toBe(d.portraitPath);
      expect(resolveBoardDirectorPortraitPath(d)).not.toBe(chair.portraitPath);
    }
  });

  it("resolves Compact Gallery Card art for every Director (not design sheets)", () => {
    for (const d of BOARD_DIRECTORS) {
      const path = resolveBoardDirectorGalleryCardPath(d);
      expect(path).toBe(
        `${BOARD_DIRECTOR_ASSET_BASE}/${d.id}-gallery-portrait.png`,
      );
      expect(path).not.toMatch(
        /thomas-ellison-chairman|melissa-grant-financial|design-references/i,
      );
      expect(d.galleryCardPath).toBe(path);
    }
  });

  it("does not reuse Chamber display names as Director names", () => {
    const chamberNames = new Set(
      CHAMBER_MEMBERS.map((m) => m.displayName.toLowerCase()),
    );
    for (const d of BOARD_DIRECTORS) {
      expect(chamberNames.has(d.name.toLowerCase())).toBe(false);
      expect(d.name.toLowerCase()).not.toMatch(/intelligence$/);
    }
  });

  it("does not import or mirror Chamber specialty titles as Board roles", () => {
    for (const d of BOARD_DIRECTORS) {
      expect(d.boardRole).not.toMatch(/Intelligence$/);
      expect(d.chamberContrast.length).toBeGreaterThan(20);
    }
  });

  it("Devil’s Advocate exists only on the Board", () => {
    const da = getDevilsAdvocate();
    expect(da.id).toBe("devils-advocate");
    expect(da.name).toBe("Mateo Vargas");
    expect(
      da.openingMessage.includes("challenge assumptions") ||
        da.openingMessage.includes("strongest path"),
    ).toBe(true);
    expect(da.isOptionalDirector).toBe(true);
    expect(da.isCoreDirector).toBe(false);
    expect(CHAMBER_MEMBER_IDS).not.toContain("devils-advocate");
    expect(
      CHAMBER_MEMBERS.some((m) =>
        m.displayName.toLowerCase().includes("devil"),
      ),
    ).toBe(false);
  });

  it("defines core versus optional Directors correctly", () => {
    expect([...CORE_BOARD_DIRECTOR_IDS]).toEqual([
      "board-chair",
      "vice-chair",
      "founder-advocate",
      "strategy-director",
      "financial-stewardship",
      "customer-market",
      "operations-capacity",
    ]);
    const core = listCoreBoardDirectors();
    expect(core.every((d) => d.isCoreDirector)).toBe(true);
    expect(core.map((d) => d.id)).toEqual([...CORE_BOARD_DIRECTOR_IDS]);

    const optional = listOptionalBoardDirectors();
    expect(optional.map((d) => d.id)).toEqual(
      expect.arrayContaining([
        "growth-opportunity",
        "risk-resilience",
        "technology-future",
        "values-trust",
        "devils-advocate",
      ]),
    );
    expect(optional.map((d) => d.id)).not.toContain("vice-chair");
    expect(optional.every((d) => d.isOptionalDirector)).toBe(true);
  });

  it("ensures Chair is included in every Board discussion set", () => {
    expect(ensureChairIncluded(["customer-market", "financial-stewardship"])).toEqual([
      "board-chair",
      "customer-market",
      "financial-stewardship",
    ]);
    expect(ensureChairIncluded(["board-chair", "founder-advocate"])[0]).toBe(
      "board-chair",
    );
  });

  it("Shari recommends a focused Director group — not the entire Board", () => {
    const offer = recommendBoardDirectorsForDecision(
      "Should I launch a new offer this quarter?",
    );
    expect(offer.directorIds).toContain("board-chair");
    expect(offer.directorIds.length).toBeGreaterThanOrEqual(3);
    expect(offer.directorIds.length).toBeLessThan(BOARD_DIRECTORS.length);
    expect(offer.directorIds).toContain("customer-market");
    expect(offer.directorIds).toContain("financial-stewardship");

    const tech = recommendBoardDirectorsForDecision(
      "Major technology investment in a new platform",
    );
    expect(tech.directorIds).toContain("technology-future");
    expect(tech.directorIds).toContain("risk-resilience");
    expect(tech.directorIds.length).toBeLessThan(BOARD_DIRECTORS.length);
  });

  it("offers Devil’s Advocate when appropriate but does not auto-add", () => {
    expect(BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE).toBe(false);
    const rec = recommendBoardDirectorsForDecision(
      "Launch a new offer with meaningful financial commitment",
    );
    expect(rec.offerDevilsAdvocate).toBe(true);
    expect(recommendationIncludesDevilsAdvocateAutomatically(rec)).toBe(
      false,
    );
    expect(rec.directorIds).not.toContain("devils-advocate");
  });

  it("documents how each Director differs from related Chamber specialties", () => {
    for (const d of BOARD_DIRECTORS) {
      expect(d.chamberContrast).toMatch(/Chamber|chamber|Board|board/);
      expect(d.exampleDecision.length).toBeGreaterThan(10);
      expect(d.watchesFor.length).toBeGreaterThan(0);
      expect(d.decisionLens.length).toBeGreaterThan(0);
      expect(d.questionsAsked.length).toBeGreaterThan(0);
      expect(d.responseStructure).toEqual([
        "Perspective",
        "What I support",
        "What concerns me",
        "What I need to know",
        "My current recommendation",
      ]);
    }
  });

  it("uses separate Board discussion storage key and calm decision statuses", () => {
    expect(BOARD_DISCUSSIONS_STORAGE_KEY).toBe(
      "companion-board-discussions-v1",
    );
    expect(BOARD_DISCUSSIONS_STORAGE_KEY).not.toMatch(/business-profile/);
    expect(BOARD_DISCUSSIONS_STORAGE_KEY).not.toMatch(/research/);
    expect(BOARD_DISCUSSIONS_STORAGE_KEY).not.toMatch(/chamber/);
    expect(BOARD_DECISION_STATUSES).not.toContain("Failed");
    expect(BOARD_DECISION_STATUSES).not.toContain("Overdue");
    expect(BOARD_DECISION_STATUSES).not.toContain("Bad Decision");
  });

  it("Board safety flags forbid auto profile / avatar / Chamber updates", () => {
    expect(BOARD_MAY_AUTO_UPDATE_PROFILE).toBe(false);
    expect(BOARD_MAY_AUTO_UPDATE_AVATAR).toBe(false);
    expect(BOARD_MAY_AUTO_OPEN_CHAMBER).toBe(false);
  });
});
