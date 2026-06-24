import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import {
  buildWhatIveLearnedProfile,
  evaluateMilestones,
  getPhase2DiscoveryState,
  isPhase2DiscoveryActive,
  maybeTrustBuildingMoment,
  observeFromConversationTurn,
  observeResourcePreference,
  phase2ProgressiveDiscoveryHintForChat,
  recordPhase2SessionStart,
  resetPhase2DiscoveryForTests,
  shouldOfferProgressiveDiscoveryQuestion,
} from "./phase2ProgressiveDiscovery";

describe("phase2ProgressiveDiscovery", () => {
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
    resetPhase2DiscoveryForTests();
  });

  function completePhase1() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me grow without overwhelm" },
        {
          role: "assistant",
          content: "Tell me about your business — what do you do?",
        },
        { role: "user", content: "I'm a consultant for solo founders" },
        {
          role: "assistant",
          content: "What's the hardest part right now?",
        },
        { role: "user", content: "Visibility and follow-through" },
        {
          role: "assistant",
          content: "What would success look like in the next few weeks?",
        },
        { role: "user", content: "More clients and less overwhelm" },
        {
          role: "assistant",
          content: "Did I get that right?",
        },
        { role: "user", content: "Yes that's right" },
      ],
      userText: "Yes that's right",
      lastAssistantText: "Did I get that right?",
    });
  }

  it("stays inactive until phase 1 completes", () => {
    expect(isPhase2DiscoveryActive()).toBe(false);
    observeFromConversationTurn({ userText: "I am a coach" });
    expect(getPhase2DiscoveryState().business.type).toBeUndefined();
  });

  it("observes business, goals, and challenges from conversation", () => {
    completePhase1();
    expect(isPhase2DiscoveryActive()).toBe(true);

    recordPhase2SessionStart();
    observeFromConversationTurn({
      userText:
        "Visibility feels harder than creating content. I want more clients.",
      usedVoice: true,
    });

    const state = getPhase2DiscoveryState();
    expect(state.business.type ?? state.goals.length).toBeTruthy();
    expect(state.challenges.some((c) => /visibility/i.test(c.label))).toBe(true);
    expect(state.goals.some((g) => /clients/i.test(g.text))).toBe(true);
    expect(state.learningStyle.signals.conversational).toBeGreaterThan(1);
  });

  it("tracks resource preferences and learning style signals", () => {
    completePhase1();
    observeResourcePreference({
      resource: "decision_compass",
      outcome: "completed",
    });
    const state = getPhase2DiscoveryState();
    const compass = state.resources.find((r) => r.id === "decision_compass");
    expect(compass?.helpfulScore).toBeGreaterThan(0);
  });

  it("evaluates relationship milestones over time", () => {
    completePhase1();
    recordPhase2SessionStart();
    recordPhase2SessionStart();
    observeFromConversationTurn({
      userText:
        "My offer is a group coaching program for consultants. Ideal clients are solo founders.",
    });
    observeFromConversationTurn({
      userText: "Visibility is hard. Visibility again today.",
    });
    observeFromConversationTurn({
      userText: "Let's map this visually on the decision compass",
    });

    const state = getPhase2DiscoveryState();
    const milestones = evaluateMilestones(state);
    expect(milestones.understand_goals).toBe(true);
    expect(milestones.understand_challenges).toBe(true);
  });

  it("offers progressive discovery questions after session 2", () => {
    completePhase1();
    expect(shouldOfferProgressiveDiscoveryQuestion()).toBe(false);
    recordPhase2SessionStart();
    expect(shouldOfferProgressiveDiscoveryQuestion()).toBe(false);
    recordPhase2SessionStart();
    expect(shouldOfferProgressiveDiscoveryQuestion()).toBe(true);
  });

  it("builds a living profile for display", () => {
    completePhase1();
    recordPhase2SessionStart();
    recordPhase2SessionStart();
    observeFromConversationTurn({
      userText: "I'm creative at teaching but struggle with pricing",
    });

    const profile = buildWhatIveLearnedProfile();
    expect(profile.business.type ?? profile.business.currentGoal).toBeTruthy();
    expect(profile.workStyle).toBeTruthy();
  });

  it("includes trust-building guidance in chat hints", () => {
    completePhase1();
    for (let i = 0; i < 4; i++) recordPhase2SessionStart();
    observeFromConversationTurn({
      userText: "Visibility is scary. Visibility keeps stopping me.",
    });
    observeResourcePreference({
      resource: "decision_compass",
      outcome: "completed",
    });
    patchLearningStyleConfidence();

    const hint = phase2ProgressiveDiscoveryHintForChat();
    expect(hint).toMatch(/PHASE 2 PROGRESSIVE DISCOVERY/);
    expect(hint).toMatch(/never feel like onboarding/i);
  });

  it("may surface trust-building moments after enough sessions", () => {
    completePhase1();
    for (let i = 0; i < 4; i++) recordPhase2SessionStart();
    observeFromConversationTurn({
      userText: "Visibility is hard. Visibility again.",
    });
    const moment = maybeTrustBuildingMoment(
      getPhase2DiscoveryState(),
      new Date("2026-06-22T12:00:00.000Z"),
    );
    expect(moment).toMatch(/visibility/i);
  });
});

function patchLearningStyleConfidence() {
  const raw = localStorage.getItem("companion-phase2-progressive-discovery-v1");
  if (!raw) return;
  const state = JSON.parse(raw);
  state.learningStyle.confidence = 0.5;
  localStorage.setItem(
    "companion-phase2-progressive-discovery-v1",
    JSON.stringify(state),
  );
}
