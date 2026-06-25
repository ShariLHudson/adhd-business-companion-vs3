import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  buildMemorySeedSummary,
  buildTrustReflection,
  evaluatePhase1Onboarding,
  firstValueResourceForProfile,
  isPhase1OnboardingActive,
  PHASE1_OPENING_MESSAGE,
  phase1OnboardingHintForChat,
  resetPhase1OnboardingForTests,
  shouldBlockWorkspaceOpenForPhase1,
  shouldDeferWorkspaceRoutingForPhase1,
  shouldSuppressWorkspaceCoachForPhase1,
} from "./phase1Onboarding";

describe("phase1Onboarding", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetPhase1OnboardingForTests();
  });

  it("includes the companion opening message", () => {
    expect(PHASE1_OPENING_MESSAGE).toMatch(/I'm Shari/i);
    expect(PHASE1_OPENING_MESSAGE).toMatch(/day been like so far/i);
  });

  it("moves to business discovery after the win-definition answer", () => {
    const evalTurn = evaluatePhase1Onboarding({
      messages: [
        {
          role: "user" as const,
          content:
            "to help me run my business successfully without more overwhelm",
        },
      ],
      userText:
        "to help me run my business successfully without more overwhelm",
    });

    expect(evalTurn.active).toBe(true);
    expect(evalTurn.phase).toBe("business");
    expect(evalTurn.profile.winDefinition).toMatch(/run my business/i);
    expect(evalTurn.profile.businessType).toBeUndefined();
  });

  it("progresses through discovery phases without over-interrogating", () => {
    const messages = [
      {
        role: "user" as const,
        content: "I want help growing without more overwhelm",
      },
      {
        role: "assistant" as const,
        content: "Tell me a little about your business — what do you do?",
      },
      {
        role: "user" as const,
        content: "I run a coaching business for solo entrepreneurs",
      },
    ];

    const evalTurn = evaluatePhase1Onboarding({
      messages,
      userText: messages[2]!.content,
      lastAssistantText: messages[1]!.content,
    });

    expect(evalTurn.active).toBe(true);
    expect(evalTurn.profile.winDefinition).toBeTruthy();
    expect(evalTurn.profile.businessType).toMatch(/coaching/i);
    expect(evalTurn.phase).toBe("challenge");
  });

  it("offers Clear My Mind when overwhelmed", () => {
    const resource = firstValueResourceForProfile({
      primaryChallenge: "Overwhelm",
      winDefinition: "feel less overwhelmed",
    });
    expect(resource.resource).toBe("clear_my_mind");
  });

  it("offers Decision Compass when stuck deciding", () => {
    const resource = firstValueResourceForProfile({
      primaryChallenge: "Too many ideas",
      winDefinition: "decide where to focus",
    });
    expect(resource.resource).toBe("decision_compass");
  });

  it("offers Create when trying to create content", () => {
    const resource = firstValueResourceForProfile({
      primaryChallenge: "Consistency",
      winDefinition: "help me write my newsletter",
    });
    expect(resource.resource).toBe("create");
  });

  it("builds memory seed summary for relationship profile", () => {
    const summary = buildMemorySeedSummary({
      businessType: "coaching business",
      audience: "solo entrepreneurs",
      primaryChallenge: "Visibility",
      desiredOutcome: "attract more clients without feeling overwhelmed",
    });

    expect(summary).toMatch(/Here's what I'm hearing so far/i);
    expect(summary).toMatch(/coaching business/i);
    expect(summary).toMatch(/Visibility/i);
    expect(summary).toMatch(/Did I get that right/i);
  });

  it("generates trust reflection before solutions", () => {
    const reflection = buildTrustReflection({
      primaryChallenge: "too many ideas",
      immediateGoal: "decide where to focus first",
    });
    expect(reflection).toMatch(/too many ideas/i);
    expect(reflection).toMatch(/decide where to focus/i);
  });

  it("blocks workspace routing while onboarding is active", () => {
    expect(shouldDeferWorkspaceRoutingForPhase1()).toBe(true);
    expect(shouldSuppressWorkspaceCoachForPhase1()).toBe(true);
  });

  it("injects onboarding hints with first value rules", () => {
    const evaluation = evaluatePhase1Onboarding({
      messages: [
        { role: "user", content: "Less overwhelm and more clients" },
        {
          role: "assistant",
          content: "Tell me about your business — what do you do and who do you help?",
        },
        {
          role: "user",
          content: "Coaching for ADHD entrepreneurs",
        },
        {
          role: "assistant",
          content: "What's the biggest thing getting in your way right now?",
        },
        {
          role: "user",
          content: "I'm overwhelmed with too many ideas and can't decide what to focus on",
        },
      ],
      userText:
        "I'm overwhelmed with too many ideas and can't decide what to focus on",
      lastAssistantText:
        "What's the biggest thing getting in your way right now?",
    });

    const hint = phase1OnboardingHintForChat(evaluation);
    expect(hint).toMatch(/PHASE 1 ONBOARDING/i);
    expect(hint).toMatch(/OVERRIDES workspace/i);
    expect(hint).toMatch(/ONE conversational question/i);
    expect(hint).toMatch(/reflect understanding/i);
  });

  it("completes onboarding after memory seed confirmation", () => {
    expect(isPhase1OnboardingActive()).toBe(true);

    const confirmed = applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Less overwhelm" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coaching business for entrepreneurs" },
        { role: "assistant", content: "Biggest challenge?" },
        { role: "user", content: "Visibility" },
        { role: "assistant", content: "One thing this week?" },
        { role: "user", content: "Get more clients" },
        {
          role: "assistant",
          content:
            "Here's what I'm hearing so far:\n• You run a coaching business.\n• Visibility is your biggest challenge.\n\nDid I get that right?",
        },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText:
        "Here's what I'm hearing so far:\n• You run a coaching business.\n• Visibility is your biggest challenge.\n\nDid I get that right?",
    });

    expect(confirmed.complete).toBe(true);
    expect(isPhase1OnboardingActive()).toBe(false);
  });

  it("blocks auto workspace opens during Phase 1 but allows explicit sidebar navigation", () => {
    expect(shouldBlockWorkspaceOpenForPhase1()).toBe(true);
    expect(shouldBlockWorkspaceOpenForPhase1({ userInitiated: false })).toBe(
      true,
    );
    expect(shouldBlockWorkspaceOpenForPhase1({ userInitiated: true })).toBe(
      false,
    );
    expect(shouldDeferWorkspaceRoutingForPhase1()).toBe(true);
  });
});
