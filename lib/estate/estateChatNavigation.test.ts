import { describe, expect, it } from "vitest";
import { resolveEstatePlaceAudioHostPlaceId } from "./estateChatNavigation";
import type { DirectEstateVisit } from "./directEstateVisit";

const coffeeVisit: DirectEstateVisit = {
  roomId: "coffee-house",
  section: "focus-audio",
  userIntent: "take me to the coffee house",
  userMessageCountAtArrival: 0,
};

describe("resolveEstatePlaceAudioHostPlaceId", () => {
  it("plays coffee-house ambience only while the direct overlay is active", () => {
    expect(
      resolveEstatePlaceAudioHostPlaceId({
        directEstateVisit: coffeeVisit,
        showDirectEstateOverlay: true,
        estatePresenceRoomId: "coffee-house",
        showGlobalEstatePresence: true,
      }),
    ).toBe("coffee-house");
  });

  it("stops coffee-house ambience when member left for home chat", () => {
    expect(
      resolveEstatePlaceAudioHostPlaceId({
        directEstateVisit: coffeeVisit,
        showDirectEstateOverlay: false,
        estatePresenceRoomId: "coffee-house",
        showGlobalEstatePresence: false,
      }),
    ).toBeNull();
  });

  it("does not use stale direct visit when immersive presence is off", () => {
    expect(
      resolveEstatePlaceAudioHostPlaceId({
        directEstateVisit: coffeeVisit,
        showDirectEstateOverlay: false,
        estatePresenceRoomId: null,
        showGlobalEstatePresence: false,
      }),
    ).toBeNull();
  });

  it("uses section presence when overlay is off but immersive room is active", () => {
    expect(
      resolveEstatePlaceAudioHostPlaceId({
        directEstateVisit: null,
        showDirectEstateOverlay: false,
        estatePresenceRoomId: "peaceful-places",
        showGlobalEstatePresence: true,
      }),
    ).toBe("peaceful-places");
  });

  it("plays welcome-home ambience while Welcome Home lobby is primary", () => {
    expect(
      resolveEstatePlaceAudioHostPlaceId({
        directEstateVisit: null,
        showDirectEstateOverlay: false,
        estatePresenceRoomId: null,
        showGlobalEstatePresence: false,
        welcomeHomePrimary: true,
      }),
    ).toBe("welcome-home");
  });

  it("does not force welcome-home when another place is already on screen", () => {
    expect(
      resolveEstatePlaceAudioHostPlaceId({
        directEstateVisit: coffeeVisit,
        showDirectEstateOverlay: true,
        estatePresenceRoomId: "coffee-house",
        showGlobalEstatePresence: true,
        welcomeHomePrimary: true,
      }),
    ).toBe("coffee-house");
  });
});
