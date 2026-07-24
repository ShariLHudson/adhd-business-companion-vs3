import type { StrategyTypeContract } from "../types";

export const pricingStrategyType: StrategyTypeContract = {
  id: "pricing",
  name: "Pricing Strategy",
  family: "money_and_resources",
  plainLanguageDescription:
    "Decide whether and how to change price while protecting trust, value, and capacity — not only whether to raise it.",
  useWhen: [
    "Considering a price change",
    "Membership or offer feels underpriced or overpriced",
    "Costs rose but price stayed flat",
    "Choosing tiers, bundling, discounts, or annual vs monthly",
  ],
  doNotUseWhen: ["Need is only a finished sales page with no decision"],
  entrySignals: [
    /\b(price|pricing|raise (the )?price|lower (the )?price|fee|rate|membership (fee|price)|discount|premium pricing|tier|bundl|grandfather|annual|monthly)\b/i,
    /\b(underpriced|overpriced|charge more|charge less)\b/i,
  ],
  clarifyingQuestions: [
    "What feels most important to decide about pricing?",
    "Is this mainly about revenue, fairness, positioning, packaging, or protecting current customers?",
    "Are you deciding for new customers, existing customers, or both?",
  ],
  currentStateQuestions: [
    "What changed that made pricing feel important now?",
    "How do current customers respond to the current price?",
    "What do you know about costs, capacity, and willingness to pay?",
  ],
  directionQuestions: [
    "What result are you hoping a pricing change would create?",
    "What do you most want to protect for current members or customers?",
    "Would clarifying value first change the pricing decision?",
  ],
  optionPatterns: [
    "increase_price",
    "restructure_price",
    "add_value",
    "protect_current_base",
    "staged_transition",
    "test",
    "delay",
  ],
  decisionCriteria: [
    "value clarity",
    "trust",
    "revenue need",
    "existing vs new customers",
    "reversibility",
    "delivery capacity after the change",
  ],
  commonTradeoffs: [
    "revenue vs retention",
    "simplicity vs grandfathering",
    "premium positioning vs accessibility",
    "annual cash vs monthly flexibility",
    "discount volume vs brand strength",
  ],
  commonRisks: [
    "member churn after a poorly framed raise",
    "unclear value message making any price feel high",
    "discounting that trains customers to wait",
    "raising price without capacity to deliver better",
  ],
  commonAssumptions: [
    "everyone will leave if price rises",
    "a small raise fixes cash pressure",
    "lowering price is the only way to grow",
    "premium pricing alone creates perceived value",
    "existing customers must move to the new price immediately",
  ],
  evidencePrompts: [
    "What do you know for certain about costs and willingness to pay?",
    "What have customers already said about value vs price?",
    "What happens when you say no to discounts?",
  ],
  capacityChecks: [
    "Can you support the promise after a price change?",
    "Would a raise increase demand you cannot deliver?",
  ],
  experimentPatterns: [
    "Test new price with new members first",
    "Offer annual vs monthly to a small cohort and compare conversion and retention",
    "Pilot a premium tier before changing the base price",
    "Clarify value messaging for two weeks before changing numbers",
  ],
  successSignals: [
    "Healthy new enrollments at the new structure",
    "Stable retention among protected customers",
    "Clearer conversations about value",
  ],
  reviewTriggers: [
    "Sharp churn",
    "Cost changes again",
    "Discount requests spike",
    "Delivery strain after a raise",
  ],
  recommendedChamberMembers: ["strategy", "finance"],
  recommendedBoardRoles: ["strategy-director", "finance"],
  handoffDestinations: ["create", "project", "board", "business_estate"],
  adaptivePresentationNotes:
    "Prefer reversible tests before irreversible across-the-board raises. Distinguish existing vs new customers.",
  qualityChecks: [
    "Current vs new members distinguished when relevant",
    "Value-before-price considered",
    "Not only “increase price” as the option set",
  ],
  decisionHeuristics: [
    {
      id: "value_before_price",
      rule: "If value is unclear, clarify value before changing price.",
      when: "Prospects hesitate on worth, not affordability alone",
    },
    {
      id: "protect_existing",
      rule: "Protect or grandfather existing customers when trust is the asset.",
      when: "Loyal base funds the business and raise is mainly for new economics",
    },
    {
      id: "test_new_first",
      rule: "Test new pricing with new customers before changing everyone.",
      when: "Uncertainty about willingness to pay is high",
    },
    {
      id: "discount_warning",
      rule: "Treat recurring discounts as a positioning decision, not a sales tactic.",
      when: "Growth depends on promotions",
    },
  ],
  commonMistakes: [
    "Raising price without naming what improved",
    "Lowering price to fix an offer or positioning problem",
    "Copying a competitor’s price without knowing your costs or capacity",
    "Creating too many tiers that confuse the buyer",
    "Bundling everything so nothing feels valuable",
  ],
  warningSigns: [
    "Price conversations feel apologetic",
    "Discounts are the primary close",
    "Costs rose and price has not been reviewed in a long time",
    "Premium language without premium delivery",
  ],
  problemDistinctions: [
    {
      id: "raise_vs_restructure",
      label: "Raise vs restructure",
      description: "A flat raise may be wrong if packaging or tiers are the real issue.",
      whenToSuspect: ["tier", "package", "bundle", "annual", "monthly", "membership levels"],
      preferredPatterns: ["restructure_price", "test", "add_value"],
    },
    {
      id: "value_gap",
      label: "Value clarity before price",
      description: "People may resist price because outcomes are unclear.",
      whenToSuspect: ["worth it", "value", "why so much", "not sure what they get"],
      preferredPatterns: ["add_value", "delay", "test"],
    },
    {
      id: "existing_vs_new",
      label: "Existing vs new customers",
      description: "One price move may need different treatment for each group.",
      whenToSuspect: ["existing", "current members", "grandfather", "new customers only"],
      preferredPatterns: ["protect_current_base", "staged_transition", "test"],
    },
    {
      id: "discount_pressure",
      label: "Discount dependency",
      description: "Chronic discounting may need boundary or packaging change, not a permanent lower price.",
      whenToSuspect: ["discount", "coupon", "sale", "won’t buy full price"],
      preferredPatterns: ["restructure_price", "add_value", "protect_current_base"],
    },
  ],
  guidingPrinciples: [
    "Price is a strategy decision, not only a number change.",
    "Value before price when the promise is unclear.",
    "Do not default to “increase price” as the only serious option.",
  ],
  version: 2,
};
