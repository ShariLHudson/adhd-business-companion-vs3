import { describe, expect, it } from "vitest";

import {

  allFocusHubTools,

  distinctRecommendedOutcomes,

  FOCUS_FEELING_ENTRIES,

  focusHubDropdownTools,

  focusHubOpensSidebarTool,

  focusFeelingById,

  missingRequiredFocusAssets,

  recommendedToolForFeeling,

} from "./focusHub";



describe("Focus V2 — feelings first, tools second", () => {

  it("shows two sanctuary entry points on the hub", () => {

    expect(FOCUS_FEELING_ENTRIES).toHaveLength(2);

    expect(FOCUS_FEELING_ENTRIES.map((f) => f.label)).toEqual([

      "I'm Stuck",

      "I Need A Break",

    ]);

  });



  it("keeps all required focus assets reachable", () => {

    expect(missingRequiredFocusAssets()).toEqual([]);

  });



  it("reaches Peaceful Places from I Need A Break", () => {

    expect(allFocusHubTools().some((t) => t.id === "focus-audio")).toBe(true);

    expect(allFocusHubTools().some((t) => t.label === "Peaceful Places")).toBe(

      true,

    );

  });



  it("recommends First Step Finder for I'm Stuck", () => {

    expect(recommendedToolForFeeling("stuck")?.id).toBe("next-small-step");

    expect(recommendedToolForFeeling("stuck")?.label).toBe("First Step Finder");

  });



  it("recommends Most People Start Here for I Need A Break", () => {

    expect(recommendedToolForFeeling("need-break")?.label).toBe(

      "Most People Start Here",

    );

  });



  it("gives each feeling a distinct recommended outcome", () => {

    expect(distinctRecommendedOutcomes()).toBe(true);

  });



  it("keeps core Focus menu tools reachable from the hub", () => {

    const coreTools = ["breathe", "focus-audio"] as const;

    for (const tool of coreTools) {

      expect(focusHubOpensSidebarTool(tool)).toBe(true);

    }

  });



  it("exposes three dropdown tools for each feeling", () => {

    const stuck = focusFeelingById("stuck");

    const needBreak = focusFeelingById("need-break");

    expect(stuck && focusHubDropdownTools(stuck)).toHaveLength(3);

    expect(stuck && focusHubDropdownTools(stuck).map((t) => t.label)).toEqual([
      "First Step Finder",
      "Break It Into Smaller Pieces",
      "Prioritize My Options",
    ]);

    expect(needBreak && focusHubDropdownTools(needBreak)).toHaveLength(3);

    expect(

      needBreak &&

        focusHubDropdownTools(needBreak).map((t) => t.label),

    ).toEqual(["Most People Start Here", "Peaceful Places", "Momentum Builders"]);

  });

});


