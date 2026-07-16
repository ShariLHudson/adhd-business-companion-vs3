/**
 * Pre-save previews — plain language, never RRULE.
 */

import {
  REMINDER_REPEAT_OPTIONS,
  type ReminderFormValues,
} from "@/lib/reminders/reminderForm";
import {
  RHYTHM_FREQUENCY_OPTIONS,
  type RhythmFormValues,
} from "@/lib/rhythms/rhythmForm";
import { getNotificationSoundPrefs } from "@/lib/notifications/notificationSoundPrefs";
import { notificationSoundOptionLabel } from "@/lib/notifications/notificationSoundCatalog";
import { getRhythmPrefs } from "@/lib/rhythms/prefs";

export type ReminderPreviewLines = {
  what: string;
  when: string;
  repeat: string;
  sound: string;
  quietHours: string;
};

export type RhythmPreviewLines = {
  name: string;
  frequency: string;
  window: string;
  skip: string;
  sound: string;
};

function formatDateLabel(date: string, time: string): string {
  if (!date.trim()) {
    return time.trim() ? `Around ${time}` : "No date set yet";
  }
  try {
    const d = new Date(`${date}T${time.trim() || "09:00"}:00`);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      ...(time.trim()
        ? { hour: "numeric", minute: "2-digit" as const }
        : {}),
    });
  } catch {
    return date;
  }
}

export function buildReminderPreview(
  values: ReminderFormValues,
): ReminderPreviewLines {
  const prefs = getNotificationSoundPrefs();
  const rhythmPrefs = getRhythmPrefs();
  const repeatLabel =
    REMINDER_REPEAT_OPTIONS.find((o) => o.id === values.repeat)?.label ??
    "Does not repeat";
  const custom =
    values.repeat === "custom" && values.customRepeatNote.trim()
      ? values.customRepeatNote.trim()
      : null;

  return {
    what: values.title.trim() || "Untitled reminder",
    when: formatDateLabel(values.date, values.time),
    repeat: custom ?? repeatLabel,
    sound: notificationSoundOptionLabel(prefs.reminderSoundId),
    quietHours: `Quiet hours ${rhythmPrefs.quietHoursStart}–${rhythmPrefs.quietHoursEnd} (shared estate quiet hours)`,
  };
}

function windowLabel(values: RhythmFormValues): string {
  if (values.time.trim()) return `Around ${values.time}`;
  // Form does not yet expose window picker on all paths — infer from empty time
  return "Flexible window (morning by default — not an exact deadline)";
}

export function buildRhythmPreview(
  values: RhythmFormValues,
): RhythmPreviewLines {
  const prefs = getNotificationSoundPrefs();
  const frequency =
    values.cadence === "custom" && values.customNote.trim()
      ? values.customNote.trim()
      : (RHYTHM_FREQUENCY_OPTIONS.find((o) => o.id === values.cadence)?.label ??
        values.cadence);

  return {
    name: values.title.trim() || "Untitled rhythm",
    frequency,
    window: windowLabel(values),
    skip: "You can Skip, Pause, or Resume anytime — never “behind.”",
    sound: notificationSoundOptionLabel(prefs.rhythmSoundId),
  };
}
