import { describe, expect, it } from "vitest";

import {
  assessRoomButtonManifestAlignment,
  formatSparkEstateTopNavigationReport,
  SPARK_ESTATE_PROFILE_MENU_ITEMS,
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

  it("aligns profile menu items with the working Welcome Home menu", () => {
    expect(SPARK_ESTATE_PROFILE_MENU_ITEMS.map((item) => item.label)).toEqual([
      "Conversations",
      "Settings",
      "Profile",
      "Logout",
    ]);
  });

  it("documents Welcome Home room menu sections and exclusions", () => {
    expect(SPARK_ESTATE_ROOM_MENU_SECTIONS.map((s) => s.id)).toEqual([
      "experience-controls",
      "estate-navigation",
      "my-day-and-work",
      "my-work-studio",
      "focus",
      "my-story-and-progress",
      "knowledge-and-advisory",
      "experiences",
    ]);
    expect(SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS).toHaveLength(5);
    expect(SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS.map((item) => item.id)).toEqual([
      "chat",
      "sound",
      "fullscreen",
      "change-background",
      "return-to-estate",
    ]);

    const verification = verifySparkEstateTopNavigationAndProfileMenu();
    expect(verification.roomExperienceItems).toBe(5);
    expect(verification.roomNavigationItems).toBe(1);
    expect(verification.roomMyDayWorkItems).toBe(4);
    expect(verification.roomMyWorkStudioItems).toBe(6);
    expect(verification.roomFocusItems).toBe(4);
    expect(verification.roomMyStoryItems).toBe(3);
    expect(verification.roomKnowledgeItems).toBe(2);
    expect(verification.roomExperiencesItems).toBe(2);
    expect(verification.excludesLibraryAndCartography).toBe(true);
    expect(verification.peacefulPlacesStayInExperiences).toBe(true);

    expect(
      SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.map((item) => item.id),
    ).toEqual(["explore-spark"]);
    expect(
      SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.map((item) => item.label).join(" "),
    ).not.toMatch(/library|cartograph/i);

    expect(
      SPARK_ESTATE_ROOM_MENU_MY_DAY_WORK_ITEMS.map((item) => item.id),
    ).toEqual(["plan-my-day", "rhythms", "reminders", "calendar"]);
    expect(
      SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.map((item) => item.id),
    ).toEqual([
      "projects",
      "documents",
      "sops",
      "content",
      "destination-gallery",
      "cartographers-studio",
    ]);
    expect(
      SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.map((item) => item.label),
    ).toContain("Cartographer's Studio");
    expect(SPARK_ESTATE_ROOM_MENU_FOCUS_ITEMS.map((item) => item.id)).toEqual([
      "clear-my-mind",
      "parking-lot",
      "spin-the-wheel",
      "breathe",
    ]);
    expect(
      SPARK_ESTATE_ROOM_MENU_MY_STORY_ITEMS.map((item) => item.id),
    ).toEqual(["journal", "evidence-vault", "hall-of-accomplishments"]);
    expect(
      SPARK_ESTATE_ROOM_MENU_KNOWLEDGE_ITEMS.map((item) => item.id),
    ).toEqual(["chamber-of-momentum", "boardroom"]);
    expect(
      SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS.map((item) => item.id),
    ).toEqual(["peaceful-places", "soundscapes"]);
  });

  it("assesses manifest alignment for room button display names", () => {
    const welcome = assessRoomButtonManifestAlignment("welcome-home");
    expect(welcome.displayName.length).toBeGreaterThan(0);
    expect(welcome.hasManifestRecord).toBe(true);
  });

  it("formats a readable top navigation report", () => {
    const report = formatSparkEstateTopNavigationReport();
    expect(report).toContain("Top-right controls");
    expect(report).toContain("Profile menu");
    expect(report).toContain("Integration checks");
    expect(report).toContain("Explore Spark");
    expect(report).toContain("My Workday");
    expect(report).toContain("My Work Studio");
    expect(report).toContain("Focus");
    expect(report).toContain("Peaceful Places");
    expect(report).toContain("Cartographer's Studio");
    expect(report).toContain("Library is not listed under Estate Navigation");
  });
});
