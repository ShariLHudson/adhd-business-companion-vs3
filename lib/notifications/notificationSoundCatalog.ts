import type {
  NotificationSoundFamilyId,
  NotificationSoundOptionId,
} from "./notificationSoundTypes";

export type NotificationSoundOption = {
  id: NotificationSoundOptionId;
  label: string;
  description: string;
};

export type NotificationSoundFamily = {
  id: NotificationSoundFamilyId;
  label: string;
  description: string;
  options: NotificationSoundOption[];
  /** Pref field on NotificationSoundPreferences */
  prefKey:
    | "reminderSoundId"
    | "rhythmSoundId"
    | "priorityAlertSoundId"
    | "shariCheckInSoundId"
    | "attentionNeededSoundId";
};

const REMINDER_OPTIONS: NotificationSoundOption[] = [
  {
    id: "soft-bell",
    label: "Soft Bell",
    description: "A single gentle chime — noticeable, not startling.",
  },
  {
    id: "clear-chime",
    label: "Clear Chime",
    description: "Two clean notes that are easy to recognize.",
  },
  {
    id: "piano-note",
    label: "Piano Note",
    description: "A short soft piano-like tone.",
  },
  {
    id: "nature-tone",
    label: "Nature Tone",
    description: "A calm, lower natural tone.",
  },
];

const RHYTHM_OPTIONS: NotificationSoundOption[] = [
  {
    id: "wind-chime",
    label: "Wind Chime",
    description: "A soft shimmer — supportive, not corrective.",
  },
  {
    id: "soft-wood",
    label: "Soft Wood Tone",
    description: "A muted wooden knock, very gentle.",
  },
  {
    id: "gentle-bell",
    label: "Gentle Bell",
    description: "A calm two-note bell.",
  },
  {
    id: "nature-tone",
    label: "Nature Tone",
    description: "A calm, lower natural tone.",
  },
];

const PRIORITY_OPTIONS: NotificationSoundOption[] = [
  {
    id: "priority-soft",
    label: "Soft",
    description: "Slightly clearer than a standard reminder.",
  },
  {
    id: "priority-medium",
    label: "Medium",
    description: "Two distinct chimes — still calm.",
  },
  {
    id: "priority-distinct",
    label: "Distinct",
    description: "More noticeable for appointments and deadlines.",
  },
];

const CHECK_IN_OPTIONS: NotificationSoundOption[] = [
  {
    id: "soft-tone",
    label: "Soft Tone",
    description: "A very quiet single tone for Shari’s gentle invitations.",
  },
];

const ATTENTION_OPTIONS: NotificationSoundOption[] = [
  {
    id: "distinct-chime",
    label: "Distinct Chime",
    description: "Different from priority alerts — never an alarm siren.",
  },
  {
    id: "soft-alert",
    label: "Soft Alert",
    description: "A calm cue that something needs attention.",
  },
];

export const NOTIFICATION_SOUND_FAMILIES: NotificationSoundFamily[] = [
  {
    id: "reminder",
    label: "Reminder Sound",
    description:
      "Something specific needs to be remembered — a soft, clear cue.",
    options: REMINDER_OPTIONS,
    prefKey: "reminderSoundId",
  },
  {
    id: "rhythm",
    label: "Rhythm Sound",
    description:
      "A flexible routine is ready — gentler than a reminder, never scolding.",
    options: RHYTHM_OPTIONS,
    prefKey: "rhythmSoundId",
  },
  {
    id: "priority-alert",
    label: "Priority Alert Sound",
    description:
      "Time-sensitive appointments, deadlines, or high-priority reminders.",
    options: PRIORITY_OPTIONS,
    prefKey: "priorityAlertSoundId",
  },
  {
    id: "shari-check-in",
    label: "Shari Check-In Sound",
    description:
      "Only for gentle proactive invitations — not ordinary chat replies.",
    options: CHECK_IN_OPTIONS,
    prefKey: "shariCheckInSoundId",
  },
  {
    id: "attention-needed",
    label: "Attention Needed Sound",
    description:
      "Overdue or conflicting items when you have enabled overdue alerts.",
    options: ATTENTION_OPTIONS,
    prefKey: "attentionNeededSoundId",
  },
];

export function notificationSoundOptionLabel(
  id: NotificationSoundOptionId | null,
): string {
  if (!id) return "None";
  for (const family of NOTIFICATION_SOUND_FAMILIES) {
    const match = family.options.find((o) => o.id === id);
    if (match) return match.label;
  }
  if (id.startsWith("celebration-")) {
    if (id === "celebration-sparkle") return "Soft Sparkle";
    if (id === "celebration-flourish") return "Warm Flourish";
    if (id === "celebration-big") return "Larger Flourish";
  }
  return id;
}
