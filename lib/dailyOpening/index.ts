export * from "./types";
export * from "./dailyOpeningDay";
export {
  resolveGlobalDailyOpening,
  resolveHelpMeChooseSuggestions,
  resolveDailyOpeningChoiceAction,
  resolveHelpMeChooseSuggestionDestination,
  dailyOpeningChoiceLabel,
  type ResolveGlobalDailyOpeningInput,
} from "./resolveGlobalDailyOpening";
export {
  runSharedNewDay,
  type RunSharedNewDayInput,
  type RunSharedNewDayResult,
} from "./runSharedNewDay";
export {
  buildDailyOpeningWelcomeMessage,
  buildDailyOpeningWelcomeParts,
  resolveDailyOpeningMemberFirstName,
  resolveDailyOpeningMomentKind,
  resolveFirst60TeachingSentence,
  resolveTodaysEncouragement,
  countWelcomeSentences,
  SOMETHING_HELPFUL_TO_KNOW_TODAY,
  SHOW_ME_SOMETHING_HELPFUL_LABEL,
  type DailyOpeningMomentKind,
  type DailyOpeningWelcomeParts,
} from "./buildDailyOpeningWelcome";
export {
  resolveWelcomeDayIndex,
  resolveDiscoveryForWelcomeDay,
  markFirst60DiscoveryExplored,
  markFirst60DiscoverySkipped,
  clearFirst60ProgressForTests,
  FIRST_60_DISCOVERY_CATALOG,
  FIRST_60_DAYS_GUIDED_LENGTH,
  type First60DiscoveryId,
  type WelcomeExperiencePhase,
} from "./first60Days";
export { buildDailyOpeningChoiceCards } from "./buildDailyOpeningChoiceCards";
export {
  recommendMeaningfulStart,
  nextMeaningfulStartRecommendation,
  shariCueForMeaningfulStart,
  MEANINGFUL_START_ACTIONS,
  MEANINGFUL_START_CLARIFYING_PROMPT,
  type MeaningfulStartRecommendation,
  type MeaningfulStartActionId,
} from "./meaningfulStart";
export {
  HELP_ME_CHOOSE_NEED_OPTIONS,
  HELP_ME_CHOOSE_PROMPT,
  resolveHelpMeChooseSupportOptions,
  registerHelpMeChooseNeedsPending,
  registerHelpMeChooseSupportPending,
  type HelpMeChooseNeedId,
  type HelpMeChooseNeedOption,
  type HelpMeChooseSupportOption,
} from "./helpMeChooseNeeds";
export {
  offerNextHelpfulLesson,
  offerNextHelpfulLessonExcluding,
  listEligibleHelpfulLessons,
} from "./helpfulLessons/resolveHelpfulLesson";
export {
  markHelpfulLessonOpened,
  markHelpfulLessonDismissed,
  clearHelpfulLessonHistoryForTests,
  loadHelpfulLessonHistory,
} from "./helpfulLessons/history";
export type {
  HelpfulLesson,
  HelpfulLessonHistory,
  HelpfulLessonOffer,
} from "./helpfulLessons/types";
export { HELPFUL_LESSON_REGISTRY } from "./helpfulLessons/registry";
export {
  resolveDailyOpeningDiscoveryInvite,
  markDailyOpeningDiscoveryPresented,
} from "./resolveDiscoveryInvite";
export { buildDailyOpeningArrivalMessage } from "./arrivalMessage";
export { resolveMeaningfulContinueForWelcome } from "./resolveMeaningfulContinue";
export {
  isTodaysWelcomeDismissedThisSession,
  markTodaysWelcomeDismissedThisSession,
  clearTodaysWelcomeSessionDismissForTests,
} from "./todaysWelcomeSession";
export {
  TODAYS_WELCOME_CARD_VERSION,
  isLegacyDailyOpeningCopy,
  filterLegacyDailyOpeningMessages,
  isSupersededWelcomeHomeGreeting,
} from "./legacyDailyOpeningGuard";
