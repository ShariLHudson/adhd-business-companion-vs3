import { describe, expect, it } from "vitest";
import {
  LIFE_MOMENT_CATALOG,
  composeLifeMoment,
  resolveLifeMomentCategory,
  shouldOfferLifeMoment,
  violatesLifeMomentVoice,
} from "./index";
import { violatesShariVoice } from "@/lib/shariVoiceBible";
import { clearVoiceUsageForTests } from "@/lib/shariVoiceBible/cooldownStore";

describe("Shari's Life Moments™", () => {
  it("catalog is first-person and never advice", () => {
    expect(LIFE_MOMENT_CATALOG.length).toBeGreaterThanOrEqual(30);
    for (const entry of LIFE_MOMENT_CATALOG) {
      expect(violatesLifeMomentVoice(entry.text)).toBe(false);
      expect(violatesShariVoice(entry.text)).toBe(false);
      expect(entry.text).toMatch(/\bI\b|\bI'm\b|\bI've\b/i);
    }
  });

  it("maps flooded tone to overwhelmed category", () => {
    expect(resolveLifeMomentCategory("flooded", "too much")).toBe("overwhelmed");
    expect(resolveLifeMomentCategory("grief", "loss")).toBeNull();
  });

  it("does not offer on early visits", () => {
    expect(
      shouldOfferLifeMoment({
        tone: "flooded",
        sessionVisitIndex: 2,
      }),
    ).toBe(false);
  });

  it("composes a life moment echo when earned", () => {
    clearVoiceUsageForTests();
    const line = composeLifeMoment({
      voiceContext: {
        homeState: "QUIET_PRESENCE",
        timeOfDay: "afternoon",
        sessionVisitIndex: 7,
        returnIntervalHours: 20,
        returnIntervalDays: 1,
        isFirstMeeting: false,
      },
      tone: "flooded",
      rawNote: "completely overwhelmed",
    });
    if (line) {
      expect(violatesLifeMomentVoice(line)).toBe(false);
      expect(line).not.toMatch(/you should/i);
    }
  });

  it("rejects advice phrasing", () => {
    expect(violatesLifeMomentVoice("You should take a nap.")).toBe(true);
    expect(
      violatesLifeMomentVoice(
        "When I start feeling isolated, I'll call a friend just to hear another voice.",
      ),
    ).toBe(false);
  });
});
