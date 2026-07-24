import type { StrategyTypeContract } from "../types";

export const personalDirectionStrategyType: StrategyTypeContract = {
  id: "personal_direction",
  name: "Personal Direction Strategy",
  family: "personal_direction",
  plainLanguageDescription:
    "Help with seasons of work, personal priorities, business/life alignment, intentional pauses, learning goals, career direction, and energy fit.",
  useWhen: [
    "Wondering whether to keep going",
    "Business choice touches life, health, or values",
    "Personal season needs to shape business pace",
    "Career direction or intentional pause is on the table",
  ],
  doNotUseWhen: ["Need is only general venting with no decision intent"],
  entrySignals: [
    /\b(keep doing this|should i continue|burn(ed)? out|life|family|health|values|faith|career|season of|intentional pause|learning goal|energy fit)\b/i,
  ],
  clarifyingQuestions: [
    "What personal decision sits underneath the business question?",
    "Is this about pace, priorities, identity, learning, or whether to continue?",
  ],
  currentStateQuestions: [
    "What feels most out of alignment right now?",
    "What has changed in your life or energy?",
    "What season are you actually in — building, sustaining, recovering, or transitioning?",
  ],
  directionQuestions: [
    "What would a good season protect for you?",
    "What business pace would still feel honest?",
    "What would an intentional pause make possible?",
  ],
  optionPatterns: [
    "stabilize",
    "simplify",
    "delay",
    "pause",
    "continue",
    "stop",
    "narrow",
  ],
  decisionCriteria: [
    "personal fit",
    "values",
    "sustainability",
    "meaning",
    "energy fit",
    "season honesty",
  ],
  commonTradeoffs: [
    "ambition vs wellbeing",
    "career momentum vs family/season needs",
    "learning investment vs earning pressure",
  ],
  commonRisks: [
    "forcing a pace that breaks trust with yourself",
    "treating pause as failure",
    "making a permanent decision from a temporary season",
  ],
  commonAssumptions: [
    "pausing means failure",
    "everyone else sustains this pace",
    "business success requires ignoring personal seasons",
  ],
  evidencePrompts: [
    "What do you already know about what you can sustain?",
    "What has your energy been telling you for more than a week?",
    "What would Future You thank you for protecting?",
  ],
  capacityChecks: [
    "What recovery or space does this season require?",
    "Is the business asking for a pace your life cannot hold right now?",
  ],
  experimentPatterns: [
    "Try a gentler operating pace for 30 days and review",
    "Protect one personal priority for two weeks without adding business load",
    "Take an intentional pause on one initiative and notice the effect",
  ],
  successSignals: [
    "Clearer personal yes/no",
    "Steadier energy",
    "Business choices that match the season",
  ],
  reviewTriggers: [
    "Health or family change",
    "Renewed clarity",
    "Season shift",
  ],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director", "founder-advocate"],
  handoffDestinations: ["talk_it_out", "journal", "rhythm", "board"],
  adaptivePresentationNotes:
    "Offer Talk It Out when emotion blocks judgment. Dignity first; no shame language.",
  qualityChecks: ["Dignity preserved; no shame language", "Season named when relevant"],
  decisionHeuristics: [
    {
      id: "season_honesty",
      rule: "Name the season of work before choosing a pace.",
      when: "Ambition and energy conflict",
    },
    {
      id: "pause_is_strategy",
      rule: "An intentional pause can be a strategic decision, not a failure.",
      when: "Member equates slowing down with quitting",
    },
    {
      id: "life_business_alignment",
      rule: "Business direction should remain compatible with life priorities in this season.",
      when: "Success would cost what they most value",
    },
    {
      id: "energy_fit",
      rule: "Prefer paths with energy fit over prestige paths that deplete.",
      when: "Options look good on paper but drain in practice",
    },
  ],
  commonMistakes: [
    "Making permanent career decisions from temporary exhaustion",
    "Ignoring family/health signals until crisis",
    "Treating learning goals as luxury instead of strategy",
  ],
  warningSigns: [
    "Dread is constant, not situational",
    "Success would still feel like the wrong life",
    "No room for recovery in any plan",
  ],
  problemDistinctions: [
    {
      id: "season_of_work",
      label: "Season of work",
      description: "Building, sustaining, recovering, and transitioning need different strategies.",
      whenToSuspect: ["season", "this chapter", "not forever", "right now"],
      preferredPatterns: ["stabilize", "narrow", "pause"],
    },
    {
      id: "personal_priorities",
      label: "Personal priorities",
      description: "Life priorities may need to lead the business choice.",
      whenToSuspect: ["family", "health", "priorities", "what matters most"],
      preferredPatterns: ["simplify", "delay", "pause"],
    },
    {
      id: "alignment",
      label: "Business / life alignment",
      description: "The business may be succeeding at the wrong life.",
      whenToSuspect: ["out of alignment", "not my life", "values", "who I am"],
      preferredPatterns: ["narrow", "reposition", "pause"],
    },
    {
      id: "intentional_pause",
      label: "Intentional pause",
      description: "Stopping or pausing may be the courageous strategic move.",
      whenToSuspect: ["pause", "step back", "sabbatical", "stop for a while"],
      preferredPatterns: ["pause", "delay", "stabilize"],
    },
    {
      id: "learning_career",
      label: "Learning / career direction",
      description: "Growth may be about learning or career path, not business scale.",
      whenToSuspect: ["learn", "career", "next chapter", "skill", "calling"],
      preferredPatterns: ["test", "narrow", "continue"],
    },
    {
      id: "energy_fit",
      label: "Energy fit",
      description: "The right strategy fits the energy available.",
      whenToSuspect: ["energy", "drains me", "gives me life", "exhausting"],
      preferredPatterns: ["simplify", "stabilize", "narrow"],
    },
  ],
  hiddenUnderlyingQuestions: [
    "What personal decision sits under the business question?",
    "What season are we actually in — building, sustaining, recovering, or transitioning?",
    "Would an intentional pause protect what matters most?",
    "Does the “winning” path still fit energy and life priorities?",
  ],
  recommendationRules: [
    "Name the season before recommending pace or ambition.",
    "Treat intentional pause as a valid strategic recommendation.",
    "Prefer energy-fit paths over prestige paths that deplete.",
    "Never shame a slower season in recommendation language.",
  ],
  handoffBoundaries: [
    "Stay in Strategy (or Talk It Out) until the personal decision under the business ask is clear.",
    "Journal/Rhythm can hold the season — they do not replace the direction choice.",
    "Do not hand to Project for more building while the honest need is pause or alignment.",
  ],
  guidingPrinciples: [
    "Personal direction is a first-class strategy domain — not an afterthought.",
    "Intentional pauses can be wise strategy.",
    "Preserve dignity; never shame a slower season.",
  ],
  version: 2,
};
