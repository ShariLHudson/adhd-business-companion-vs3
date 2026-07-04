import { describe, expect, it } from "vitest";
import {
  ESTATE_ROOM_BG,
  estateRoomBackgroundCandidates,
} from "./estateRoomAssets";
import { MEMBER_ESTATE_PLACE_NAMES } from "./estateMemberPlaceNames";
import { resolveCanonicalPlaceBackgroundCandidates } from "./estatePlaceMedia";

describe("estateRoomBackgroundCandidates", () => {
  it("lists pool plate for summer terrace", () => {
    expect(estateRoomBackgroundCandidates("summer-terrace")[0]).toBe(
      "/backgrounds/water-swimming-pool-private-background.png",
    );
  });

  it("lists celebration hall plate for celebration room", () => {
    expect(estateRoomBackgroundCandidates("celebration-room")[0]).toBe(
      "/backgrounds/room-celebration-hall-background.png",
    );
  });

  it("lists estate library with personal library fallback", () => {
    expect(estateRoomBackgroundCandidates("library")).toEqual([
      ESTATE_ROOM_BG.library,
      "/backgrounds/room-library-personal-background.png",
      "/backgrounds/reading-nook-under-stairway-background.png",
    ]);
  });

  it("lists clear my mind sunroom plate", () => {
    expect(estateRoomBackgroundCandidates("clear-my-mind")[0]).toBe(
      "/backgrounds/sunroom-background.png",
    );
  });

  it("dedupes when primary equals fallback", () => {
    const candidates = estateRoomBackgroundCandidates(
      "portfolio",
      ESTATE_ROOM_BG.portfolio,
    );
    expect(candidates[0]).toBe(
      "/backgrounds/accomplisments-room-background.png",
    );
  });
});

describe("member-facing place backgrounds", () => {
  it.each(MEMBER_ESTATE_PLACE_NAMES)(
    "$memberName has a background plate",
    ({ placeId }) => {
      const candidates = resolveCanonicalPlaceBackgroundCandidates(placeId);
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0]).toMatch(/^\/backgrounds\//);
    },
  );
});
