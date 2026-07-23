import type { StrategyTypeContract } from "../types";

export const offerStrategyType: StrategyTypeContract = {
  id: "offer",
  name: "Offer Strategy",
  family: "offers_and_innovation",
  plainLanguageDescription:
    "Clarify what you offer, to whom, and what should stop or change.",
  useWhen: [
    "The offer feels unclear or overloaded",
    "Considering a new offer or membership",
    "Current offer is not converting",
  ],
  doNotUseWhen: ["Only need copy polish with no strategic change"],
  entrySignals: [
    /\b(offer|package|membership|program|product|launch an? )\b/i,
  ],
  clarifyingQuestions: [
    "What about the offer feels most important to decide?",
    "Are you deciding what to offer, who it is for, or how it is packaged?",
  ],
  currentStateQuestions: [
    "What is working in the current offer?",
    "Where do people hesitate?",
  ],
  directionQuestions: [
    "What should this offer make possible for the right person?",
    "What will you stop offering so this can be clear?",
  ],
  optionPatterns: ["simplify", "narrow", "reposition", "test", "stop", "continue"],
  decisionCriteria: ["clarity", "fit", "delivery capacity", "differentiation"],
  commonTradeoffs: ["breadth vs clarity", "premium vs accessible"],
  commonRisks: ["overbuilding before demand", "confusing the market"],
  commonAssumptions: ["more features always help", "everyone wants the same offer"],
  evidencePrompts: ["What have customers already said about the offer?"],
  capacityChecks: ["Can you deliver this offer well at the volume you hope for?"],
  experimentPatterns: ["Pilot one offer concept with a small audience"],
  successSignals: ["Clearer yes/no from prospects", "Easier delivery"],
  reviewTriggers: ["Conversion drops", "Delivery overload"],
  recommendedChamberMembers: ["strategy", "innovation"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["create", "project", "board"],
  adaptivePresentationNotes: "Keep options meaningfully different, not feature variants.",
  qualityChecks: ["What not offering is named"],
  version: 1,
};
