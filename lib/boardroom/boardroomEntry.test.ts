/**
 * Round Table Boardroom entry + home restoration tests
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import {
  BOARDROOM_CHAMBER_CONTRAST_BLURB,
  BOARDROOM_HOME_PRIMARY_CHOICES,
  BOARDROOM_HOW_TO_SUMMARY_LABEL,
  BOARDROOM_HOW_TO_USE_POINTS,
  BOARDROOM_WELCOME_MESSAGE,
  boardroomViewFromEntryIntent,
  resolveBoardroomEntryIntent,
  shouldOpenThomasFromEntry,
  shouldOpenShariFromEntry,
  shouldOpenMarcusFromEntry,
  shouldOpenDavidFromEntry,
  shouldOpenMayaFromEntry,
  shouldOpenCarlosFromEntry,
  shouldOpenMateoFromEntry,
} from "@/lib/boardroom";

describe("Boardroom home entry", () => {
  it("normal Boardroom phrases open home (not Thomas)", () => {
    for (const phrase of [
      "",
      "Open the Boardroom",
      "Take me to the Round Table",
      "Round Table Boardroom",
      "Show me the Boardroom",
    ]) {
      expect(resolveBoardroomEntryIntent(phrase)).toBe("home");
      expect(boardroomViewFromEntryIntent("home")).toBe("home");
      expect(shouldOpenThomasFromEntry("home")).toBe(false);
      expect(shouldOpenShariFromEntry("home")).toBe(false);
    }
  });

  it("welcome message is the approved Boardroom home copy", () => {
    expect(BOARDROOM_WELCOME_MESSAGE).toContain(
      "Welcome to the Round Table Boardroom",
    );
    expect(BOARDROOM_WELCOME_MESSAGE).toContain("without choosing for you");
    expect(BOARDROOM_WELCOME_MESSAGE.length).toBeLessThan(420);
  });

  it("exposes exactly three primary home choices", () => {
    expect(BOARDROOM_HOME_PRIMARY_CHOICES).toHaveLength(3);
    expect(BOARDROOM_HOME_PRIMARY_CHOICES.map((c) => c.title)).toEqual([
      "Bring a Decision to the Board",
      "Meet the Directors",
      "Past Discussions",
    ]);
    expect(
      BOARDROOM_HOME_PRIMARY_CHOICES.some((c) =>
        c.title.toLowerCase().includes("how to use"),
      ),
    ).toBe(false);
    expect(BOARDROOM_HOME_PRIMARY_CHOICES[0]?.prominence).toBe("primary");
  });

  it("maps primary choices to intake, gallery, and history views", () => {
    expect(boardroomViewFromEntryIntent("intake")).toBe("board-director-intake");
    expect(boardroomViewFromEntryIntent("meet-directors")).toBe(
      "meet-directors",
    );
    expect(boardroomViewFromEntryIntent("past")).toBe("past");
  });

  it("How the Boardroom Works is secondary guidance, not a primary choice", () => {
    expect(BOARDROOM_HOW_TO_SUMMARY_LABEL).toBe("How the Boardroom Works");
    expect(BOARDROOM_HOW_TO_USE_POINTS.length).toBeGreaterThanOrEqual(4);
    expect(BOARDROOM_HOW_TO_USE_POINTS.join(" ")).toMatch(/decision-maker/i);
    expect(BOARDROOM_HOW_TO_USE_POINTS.join(" ")).toMatch(/Chamber/i);
    expect(BOARDROOM_CHAMBER_CONTRAST_BLURB).toMatch(/Chamber Intelligence/i);
    expect(
      BOARDROOM_HOME_PRIMARY_CHOICES.find((c) => c.id === "how-to"),
    ).toBeUndefined();
  });

  it("direct Thomas request opens Meet with Thomas, not home", () => {
    expect(resolveBoardroomEntryIntent("Meet Thomas")).toBe("meet-thomas");
    expect(boardroomViewFromEntryIntent("meet-thomas")).toBe("meet-directors");
    expect(shouldOpenThomasFromEntry("meet-thomas")).toBe(true);
    expect(shouldOpenThomasFromEntry("meet-directors")).toBe(false);
  });

  it("direct Shari request opens Meet with Shari, not home", () => {
    expect(resolveBoardroomEntryIntent("Meet Shari")).toBe("meet-shari");
    expect(resolveBoardroomEntryIntent("Shari Menon")).toBe("meet-shari");
    expect(resolveBoardroomEntryIntent("Vice Chair")).toBe("meet-shari");
    expect(boardroomViewFromEntryIntent("meet-shari")).toBe("meet-directors");
    expect(shouldOpenShariFromEntry("meet-shari")).toBe(true);
    expect(shouldOpenShariFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenThomasFromEntry("meet-shari")).toBe(false);
  });

  it("direct Marcus request opens Meet with Marcus, not home", () => {
    expect(resolveBoardroomEntryIntent("Meet Marcus")).toBe("meet-marcus");
    expect(resolveBoardroomEntryIntent("Marcus Whitaker")).toBe("meet-marcus");
    expect(
      resolveBoardroomEntryIntent("Operations and Capacity"),
    ).toBe("meet-marcus");
    expect(boardroomViewFromEntryIntent("meet-marcus")).toBe("meet-directors");
    expect(shouldOpenMarcusFromEntry("meet-marcus")).toBe(true);
    expect(shouldOpenMarcusFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenThomasFromEntry("meet-marcus")).toBe(false);
  });

  it("direct David request opens Meet with David, not home", () => {
    expect(resolveBoardroomEntryIntent("Meet David")).toBe("meet-david");
    expect(resolveBoardroomEntryIntent("David Kim")).toBe("meet-david");
    expect(resolveBoardroomEntryIntent("Founder Advocate")).toBe("meet-david");
    expect(boardroomViewFromEntryIntent("meet-david")).toBe("meet-directors");
    expect(shouldOpenDavidFromEntry("meet-david")).toBe(true);
    expect(shouldOpenDavidFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenThomasFromEntry("meet-david")).toBe(false);
  });

  it("direct Maya request opens Meet with Maya, not home", () => {
    expect(resolveBoardroomEntryIntent("Meet Maya")).toBe("meet-maya");
    expect(resolveBoardroomEntryIntent("Maya Chen")).toBe("meet-maya");
    expect(
      resolveBoardroomEntryIntent("Technology and Future"),
    ).toBe("meet-maya");
    expect(boardroomViewFromEntryIntent("meet-maya")).toBe("meet-directors");
    expect(shouldOpenMayaFromEntry("meet-maya")).toBe(true);
    expect(shouldOpenMayaFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenThomasFromEntry("meet-maya")).toBe(false);
  });

  it("direct Carlos request opens Meet with Carlos, not home", () => {
    expect(resolveBoardroomEntryIntent("Meet Carlos")).toBe("meet-carlos");
    expect(resolveBoardroomEntryIntent("Carlos Rivera")).toBe("meet-carlos");
    expect(
      resolveBoardroomEntryIntent("Values and Trust"),
    ).toBe("meet-carlos");
    expect(boardroomViewFromEntryIntent("meet-carlos")).toBe("meet-directors");
    expect(shouldOpenCarlosFromEntry("meet-carlos")).toBe(true);
    expect(shouldOpenCarlosFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenThomasFromEntry("meet-carlos")).toBe(false);
  });

  it("direct Mateo request opens Meet with Mateo, not home", () => {
    expect(resolveBoardroomEntryIntent("Meet Mateo")).toBe("meet-mateo");
    expect(resolveBoardroomEntryIntent("Mateo Vargas")).toBe("meet-mateo");
    expect(resolveBoardroomEntryIntent("Devil's Advocate")).toBe("meet-mateo");
    expect(boardroomViewFromEntryIntent("meet-mateo")).toBe("meet-directors");
    expect(shouldOpenMateoFromEntry("meet-mateo")).toBe(true);
    expect(shouldOpenMateoFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenThomasFromEntry("meet-mateo")).toBe(false);
  });

  it("direct Meet the Directors request opens gallery without Director auto-open", () => {
    expect(resolveBoardroomEntryIntent("Show me the Directors")).toBe(
      "meet-directors",
    );
    expect(shouldOpenThomasFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenShariFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenMarcusFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenDavidFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenMayaFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenCarlosFromEntry("meet-directors")).toBe(false);
    expect(shouldOpenMateoFromEntry("meet-directors")).toBe(false);
  });

  it("direct discussion request opens intake", () => {
    expect(resolveBoardroomEntryIntent("Start a Board discussion")).toBe(
      "intake",
    );
    expect(resolveBoardroomEntryIntent("Bring a decision to the Board")).toBe(
      "intake",
    );
  });

  it("direct past-history request opens past discussions", () => {
    expect(
      resolveBoardroomEntryIntent("Review my past Board discussions"),
    ).toBe("past");
  });

  it("stale-state safety: fresh home entry never implies Thomas or intake", () => {
    const intent = resolveBoardroomEntryIntent("Open the Boardroom");
    expect(intent).toBe("home");
    expect(boardroomViewFromEntryIntent(intent)).toBe("home");
    expect(shouldOpenThomasFromEntry(intent)).toBe(false);
  });
});
