import { describe, expect, it } from "vitest";
import {
  SOCIAL_PROFILE_FIELDS,
  socialProfileOpenHref,
  socialProfileUrlHint,
} from "./socialProfileUrls";

describe("socialProfileUrls", () => {
  it("lists platforms in Online Presence display order", () => {
    expect(SOCIAL_PROFILE_FIELDS.map((f) => f.id)).toEqual([
      "website",
      "facebook",
      "instagram",
      "linkedin",
      "tiktok",
      "pinterest",
    ]);
  });

  it("accepts common TikTok and Pinterest profile URLs", () => {
    expect(
      socialProfileUrlHint("tiktok", "https://www.tiktok.com/@username"),
    ).toBeNull();
    expect(
      socialProfileUrlHint("pinterest", "https://www.pinterest.com/username/"),
    ).toBeNull();
    expect(socialProfileOpenHref("https://www.tiktok.com/@me")).toContain(
      "tiktok.com",
    );
  });

  it("hints when a URL looks like the wrong platform without blocking", () => {
    const hint = socialProfileUrlHint(
      "tiktok",
      "https://www.facebook.com/someone",
    );
    expect(hint).toMatch(/tiktok/i);
  });

  it("treats empty URLs as fine", () => {
    expect(socialProfileUrlHint("pinterest", "")).toBeNull();
    expect(socialProfileOpenHref("")).toBeNull();
  });
});
