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
  generateFullStrategicOptions,
  identifyStrategicQuestion,
  isPricingStrategyLanguage,
  PRICING_HANDOFF_BOUNDARIES,
  PRICING_SHARI_VOICE_NOTES,
  classifyPricingEvidenceHints,
  detectPricingOfferShape,
  getPricingExperimentBlueprints,
  getPricingHeuristics,
  getPricingRoutingBoundaries,
  getPricingStrategicOptionPatterns,
  pricingDomainIntelligence,
  pricingEvidenceDisciplineRejects,
  pricingLooksLikeAssumptionNotEvidence,
  pricingMentionsFounderEffortAsValue,
  pricingOptionPatterns,
  pricingOptionsLookCosmetic,
  pricingQualityRejectReasons,
  pricingReversibilityForPattern,
  pricingShouldNotAssumePriceIsCause,
  pricingTreatsCompetitorAsObservation,
  pricingUnderlyingQuestionsForSurface,
  recommendStrategicOption,
  selectPricingExperimentBlueprints,
  shouldOfferStrategicOptions,
  strategicOptionsAreDistinct,
} from "@/lib/strategyChamber/intelligence";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function seedReadyForOptions(decisionStatement: string) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement,
    currentReality: "The current offer has been priced the same for two years.",
    desiredDirection: "A sustainable price that protects trust and capacity.",
    constraints: ["Limited weekly capacity", "Need to protect current customers"],
    assumptions: ["I think some people may leave"],
    knownFacts: ["Delivery load has increased"],
    memberStatements: [
      decisionStatement,
      "I need to protect capacity",
      "I am not sure which path is right",
    ],
  });
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 4B — Full Pricing Strategy Knowledge", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("completes Pricing domain contract v2 fields", () => {
    expect(pricingDomainIntelligence.version).toBe(2);
    expect(pricingDomainIntelligence.requiredContext.length).toBeGreaterThan(2);
    expect(pricingDomainIntelligence.optionalContext.length).toBeGreaterThan(2);
    expect(pricingDomainIntelligence.heuristics.length).toBeGreaterThanOrEqual(10);
    expect(pricingDomainIntelligence.strategicOptionPatterns.length).toBeGreaterThan(
      10,
    );
    expect(pricingDomainIntelligence.experimentBlueprints.length).toBeGreaterThanOrEqual(
      5,
    );
    expect(pricingDomainIntelligence.routingBoundaries.length).toBeGreaterThanOrEqual(6);
    expect(pricingDomainIntelligence.offerShapesSupported).toEqual(
      expect.arrayContaining([
        "membership",
        "consulting",
        "workshop",
        "productized_service",
        "new_offer",
      ]),
    );
    expect(pricingDomainIntelligence.maintenanceNotes.length).toBeGreaterThan(0);
    expect(pricingDomainIntelligence.adaptivePresentationNotes).toMatch(
      /Fewer Choices|presentation/i,
    );
  });

  // --- Scenarios A–L ---

  it("A: membership raise ask — detects domain, hidden questions, no auto-raise", () => {
    const text = "Should I raise the price of my membership?";
    expect(isPricingStrategyLanguage(text)).toBe(true);
    expect(detectPricingOfferShape(text)).toContain("membership");
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /value|effort|evidence|new customers/i.test(q))).toBe(
      true,
    );
    const patterns = pricingOptionPatterns({});
    expect(patterns).toContain("protect_current_base");
    expect(patterns).toContain("test");
    expect(patterns[0]).not.toBe("increase_price");
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, { decisionStatement: text });
    expect(identifyStrategicQuestion(getStrategyWorkItem(item.id)!).strategyTypeId).toBe(
      "pricing",
    );
  });

  it("B: churn fear — assumption, not evidence", () => {
    const text = "My members will leave if I charge more.";
    expect(pricingLooksLikeAssumptionNotEvidence(text)).toBe(true);
    expect(classifyPricingEvidenceHints(text)).toContain("assumption_churn");
    const patterns = pricingOptionPatterns({ fearChurn: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["protect_current_base", "test", "staged_transition"]),
    );
  });

  it("C: weak buying → lower price — price not assumed cause", () => {
    const text = "People are not buying, so I should lower the price.";
    expect(pricingShouldNotAssumePriceIsCause(text)).toBe(true);
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /offer clear|audience|positioning|diagnose/i.test(q))).toBe(
      true,
    );
    const patterns = pricingOptionPatterns({ weakConversion: true });
    expect(patterns[0]).not.toBe("increase_price");
    expect(patterns).toContain("add_value");
  });

  it("D: delivery burden — effort ≠ value; scope options allowed", () => {
    const text = "I am doing too much for what I charge.";
    expect(pricingMentionsFounderEffortAsValue(text)).toBe(true);
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /scope|simplif|boundaries|price increase/i.test(q))).toBe(
      true,
    );
    const patterns = pricingOptionPatterns({ deliveryBurden: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["simplify", "protect_current_base", "test"]),
    );
  });

  it("E: new program pricing — no formula certainty; pilot/test allowed", () => {
    const text = "What should I charge for a new program?";
    expect(detectPricingOfferShape(text)).toEqual(
      expect.arrayContaining(["program", "new_offer"]),
    );
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /validation|founding|pilot|uncertain/i.test(q))).toBe(true);
    const patterns = pricingOptionPatterns({ newOffer: true });
    expect(patterns).toContain("test");
    expect(patterns).toContain("delay");
    expect(
      pricingQualityRejectReasons("Use this formula — charge 10x costs, it guarantees"),
    ).toContain("arbitrary_formula_as_certainty");
  });

  it("F: raise without upsetting current members — new vs existing paths", () => {
    const text = "I want to raise the price without upsetting current members.";
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /new customers|grandfather|tier/i.test(q))).toBe(true);
    expect(
      getPricingStrategicOptionPatterns().some((p) =>
        /new customers only|Grandfather/i.test(p),
      ),
    ).toBe(true);
    const patterns = pricingOptionPatterns({ fearChurn: true });
    expect(patterns).toContain("protect_current_base");
  });

  it("G: discount dependence — not automatic discount recommendation", () => {
    const text = "I always have to discount.";
    expect(pricingDomainIntelligence.commonAssumptions.some((a) => /discount/i.test(a))).toBe(
      true,
    );
    const patterns = pricingOptionPatterns({ discountDependence: true });
    expect(patterns).toContain("protect_current_base");
    const experiments = selectPricingExperimentBlueprints({
      discountDependence: true,
    });
    expect(experiments.some((e) => e.id === "discount_removal_test")).toBe(true);
  });

  it("H: competitor half price — observation, not proof", () => {
    const text = "My competitor charges half as much.";
    expect(pricingTreatsCompetitorAsObservation(text)).toBe(true);
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /comparable|positioning|relevant/i.test(q))).toBe(true);
    expect(
      pricingEvidenceDisciplineRejects(
        "Competitor prices prove the right price",
      ),
    ).toContain("competitor_price_as_proof");
    const patterns = pricingOptionPatterns({ competitorPressure: true });
    expect(patterns).toContain("add_value");
    expect(patterns[0]).not.toBe("increase_price");
  });

  it("I: premium tier — meaningful differentiation, not cosmetic %", () => {
    const text = "I want to add a premium tier.";
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /meaningful|confus|base/i.test(q))).toBe(true);
    const experiments = selectPricingExperimentBlueprints({ wantPremiumTier: true });
    expect(experiments[0].id).toBe("premium_tier_test");
    expect(
      pricingOptionsLookCosmetic(["Raise 10%", "Raise 15%", "Raise 20%"]),
    ).toBe(true);
    expect(
      pricingOptionsLookCosmetic([
        "Raise for new customers only",
        "Add a premium tier",
        "Keep the price and reduce scope",
      ]),
    ).toBe(false);
  });

  it("J: hourly to packages — structure options", () => {
    const text = "Should I switch from hourly to packages?";
    expect(detectPricingOfferShape(text)).toEqual(
      expect.arrayContaining(["hourly", "package"]),
    );
    expect(
      getPricingStrategicOptionPatterns().some((p) =>
        /Replace hourly pricing with packages/i.test(p),
      ),
    ).toBe(true);
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /structure|packaging|cash|accessibility/i.test(q))).toBe(
      true,
    );
  });

  it("K: annual pricing — optional path, not forced", () => {
    const text = "Should I offer annual pricing?";
    const experiments = selectPricingExperimentBlueprints({ wantAnnual: true });
    expect(experiments.some((e) => e.id === "annual_option_test")).toBe(true);
    expect(
      getPricingStrategicOptionPatterns().some((p) =>
        /monthly and annual|Add annual/i.test(p),
      ),
    ).toBe(true);
  });

  it("L: underpriced with weak evidence — maintain + test valid", () => {
    const text =
      "I think I am underpriced, but I do not have much evidence.";
    expect(pricingLooksLikeAssumptionNotEvidence(text)).toBe(true);
    const qs = pricingUnderlyingQuestionsForSurface(text);
    expect(qs.some((q) => /evidence|test|maintaining/i.test(q))).toBe(true);
    const patterns = pricingOptionPatterns({ weakEvidence: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["protect_current_base", "test", "delay"]),
    );
  });

  it("epistemic safety — evidence kinds and discipline rejects", () => {
    expect(classifyPricingEvidenceHints("We sold three this month")).toContain(
      "actual_sales_results",
    );
    expect(
      pricingEvidenceDisciplineRejects(
        "One sale validates demand at the new price",
      ),
    ).toContain("one_sale_as_demand");
    expect(
      pricingEvidenceDisciplineRejects(
        "Low sales prove the price is too high",
      ),
    ).toContain("low_sales_as_price_proof");
  });

  it("heuristics guide reasoning without being a generic checklist dump", () => {
    const h = getPricingHeuristics();
    expect(h.some((x) => /Diagnose the problem/i.test(x))).toBe(true);
    expect(h.some((x) => /Maintaining the current price is valid/i.test(x))).toBe(
      true,
    );
    expect(h.some((x) => /founder effort/i.test(x))).toBe(true);
  });

  it("experiment blueprints include required fields and canonical reversibility", () => {
    const blueprints = getPricingExperimentBlueprints();
    for (const b of blueprints) {
      expect(b.assumption.length).toBeGreaterThan(0);
      expect(b.action.length).toBeGreaterThan(0);
      expect(b.scope.length).toBeGreaterThan(0);
      expect(b.durationOrReview.length).toBeGreaterThan(0);
      expect(b.evidence.length).toBeGreaterThan(0);
      expect(b.successSignal.length).toBeGreaterThan(0);
      expect(b.stopSignal.length).toBeGreaterThan(0);
      expect(b.nextDecision.length).toBeGreaterThan(0);
      expect([
        "easily_reversible",
        "moderately_reversible",
        "difficult_to_reverse",
        "unknown",
      ]).toContain(b.typicalReversibility);
    }
  });

  it("routing boundaries preserve Strategy ownership and defer implementation", () => {
    const boundaries = getPricingRoutingBoundaries();
    expect(boundaries.some((b) => b.owner === "pricing_strategy")).toBe(true);
    expect(boundaries.some((b) => b.owner === "finance")).toBe(true);
    expect(boundaries.some((b) => b.owner === "marketing")).toBe(true);
    expect(boundaries.some((b) => b.owner === "create")).toBe(true);
    expect(boundaries.some((b) => b.owner === "projects")).toBe(true);
    expect(boundaries.some((b) => b.owner === "calendar")).toBe(true);
    expect(boundaries.some((b) => b.owner === "board")).toBe(true);
    expect(boundaries.some((b) => b.owner === "talk_it_out")).toBe(true);
    expect(PRICING_HANDOFF_BOUNDARIES.map((b) => b.destinationId)).toEqual(
      expect.arrayContaining([
        "business_estate",
        "create",
        "project",
        "calendar",
        "board",
        "talk_it_out",
      ]),
    );
  });

  it("option generation: ≤3 diverse options; maintain and test allowed; recommendation ≠ decision", () => {
    const ready = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    expect(shouldOfferStrategicOptions(ready)).toBe(true);
    const options = generateFullStrategicOptions(ready);
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(3);
    expect(strategicOptionsAreDistinct(options)).toBe(true);
    const patterns = options.map((o) => o.optionPattern);
    expect(
      patterns.some((p) =>
        ["protect_current_base", "maintain_current_direction", "delay", "test"].includes(
          p,
        ),
      ),
    ).toBe(true);
    const rec = recommendStrategicOption(ready);
    expect(rec).toBeTruthy();
    expect(rec!.isDecision).toBe(false);
  });

  it("reversibility guidance uses canonical union language", () => {
    expect(pricingReversibilityForPattern("test")).toBe("easily_reversible");
    expect(pricingReversibilityForPattern("increase_price")).toBe(
      "difficult_to_reverse",
    );
    expect(
      pricingDomainIntelligence.reversibilityGuidance.some((r) =>
        /Easily reversible/i.test(r),
      ),
    ).toBe(true);
    expect(
      pricingDomainIntelligence.reversibilityGuidance.some((r) =>
        /Difficult to reverse/i.test(r),
      ),
    ).toBe(true);
  });

  it("Shari voice notes stay warm and non-consultant", () => {
    expect(PRICING_SHARI_VOICE_NOTES.length).toBeGreaterThanOrEqual(5);
    expect(
      PRICING_SHARI_VOICE_NOTES.some((n) => /concern rather than evidence/i.test(n)),
    ).toBe(true);
    expect(
      PRICING_SHARI_VOICE_NOTES.every(
        (n) => !/optimize|leverage|synergy|best practice/i.test(n),
      ),
    ).toBe(true);
  });

  it("Adaptive Companion notes affect presentation only", () => {
    expect(pricingDomainIntelligence.adaptivePresentationNotes).toMatch(
      /Never reduce reasoning quality/i,
    );
  });

  it("quality checks reject automatic raise/lower and competitor-only guidance", () => {
    expect(
      pricingQualityRejectReasons("You must raise — higher is always better"),
    ).toContain("assumes_higher_always_better");
    expect(
      pricingQualityRejectReasons("Always lower the price to fix conversion"),
    ).toContain("assumes_lower_always_fixes");
    expect(
      pricingDomainIntelligence.qualityChecks.some((q) =>
        /Maintain-current-price/i.test(q),
      ),
    ).toBe(true);
  });

  it("canonical domainModel unions remain unchanged", () => {
    const src = readFileSync(
      resolve(process.cwd(), "lib/strategyChamber/domainModel.ts"),
      "utf8",
    );
    expect(src).toContain("easily_reversible");
    expect(src).toContain("moderately_reversible");
    expect(src).toContain("difficult_to_reverse");
    expect(src).not.toContain("PricingJudgmentStage");
  });
});
