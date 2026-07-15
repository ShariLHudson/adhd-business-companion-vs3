/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import {
  filterLegacyDailyOpeningMessages,
  isLegacyDailyOpeningCopy,
  isSupersededWelcomeHomeGreeting,
  TODAYS_WELCOME_CARD_VERSION,
} from "./legacyDailyOpeningGuard";

describe("legacyDailyOpeningGuard", () => {
  it("detects the retired plain-text opening block", () => {
    const legacy = [
      "What would help most today?",
      "Help Me Restart",
      "Clear My Mind",
      "Check My Day",
      "I also have a new discovery waiting whenever you would like to learn more about Spark.",
    ].join("\n");
    expect(isLegacyDailyOpeningCopy(legacy)).toBe(true);
  });

  it("does not flag Todays Welcome Card copy", () => {
    expect(
      isLegacyDailyOpeningCopy(
        "Good morning, Shari. I'm glad you're here. Choose what would help most, and I'll take you there.",
      ),
    ).toBe(false);
    expect(isLegacyDailyOpeningCopy("Plan or Adapt My Day")).toBe(false);
  });

  it("filters legacy assistant messages and keeps real conversation", () => {
    const filtered = filterLegacyDailyOpeningMessages([
      {
        role: "assistant",
        content:
          "What would help most today?\nHelp Me Restart\nClear My Mind\nCheck My Day",
      },
      { role: "user", content: "I need to plan pricing." },
      { role: "assistant", content: "Let's look at your offer together." },
    ]);
    expect(filtered).toHaveLength(2);
    expect(filtered[0]?.role).toBe("user");
    expect(filtered.map((m) => m.content).join("\n")).not.toMatch(
      /Help Me Restart|Check My Day/i,
    );
  });

  it("marks soft legacy greetings as superseded", () => {
    expect(
      isSupersededWelcomeHomeGreeting(
        "Welcome back. I'm glad you're here. What would help most today?",
      ),
    ).toBe(true);
  });

  it("exports a stable card version marker", () => {
    expect(TODAYS_WELCOME_CARD_VERSION).toBe("todays-welcome-card-v1");
  });

  it("keeps legitimate assistant replies that mention Clear My Mind alone", () => {
    expect(
      isLegacyDailyOpeningCopy(
        "We can clear your mind together whenever you're ready.",
      ),
    ).toBe(false);
  });
});
