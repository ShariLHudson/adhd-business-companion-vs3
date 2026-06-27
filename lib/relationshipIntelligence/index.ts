export {
  PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
  type MorningGreetingInput,
  type MorningGreetingVerdict,
  type NameIntelligenceInput,
  type NameIntelligenceVerdict,
  type NameLineContext,
  type NameUseScenario,
} from "./types";

export {
  applyNameNaturally,
  countNameOccurrences,
  evaluateNameIntelligence,
  nameIntelligenceHintForChat,
} from "./nameIntelligence";

export {
  evaluateMorningGreeting,
  formatMorningGreeting,
  MORNING_GREETING_PRINCIPLE,
  morningGreetingHintForChat,
} from "./morningGreetingIntelligence";

export {
  clearGreetingHistoryForTests,
  pickVariedEntry,
  recordGreetingShown,
  wasGreetingUsedRecently,
} from "./greetingVariety";

export {
  violatesVagueCarryForward,
  VAGUE_CARRY_FORWARD_PATTERNS,
} from "./vagueCarryForward";
