/**
 * Regression: a direct informational how-to question must not become a durable
 * reflective Topic Anchor, and its compressed keyword residue must never be
 * surfaced as a topic return ("You're still sitting with best way determine
 * network meeting before"). Genuine decision topics keep full continuity.
 */
import { describe, expect, it } from "vitest";

import {
  applyTopicContinuityValidation,
  extractPrimaryTopic,
  hasActiveTopicAnchor,
  isIllegalTopicLabel,
  updateTopicAnchor,
} from "./index";
import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import { buildAnswerFirstFailSafeReply } from "@/lib/shariAnswerFirst";
import { localFallbackMayReplace } from "@/lib/shariAnswerFirst/answerPreservation";

const NETWORKING =
  "What is the best way to determine how to network at a meeting I have not been to before and don't know anyone?";
const INTRODUCTION = "What is the best way to introduce myself at a meeting?";

describe("informational how-to questions never become a stale reflective topic", () => {
  it("2. the introduction follow-up is not intercepted by the prior question's keyword dump", () => {
    // Turn 1 — the networking question must not create an active anchor.
    const afterNetworking = updateTopicAnchor({
      previous: null,
      userText: NETWORKING,
      messages: [{ role: "user", content: NETWORKING }],
    });
    expect(hasActiveTopicAnchor(afterNetworking)).toBe(false);

    // Turn 2 — the introduction follow-up still has no stale anchor to own it.
    const afterIntro = updateTopicAnchor({
      previous: afterNetworking,
      userText: INTRODUCTION,
      messages: [
        { role: "user", content: NETWORKING },
        { role: "assistant", content: "Here is how to introduce yourself…" },
        { role: "user", content: INTRODUCTION },
      ],
    });
    expect(hasActiveTopicAnchor(afterIntro)).toBe(false);

    // A substantive introduction answer is preserved — never replaced by a
    // "You're still sitting with…" topic return.
    const draft =
      "Introduce yourself with a warm, specific opener: your name, what you do, " +
      "and one genuine question about them. Arrive early, find someone standing " +
      "alone, and lead with curiosity rather than a pitch.";
    const continuity = applyTopicContinuityValidation({
      draftText: draft,
      userText: INTRODUCTION,
      anchor: afterIntro,
    });
    expect(continuity.text).toBe(draft);
    expect(continuity.usedFallback).toBe(false);
    expect(continuity.text.toLowerCase()).not.toContain("still sitting with");
  });

  it("5. the compressed keyword dump is an illegal, never-rendered topic label", () => {
    // The exact residue the runtime produced for the networking question.
    expect(isIllegalTopicLabel("best way determine network meeting before")).toBe(
      true,
    );
    expect(isIllegalTopicLabel("best way introduce myself meeting")).toBe(true);
    expect(isIllegalTopicLabel("way to introduce myself")).toBe(true);
    // Clean noun phrases from the explicit branches stay legal (continuity kept).
    expect(isIllegalTopicLabel("how to explain your program")).toBe(false);

    // extractPrimaryTopic no longer yields a durable topic for these questions,
    // so buildNaturalTopicReturn can never be fed the internal keyword string.
    expect(
      updateTopicAnchor({ previous: null, userText: NETWORKING }).primaryTopic,
    ).toBe("");
    expect(
      updateTopicAnchor({ previous: null, userText: INTRODUCTION }).primaryTopic,
    ).toBe("");
  });

  it("3 + 6. genuine decision topics keep full continuity (interception narrowed, not removed)", () => {
    const hire = "If I should hire a marketing assistant or not.";
    expect(extractPrimaryTopic(hire)).toBe("hiring a marketing assistant");
    expect(isIllegalTopicLabel("hiring a marketing assistant")).toBe(false);
    expect(isIllegalTopicLabel("hiring a bookkeeper")).toBe(false);
    expect(isIllegalTopicLabel("which project to start")).toBe(false);
    expect(isIllegalTopicLabel("canceling unused subscriptions")).toBe(false);

    const anchor = updateTopicAnchor({ previous: null, userText: hire });
    expect(hasActiveTopicAnchor(anchor)).toBe(true);
    expect(anchor.primaryTopic).toBe("hiring a marketing assistant");

    // A related follow-up in the same decision keeps the anchor and may return
    // to it naturally (topic continuity intact).
    const focus = updateTopicAnchor({
      previous: anchor,
      userText: "I'm mostly worried about the cost.",
    });
    expect(hasActiveTopicAnchor(focus)).toBe(true);
    const naturalReturn = buildNaturalTopicReturn({
      topic: focus.primaryTopic,
      mode: "continue",
    });
    expect(naturalReturn).toMatch(/marketing assistant/i);
  });

  it("7. a substantive answer is never replaced by the local canned fallback", () => {
    const substantive =
      "Introduce yourself with your name, what you do, and a genuine question.";
    expect(
      localFallbackMayReplace({
        finalizedAnswer: substantive,
        hasModelRepair: false,
      }),
    ).toBe(false);
    // Only genuine absence may be filled.
    expect(
      localFallbackMayReplace({ finalizedAnswer: "", hasModelRepair: false }),
    ).toBe(true);
  });

  it("regression: existing illegal labels stay illegal; how-to fail-safe still answers", () => {
    expect(isIllegalTopicLabel("does")).toBe(true);
    expect(isIllegalTopicLabel("something around does mean")).toBe(true);
    // The answer-first fail-safe path is untouched by this change.
    const failSafe = buildAnswerFirstFailSafeReply(
      "How do I set up a vendor booth at a local market?",
    );
    expect(failSafe && failSafe.length).toBeGreaterThan(40);
  });
});
