/**
 * Support Gate Decision — unit tests (Phase 2).
 *
 * Covers the tiering logic itself, independent of any wiring into the
 * live chat runtime (that wiring is a separate, explicitly scoped change
 * — see resolveSupportGate.ts's own doc comment on "only change
 * ownership"). Phase 3's golden-conversation tests
 * (workStatePriorityGoldenConversations.test.ts) exercise this same
 * function against the exact examples from the approved implementation
 * plan; this file exercises the tiering rules more exhaustively.
 */

import { describe, expect, it } from "vitest";
import { resolveSupportGate, softenResponse } from "./resolveSupportGate";

describe("resolveSupportGate — PAUSE tier", () => {
  it("overwhelmed text pauses, regardless of a named work object", () => {
    expect(resolveSupportGate("I'm overwhelmed about my workshop.")).toBe("pause");
    expect(resolveSupportGate("I'm overwhelmed trying to figure out my workshop.")).toBe("pause");
  });

  it("emotional distress (frustrated, sad, burned out, ...) pauses", () => {
    expect(resolveSupportGate("I'm so frustrated with this workshop.")).toBe("pause");
    expect(resolveSupportGate("I'm burned out and can't do this anymore.")).toBe("pause");
  });
});

describe("resolveSupportGate — SOFTEN tier", () => {
  it("stuck (object-specific friction) softens rather than pausing", () => {
    expect(resolveSupportGate("I'm stuck trying to figure out my workshop.")).toBe("soften");
  });

  it("genuine confusion language softens, even without a named work object", () => {
    expect(resolveSupportGate("I'm not sure what I need help with.")).toBe("soften");
    expect(resolveSupportGate("I'm confused about what to do next.")).toBe("soften");
    expect(resolveSupportGate("I don't know where to start.")).toBe("soften");
  });
});

describe("resolveSupportGate — PROCEED tier", () => {
  it("calm, confident build requests proceed", () => {
    expect(resolveSupportGate("I want to create a workshop.")).toBe("proceed");
    expect(resolveSupportGate("I'm building a workshop.")).toBe("proceed");
  });

  it("explicit help-seeking build requests proceed (Build Guidance is a pacing distinction, not a different gate outcome)", () => {
    expect(resolveSupportGate("I need help planning a workshop.")).toBe("proceed");
  });

  it("a classifier vocabulary gap (unclear with NO genuine confusion language) defaults safely to proceed, never silently treated as distress", () => {
    // Constructed to still land on "unclear" post-Phase-1 fix — this
    // guards the gate's own defensive default independent of whichever
    // specific vocabulary gaps have or haven't been closed at the
    // classifier level.
    expect(resolveSupportGate("Yes, of course I'll do that.")).toBe("proceed");
  });
});

describe("resolveSupportGate — explicit emotionalState override", () => {
  it("accepts a pre-computed EmotionalState instead of recomputing it", () => {
    // Same text, forced tiers — confirms the gate trusts an
    // already-computed emotional state rather than always recomputing,
    // matching how it will be called at the actual Create Fast Path site
    // (which already computes detectEmotionalState earlier in the turn).
    expect(resolveSupportGate("anything", "overwhelmed")).toBe("pause");
    expect(resolveSupportGate("anything", "stuck")).toBe("soften");
    expect(resolveSupportGate("anything", "building")).toBe("proceed");
    expect(resolveSupportGate("anything", "focused")).toBe("proceed");
  });
});

describe("softenResponse — blends an acknowledgment into the existing reply, never replaces it", () => {
  it("prepends a stuck-flavored acknowledgment for stuck text", () => {
    const result = softenResponse("Who is the workshop for?", "I'm stuck trying to figure out my workshop.");
    expect(result).toContain("We can sort this together.");
    expect(result).toContain("Who is the workshop for?");
  });

  it("prepends a confusion-flavored acknowledgment for genuine confusion text", () => {
    const result = softenResponse("Let's start simple.", "I'm not sure what I need help with.");
    expect(result).toContain("let's figure it out together");
    expect(result).toContain("Let's start simple.");
  });

  it("does not double up the acknowledgment if already present", () => {
    const already = "We can sort this together. Who is the workshop for?";
    expect(softenResponse(already, "I'm stuck trying to figure out my workshop.")).toBe(already);
  });

  it("returns the input unchanged for empty replies", () => {
    expect(softenResponse("", "I'm stuck.")).toBe("");
  });
});
