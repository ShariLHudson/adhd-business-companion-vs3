/**
 * @vitest-environment node
 * Phase A — murky-fallback fix (CHAT_REASONING_JOURNEY_GAP_REVIEW.md).
 *
 * Rule: "What's murky?" and equivalent uncertainty-toned questions may only
 * appear when the member expresses genuine confusion / being stuck /
 * uncertainty / overwhelm. They must never replace a clear create / plan /
 * develop / build / improve request.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  expressesClearWorkIntent,
  expressesGenuineUncertainty,
  resetActiveTopicStoreForTests,
  topicPreservingFallbackLine,
} from "@/lib/conversationStabilization";

function stubSession() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", { sessionStorage: storage, dispatchEvent: vi.fn() });
}

describe("Phase A — murky-fallback gate", () => {
  beforeEach(() => {
    stubSession();
    resetActiveTopicStoreForTests();
  });

  describe("expressesClearWorkIntent", () => {
    it("recognizes the founder's five work verbs as clear requests", () => {
      expect(expressesClearWorkIntent("I want to create a workshop.")).toBe(true);
      expect(expressesClearWorkIntent("Let's plan an event for next month.")).toBe(true);
      expect(expressesClearWorkIntent("I need to develop a new offer.")).toBe(true);
      expect(expressesClearWorkIntent("Help me build a checklist.")).toBe(true);
      expect(expressesClearWorkIntent("I'm trying to improve my onboarding.")).toBe(true);
    });

    it("does not fire on a bare noun use of the same words", () => {
      expect(expressesClearWorkIntent("That plan didn't work out.")).toBe(false);
      expect(expressesClearWorkIntent("The build is broken again.")).toBe(false);
    });
  });

  describe("expressesGenuineUncertainty", () => {
    it("recognizes confusion / stuck / uncertainty / overwhelm language", () => {
      expect(expressesGenuineUncertainty("I'm stuck trying to figure out my workshop.")).toBe(true);
      expect(expressesGenuineUncertainty("I don't know where to start.")).toBe(true);
      expect(expressesGenuineUncertainty("Honestly I'm feeling overwhelmed by this.")).toBe(true);
      expect(expressesGenuineUncertainty("This is all so confusing.")).toBe(true);
    });

    it("does not fire on a clear, confident request", () => {
      expect(expressesGenuineUncertainty("I want to create a workshop.")).toBe(false);
    });
  });

  describe("topicPreservingFallbackLine — founder's two required cases", () => {
    it('"I want to create a workshop." never receives a murky/uncertainty question', () => {
      const line = topicPreservingFallbackLine(null, "I want to create a workshop.");
      expect(line).not.toMatch(/murky/i);
      expect(line).not.toMatch(/what feels like the hardest part/i);
      expect(line).not.toMatch(/what part of this should we look at first/i);
      // Forward-moving, not a clarify-only question presuming trouble.
      expect(line).toBe(
        "Got it — tell me a bit more about what you're going for, and let's get moving.",
      );
    });

    it('"I\'m stuck trying to figure out my workshop." keeps clarification/support mode', () => {
      const line = topicPreservingFallbackLine(
        null,
        "I'm stuck trying to figure out my workshop.",
      );
      // Genuine uncertainty — the supportive clarifying question is appropriate here.
      expect(line).toBe("What feels like the hardest part of that for you right now?");
    });
  });

  describe("topicPreservingFallbackLine — clear intent with an active specialty domain", () => {
    it("does not ask the domain's murky question for a clear create request", () => {
      const line = topicPreservingFallbackLine(
        {
          topicId: "t1",
          domain: "ai-technology",
          userGoal: "I want to create a workshop.",
          unresolvedNeed: "I want to create a workshop.",
          selectedKnowledgeSources: [],
          responseOwner: "shari",
          status: "ready_to_answer",
          confidence: "high",
          startedAtTurn: 1,
          updatedAtTurn: 1,
        },
        "I want to create a workshop.",
      );
      expect(line).not.toMatch(/feeling murky/i);
      expect(line).toBe(
        "Got it — tell me a bit more about what you're going for, and let's get moving.",
      );
    });

    it("still asks the domain's specialty question for genuine uncertainty", () => {
      const line = topicPreservingFallbackLine(
        {
          topicId: "t2",
          domain: "ai-technology",
          userGoal: "I'm stuck and not sure where to start with the tech.",
          unresolvedNeed: "I'm stuck and not sure where to start with the tech.",
          selectedKnowledgeSources: [],
          responseOwner: "shari",
          status: "ready_to_answer",
          confidence: "high",
          startedAtTurn: 1,
          updatedAtTurn: 1,
        },
        "I'm stuck and not sure where to start with the tech.",
      );
      expect(line).toMatch(/murky/i);
    });
  });
});
