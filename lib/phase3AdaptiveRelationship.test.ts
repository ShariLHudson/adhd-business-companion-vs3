import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import { patchPhase2DiscoveryState, resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import {
  buildUserOperatingManual,
  isPhase3AdaptiveRelationshipActive,
  maybeCompanionAwarenessMoment,
  observePhase3Turn,
  phase3AdaptiveRelationshipHintForChat,
  resetPhase3RelationshipForTests,
} from "./phase3AdaptiveRelationship";

describe("phase3AdaptiveRelationship", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetPhase1OnboardingForTests();
    resetPhase2DiscoveryForTests();
    resetPhase3RelationshipForTests();
  });

  function completePhase1() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me grow" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Consultant for founders" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Visibility" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More clients" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });
  }

  function seedPhase2ForPhase3() {
    const started = new Date("2026-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 6,
      firstSessionAt: started,
      lastSessionAt: started,
      learningStyle: {
        primary: "visual",
        confidence: 0.5,
        signals: { visual: 4 },
      },
      adhdPatterns: [
        { id: "visibility_resistance", count: 2, lastSeen: started },
      ],
    });
  }

  it("activates after enough sessions and pattern signals", () => {
    completePhase1();
    expect(isPhase3AdaptiveRelationshipActive()).toBe(false);
    seedPhase2ForPhase3();
    expect(isPhase3AdaptiveRelationshipActive()).toBe(true);
  });

  it("observes predictive patterns from conversation", () => {
    completePhase1();
    seedPhase2ForPhase3();
    observePhase3Turn({
      userText: "Visibility is scary and I keep avoiding posting",
      now: new Date("2026-02-01T10:00:00.000Z"),
    });
    const manual = buildUserOperatingManual();
    expect(manual.frictionPatterns.some((f) => /visibility/i.test(f))).toBe(true);
  });

  it("uses trust-safe awareness language", () => {
    completePhase1();
    seedPhase2ForPhase3();
    observePhase3Turn({
      userText: "Visibility is hard. Visibility again.",
      now: new Date("2026-02-01T10:00:00.000Z"),
    });
    const moment = maybeCompanionAwarenessMoment(new Date("2026-02-05T10:00:00.000Z"));
    expect(moment).toMatch(/seems like|noticing|may be wrong/i);
  });

  it("includes phase 3 guidance in chat hints", () => {
    completePhase1();
    seedPhase2ForPhase3();
    const hint = phase3AdaptiveRelationshipHintForChat();
    expect(hint).toMatch(/PHASE 3 ADAPTIVE RELATIONSHIP/i);
    expect(hint).toMatch(/never surveillance/i);
  });
});
