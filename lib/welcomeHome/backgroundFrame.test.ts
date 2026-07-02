import { describe, expect, it } from "vitest";
import { welcomeHomeBackgroundFrame } from "./backgroundFrame";

describe("welcomeHomeBackgroundFrame", () => {
  it("fills the viewport edge-to-edge with cover", () => {
    const frame = welcomeHomeBackgroundFrame(1);
    expect(frame.objectFit).toBe("cover");
    expect(frame.objectPosition).toContain("50%");
  });

  it("never scales below 1 so no black rig shows through", () => {
    const wide = welcomeHomeBackgroundFrame(0);
    const settled = welcomeHomeBackgroundFrame(1);
    const wideScale = Number(wide.imageTransform.match(/scale\(([\d.]+)\)/)?.[1]);
    const settledScale = Number(
      settled.imageTransform.match(/scale\(([\d.]+)\)/)?.[1],
    );
    expect(wideScale).toBeGreaterThanOrEqual(1);
    expect(settledScale).toBeGreaterThanOrEqual(1);
    expect(wideScale).toBeGreaterThanOrEqual(settledScale);
  });
});
