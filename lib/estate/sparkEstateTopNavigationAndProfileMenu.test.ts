import { describe, expect, it } from "vitest";

import {
  assessRoomButtonManifestAlignment,
  formatSparkEstateTopNavigationReport,
  SPARK_ESTATE_PROFILE_MENU_ITEMS,
  SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS,
  SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS,
  SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS,
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

  it("documents room menu experience, navigation, and experiences sections", () => {
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
    expect(verification.roomNavigationItems).toBe(5);
    expect(verification.roomExperiencesItems).toBe(3);
    expect(
      SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.map((item) => item.id),
    ).toEqual([
      "chamber-of-momentum",
      "evidence-vault",
      "hall-of-accomplishments",
      "journal",
      "cartographers-studio",
    ]);
    expect(
      SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.map((item) => item.label),
    ).toContain("Journal Gazebo");
    expect(
      SPARK_ESTATE_ROOM_MENU_NAVIGATION_ITEMS.map((item) => item.label),
    ).toContain("Cartographer's Studio™");
    expect(
      SPARK_ESTATE_ROOM_MENU_EXPERIENCES_ITEMS.map((item) => item.id),
    ).toEqual(["breathe", "soundscapes", "explore-spark"]);
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
  });
});
