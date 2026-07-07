import { describe, expect, it } from "vitest";
import {
  evaluateRoomComposition,
  isCenterForbidden,
  placeForWorkspace,
  validateEnvironmentalPlacement,
  validateShariPlacement,
} from "./index";

describe("Room Composition Rule", () => {
  it("maps Clear My Mind to the original sunroom place slot", () => {
    expect(placeForWorkspace("clear-my-mind")).toBe("greenhouse");
  });

  it("keeps garden light on the right edge in the sunroom", () => {
    const verdict = evaluateRoomComposition({ workspaceId: "clear-my-mind" });
    expect(verdict.signatureFeature.visibleZone).toBe("right");
    expect(verdict.backgroundObjectPosition).toContain("40%");
  });

  it("forbids hero features in center zone", () => {
    expect(isCenterForbidden("fireplace")).toBe(true);
    expect(isCenterForbidden("aquarium")).toBe(true);
    const check = validateEnvironmentalPlacement("aquarium", "center");
    expect(check.allowed).toBe(false);
  });

  it("allows edge motion beside conversation", () => {
    const check = validateEnvironmentalPlacement("curtain-sway", "right");
    expect(check.allowed).toBe(true);
  });

  it("expands protected zone on mobile", () => {
    const desktop = evaluateRoomComposition({ workspaceId: "clear-my-mind" });
    const mobile = evaluateRoomComposition({
      workspaceId: "clear-my-mind",
      mobile: true,
    });
    expect(mobile.protectedConversationZone.maxWidth).toBe("min(100%, 30rem)");
    expect(Number(mobile.cssVars["--room-protected-zone-expand"])).toBeGreaterThan(
      Number(desktop.cssVars["--room-protected-zone-expand"]),
    );
  });

  it("Shari never competes with conversation center", () => {
    expect(validateShariPlacement("left")).toBe(true);
    expect(validateShariPlacement("right")).toBe(true);
  });

  it("Living Room signature stays on right edge", () => {
    const verdict = evaluateRoomComposition({ placeId: "living-room" });
    expect(verdict.signatureFeature.id).toBe("summer-window-right");
  });
});
