import { describe, expect, it } from "vitest";
import { evaluateSharedExperience } from "./evaluateSharedExperience";
import { detectSharedIdentityAssumptions } from "./identityGuard";
import { sharedExperienceHintForChat } from "./sharedExperienceHintForChat";

describe("sharedExperience", () => {
  it("allows bridge on focus struggle", () => {
    const d = evaluateSharedExperience({
      userText: "I just can't stay focused.",
    });
    expect(d.allowed).toBe(true);
    expect(d.bridge?.id).toBe("focus.drift");
  });

  it("blocks shared experience on Business Model Canvas explain", () => {
    const d = evaluateSharedExperience({
      userText: "Can you explain a Business Model Canvas?",
    });
    expect(d.allowed).toBe(false);
    expect(d.bridge).toBeNull();
  });

  it("allows bridge on overwhelmed building business", () => {
    const d = evaluateSharedExperience({
      userText: "I keep getting overwhelmed trying to build my business.",
    });
    expect(d.allowed).toBe(true);
    expect(d.bridge?.theme).toBe("overwhelm");
  });

  it("includes humility frame in hint", () => {
    const hint = sharedExperienceHintForChat({
      userText: "I keep rewriting everything.",
    });
    expect(hint).toContain("Shared experience, not shared identity");
    expect(hint).toContain("may or may not fit you");
    expect(hint).toContain("HUMILITY (required)");
  });

  it("returns null hint for teach-only turn", () => {
    expect(
      sharedExperienceHintForChat({
        userText: "What is SWOT analysis?",
      }),
    ).toBeNull();
  });

  it("skips bridge on recent cooldown", () => {
    const d = evaluateSharedExperience({
      userText: "I just can't stay focused.",
      recentBridgeIds: ["focus.drift"],
    });
    expect(d.allowed).toBe(false);
  });

  it("flags shared identity assumption patterns", () => {
    expect(
      detectSharedIdentityAssumptions(
        "As someone with ADHD, you must also struggle with this.",
      ).length,
    ).toBeGreaterThan(0);
  });
});
