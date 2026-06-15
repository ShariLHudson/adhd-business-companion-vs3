/**
 * Local persistence for recognition milestones, dismissals, and founder reporting.
 * Warm recognition only — never used for guilt, streaks, or re-engagement pressure.
 */

import type {
  BusinessMilestoneKey,
  CelebrationMode,
  PersonalDate,
  RecognitionEventType,
} from "./types";

const STORE_KEY = "companion-recognition-v1";

export type RecognitionStore = {
  celebrationMode: CelebrationMode;
  birthday: { month: number; day: number; year?: number } | null;
  personalDates: PersonalDate[];
  /** ISO timestamps when business milestones were first reached. */
  businessMilestones: Partial<Record<BusinessMilestoneKey, string>>;
  /** Dismissed recognition moment ids (per day). */
  dismissed: Record<string, string>;
  /** Log for founder reporting — event type counts only. */
  sentLog: { type: RecognitionEventType; milestoneKey: string; at: string }[];
  firstConversationAt: string | null;
  conversationStarts: number;
  lastConversationStartAt: string | null;
};

const DEFAULT_STORE: RecognitionStore = {
  celebrationMode: "full",
  birthday: null,
  personalDates: [],
  businessMilestones: {},
  dismissed: {},
  sentLog: [],
  firstConversationAt: null,
  conversationStarts: 0,
  lastConversationStartAt: null,
};

export function getRecognitionStore(): RecognitionStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<RecognitionStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      personalDates: Array.isArray(parsed.personalDates)
        ? parsed.personalDates
        : [],
      businessMilestones: parsed.businessMilestones ?? {},
      dismissed: parsed.dismissed ?? {},
      sentLog: Array.isArray(parsed.sentLog) ? parsed.sentLog : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveRecognitionStore(
  update: Partial<RecognitionStore>,
): RecognitionStore {
  const next = { ...getRecognitionStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function isRecognitionDismissed(id: string, now = new Date()): boolean {
  const key = `${id}:${dayKey(now)}`;
  return Boolean(getRecognitionStore().dismissed[key]);
}

export function dismissRecognition(id: string, now = new Date()): void {
  const store = getRecognitionStore();
  saveRecognitionStore({
    dismissed: {
      ...store.dismissed,
      [`${id}:${dayKey(now)}`]: now.toISOString(),
    },
  });
}

export function logRecognitionSent(
  type: RecognitionEventType,
  milestoneKey: string,
): void {
  const store = getRecognitionStore();
  const entry = {
    type,
    milestoneKey,
    at: new Date().toISOString(),
  };
  saveRecognitionStore({
    sentLog: [...store.sentLog, entry].slice(-500),
  });
}

export function markBusinessMilestone(
  key: BusinessMilestoneKey,
  at = new Date().toISOString(),
): void {
  const store = getRecognitionStore();
  if (store.businessMilestones[key]) return;
  saveRecognitionStore({
    businessMilestones: { ...store.businessMilestones, [key]: at },
  });
}

export function syncCelebrationMode(mode: CelebrationMode): void {
  saveRecognitionStoreAndNotify({ celebrationMode: mode });
}

export function syncBirthday(
  birthday: { month: number; day: number; year?: number } | null,
): void {
  saveRecognitionStoreAndNotify({ birthday });
}

export const RECOGNITION_UPDATED_EVENT = "companion-recognition-updated";

function notifyRecognitionUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RECOGNITION_UPDATED_EVENT));
  }
}

export function saveRecognitionStoreAndNotify(
  update: Partial<RecognitionStore>,
): RecognitionStore {
  const next = saveRecognitionStore(update);
  notifyRecognitionUpdated();
  return next;
}

export function recordConversationStart(now = new Date()): number {
  const store = getRecognitionStore();
  const iso = now.toISOString();
  const next = store.conversationStarts + 1;
  saveRecognitionStoreAndNotify({
    conversationStarts: next,
    lastConversationStartAt: iso,
    firstConversationAt: store.firstConversationAt ?? iso,
  });
  return next;
}
