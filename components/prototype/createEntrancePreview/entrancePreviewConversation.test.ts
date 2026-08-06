/**
 * Create Entrance Preview (2026-08-06) — isolated prototype logic.
 */
import { describe, expect, it } from "vitest";
import {
  buildPreviewReflection,
  detectPreviewTopic,
  PREVIEW_ACKNOWLEDGMENTS,
  PREVIEW_FOLLOW_UP_QUESTIONS,
} from "./entrancePreviewConversation";

describe("detectPreviewTopic + PREVIEW_ACKNOWLEDGMENTS — the approved preview examples", () => {
  it('SOP — "I need an SOP for onboarding clients."', () => {
    const topic = detectPreviewTopic("I need an SOP for onboarding clients.");
    expect(topic).toBe("sop");
    expect(PREVIEW_ACKNOWLEDGMENTS[topic]).toBe(
      "I'd be happy to help. Before we build it, let's understand what this process needs to accomplish.",
    );
  });

  it('Workshop — "I want to create a workshop for small business owners."', () => {
    const topic = detectPreviewTopic(
      "I want to create a workshop for small business owners.",
    );
    expect(topic).toBe("workshop");
    expect(PREVIEW_ACKNOWLEDGMENTS[topic]).toBe(
      "That sounds exciting. Before we think about agendas or materials, let's understand what you want participants to experience.",
    );
  });

  it('Marketing — "I need help marketing my business."', () => {
    const topic = detectPreviewTopic("I need help marketing my business.");
    expect(topic).toBe("marketing");
    expect(PREVIEW_ACKNOWLEDGMENTS[topic]).toBe(
      "I'd love to help. Before we create a plan, let's understand what you're hoping marketing will accomplish.",
    );
  });

  it('Unclear idea — "I have an idea but don\'t know what to do with it."', () => {
    const topic = detectPreviewTopic(
      "I have an idea but don't know what to do with it.",
    );
    expect(topic).toBe("idea");
    expect(PREVIEW_ACKNOWLEDGMENTS[topic]).toBe(
      "Perfect. Let's explore it together. Tell me what you're imagining.",
    );
  });
});

describe("follow-up questions — one helpful question, never an interview", () => {
  it("sop/workshop/marketing each have exactly one follow-up", () => {
    expect(PREVIEW_FOLLOW_UP_QUESTIONS.sop).toBeTruthy();
    expect(PREVIEW_FOLLOW_UP_QUESTIONS.workshop).toBeTruthy();
    expect(PREVIEW_FOLLOW_UP_QUESTIONS.marketing).toBeTruthy();
  });

  it("idea has none — the acknowledgment already invites elaboration", () => {
    expect(PREVIEW_FOLLOW_UP_QUESTIONS.idea).toBeUndefined();
  });
});

describe("buildPreviewReflection", () => {
  it("names the discovered topic for sop/workshop/marketing", () => {
    expect(buildPreviewReflection("sop")).toContain("an SOP");
    expect(buildPreviewReflection("workshop")).toContain("a workshop");
    expect(buildPreviewReflection("marketing")).toContain("a marketing plan");
  });

  it("stays soft for idea — never fakes a discovered Build Type", () => {
    const reflection = buildPreviewReflection("idea");
    expect(reflection).not.toMatch(/Here's what I think we're working on/);
    expect(reflection).toContain("still exploring");
  });
});
