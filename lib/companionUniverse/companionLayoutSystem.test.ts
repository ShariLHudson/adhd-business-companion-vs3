import { describe, expect, it } from "vitest";
import {
  COMPANION_LAYOUT_SYSTEM,
  COMPANION_TOOLBELT,
  HOUSE_MAP_NAV,
  LAYOUT_LAYERS,
  ROOM_IMMERSION_BY_PLACE,
  evaluateLayoutSeparation,
  houseMapForPlace,
  layoutSeparationPassed,
  placeForSection,
  resolveCompanionLayout,
} from "./companionLayoutSystem";

describe("Companion Layout System™", () => {
  it("defines four independent layers", () => {
    expect(LAYOUT_LAYERS).toHaveLength(4);
    expect(LAYOUT_LAYERS.map((layer) => layer.id)).toEqual([
      "persistent-ui",
      "environmental",
      "working",
      "relationship",
    ]);
  });

  it("states navigation is not the room", () => {
    expect(COMPANION_LAYOUT_SYSTEM.corePrinciple).toMatch(/navigation/i);
    expect(COMPANION_LAYOUT_SYSTEM.homesteadIsNotNavigation).toBeTruthy();
  });

  it("maps House Map rooms to places", () => {
    const home = HOUSE_MAP_NAV.find((item) => item.id === "home");
    expect(home?.placeId).toBe("living-room");
    expect(houseMapForPlace("window-seat")?.label).toBe("Clear My Mind");
  });

  it("gives Living Room full arrival immersion", () => {
    expect(ROOM_IMMERSION_BY_PLACE["living-room"].level).toBe("full-arrival");
    expect(ROOM_IMMERSION_BY_PLACE["living-room"].environmentSharePercent).toBeGreaterThanOrEqual(
      90,
    );
  });

  it("restrains Focus Studio environment", () => {
    expect(ROOM_IMMERSION_BY_PLACE["focus-studio"].environmentSharePercent).toBeLessThanOrEqual(
      15,
    );
    expect(ROOM_IMMERSION_BY_PLACE["focus-studio"].workingLayerDominant).toBe(
      true,
    );
  });

  it("resolves layout from app section", () => {
    const layout = resolveCompanionLayout({ section: "plan-my-day" });
    expect(layout.placeId).toBe("planning-table");
    expect(layout.immersion.level).toBe("warm-workspace");
  });

  it("maps sections without explicit house map entries", () => {
    expect(placeForSection("visual-focus")).toBe("focus-studio");
    expect(placeForSection("projects")).toBe("workshop");
  });

  it("keeps toolbelt visually secondary", () => {
    const utility = COMPANION_TOOLBELT.filter(
      (item) => item.visualWeight === "utility",
    );
    expect(utility.some((item) => item.id === "settings")).toBe(true);
  });

  it("fails when navigation is hidden for work rooms", () => {
    const checks = evaluateLayoutSeparation({
      navigationHidden: true,
      environmentReplacesAllChrome: false,
      workingLayerVisible: true,
      isArrivalRoom: false,
    });
    expect(layoutSeparationPassed(checks)).toBe(false);
  });

  it("allows full immersion only on arrival", () => {
    const checks = evaluateLayoutSeparation({
      navigationHidden: false,
      environmentReplacesAllChrome: false,
      workingLayerVisible: false,
      isArrivalRoom: true,
    });
    expect(layoutSeparationPassed(checks)).toBe(true);
  });
});
