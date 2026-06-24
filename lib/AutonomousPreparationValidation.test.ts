import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import { patchPhase2DiscoveryState, resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import {
  isPhase8AutonomousPreparationActive,
  maybeAutonomousPreparationOffer,
  phase8AutonomousPreparationHintForChat,
  resetAutonomousPreparationForTests,
  validateContentCreationPreparation,
  validateDecisionSupportPreparation,
  validateDiscoveryCallPreparation,
  validateOpportunityDetection,
  validateReEntryPreparation,
  validateWorkshopLaunchPreparation,
} from "./autonomousPreparation";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("AutonomousPreparationValidation", () => {
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
    resetAutonomousPreparationForTests();
    vi.restoreAllMocks();
  });

  function seedPhase8Base(lastSessionAt?: string) {
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
      lastSessionAt: lastSessionAt ?? started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: started }],
      learningStyle: {
        primary: "visual",
        confidence: 0.7,
        signals: { visual: 6 },
      },
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
  }

  it("Workshop Launch™ — preparation appears before launch planning", () => {
    seedPhase8Base();
    const kit = validateWorkshopLaunchPreparation(
      "I want to launch my workshop",
      new Date("2026-05-01T10:00:00.000Z"),
    );
    expect(kit).toBeTruthy();
    expect(kit!.title).toMatch(/Launch/i);
    expect(kit!.permissionPrompt).toMatch(/Would you like to see them/i);
  });

  it("Discovery Call™ — sales resources prepared automatically", () => {
    seedPhase8Base();
    const kit = validateDiscoveryCallPreparation(
      "I have a discovery call tomorrow",
      new Date("2026-05-01T10:00:00.000Z"),
    );
    expect(kit).toBeTruthy();
    expect(kit!.items.some((i) => /framework|pricing|avatar|offer/i.test(i.label))).toBe(
      true,
    );
  });

  it("Content Creation™ — content opportunities prepared", () => {
    seedPhase8Base();
    const kit = validateContentCreationPreparation(
      "I need content ideas for my workshop",
      new Date("2026-05-01T10:00:00.000Z"),
    );
    expect(kit).toBeTruthy();
    expect(kit!.items.length).toBeGreaterThan(0);
  });

  it("Re-Entry™ — user returns after absence with calm brief", () => {
    seedPhase8Base("2025-12-01T10:00:00.000Z");
    const kit = validateReEntryPreparation(new Date("2026-05-01T10:00:00.000Z"));
    expect(kit).toBeTruthy();
    expect(kit!.permissionPrompt).toMatch(/no shame|getting back in|control/i);
    expect(kit!.items.some((i) => /Welcome back/i.test(i.label))).toBe(true);
  });

  it("Decision Support™ — relevant information assembled", () => {
    seedPhase8Base();
    const kit = validateDecisionSupportPreparation(
      "I need to decide between these offers",
      new Date("2026-05-01T10:00:00.000Z"),
    );
    expect(kit).toBeTruthy();
    expect(kit!.title).toMatch(/Decision/i);
  });

  it("Opportunity Detection™ — potential opportunity surfaced appropriately", () => {
    seedPhase8Base();
    const kit = validateOpportunityDetection(new Date("2026-05-01T10:00:00.000Z"));
    expect(kit === null || kit.permissionPrompt.match(/helpful|pressure|optional/i)).toBeTruthy();
  });

  it("activates phase 8 when preparation kits are ready", () => {
    seedPhase8Base();
    expect(isPhase8AutonomousPreparationActive(new Date("2026-05-01T10:00:00.000Z"))).toBe(
      true,
    );
  });

  it("offers preparation with permission-first language", () => {
    seedPhase8Base();
    const offer = maybeAutonomousPreparationOffer({
      userText: "I want to launch my workshop",
      now: new Date("2026-05-01T10:00:00.000Z"),
    });
    expect(offer).toMatch(/Would you like|control|Only if/i);
  });

  it("includes preparation guidance in chat hints without autonomous action", () => {
    seedPhase8Base();
    const hint = phase8AutonomousPreparationHintForChat({
      userText: "Help me plan my workshop launch",
      now: new Date("2026-05-01T10:00:00.000Z"),
    });
    expect(hint).toMatch(/PHASE 8 AUTONOMOUS PREPARATION/i);
    expect(hint).toMatch(/NEVER.*send|publish/i);
    expect(hint).toMatch(/permission/i);
  });
});
