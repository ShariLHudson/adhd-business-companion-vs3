import { describe, expect, it } from "vitest";

import { getShariImageState, resolveShariImageSrc } from "@/lib/shariImageState";
import { ASSETS } from "@/lib/companionUi";

describe("getShariImageState", () => {
  it("falls back every state to the default Shari image for now", () => {
    expect(resolveShariImageSrc("morning")).toBe(ASSETS.profile);
    expect(resolveShariImageSrc("birthday")).toBe(ASSETS.profile);
  });

  it("prioritizes birthday over time of day", () => {
    const noon = new Date("2026-06-12T12:00:00");
    const r = getShariImageState({
      now: noon,
      userBirthday: { month: 6, day: 12 },
    });
    expect(r.state).toBe("birthday");
  });

  it("prioritizes app anniversary over season", () => {
    const r = getShariImageState({
      now: new Date("2026-01-15T12:00:00"),
      milestoneCelebration: "app_anniversary",
    });
    expect(r.state).toBe("app_anniversary");
  });

  it("uses overwhelmed support for overwhelmed emotion", () => {
    const r = getShariImageState({
      now: new Date("2026-06-12T14:00:00"),
      emotion: "overwhelmed",
    });
    expect(r.state).toBe("overwhelmed_support");
  });

  it("uses time of day on calm afternoons", () => {
    const r = getShariImageState({
      now: new Date("2026-06-12T14:00:00"),
      emotion: "unclear",
    });
    expect(r.state).toBe("afternoon");
  });

  it("uses recovery support when recovery mode is active", () => {
    const r = getShariImageState({
      now: new Date("2026-06-12T14:00:00"),
      emotion: "unclear",
      recoveryMode: true,
    });
    expect(r.state).toBe("recovery");
  });

  it("uses focus state when focus mode is active", () => {
    const r = getShariImageState({
      now: new Date("2026-06-12T14:00:00"),
      emotion: "unclear",
      focusMode: true,
    });
    expect(r.state).toBe("focus");
  });

  it("prioritizes recovery over focus mode", () => {
    const r = getShariImageState({
      recoveryMode: true,
      focusMode: true,
    });
    expect(r.state).toBe("recovery");
  });
});
