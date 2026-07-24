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
  analyzeStrategyWorkItem,
  generateFullStrategicOptions,
  identifyStrategicQuestion,
  isPricingStrategyLanguage,
  PRICING_HANDOFF_BOUNDARIES,
  pricingDomainIntelligence,
  pricingLooksLikeAssumptionNotEvidence,
  pricingMentionsFounderEffortAsValue,
  pricingOptionPatterns,
  pricingQualityRejectReasons,
  pricingShouldNotAssumePriceIsCause,
  pricingUnderlyingQuestionsForSurface,
  recommendStrategicOption,
  shouldOfferStrategicOptions,
  strategicOptionsAreDistinct,
} from "@/lib/strategyChamber/intelligence";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function seedReadyForOptions(decisionStatement: string) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement,
    currentReality: "Membership has been at the same price for two years.",
    desiredDirection: "A sustainable price that protects trust.",
    constraints: ["Limited weekly capacity", "Need to protect current members"],
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

describe("Strategy Intelligence Phase 4A — Pricing Strategy", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("detects Pricing domain from pricing language", () => {
    expect(
      isPricingStrategyLanguage(
        "Should I raise the price of my membership?",
      ),
    ).toBe(true);
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise the price of my membership?",
    });
    const analysis = identifyStrategicQuestion(getStrategyWorkItem(item.id)!);
    expect(analysis.strategyTypeId).toBe("pricing");
    expect(analysis.questionType).toBe("pricing_decision");
  });

  it("surfaces underlying questions beneath a raise ask", () => {
    const qs = pricingUnderlyingQuestionsForSurface(
      "Should I raise the price of my membership?",
    );
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.some((q) => /value|effort|new customers|evidence/i.test(q))).toBe(
      true,
    );
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise the price of my membership?",
    });
    const analysis = identifyStrategicQuestion(getStrategyWorkItem(item.id)!);
    expect(analysis.alternateQuestions.length).toBeGreaterThan(0);
  });

  it("treats churn fear as assumption, not evidence", () => {
    expect(
      pricingLooksLikeAssumptionNotEvidence(
        "My members will leave if I charge more.",
      ),
    ).toBe(true);
    const classified = pricingDomainIntelligence.commonAssumptions.some((a) =>
      /leave/i.test(a),
    );
    expect(classified).toBe(true);
  });

  it("does not assume price is the cause of weak sales", () => {
    expect(
      pricingShouldNotAssumePriceIsCause(
        "People are not buying, so I think I should lower the price.",
      ),
    ).toBe(true);
    const patterns = pricingOptionPatterns({ weakConversion: true });
    expect(patterns[0]).not.toBe("increase_price");
    expect(patterns).toContain("add_value");
    expect(patterns).toContain("protect_current_base");
  });

  it("distinguishes founder effort from customer value", () => {
    expect(
      pricingMentionsFounderEffortAsValue(
        "I’m doing too much for what I charge.",
      ),
    ).toBe(true);
    expect(
      pricingDomainIntelligence.valueChecks.some((v) =>
        /founder effort|customer outcome/i.test(v),
      ),
    ).toBe(true);
  });

  it("considers existing versus new customer effects", () => {
    expect(
      pricingDomainIntelligence.customerImpactChecks.some((c) =>
        /existing/i.test(c),
      ),
    ).toBe(true);
    const patterns = pricingOptionPatterns({ fearChurn: true });
    expect(patterns).toEqual(
      expect.arrayContaining(["protect_current_base", "test", "staged_transition"]),
    );
  });

  it("offers at most three meaningfully different options including maintain and test", () => {
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
        ["protect_current_base", "maintain_current_direction", "delay"].includes(
          p,
        ),
      ),
    ).toBe(true);
  });

  it("includes customer trust and delivery capacity trade-off dimensions", () => {
    expect(pricingDomainIntelligence.tradeoffDimensions).toEqual(
      expect.arrayContaining(["customer trust", "delivery capacity"]),
    );
  });

  it("includes proportionate risks and reversibility guidance", () => {
    expect(pricingDomainIntelligence.riskPatterns.length).toBeGreaterThan(3);
    expect(
      pricingDomainIntelligence.reversibilityGuidance.some((r) =>
        /new customers|easily reversible/i.test(r),
      ),
    ).toBe(true);
    expect(
      pricingDomainIntelligence.reversibilityGuidance.some((r) =>
        /existing/i.test(r),
      ),
    ).toBe(true);
  });

  it("defines bounded experiments without creating a Project", () => {
    expect(pricingDomainIntelligence.experimentPatterns.length).toBeGreaterThan(
      3,
    );
    const experimentsSrc = readFileSync(
      resolve(
        process.cwd(),
        "lib/strategyChamber/intelligence/frameworks/experiments.ts",
      ),
      "utf8",
    );
    expect(experimentsSrc).toMatch(/Never auto-create a Project/);
  });

  it("recommendation is not a decision", () => {
    const ready = seedReadyForOptions(
      "Should I raise the price of my membership for new customers?",
    );
    const rec = recommendStrategicOption(ready);
    expect(rec).toBeTruthy();
    expect(rec!.isDecision).toBe(false);
    expect(rec!.memberCopy).toMatch(/recommendation/i);
    expect(getStrategyWorkItem(ready.id)!.chosenDirection).toBeFalsy();
    const turn = analyzeStrategyWorkItem(ready);
    expect(turn.recommendation?.isDecision).toBe(false);
  });

  it("documents routing boundaries for Finance, Marketing, Create, Projects, Board, Talk It Out, Calendar", () => {
    const destIds = PRICING_HANDOFF_BOUNDARIES.map((b) => b.destinationId);
    expect(destIds).toEqual(
      expect.arrayContaining([
        "business_estate",
        "create",
        "project",
        "calendar",
        "board",
        "talk_it_out",
      ]),
    );
    const boundaries =
      pricingDomainIntelligence.strategyTypeBridge.handoffBoundaries;
    expect(boundaries.length).toBeGreaterThan(0);
    expect(boundaries.some((b) => /Finance|Business Estate/i.test(b))).toBe(
      true,
    );
    expect(boundaries.some((b) => /Marketing/i.test(b))).toBe(true);
    expect(boundaries.some((b) => /Create/i.test(b))).toBe(true);
    expect(boundaries.some((b) => /Project/i.test(b))).toBe(true);
    expect(boundaries.some((b) => /Board/i.test(b))).toBe(true);
    expect(boundaries.some((b) => /Talk It Out/i.test(b))).toBe(true);
    expect(boundaries.some((b) => /Calendar/i.test(b))).toBe(true);
  });

  it("rejects guidance that assumes higher is always better or confirms the decision", () => {
    expect(
      pricingQualityRejectReasons("You must raise — higher is always better"),
    ).toContain("assumes_higher_always_better");
    expect(
      pricingQualityRejectReasons("This is your confirmed decision"),
    ).toContain("marks_recommendation_as_confirmed");
  });

  it("keeps canonical domainModel unions unchanged", () => {
    const src = readFileSync(
      resolve(process.cwd(), "lib/strategyChamber/domainModel.ts"),
      "utf8",
    );
    expect(src).toContain('clarify_question');
    expect(src).toContain("| \"assumption\"");
    expect(src).toContain("easily_reversible");
    expect(src).not.toContain("PricingJudgmentStage");
  });
});
