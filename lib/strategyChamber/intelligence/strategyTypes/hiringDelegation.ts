import type { StrategyTypeContract } from "../types";

export const hiringDelegationStrategyType: StrategyTypeContract = {
  id: "hiring_delegation",
  name: "Hiring or Delegation Strategy",
  family: "people_and_leadership",
  plainLanguageDescription:
    "Decide whether to hire, delegate, delay, or redesign the work first.",
  useWhen: [
    "Considering hiring help",
    "Overloaded by work others could own",
    "Unsure if people or process is the issue",
  ],
  doNotUseWhen: ["Need is only writing a job post with decision already made"],
  entrySignals: [
    /\b(hire|hiring|delegate|va|assistant|team|employee|contractor)\b/i,
  ],
  clarifyingQuestions: [
    "Is the real decision whether to hire, what to hand off, or how to redesign the work?",
  ],
  currentStateQuestions: [
    "Which work is draining capacity the most?",
    "What has already been tried with help or systems?",
  ],
  directionQuestions: [
    "What outcome would good help create?",
    "What must stay in your hands for now?",
  ],
  optionPatterns: ["test", "delay", "simplify", "partner", "expand", "stabilize"],
  decisionCriteria: ["cost", "management load", "quality risk", "reversibility"],
  commonTradeoffs: ["relief vs management cost", "speed vs training time"],
  commonRisks: ["hiring before role clarity", "new management burden"],
  commonAssumptions: ["hiring is the only relief path"],
  evidencePrompts: ["Which tasks are clear enough that someone else could own them?"],
  capacityChecks: ["Do you have room to train and manage help?"],
  experimentPatterns: ["Delegate one clear task for two weeks before a larger hire"],
  successSignals: ["Protected founder focus", "Reliable handoff of defined work"],
  reviewTriggers: ["Quality slip", "Cash pressure"],
  recommendedChamberMembers: ["strategy", "leadership"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["project", "board", "create", "plan_my_day"],
  adaptivePresentationNotes: "Delay and redesign are valid options beside hire.",
  qualityChecks: ["Role clarity before hire recommendation"],
  version: 1,
};
