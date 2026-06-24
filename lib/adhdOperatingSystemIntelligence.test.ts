import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import {
  patchPhase2DiscoveryState,
  resetPhase2DiscoveryForTests,
} from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import {
  adhdOperatingSystemHintForChat,
  buildAdhdOperatingSystemProfile,
  collectOperatingSystemObservationCandidates,
  detectOperatingQuestionFocus,
  operatingPatternsForUserQuestion,
  upgradeSurfaceToOperatingInsight,
} from "./adhdOperatingSystemIntelligence";
import { buildRelationshipObservations } from "./relationshipObservationEngine";
import { buildRelationshipIntelligencePriorityBlock } from "./relationshipIntelligencePrompt";
import * as companionStore from "./companionStore";

describe("adhdOperatingSystemIntelligence", () => {
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
    resetPhase5EcosystemForTests();
    resetPhase6NetworkForTests();
    resetPhase7BusinessIntelligenceForTests();
    vi.restoreAllMocks();
  });

  function seedOperatingEvidence() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm and finishing projects" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });

    const started = "2024-06-01T10:00:00.000Z";
    patchPhase2DiscoveryState({
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      learningStyle: {
        primary: "conversational",
        confidence: 0.75,
        signals: { conversational: 7 },
      },
      adhdPatterns: [
        { id: "shiny_object_syndrome", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 4, lastSeen: started },
        { id: "perfectionism", count: 3, lastSeen: started },
      ],
      challenges: [{ label: "Finishing projects", count: 5, lastSeen: started }],
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop",
        goal: "Launch",
        goals: [],
        horizon: "now",
        status: "in-progress",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
      {
        id: "p2",
        name: "Course",
        goal: "Build",
        goals: [],
        horizon: "now",
        status: "in-progress",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
      {
        id: "p3",
        name: "Newsletter",
        goal: "Write",
        goals: [],
        horizon: "now",
        status: "in-progress",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
    ]);
  }

  it("does not emit patterns from a single signal", () => {
    resetPhase2DiscoveryForTests();
    const started = "2024-06-01T10:00:00.000Z";
    patchPhase2DiscoveryState({
      sessionCount: 1,
      adhdPatterns: [{ id: "follow_through_challenges", count: 1, lastSeen: started }],
      learningStyle: { primary: "hybrid", confidence: 0, signals: {} },
    });
    const profile = buildAdhdOperatingSystemProfile(new Date("2025-06-01T10:00:00.000Z"));
    expect(profile.insights).toHaveLength(0);
    expect(profile.narrative).toMatch(/still forming/i);
  });

  it("builds completion and momentum operating insights from repeated evidence", () => {
    seedOperatingEvidence();
    const profile = buildAdhdOperatingSystemProfile(new Date("2025-06-01T10:00:00.000Z"));
    expect(profile.completionPatterns.length).toBeGreaterThan(0);
    expect(profile.completionPatterns[0]!.text).toMatch(/maintenance|creative phase|novelty/i);
    expect(profile.completionPatterns[0]!.evidenceCount).toBeGreaterThanOrEqual(2);
    expect(profile.businessPatterns.some((p) => /generate ideas|build faster/i.test(p.text))).toBe(
      true,
    );
  });

  it("upgrades surface symptom language to operating explanations", () => {
    expect(upgradeSurfaceToOperatingInsight("Has trouble finishing.")).toMatch(/maintenance/i);
    expect(upgradeSurfaceToOperatingInsight("Gets overwhelmed.")).toMatch(/compete for attention/i);
    expect(upgradeSurfaceToOperatingInsight("Has difficulty choosing.")).toMatch(
      /multiple good options/i,
    );
  });

  it("detects completion focus for starter-vs-finisher questions", () => {
    seedOperatingEvidence();
    expect(
      detectOperatingQuestionFocus("Why am I a good starter but a poor finisher?"),
    ).toBe("completion");
    const patterns = operatingPatternsForUserQuestion(
      "Why am I a good starter but a poor finisher?",
      new Date("2025-06-01T10:00:00.000Z"),
    );
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0]!.domain).toMatch(/completion|momentum/);
  });

  it("prioritizes operating patterns over surface ADHD labels in observations", () => {
    seedOperatingEvidence();
    const observations = buildRelationshipObservations(new Date("2025-06-01T10:00:00.000Z"), {
      userText: "Why am I a good starter but a poor finisher?",
    });
    const top = observations[0]!;
    expect(top.source?.startsWith("os:")).toBe(true);
    expect(top.text).toMatch(/maintenance|creative phase|momentum|novelty/i);
    expect(top.text).not.toMatch(/shiny object syndrome/i);
    expect(
      observations.some((o) => o.source === "shiny_object_syndrome"),
    ).toBe(false);
  });

  it("surfaces operating hint in relationship priority block for finisher questions", () => {
    seedOperatingEvidence();
    const block = buildRelationshipIntelligencePriorityBlock(
      "Why am I a good starter but a poor finisher?",
      new Date("2025-06-01T10:00:00.000Z"),
    );
    expect(block).toMatch(/Operating insight/i);
    expect(block).toMatch(/ADHD OPERATING SYSTEM INTELLIGENCE/i);
    expect(block).toMatch(/FAIL: "You have shiny object syndrome/i);
    expect(block).toMatch(/maintenance|creative phase/i);
  });

  it("returns observation candidates with os source tags", () => {
    seedOperatingEvidence();
    const candidates = collectOperatingSystemObservationCandidates(
      new Date("2025-06-01T10:00:00.000Z"),
    );
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((c) => c.source.startsWith("os:"))).toBe(true);
    expect(candidates.every((c) => c.frequency >= 2)).toBe(true);
  });

  it("hint emphasizes WHY not symptom labels for completion questions", () => {
    seedOperatingEvidence();
    const hint = adhdOperatingSystemHintForChat(
      "Why am I a good starter but a poor finisher?",
    );
    expect(hint).toMatch(/Never say: 'You have trouble finishing'/i);
    expect(hint).toMatch(/completion \+ momentum patterns first/i);
    expect(hint).not.toMatch(/momentum_builder/i);
  });
});
