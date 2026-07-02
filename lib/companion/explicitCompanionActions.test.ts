import { describe, expect, it } from "vitest";
import { resolveExplicitCompanionAction } from "./explicitCompanionActions";

describe("explicitCompanionActions", () => {
  it("opens breathe for explicit breathing exercise requests", () => {
    const action = resolveExplicitCompanionAction(
      "i am stressed and need to do some breathing exercises",
    );
    expect(action?.kind).toBe("open-breathe");
  });

  it("opens spin wheel without asking", () => {
    const action = resolveExplicitCompanionAction("spin the wheel");
    expect(action?.kind).toBe("open-spin-wheel");
  });

  it("starts timer for set a 10 minute timer", () => {
    const action = resolveExplicitCompanionAction(
      "set a 10 minute timer for me",
    );
    expect(action?.kind).toBe("start-timer");
    expect(action && "minutes" in action && action.minutes).toBe(10);
  });

  it("opens breathe when member affirms after breathing exercise offer", () => {
    const action = resolveExplicitCompanionAction(
      "start now",
      "You got: 10-minute breathing exercises. Would you like to start that now?",
    );
    expect(action?.kind).toBe("open-breathe");
  });

  it("starts timer when member affirms after timer offer", () => {
    const action = resolveExplicitCompanionAction(
      "start now",
      "I can set a 10-minute focus timer for you. Want me to start it?",
    );
    expect(action?.kind).toBe("start-timer");
    expect(action && "minutes" in action && action.minutes).toBe(10);
  });

  it("does not treat room navigation as an activity", () => {
    expect(
      resolveExplicitCompanionAction("take me to the music room"),
    ).toBeNull();
  });
});
