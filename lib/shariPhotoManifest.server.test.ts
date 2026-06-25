import { describe, expect, it } from "vitest";
import { detectShariImagesOnDisk } from "./shariPhotoManifest.server";
import { ASSETS } from "./companionUi";

describe("detectShariImagesOnDisk", () => {
  it("detects the default profile and gallery images", () => {
    const images = detectShariImagesOnDisk();
    expect(images).toContain(ASSETS.profile);
    expect(images.length).toBeGreaterThanOrEqual(27);
    expect(images.some((src) => src.includes("/images/shari/shari-images/"))).toBe(
      true,
    );
  });
});
