import { describe, expect, it } from "vitest";
import { evaluatePresenceIntelligence } from "./evaluatePresenceIntelligence";
import { mapPresenceToGuestPreparation } from "./mapToGuestPreparation";
import { violatesPresenceVoice } from "./rules";

describe("evaluatePresenceIntelligence", () => {
  it("prepares coffee silently for morning coffee guests", () => {
    const result = evaluatePresenceIntelligence({
      sessionVisitIndex: 5,
      timeOfDay: "morning",
      favoriteDrink: "coffee",
      chronotype: "morning",
      visitEnergy: "high",
    });

    expect(result.preparation.drink).toBe("coffee");
    expect(result.preparation.mugOnTable).toBe(true);
    expect(mapPresenceToGuestPreparation(result.preparation).line).toBeNull();
  });

  it("prepares tea and blanket for recovery without announcing", () => {
    const result = evaluatePresenceIntelligence({
      sessionVisitIndex: 3,
      timeOfDay: "evening",
      recoveryGentle: true,
      visitEnergy: "recovery",
    });

    expect(result.preparation.drink).toBe("tea");
    expect(result.preparation.blanketFoldedNearby).toBe(true);
    expect(result.preparation.roomQuieter).toBe(true);
    expect(mapPresenceToGuestPreparation(result.preparation).line).toBeNull();
  });

  it("prefers tea at night for night chronotype", () => {
    const result = evaluatePresenceIntelligence({
      sessionVisitIndex: 8,
      timeOfDay: "night",
      chronotype: "night",
      favoriteDrink: "tea",
      visitEnergy: "steady",
    });

    expect(result.preparation.drink).toBe("tea");
    expect(result.preparation.teaSetReady).toBe(true);
  });

  it("adds hopeful light after a recent win", () => {
    const result = evaluatePresenceIntelligence({
      sessionVisitIndex: 12,
      timeOfDay: "afternoon",
      projectRecentlyCompleted: true,
      visitEnergy: "steady",
    });

    expect(result.preparation.hopefulLight).toBe(true);
    expect(result.preparation.freshFlowers).toBe(true);
  });

  it("prefers silence for kin relationship on some visits", () => {
    const result = evaluatePresenceIntelligence({
      sessionVisitIndex: 2000,
      timeOfDay: "morning",
      visitEnergy: "steady",
      isFirstMeeting: false,
    });

    expect(result.posture.relationshipDepth).toBe("kin");
    expect(result.posture.preferSilence).toBe(true);
  });
});

describe("violatesPresenceVoice", () => {
  it("flags memory and monitoring narration", () => {
    expect(violatesPresenceVoice("I remembered you love tea.")).toBe(true);
    expect(violatesPresenceVoice("Based on your previous activity…")).toBe(true);
    expect(violatesPresenceVoice("I've been wondering how things have been going.")).toBe(
      false,
    );
  });
});
