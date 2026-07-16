/**
 * Notification sound families — limited set so members recognize event type
 * without memorizing dozens of tones. Celebration intensity comes from
 * companion-recognition celebrationMode, not this store.
 */

export type NotificationSoundFamilyId =
  | "reminder"
  | "rhythm"
  | "priority-alert"
  | "shari-check-in"
  | "attention-needed";

/** Synthesized / catalog sound option ids. `null` = None. */
export type NotificationSoundOptionId =
  | "soft-bell"
  | "clear-chime"
  | "piano-note"
  | "nature-tone"
  | "wind-chime"
  | "soft-wood"
  | "gentle-bell"
  | "priority-soft"
  | "priority-medium"
  | "priority-distinct"
  | "soft-tone"
  | "soft-alert"
  | "distinct-chime"
  | "celebration-sparkle"
  | "celebration-flourish"
  | "celebration-big";

export type NotificationSoundPreferences = {
  reminderSoundId: NotificationSoundOptionId | null;
  rhythmSoundId: NotificationSoundOptionId | null;
  priorityAlertSoundId: NotificationSoundOptionId | null;
  shariCheckInSoundId: NotificationSoundOptionId | null;
  attentionNeededSoundId: NotificationSoundOptionId | null;
  /** 0–1, applied on top of estate master volume. */
  masterNotificationVolume: number;
  /** When false, overdue / attention-needed sounds never play. */
  attentionNeededEnabled: boolean;
  updatedAt: string;
  version: number;
};

export type NotificationSoundEventKind =
  | "reminder"
  | "rhythm"
  | "priority-alert"
  | "time-block"
  | "shari-check-in"
  | "attention-needed"
  | "celebration"
  | "test";

export const NOTIFICATION_SOUND_PREFS_KEY =
  "spark:notification-sound-prefs:v1" as const;

export const NOTIFICATION_SOUND_PREFS_CHANGE_EVENT =
  "spark:notification-sound-prefs-change" as const;
