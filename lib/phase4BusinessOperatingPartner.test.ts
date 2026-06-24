import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import { patchPhase2DiscoveryState, resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import {
  buildBusinessOperatingManual,
  detectBusinessOpportunities,
  isPhase4BusinessOperatingPartnerActive,
  maybeProactiveBusinessSupport,
  observePhase4BusinessTurn,
  phase4BusinessOperatingPartnerHintForChat,
  resetPhase4PartnerForTests,
} from "./phase4BusinessOperatingPartner";

describe("phase4BusinessOperatingPartner", () => {
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
    resetPhase4PartnerForTests();
  });

  function completePhase1() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me run my business" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Follow-through" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "Launch my workshop" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });
  }

  function seedForPhase4() {
    const started = new Date("2025-06-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 15,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Group program" },
      goals: [{ text: "Grow visibility", recordedAt: started }],
      learningStyle: {
        primary: "conversational",
        confidence: 0.55,
        signals: { conversational: 5 },
      },
      adhdPatterns: [
        { id: "launch_avoidance", count: 3, lastSeen: started },
      ],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 70,
          ignoredCount: 0,
        },
      ],
    });
  }

  it("activates after phase 3 depth and time together", () => {
    completePhase1();
    seedForPhase4();
    expect(
      isPhase4BusinessOperatingPartnerActive(new Date("2026-07-01T10:00:00.000Z")),
    ).toBe(true);
  });

  it("tracks business momentum activities", () => {
    completePhase1();
    seedForPhase4();
    observePhase4BusinessTurn({
      userText: "I drafted a blog post and scheduled outreach",
      now: new Date("2026-07-01T10:00:00.000Z"),
    });
    const manual = buildBusinessOperatingManual();
    expect(manual.howBusinessGrows.highestMomentumActivities.length).toBeGreaterThan(0);
  });

  it("surfaces opportunities with awareness not pressure", () => {
    completePhase1();
    seedForPhase4();
    const opps = detectBusinessOpportunities(new Date("2026-07-01T10:00:00.000Z"));
    expect(opps.some((o) => o.id === "abandoned_launch")).toBe(true);
  });

  it("offers proactive support with permission-first language", () => {
    completePhase1();
    seedForPhase4();
    const offer = maybeProactiveBusinessSupport({
      userText: "I'm stuck deciding which launch step is next",
      now: new Date("2026-07-05T10:00:00.000Z"),
    });
    expect(offer).toMatch(/would you like|want to|permission/i);
  });

  it("includes business operating partner guidance in chat hints", () => {
    completePhase1();
    seedForPhase4();
    const hint = phase4BusinessOperatingPartnerHintForChat({
      userText: "What should I focus on this week?",
    });
    expect(hint).toMatch(/PHASE 4 BUSINESS OPERATING PARTNER/i);
    expect(hint).toMatch(/business partner/i);
    expect(hint).toMatch(/Permission first/i);
  });
});
