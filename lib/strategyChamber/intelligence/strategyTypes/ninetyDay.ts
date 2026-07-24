import type { StrategyTypeContract } from "../types";

export const ninetyDayStrategyType: StrategyTypeContract = {
  id: "ninety_day",
  name: "90-Day Strategy",
  family: "business_direction",
  plainLanguageDescription:
    "Choose a focused direction for the next 90 days without pretending it is forever.",
  useWhen: [
    "Need a season-sized focus",
    "Long-term vision exists but near-term path is unclear",
    "Want a reviewable horizon",
  ],
  doNotUseWhen: ["Need is only today's task list"],
  entrySignals: [
    /\b(90.?day|ninety.?day|this quarter|next (three|3) months|season)\b/i,
  ],
  clarifyingQuestions: [
    "What deserves to be the main focus for the next 90 days?",
  ],
  currentStateQuestions: [
    "What is already in motion that must be honored this quarter?",
    "What would make the next 90 days feel successful?",
  ],
  directionQuestions: [
    "What one outcome deserves priority this season?",
    "What will you intentionally not pursue for 90 days?",
  ],
  optionPatterns: ["narrow", "continue", "test", "stabilize", "delay"],
  decisionCriteria: ["focus", "capacity", "measurable progress", "reviewability"],
  commonTradeoffs: ["depth this quarter vs keeping many plates spinning"],
  commonRisks: ["90-day plan becomes an unfinishable wishlist"],
  commonAssumptions: ["everything important must happen this quarter"],
  evidencePrompts: ["What unfinished work already claims this quarter?"],
  capacityChecks: [
    "What can realistically finish in 90 days with your current capacity?",
  ],
  experimentPatterns: ["Pick one focus metric and review at day 30 and day 60"],
  successSignals: ["Visible progress on the chosen outcome", "Clearer no's"],
  reviewTriggers: ["Day 30 / 60 / 90", "Major interruption"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["project", "calendar", "plan_my_day", "create"],
  adaptivePresentationNotes: "Time-box keeps ambition from becoming forever pressure.",
  qualityChecks: ["Not-pursuing this quarter named"],
  decisionHeuristics: [
    {
      id: "one_outcome",
      rule: "Prefer one primary 90-day outcome over a wishlist.",
      when: "Quarter plan has many “priorities”",
    },
  ],
  commonMistakes: ["Turning 90 days into a compressed annual plan"],
  warningSigns: ["No mid-point review planned", "No explicit not-pursuing list"],
  problemDistinctions: [
    {
      id: "wishlist",
      label: "Wishlist vs focus",
      description: "A season plan fails when it tries to finish everything.",
      whenToSuspect: ["everything", "all of it", "also need to"],
      preferredPatterns: ["narrow", "delay", "stabilize"],
    },
  ],
  hiddenUnderlyingQuestions: [
    "What one outcome deserves priority this quarter?",
    "What unfinished work already claims these 90 days?",
    "What will we intentionally not pursue until review?",
    "What mid-point signals will tell us to continue, adjust, or stop?",
  ],
  recommendationRules: [
    "Prefer one primary 90-day outcome over a wishlist.",
    "Prefer explicit not-pursuing lists in every recommendation.",
    "Prefer review gates at day 30/60 before expanding scope.",
    "Do not recommend compressing an annual plan into 90 days.",
  ],
  handoffBoundaries: [
    "Stay in Strategy until the quarter focus and not-pursuing list exist.",
    "Calendar/Plan My Day hold the season schedule after the focus decision.",
    "Project handoff only for the chosen outcome — not for every idea on the wishlist.",
  ],
  guidingPrinciples: [
    "90 days is a reviewable season, not forever.",
    "What you will not pursue this quarter is part of the strategy.",
  ],
  version: 2,
};
