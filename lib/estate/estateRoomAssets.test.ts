import { describe, expect, it } from "vitest";
import {
  ESTATE_ROOM_BG,
  estateRoomBackgroundCandidates,
} from "./estateRoomAssets";

describe("estateRoomBackgroundCandidates", () => {
  it("lists greenhouse fallbacks for growth profile", () => {
    expect(estateRoomBackgroundCandidates("growth-profile")).toEqual([
      ESTATE_ROOM_BG.greenhouse,
      "/backgrounds/greenhouse-background.webp",
      ESTATE_ROOM_BG.celebrationGarden,
      "/backgrounds/celebration-garden-background.webp",
    ]);
  });

  it("lists clear-my-mind plate for conservatory", () => {
    expect(estateRoomBackgroundCandidates("conservatory")[0]).toBe(
      ESTATE_ROOM_BG.butterflyConservatory,
    );
    expect(estateRoomBackgroundCandidates("conservatory")).toEqual([
      ESTATE_ROOM_BG.butterflyConservatory,
      "/backgrounds/butterfly-conservatory.png",
    ]);
  });

  it("lists library fallbacks", () => {
    expect(estateRoomBackgroundCandidates("library")).toEqual([
      ESTATE_ROOM_BG.library,
      "/backgrounds/main-library-background.webp",
      ESTATE_ROOM_BG.libraryLegacy,
      "/backgrounds/stairway-reading-nook-background.webp",
    ]);
  });

  it("includes png and webp variants for profile destination plates", () => {
    expect(estateRoomBackgroundCandidates("evidence-vault")).toEqual([
      "/backgrounds/evidence-vault-background.png",
      "/backgrounds/evidence-vault-background.webp",
    ]);
    expect(estateRoomBackgroundCandidates("portfolio")).toEqual([
      "/backgrounds/accomplishments-room-background.png",
      "/backgrounds/accomplishments-room-background.webp",
    ]);
  });

  it("dedupes when primary equals fallback", () => {
    const candidates = estateRoomBackgroundCandidates(
      "portfolio",
      ESTATE_ROOM_BG.portfolio,
    );
    expect(candidates).toEqual([
      ESTATE_ROOM_BG.portfolio,
      "/backgrounds/accomplishments-room-background.webp",
    ]);
  });
});
