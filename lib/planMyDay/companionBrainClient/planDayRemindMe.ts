/**
 * Remind me… — Shari-voiced snooze options for Plan My Day™ items.
 */

export type RemindPreset = {
  id: string;
  label: string;
  resolveUntil: () => Date;
};

function addMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}

function todayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export const REMIND_PRESETS: RemindPreset[] = [
  { id: "15m", label: "15 minutes", resolveUntil: () => addMinutes(15) },
  { id: "30m", label: "30 minutes", resolveUntil: () => addMinutes(30) },
  { id: "1h", label: "1 hour", resolveUntil: () => addMinutes(60) },
  { id: "2h", label: "2 hours", resolveUntil: () => addMinutes(120) },
  { id: "afternoon", label: "This afternoon", resolveUntil: () => todayAt(14) },
  { id: "after-lunch", label: "After lunch", resolveUntil: () => todayAt(13) },
  { id: "evening", label: "This evening", resolveUntil: () => todayAt(18) },
  {
    id: "tomorrow-am",
    label: "Tomorrow morning",
    resolveUntil: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

export function shariRemindAcknowledgment(itemTitle: string): string {
  const short =
    itemTitle.length > 48 ? `${itemTitle.slice(0, 45).trim()}…` : itemTitle;
  return `You asked me to remind you about "${short}". Whenever you're ready, this is still here.`;
}

export function shariRemindLaterLine(): string {
  return "I'll hold this quietly until the time you chose.";
}
