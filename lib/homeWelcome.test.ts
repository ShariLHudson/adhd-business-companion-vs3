import { describe, expect, it } from "vitest";
import {
  getRotatingShariPhoto,
  shouldShowIntroCopy,
  SHARI_HOME_PHOTOS,
} from "./homeWelcome";

describe("homeWelcome", () => {
  it("shows intro copy for first three visits", () => {
    expect(shouldShowIntroCopy(1)).toBe(true);
    expect(shouldShowIntroCopy(3)).toBe(true);
    expect(shouldShowIntroCopy(4)).toBe(false);
  });

  it("rotates photo from approved home images", () => {
    const photo = getRotatingShariPhoto();
    expect(SHARI_HOME_PHOTOS).toContain(photo);
  });
});
