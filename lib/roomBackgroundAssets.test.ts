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

  it("uses a direct png url so missing webp plates cannot blank the room", () => {
    expect(roomBackgroundImageCss("/backgrounds/study-hall-background.png")).toBe(
      "url('/backgrounds/study-hall-background.png')",
    );
    expect(roomBackgroundImageCss("/backgrounds/study-hall-background.png")).not.toContain(
      "image-set",
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
