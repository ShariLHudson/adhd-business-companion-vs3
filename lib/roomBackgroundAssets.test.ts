import { describe, expect, it } from "vitest";
import {
  backgroundUrlVariants,
  preferredBackgroundPreloadUrl,
  roomBackgroundImageCss,
  webpBackgroundUrl,
} from "./roomBackgroundAssets";

describe("roomBackgroundAssets", () => {
  it("maps png paths to webp with query preserved", () => {
    expect(webpBackgroundUrl("/backgrounds/sunroom-background.png?v=1")).toBe(
      "/backgrounds/sunroom-background.webp?v=1",
    );
  });

  it("builds image-set css for png sources", () => {
    expect(roomBackgroundImageCss("/backgrounds/study-hall-background.png")).toContain(
      "image-set",
    );
    expect(roomBackgroundImageCss("/backgrounds/study-hall-background.png")).toContain(
      ".webp",
    );
  });

  it("preloads the canonical png when no paired webp ships", () => {
    expect(preferredBackgroundPreloadUrl("/backgrounds/study-hall-background.png")).toBe(
      "/backgrounds/study-hall-background.png",
    );
  });

  it("lists png and webp variants for estate room plates", () => {
    expect(backgroundUrlVariants("/backgrounds/evidence-vault-background.png")).toEqual([
      "/backgrounds/evidence-vault-background.png",
      "/backgrounds/evidence-vault-background.webp",
    ]);
    expect(backgroundUrlVariants("/backgrounds/evidence-vault-background.webp")).toEqual([
      "/backgrounds/evidence-vault-background.webp",
      "/backgrounds/evidence-vault-background.png",
    ]);
  });
});
