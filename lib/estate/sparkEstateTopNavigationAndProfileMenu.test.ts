import { describe, expect, it } from "vitest";

import {
  assessRoomButtonManifestAlignment,
  formatSparkEstateTopNavigationReport,
  SPARK_ESTATE_EXPERIENCE_CONTROL_ITEMS,
  SPARK_ESTATE_PROFILE_MENU_ITEMS,
  SPARK_ESTATE_ROOM_MENU_CREATE_SUBMENU_ITEMS,
  SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS,
  SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS,
  SPARK_ESTATE_ROOM_MENU_FOCUS_ITEMS,
  SPARK_ESTATE_ROOM_MENU_KNOWLEDGE_ITEMS,
  SPARK_ESTATE_ROOM_MENU_MY_DAY_WORK_ITEMS,
  SPARK_ESTATE_ROOM_MENU_MY_STORY_ITEMS,
  SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS,
  SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS,
  SPARK_ESTATE_ROOM_MENU_SECTIONS,
  SPARK_ESTATE_TOP_NAVIGATION_CONTROLS,
  SPARK_ESTATE_TOP_NAVIGATION_PRINCIPLE,
  verifySparkEstateTopNavigationAndProfileMenu,
} from "./sparkEstateTopNavigationAndProfileMenu";

describe("sparkEstateTopNavigationAndProfileMenu", () => {
  it("defines two permanent top-right controls", () => {
    const verification = verifySparkEstateTopNavigationAndProfileMenu();
    expect(SPARK_ESTATE_TOP_NAVIGATION_CONTROLS).toHaveLength(2);
    expect(SPARK_ESTATE_TOP_NAVIGATION_PRINCIPLE).toContain("two permanent");
    expect(verification.controlCount).toBe(2);
    expect(verification.wanderManifestRuleReady).toBe(true);
  });

  it("aligns profile menu with Experience Controls under SH", () => {
    expect(SPARK_ESTATE_PROFILE_MENU_ITEMS.map((item) => item.label)).toEqual([
      "Conversations",
      "My Spark Estate",
      "Experience Controls",
      "Settings",
      "Sign Out",
    ]);
    expect(SPARK_ESTATE_EXPERIENCE_CONTROL_ITEMS.length).toBeGreaterThanOrEqual(8);
  });

  it("documents Welcome Home as six categories with Spark Estate last", () => {
    expect(SPARK_ESTATE_ROOM_MENU_SECTIONS.map((s) => s.id)).toEqual([
      "my-day",
      "my-work",
      "take-a-moment",
      "my-story",
      "get-advice",
      "spark-estate",
    ]);
    expect(SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS).toHaveLength(0);

    const verification = verifySparkEstateTopNavigationAndProfileMenu();
    expect(verification.welcomeHomeHasFiveCategories).toBe(true);
    expect(verification.experienceControlsNotInWelcomeHome).toBe(true);
    expect(verification.roomExperienceItems).toBe(0);
    expect(verification.roomNavigationItems).toBe(0);
    expect(verification.roomMyDayWorkItems).toBe(3);
    expect(verification.roomMyWorkStudioItems).toBe(3);
    expect(verification.roomFocusItems).toBe(4);
    expect(verification.roomMyStoryItems).toBe(3);
    expect(verification.roomKnowledgeItems).toBe(3);
    expect(verification.roomExperiencesItems).toBe(2);
    expect(verification.excludesLibraryAndCartography).toBe(true);
    expect(verification.peacefulPlacesStayInExperiences).toBe(true);

    expect(SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS).toEqual([]);

    expect(
      SPARK_ESTATE_ROOM_MENU_MY_DAY_WORK_ITEMS.map((item) => item.id),
    ).toEqual(["adapt-plan-my-day", "calendar", "reminders-rhythms"]);
    expect(
      SPARK_ESTATE_ROOM_MENU_MY_DAY_WORK_ITEMS.map((item) => item.label),
    ).toEqual([
      "Plan My Day / Adapt My Day",
      "Calendar",
      "Reminders / Rhythms",
    ]);
    expect(
      SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.map((item) => item.id),
    ).toEqual([
      "projects",
      "destination-gallery",
      "cartographers-studio",
    ]);
    expect(SPARK_ESTATE_ROOM_MENU_CREATE_SUBMENU_ITEMS).toEqual([]);
    expect(SPARK_ESTATE_ROOM_MENU_FOCUS_ITEMS.map((item) => item.id)).toEqual([
      "clear-my-mind",
      "parking-lot",
      "breathe",
      "spin-the-wheel",
    ]);
    expect(
      SPARK_ESTATE_ROOM_MENU_MY_STORY_ITEMS.map((item) => item.id),
    ).toEqual(["journal", "evidence-vault", "hall-of-accomplishments"]);
    expect(
      SPARK_ESTATE_ROOM_MENU_KNOWLEDGE_ITEMS.map((item) => item.id),
    ).toEqual(["chamber-of-momentum", "boardroom", "strategy-library"]);
    expect(
      SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS.map((item) => item.id),
    ).toEqual(["peaceful-places", "soundscapes"]);
  });

  it("assesses manifest alignment for room button display names", () => {
    const welcome = assessRoomButtonManifestAlignment("welcome-home");
    expect(welcome.displayName.length).toBeGreaterThan(0);
    expect(welcome.hasManifestRecord).toBe(true);
  });

  it("formats a readable navigation report", () => {
    const report = formatSparkEstateTopNavigationReport();
    expect(report).toContain("Welcome Home categories");
    expect(report).toContain("Experience Controls (SH overlay)");
    expect(report).not.toMatch(/Room menu — experience controls/i);
  });
});
