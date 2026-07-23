import type { StrategyTypeContract } from "../types";

export const marketCustomerStrategyType: StrategyTypeContract = {
  id: "market_customer",
  name: "Market and Customer Strategy",
  family: "customer_and_market",
  plainLanguageDescription:
    "Decide who you serve, who you do not, and how clearly you show up for them.",
  useWhen: [
    "Unclear ideal customer",
    "Market feels too broad",
    "Positioning or awareness may be the real issue",
  ],
  doNotUseWhen: ["Need is finished marketing assets with strategy already chosen"],
  entrySignals: [
    /\b(market|audience|ideal client|customer|positioning|who (do|should) i (serve|help))\b/i,
  ],
  clarifyingQuestions: [
    "Is the real decision about who you serve, how you reach them, or what they need?",
  ],
  currentStateQuestions: [
    "Who already gets the most value from your work?",
    "Where does interest come from today?",
  ],
  directionQuestions: [
    "Which customer group deserves priority in this season?",
    "Who will you intentionally not prioritize right now?",
  ],
  optionPatterns: ["narrow", "different_market", "protect_base", "reposition", "test"],
  decisionCriteria: ["fit", "reachability", "value match", "capacity"],
  commonTradeoffs: ["niche clarity vs larger reach"],
  commonRisks: ["trying to speak to everyone", "abandoning a loyal base too soon"],
  commonAssumptions: ["more awareness alone fixes sales"],
  evidencePrompts: ["What evidence shows who already succeeds with you?"],
  capacityChecks: ["Can you serve this market well if interest rises?"],
  experimentPatterns: ["Speak to one segment for 30 days and compare response"],
  successSignals: ["Clearer conversations", "Better-fit inquiries"],
  reviewTriggers: ["Segment response collapses", "Capacity strain"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["create", "business_estate", "project", "board"],
  adaptivePresentationNotes: "Separate market choice from marketing execution.",
  qualityChecks: ["Not-serving named when narrowing"],
  version: 1,
};
