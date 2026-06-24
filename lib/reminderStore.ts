/**
 * P0.24 — ADHD-Friendly reminder persistence (localStorage).
 */

export type ReminderType = "one_time" | "recurring" | "event_offset";
export type ReminderSource = "chat" | "calendar" | "project" | "task";
export type ReminderStatus = "active" | "completed" | "cancelled";

export type Reminder = {
  id: string;
  title: string;
  message: string;
  reminderType: ReminderType;
  scheduledAt?: string;
  recurrenceRule?: string;
  eventId?: string;
  eventTitle?: string;
  offsets?: number[];
  source: ReminderSource;
  createdAt: string;
  status: ReminderStatus;
  snoozedUntil?: string;
  lastFiredAt?: string;
};

const STORAGE_KEY = "companion-reminders-v1";
const INTAKE_KEY = "companion-reminder-intake-v1";

function newId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: Reminder[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("companion-reminders-updated"));
}

export function getReminders(): Reminder[] {
  return readAll();
}

export function getActiveReminders(): Reminder[] {
  return readAll().filter((r) => r.status === "active");
}

export function getUpcomingReminders(now = Date.now()): Reminder[] {
  return getActiveReminders()
    .filter((r) => !r.snoozedUntil || new Date(r.snoozedUntil).getTime() <= now)
    .sort((a, b) => {
      const aT = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
      const bT = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
      return aT - bT;
    });
}

export function saveReminder(
  input: Omit<Reminder, "id" | "createdAt" | "status"> & {
    id?: string;
    createdAt?: string;
    status?: ReminderStatus;
  },
): Reminder {
  const reminder: Reminder = {
    id: input.id ?? newId(),
    title: input.title.trim(),
    message: input.message.trim(),
    reminderType: input.reminderType,
    scheduledAt: input.scheduledAt,
    recurrenceRule: input.recurrenceRule,
    eventId: input.eventId,
    eventTitle: input.eventTitle,
    offsets: input.offsets,
    source: input.source,
    createdAt: input.createdAt ?? new Date().toISOString(),
    status: input.status ?? "active",
    snoozedUntil: input.snoozedUntil,
    lastFiredAt: input.lastFiredAt,
  };
  writeAll([reminder, ...readAll().filter((r) => r.id !== reminder.id)]);
  return reminder;
}

export function saveReminders(reminders: Reminder[]): Reminder[] {
  const existing = readAll();
  const ids = new Set(reminders.map((r) => r.id));
  writeAll([...reminders, ...existing.filter((r) => !ids.has(r.id))]);
  return reminders;
}

export function updateReminder(
  id: string,
  patch: Partial<Reminder>,
): Reminder | null {
  let updated: Reminder | null = null;
  writeAll(
    readAll().map((r) => {
      if (r.id !== id) return r;
      updated = { ...r, ...patch };
      return updated;
    }),
  );
  return updated;
}

export function deleteReminder(id: string): void {
  writeAll(readAll().filter((r) => r.id !== id));
}

export function snoozeReminder(id: string, until: string): Reminder | null {
  return updateReminder(id, { snoozedUntil: until });
}

export function completeReminder(id: string): Reminder | null {
  return updateReminder(id, { status: "completed" });
}

export function markReminderFired(id: string): Reminder | null {
  return updateReminder(id, { lastFiredAt: new Date().toISOString() });
}

export type ReminderIntakeSession = {
  phase: "collecting";
  draft: import("./reminderIntelligence").ReminderDraft;
  startedAtTurn: number;
};

export function loadReminderIntakeSession(): ReminderIntakeSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(INTAKE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReminderIntakeSession;
  } catch {
    return null;
  }
}

export function saveReminderIntakeSession(
  session: ReminderIntakeSession | null,
): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(INTAKE_KEY);
    return;
  }
  localStorage.setItem(INTAKE_KEY, JSON.stringify(session));
}

export function clearReminderIntakeSession(): void {
  saveReminderIntakeSession(null);
}
