import { describe, expect, it } from "vitest";

import {
  assessRoomButtonManifestAlignment,
  formatSparkEstateTopNavigationReport,
  SPARK_ESTATE_PROFILE_MENU_ITEMS,
  SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS,
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
    expect(verification.profileMenuAligned).toBe(true);
    expect(verification.wanderManifestRuleReady).toBe(true);
  });

  it("aligns profile menu items with the correction spec", () => {
    expect(SPARK_ESTATE_PROFILE_MENU_ITEMS.map((item) => item.label)).toEqual([
      "Profile",
      "Settings",
      "Conversations",
      "Personalization",
      "Account",
    ]);
  });

  it("documents room menu experience and navigation sections", () => {
    expect(SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS).toHaveLength(4);
    expect(SPARK_ESTATE_ROOM_MENU_EXPERIENCE_ITEMS.map((item) => item.id)).toContain(
      "return-to-room",
    );
    const verification = verifySparkEstateTopNavigationAndProfileMenu();
    expect(verification.roomExperienceItems).toBe(4);
    expect(verification.roomNavigationItems).toBe(2);
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
  });
});
