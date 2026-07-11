/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  setChatBackdropId,
  setRoomBackdropOverride,
} from "@/lib/chatBackdrop/chatBackdropPreference";
import { WELCOME_ROOM_ASSET } from "@/lib/welcomeRoom/types";
import { resolveWelcomeHomeHeroImageUrl } from "@/lib/welcomeHome/resolveWelcomeHomeHeroImageUrl";
import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";

describe("resolveWelcomeHomeHeroImageUrl", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  it("uses welcome-home plate when member has not set a room override", () => {
    setChatBackdropId("fireside-deck");
    expect(resolveWelcomeHomeHeroImageUrl()).toBe(WELCOME_ROOM_ASSET);
  });

  it("honors a welcome-home room override when set", () => {
    setRoomBackdropOverride("welcome-home", "library");
    expect(resolveWelcomeHomeHeroImageUrl()).toBe(
      estateBackgroundPath("room-library-estate-background.png"),
    );
  });
});
