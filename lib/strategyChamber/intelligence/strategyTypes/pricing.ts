import type { StrategyTypeContract } from "../types";

export const pricingStrategyType: StrategyTypeContract = {
  id: "pricing",
  name: "Pricing Strategy",
  family: "money_and_resources",
  plainLanguageDescription:
    "Decide whether and how to change price while protecting trust and value.",
  useWhen: [
    "Considering a price change",
    "Membership or offer feels underpriced",
    "Costs rose but price stayed flat",
  ],
  doNotUseWhen: ["Need is only a finished sales page with no decision"],
  entrySignals: [
    /\b(price|pricing|raise (the )?price|fee|rate|membership (fee|price)|discount)\b/i,
  ],
  clarifyingQuestions: [
    "What feels most important to decide about pricing?",
    "Is this mainly about revenue, fairness, positioning, or something else?",
  ],
  currentStateQuestions: [
    "What changed that made pricing feel important now?",
    "How do current customers respond to the current price?",
  ],
  directionQuestions: [
    "What result are you hoping a pricing change would create?",
    "What do you most want to protect for current members or customers?",
  ],
  optionPatterns: [
    "raise_price",
    "protect_base",
    "raise_value",
    "staged_transition",
    "test",
    "delay",
  ],
  decisionCriteria: ["value clarity", "trust", "revenue need", "reversibility"],
  commonTradeoffs: ["revenue vs retention", "simplicity vs grandfathering"],
  commonRisks: ["member churn", "unclear value message"],
  commonAssumptions: ["everyone will leave", "a small raise fixes cash"],
  evidencePrompts: ["What do you know for certain about costs and willingness to pay?"],
  capacityChecks: ["Can you support the promise after a price change?"],
  experimentPatterns: ["Test new price with new members first"],
  successSignals: ["Healthy new enrollments", "Stable retention"],
  reviewTriggers: ["Sharp churn", "Cost changes again"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["create", "project", "board", "business_estate"],
  adaptivePresentationNotes: "Prefer reversible tests before irreversible across-the-board raises.",
  qualityChecks: ["Current vs new members distinguished when relevant"],
  version: 1,
};
