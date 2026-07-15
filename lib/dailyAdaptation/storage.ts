import { todayStr } from "@/lib/companionStore";
import {
  DAILY_ADAPTATION_STORAGE_KEY,
  type DailyAdaptationCheckIn,
} from "./types";

type StoredEnvelope = {
  date: string;
  checkIn: DailyAdaptationCheckIn;
};

function readEnvelope(): StoredEnvelope | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_ADAPTATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredEnvelope;
    if (!parsed?.date || !parsed?.checkIn?.energyLevel) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Today's adaptation check-in only — never long-term preference storage. */
export function loadTodaysAdaptationCheckIn(): DailyAdaptationCheckIn | null {
  const envelope = readEnvelope();
  if (!envelope) return null;
  const today = todayStr();
  if (envelope.date !== today) return null;
  if (envelope.checkIn.date !== today) return null;
  return envelope.checkIn;
}

export function saveTodaysAdaptationCheckIn(
  checkIn: DailyAdaptationCheckIn,
): DailyAdaptationCheckIn {
  if (typeof window === "undefined") return checkIn;
  try {
    const envelope: StoredEnvelope = {
      date: checkIn.date,
      checkIn,
    };
    localStorage.setItem(
      DAILY_ADAPTATION_STORAGE_KEY,
      JSON.stringify(envelope),
    );
  } catch {
    // private mode / quota — fail quietly
  }
  return checkIn;
}

export function clearTodaysAdaptationCheckInForTests(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DAILY_ADAPTATION_STORAGE_KEY);
  } catch {
    /* noop */
  }
}
