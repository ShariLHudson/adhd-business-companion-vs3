import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyPhase1OnboardingTurn, resetPhase1OnboardingForTests } from "./phase1Onboarding";
import {
  patchPhase2DiscoveryState,
  resetPhase2DiscoveryForTests,
} from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import { resetEcosystemIntelligenceForTests } from "./ecosystemIntelligence";
import {
  getCurrentRelationshipPhase,
  RELATIONSHIP_PHASES,
} from "./companionRelationshipPhases";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("companionRelationshipPhases", () => {
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
    resetPhase3RelationshipForTests();
    resetPhase4PartnerForTests();
    resetPhase5EcosystemForTests();
    resetPhase6NetworkForTests();
    resetPhase7BusinessIntelligenceForTests();
    resetEcosystemIntelligenceForTests();
  });

  it("registers all eleven relationship phases", () => {
    expect(RELATIONSHIP_PHASES).toHaveLength(11);
    expect(RELATIONSHIP_PHASES[4]?.name).toBe("Companion Intelligence Ecosystem");
    expect(RELATIONSHIP_PHASES[4]?.status).toBe("active");
    expect(RELATIONSHIP_PHASES[10]?.name).toBe("Ecosystem Intelligence");
    expect(RELATIONSHIP_PHASES[10]?.status).toBe("active");
  });

  it("starts at phase 1 before onboarding completes", () => {
    expect(getCurrentRelationshipPhase().number).toBe(1);
  });

  it("advances to phase 5 when ecosystem criteria are met", () => {
    vi.spyOn(companionStore, "getProjects").mockReturnValue([]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue(null);
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);

    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });

    const started = new Date("2025-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach" },
      goals: [{ text: "Grow visibility", recordedAt: started }],
      learningStyle: {
        primary: "visual",
        secondary: "conversational",
        confidence: 0.7,
        signals: { visual: 6, conversational: 4 },
      },
      adhdPatterns: [{ id: "visibility_resistance", count: 3, lastSeen: started }],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 75,
          ignoredCount: 0,
        },
      ],
      challenges: [{ label: "Visibility", count: 3, lastSeen: started }],
    });

    expect(getCurrentRelationshipPhase().number).toBe(5);
  });

  it("advances to phase 6 when connected assets exist", () => {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });

    const started = new Date("2025-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach" },
      goals: [{ text: "Grow visibility", recordedAt: started }],
      learningStyle: {
        primary: "visual",
        confidence: 0.7,
        signals: { visual: 6 },
      },
      adhdPatterns: [{ id: "visibility_resistance", count: 3, lastSeen: started }],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 75,
          ignoredCount: 0,
        },
      ],
      challenges: [{ label: "Visibility", count: 3, lastSeen: started }],
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop",
        goal: "Launch",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Plan",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
      {
        id: "p2",
        name: "Content plan",
        goal: "Visibility",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Draft",
        color: "#9a6fb0",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Survey",
        artifactType: "Form",
        body: "Questions",
        status: "saved",
        savedLocation: "My Work",
        typeFolder: "Documents",
        preview: "",
        tags: [],
        sourceWorkspace: "create",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue(null);
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);

    expect(getCurrentRelationshipPhase().number).toBe(6);
  });

  it("advances to phase 7 when business intelligence criteria are met", () => {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });

    const started = new Date("2025-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach" },
      goals: [{ text: "Grow revenue", recordedAt: started }],
      learningStyle: { primary: "visual", confidence: 0.7, signals: { visual: 6 } },
      adhdPatterns: [{ id: "visibility_resistance", count: 3, lastSeen: started }],
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop",
        goal: "Launch offer",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Plan",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Survey",
        artifactType: "Form",
        body: "Questions",
        status: "saved",
        savedLocation: "My Work",
        typeFolder: "Documents",
        preview: "",
        tags: [],
        sourceWorkspace: "create",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue({
      role: "Coach",
      sells: "Workshop program",
      goals: ["Grow"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);

    expect(getCurrentRelationshipPhase().number).toBe(7);
  });

  it("advances to phase 11 when whole-life ecosystem criteria are met", () => {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm and tired" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence and impact" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });

    const started = new Date("2025-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 30,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop and teach more", recordedAt: started }],
      strengths: ["Teaching", "Creative thinking"],
      learningStyle: {
        primary: "visual",
        secondary: "conversational",
        confidence: 0.75,
        signals: { visual: 8, conversational: 5 },
      },
      adhdPatterns: [
        { id: "visibility_resistance", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 2, lastSeen: started },
      ],
      challenges: [
        { label: "Poor sleep", count: 3, lastSeen: started },
        { label: "Overwhelm", count: 4, lastSeen: started },
        { label: "Visibility", count: 3, lastSeen: started },
        { label: "Relationship stress", count: 2, lastSeen: started },
      ],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 80,
          ignoredCount: 0,
        },
      ],
      energy: {
        completionsByWindow: { morning: 5, afternoon: 2, evening: 1 },
        overwhelmByWindow: { morning: 1, afternoon: 3, evening: 2 },
        peakWindow: "morning",
        lowWindow: "afternoon",
      },
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop Launch",
        goal: "Launch workshop",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Plan",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Workshop content",
        artifactType: "Blog",
        body: "Teaching content",
        status: "saved",
        savedLocation: "My Work",
        typeFolder: "Content",
        preview: "",
        tags: [],
        sourceWorkspace: "create",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue({
      role: "Coach",
      sells: "Workshop program",
      goals: ["Impact through teaching"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);

    expect(getCurrentRelationshipPhase().number).toBe(11);
  });
});
