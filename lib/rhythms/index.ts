/**
 * Adaptive Rhythms — public API (Phase 1+).
 */

export type {
  MemberRhythm,
  RhythmCadence,
  RhythmCategory,
  RhythmStatus,
  RhythmPriority,
  RhythmSource,
  RhythmTimeWindow,
  RhythmSchedule,
  RhythmPrefs,
  RhythmHistoryEntry,
  RhythmSuggestion,
  DayCondition,
  NotificationLevel,
  DailyFrequencyCap,
  Weekday,
} from "./types";

export {
  RHYTHM_CADENCE_OPTIONS,
  DEFAULT_RHYTHM_PREFS,
} from "./types";

export {
  createMemberRhythm,
  getMemberRhythm,
  listMemberRhythms,
  listActiveRhythms,
  updateMemberRhythm,
  deleteMemberRhythm,
  normalizeMemberRhythm,
  migrateLegacyMyRhythmsOnce,
  linkRhythmAndReminder,
} from "./store";

export {
  resolveNextDueAt,
  rhythmsDueNow,
  clockForRhythm,
  windowEndForRhythm,
  isWithinFlexibleWindow,
  WINDOW_DEFAULT_TIMES,
  WINDOW_END_TIMES,
  parseHm,
} from "./scheduling";

export {
  pauseRhythm,
  resumeRhythm,
  skipRhythmOccurrence,
  snoozeRhythm,
  completeRhythmOccurrence,
  markRhythmPrompted,
} from "./actions";

export {
  getRhythmPrefs,
  saveRhythmPrefs,
  isInQuietHours,
  incrementPromptedCount,
} from "./prefs";

export {
  filterDeliverables,
  recordDelivery,
  dedupeLinkedDeliverables,
  deliverableOccurrenceKey,
  shouldDeliverOptionalPrompt,
  LOAD_MANAGER_MAY_CHANGE_SCHEDULES,
  type Deliverable,
  type OptionalPromptKind,
  type FilterDeliverablesOptions,
} from "./loadManager";

export {
  appendRhythmHistory,
  listRhythmHistory,
  historyForRhythm,
} from "./history";

export {
  listRhythmSuggestions,
  saveRhythmSuggestion,
  acceptRhythmSuggestion,
  dismissRhythmSuggestion,
  neverSuggestAgain,
} from "./suggestions";

export {
  RHYTHM_PROFILES,
  previewProfileRhythms,
  activateRhythmProfile,
  type RhythmProfileId,
  type RhythmProfileDef,
} from "./profiles";

export {
  setDayCondition,
  clearDayCondition,
  noteSnoozePattern,
  shouldOfferSnoozeProtection,
  dismissSnoozeProtection,
  resetSnoozeTrack,
  collectAdaptiveHints,
  inferPreferredHour,
  SNOOZE_PROTECTION_CHOICES,
  SNOOZE_PROTECTION_MESSAGE,
  SNOOZE_PROTECTION_MAY_CHANGE_SCHEDULES,
  type AdaptiveHint,
  type SnoozeProtectionChoiceId,
} from "./adaptive";

export {
  listPatternObservations,
  listAllPatternObservations,
  recordPatternObservation,
  observePatternsFromHistory,
  clearPatternObservations,
  dismissPatternObservation,
  PATTERN_OBSERVATION_MAY_CHANGE_SCHEDULES,
  type PatternObservation,
  type PatternObservationKind,
  type PatternConfidence,
} from "./patternObservation";

export {
  assessRhythmHealth,
  listRhythmHealthReports,
  RHYTHM_HEALTH_MAY_CHANGE_SCHEDULES,
  type RhythmHealthState,
  type RhythmHealthReport,
} from "./rhythmHealth";

export {
  createReminderFromContent,
  createRhythmFromContent,
  classifyRememberIntent,
  needsRememberClarification,
  isUnsupportedLocationTrigger,
  parseCadenceFromText,
  extractRhythmTitle,
  defaultReminderScheduledAt,
  type RememberIntent,
  type ContentRememberSource,
  type CreateReminderFromContentResult,
  type CreateRhythmFromContentResult,
} from "./fromContent";

export {
  findSimilarActiveReminder,
  findSimilarActiveRhythm,
} from "./duplicates";

export {
  sourceRefFromThought,
  sourceRefFromParkingLot,
  sourceRefFromChat,
  type RememberSourceRef,
  type RememberSourceKind,
} from "./sourceLinks";

export {
  tryResolveRememberManagementCommand,
  type ConversationCommandResult,
} from "./conversationCommands";

export {
  collectDueDeliverables,
  afterDeliverableFired,
  shouldDeliverBrowserNotification,
  shouldDeliverInApp,
} from "./delivery";

export {
  RHYTHM_DESTINATIONS,
  labelForRhythmDestination,
  type RhythmDestinationId,
} from "./destinations";

export {
  proposeInvoiceFridaySuggestion,
  proposePreferredWritingTimeSuggestion,
} from "./smartSuggestions";
