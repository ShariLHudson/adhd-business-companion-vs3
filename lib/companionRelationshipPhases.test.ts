import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyPhase1OnboardingTurn, resetPhase1OnboardingForTests } from "./phase1Onboarding";
import {
  patchPhase2DiscoveryState,
  resetPhase2DiscoveryForTests,
} from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests, observePhase5EcosystemTurn } from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import { resetEcosystemIntelligenceForTests } from "./ecosystemIntelligence";
import { resetTransformationIntelligenceForTests } from "./transformationIntelligence";
import { resetAutonomousPreparationForTests } from "./autonomousPreparation";
import * as autonomousPreparation from "./autonomousPreparation";
import * as ecosystemIntelligence from "./ecosystemIntelligence";
import { resetWisdomIntelligenceForTests } from "./wisdomIntelligence";
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
    resetEcosystemIntelligenceForTests();
    resetTransformationIntelligenceForTests();
    resetAutonomousPreparationForTests();
    resetWisdomIntelligenceForTests();
    vi.restoreAllMocks();
  });

  it("registers all eleven relationship phases as active", () => {
    expect(RELATIONSHIP_PHASES).toHaveLength(11);
    expect(RELATIONSHIP_PHASES[4]?.name).toBe("Companion Intelligence Ecosystem");
    expect(RELATIONSHIP_PHASES[4]?.status).toBe("active");
    expect(RELATIONSHIP_PHASES[7]?.name).toBe("Autonomous Preparation");
    expect(RELATIONSHIP_PHASES[7]?.status).toBe("active");
    expect(RELATIONSHIP_PHASES[8]?.name).toBe("Wisdom Intelligence");
    expect(RELATIONSHIP_PHASES[8]?.status).toBe("active");
    expect(RELATIONSHIP_PHASES[9]?.name).toBe("Legacy & Transformation");
    expect(RELATIONSHIP_PHASES[9]?.status).toBe("active");
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
        name: "Client outreach",
        goal: "Grow revenue",
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
        title: "Client notes",
        artifactType: "Document",
        body: "Notes",
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
      sells: "",
      goals: ["Grow"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
    vi.spyOn(autonomousPreparation, "isPhase8AutonomousPreparationActive").mockReturnValue(false);

    expect(getCurrentRelationshipPhase().number).toBe(7);
  });

  it("advances to phase 8 when preparation kits are ready", () => {
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
      sessionCount: 14,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: started }],
      learningStyle: { primary: "visual", confidence: 0.7, signals: { visual: 6 } },
      adhdPatterns: [{ id: "visibility_resistance", count: 3, lastSeen: started }],
      challenges: [{ label: "Offer confusion", count: 3, lastSeen: started }],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 75,
          ignoredCount: 0,
        },
      ],
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop Launch",
        goal: "Launch workshop offer",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Outline",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Workshop Content Draft",
        artifactType: "Blog post",
        body: "Teaching content",
        status: "saved",
        savedLocation: "My Work > Content",
        typeFolder: "Content",
        preview: "",
        tags: ["workshop"],
        sourceWorkspace: "create",
        createdAt: started,
        updatedAt: started,
      },
      {
        id: "sw2",
        title: "Pricing proposal",
        artifactType: "Proposal",
        body: "Coaching pricing",
        status: "saved",
        savedLocation: "My Work > Proposals",
        typeFolder: "Proposals",
        preview: "",
        tags: [],
        sourceWorkspace: "create",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([
      {
        id: "s1",
        title: "Visibility strategy",
        type: "business",
        category: "visibility",
        source: "user_generated",
        description: "Helps with being seen",
        whenToUse: "When stuck",
        steps: ["One small post"],
        whyItWorks: "Reduces pressure",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([
      {
        id: "t1",
        title: "Launch email sequence",
        body: "Email 1...",
        category: "emails",
        status: "saved",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue({
      role: "Coach",
      sells: "Workshop + Coaching",
      goals: ["Launch workshop"],
      idealClient: "Entrepreneurs with ADHD",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);

    expect(getCurrentRelationshipPhase().number).toBe(8);
  });

  it("advances to phase 9 when wisdom evidence is sufficient", () => {
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
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: started }],
      learningStyle: { primary: "visual", confidence: 0.7, signals: { visual: 6 } },
      adhdPatterns: [
        { id: "visibility_resistance", count: 3, lastSeen: started },
        { id: "follow_through_challenges", count: 3, lastSeen: started },
      ],
      challenges: [{ label: "Visibility", count: 3, lastSeen: started }],
    });

    const wisdomNow = new Date("2025-03-20T10:00:00.000Z");
    observePhase5EcosystemTurn({
      userText: "I learned that smaller steps work when overwhelmed",
      now: wisdomNow,
    });
    observePhase5EcosystemTurn({
      userText: "Lesson learned — talking it out beats overthinking",
      now: wisdomNow,
    });
    observePhase5EcosystemTurn({
      userText: "I learned to pace myself instead of pushing harder",
      now: wisdomNow,
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
      goals: ["Launch"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);

    expect(getCurrentRelationshipPhase().number).toBe(9);
  });

  it("advances to phase 10 when transformation evidence is sufficient", () => {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Visibility and confidence" },
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
      learningStyle: { primary: "visual", confidence: 0.75, signals: { visual: 8 } },
      adhdPatterns: [
        { id: "visibility_resistance", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 3, lastSeen: started },
      ],
      challenges: [
        { label: "Visibility", count: 4, lastSeen: started },
        { label: "Overwhelm", count: 3, lastSeen: started },
        { label: "Confidence", count: 3, lastSeen: started },
      ],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 80,
          ignoredCount: 0,
        },
      ],
    });

    const growthTurns = [
      "I'm confident and proud — finished and completed the workshop project",
      "posted visibility marketing and published content",
      "decided faster today with more clarity",
      "visible and posted again",
      "finished follow through and shipped it",
    ];
    for (const text of growthTurns) {
      observePhase5EcosystemTurn({ userText: text, now: new Date("2026-06-01T10:00:00.000Z") });
    }

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
      {
        id: "p2",
        name: "Coaching Program",
        goal: "Grow program",
        goals: [],
        horizon: "now",
        status: "completed",
        nextAction: "Done",
        color: "#9a6fb0",
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
    vi.spyOn(ecosystemIntelligence, "isPhase11EcosystemIntelligenceActive").mockReturnValue(false);

    expect(getCurrentRelationshipPhase().number).toBe(10);
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
