import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateCompanionTurn } from "@/lib/companionGovernor";
import { resolveIntent } from "@/lib/intentStabilizer";
import type { WorkspaceOpenSnapshot } from "@/lib/workspaceExecution";
import {
  initCompanionSession,
  resetCompanionSessionForTests,
} from "./companionSession";
import { PROFILE_LEARNING_FLAG_KEYS } from "./featureFlags";
import {
  observeEcosystemSuppressions,
  observeGovernorTurnSurface,
  resetGovernorTrustDedupeForTests,
} from "./governorTrustSignals";
import {
  getIntelligenceProfile,
  saveIntelligenceProfile,
} from "./profileStore";
import { getIntelligenceSignalStore } from "./signalStore";
import { resetTrustDiagnosticsForTests } from "./trustDiagnostics";
import { recordTrustEvidence } from "./trustSignals";

function mockStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: storage });
  vi.stubGlobal("structuredClone", (v: unknown) => JSON.parse(JSON.stringify(v)));
}

const emptySnap: WorkspaceOpenSnapshot = {
  open: false,
  section: null,
  title: null,
  fieldCount: 0,
  filledCount: 0,
};

function resetTrustState(): void {
  resetCompanionSessionForTests();
  resetTrustDiagnosticsForTests();
  resetGovernorTrustDedupeForTests();
  localStorage.removeItem("companion-intelligence-signals-v1");
  localStorage.removeItem("companion-intelligence-profile-v1");
  localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
  saveIntelligenceProfile(structuredClone(getIntelligenceProfile()));
  initCompanionSession();
}

function trustTraits() {
  return getIntelligenceProfile().relationship.trust;
}

function totalObservations(): number {
  const t = trustTraits();
  return [
    t.responds_to_suggestions,
    t.ignores_generic_suggestions,
    t.momentum_from_interventions,
    t.disengages_from_nagging,
  ].reduce((sum, trait) => sum + (trait?.observations ?? 0), 0);
}

describe("trust safety invariants", () => {
  beforeEach(() => {
    mockStorage();
    resetTrustState();
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
  });

  it("offer_suppressed never evolves negative trust", () => {
    const before = structuredClone(trustTraits());
    recordTrustEvidence({
      category: "trust.offer_suppressed",
      offerKey: "momentum_offer",
      source: "safety-test",
      causationType: "system_suppressed",
    });
    const after = trustTraits();
    expect(after.disengages_from_nagging).toEqual(before.disengages_from_nagging);
    expect(after.ignores_generic_suggestions).toEqual(
      before.ignores_generic_suggestions,
    );
    expect(totalObservations()).toBe(
      (before.responds_to_suggestions?.observations ?? 0) +
        (before.ignores_generic_suggestions?.observations ?? 0) +
        (before.momentum_from_interventions?.observations ?? 0) +
        (before.disengages_from_nagging?.observations ?? 0),
    );
  });

  it("system_suppressed via observer cannot update disengages_from_nagging", () => {
    const beforeObs = trustTraits().disengages_from_nagging?.observations ?? 0;
    observeEcosystemSuppressions({
      userState: {
        health: "healthy",
        summary: "",
        cognitiveLoadLevel: null,
        activationState: null,
        recoveryLevel: null,
        userHealthStatus: null,
      },
      founderState: {
        health: "healthy",
        summary: "",
        businessHealth: null,
        chiefAssessment: null,
        topRisk: null,
        topOpportunity: null,
      },
      topSignal: "calm_presence",
      activeIntelligenceLayers: [],
      recommendedSurface: "none",
      priorityReason: "test",
      suppressions: ["momentum_offer"],
      suggestedTone: "calm",
      avoidGuidance: [],
      createdAt: new Date().toISOString(),
    });
    expect(trustTraits().disengages_from_nagging?.observations ?? 0).toBe(
      beforeObs,
    );
  });

  it("offer_blocked never evolves negative trust", () => {
    const before = structuredClone(trustTraits());
    recordTrustEvidence({
      category: "trust.offer_blocked",
      offerKey: "generic_tip",
      source: "safety-test",
      causationType: "system_blocked",
    });
    const after = trustTraits();
    expect(after.disengages_from_nagging).toEqual(before.disengages_from_nagging);
    expect(after.ignores_generic_suggestions).toEqual(
      before.ignores_generic_suggestions,
    );
  });

  it("system_blocked via observer cannot update ignores_generic_suggestions", () => {
    const beforeObs =
      trustTraits().ignores_generic_suggestions?.observations ?? 0;
    const input = {
      userText: "I feel completely overwhelmed and panicking",
      lastAssistantText: "",
      workspacePanel: null,
      workspaceSnap: emptySnap,
      resolvedIntent: resolveIntent("I feel completely overwhelmed and panicking"),
    };
    const surface = evaluateCompanionTurn(input);
    observeGovernorTurnSurface(surface, input);
    expect(trustTraits().ignores_generic_suggestions?.observations ?? 0).toBe(
      beforeObs,
    );
  });

  it("offer_rendered never evolves traits", () => {
    const beforeObs = totalObservations();
    const result = recordTrustEvidence({
      category: "trust.offer_rendered",
      offerKey: "breathe",
      source: "safety-test",
    });
    expect(result.decision.evolve).toBe(false);
    expect(result.decision.reason).toBe("render_only_signal");
    expect(totalObservations()).toBe(beforeObs);
  });

  it("render-only events cannot change observations", () => {
    recordTrustEvidence({
      category: "trust.offer_rendered",
      offerKey: "clear-mind",
      source: "safety-test",
    });
    recordTrustEvidence({
      category: "trust.offer_suppressed",
      offerKey: "momentum_offer",
      source: "safety-test",
      causationType: "system_suppressed",
    });
    expect(totalObservations()).toBe(0);
  });

  it("unknown bucket never evolves traits", () => {
    const beforeObs = totalObservations();
    const result = recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "not-a-real-bucket",
      source: "safety-test",
    });
    expect(result.decision.evolve).toBe(false);
    expect(result.decision.reason).toBe("unknown_intervention_bucket");
    expect(totalObservations()).toBe(beforeObs);
  });

  it("learning OFF blocks all trait movement", () => {
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
    recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "clear-mind",
      source: "safety-test",
    });
    recordTrustEvidence({
      category: "trust.suggestion_dismissed",
      offerKey: "get-unstuck",
      source: "safety-test",
    });
    expect(totalObservations()).toBe(0);
    expect(getIntelligenceSignalStore().signals.filter((s) => s.domain === "trust")).toHaveLength(
      2,
    );
  });

  it("learning ON only evolves valid user_action signals", () => {
    const accepted = recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "clear-mind",
      source: "safety-test",
      causationType: "user_action",
    });
    expect(accepted.decision.evolve).toBe(true);

    const suppressed = recordTrustEvidence({
      category: "trust.offer_suppressed",
      offerKey: "momentum_offer",
      source: "safety-test",
      causationType: "system_suppressed",
    });
    expect(suppressed.decision.evolve).toBe(false);

    const obs = totalObservations();
    expect(obs).toBeGreaterThan(0);
    expect(trustTraits().responds_to_suggestions?.observations).toBe(1);
    expect(trustTraits().disengages_from_nagging?.observations ?? 0).toBe(0);
  });
});
