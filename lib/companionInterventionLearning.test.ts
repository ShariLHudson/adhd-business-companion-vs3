import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeInterventionRates,
  getAdaptiveInterventionWeight,
  getEcosystemInterventionLearning,
  getInterventionEffectivenessProfile,
  getUserInterventionEffectiveness,
  rankInterventionsForContext,
  recordCapabilityLifecycleFromRegistry,
  recordInterventionLifecycle,
  resetInterventionLearningForTests,
  seedInterventionLearningDemoData,
} from "./companionInterventionLearning";
import { recordCapabilityIntervention } from "./companionCapabilityRegistry";
import { computeInterventionEffectiveness } from "./companionAdaptiveUserEngine";

describe("companionInterventionLearning", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetInterventionLearningForTests();
  });

  it("tracks recommendation through outcome lifecycle", () => {
    recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "recommended" });
    recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "accepted" });
    recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "opened" });
    recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "completed" });
    recordInterventionLifecycle({ interventionId: "clear_my_mind", stage: "reported_helpful" });

    const profile = getInterventionEffectivenessProfile();
    const counts = profile.interventions.clear_my_mind;
    expect(counts.recommended).toBe(1);
    expect(counts.accepted).toBe(1);
    expect(counts.completed).toBe(1);
    expect(counts.reportedHelpful).toBe(1);

    const eco = getEcosystemInterventionLearning();
    expect(eco.interventions.clear_my_mind?.recommended).toBe(1);
  });

  it("computes rates from demo data matching spec example", () => {
    seedInterventionLearningDemoData();
    const entries = getUserInterventionEffectiveness();
    const clearMind = entries.find((e) => e.id === "clear_my_mind")!;
    const compass = entries.find((e) => e.id === "decision_compass")!;

    expect(clearMind.rates.acceptanceRate).toBe(82);
    expect(clearMind.rates.completionRate).toBe(74);
    expect(clearMind.rates.momentumImpact).toBe(80);
    expect(compass.rates.acceptanceRate).toBe(36);
    expect(clearMind.rates.adaptiveWeight).toBeGreaterThan(compass.rates.adaptiveWeight);
  });

  it("adaptive weighting prefers effective interventions", () => {
    seedInterventionLearningDemoData();
    const clearWeight = getAdaptiveInterventionWeight("clear_my_mind");
    const compassWeight = getAdaptiveInterventionWeight("decision_compass");
    expect(clearWeight).toBeGreaterThan(compassWeight);

    const ranked = rankInterventionsForContext({ emotionalState: "overwhelmed" });
    expect(ranked[0]?.id).toBe("clear_my_mind");
  });

  it("wires capability registry to lifecycle tracking", () => {
    recordCapabilityIntervention({
      capabilityId: "clear_my_mind",
      action: "offer_shown",
    });
    recordCapabilityIntervention({
      capabilityId: "clear_my_mind",
      action: "offer_accepted",
    });
    recordCapabilityIntervention({
      capabilityId: "clear_my_mind",
      action: "action_completed",
    });

    const counts = getInterventionEffectivenessProfile().interventions.clear_my_mind;
    expect(counts.recommended).toBe(1);
    expect(counts.accepted).toBe(1);
    expect(counts.completed).toBe(1);
  });

  it("feeds adaptive user intelligence effectiveness", () => {
    seedInterventionLearningDemoData();
    const effectiveness = computeInterventionEffectiveness();
    expect(effectiveness[0]?.label).toMatch(/Clear My Mind/i);
    expect(effectiveness[0]?.successRate).toBeGreaterThan(50);
  });

  it("computeInterventionRates handles zero denominators", () => {
    const rates = computeInterventionRates({
      recommended: 0,
      accepted: 0,
      dismissed: 0,
      opened: 0,
      used: 0,
      completed: 0,
      returnedTo: 0,
      reportedHelpful: 0,
      momentumImproved: 0,
      confidenceImproved: 0,
    });
    expect(rates.acceptanceRate).toBe(0);
    expect(rates.adaptiveWeight).toBe(0);
  });

  it("recordCapabilityLifecycleFromRegistry maps actions", () => {
    recordCapabilityLifecycleFromRegistry({
      capabilityId: "visibility_support",
      action: "reported_success",
      confidenceImproved: true,
    });
    const counts = getInterventionEffectivenessProfile().interventions.visibility_support;
    expect(counts.reportedHelpful).toBeGreaterThan(0);
    expect(counts.confidenceImproved).toBeGreaterThan(0);
  });
});
