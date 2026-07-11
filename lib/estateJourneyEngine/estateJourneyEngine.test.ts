import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetEstateMemoryCacheForTests,
  getEstateMemory,
  resetEstateMemory,
} from "@/lib/estateMemory/estateMemoryStore";
import { recordEstateRoomTransition } from "@/lib/estateMemory/estateMemoryContinuity";
import {
  beginEstateJourneyNewDay,
  buildEstateJourneyReturnGreeting,
  buildJourneySessionSummary,
  estateJourneyHintForChat,
  estateJourneyIntelligenceHint,
  getJourneyEngineState,
  pauseJourneyWork,
  patchJourneyEngine,
  recordJourneyLearning,
  recordJourneyRoomVisit,
} from "@/lib/estateJourneyEngine";

describe("Estate Journey Engine", () => {
  beforeEach(() => {
    __resetEstateMemoryCacheForTests();
    resetEstateMemory();
  });

  it("records compact room history without consecutive duplicates", () => {
    recordJourneyRoomVisit("welcome-home", "Welcome Home");
    recordJourneyRoomVisit("momentum-institute", "Momentum Institute");
    recordJourneyRoomVisit("creative-studio", "Creative Studio");
    recordJourneyRoomVisit("creative-studio", "Creative Studio");

    const journey = getJourneyEngineState();
    expect(journey.roomHistory.map((h) => h.roomName)).toEqual([
      "Welcome Home",
      "Momentum Institute",
      "Creative Studio",
    ]);
  });

  it("pauses work when member leaves mid-task", () => {
    pauseJourneyWork({
      kind: "workshop",
      label: "Spring Workshop",
      entryId: "creative-studio",
      reason: "left room while working",
    });

    const greeting = buildEstateJourneyReturnGreeting();
    expect(greeting).toContain("I'm really glad you're here");
    expect(greeting).not.toMatch(/welcome back/i);
    expect(greeting).toContain("Spring Workshop");
    expect(greeting).toContain("continue where we left off");
  });

  it("surfaces marketing intelligence after sustained study", () => {
    const threeWeeksAgo = new Date(
      Date.now() - 22 * 24 * 60 * 60 * 1000,
    ).toISOString();

    patchJourneyEngine((journey) => ({
      ...journey,
      topicStudy: [
        {
          topic: "marketing",
          firstSeenAt: threeWeeksAgo,
          lastSeenAt: new Date().toISOString(),
          completions: 3,
        },
      ],
    }));

    const hint = estateJourneyIntelligenceHint();
    expect(hint).toContain("marketing");
    expect(hint).toContain("Creative Studio");
  });

  it("begin new day preserves journey and starts fresh conversation session", () => {
    recordJourneyRoomVisit("conservatory", "The Conservatory");
    pauseJourneyWork({ kind: "decision", label: "Pricing decision" });

    const before = getJourneyEngineState();
    const { greeting } = beginEstateJourneyNewDay();
    const after = getJourneyEngineState();

    expect(greeting).toContain("New day");
    expect(after.roomHistory.length).toBe(before.roomHistory.length);
    expect(after.pausedWork.length).toBe(before.pausedWork.length);
    expect(after.newDayCount).toBe(before.newDayCount + 1);
    expect(after.currentConversationId).not.toBe(before.currentConversationId);
    expect(after.activeSessionId).not.toBe(before.activeSessionId);
  });

  it("integrates with estate room transitions", () => {
    recordEstateRoomTransition({
      toSection: "momentum-institute",
      toEntryId: "momentum-institute",
      reason: "member request",
    });
    recordEstateRoomTransition({
      toSection: "brain-dump",
      toEntryId: "conservatory",
      fromSection: "momentum-institute",
      reason: "navigation",
    });

    const memory = getEstateMemory();
    expect(memory.journeyEngine?.roomHistory.length).toBeGreaterThanOrEqual(2);
    const hint = estateJourneyHintForChat();
    expect(hint).toContain("Journey path");
  });

  it("builds optional session summary", () => {
    recordJourneyRoomVisit("stables", "The Stables");
    recordJourneyLearning({
      kind: "lesson",
      label: "Leadership basics",
      status: "completed",
    });

    const summary = buildJourneySessionSummary();
    expect(summary).toBeTruthy();
  });
});
