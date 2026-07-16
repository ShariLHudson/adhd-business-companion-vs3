/**
 * Persist Reminder/Rhythm form drafts and entrance UI selections
 * across refresh, new chat, and new day (localStorage).
 */

import type { ReminderFormValues } from "@/lib/reminders/reminderForm";
import { EMPTY_REMINDER_FORM } from "@/lib/reminders/reminderForm";
import type { RhythmFormValues } from "@/lib/rhythms/rhythmForm";
import { EMPTY_RHYTHM_FORM } from "@/lib/rhythms/rhythmForm";

const REMINDER_DRAFT_KEY = "spark:reminder-form-draft:v1";
const RHYTHM_DRAFT_KEY = "spark:rhythm-form-draft:v1";
const ENTRANCE_UI_KEY = "spark:reminders-rhythms-entrance-ui:v1";
const CHANGE_EVENT = "spark:reminders-rhythms-draft-change";

export type EntranceUiState = {
  comparisonOpen: boolean;
  helpMeChooseOpen: boolean;
  howToOpen: boolean;
  advancedOpen: boolean;
  updatedAt: string;
};

const DEFAULT_ENTRANCE_UI: EntranceUiState = {
  comparisonOpen: false,
  helpMeChooseOpen: false,
  howToOpen: false,
  advancedOpen: false,
  updatedAt: new Date(0).toISOString(),
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
  } catch {
    /* storage unavailable */
  }
}

export function loadReminderFormDraft(): ReminderFormValues {
  const raw = readJson<Partial<ReminderFormValues>>(REMINDER_DRAFT_KEY);
  if (!raw || typeof raw !== "object") return { ...EMPTY_REMINDER_FORM };
  return {
    ...EMPTY_REMINDER_FORM,
    ...raw,
    title: typeof raw.title === "string" ? raw.title : "",
    date: typeof raw.date === "string" ? raw.date : "",
    time: typeof raw.time === "string" ? raw.time : "",
    repeat: raw.repeat ?? "none",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    customRepeatNote:
      typeof raw.customRepeatNote === "string" ? raw.customRepeatNote : "",
  };
}

export function saveReminderFormDraft(values: ReminderFormValues): void {
  writeJson(REMINDER_DRAFT_KEY, values);
}

export function clearReminderFormDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REMINDER_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function loadRhythmFormDraft(): RhythmFormValues {
  const raw = readJson<Partial<RhythmFormValues>>(RHYTHM_DRAFT_KEY);
  if (!raw || typeof raw !== "object") return { ...EMPTY_RHYTHM_FORM };
  return {
    ...EMPTY_RHYTHM_FORM,
    ...raw,
    title: typeof raw.title === "string" ? raw.title : "",
    description: typeof raw.description === "string" ? raw.description : "",
    cadence: raw.cadence ?? "daily",
    dailyMode: raw.dailyMode ?? "every_day",
    weekdays: Array.isArray(raw.weekdays) ? raw.weekdays : ["monday"],
    customNote: typeof raw.customNote === "string" ? raw.customNote : "",
    time: typeof raw.time === "string" ? raw.time : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

export function saveRhythmFormDraft(values: RhythmFormValues): void {
  writeJson(RHYTHM_DRAFT_KEY, values);
}

export function clearRhythmFormDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RHYTHM_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function loadEntranceUiState(): EntranceUiState {
  const raw = readJson<Partial<EntranceUiState>>(ENTRANCE_UI_KEY);
  if (!raw || typeof raw !== "object") return { ...DEFAULT_ENTRANCE_UI };
  return {
    comparisonOpen: Boolean(raw.comparisonOpen),
    helpMeChooseOpen: Boolean(raw.helpMeChooseOpen),
    howToOpen: Boolean(raw.howToOpen),
    advancedOpen: Boolean(raw.advancedOpen),
    updatedAt:
      typeof raw.updatedAt === "string"
        ? raw.updatedAt
        : DEFAULT_ENTRANCE_UI.updatedAt,
  };
}

export function saveEntranceUiState(
  patch: Partial<Omit<EntranceUiState, "updatedAt">>,
): EntranceUiState {
  const next: EntranceUiState = {
    ...loadEntranceUiState(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeJson(ENTRANCE_UI_KEY, next);
  return next;
}

export function subscribeRemindersRhythmsDrafts(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === REMINDER_DRAFT_KEY ||
      e.key === RHYTHM_DRAFT_KEY ||
      e.key === ENTRANCE_UI_KEY
    ) {
      listener();
    }
  };
  const onCustom = () => listener();
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onCustom);
  };
}
