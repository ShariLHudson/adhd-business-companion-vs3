import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
} from "@/lib/adaptiveCompanionIntelligence";
import {
  __resetStrategyChamberStoresForTests,
  createStrategyWorkItem,
  getStrategyWorkItem,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";
import {
  GROWTH_HANDOFF_BOUNDARIES,
  GROWTH_SHARI_VOICE_NOTES,
  assessGrowthReadinessHint,
  detectGrowthConstraints,
  detectGrowthTypes,
  generateFullStrategicOptions,
  getDomainIntelligence,
  getGrowthExperimentBlueprints,
  getGrowthHeuristics,
  getGrowthRoutingBoundaries,
  growthDomainIntelligence,
  growthEvidenceDisciplineRejects,
  growthLooksLikeAssumptionNotEvidence,
  growthOptionPatterns,
  growthOptionsLookCosmetic,
  growthQualityRejectReasons,
  growthReversibilityForPattern,
  growthShouldNotAssumeAcquisition,
  growthTreatsSocialAsNonProof,
  growthUnderlyingQuestionsForSurface,
  identifyStrategicQuestion,
  isGrowthStrategyLanguage,
  matchProblemDistinction,
  recommendStrategicOption,
  selectGrowthExperimentBlueprints,
  shouldOfferStrategicOptions,
  strategicOptionsAreDistinct,
  suggestGrowthSecondaryDomain,
} from "@/lib/strategyChamber/intelligence";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function seedReadyForOptions(decisionStatement: string) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement,
    currentReality: "Demand and capacity feel uneven.",
    desiredDirection: "Growth that the business can actually support.",
    constraints: ["Limited weekly capacity", "Need to protect quality"],
    assumptions: ["I think I need more customers"],
    knownFacts: ["Some customers renew; some leave"],
    memberStatements: [
      decisionStatement,
      "I need to protect capacity",
      "I am not sure which path is right",
    ],
  });
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 4C — Full Growth Strategy Knowledge", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("completes Growth domain contract v2 fields", () => {
    expect(growthDomainIntelligence.version).toBe(2);
    expect(growthDomainIntelligence.requiredContext.length).toBeGreaterThan(2);
    expect(growthDomainIntelligence.heuristics.length).toBeGreaterThanOrEqual(12);
    expect(growthDomainIntelligence.experimentBlueprints.length).toBeGreaterThanOrEqual(
      6,
    );
    expect(growthDomainIntelligence.routingBoundaries.length).toBeGreaterThanOrEqual(8);
    expect(growthDomainIntelligence.growthTypesSupported).toEqual(
      expect.arrayContaining([
        "customer_growth",
        "retention_growth",
        "referral_growth",
        "strategic_simplification",
      ]),
    );
    expect(getDomainIntelligence("growth")?.guidingPrinciples.some((p) =>
      /do not grow yet|don't grow yet/i.test(p),
    )).toBe(true);
  });

  // --- Scenarios A–L ---

  it("A: more customers — not auto-acquisition; capacity considered", () => {
    const text = "I need more customers.";
    expect(isGrowthStrategyLanguage(text)).toBe(true);
    expect(growthShouldNotAssumeAcquisition(text)).toBe(true);
    const qs = growthUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /capacity|convert|audience|higher-value/i.test(q))).toBe(
      true,
    );
    const patterns = growthOptionPatterns({});
    expect(patterns[0]).not.toBe("expand");
    expect(patterns).toEqual(
      expect.arrayContaining(["narrow", "test", "improve"]),
    );
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, { decisionStatement: text });
    expect(identifyStrategicQuestion(getStrategyWorkItem(item.id)!).strategyTypeId).toBe(
      "growth",
    );
    expect(
      growthDomainIntelligence.routingBoundaries.some(
        (b) => b.owner === "marketing" && /Strategic direction is clear/i.test(b.when),
      ),
    ).toBe(true);
  });

  it("B: more revenue — volume vs price/retention; Pricing secondary possible", () => {
    const text = "I need more revenue.";
    const types = detectGrowthTypes(text);
    expect(types).toContain("revenue_growth");
    const qs = growthUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /price|retention|value|cash/i.test(q))).toBe(true);
    expect(suggestGrowthSecondaryDomain("Revenue is still low with plenty of customers")).toBe(
      "pricing",
    );
  });

  it("C: stopped growing — plateau not automatic pivot", () => {
    const text = "My business has stopped growing.";
    const qs = growthUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /plateau|ceiling|refinement/i.test(q))).toBe(true);
    expect(
      growthQualityRejectReasons("You must pivot immediately to a new market"),
    ).not.toContain("marks_recommendation_as_confirmed");
    const patterns = growthOptionPatterns({ weakEvidence: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["test", "stabilize", "delay"]),
    );
  });

  it("D: three new offers — focus and maintenance", () => {
    const text = "I want to launch three new offers so I can grow.";
    const { primary } = detectGrowthConstraints(text);
    expect(["focus_constraint", "offer_constraint"]).toContain(primary);
    expect(assessGrowthReadinessHint(text)).toBe("ready_to_simplify_before_growing");
    const patterns = growthOptionPatterns({ focusScattered: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["narrow", "simplify", "stabilize"]),
    );
    expect(suggestGrowthSecondaryDomain(text)).toBe("offer");
  });

  it("E: lots of inquiries, cannot keep up — capacity, not more acquisition", () => {
    const text = "I am getting lots of inquiries, but I cannot keep up.";
    const { primary } = detectGrowthConstraints(text);
    expect(primary).toBe("delivery_constraint");
    expect(assessGrowthReadinessHint(text)).toBe("ready_to_stabilize_delivery_first");
    const patterns = growthOptionPatterns({ capacityTight: true });
    expect(patterns).toContain("stabilize");
    expect(patterns).not.toContain("expand");
    expect(suggestGrowthSecondaryDomain(text)).toBe("capacity_focus");
    const growth = getDomainIntelligence("growth")!;
    expect(matchProblemDistinction(growth, text)?.id).toBe("capacity");
  });

  it("F: plenty of customers, low revenue — not more customers by default", () => {
    const text = "I have plenty of customers, but revenue is still low.";
    const qs = growthUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /price|value|offer mix|higher-value/i.test(q))).toBe(true);
    const patterns = growthOptionPatterns({ revenueNotVolume: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["add_value", "improve", "test"]),
    );
    expect(patterns[0]).not.toBe("expand");
  });

  it("G: expand into another market — pilot / reversibility", () => {
    const text = "Should I expand into another market?";
    const types = detectGrowthTypes(text);
    expect(types).toEqual(
      expect.arrayContaining(["geographic_expansion"]),
    );
    const patterns = growthOptionPatterns({ marketExpansion: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["test", "delay", "narrow"]),
    );
    expect(suggestGrowthSecondaryDomain(text)).toBe("market_customer");
    const experiments = selectGrowthExperimentBlueprints({ marketExpansion: true });
    expect(experiments.some((e) => e.id === "narrow_market_experiment")).toBe(true);
  });

  it("H: grow fast — readiness without moralizing", () => {
    const text = "I want to grow fast.";
    const qs = growthUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /speed|ready|staged/i.test(q))).toBe(true);
    expect(
      GROWTH_SHARI_VOICE_NOTES.every(
        (n) => !/scale at all costs|you need a funnel/i.test(n),
      ),
    ).toBe(true);
  });

  it("I: do not want bigger — maintain size valid", () => {
    const text =
      "I do not want a bigger business, but I feel like I should.";
    expect(growthLooksLikeAssumptionNotEvidence(text)).toBe(true);
    expect(assessGrowthReadinessHint(text)).toBe("current_scale_appropriate");
    const patterns = growthOptionPatterns({ wantMaintainSize: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["maintain_current_direction", "stabilize"]),
    );
    expect(
      getGrowthHeuristics().some((h) => /Maintaining the current size is valid/i.test(h)),
    ).toBe(true);
  });

  it("J: hire before grow — hiring may be secondary", () => {
    const text = "I think I need to hire before I can grow.";
    const patterns = growthOptionPatterns({ hireToGrow: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["simplify", "delegate", "test", "delay"]),
    );
    expect(suggestGrowthSecondaryDomain(text)).toBe("hiring_delegation");
  });

  it("K: customers do not stay — retention before acquisition", () => {
    const text = "My customers do not stay very long.";
    const { primary } = detectGrowthConstraints(text);
    expect(primary).toBe("retention_constraint");
    expect(assessGrowthReadinessHint(text)).toBe("ready_to_improve_retention_first");
    const patterns = growthOptionPatterns({ retentionLeak: true });
    expect(patterns).toContain("protect_current_base");
    expect(patterns[0]).not.toBe("expand");
    const experiments = selectGrowthExperimentBlueprints({ retentionLeak: true });
    expect(experiments[0].id).toBe("retention_experiment");
  });

  it("L: social growing, business not — engagement not proof", () => {
    const text = "My social media is growing, but my business is not.";
    expect(growthTreatsSocialAsNonProof(text)).toBe(true);
    expect(
      growthEvidenceDisciplineRejects(
        "Social engagement proves buying demand",
      ),
    ).toContain("social_as_buying_demand");
    const qs = growthUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /attention|buying|conversion/i.test(q))).toBe(true);
  });

  it("growth types, constraints, heuristics, and evidence discipline", () => {
    expect(detectGrowthTypes("I need more customers through referrals")).toEqual(
      expect.arrayContaining(["customer_growth", "referral_growth"]),
    );
    const { primary, secondary } = detectGrowthConstraints(
      "I cannot keep up and customers cancel quickly",
    );
    expect(primary).toBe("delivery_constraint");
    expect(secondary).toBeTruthy();
    expect(getGrowthHeuristics().some((h) => /Diagnose the growth constraint/i.test(h))).toBe(
      true,
    );
    expect(
      growthEvidenceDisciplineRejects("Revenue means sustainable growth"),
    ).toContain("revenue_as_sustainable_growth");
  });

  it("experiment blueprints include required fields and capacity limits", () => {
    for (const b of getGrowthExperimentBlueprints()) {
      expect(b.assumption.length).toBeGreaterThan(0);
      expect(b.strategicQuestion.length).toBeGreaterThan(0);
      expect(b.action.length).toBeGreaterThan(0);
      expect(b.scope.length).toBeGreaterThan(0);
      expect(b.durationOrReview.length).toBeGreaterThan(0);
      expect(b.evidence.length).toBeGreaterThan(0);
      expect(b.successSignal.length).toBeGreaterThan(0);
      expect(b.stopSignal.length).toBeGreaterThan(0);
      expect(b.capacityLimit.length).toBeGreaterThan(0);
      expect(b.nextDecision.length).toBeGreaterThan(0);
      expect([
        "easily_reversible",
        "moderately_reversible",
        "difficult_to_reverse",
        "unknown",
      ]).toContain(b.typicalReversibility);
    }
  });

  it("routing boundaries keep Strategy ownership; Marketing is not automatic", () => {
    const boundaries = getGrowthRoutingBoundaries();
    expect(boundaries.some((b) => b.owner === "growth_strategy")).toBe(true);
    expect(boundaries.some((b) => b.owner === "marketing")).toBe(true);
    expect(boundaries.some((b) => b.owner === "finance")).toBe(true);
    expect(boundaries.some((b) => b.owner === "capacity_and_focus")).toBe(true);
    expect(boundaries.some((b) => b.owner === "hiring_and_delegation")).toBe(true);
    expect(GROWTH_HANDOFF_BOUNDARIES.map((b) => b.destinationId)).toEqual(
      expect.arrayContaining([
        "business_estate",
        "create",
        "project",
        "board",
        "talk_it_out",
      ]),
    );
    expect(
      growthQualityRejectReasons("Routing to marketing now automatically"),
    ).toContain("automatic_marketing_handoff");
  });

  it("≤3 diverse options; maintain/stabilize/test allowed; recommendation ≠ decision", () => {
    const ready = seedReadyForOptions("I need more customers.");
    expect(shouldOfferStrategicOptions(ready)).toBe(true);
    const options = generateFullStrategicOptions(ready);
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(3);
    expect(strategicOptionsAreDistinct(options)).toBe(true);
    expect(
      growthOptionsLookCosmetic([
        "Post more on Facebook",
        "Post more on Instagram",
        "Post more on LinkedIn",
      ]),
    ).toBe(true);
    const capacityReady = seedReadyForOptions(
      "I am getting lots of inquiries, but I cannot keep up.",
    );
    const capacityOpts = generateFullStrategicOptions(capacityReady);
    expect(
      capacityOpts.some((o) =>
        ["stabilize", "protect_current_base", "simplify", "delay", "test"].includes(
          o.optionPattern,
        ),
      ),
    ).toBe(true);
    const rec = recommendStrategicOption(ready);
    expect(rec).toBeTruthy();
    expect(rec!.isDecision).toBe(false);
  });

  it("opportunity cost, risk, reversibility, and adaptive notes", () => {
    expect(growthDomainIntelligence.opportunityCostPrompts.length).toBeGreaterThan(3);
    expect(growthDomainIntelligence.riskPatterns.length).toBeGreaterThan(5);
    expect(growthReversibilityForPattern("test")).toBe("easily_reversible");
    expect(growthReversibilityForPattern("expand")).toBe("difficult_to_reverse");
    expect(growthDomainIntelligence.adaptivePresentationNotes).toMatch(
      /Never reduce reasoning quality/i,
    );
    expect(growthDomainIntelligence.successSignals.every((s) => !/^Revenue$/i.test(s))).toBe(
      true,
    );
  });

  it("cross-domain loading is selective", () => {
    expect(suggestGrowthSecondaryDomain("I need more customers.")).toBeNull();
    expect(
      suggestGrowthSecondaryDomain(
        "I am getting lots of inquiries, but I cannot keep up.",
      ),
    ).toBe("capacity_focus");
    expect(growthDomainIntelligence.possibleSecondaryDomains).toEqual(
      expect.arrayContaining(["pricing", "offer", "capacity_focus"]),
    );
  });

  it("canonical domainModel unions remain unchanged", () => {
    const src = readFileSync(
      resolve(process.cwd(), "lib/strategyChamber/domainModel.ts"),
      "utf8",
    );
    expect(src).toContain("easily_reversible");
    expect(src).not.toContain("GrowthJudgmentStage");
  });
});
