import { describe, expect, it } from "vitest";
import { resolvePresence } from "@/lib/companionConstitution";
import {
  evaluateFocusLandscape,
  FOCUS_LANDSCAPE_SPACES,
  FOCUS_TOOL_TO_SPACE,
  spaceForFocusTool,
  violatesFocusLandscapeRule,
  canTransition,
} from "./index";

describe("Focus Landscape™ — Focus My Brain™", () => {
  it("maps I'm Stuck to Garden Path™", () => {
    const verdict = evaluateFocusLandscape({
      workspaceId: "focus-category",
      focusCategoryId: "stuck",
    });
    expect(verdict.spaceId).toBe("garden-path");
    expect(verdict.placeId).toBe("garden-path");
    expect(verdict.subtitle).toMatch(/next step/i);
  });

  it("maps I Need a Break to Meadow / Lake™ center hub", () => {
    const verdict = evaluateFocusLandscape({
      workspaceId: "focus-category",
      focusCategoryId: "need-break",
    });
    expect(verdict.spaceId).toBe("meadow-lake");
    expect(verdict.placeId).toBe("sunroom-over-pond");
  });

  it("routes every focus tool to a landscape space", () => {
    expect(spaceForFocusTool("walk-reminder")).toBe("horizon-trail");
    expect(spaceForFocusTool("sensory-reset")).toBe("deep-forest");
    expect(spaceForFocusTool("calm-audio")).toBe("forest-pavilion");
    expect(spaceForFocusTool("brain-break-games")).toBe("meadow-object-field");
    expect(Object.keys(FOCUS_TOOL_TO_SPACE).length).toBeGreaterThanOrEqual(10);
  });

  it("hub defaults to meadow-lake center", () => {
    const verdict = evaluateFocusLandscape({ workspaceId: "focus-hub" });
    expect(verdict.spaceId).toBe("meadow-lake");
    expect(verdict.connectedSpaces).toContain("garden-path");
  });

  it("defines six primary landscape spaces in catalog", () => {
    expect(FOCUS_LANDSCAPE_SPACES["deep-forest"].hubRole).toBe("subspace");
    expect(FOCUS_LANDSCAPE_SPACES["garden-path"].hubRole).toBe("entry");
    expect(FOCUS_LANDSCAPE_SPACES["meadow-lake"].hubRole).toBe("center");
  });

  it("uses spatial transitions — never modals", () => {
    const verdict = evaluateFocusLandscape({ toolId: "walk-reminder" });
    expect(verdict.transition).toBe("walk-forward");
    expect(verdict.dataAttributes["data-focus-transition"]).toBeTruthy();
    expect(violatesFocusLandscapeRule("modal-transition")).toBe(true);
  });

  it("allows natural movement between connected spaces", () => {
    expect(canTransition("meadow-lake", "forest-pavilion")).toBe(true);
    expect(canTransition("garden-path", "deep-forest")).toBe(false);
  });

  it("assigns nearby or ambient Shari — never central", () => {
    const stuck = evaluateFocusLandscape({
      workspaceId: "focus-category",
      focusCategoryId: "stuck",
    });
    const deep = evaluateFocusLandscape({ toolId: "sensory-reset" });
    expect(stuck.dataAttributes["data-sharis-presence"]).toBeUndefined();
    expect(
      resolvePresence({
        workspaceId: "focus-category",
        placeId: stuck.placeId,
      }).sharisState,
    ).toBe("nearby");
    expect(
      resolvePresence({
        workspaceId: "focus-category",
        placeId: deep.placeId,
      }).sharisState,
    ).toBe("nearby");
  });
});
