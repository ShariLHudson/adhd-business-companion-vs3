import { describe, expect, it } from "vitest";
import { ASSETS } from "./companionUi";
import {
  APPROVED_COMPANION_PHOTOS,
  pickCompanionPhoto,
  pickNextCompanionPhoto,
  shariImageStateToPhotoContext,
} from "./companionPhotoLibrary";
import { pickDailyShariPhoto, SHARI_ROTATION_PHOTOS } from "./shariPhotoRotation";

describe("companionPhotoLibrary", () => {
  it("maps shari image states to photo contexts", () => {
    expect(shariImageStateToPhotoContext("celebration")).toBe("celebration");
    expect(shariImageStateToPhotoContext("focus")).toBe("planning");
    expect(shariImageStateToPhotoContext("morning")).toBe("returning");
  });

  it("picks from the approved library", () => {
    const photo = pickCompanionPhoto("welcome", { available: [ASSETS.profile] });
    expect(APPROVED_COMPANION_PHOTOS.map((p) => p.src)).toContain(photo);
  });

  it("rotates to a different photo when multiple are available", () => {
    const pool = [ASSETS.profile, "/images/shari/shari-1.jpg"];
    const first = pickCompanionPhoto("welcome", { available: pool });
    const next = pickNextCompanionPhoto(first, "welcome", pool);
    expect(pool).toContain(next);
  });
});

describe("shariPhotoRotation", () => {
  it("picks a daily photo from the approved library", () => {
    const photo = pickDailyShariPhoto("welcome");
    expect(SHARI_ROTATION_PHOTOS).toContain(photo);
  });
});
