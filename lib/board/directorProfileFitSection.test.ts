/**
 * Board Director profile — single “You'll enjoy working with me if…” section.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BOARD_DIRECTOR_ACCORDION_SECTION_IDS,
  BOARD_DIRECTOR_ENJOY_WORKING_LEGACY_TITLES,
  BOARD_DIRECTOR_ENJOY_WORKING_TITLE,
  BOARD_DIRECTOR_MORE_ACCORDION_SECTION_IDS,
  getDirectorAccordionSections,
  getDirectorMoreAccordionSections,
  getDirectorPrimaryAccordionSections,
  listBoardDirectors,
  openMeetDirectorConversation,
  returnToDirectorProfile,
  verifyRoundTableSeatsCoverAllDirectors,
} from "@/lib/board";

describe("Board Director profile — single enjoy-working-with-me section", () => {
  it("renders exactly one canonical fit heading per Director accordion", () => {
    for (const director of listBoardDirectors()) {
      const sections = getDirectorAccordionSections(director);
      const fit = sections.filter(
        (s) => s.id === "youll-enjoy-working-with-me",
      );
      expect(fit).toHaveLength(1);
      expect(fit[0]!.title).toBe(BOARD_DIRECTOR_ENJOY_WORKING_TITLE);
      expect(fit[0]!.bodyLines.join(" ").trim().length).toBeGreaterThan(0);
      expect(fit[0]!.bodyLines[0]).toBe(director.youllEnjoyWorkingWithMeIf);
    }
  });

  it("does not expose legacy fit labels as separate sections", () => {
    for (const director of listBoardDirectors()) {
      const titles = getDirectorAccordionSections(director).map((s) => s.title);
      const canonicalCount = titles.filter(
        (t) => t === BOARD_DIRECTOR_ENJOY_WORKING_TITLE,
      ).length;
      expect(canonicalCount).toBe(1);
      for (const legacy of BOARD_DIRECTOR_ENJOY_WORKING_LEGACY_TITLES) {
        if (legacy === BOARD_DIRECTOR_ENJOY_WORKING_TITLE) continue;
        expect(titles).not.toContain(legacy);
      }
    }
  });

  it("keeps director-specific fit content for every Director", () => {
    const bodies = listBoardDirectors().map((d) => d.youllEnjoyWorkingWithMeIf.trim());
    expect(bodies.every((b) => b.length > 20)).toBe(true);
    // Distinct personalities — not one generic filler for everyone
    expect(new Set(bodies).size).toBeGreaterThan(1);
  });

  it("preserves unrelated profile sections", () => {
    const requiredIds = [
      "how-i-think",
      "what-i-protect",
      "questions-ill-ask",
      "when-youll-want-me",
      "youll-enjoy-working-with-me",
      "decision-i-helped-guide",
      "how-i-work-with-founders",
    ];
    for (const director of listBoardDirectors()) {
      const ids = getDirectorAccordionSections(director).map((s) => s.id);
      expect(ids).toEqual(requiredIds);
      expect(ids).toEqual([...BOARD_DIRECTOR_ACCORDION_SECTION_IDS]);
      for (const section of getDirectorAccordionSections(director)) {
        expect(section.bodyLines.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps consistent profile section order", () => {
    expect([...BOARD_DIRECTOR_ACCORDION_SECTION_IDS]).toEqual([
      "how-i-think",
      "what-i-protect",
      "questions-ill-ask",
      "when-youll-want-me",
      "youll-enjoy-working-with-me",
      "decision-i-helped-guide",
      "how-i-work-with-founders",
    ]);
    expect([...BOARD_DIRECTOR_MORE_ACCORDION_SECTION_IDS]).toEqual([
      "questions-ill-ask",
      "youll-enjoy-working-with-me",
      "decision-i-helped-guide",
      "how-i-work-with-founders",
    ]);
    const sample = listBoardDirectors()[0]!;
    expect(getDirectorPrimaryAccordionSections(sample).map((s) => s.id)).toEqual([
      "how-i-think",
      "what-i-protect",
      "when-youll-want-me",
    ]);
    expect(getDirectorMoreAccordionSections(sample).map((s) => s.id)).toEqual([
      ...BOARD_DIRECTOR_MORE_ACCORDION_SECTION_IDS,
    ]);
  });

  it("profile card no longer duplicates fit as a side panel", () => {
    const cardSrc = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/board/BoardDirectorProfileCard.tsx",
      ),
      "utf8",
    );
    expect(cardSrc).not.toMatch(/board-director-enjoy-panel/);
    expect(cardSrc).not.toMatch(/board-director-profile__enjoy/);
    // Heading text must not appear outside the accordion component
    expect(cardSrc).not.toMatch(/You&apos;ll enjoy working with me if/);
    expect(cardSrc).not.toMatch(/You'll enjoy working with me if/);
    // Accordion remains the single render path
    expect(cardSrc).toMatch(/BoardDirectorProfileAccordion/);
  });

  it("canonical field remains the only registry fit field", () => {
    const typesSrc = readFileSync(
      resolve(process.cwd(), "lib/board/types.ts"),
      "utf8",
    );
    expect(typesSrc).toMatch(/youllEnjoyWorkingWithMeIf/);
    expect(typesSrc).not.toMatch(/enjoyWorkingWithMeIf[^I]/);
    expect(typesSrc).not.toMatch(/workingStyleFit|goodFitIf|whenYouWillEnjoyWorkingWithMe/);
  });

  it("Board seating and Meet chat behavior remain available", () => {
    expect(verifyRoundTableSeatsCoverAllDirectors()).toBe(true);

    const opened = openMeetDirectorConversation("board-chair");
    expect(opened.conversation?.open).toBe(true);
    const closed = returnToDirectorProfile(opened);
    expect(closed.route.screen).toBe("profile");
    expect(closed.conversation?.open).toBe(false);
  });
});
