import { describe, expect, it } from "vitest";
import {
  companionPhotoSrcWithVersion,
  primaryCompanionPhotoSrc,
} from "./companionPhotoCatalog";
import { ASSETS } from "./companionUi";

describe("companionPhotoCatalog", () => {
  it("prefers default profile when in catalog", () => {
    expect(
      primaryCompanionPhotoSrc([
        "/images/shari/shari-images/shari-thinking.png",
        ASSETS.profile,
      ]),
    ).toBe(ASSETS.profile);
  });

  it("falls back to first gallery image when profile missing", () => {
    const first = "/images/shari/shari-images/shari-warm-headshot.png";
    expect(primaryCompanionPhotoSrc([first])).toBe(first);
  });

  it("appends cache-bust version once", () => {
    const url = companionPhotoSrcWithVersion(ASSETS.profile, "abc123");
    expect(url).toBe(`${ASSETS.profile}?v=abc123`);
    expect(companionPhotoSrcWithVersion(url, "abc123")).toBe(url);
  });
});
