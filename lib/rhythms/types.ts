/**
 * Adaptive Rhythms — core types (Phase 1 foundation).
 * Distinct from Reminder (CONV-040): rhythm = ongoing support without guilt.
 */

export type RhythmCadence =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

export type RhythmCategory =
  | "companion"
  | "business"
  | "focus"
  | "wellness"
  | "estate"
  | "personal"
  | "calendar"
  | "communication";

export type RhythmStatus = "active" | "paused" | "archived";

export type RhythmPriority =
  | "critical"
  | "important"
  | "supportive"
  | "optional";

export type RhythmSource =
  | "user"
  | "template"
  | "suggestion"
  | "plan_item"
  | "profile"
  | "conversation"
  | "clear_my_mind"
  | "parking_lot"
  | "project"
  | "journal";

export type RhythmTimeWindow =
  | "exact"
  | "morning"
  | "afternoon"
  | "evening"
  | "custom";

export type RhythmDeliveryMethod = "in_app" | "browser" | "email" | "voice";

export type QuietHoursBehavior = "defer" | "skip" | "allow_critical";

export type RhythmHistoryAction =
  | "prompted"
  | "completed"
  | "skipped"
  | "snoozed"
  | "missed"
  | "paused"
  | "resumed";

export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type RhythmSchedule = {
  cadence: RhythmCadence;
  /** For weekly: which days fire. */
  weekdays?: Weekday[];
  /** Interval in days/weeks depending on cadence (e.g. every 2 weeks). */
  interval?: number;
  /** Exact clock time HH:mm when window is exact. */
  exactTime?: string;
  /** Custom window bounds HH:mm when window is custom. */
  customWindowStart?: string;
  customWindowEnd?: string;
  /** Optional start/end dates (ISO date YYYY-MM-DD). */
  startDate?: string;
  endDate?: string;
};

export type MemberRhythm = {
  id: string;
  title: string;
  details?: string;
  /** @deprecated Prefer schedule.cadence — kept for legacy readers. */
  cadence: RhythmCadence;
  customNote?: string;
  sourcePlanItemId?: string;
  createdAt: string;
  updatedAt: string;
  ownerUserId?: string;

  category: RhythmCategory;
  status: RhythmStatus;
  priority: RhythmPriority;
  source: RhythmSource;
  schedule: RhythmSchedule;
  window: RhythmTimeWindow;
  destinationId?: string;
  deliveryMethods: RhythmDeliveryMethod[];
  quietHoursBehavior: QuietHoursBehavior;
  snoozeDefaultsMinutes: number[];
  /** Next scheduled prompt (ISO). */
  nextDueAt?: string;
  lastPromptedAt?: string;
  skippedOccurrenceDates?: string[];
  linkedReminderId?: string;
  /** Lineage — source item is never deleted when a rhythm is created. */
  originatedFromId?: string;
  originatedFromKind?: string;
};

export type RhythmHistoryEntry = {
  id: string;
  rhythmId?: string;
  reminderId?: string;
  action: RhythmHistoryAction;
  at: string;
  note?: string;
};

export type NotificationLevel =
  | "quiet"
  | "gentle"
  | "supportive"
  | "active"
  | "custom";

export type DailyFrequencyCap =
  | "critical_only"
  | 3
  | 5
  | 8
  | "none";

export type RhythmPrefs = {
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationLevel: NotificationLevel;
  dailyFrequencyCap: DailyFrequencyCap;
  deliveryInApp: boolean;
  deliveryBrowser: boolean;
  deliveryEmail: boolean;
  deliveryVoice: boolean;
  /** Temporary day adjustment (Phase 3) — clears next calendar day. */
  dayCondition?: DayCondition | null;
  dayConditionSetOn?: string;
  /** Count of optional/supportive prompts delivered today. */
  promptedCountDate?: string;
  promptedCountToday?: number;
};

export type DayCondition =
  | "normal"
  | "low_energy"
  | "overwhelmed"
  | "meeting_heavy"
  | "focus"
  | "personal"
  | "unexpected"
  | "quiet";

export type RhythmSuggestionStatus =
  | "pending"
  | "accepted"
  | "changed"
  | "dismissed"
  | "never_again";

export type RhythmSuggestion = {
  id: string;
  title: string;
  reason: string;
  proposedCategory: RhythmCategory;
  proposedCadence: RhythmCadence;
  proposedWindow?: RhythmTimeWindow;
  proposedExactTime?: string;
  status: RhythmSuggestionStatus;
  createdAt: string;
  patternKey: string;
};

export const RHYTHM_CADENCE_OPTIONS: {
  id: RhythmCadence;
  label: string;
}[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
  { id: "custom", label: "Custom" },
];

export const DEFAULT_RHYTHM_PREFS: RhythmPrefs = {
  quietHoursStart: "21:00",
  quietHoursEnd: "08:00",
  notificationLevel: "gentle",
  dailyFrequencyCap: 5,
  deliveryInApp: true,
  deliveryBrowser: true,
  deliveryEmail: false,
  deliveryVoice: false,
  dayCondition: null,
};
