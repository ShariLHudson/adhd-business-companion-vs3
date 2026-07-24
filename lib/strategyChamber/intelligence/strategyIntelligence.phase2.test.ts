import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  patchAdaptiveCompanionExplicitPrefs,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import {
  __resetStrategyChamberStoresForTests,
  applyGuidedJourneyAnswer,
  buildThinkingSummary,
  createStrategyWorkItem,
  getStrategyWorkItem,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";
import {
  analyzeStrategicStatement,
  analyzeStrategyWorkItem,
  assessDecisionReadiness,
  assessOptionReadiness,
  classifyStrategicInput,
  DECISION_READINESS_LABEL,
  EVIDENCE_STRENGTH_LABEL,
  REVERSIBILITY_LABEL,
  selectNextQuestion,
  selectNextThinkingMove,
  shouldOfferStrategicOptions,
  STRATEGIC_JUDGMENT_STAGE_ORDER,
} from "@/lib/strategyChamber/intelligence";
import type { StrategicInputClassification } from "@/lib/strategyChamber/domainModel";

describe("Strategy Intelligence Phase 2", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("preserves existing domain vocabulary", () => {
    expect(STRATEGIC_JUDGMENT_STAGE_ORDER[0]).toBe("clarify_question");
    const roles: StrategicInputClassification[] = [
      "question",
      "assumption",
      "fact",
      "evidence",
      "unknown",
    ];
    expect(roles).toContain("assumption");
    expect(EVIDENCE_STRENGTH_LABEL.assumed).toBeTruthy();
    expect(REVERSIBILITY_LABEL.easily_reversible).toBeTruthy();
    expect(DECISION_READINESS_LABEL.decision_complete).toBeTruthy();
  });

  it("keeps strategic role separate from statement nature", () => {
    const role = classifyStrategicInput(
      "I noticed customers are asking about price.",
    );
    const nature = analyzeStrategicStatement(
      "I noticed customers are asking about price.",
    );
    expect(role.classifications).toContain("evidence");
    expect(role.classifications).not.toContain("fact");
    expect(nature.nature).toBe("observation");
    expect(nature.safeToTreatAsFact).toBe(false);
  });

  it("does not present assumptions as facts", () => {
    const a = analyzeStrategicStatement(
      "I think everyone will leave if I raise the price.",
    );
    expect(a.nature).toBe("assumption");
    expect(a.safeToTreatAsFact).toBe(false);
    expect(a.safeToPresentAsEvidence).toBe(false);
  });

  it("does not treat feelings as evidence", () => {
    const a = analyzeStrategicStatement(
      "I feel overwhelmed and scared about this decision.",
    );
    expect(a.nature).toBe("feeling");
    expect(a.safeToPresentAsEvidence).toBe(false);
  });

  it("keeps interpretations tentative", () => {
    const a = analyzeStrategicStatement(
      "That means my offer is wrong for this market.",
    );
    expect(a.nature).toBe("interpretation");
    expect(a.needsClarification).toBe(true);
    expect(a.safeToTreatAsFact).toBe(false);
  });

  it("keeps unknowns visible in analysis", () => {
    const a = analyzeStrategicStatement("Something about this feels off.");
    expect(["unknown", "feeling"]).toContain(a.nature);
    expect(a.originalText).toBe("Something about this feels off.");
  });

  it("selects one primary next thinking move", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m considering raising the price of my membership.",
    });
    const move = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(move.move).toBeTruthy();
    expect(typeof move.move).toBe("string");
  });

  it("pricing: first move understands why now — not options", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(
        item,
        "I’m considering raising the price of my membership.",
      ),
    );
    const current = getStrategyWorkItem(item.id)!;
    const move = selectNextThinkingMove(current);
    expect(move.move).not.toBe("generate_options");
    expect(["identify_evidence", "clarify_question", "explore_concern"]).toContain(
      move.move,
    );
    expect(shouldOfferStrategicOptions(current)).toBe(false);
    const q = selectNextQuestion(current);
    expect(q.question.toLowerCase()).toMatch(/chang|signal|happen|now|decid/);
  });

  it("more customers: clarifies real issue — does not rush Marketing", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "I need more customers."),
    );
    const current = getStrategyWorkItem(item.id)!;
    const analysis = analyzeStrategyWorkItem(current);
    expect(analysis.strategicQuestion.needsClarification).toBe(true);
    expect(analysis.nextMove?.move).toBe("clarify_question");
    expect(analysis.showOptions).toBe(false);
    expect(analysis.handoff.recommendation?.destinationId).not.toBe("create");
  });

  it("too many ideas: clarifies goal and capacity", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(
        item,
        "I have too many ideas and don’t know what to work on.",
      ),
    );
    const current = getStrategyWorkItem(item.id)!;
    const move = selectNextThinkingMove(current);
    expect(move.move).toBe("clarify_question");
    const q = selectNextQuestion(current);
    expect(q.priority).toBe(1);
    expect(
      current.decisionStatement?.toLowerCase().includes("too many ideas"),
    ).toBe(true);
  });

  it("hiring: clarifies what needs relief before hiring options", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "Should I hire a virtual assistant?"),
    );
    const current = getStrategyWorkItem(item.id)!;
    const move = selectNextThinkingMove(current);
    expect(move.move).toBe("clarify_question");
    expect(shouldOfferStrategicOptions(current)).toBe(false);
    const q = selectNextQuestion(current);
    expect(q.question.toLowerCase()).toMatch(/real decision|relief|decid|part/);
  });

  it("pivot: clarifies what not working means and evidence", () => {
    const item = createStrategyWorkItem({
      entryReason: "rethink_current_direction",
    });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "What I’m doing isn’t working."),
    );
    const current = getStrategyWorkItem(item.id)!;
    expect(selectNextThinkingMove(current).move).toBe("clarify_question");
    const q = selectNextQuestion(current);
    expect(q.choices.some((c) => /not working|evidence|concrete/i.test(c.question))).toBe(
      true,
    );
  });

  it("easy experiment: weekly email can skip extended analysis", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m thinking about sending a weekly email.",
    });
    const move = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(move.move).toBe("design_experiment");
  });

  it("hard-to-reverse: closing business uses deeper care", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m thinking about closing my business.",
      currentReality: "Revenue has been flat and I feel exhausted.",
      memberStatements: ["Revenue has been flat and I feel exhausted."],
    });
    const move = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(["assess_reversibility", "explore_concern", "clarify_question"]).toContain(
      move.move,
    );
    expect(shouldOfferStrategicOptions(getStrategyWorkItem(item.id)!)).toBe(
      false,
    );
  });

  it("I don’t know produces a simpler path without repeating the same question", () => {
    const item = createStrategyWorkItem({ entryReason: "unsure" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "What should I focus on?",
      currentReality: "Everything feels scattered.",
      activeQuestion: "What changed that made this question important now?",
    });
    const prior = "What changed that made this question important now?";
    const plan = selectNextQuestion(getStrategyWorkItem(item.id)!, undefined, {
      lastAnswer: "I don’t know",
    });
    expect(plan.question).not.toBe(prior);
    expect(plan.reflectionInstead || plan.choices.length).toBeTruthy();
    expect(
      plan.choices.some((c) => /else|explain|skip/i.test(c.label)),
    ).toBe(true);
  });

  it("withholds options when premature and allows them when ready", () => {
    const early = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(early.id, {
      decisionStatement: "Should I raise prices?",
    });
    expect(assessOptionReadiness(getStrategyWorkItem(early.id)!).optionsReady).toBe(
      false,
    );
    expect(shouldOfferStrategicOptions(getStrategyWorkItem(early.id)!)).toBe(
      false,
    );

    const ready = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(ready.id, {
      decisionStatement: "Should I raise the price of my membership?",
      currentReality: "Costs rose and renewals are steady.",
      desiredDirection: "Protect trust while improving revenue.",
      memberStatements: [
        "Costs rose and renewals are steady.",
        "I worry about trust.",
      ],
      observations: ["Renewals are steady."],
      risks: ["Members may feel surprised."],
    });
    const gate = assessOptionReadiness(getStrategyWorkItem(ready.id)!);
    expect(gate.optionsReady).toBe(true);
    expect(shouldOfferStrategicOptions(getStrategyWorkItem(ready.id)!)).toBe(
      true,
    );
  });

  it("does not mark decision complete without member confirmation", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise prices?",
      currentReality: "Costs are up.",
      chosenDirection: "Grandfather current members.",
      optionsConsidered: [
        {
          id: "1",
          title: "Grandfather current members",
          tradeoffs: ["Slower revenue"],
        },
      ],
      risks: ["Two-tier pricing complexity"],
      tradeoffs: ["Slower revenue"],
      decisionRecordConfirmed: false,
    });
    const readiness = assessDecisionReadiness(getStrategyWorkItem(item.id)!);
    expect(readiness.readiness).not.toBe("decision_complete");
  });

  it("summary hides empty sections and avoids duplicating the opening line", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise prices?",
      currentReality: "Should I raise prices?",
      assumptions: ["Everyone will leave"],
    });
    const sections = buildThinkingSummary(getStrategyWorkItem(item.id)!);
    expect(sections.every((s) => {
      const body = Array.isArray(s.body) ? s.body.join(" ") : s.body;
      return body.trim().length > 0;
    })).toBe(true);
    const happening = sections.find((s) => s.id === "happening");
    expect(happening).toBeUndefined();
    expect(sections.find((s) => s.id === "assumptions")).toBeTruthy();
  });

  it("Adaptive preferences affect presentation count, not reasoning move", () => {
    patchAdaptiveCompanionExplicitPrefs({
      instructionPacing: "one_at_a_time",
      choiceLoad: "one",
    });
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "I need clearer direction for Q3."),
    );
    const current = getStrategyWorkItem(item.id)!;
    const moveA = selectNextThinkingMove(current);
    const moveB = selectNextThinkingMove(
      current,
      resolveAdaptivePresentation(),
    );
    expect(moveA.move).toBe(moveB.move);
    const plan = selectNextQuestion(current, resolveAdaptivePresentation());
    expect(plan.choices.length).toBeLessThanOrEqual(1);
  });

  it("asks one primary question and does not re-ask known information", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise the price of my membership?",
      currentReality: "Costs rose this year.",
      desiredDirection: "Keep trust while improving revenue.",
      memberStatements: ["Costs rose this year.", "I want to protect trust."],
    });
    const plan = selectNextQuestion(getStrategyWorkItem(item.id)!);
    expect(plan.question.includes("?")).toBe(true);
    expect(plan.question.toLowerCase()).not.toMatch(
      /what are you trying to decide/,
    );
  });
});
