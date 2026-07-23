import type { StrategyTypeContract } from "../types";

export const personalDirectionStrategyType: StrategyTypeContract = {
  id: "personal_direction",
  name: "Personal Direction Strategy",
  family: "personal_direction",
  plainLanguageDescription:
    "Decide personal direction when business choices and life fit are intertwined.",
  useWhen: [
    "Wondering whether to keep going",
    "Business choice touches life, health, or values",
    "Personal season needs to shape business pace",
  ],
  doNotUseWhen: ["Need is only general venting with no decision intent"],
  entrySignals: [
    /\b(keep doing this|should i continue|burn(ed)? out|life|family|health|values|faith)\b/i,
  ],
  clarifyingQuestions: [
    "What personal decision sits underneath the business question?",
  ],
  currentStateQuestions: [
    "What feels most out of alignment right now?",
    "What has changed in your life or energy?",
  ],
  directionQuestions: [
    "What would a good season protect for you?",
    "What business pace would still feel honest?",
  ],
  optionPatterns: ["stabilize", "simplify", "delay", "continue", "stop", "narrow"],
  decisionCriteria: ["personal fit", "values", "sustainability", "meaning"],
  commonTradeoffs: ["ambition vs wellbeing"],
  commonRisks: ["forcing a pace that breaks trust with yourself"],
  commonAssumptions: ["pausing means failure"],
  evidencePrompts: ["What do you already know about what you can sustain?"],
  capacityChecks: ["What recovery or space does this season require?"],
  experimentPatterns: ["Try a gentler operating pace for 30 days and review"],
  successSignals: ["Clearer personal yes/no", "Steadier energy"],
  reviewTriggers: ["Health or family change", "Renewed clarity"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["talk_it_out", "journal", "rhythm", "board"],
  adaptivePresentationNotes: "Offer Talk It Out when emotion blocks judgment.",
  qualityChecks: ["Dignity preserved; no shame language"],
  version: 1,
};
