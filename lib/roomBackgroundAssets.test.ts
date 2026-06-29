import { describe, expect, it } from "vitest";
import {
  preferredBackgroundPreloadUrl,
  roomBackgroundImageCss,
  webpBackgroundUrl,
} from "./roomBackgroundAssets";

describe("roomBackgroundAssets", () => {
  it("maps png paths to webp with query preserved", () => {
    expect(webpBackgroundUrl("/backgrounds/clear-my-mind-background.png?v=1")).toBe(
      "/backgrounds/clear-my-mind-background.webp?v=1",
    );
  });

  it("builds image-set css for png sources", () => {
    expect(roomBackgroundImageCss("/backgrounds/plan-my-day-background.png")).toContain(
      "image-set",
    );
    expect(roomBackgroundImageCss("/backgrounds/plan-my-day-background.png")).toContain(
      ".webp",
    );
  });

  it("prefers webp for preload when source is png", () => {
    expect(preferredBackgroundPreloadUrl("/backgrounds/plan-my-day-background.png")).toBe(
      "/backgrounds/plan-my-day-background.webp",
    );
  });
});
