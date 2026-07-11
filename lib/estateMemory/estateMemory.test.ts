import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  __resetEstateMemoryCacheForTests,
  createEmptyEstateMemory,
  getEstateMemory,
  patchEstateMemory,
  resetEstateMemory,
} from "./estateMemoryStore";
import {
  recordEstateConversationTurn,
  recordEstateRoomTransition,
} from "./estateMemoryContinuity";
import { estateMemoryHintForChat } from "./estateMemoryHint";

describe("Estate Memory Store", () => {
  beforeEach(() => {
    __resetEstateMemoryCacheForTests();
    vi.stubGlobal("sessionStorage", {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
    });
    resetEstateMemory();
  });

  it("persists memory in sessionStorage across reads", () => {
    patchEstateMemory((mem) => ({
      ...mem,
      emotionalState: { ...mem.emotionalState, current: "overwhelmed" },
    }));
    __resetEstateMemoryCacheForTests();
    expect(getEstateMemory().emotionalState.current).toBe("overwhelmed");
  });
});

describe("Estate Memory Continuity", () => {
  beforeEach(() => {
    __resetEstateMemoryCacheForTests();
    resetEstateMemory();
  });

  it("carries overwhelm and goals across turns without resetting", () => {
    recordEstateConversationTurn({
      userText: "I'm overwhelmed and don't know where to start",
      emotionalLabel: "overwhelmed",
      overwhelmed: true,
    });
    recordEstateConversationTurn({
      userText: "I don't know where to start",
      emotionalLabel: "stuck",
    });

    const mem = getEstateMemory();
    expect(mem.emotionalState.current).toBe("stuck");
    expect(mem.activeJourney.activeTask).toMatch(/progress|overwhelm/i);
    expect(mem.momentumState.unfinishedLoops.length).toBeGreaterThan(0);
    expect(mem.conversationDigest.length).toBe(2);
  });

  it("records room transitions without clearing prior journey", () => {
    recordEstateConversationTurn({
      userText: "I'm overwhelmed",
      emotionalLabel: "overwhelmed",
      overwhelmed: true,
    });
    recordEstateRoomTransition({
      toSection: "momentum-builder",
      reason: "intent routing",
      userText: "I'm overwhelmed",
      fromSection: "home",
    });
    recordEstateConversationTurn({
      userText: "I need to clear my head",
      emotionalLabel: "calm",
    });
    recordEstateRoomTransition({
      toSection: "brain-dump",
      reason: "intent routing",
      userText: "I need to clear my head",
      fromSection: "momentum-builder",
    });

    const mem = getEstateMemory();
    expect(mem.activeJourney.steps.length).toBe(2);
    expect(mem.lastTransition?.toEntryId).toBe("clear-my-mind");
    expect(mem.conversationDigest.length).toBeGreaterThanOrEqual(2);
    expect(mem.activeJourney.activeTask).toBeTruthy();
  });

  it("injects continuity hint with journey and emotional thread", () => {
    const mem = createEmptyEstateMemory();
    mem.emotionalState.current = "overwhelmed";
    mem.activeJourney.activeTask = "make progress today";
    mem.activeJourney.steps = [
      {
        entryId: "momentum-builder",
        roomName: "Momentum Builder",
        section: "momentum-builder",
        enteredAt: new Date().toISOString(),
      },
    ];
    mem.conversationDigest = [
      {
        role: "user",
        summary: "I'm overwhelmed",
        at: new Date().toISOString(),
      },
    ];

    const hint = estateMemoryHintForChat(mem);
    expect(hint).toContain("CONTINUITY");
    expect(hint).toContain("overwhelmed");
    expect(hint).toContain("make progress today");
    expect(hint).toContain("Momentum Builder");
    expect(hint).toContain("do not restart");
  });

  it("preserves journey across the four-room success scenario", () => {
    recordEstateConversationTurn({
      userText: "I'm overwhelmed",
      emotionalLabel: "overwhelmed",
      overwhelmed: true,
    });
    recordEstateRoomTransition({
      toSection: "momentum-builder",
      fromSection: "home",
      reason: "intent routing",
      userText: "I'm overwhelmed",
    });
    recordEstateConversationTurn({
      userText: "I don't know where to start",
      emotionalLabel: "stuck",
    });
    recordEstateRoomTransition({
      toSection: "brain-dump",
      fromSection: "momentum-builder",
      reason: "intent routing",
      userText: "I need to clear my head",
    });
    recordEstateConversationTurn({
      userText: "I feel a bit better",
      emotionalLabel: "calm",
    });
    recordEstateRoomTransition({
      toSection: "content-generator",
      fromSection: "brain-dump",
      reason: "intent routing",
      userText: "I want to build a workshop",
    });
    recordEstateConversationTurn({
      userText: "I want to build a workshop",
      activeGoal: "build a workshop",
    });
    recordEstateRoomTransition({
      toSection: "grow-observatory",
      fromSection: "content-generator",
      reason: "intent routing",
      userText: "What tools should I use?",
    });

    const mem = getEstateMemory();
    expect(mem.activeJourney.steps.length).toBe(4);
    expect(mem.emotionalState.history.some((h) => h.label === "overwhelmed")).toBe(
      true,
    );
    expect(mem.activeGoals.some((g) => g.label.includes("workshop"))).toBe(true);
    expect(mem.conversationDigest.length).toBeGreaterThanOrEqual(4);

    const hint = estateMemoryHintForChat(mem);
    expect(hint).toContain("Momentum Builder");
    expect(hint).toContain("do not restart");
  });
});
