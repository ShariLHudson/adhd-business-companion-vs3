import { describe, expect, it } from "vitest";
import {
  getMyDayAndWorkDestination,
  isForbiddenMyDayAndWorkFallback,
  MY_DAY_AND_WORK_DESTINATIONS,
  resolveMyDayAndWorkOpenerFromText,
} from "./myDayAndWorkNavigation";

describe("My Day & Work navigation contract", () => {
  it("lists nine distinct destinations with unique openers where required", () => {
    expect(MY_DAY_AND_WORK_DESTINATIONS).toHaveLength(9);
    const openers = MY_DAY_AND_WORK_DESTINATIONS.map((d) => d.opener);
    expect(openers).toContain("reminders");
    expect(openers).toContain("rhythms");
    expect(openers).toContain("parking-lot");
    expect(openers).toContain("destination-gallery");
    expect(openers).toContain("cartographers-studio");
    expect(openers).toContain("project-homes");
    expect(openers).not.toContain("projects");
  });

  it("keeps Reminders separate from Rhythms", () => {
    expect(getMyDayAndWorkDestination("reminders").opener).toBe("reminders");
    expect(getMyDayAndWorkDestination("rhythms").opener).toBe("rhythms");
    expect(resolveMyDayAndWorkOpenerFromText("Open Reminders")).toBe(
      "reminders",
    );
    expect(resolveMyDayAndWorkOpenerFromText("Take me to Rhythms")).toBe(
      "rhythms",
    );
    expect(resolveMyDayAndWorkOpenerFromText("Open Reminders")).not.toBe(
      "rhythms",
    );
  });

  it("routes Projects to Project Homes — not legacy blue ProjectsPanel", () => {
    expect(resolveMyDayAndWorkOpenerFromText("Open Projects")).toBe(
      "project-homes",
    );
    expect(resolveMyDayAndWorkOpenerFromText("go to projects")).toBe(
      "project-homes",
    );
    expect(getMyDayAndWorkDestination("projects").opener).toBe("project-homes");
  });

  it("routes Parking Lot, Destination Gallery, and Cartography distinctly", () => {
    expect(resolveMyDayAndWorkOpenerFromText("Open my Parking Lot")).toBe(
      "parking-lot",
    );
    expect(resolveMyDayAndWorkOpenerFromText("Show Destination Gallery")).toBe(
      "destination-gallery",
    );
    expect(resolveMyDayAndWorkOpenerFromText("Take me to Cartography")).toBe(
      "cartographers-studio",
    );
    expect(resolveMyDayAndWorkOpenerFromText("Open my Parking Lot")).not.toBe(
      "clear-my-mind",
    );
    expect(
      resolveMyDayAndWorkOpenerFromText("Show Destination Gallery"),
    ).not.toBe("clear-my-mind");
    expect(
      resolveMyDayAndWorkOpenerFromText("Take me to Cartography"),
    ).not.toBe("clear-my-mind");
  });

  it("routes Plan My Day, Calendar, and Clear My Mind correctly", () => {
    expect(resolveMyDayAndWorkOpenerFromText("Open Plan My Day")).toBe(
      "plan-my-day",
    );
    expect(resolveMyDayAndWorkOpenerFromText("Show my Calendar")).toBe(
      "calendar",
    );
    expect(resolveMyDayAndWorkOpenerFromText("Take me to Clear My Mind")).toBe(
      "clear-my-mind",
    );
  });

  it("never treats Clear My Mind or legacy Projects as silent fallbacks", () => {
    expect(isForbiddenMyDayAndWorkFallback("brain-dump")).toBe(true);
    expect(isForbiddenMyDayAndWorkFallback("clear-my-mind")).toBe(true);
    expect(isForbiddenMyDayAndWorkFallback("projects")).toBe(true);
    expect(isForbiddenMyDayAndWorkFallback("project-homes")).toBe(false);
    expect(isForbiddenMyDayAndWorkFallback("destination-gallery")).toBe(false);
  });
});
