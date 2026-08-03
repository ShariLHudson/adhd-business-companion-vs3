/**
 * Personal Library — canonical full-screen workspace (shared rules).
 *
 * Proves, once at the shared level, that entering Personal Library from any path
 * (Wander the Estate, chat, a Spark Card, My Spark Collection) lands on the SAME
 * full-screen workspace, that the shared Wander / full-screen bottom control
 * strip is absent while it is active, and that the strip returns after leaving.
 */
import { describe, expect, it } from "vitest";
import { estateNavigateCommandForPlace } from "@/lib/estateIntelligence/estateCommandRouter";
import { isDedicatedEstateRoomPanelSection } from "./directEstateVisit";
import { isEstateFullBleedPanelSection } from "./estateFullBleedPanelSections";
import { planWelcomeHomeDestinationSwitch } from "./welcomeHomeDestinationSwitch";
import {
  PERSONAL_LIBRARY_SECTION,
  estateMapFullScreenVisible,
  isCanonicalFullScreenWorkspace,
  isPersonalLibraryActive,
  suppressesEstateBottomChrome,
} from "./personalLibraryWorkspace";

describe("Personal Library — canonical full-screen workspace", () => {
  it("is a dedicated, full-bleed panel (owns the viewport; no frosted chat / no beside-chat)", () => {
    expect(isDedicatedEstateRoomPanelSection(PERSONAL_LIBRARY_SECTION)).toBe(true);
    expect(isEstateFullBleedPanelSection(PERSONAL_LIBRARY_SECTION)).toBe(true);
    expect(isCanonicalFullScreenWorkspace(PERSONAL_LIBRARY_SECTION)).toBe(true);
  });

  describe("the shared Wander / full-screen bottom control strip", () => {
    it("is ABSENT while Personal Library is active (even when the map was open)", () => {
      // EstateMapFullScreen mounts the immersive bar: "Talk here with Spark",
      // "Exit full screen", previous/next. It must not render over the room.
      expect(estateMapFullScreenVisible(true, PERSONAL_LIBRARY_SECTION)).toBe(false);
      expect(estateMapFullScreenVisible(false, PERSONAL_LIBRARY_SECTION)).toBe(false);
      expect(suppressesEstateBottomChrome(PERSONAL_LIBRARY_SECTION)).toBe(true);
    });

    it("RETURNS after leaving Personal Library", () => {
      // Same map-open state, but the member is no longer in the library.
      expect(estateMapFullScreenVisible(true, "home")).toBe(true);
      expect(suppressesEstateBottomChrome("home")).toBe(false);
      // A neighbouring reflection room does not suppress the strip either.
      expect(estateMapFullScreenVisible(true, "growth-journal")).toBe(true);
    });

    it("never forces the map open — suppression only hides, it does not reveal", () => {
      expect(estateMapFullScreenVisible(false, "home")).toBe(false);
    });
  });

  describe("every entry path opens the SAME full-screen workspace", () => {
    // Wander, chat, Spark Card and the room menu all navigate via
    // estateNavigateCommandForPlace("personal-library", <their own userText>).
    const entryPaths: Array<{ path: string; userText: string }> = [
      { path: "Wander the Estate", userText: "wander" },
      { path: "chat", userText: "go to my personal library" },
      { path: "chat (spark cards)", userText: "go to spark card collection" },
      { path: "Spark Card", userText: "open my personal library" },
      { path: "My Spark Collection", userText: "show my spark collection" },
    ];

    for (const { path, userText } of entryPaths) {
      it(`${path} resolves to the canonical Personal Library workspace`, () => {
        const command = estateNavigateCommandForPlace("personal-library", userText);
        expect(command).not.toBeNull();
        expect(command!.section).toBe(PERSONAL_LIBRARY_SECTION);
        expect(isCanonicalFullScreenWorkspace(command!.section!)).toBe(true);
        // And while there, the shared bottom strip is suppressed for that path.
        expect(suppressesEstateBottomChrome(command!.section)).toBe(true);
      });
    }

    it("all entry paths agree on one section (no per-path divergence)", () => {
      const sections = entryPaths.map(
        ({ userText }) =>
          estateNavigateCommandForPlace("personal-library", userText)?.section,
      );
      expect(new Set(sections)).toEqual(new Set([PERSONAL_LIBRARY_SECTION]));
    });
  });

  describe("Wander entry leaves the Wander shell for the canonical room", () => {
    it("selecting Personal Library from Wander closes the Explore/Wander shell", () => {
      // handleExploreSparkMapSelect navigates with kind "section"; the switch
      // plan must tear down the full-screen Explore/Wander map + image viewer.
      const plan = planWelcomeHomeDestinationSwitch({
        destinationId: "personal-library",
        kind: "section",
      });
      expect(plan.closeExploreEstate).toBe(true);
    });

    it("the Wander bottom controls are absent once Personal Library is active", () => {
      // Even if the map state lagged open, the render guard hides the immersive
      // bar ("Talk here with Spark", "Exit full screen", prev/next) over the room.
      expect(estateMapFullScreenVisible(true, PERSONAL_LIBRARY_SECTION)).toBe(false);
    });

    it("Wander entry resolves to the SAME canonical workspace as chat", () => {
      const wander = estateNavigateCommandForPlace(
        "personal-library",
        "Explore Estate: My Personal Library",
      );
      const chat = estateNavigateCommandForPlace(
        "personal-library",
        "go to my personal library",
      );
      expect(wander?.section).toBe(PERSONAL_LIBRARY_SECTION);
      expect(chat?.section).toBe(PERSONAL_LIBRARY_SECTION);
      expect(wander?.section).toBe(chat?.section);
      expect(isCanonicalFullScreenWorkspace(wander!.section!)).toBe(true);
    });

    it("Wander controls return after leaving Personal Library", () => {
      expect(estateMapFullScreenVisible(true, "home")).toBe(true);
    });
  });

  describe("isPersonalLibraryActive", () => {
    it("is true only for the Personal Library section", () => {
      expect(isPersonalLibraryActive(PERSONAL_LIBRARY_SECTION)).toBe(true);
      expect(isPersonalLibraryActive("home")).toBe(false);
      expect(isPersonalLibraryActive(null)).toBe(false);
      expect(isPersonalLibraryActive(undefined)).toBe(false);
    });
  });
});
