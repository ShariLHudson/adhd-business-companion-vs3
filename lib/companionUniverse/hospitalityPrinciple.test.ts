import { describe, expect, it } from "vitest";
import {
  copyUsesPersonalizationVoice,
  evaluateHospitalityPrinciple,
  HOSPITALITY_PRINCIPLE,
} from "./hospitalityPrinciple";

describe("The Hospitality Principle", () => {
  it("defines the host vs app distinction", () => {
    expect(HOSPITALITY_PRINCIPLE.guestShouldFeel).toBe("She remembered me.");
    expect(HOSPITALITY_PRINCIPLE.mustNeverFeel).toBe(
      "The app customized itself.",
    );
  });

  it("rejects personalization voice in copy", () => {
    expect(copyUsesPersonalizationVoice("We customized this for you")).toBe(true);
    expect(copyUsesPersonalizationVoice("Good morning.")).toBe(false);
  });

  it("passes when Shari prepares the room in host voice", () => {
    const result = evaluateHospitalityPrinciple({
      placeId: "living-room",
      greeting: "Good morning.",
      invite: "I'm here for you.",
      atmosphere: "Fresh Iowa morning — world waking",
      preparedItems: ["coffee", "tulips"],
    });

    expect(result.passed).toBe(true);
    expect(result.preparation.summary).toContain("coffee");
  });

  it("fails when copy sounds like software personalization", () => {
    const result = evaluateHospitalityPrinciple({
      placeId: "living-room",
      greeting: "Your personalized dashboard is ready.",
      invite: "We customized this experience for you.",
      preparedItems: ["coffee"],
    });

    expect(result.passed).toBe(false);
    expect(result.checks.some((c) => c.id === "host-voice-not-app-voice" && !c.passed)).toBe(
      true,
    );
  });
});
