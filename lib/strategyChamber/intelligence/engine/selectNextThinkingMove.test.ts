import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  patchAdaptiveCompanionExplicitPrefs,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import {
  __resetStrategyChamberStoresForTests,
  createStrategyWorkItem,
  getStrategyWorkItem,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";
import {
  DECISION_READINESS_LABEL,
  EVIDENCE_STRENGTH_LABEL,
  REVERSIBILITY_LABEL,
  STRATEGIC_JUDGMENT_STAGE_ORDER,
} from "@/lib/strategyChamber/domainModel";
import {
  assessOptionReadiness,
  selectNextThinkingMove,
} from "@/lib/strategyChamber/intelligence";

describe("Strategy next thinking move selector", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("preserves existing domain model values", () => {
    expect(STRATEGIC_JUDGMENT_STAGE_ORDER[0]).toBe("clarify_question");
    expect(EVIDENCE_STRENGTH_LABEL.assumed).toBeTruthy();
    expect(REVERSIBILITY_LABEL.easily_reversible).toBeTruthy();
    expect(DECISION_READINESS_LABEL.decision_complete).toBeTruthy();
  });

  it("returns one primary move with selector contract fields", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m thinking about raising my membership price.",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(plan.move).toBeTruthy();
    expect(typeof plan.reason).toBe("string");
    expect(typeof plan.shouldAskQuestion).toBe("boolean");
    expect(["low", "moderate", "high"]).toContain(plan.confidence);
    expect(plan.optionReadiness).toBeTruthy();
  });

  it("pricing: identify_change or clarify_question before options", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m thinking about raising my membership price.",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(["identify_change", "clarify_question"]).toContain(plan.move);
    expect(plan.move).not.toBe("generate_options");
    expect(assessOptionReadiness(getStrategyWorkItem(item.id)!).optionsReady).toBe(
      false,
    );
  });

  it("assumption stance surfaces assumption or evidence discipline", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise prices?",
      currentReality: "Renewals have been steady.",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!, undefined, {
      lastAnswer: "My members will leave if I charge more.",
    });
    expect(["surface_assumption", "identify_evidence"]).toContain(plan.move);
    expect(plan.lastClassified?.stance).toBe("assumption");
    expect(plan.lastClassified?.safeToTreatAsFact).toBe(false);
  });

  it("feeling stance reflects and does not treat feeling as evidence", () => {
    const item = createStrategyWorkItem({ entryReason: "unsure" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "What should I do with the business?",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!, undefined, {
      lastAnswer: "I feel like the business is failing.",
    });
    expect(plan.move).toBe("reflect_understanding");
    expect(plan.shouldReflectFirst).toBe(true);
    expect(plan.lastClassified?.stance).toBe("feeling");
    expect(plan.lastClassified?.safeToTreatAsFact).toBe(false);
  });

  it("observation does not conclude cause", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "How should I grow this quarter?",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!, undefined, {
      lastAnswer: "I had fewer inquiries this month.",
    });
    expect(["identify_change", "identify_unknown"]).toContain(plan.move);
    expect(plan.reason.toLowerCase()).not.toMatch(/because|caused by|proves/);
    expect(plan.lastClassified?.stance).toBe("observation");
  });

  it("too many ideas: goal or capacity, not ranking all ten", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I have ten things I want to build.",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(["identify_goal", "check_capacity"]).toContain(plan.move);
    expect(plan.move).not.toBe("generate_options");
  });

  it("easy reversible experiment moves toward design_experiment", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m thinking about trying a weekly email.",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(plan.move).toBe("design_experiment");
  });

  it("difficult closing decision deepens without rushing action", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I may close the business.",
      currentReality: "Revenue has been flat.",
      memberStatements: ["Revenue has been flat."],
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect([
      "clarify_question",
      "assess_reversibility",
      "identify_change",
      "explore_concern",
    ]).toContain(plan.move);
    expect(plan.move).not.toBe("recommend_handoff");
    expect(plan.move).not.toBe("design_experiment");
  });

  it("does not ask for a goal already known", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise membership prices?",
      currentReality: "Costs rose this year.",
      desiredDirection: "Protect trust while improving revenue.",
      memberStatements: ["Costs rose this year."],
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(plan.move).not.toBe("identify_goal");
  });

  it("I don’t know returns a fallback support path", () => {
    const item = createStrategyWorkItem({ entryReason: "unsure" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "What should I focus on?",
      currentReality: "Everything feels scattered.",
      activeQuestion: "What changed that made this question important now?",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!, undefined, {
      lastAnswer: "I don’t know",
      previousMove: "identify_change",
    });
    expect(plan.idontKnowSupport).toBeTruthy();
    expect(plan.shouldAskQuestion).toBe(true);
    expect(plan.reason.toLowerCase()).toMatch(/simplif|choices|skip|repeat/);
  });

  it("withholds options when premature", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m thinking about raising my membership price.",
    });
    const gate = assessOptionReadiness(getStrategyWorkItem(item.id)!);
    expect(gate.optionsReady).toBe(false);
    expect(gate.readiness).not.toBe("ready_for_initial_options");
  });

  it("confirmed decision leads toward handoff", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise prices?",
      currentReality: "Costs are up.",
      chosenDirection: "Grandfather current members.",
      decisionRecordConfirmed: true,
      optionsConsidered: [{ id: "1", title: "Grandfather current members" }],
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!);
    expect(plan.move).toBe("recommend_handoff");
    expect(plan.recommendedDestination).toBeTruthy();
  });

  it("Adaptive Companion changes presentation, not move quality", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "I’m thinking about raising my membership price.",
    });
    const current = getStrategyWorkItem(item.id)!;
    const a = selectNextThinkingMove(current);
    patchAdaptiveCompanionExplicitPrefs({
      instructionPacing: "one_at_a_time",
      choiceLoad: "one",
    });
    const b = selectNextThinkingMove(current, resolveAdaptivePresentation());
    expect(a.move).toBe(b.move);
  });

  it("material unknown is pursued; casual gaps are not forced into options", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should we change the offer?",
      currentReality: "Sales dropped last month.",
    });
    const plan = selectNextThinkingMove(getStrategyWorkItem(item.id)!, undefined, {
      lastAnswer: "I don’t know why sales dropped.",
    });
    // I don’t know path takes precedence when phrase matches
    expect(plan.idontKnowSupport || plan.move === "identify_unknown").toBeTruthy();
  });
});
