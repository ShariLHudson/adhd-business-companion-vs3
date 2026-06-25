import { describe, expect, it } from "vitest";
import {
  isShariImageFilename,
  publicUrlFromPublicRelative,
  sortShariPhotoUrls,
} from "./shariPhotoManifest";
import { ASSETS } from "./companionUi";

describe("shariPhotoManifest", () => {
  it("encodes filenames with spaces for public URLs", () => {
    expect(
      publicUrlFromPublicRelative("images/shari/shari-images/shari-reaching-out (1).png"),
    ).toBe("/images/shari/shari-images/shari-reaching-out%20(1).png");
  });

  it("sorts profile first", () => {
    const sorted = sortShariPhotoUrls([
      "/images/shari/shari-images/shari-thinking.png",
      ASSETS.profile,
      "/images/shari/shari-images/shari-warm-headshot.png",
    ]);
    expect(sorted[0]).toBe(ASSETS.profile);
  });

  it("accepts common image extensions", () => {
    expect(isShariImageFilename("shari-warm-headshot.png")).toBe(true);
    expect(isShariImageFilename("readme.txt")).toBe(false);
  });
});
