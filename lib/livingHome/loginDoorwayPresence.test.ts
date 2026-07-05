import { describe, expect, it } from "vitest";
import {
  LOGIN_DOORWAY_PRESENCE,
  LOGIN_SCENE_ASSET,
} from "./loginDoorwayPresence";

describe("loginDoorwayPresence", () => {
  it("uses the Welcome Home room photograph as the scene source", () => {
    expect(LOGIN_SCENE_ASSET).toMatch(
      /\/backgrounds\/welcome-home-background\.png\?v=/,
    );
  });

  it("keeps the door static with hands inside the house", () => {
    expect(LOGIN_DOORWAY_PRESENCE.doorAnimated).toBe(false);
    expect(LOGIN_DOORWAY_PRESENCE.handsInsideOnly).toBe(true);
    expect(LOGIN_DOORWAY_PRESENCE.processingUsesLightOnly).toBe(true);
  });
});
