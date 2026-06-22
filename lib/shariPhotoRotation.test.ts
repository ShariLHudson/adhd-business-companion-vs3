import { describe, expect, it } from "vitest";
import { ASSETS } from "./companionUi";
import { pickDailyShariPhoto } from "./shariPhotoRotation";

describe("shariPhotoRotation", () => {
  it("uses the default profile photo", () => {
    expect(pickDailyShariPhoto()).toBe(ASSETS.profile);
  });
});
