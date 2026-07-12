/**
 * Board Director interaction — accordion, session store, portrait resolution
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import {
  BOARD_DIRECTOR_ACCORDION_SECTION_IDS,
  BOARD_DIRECTORS,
  getBoardDirectorById,
  getDirectorAccordionSections,
  listBoardDirectors,
  resolveBoardDirectorPortraitPath,
  toggleDirectorAccordion,
} from "@/lib/board";
import {
  createEmptyDirectorSessionStore,
  getDirectorSessionView,
  getRememberedConversation,
  rememberDirectorConversation,
  setDirectorAccordionOpen,
  setDirectorPortraitEnlarged,
} from "@/lib/board/directorSessionStore";
import {
  createInitialMeetConversation,
  openMeetDirectorConversation,
  returnToDirectorProfile,
  routeToDirectorProfilePreservingConversation,
} from "@/lib/board/meetDirector";

describe("Director accordion (registry-driven)", () => {
  it("builds all seven sections for every Director", () => {
    for (const director of listBoardDirectors()) {
      const sections = getDirectorAccordionSections(director);
      expect(sections.map((s) => s.id)).toEqual([
        ...BOARD_DIRECTOR_ACCORDION_SECTION_IDS,
      ]);
      for (const section of sections) {
        expect(section.title.length).toBeGreaterThan(0);
        expect(section.preview.length).toBeGreaterThan(0);
        expect(section.bodyLines.length).toBeGreaterThan(0);
      }
    }
  });

  it("toggles exclusive accordion open state", () => {
    expect(toggleDirectorAccordion(null, "how-i-think")).toBe("how-i-think");
    expect(toggleDirectorAccordion("how-i-think", "how-i-think")).toBe(null);
    expect(toggleDirectorAccordion("how-i-think", "what-i-protect")).toBe(
      "what-i-protect",
    );
  });

  it("uses Chair recommendations from registry, not hardcoded names", () => {
    const chair = getBoardDirectorById("board-chair");
    expect(chair?.name).toBeTruthy();
    expect(chair?.philosophy.length).toBeGreaterThan(0);
    expect(chair?.whatIProtect.length).toBeGreaterThan(0);
  });
});

describe("Portrait resolution", () => {
  it("never falls back to a hardcoded name path when portrait exists", () => {
    for (const d of BOARD_DIRECTORS) {
      const path = resolveBoardDirectorPortraitPath(d);
      expect(path.startsWith("/board-of-directors/")).toBe(true);
      expect(path).toBe(d.portraitPath);
    }
  });

  it("falls back to Chair portrait from registry when path missing", () => {
    const chair = getBoardDirectorById("board-chair")!;
    const orphan = { ...chair, id: "vice-chair" as const, portraitPath: undefined };
    expect(resolveBoardDirectorPortraitPath(orphan)).toBe(chair.portraitPath);
  });
});

describe("Director session state preservation", () => {
  it("remembers accordion and portrait per Director", () => {
    let store = createEmptyDirectorSessionStore();
    store = setDirectorAccordionOpen(store, "board-chair", "questions-ill-ask");
    store = setDirectorPortraitEnlarged(store, "board-chair", true);
    store = setDirectorAccordionOpen(store, "risk-resilience", "how-i-think");

    expect(getDirectorSessionView(store, "board-chair")).toEqual({
      openAccordionId: "questions-ill-ask",
      portraitEnlarged: true,
    });
    expect(getDirectorSessionView(store, "risk-resilience").openAccordionId).toBe(
      "how-i-think",
    );
    expect(getDirectorSessionView(store, "vice-chair").openAccordionId).toBe(
      null,
    );
  });

  it("resumes Meet conversation when returning to the same Director", () => {
    const opened = openMeetDirectorConversation("financial-stewardship");
    const closed = returnToDirectorProfile(opened);
    let store = createEmptyDirectorSessionStore();
    store = rememberDirectorConversation(store, closed.conversation!);

    const remembered = getRememberedConversation(
      store,
      "financial-stewardship",
    );
    const resumed = openMeetDirectorConversation(
      "financial-stewardship",
      remembered,
    );
    expect(resumed.conversation?.messages.length).toBeGreaterThanOrEqual(1);
    expect(resumed.conversation?.open).toBe(true);
    expect(resumed.conversation?.messages[0]?.content).toContain("Welcome");
  });

  it("preserves closed conversation on profile route", () => {
    const convo = createInitialMeetConversation("growth-opportunity");
    convo.open = false;
    const profile = routeToDirectorProfilePreservingConversation(
      "growth-opportunity",
      convo,
    );
    expect(profile.route.screen).toBe("profile");
    expect(profile.conversation?.open).toBe(false);
    expect(profile.conversation?.directorId).toBe("growth-opportunity");
  });
});
