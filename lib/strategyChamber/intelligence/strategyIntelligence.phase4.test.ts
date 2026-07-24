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
  DOMAIN_INTELLIGENCE_BUILD_ORDER,
  DOMAIN_INTELLIGENCE_IDS,
  familyForStrategyTypeId,
  generateFullStrategicOptions,
  getDomainIntelligence,
  identifyStrategicQuestion,
  isDomainIntelligenceId,
  listDomainIntelligenceModules,
  listStrategyTypes,
  matchProblemDistinction,
  resolveDomainForDecision,
  shouldOfferStrategicOptions,
  summarizeDomainContributions,
} from "@/lib/strategyChamber/intelligence";

function seedReadyForOptions(decisionStatement: string) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement,
    currentReality: "Current delivery is holding, but the decision feels timely.",
    desiredDirection: "A clearer next season without burning out.",
    constraints: ["Limited weekly capacity", "Need to protect current clients"],
    assumptions: ["A small test can teach more than a full commit"],
    knownFacts: ["Costs and workload have both risen"],
    memberStatements: [
      decisionStatement,
      "I need to protect capacity",
      "I am not sure which path is right",
    ],
  });
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 4 — Domain Intelligence", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("registers eleven strategy types in Phase 4 build order", () => {
    expect(listStrategyTypes()).toHaveLength(11);
    expect(listStrategyTypes().some((t) => t.id === "partnership")).toBe(true);
    expect(DOMAIN_INTELLIGENCE_BUILD_ORDER).toEqual([
      "pricing",
      "growth",
      "offer",
      "market_customer",
      "capacity_focus",
      "hiring_delegation",
      "partnership",
      "pivot_rethink",
      "personal_direction",
      "business_direction",
      "ninety_day",
    ]);
    expect(listDomainIntelligenceModules()).toHaveLength(
      DOMAIN_INTELLIGENCE_IDS.length,
    );
    expect(DOMAIN_INTELLIGENCE_BUILD_ORDER).toHaveLength(11);
  });

  it("every domain pack contributes the full Phase 4 checklist", () => {
    for (const domain of listDomainIntelligenceModules()) {
      expect(domain.version).toBe(2);
      expect(domain.entrySignals.length).toBeGreaterThan(0);
      expect(domain.hiddenUnderlyingQuestions.length).toBeGreaterThan(0);
      expect(domain.evidencePrompts.length).toBeGreaterThan(0);
      expect(domain.commonAssumptions.length).toBeGreaterThan(0);
      expect(domain.optionPatterns.length).toBeGreaterThan(0);
      expect(domain.commonTradeoffs.length).toBeGreaterThan(0);
      expect(domain.commonRisks.length).toBeGreaterThan(0);
      expect(domain.capacityChecks.length).toBeGreaterThan(0);
      expect(domain.experimentPatterns.length).toBeGreaterThan(0);
      expect(domain.recommendationRules.length).toBeGreaterThan(0);
      expect(domain.handoffBoundaries.length).toBeGreaterThan(0);
      expect(domain.handoffDestinations.length).toBeGreaterThan(0);
      expect(domain.decisionHeuristics.length).toBeGreaterThan(0);
      expect(domain.commonMistakes.length).toBeGreaterThan(0);
      expect(domain.warningSigns.length).toBeGreaterThan(0);
      expect(domain.problemDistinctions.length).toBeGreaterThan(0);
      expect(domain.guidingPrinciples.length).toBeGreaterThan(0);
      expect(isDomainIntelligenceId(domain.id)).toBe(true);
      const summary = summarizeDomainContributions(domain);
      expect(summary.hiddenUnderlyingQuestions.length).toBeGreaterThan(0);
      expect(summary.recommendationRules.length).toBeGreaterThan(0);
      expect(summary.handoffBoundaries.length).toBeGreaterThan(0);
    }
  });

  it("auto-loads pricing domain from pricing language", () => {
    const domain = resolveDomainForDecision(
      "Should I raise my membership price or add a premium tier?",
    );
    expect(domain?.id).toBe("pricing");
    expect(domain?.guidingPrinciples.some((p) => /value before price/i.test(p))).toBe(
      true,
    );
  });

  it("growth distinguishes capacity / don’t grow yet", () => {
    const growth = getDomainIntelligence("growth")!;
    const dist = matchProblemDistinction(
      growth,
      "I want more customers but I can’t keep up with delivery and feel burned out",
    );
    expect(dist?.id).toBe("capacity");
    expect(
      growth.guidingPrinciples.some((p) => /do not grow yet|don't grow yet/i.test(p)),
    ).toBe(true);
  });

  it("pivot treats full pivot as last resort", () => {
    const pivot = getDomainIntelligence("pivot_rethink")!;
    expect(
      pivot.decisionHeuristics.some((h) => h.id === "pivot_last_resort"),
    ).toBe(true);
    expect(
      pivot.guidingPrinciples.some((p) => /last resort/i.test(p)),
    ).toBe(true);
  });

  it("hiring considers automate / simplify before hire-only thinking", () => {
    const hiring = getDomainIntelligence("hiring_delegation")!;
    expect(hiring.optionPatterns).toEqual(
      expect.arrayContaining(["automate", "simplify", "delegate", "delay"]),
    );
    expect(
      hiring.decisionHeuristics.some((h) => h.id === "automate_or_simplify"),
    ).toBe(true);
  });

  it("partnership loads from collaboration language and prefers pilot paths", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement:
        "A peer wants to form a strategic partnership and collaborate as a joint venture.",
    });
    const current = getStrategyWorkItem(item.id)!;
    const analysis = identifyStrategicQuestion(current);
    expect(analysis.strategyTypeId).toBe("partnership");
    expect(analysis.questionType).toBe("partnership_decision");
    expect(familyForStrategyTypeId("partnership")).toBe("people_and_leadership");

    const ready = seedReadyForOptions(
      "Should I partner with this collaborator or run a small pilot first?",
    );
    expect(shouldOfferStrategicOptions(ready)).toBe(true);
    const options = generateFullStrategicOptions(ready);
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(3);
  });

  it("capacity focus recognizes stop-three style strategy", () => {
    const capacity = getDomainIntelligence("capacity_focus")!;
    expect(
      capacity.decisionHeuristics.some((h) => h.id === "stop_three"),
    ).toBe(true);
    const dist = matchProblemDistinction(
      capacity,
      "I have too many priorities and too many offers open",
    );
    expect(dist?.id).toMatch(/too_many/);
  });

  it("analyzeStrategyWorkItem attaches activeDomain and distinction", () => {
    const item = seedReadyForOptions(
      "I need more customers but retention is weak and people cancel quickly.",
    );
    const turn = analyzeStrategyWorkItem(item);
    expect(turn.activeDomain?.id).toBe("growth");
    expect(turn.matchedProblemDistinction?.id).toBe("retention");
    expect(turn.strategicQuestion.strategyTypeId).toBe("growth");
  });

  it("personal direction and offer domains remain distinct", () => {
    expect(
      resolveDomainForDecision(
        "I am burned out and wondering if I should keep doing this career path.",
      )?.id,
    ).toBe("personal_direction");
    expect(
      resolveDomainForDecision(
        "Should I retire this offer and simplify my packages?",
      )?.id,
    ).toBe("offer");
  });
});
