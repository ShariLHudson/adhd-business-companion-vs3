import { describe, expect, it } from "vitest";
import {
  BOARD_DIRECTOR_ASSET_BASE,
  getBoardDirectorById,
  listBoardDirectors,
  resolveBoardDirectorPortrait,
  resolveBoardDirectorPortraitById,
  resolveBoardDirectorPortraitPath,
  auditBoardDirectorPortraitIntegrity,
} from "@/lib/board";
import { ROUND_TABLE_SEATS } from "@/lib/board/roundTable";

const CHAIR_PORTRAIT = `${BOARD_DIRECTOR_ASSET_BASE}/thomas-ellison-portrait.png`;

describe("resolveBoardDirectorPortrait — selected member binding", () => {
  it("1. Chairman shows Chairman name and portrait", () => {
    const chair = getBoardDirectorById("board-chair")!;
    const portrait = resolveBoardDirectorPortrait(chair);
    expect(portrait.directorId).toBe("board-chair");
    expect(portrait.src).toBe(CHAIR_PORTRAIT);
    expect(portrait.alt).toContain(chair.name);
    expect(portrait.alt).toContain(chair.boardRole);
  });

  it("2. Finance Director shows Finance portrait — not Chairman", () => {
    const finance = getBoardDirectorById("financial-stewardship")!;
    const portrait = resolveBoardDirectorPortrait(finance);
    expect(portrait.directorId).toBe("financial-stewardship");
    expect(portrait.src).toContain("melissa-grant");
    expect(portrait.src).not.toBe(CHAIR_PORTRAIT);
    expect(portrait.alt).toContain(finance.name);
  });

  it("3. Technology & Future Director shows that director’s portrait", () => {
    const tech = getBoardDirectorById("technology-future")!;
    const portrait = resolveBoardDirectorPortrait(tech);
    expect(portrait.directorId).toBe("technology-future");
    expect(portrait.src).toBe(tech.portraitPath);
    expect(portrait.src).not.toBe(CHAIR_PORTRAIT);
  });

  it("4. Devil’s Advocate shows that director’s portrait", () => {
    const da = getBoardDirectorById("devils-advocate")!;
    const portrait = resolveBoardDirectorPortrait(da);
    expect(portrait.directorId).toBe("devils-advocate");
    expect(portrait.src).toBe(da.portraitPath);
    expect(portrait.src).not.toBe(CHAIR_PORTRAIT);
  });

  it("5. Name, role, portrait, and seat share the same director ID", () => {
    for (const id of [
      "board-chair",
      "financial-stewardship",
      "technology-future",
      "devils-advocate",
      "values-trust",
    ] as const) {
      const director = getBoardDirectorById(id)!;
      const portrait = resolveBoardDirectorPortrait(director);
      const seat = ROUND_TABLE_SEATS.find((s) => s.directorId === id);
      expect(portrait.directorId).toBe(director.id);
      expect(portrait.alt).toContain(director.name);
      expect(portrait.alt).toContain(director.boardRole);
      expect(seat?.directorId).toBe(director.id);
    }
  });

  it("6–7. Switching Chairman ↔ other director changes resolved image", () => {
    const chair = resolveBoardDirectorPortraitById("board-chair")!;
    const finance = resolveBoardDirectorPortraitById("financial-stewardship")!;
    const values = resolveBoardDirectorPortraitById("values-trust")!;
    expect(finance.src).not.toBe(chair.src);
    expect(values.src).not.toBe(chair.src);
    expect(resolveBoardDirectorPortraitById("board-chair")!.src).toBe(chair.src);
  });

  it("8. Missing portrait uses that director’s gallery/fallback — not Chairman", () => {
    const finance = getBoardDirectorById("financial-stewardship")!;
    const orphan = {
      ...finance,
      portraitPath: undefined,
      galleryCardPath: finance.galleryCardPath,
    };
    const portrait = resolveBoardDirectorPortrait(orphan);
    expect(portrait.directorId).toBe("financial-stewardship");
    expect(portrait.src).toBe(finance.galleryCardPath);
    expect(portrait.src).not.toBe(CHAIR_PORTRAIT);
    expect(portrait.sourceField).toBe("galleryCardPath");
  });

  it("9. Path helper and by-id helper stay bound to selected director", () => {
    const tech = getBoardDirectorById("technology-future")!;
    expect(resolveBoardDirectorPortraitPath(tech)).toBe(tech.portraitPath);
    expect(resolveBoardDirectorPortraitById("technology-future")?.src).toBe(
      tech.portraitPath,
    );
  });

  it("10. Alt text matches the selected director", () => {
    const values = getBoardDirectorById("values-trust")!;
    expect(resolveBoardDirectorPortrait(values).alt).toBe(
      `${values.name}, ${values.boardRole}`,
    );
  });

  it("11. Round Table seat highlight does not change portrait resolution", () => {
    const activeSeat = ROUND_TABLE_SEATS.find(
      (s) => s.directorId === "board-chair",
    );
    const selected = getBoardDirectorById("devils-advocate")!;
    // Camera/seat may highlight chair; portrait still comes from selected record
    expect(activeSeat?.chairHighlight).toBe(true);
    expect(resolveBoardDirectorPortrait(selected).src).toBe(
      selected.portraitPath,
    );
    expect(resolveBoardDirectorPortrait(selected).src).not.toBe(CHAIR_PORTRAIT);
  });

  it("12. Every registry director has a valid portrait or approved same-director fallback", () => {
    const chair = getBoardDirectorById("board-chair")!;
    for (const d of listBoardDirectors()) {
      const portrait = resolveBoardDirectorPortrait(d);
      expect(portrait.directorId).toBe(d.id);
      expect(portrait.src.startsWith(BOARD_DIRECTOR_ASSET_BASE)).toBe(true);
      if (d.id !== "board-chair") {
        expect(portrait.src).not.toBe(chair.portraitPath);
      }
    }
  });

  it("integrity audit reports directorId → name → portrait → seat", () => {
    const report = auditBoardDirectorPortraitIntegrity(ROUND_TABLE_SEATS);
    expect(report.missingPortraitPaths).toEqual([]);
    expect(
      report.rows.every(
        (r) =>
          r.ok &&
          (r.directorId === "board-chair" ||
            r.resolvedSrc !== CHAIR_PORTRAIT),
      ),
    ).toBe(true);
    const finance = report.rows.find((r) => r.directorId === "financial-stewardship");
    expect(finance?.seatId).toBe("seat-financial-stewardship");
    expect(finance?.resolvedSrc).toContain("melissa-grant");
  });
});
