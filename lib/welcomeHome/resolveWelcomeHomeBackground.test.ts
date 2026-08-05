/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  setChatBackdropId,
  setClearMyMindBackdropId,
  setRoomBackdropOverride,
} from "@/lib/chatBackdrop/chatBackdropPreference";
import { WELCOME_HOME_BACKGROUND } from "@/lib/welcomeRoom/types";
import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import {
  resolveWelcomeHomeBackground,
  resolveWelcomeHomeHeroImageUrl,
} from "@/lib/welcomeHome/resolveWelcomeHomeHeroImageUrl";

describe("resolveWelcomeHomeBackground — Batch 4 live resolver adoption", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("a saved Welcome Home choice resolves through the authoritative resolver", () => {
    setRoomBackdropOverride("welcome-home", "library");
    const result = resolveWelcomeHomeBackground();
    expect(result.source).toBe("member-choice");
    expect(result.backgroundId).toBe("library");
    expect(result.imageUrl).toBe(
      estateBackgroundPath("room-library-estate-background.png"),
    );
  });

  it("default is used when no saved choice exists", () => {
    const result = resolveWelcomeHomeBackground();
    expect(result.source).toBe("default");
    expect(result.backgroundId).toBe("welcome-home");
    expect(result.imageUrl).toBe(WELCOME_HOME_BACKGROUND);
  });

  it("an invalid/corrupted saved choice falls back safely to default", () => {
    // Simulate stale/corrupted storage — an option id that no longer exists
    // in CHAT_BACKDROP_OPTIONS — bypassing setRoomBackdropOverride's own
    // validation so this genuinely exercises the fallback path.
    window.localStorage.setItem(
      "spark.roomBackdropOverride.v1",
      JSON.stringify({ "welcome-home": "discontinued-option-id" }),
    );
    expect(() => resolveWelcomeHomeBackground()).not.toThrow();
    const result = resolveWelcomeHomeBackground();
    expect(result.source).toBe("default");
    expect(result.imageUrl).toBe(WELCOME_HOME_BACKGROUND);
  });

  it("routine navigation (repeated calls) preserves the saved choice", () => {
    setRoomBackdropOverride("welcome-home", "greenhouse");
    // Simulate several navigations away and back — each is just a fresh call,
    // since nothing in this module holds mutable in-memory state.
    for (let i = 0; i < 5; i++) {
      const result = resolveWelcomeHomeBackground();
      expect(result.source).toBe("member-choice");
      expect(result.backgroundId).toBe("greenhouse");
    }
  });

  it("refresh (a fresh call against unchanged storage) restores the saved choice", () => {
    setRoomBackdropOverride("welcome-home", "tea-room");
    const beforeRefresh = resolveWelcomeHomeBackground();
    // A refresh is nothing more than a brand-new call reading the same
    // localStorage state — there is no cache to invalidate.
    const afterRefresh = resolveWelcomeHomeBackground();
    expect(afterRefresh).toEqual(beforeRefresh);
    expect(afterRefresh.backgroundId).toBe("tea-room");
  });

  it("member choice is not overridden by unrelated chat or Clear My Mind preferences", () => {
    setChatBackdropId("fireside-deck");
    setClearMyMindBackdropId("sunroom");
    setRoomBackdropOverride("welcome-home", "reading-nook");
    const result = resolveWelcomeHomeBackground();
    expect(result.source).toBe("member-choice");
    expect(result.backgroundId).toBe("reading-nook");
  });

  it("does not read the general chat backdrop or Clear My Mind preference at all", () => {
    setChatBackdropId("fireside-deck");
    setClearMyMindBackdropId("greenhouse");
    // No welcome-home room override set.
    const result = resolveWelcomeHomeBackground();
    expect(result.source).toBe("default");
    expect(result.imageUrl).toBe(WELCOME_HOME_BACKGROUND);
    expect(result.imageUrl).not.toBe(
      estateBackgroundPath("fireside-deck-background.PNG"),
    );
  });

  it("output metadata reports the correct source and reason for a member choice", () => {
    setRoomBackdropOverride("welcome-home", "library");
    const result = resolveWelcomeHomeBackground();
    expect(result.place).toBe("welcome-home");
    expect(result.source).toBe("member-choice");
    expect(result.memberSelected).toBe(true);
    expect(result.temporary).toBe(false);
    expect(result.recommendationOnly).toBe(false);
    expect(result.persistencePolicy).toBe("member-preference");
    expect(result.reason).toBe("member's saved choice for this place");
    expect(result.recommendation).toBeNull();
  });

  it("output metadata reports the correct source and reason for the default", () => {
    const result = resolveWelcomeHomeBackground();
    expect(result.place).toBe("welcome-home");
    expect(result.source).toBe("default");
    expect(result.memberSelected).toBe(false);
    expect(result.persistencePolicy).toBe("not-persisted");
    expect(result.reason).toContain("no dedicated experience");
  });

  it("resolveWelcomeHomeHeroImageUrl stays a thin wrapper returning the resolution's imageUrl", () => {
    setRoomBackdropOverride("welcome-home", "fireside-deck");
    const resolution = resolveWelcomeHomeBackground();
    expect(resolveWelcomeHomeHeroImageUrl()).toBe(resolution.imageUrl);
  });

  it("no other room shell has started using resolveEstateBackground yet (Batch 4 scope)", () => {
    const otherRoomFiles = [
      "components/companion/CreateEstateRoomShell.tsx",
      "components/companion/CalendarRoomShell.tsx",
      "components/companion/boardroom/BoardroomRoomShell.tsx",
      "components/companion/chamber/ChamberOfMomentumRoomShell.tsx",
      "components/companion/stables/StablesRoomShell.tsx",
      "components/companion/estate/EstateRoomFullBleedBackground.tsx",
      "components/companion/WelcomeRoomPanel.tsx",
      "app/companion/CompanionPageClient.tsx",
    ];
    for (const relativePath of otherRoomFiles) {
      const source = readFileSync(
        path.join(process.cwd(), relativePath),
        "utf8",
      );
      expect(source).not.toContain("resolveEstateBackground");
    }
  });
});
