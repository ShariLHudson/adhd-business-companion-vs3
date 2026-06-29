import { describe, expect, it } from "vitest";
import { resolveHomeMode } from "./homeMode";

describe("resolveHomeMode", () => {
  it("returns welcome before the user chats on home", () => {
    expect(
      resolveHomeMode({
        activeSection: "home",
        homeCalm: true,
        hasUserMessages: false,
      }),
    ).toBe("welcome");
  });

  it("returns chat after the first user message", () => {
    expect(
      resolveHomeMode({
        activeSection: "home",
        homeCalm: false,
        hasUserMessages: true,
      }),
    ).toBe("chat");
  });

  it("returns null off home", () => {
    expect(
      resolveHomeMode({
        activeSection: "focus",
        homeCalm: true,
        hasUserMessages: false,
      }),
    ).toBeNull();
  });
});
