/**
 * Conversational Create Entrance (2026-08-06) — acknowledgment classifier.
 */
import { describe, expect, it } from "vitest";
import {
  acknowledgeEntryText,
  combineEntryConversationText,
  detectEntryTopic,
  ENTRY_ACKNOWLEDGMENTS,
} from "./entryConversation";

describe("acknowledgeEntryText — the 4 approved test-flow examples", () => {
  it('Example 1 — "I need an SOP for onboarding clients."', () => {
    const result = acknowledgeEntryText(
      "I need an SOP for onboarding clients.",
    );
    expect(result.topic).toBe("sop");
    expect(result.message).toBe(
      "I'd be happy to help. Before we start writing steps, let's understand what this process needs to accomplish.",
    );
  });

  it('Example 2 — "I want to plan a workshop."', () => {
    const result = acknowledgeEntryText("I want to plan a workshop.");
    expect(result.topic).toBe("event");
    expect(result.message).toBe(
      "That sounds exciting. Before we think about schedules or materials, who is this workshop meant to help and what do you hope changes for them?",
    );
  });

  it('Example 3 — "I need help marketing my business."', () => {
    const result = acknowledgeEntryText("I need help marketing my business.");
    expect(result.topic).toBe("marketing");
    expect(result.message).toBe(
      "I'd love to help. Before we create a marketing plan, let's understand what you're hoping marketing will accomplish.",
    );
  });

  it('Example 4 — "I have an idea but don\'t know what to do with it."', () => {
    const result = acknowledgeEntryText(
      "I have an idea but don't know what to do with it.",
    );
    expect(result.topic).toBe("idea");
    expect(result.message).toBe(
      "Perfect. Those are often the ideas worth exploring. Tell me what you're imagining.",
    );
  });
});

describe("detectEntryTopic — specificity ordering and fallback", () => {
  it("matches SOP even when 'business' also appears (more specific than marketing)", () => {
    expect(detectEntryTopic("I need an SOP for my business")).toBe("sop");
  });

  it("matches event/workshop language", () => {
    expect(detectEntryTopic("planning a client retreat")).toBe("event");
    expect(detectEntryTopic("hosting a webinar next month")).toBe("event");
  });

  it("matches bare 'marketing' — broader than the existing marketing-plan classifier by design", () => {
    expect(detectEntryTopic("marketing feels impossible right now")).toBe(
      "marketing",
    );
  });

  it("falls back to idea for anything unmatched, including vague statements", () => {
    expect(
      detectEntryTopic("I have an idea but don't know what to do with it."),
    ).toBe("idea");
    expect(detectEntryTopic("not sure yet")).toBe("idea");
    expect(detectEntryTopic("")).toBe("idea");
  });

  it("every topic has exactly one authored acknowledgment line", () => {
    expect(Object.keys(ENTRY_ACKNOWLEDGMENTS).sort()).toEqual([
      "event",
      "idea",
      "marketing",
      "sop",
    ]);
  });
});

describe("combineEntryConversationText", () => {
  it("joins opening + elaboration with a single space, trimmed", () => {
    expect(
      combineEntryConversationText(
        "I need an SOP for onboarding clients.",
        "  It's for a client, we already have some notes written down.  ",
      ),
    ).toBe(
      "I need an SOP for onboarding clients. It's for a client, we already have some notes written down.",
    );
  });

  it("drops an empty elaboration cleanly", () => {
    expect(combineEntryConversationText("I want to plan a workshop.", "")).toBe(
      "I want to plan a workshop.",
    );
  });

  it("drops an empty opening cleanly (defensive — should not normally happen)", () => {
    expect(combineEntryConversationText("", "just the elaboration")).toBe(
      "just the elaboration",
    );
  });
});
