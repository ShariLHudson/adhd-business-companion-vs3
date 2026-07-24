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
  buildIntelligentDecisionRecord,
  generateFullStrategicOptions,
  recommendStrategicOption,
  selectStrategyDomains,
  suggestPricingSecondaryDomain,
  suggestSecondaryDomainForPrimary,
  synthesizeOptionPatternCandidates,
  synthesizeStrategicQuestion,
  synthesizeStrategyDomains,
  strategicOptionsAreDistinct,
  PRIMARY_CONTRIBUTION_BUDGET,
  SECONDARY_CONTRIBUTION_BUDGET,
  extractDomainContributions,
  getPairRule,
  isPairAllowed,
  mergeDomainContributions,
  detectSynthesisConflicts,
} from "@/lib/strategyChamber/intelligence";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function seed(
  statement: string,
  extras?: Partial<{
    currentReality: string;
    desiredDirection: string;
    constraints: string[];
    knownFacts: string[];
  }>,
) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement: statement,
    currentReality: extras?.currentReality ?? "The business feels stuck.",
    desiredDirection: extras?.desiredDirection ?? "A clear sustainable path.",
    constraints: extras?.constraints ?? ["Time is limited"],
    assumptions: ["I think I know what to do"],
    knownFacts: extras?.knownFacts ?? ["Delivery takes real time"],
    memberStatements: [statement, "I need clarity", "I am not sure yet"],
  });
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 5 — Cross-Domain Synthesis", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  describe("Domain selection", () => {
    it("loads at most one secondary domain by default", () => {
      const item = seed("I want to grow, but I am already overwhelmed.");
      const selection = selectStrategyDomains(item);
      expect(selection.primaryDomainId).toBeTruthy();
      if (selection.secondaryDomainId) {
        expect(selection.secondaryDomainId).not.toBe(selection.primaryDomainId);
      }
      expect(selection.alternativesConsidered?.length ?? 0).toBeLessThanOrEqual(4);
    });

    it("Scenario G — pure new-member price ask stays Pricing-only", () => {
      const item = seed("Should I raise the membership price for new members only?", {
        currentReality: "Current members are happy at the current price.",
        knownFacts: ["New members convert steadily"],
      });
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.selection.primaryDomainId).toBe("pricing");
      expect(synthesis.selection.secondaryDomainId).toBeUndefined();
    });

    it("Scenario H — low confidence does not load several domains", () => {
      const item = seed("Everything is wrong with my business.");
      const selection = selectStrategyDomains(item);
      expect(selection.needsClarification).toBe(true);
      expect(selection.confidence).toBe("low");
      expect(selection.secondaryDomainId).toBeUndefined();
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.contributions).toHaveLength(0);
      expect(synthesis.suggestedNextQuestion).toMatch(/important decision/i);
    });

    it("unavailable pairs do not invent secondary knowledge", () => {
      expect(isPairAllowed("pricing", "capacity_focus")).toBe(true);
      const offerMarket = getPairRule("offer", "market_customer");
      expect(offerMarket?.status).toBe("partial");
    });
  });

  describe("Contribution loading and budgets", () => {
    it("respects primary ≤5 and secondary ≤3 budgets", () => {
      const primary = extractDomainContributions(
        "pricing",
        "primary",
        "I am doing too much for what I charge.",
      );
      const secondary = extractDomainContributions(
        "capacity_focus",
        "secondary",
        "I am doing too much for what I charge.",
      );
      expect(primary.length).toBeLessThanOrEqual(PRIMARY_CONTRIBUTION_BUDGET);
      expect(secondary.length).toBeLessThanOrEqual(SECONDARY_CONTRIBUTION_BUDGET);
    });

    it("dedupes merged contributions", () => {
      const primary = extractDomainContributions(
        "growth",
        "primary",
        "I want to grow but I am overwhelmed.",
      );
      const secondary = extractDomainContributions(
        "capacity_focus",
        "secondary",
        "I want to grow but I am overwhelmed.",
      );
      const merged = mergeDomainContributions(primary, secondary);
      const ids = merged.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("Scenarios A–J", () => {
    it("Scenario A — Pricing + Capacity: too much for what I charge", () => {
      const text = "I am doing far too much work for what I charge.";
      expect(suggestPricingSecondaryDomain(text)).toBe("capacity_focus");
      const item = seed(text);
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.selection.primaryDomainId).toBe("pricing");
      expect(synthesis.selection.secondaryDomainId).toBe("capacity_focus");
      expect(synthesis.selection.secondaryThresholdReasons?.length).toBeGreaterThan(0);
      expect(synthesis.strategicQuestion).toMatch(
        /raise the price|reduce the scope|test a different structure/i,
      );
      expect(
        synthesis.conflictNotes?.some((c) => c.id === "pricing_capacity_burden"),
      ).toBe(true);
      const patterns = synthesizeOptionPatternCandidates({
        primaryId: "pricing",
        secondaryId: "capacity_focus",
        text,
        contributions: synthesis.contributions,
      });
      expect(patterns).toEqual(
        expect.arrayContaining(["increase_price", "reduce_scope", "test"]),
      );
      expect(synthesis.memberFacingRecommendation).toBeTruthy();
      expect(synthesis.memberFacingRecommendation).not.toMatch(
        /Pricing recommends|Capacity recommends/i,
      );
    });

    it("Scenario B — Growth + Pricing: plenty of customers, need revenue", () => {
      const text = "I have plenty of customers, but I still need more revenue.";
      const item = seed(text);
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.selection.primaryDomainId).toBe("growth");
      expect(synthesis.selection.secondaryDomainId).toBe("pricing");
      expect(synthesis.strategicQuestion).toMatch(
        /more customers|retention|value|pricing|volume/i,
      );
      const patterns = synthesis.optionPatternCandidates ?? [];
      expect(patterns[0]).not.toBe("expand");
      expect(patterns).toEqual(expect.arrayContaining(["add_value", "test"]));
    });

    it("Scenario C — Growth + Capacity: grow but overwhelmed", () => {
      const text = "I want to grow, but I already feel overwhelmed.";
      const item = seed(text);
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.selection.primaryDomainId).toBe("growth");
      expect(synthesis.selection.secondaryDomainId).toBe("capacity_focus");
      expect(synthesis.strategicQuestion).toMatch(/stabiliz|limited growth|healthy/i);
      const patterns = synthesis.optionPatternCandidates ?? [];
      expect(patterns).toEqual(
        expect.arrayContaining(["stabilize", "simplify", "test"]),
      );
      expect(patterns).not.toContain("expand");
      const turn = analyzeStrategyWorkItem(item);
      // Handoff stays recommend-only until the member confirms a direction
      expect(turn.workItemPatch.recommendedNextDestination).toBeUndefined();
      expect(turn.domainSynthesis?.selection.secondaryDomainId).toBe(
        "capacity_focus",
      );
    });

    it("Scenario D — Growth + Customer Market: posting, wrong customers", () => {
      const text =
        "I am posting regularly, but I am not attracting the right customers.";
      const item = seed(text);
      const synthesis = synthesizeStrategyDomains(item);
      expect(["growth", "market_customer"]).toContain(
        synthesis.selection.primaryDomainId,
      );
      expect(synthesis.selection.secondaryDomainId).toBeTruthy();
      expect(synthesis.suggestedNextQuestion || synthesis.strategicQuestion).toMatch(
        /reach|fit|audience|attracting|qualified/i,
      );
      expect(synthesis.strategicQuestion).not.toMatch(/post more/i);
    });

    it("Scenario E — Offer + Customer Market: program without audience", () => {
      const text =
        "I have an idea for a program, but I do not know who it is really for.";
      const hint = suggestSecondaryDomainForPrimary("offer", text);
      expect(hint?.secondaryId).toBe("market_customer");
      const item = seed(text);
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.selection.primaryDomainId).toBe("offer");
      expect(synthesis.selection.secondaryDomainId).toBe("market_customer");
      expect(synthesis.selection.secondaryStatus).toBe("partial");
      expect(synthesis.strategicQuestion).toMatch(/offer itself|who it is really for/i);
      expect(synthesis.experimentHint || synthesis.memberFacingRecommendation).toBeTruthy();
    });

    it("Scenario F — Hiring + Capacity: cannot keep up", () => {
      const text = "I need to hire someone because I cannot keep up.";
      const item = seed(text);
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.selection.primaryDomainId).toBe("hiring_delegation");
      expect(synthesis.selection.secondaryDomainId).toBe("capacity_focus");
      expect(synthesis.strategicQuestion).toMatch(
        /hiring|simplifying|automating|contractor/i,
      );
      expect(synthesis.memberFacingRecommendation).not.toMatch(
        /you must hire|hiring is required/i,
      );
    });

    it("Scenario I — Pricing vs Growth conflict uses experiment or evidence", () => {
      const text =
        "Should I raise my membership price? Nobody is buying and demand feels weak.";
      const item = seed(text, {
        currentReality: "Few new members are converting at the current price.",
        knownFacts: ["Conversion has been soft for two months"],
        constraints: ["I want to protect trust with current members"],
      });
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.selection.primaryDomainId).toBe("pricing");
      expect(synthesis.selection.secondaryDomainId).toBe("growth");
      const conflict = synthesis.conflictNotes?.find(
        (c) => c.id === "pricing_growth_demand",
      );
      expect(conflict).toBeTruthy();
      expect(conflict?.primaryPosition).toBeTruthy();
      expect(conflict?.secondaryPosition).toBeTruthy();
      expect(["experiment", "evidence_priority", "ask_user"]).toContain(
        conflict?.resolutionMethod,
      );
      expect(conflict?.preferClarify).toBe(true);
      expect(synthesis.confidence).not.toBe("high");
    });

    it("Scenario J — unified recommendation is not a decision", () => {
      const item = seed("I am doing too much for what I charge.", {
        currentReality: "Delivery load is high and the fee is unchanged.",
        desiredDirection: "Sustainable pricing and scope.",
      });
      const synthesis = synthesizeStrategyDomains(item);
      expect(synthesis.memberFacingRecommendation).toBeTruthy();
      expect(synthesis.memberFacingRecommendation).not.toMatch(
        /Pricing recommends|final decision|you have decided/i,
      );
      const rec = recommendStrategicOption(item);
      expect(rec?.isDecision).toBe(false);
      const record = buildIntelligentDecisionRecord(item);
      expect(record.companionRecommendation).toBeTruthy();
      expect(record.directionYouChose?.trim() || "").toBe("");
      expect(record.whatYouWereDeciding).not.toMatch(/pricing_id|domainId/i);
    });
  });

  describe("Conflict resolution helpers", () => {
    it("capacity can change a growth recommendation posture", () => {
      const conflicts = detectSynthesisConflicts(
        "growth",
        "capacity_focus",
        "I want to grow but I am overwhelmed",
      );
      expect(conflicts[0]?.resolutionMethod).toBe("capacity_priority");
      expect(conflicts[0]?.preferClarify).toBe(false);
    });

    it("synthesizeStrategicQuestion uses new conflict fields", () => {
      const q = synthesizeStrategicQuestion({
        primaryId: "offer",
        secondaryId: "market_customer",
        surfaceStatement:
          "I want to launch a new program, but I do not know who it is really for.",
        conflicts: [
          {
            id: "offer_market",
            primaryDomainId: "offer",
            secondaryDomainId: "market_customer",
            issue: "offer vs audience",
            primaryPosition: "Offer design",
            secondaryPosition: "Audience unclear",
            materiality: "high",
            resolutionMethod: "ask_user",
            resolution: "Identify offer vs audience",
            preferClarify: true,
          },
        ],
        underlyingHints: [],
      });
      expect(q).toMatch(/offer itself|who it is really for/i);
    });
  });

  describe("Shared engine authority", () => {
    it("caps options at 3 and keeps recommendation ≠ decision", () => {
      const item = seed("I am doing too much for what I charge.", {
        currentReality: "Delivery load is high and the fee is unchanged.",
        desiredDirection: "Sustainable pricing and scope.",
      });
      const options = generateFullStrategicOptions(item);
      expect(options.length).toBeLessThanOrEqual(3);
      expect(strategicOptionsAreDistinct(options)).toBe(true);
      const turn = analyzeStrategyWorkItem(item);
      expect(turn.domainSynthesis).toBeTruthy();
      expect(turn.activeDomain?.id).toBe("pricing");
      expect(turn.secondaryDomain?.id).toBe("capacity_focus");
    });

    it("does not expose multi-domain report language", () => {
      const item = seed("I want to grow, but I am already overwhelmed.");
      const synthesis = synthesizeStrategyDomains(item);
      const blob = [
        synthesis.strategicQuestion,
        synthesis.memberFacingRecommendation,
        ...(synthesis.assumptionsToSurface ?? []),
      ].join(" ");
      expect(blob).not.toMatch(
        /Pricing says|Growth says|Capacity says|cross-domain synthesis|secondary domain confidence/i,
      );
    });

    it("canonical domainModel unions remain unchanged", () => {
      const src = readFileSync(
        resolve(process.cwd(), "lib/strategyChamber/domainModel.ts"),
        "utf8",
      );
      expect(src).toContain("easily_reversible");
      expect(src).not.toContain("SynthesisJudgmentStage");
    });
  });
});
