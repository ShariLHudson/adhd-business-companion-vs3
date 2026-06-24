import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import { patchPhase2DiscoveryState, resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import {
  buildCompanionKnowledgeGraph,
  findNetworkAssetsForTopics,
  isPhase6CompanionIntelligenceNetworkActive,
  maybeExistingAssetReuseOffer,
  maybeRelatedResourceDiscoveryOffer,
  observePhase6NetworkTurn,
  phase6CompanionIntelligenceNetworkHintForChat,
  resetPhase6NetworkForTests,
  searchKnowledgeGraph,
} from "./phase6CompanionIntelligenceNetwork";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("phase6CompanionIntelligenceNetwork", () => {
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
    vi.restoreAllMocks();
  });

  function completePhase1() {
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
  }

  function seedForPhase6() {
    const started = new Date("2025-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach" },
      goals: [{ text: "Launch a workshop", recordedAt: started }],
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
  }

  function seedEcosystemAssets() {
    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop Launch",
        goal: "Launch workshop for coaches",
        goals: ["Sell out workshop"],
        horizon: "now",
        status: "in-progress",
        nextAction: "Outline modules",
        color: "#1e4f4f",
        createdAt: "2025-02-01T10:00:00.000Z",
        updatedAt: "2025-02-01T10:00:00.000Z",
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Product Validation Survey",
        artifactType: "Form",
        body: "Workshop validation questions",
        status: "saved",
        savedLocation: "My Work > Documents > Product Validation Survey",
        typeFolder: "Documents",
        preview: "Workshop validation",
        tags: ["workshop", "survey"],
        sourceWorkspace: "create",
        createdAt: "2025-02-02T10:00:00.000Z",
        updatedAt: "2025-02-02T10:00:00.000Z",
      },
    ]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue({
      role: "Coach",
      sells: "Workshop program",
      goals: ["Grow visibility"],
      traits: [],
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
  }

  it("activates when phase 5 is active and enough assets exist", () => {
    completePhase1();
    seedForPhase6();
    seedEcosystemAssets();
    expect(isPhase6CompanionIntelligenceNetworkActive(new Date("2026-04-15T10:00:00.000Z"))).toBe(
      true,
    );
  });

  it("builds a knowledge graph with cross-links", () => {
    completePhase1();
    seedForPhase6();
    seedEcosystemAssets();
    const graph = buildCompanionKnowledgeGraph(new Date("2026-04-15T10:00:00.000Z"));
    expect(graph.nodes.length).toBeGreaterThanOrEqual(4);
    expect(graph.nodes.some((n) => /workshop/i.test(n.label))).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it("finds related assets for workshop and survey topics", () => {
    completePhase1();
    seedForPhase6();
    seedEcosystemAssets();
    const matches = findNetworkAssetsForTopics(["workshop", "survey"]);
    expect(matches.length).toBeGreaterThan(0);
    expect(searchKnowledgeGraph("workshop survey").length).toBeGreaterThan(0);
  });

  it("offers existing asset reuse for survey requests", () => {
    completePhase1();
    seedForPhase6();
    seedEcosystemAssets();
    const offer = maybeExistingAssetReuseOffer({
      userText: "I need questions for a customer survey about my workshop",
      now: new Date("2026-04-20T10:00:00.000Z"),
    });
    expect(offer).toMatch(/Product Validation Survey/i);
    expect(offer).toMatch(/reuse|modify|new version/i);
  });

  it("surfaces related resource discovery for connected topics", () => {
    completePhase1();
    seedForPhase6();
    seedEcosystemAssets();
    const offer = maybeRelatedResourceDiscoveryOffer({
      userText: "Help me with my workshop launch",
      now: new Date("2026-04-21T10:00:00.000Z"),
    });
    expect(offer).toBeTruthy();
    expect(offer!).toMatch(/workshop|connected|already|seeing/i);
  });

  it("includes network guidance in chat hints", () => {
    completePhase1();
    seedForPhase6();
    seedEcosystemAssets();
    const hint = phase6CompanionIntelligenceNetworkHintForChat({
      userText: "I want to launch a workshop",
    });
    expect(hint).toMatch(/PHASE 6 COMPANION INTELLIGENCE NETWORK/i);
    expect(hint).toMatch(/Knowledge graph/i);
    expect(hint).toMatch(/second brain/i);
  });
});
