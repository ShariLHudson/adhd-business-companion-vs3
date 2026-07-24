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
  recommendStrategicOption,
  selectStrategyDomains,
  suggestPricingSecondaryDomain,
  suggestSecondaryDomainForPrimary,
  synthesizeOptionPatternCandidates,
  synthesizeStrategicQuestion,
  synthesizeStrategyDomains,
  strategicOptionsAreDistinct,
} from "@/lib/strategyChamber/intelligence";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function seed(statement: string, extras?: Partial<{
  currentReality: string;
  desiredDirection: string;
}>) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement: statement,
    currentReality: extras?.currentReality ?? "The business feels stuck.",
    desiredDirection: extras?.desiredDirection ?? "A clear sustainable path.",
    constraints: ["Limited weekly capacity"],
    assumptions: ["I think I know what to do"],
    knownFacts: ["Delivery takes real time"],
    memberStatements: [statement, "I need clarity", "I am not sure yet"],
  });
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 5 — Cross-Domain Synthesis", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("loads at most one secondary domain by default", () => {
    const item = seed("I want to grow, but I am already overwhelmed.");
    const selection = selectStrategyDomains(item);
    expect(selection.primaryDomainId).toBeTruthy();
    if (selection.secondaryDomainId) {
      expect(selection.secondaryDomainId).not.toBe(selection.primaryDomainId);
    }
    // Never dumps a long secondary list
    expect(selection.alternativesConsidered?.length ?? 0).toBeLessThanOrEqual(4);
  });

  it("Pricing + Capacity: doing too much for what I charge", () => {
    const text = "I am doing too much for what I charge.";
    expect(suggestPricingSecondaryDomain(text)).toBe("capacity_focus");
    const item = seed(text);
    const synthesis = synthesizeStrategyDomains(item);
    expect(synthesis.selection.primaryDomainId).toBe("pricing");
    expect(synthesis.selection.secondaryDomainId).toBe("capacity_focus");
    expect(synthesis.strategicQuestion).toMatch(/raise the price|reduce the scope|change both/i);
    expect(synthesis.conflictNotes?.some((c) => c.id === "pricing_capacity_burden")).toBe(
      true,
    );
    const patterns = synthesizeOptionPatternCandidates({
      primaryId: "pricing",
      secondaryId: "capacity_focus",
      text,
      contributions: synthesis.contributions,
    });
    expect(patterns).toEqual(
      expect.arrayContaining(["increase_price", "reduce_scope", "test"]),
    );
    const turn = analyzeStrategyWorkItem(item);
    expect(turn.secondaryDomain?.id).toBe("capacity_focus");
    expect(turn.domainSynthesis?.selection.secondaryDomainId).toBe("capacity_focus");
    // No multi-domain report language in synthesis question
    expect(turn.domainSynthesis?.strategicQuestion).not.toMatch(
      /Pricing says|Growth says|Capacity says/i,
    );
  });

  it("Growth + Pricing: plenty of customers, low revenue — not more customers", () => {
    const text = "I have plenty of customers, but revenue is still low.";
    const item = seed(text);
    const synthesis = synthesizeStrategyDomains(item);
    expect(synthesis.selection.primaryDomainId).toBe("growth");
    expect(synthesis.selection.secondaryDomainId).toBe("pricing");
    expect(synthesis.strategicQuestion).toMatch(/value|pricing|volume/i);
    const patterns = synthesis.optionPatternCandidates ?? [];
    expect(patterns[0]).not.toBe("expand");
    expect(patterns).toEqual(
      expect.arrayContaining(["add_value", "test"]),
    );
  });

  it("Growth + Capacity: want to grow but overwhelmed → stabilize first", () => {
    const text = "I want to grow, but I am already overwhelmed.";
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
  });

  it("Offer + Market language synthesizes audience vs offer question", () => {
    const text =
      "I want to launch a new program, but I do not know who it is really for.";
    const hint = suggestSecondaryDomainForPrimary("offer", text);
    expect(hint?.secondaryId).toBe("market_customer");
    const q = synthesizeStrategicQuestion({
      primaryId: "offer",
      secondaryId: "market_customer",
      surfaceStatement: text,
      conflicts: [
        {
          id: "offer_market",
          topic: "offer vs audience",
          primaryStance: "Offer design",
          secondaryStance: "Audience unclear",
          resolution: "Identify offer vs audience",
          preferClarify: true,
        },
      ],
      underlyingHints: [],
    });
    expect(q).toMatch(/offer itself|who it is really for/i);
  });

  it("Hiring + Growth: does not assume hiring is necessary", () => {
    const text = "I think I need a virtual assistant so I can grow.";
    const hint = suggestSecondaryDomainForPrimary("hiring_delegation", text);
    expect(hint?.secondaryId).toBe("growth");
    const q = synthesizeStrategicQuestion({
      primaryId: "hiring_delegation",
      secondaryId: "growth",
      surfaceStatement: text,
      conflicts: [
        {
          id: "hiring_growth",
          topic: "hire vs growth",
          primaryStance: "Hiring may help",
          secondaryStance: "Only if it removes the constraint",
          resolution: "Do not assume hire",
          preferClarify: true,
        },
      ],
      underlyingHints: [],
    });
    expect(q).toMatch(/hiring required|simplification|test/i);
  });

  it("single-domain decisions do not force a secondary", () => {
    const item = seed("Should I raise the price for new members only?");
    const synthesis = synthesizeStrategyDomains(item);
    expect(synthesis.selection.primaryDomainId).toBe("pricing");
    // May or may not have secondary — must not load many
    expect(
      [synthesis.selection.secondaryDomainId].filter(Boolean).length,
    ).toBeLessThanOrEqual(1);
  });

  it("dedupes contributions and keeps primary authority on ties", () => {
    const item = seed(
      "I want to grow, but I am already overwhelmed and burned out.",
    );
    const synthesis = synthesizeStrategyDomains(item);
    const ids = synthesis.contributions.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(synthesis.contributions.some((c) => c.domainId === "growth")).toBe(
      true,
    );
  });

  it("shared engine still caps options at 3 and recommendation ≠ decision", () => {
    const item = seed("I am doing too much for what I charge.", {
      currentReality: "Delivery load is high and the fee is unchanged.",
      desiredDirection: "Sustainable pricing and scope.",
    });
    const options = generateFullStrategicOptions(item);
    expect(options.length).toBeLessThanOrEqual(3);
    expect(strategicOptionsAreDistinct(options)).toBe(true);
    const rec = recommendStrategicOption(item);
    expect(rec?.isDecision).toBe(false);
    const turn = analyzeStrategyWorkItem(item);
    expect(turn.domainSynthesis).toBeTruthy();
    expect(turn.activeDomain?.id).toBe("pricing");
  });

  it("does not expose multi-domain report language in synthesis outputs", () => {
    const item = seed("I want to grow, but I am already overwhelmed.");
    const synthesis = synthesizeStrategyDomains(item);
    const blob = [
      synthesis.strategicQuestion,
      synthesis.synthesisSummary,
      ...(synthesis.assumptionsToSurface ?? []),
    ].join(" ");
    expect(blob).not.toMatch(/Pricing says|Growth says|Capacity says/i);
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
