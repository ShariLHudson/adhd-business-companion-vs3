/**
 * @vitest-environment node
 * Stage 1A/1B — stale-topic replay fix + conservative subject-pivot detection.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getActiveTopic,
  isNewConversationalSubject,
  processActiveTopicOnUserTurn,
  resetActiveTopicStoreForTests,
  saveActiveTopic,
  topicPreservingFallbackLine,
} from "@/lib/conversationStabilization";
import type { ActiveTopicState } from "@/lib/conversationStabilization/activeTopicTypes";

function stubSession() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", { sessionStorage: storage, dispatchEvent: vi.fn() });
}

function topic(overrides: Partial<ActiveTopicState> = {}): ActiveTopicState {
  return {
    topicId: "t1",
    userGoal: "prioritize my tasks for today",
    unresolvedNeed: "prioritize my tasks for today",
    selectedKnowledgeSources: [],
    responseOwner: "shari",
    status: "ready_to_answer",
    confidence: "medium",
    startedAtTurn: 1,
    updatedAtTurn: 1,
    ...overrides,
  };
}

const CRAFT_SHOW = "I'm thinking about entering a craft show this fall";

describe("Stage 1B — isNewConversationalSubject (conservative)", () => {
  beforeEach(() => {
    stubSession();
    resetActiveTopicStoreForTests();
  });

  it("detects an obvious pivot away from a stale unresolved topic", () => {
    expect(isNewConversationalSubject(CRAFT_SHOW, topic())).toBe(true);
  });

  it("does NOT pivot on a short acknowledgement", () => {
    expect(isNewConversationalSubject("yes please", topic())).toBe(false);
  });

  it("does NOT pivot without a subject-announcing marker", () => {
    // Substantive, unrelated, but no pivot marker — stays conservative.
    expect(
      isNewConversationalSubject("the venue confirmed our booth for saturday", topic()),
    ).toBe(false);
  });

  it("does NOT pivot when the message shares the stored topic's vocabulary", () => {
    const t = topic({
      userGoal: "planning my craft show booth layout",
      unresolvedNeed: "craft show booth layout",
    });
    expect(
      isNewConversationalSubject("what about the craft show booth colors", t),
    ).toBe(false);
  });

  it("does NOT pivot when the message still fits the stored domain", () => {
    const t = topic({
      domain: "client-relationships",
      userGoal: "rebuild trust with a client",
      unresolvedNeed: "rebuild trust with a client",
    });
    // "what about emailing them a follow-up" is still client-relationship work.
    expect(
      isNewConversationalSubject("what about emailing them a follow-up note", t),
    ).toBe(false);
  });

  it("does NOT pivot with no active topic or a resolved topic", () => {
    expect(isNewConversationalSubject(CRAFT_SHOW, null)).toBe(false);
    expect(isNewConversationalSubject(CRAFT_SHOW, topic({ status: "answered" }))).toBe(
      false,
    );
  });
});

describe("Stage 1B — processActiveTopicOnUserTurn clears on pivot, preserves follow-ups", () => {
  beforeEach(() => {
    stubSession();
    resetActiveTopicStoreForTests();
  });

  it("clears a stale unresolved topic when a new subject is announced", () => {
    const first =
      "i want to build relationships with my new clients but don't know where to start";
    processActiveTopicOnUserTurn({ userText: first, turn: 1 });
    expect(getActiveTopic()).toBeTruthy();

    const turn = processActiveTopicOnUserTurn({ userText: CRAFT_SHOW, turn: 2 });
    expect(turn.topic).toBeNull();
    expect(getActiveTopic()).toBeNull();
  });

  it("preserves the topic for a genuine same-subject follow-up", () => {
    const first =
      "i want to build relationships with my new clients but don't know where to start";
    processActiveTopicOnUserTurn({ userText: first, turn: 1 });
    const follow = "how do i build good relationships with those new clients";
    const turn = processActiveTopicOnUserTurn({ userText: follow, turn: 2 });
    expect(turn.topic).toBeTruthy();
  });
});

describe("Stage 1A — topicPreservingFallbackLine answers the current message", () => {
  beforeEach(() => {
    stubSession();
    resetActiveTopicStoreForTests();
  });

  it("does not regenerate from a stale domain topic when given the new message", () => {
    saveActiveTopic(
      topic({
        domain: "client-relationships",
        userGoal: "rebuild trust with a client",
        unresolvedNeed: "rebuild trust with a client",
      }),
    );
    // Argument-less (the old buggy call) anchors to the stale client topic.
    const stale = topicPreservingFallbackLine();
    expect(stale).toMatch(/trust|client|relationship|boundary|follow/i);

    // Stage 1A passes the current message: the reply must not be the stale
    // trust-repair line.
    const fresh = topicPreservingFallbackLine(
      undefined,
      "how do i book a booth at a local craft fair",
    );
    expect(fresh).not.toBe(stale);
    expect(fresh).not.toMatch(/rebuilding trust/i);
  });
});
