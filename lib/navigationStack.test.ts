import { describe, expect, it } from "vitest";

import {
  focusAudioBackLabelForContext,
  isFocusOpenBesideChat,
  NAVIGATION_TEST_MATRIX,
  shouldOpenFocusAudioBesideChat,
} from "./navigationStack";

describe("navigationStack P0.46", () => {
  it("detects Focus open beside chat via workspacePanel", () => {
    expect(
      isFocusOpenBesideChat({
        activeSection: "home",
        workspacePanel: "focus",
        companionStandaloneSection: null,
      }),
    ).toBe(true);
  });

  it("detects Focus open beside chat via companionStandaloneSection", () => {
    expect(
      isFocusOpenBesideChat({
        activeSection: "home",
        workspacePanel: null,
        companionStandaloneSection: "focus",
      }),
    ).toBe(true);
  });

  it("does not treat full-page focus as beside chat", () => {
    expect(
      isFocusOpenBesideChat({
        activeSection: "focus",
        workspacePanel: null,
        companionStandaloneSection: null,
      }),
    ).toBe(false);
  });

  it("routes focus-audio beside chat when Focus is open in split", () => {
    expect(
      shouldOpenFocusAudioBesideChat({
        activeSection: "home",
        workspacePanel: "focus",
        companionStandaloneSection: null,
      }),
    ).toBe(true);
  });

  it("uses I Need A Break back label from need-break feeling", () => {
    expect(
      focusAudioBackLabelForContext({
        focusHubFeeling: "need-break",
        fromFocusBeside: true,
      }),
    ).toBe("I Need A Break");
  });

  it("uses Focus back label when not in need-break", () => {
    expect(
      focusAudioBackLabelForContext({
        focusHubFeeling: null,
        fromFocusBeside: true,
      }),
    ).toBe("Focus");
  });

  it("documents navigation QA matrix for all audited paths", () => {
    expect(NAVIGATION_TEST_MATRIX.length).toBeGreaterThanOrEqual(10);
    const calm = NAVIGATION_TEST_MATRIX.find(
      (row) => row.id === "focus-need-break-calm-audio",
    );
    expect(calm?.steps).toContain("Calm Audio");
    expect(calm?.backExpectations[0]).toBe("I Need A Break");
    expect(
      NAVIGATION_TEST_MATRIX.some((row) => row.id === "decision-compass-wizard"),
    ).toBe(true);
  });
});
