import { describe, expect, it } from "vitest";
import {
  pickDailyShariPhoto,
  SHARI_ROTATION_PHOTOS,
} from "./shariPhotoRotation";

describe("shariPhotoRotation", () => {
  it("picks from approved rotation paths", () => {
    const photo = pickDailyShariPhoto(new Date("2026-06-12T12:00:00.000Z"));
    expect(SHARI_ROTATION_PHOTOS).toContain(photo);
  });

  it("returns the same photo for the same day", () => {
    const day = new Date("2026-06-12T12:00:00.000Z");
    expect(pickDailyShariPhoto(day)).toBe(pickDailyShariPhoto(day));
  });
});
