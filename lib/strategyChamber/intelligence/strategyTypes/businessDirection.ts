import type { StrategyTypeContract } from "../types";

export const businessDirectionStrategyType: StrategyTypeContract = {
  id: "business_direction",
  name: "Business Direction Strategy",
  family: "business_direction",
  plainLanguageDescription:
    "Clarify where the business is headed and what it will and will not pursue.",
  useWhen: [
    "The overall direction feels unclear",
    "Too many paths compete for attention",
    "A major commitment needs a north star",
  ],
  doNotUseWhen: [
    "The need is only a single task or calendar item",
    "Emotional processing is the primary need",
  ],
  entrySignals: [
    /\b(direction|where (am i|we)|what (should|do) i (focus|pursue)|scattered|north star)\b/i,
    /\b(don'?t know what to do|too many ideas)\b/i,
  ],
  clarifyingQuestions: [
    "What feels most important to decide about the direction of the business?",
    "Which part of this feels like the real decision?",
  ],
  currentStateQuestions: [
    "What is working in the current direction?",
    "What has changed that makes direction feel unclear now?",
  ],
  directionQuestions: [
    "What would a good direction make possible in the next season?",
    "What do you most want to protect while you choose?",
  ],
  optionPatterns: ["continue", "narrow", "simplify", "staged_transition", "test"],
  decisionCriteria: ["fit", "capacity", "values", "sustainability"],
  commonTradeoffs: ["focus vs opportunity", "speed vs depth"],
  commonRisks: ["spreading too thin", "locking into the wrong season"],
  commonAssumptions: ["growth must be the answer", "every idea needs equal time"],
  evidencePrompts: ["What do you know for certain about what is working?"],
  capacityChecks: ["How much focus can this direction realistically receive?"],
  experimentPatterns: ["Try one focus area for 30–90 days and review"],
  successSignals: ["Clearer weekly choices", "Less competing priority noise"],
  reviewTriggers: ["A major new opportunity appears", "Capacity drops sharply"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["project", "board", "create", "plan_my_day"],
  adaptivePresentationNotes: "Keep one question; offer a brief journey map only if asked.",
  qualityChecks: ["Direction named", "What not pursuing named"],
  decisionHeuristics: [
    {
      id: "name_not_pursuing",
      rule: "A direction is clearer when what you will not pursue is named.",
      when: "Too many ideas compete",
    },
    {
      id: "season_sized",
      rule: "Prefer a season-sized direction over a forever identity lock.",
      when: "Uncertainty is high",
    },
  ],
  commonMistakes: [
    "Treating every idea as equal priority",
    "Choosing growth language when focus is the need",
  ],
  warningSigns: [
    "No clear “not now” list",
    "Direction changes weekly without evidence",
  ],
  problemDistinctions: [
    {
      id: "too_many_paths",
      label: "Too many paths",
      description: "The issue may be selection, not inspiration.",
      whenToSuspect: ["too many ideas", "scattered", "don’t know what to focus"],
      preferredPatterns: ["narrow", "simplify", "test"],
    },
  ],
  hiddenUnderlyingQuestions: [
    "What is the real direction decision — focus, north star, or what to stop pursuing?",
    "What is working in the current direction that should be protected?",
    "What would a good season make possible without locking forever?",
    "Which competing paths can wait without being lost?",
  ],
  recommendationRules: [
    "Prefer naming what will not be pursued alongside the chosen direction.",
    "Prefer a season-sized direction when uncertainty is high.",
    "Do not recommend growth language when the need is focus.",
    "Prefer narrow or test when too many paths compete.",
  ],
  handoffBoundaries: [
    "Stay in Strategy until direction and not-pursuing are both named.",
    "Board is for high-stakes direction challenges; Plan My Day is for living the choice.",
    "Do not hand to Project until the primary direction is chosen.",
  ],
  guidingPrinciples: [
    "Direction includes what you will not pursue.",
    "Growth is not the default conclusion.",
  ],
  version: 2,
};
