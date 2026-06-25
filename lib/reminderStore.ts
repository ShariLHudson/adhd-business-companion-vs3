/**
 * P0.24 — ADHD-Friendly reminder persistence (localStorage).
 */

import {
  isStorageQuotaError,
  reclaimCompanionStorageHeadroom,
  safeLocalStorageSet,
} from "./companionStorageRecovery";

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

/** Keep active reminders; cap total history so localStorage stays healthy. */
const MAX_STORED_REMINDERS = 120;
const COMPLETED_RETENTION_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_TITLE_LEN = 120;
const MAX_MESSAGE_LEN = 500;

type PruneMode = "normal" | "aggressive" | "minimal";

function newId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeReminder(reminder: Reminder): Reminder {
  return {
    ...reminder,
    title: reminder.title.trim().slice(0, MAX_TITLE_LEN),
    message: reminder.message.trim().slice(0, MAX_MESSAGE_LEN),
  };
}

/** Drop stale completed/cancelled rows and cap total stored reminders. */
export function pruneReminders(
  items: Reminder[],
  mode: PruneMode = "normal",
): Reminder[] {
  const now = Date.now();
  const cutoff = now - COMPLETED_RETENTION_MS;
  let list = items.map(sanitizeReminder);

  if (mode === "minimal") {
    return list
      .filter((r) => r.status === "active")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 50);
  }

  list = list.filter((r) => {
    if (r.status === "active") return true;
    if (mode === "aggressive") return false;
    const anchor = r.lastFiredAt ?? r.createdAt;
    return new Date(anchor).getTime() >= cutoff;
  });

  const maxTotal = mode === "aggressive" ? 60 : MAX_STORED_REMINDERS;
  if (list.length <= maxTotal) return list;

  const active = list.filter((r) => r.status === "active");
  const inactive = list
    .filter((r) => r.status !== "active")
    .sort((a, b) => {
      const aT = new Date(a.lastFiredAt ?? a.createdAt).getTime();
      const bT = new Date(b.lastFiredAt ?? b.createdAt).getTime();
      return bT - aT;
    });

  const room = Math.max(0, maxTotal - active.length);
  return [...active, ...inactive.slice(0, room)];
}

function readAllRaw(): Reminder[] {
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

type WriteOpts = {
  mode?: PruneMode;
  skipEvent?: boolean;
};

function tryPersistReminders(pruned: Reminder[]): boolean {
  const payload = JSON.stringify(pruned);
  if (safeLocalStorageSet(STORAGE_KEY, payload)) return true;
  reclaimCompanionStorageHeadroom();
  return safeLocalStorageSet(STORAGE_KEY, payload);
}

function safeWriteAll(items: Reminder[], opts: WriteOpts = {}): boolean {
  if (typeof window === "undefined") return false;

  const mode = opts.mode ?? "normal";
  const pruned = pruneReminders(items, mode);

  if (tryPersistReminders(pruned)) {
    if (!opts.skipEvent) {
      window.dispatchEvent(new CustomEvent("companion-reminders-updated"));
    }
    return true;
  }

  if (mode === "normal") {
    return safeWriteAll(items, { ...opts, mode: "aggressive" });
  }
  if (mode === "aggressive") {
    return safeWriteAll(items, { ...opts, mode: "minimal" });
  }

  console.warn(
    "[companion] Could not save reminders — browser storage is full.",
  );
  return false;
}

function readAll(): Reminder[] {
  const items = readAllRaw();
  const pruned = pruneReminders(items);
  if (pruned.length < items.length) {
    safeWriteAll(pruned, { skipEvent: true });
  }
  return pruned;
}

function writeAll(items: Reminder[]): void {
  safeWriteAll(items);
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
  const reminder = sanitizeReminder({
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
  });
  writeAll([reminder, ...readAll().filter((r) => r.id !== reminder.id)]);
  return reminder;
}

export function saveReminders(reminders: Reminder[]): Reminder[] {
  const existing = readAll();
  const ids = new Set(reminders.map((r) => r.id));
  writeAll([
    ...reminders.map(sanitizeReminder),
    ...existing.filter((r) => !ids.has(r.id)),
  ]);
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
      updated = sanitizeReminder({ ...r, ...patch });
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
  try {
    safeLocalStorageSet(INTAKE_KEY, JSON.stringify(session));
  } catch {
    console.warn("[companion] Could not save reminder intake — storage full.");
  }
}

export function clearReminderIntakeSession(): void {
  saveReminderIntakeSession(null);
}

/** Compact reminder history on load so stale bundles recover without user action. */
function compactStoredRemindersOnLoad(): void {
  try {
    const raw = readAllRaw();
    if (!raw.length) return;
    safeWriteAll(pruneReminders(raw, "aggressive"), {
      skipEvent: true,
      mode: "aggressive",
    });
  } catch {
    /* non-fatal */
  }
}

if (typeof window !== "undefined") {
  queueMicrotask(compactStoredRemindersOnLoad);
}
