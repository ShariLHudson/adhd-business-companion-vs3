import type { StrategyTypeContract } from "../types";

export const growthStrategyType: StrategyTypeContract = {
  id: "growth",
  name: "Growth Strategy",
  family: "customer_and_market",
  plainLanguageDescription:
    "Decide how — or whether — to grow without assuming expansion is always right.",
  useWhen: [
    "Growth feels stalled or uneven",
    "The business wants more customers or revenue",
    "Capacity may not support more demand",
  ],
  doNotUseWhen: ["The real need is emotional recovery only"],
  entrySignals: [
    /\b(grow|growth|more customers|scale|expand|not growing)\b/i,
  ],
  clarifyingQuestions: [
    "When you say growth, what would actually feel like progress?",
    "Is the real decision about more customers, more revenue, or something else?",
  ],
  currentStateQuestions: [
    "What growth approaches have you already tried?",
    "Where does demand currently come from?",
  ],
  directionQuestions: [
    "What kind of growth would still feel sustainable?",
    "What should not be sacrificed for growth?",
  ],
  optionPatterns: [
    "expand",
    "narrow",
    "protect_base",
    "stabilize",
    "test",
    "delay",
  ],
  decisionCriteria: ["capacity", "retention", "unit economics", "focus"],
  commonTradeoffs: ["acquisition vs retention", "speed vs delivery quality"],
  commonRisks: ["overpromising delivery", "chasing vanity growth"],
  commonAssumptions: ["more customers fix everything", "awareness is the only gap"],
  evidencePrompts: ["What evidence shows acquisition is the bottleneck?"],
  capacityChecks: ["If growth worked, could you deliver well?"],
  experimentPatterns: ["Test one channel or segment before broad expansion"],
  successSignals: ["Sustainable new demand", "Delivery stays steady"],
  reviewTriggers: ["Delivery strain", "Cash pressure"],
  recommendedChamberMembers: ["strategy", "marketing"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["project", "create", "board", "business_estate"],
  adaptivePresentationNotes: "Do not default to expand; include stabilize/wait options.",
  qualityChecks: ["Capacity checked before expand"],
  version: 1,
};
