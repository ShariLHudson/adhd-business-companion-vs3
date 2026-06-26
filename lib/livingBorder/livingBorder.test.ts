import { describe, expect, it } from "vitest";
import {
  centerAllowsBorderLife,
  evaluateLivingBorder,
  filterLivingChangesToBorder,
  livingBorderCatalogForPlace,
  passesLivingBorderRecognitionTest,
  visibleBorderRenderClasses,
} from "./index";

describe("Living Border™", () => {
  it("Window Seat™ has landscape and wildlife at borders", () => {
    const catalog = livingBorderCatalogForPlace("window-seat");
    expect(catalog.elements).toContain("landscape");
    expect(catalog.elements).toContain("bird");
  });

  it("center never hosts border life", () => {
    expect(centerAllowsBorderLife()).toBe(false);
  });

  it("evaluates visible border elements for clear my mind workspace", () => {
    const verdict = evaluateLivingBorder({
      workspaceId: "clear-my-mind",
      timeOfDay: "morning",
    });
    expect(verdict.centerStable).toBe(true);
    expect(verdict.placeId).toBe("window-seat");
    expect(verdict.activeElements.some((e) => e.visible)).toBe(true);
  });

  it("evening activates lamp and candle at border", () => {
    const verdict = evaluateLivingBorder({
      placeId: "living-room",
      timeOfDay: "evening",
    });
    const lamp = verdict.activeElements.find((e) => e.id === "lamp-glow");
    const candle = verdict.activeElements.find((e) => e.id === "candle");
    expect(lamp?.visible).toBe(true);
    expect(candle?.visible).toBe(true);
    expect(verdict.animatedCount).toBeLessThanOrEqual(3);
    expect(verdict.mustNotDistract).toBe(true);
  });

  it("rain shows border rain element only", () => {
    const verdict = evaluateLivingBorder({
      placeId: "window-seat",
      weather: "rain",
    });
    const rain = verdict.activeElements.find((e) => e.id === "rain");
    expect(rain?.visible).toBe(true);
    expect(rain?.animated).toBe(true);
  });

  it("passes recognition test with enough visible border life", () => {
    const verdict = evaluateLivingBorder({
      placeId: "living-room",
      season: "summer",
      timeOfDay: "afternoon",
    });
    expect(passesLivingBorderRecognitionTest(verdict)).toBe(true);
  });

  it("dedupes CSS render classes", () => {
    const verdict = evaluateLivingBorder({ placeId: "window-seat" });
    const classes = visibleBorderRenderClasses(verdict);
    expect(classes.length).toBe(new Set(classes).size);
  });

  it("filters center-targeting living changes", () => {
    const filtered = filterLivingChangesToBorder([
      {
        id: "bad",
        bucket: "environmental",
        priority: "delight",
        sourceModule: "test",
        cause: "center-panel-flash",
      },
      {
        id: "ok",
        bucket: "environmental",
        priority: "weather",
        sourceModule: "test",
        cause: "rain-on-glass",
        motion: { enable: ["rain"] },
      },
    ]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("ok");
  });

  it("caps simultaneous border animations so work is never distracted", () => {
    const verdict = evaluateLivingBorder({
      placeId: "window-seat",
      timeOfDay: "evening",
      weather: "rain",
      wildlife: "cardinal",
      showMugSteam: true,
    });
    expect(verdict.animatedCount).toBeLessThanOrEqual(3);
    expect(verdict.mustNotDistract).toBe(true);
    expect(verdict.dataAttributes["data-living-border-subtle"]).toBe("1");
  });
});
