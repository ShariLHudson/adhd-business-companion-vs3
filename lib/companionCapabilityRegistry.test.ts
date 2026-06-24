import { describe, expect, it } from "vitest";
import {
  COMPANION_CAPABILITY_REGISTRY,
  findCapabilitiesForActualNeed,
  getCapabilitiesByStatus,
  listRegisteredCapabilityIds,
  matchIntelligenceCapabilityForText,
  matchRegisteredCapabilityForText,
  recordCapabilityIntervention,
} from "./companionCapabilityRegistry";
import {
  detectEcosystemProblemIntent,
  companionEcosystemRoutingHintForChat,
} from "./companionEcosystemIntent";
import { validateCapabilityDesign, runVision2029Test } from "./futureCapabilityArchitecture";

describe("companionCapabilityRegistry", () => {
  it("registers all sprint capabilities", () => {
    const ids = listRegisteredCapabilityIds();
    expect(ids).toContain("clear_my_mind");
    expect(ids).toContain("create_workspace");
    expect(ids).toContain("postcraft");
    expect(ids).toContain("visibility_support");
    expect(COMPANION_CAPABILITY_REGISTRY.length).toBeGreaterThanOrEqual(24);
  });

  it("registry-driven routing defers vague phrases before workspace offers (P-1a)", () => {
    expect(detectEcosystemProblemIntent("I have too much on my mind right now")).toBeNull();
    expect(detectEcosystemProblemIntent("I can't decide which offer to launch")).toBeNull();
    expect(detectEcosystemProblemIntent("I need content ideas for LinkedIn")?.section).toBe(
      "content-generator",
    );
    expect(detectEcosystemProblemIntent("help me write a newsletter draft")).toBeNull();
  });

  it("routes intelligence capabilities without workspace section", () => {
    const sales = matchIntelligenceCapabilityForText(
      "I know I should make the call but I keep putting it off",
    );
    expect(sales?.id).toBe("sales_call_support");

    const visibility = matchIntelligenceCapabilityForText(
      "I know I should make videos but I keep putting it off",
    );
    expect(visibility?.id).toBe("visibility_support");
  });

  it("finds capabilities by actual need", () => {
    const confidence = findCapabilitiesForActualNeed("build_confidence");
    expect(confidence.some((c) => c.id === "visibility_support")).toBe(true);
  });

  it("production and partial capabilities pass design gates", () => {
    for (const cap of [...getCapabilitiesByStatus("production"), ...getCapabilitiesByStatus("partial")]) {
      const design = validateCapabilityDesign({
        observable: cap.learningSignals.length >= 5,
        learnable: true,
        personalizable: true,
        predictable: cap.needMapping.adhdPatterns.length > 0,
        companionConnected: true,
      });
      expect(design.passesArchitectureRule, cap.id).toBe(true);

      const vision = runVision2029Test({
        scalesTenX: true,
        usesRegistrationNotHardcoding: true,
        companionRemainsCenter: true,
      });
      expect(vision.approved, cap.id).toBe(true);
    }
  });

  it("future capabilities have minimum registration", () => {
    for (const cap of getCapabilitiesByStatus("future")) {
      expect(cap.needMapping.actualNeeds.length).toBeGreaterThan(0);
      expect(cap.contextContract.userGoal || cap.contextContract.currentProblem).toBe(true);
      expect(cap.routingRules.whenToOffer.length).toBeGreaterThan(0);
    }
  });

  it("capability routing hint defers keyword-first offers (P-1a)", () => {
    const hint = companionEcosystemRoutingHintForChat("my head is full of stuff");
    expect(hint).toMatch(/UNDERSTAND BEFORE SUGGESTING/);
    expect(hint).not.toMatch(/CAPABILITY REGISTRY/);
  });

  it("records intervention without throwing", () => {
    expect(() =>
      recordCapabilityIntervention({
        capabilityId: "clear_my_mind",
        action: "offer_shown",
        reason: "mental_load",
        confidence: 0.8,
      }),
    ).not.toThrow();
  });

  it("adapt my day remains owned by page routing path", () => {
    expect(matchRegisteredCapabilityForText("I need to adapt my day")).toBeNull();
  });
});
