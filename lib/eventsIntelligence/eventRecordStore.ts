import {
  EVENT_RECORDS_STORAGE_KEY as EVENT_RECORDS_KEY_CANON,
  getLastLocalStorageWriteDiagnostic,
  safeLocalStorageSet,
} from "@/lib/companionStorageRecovery";
import { ensureEventSectionsComplete } from "./eventSections";
import type { EventRecord } from "./types";

function withCompleteMap(record: EventRecord): EventRecord {
  return {
    ...record,
    sections: ensureEventSectionsComplete(record.sections),
  };
}

/** 074 — Event Creation durability key (must survive reclaim + refresh). */
export const EVENT_RECORDS_STORAGE_KEY = EVENT_RECORDS_KEY_CANON;
const STORAGE_KEY = EVENT_RECORDS_STORAGE_KEY;
const ACTIVE_KEY = "companion-events-intelligence-active-id";

let lastEventPersistDurable = true;

export function wasLastEventPersistDurable(): boolean {
  return lastEventPersistDurable;
}

function readAll(): EventRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EventRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: EventRecord[]): boolean {
  if (typeof window === "undefined") {
    lastEventPersistDurable = true;
    return true;
  }
  const payload = JSON.stringify(records);
  const ok = safeLocalStorageSet(STORAGE_KEY, payload);
  if (ok) {
    try {
      lastEventPersistDurable = localStorage.getItem(STORAGE_KEY) === payload;
    } catch {
      lastEventPersistDurable = false;
    }
  } else {
    lastEventPersistDurable = false;
  }
  // Write outcome is on window.__SPARK_LS_WRITE__ (avoid circular import)
  void getLastLocalStorageWriteDiagnostic();
  return lastEventPersistDurable;
}

export function listEventRecords(): EventRecord[] {
  return readAll()
    .map(withCompleteMap)
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function getEventRecord(id: string): EventRecord | null {
  const found = readAll().find((r) => r.id === id);
  return found ? withCompleteMap(found) : null;
}

export function getActiveEventRecord(): EventRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const id =
      sessionStorage.getItem(ACTIVE_KEY) ?? localStorage.getItem(ACTIVE_KEY);
    if (!id) return listEventRecords()[0] ?? null;
    return getEventRecord(id);
  } catch {
    return listEventRecords()[0] ?? null;
  }
}

export function setActiveEventRecordId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!id) {
      sessionStorage.removeItem(ACTIVE_KEY);
      localStorage.removeItem(ACTIVE_KEY);
      return;
    }
    sessionStorage.setItem(ACTIVE_KEY, id);
    safeLocalStorageSet(ACTIVE_KEY, id);
  } catch {
    /* never crash Creation */
  }
}

export function upsertEventRecord(record: EventRecord): EventRecord {
  const next = withCompleteMap({
    ...record,
    updatedAt: new Date().toISOString(),
  });
  const others = readAll().filter((r) => r.id !== next.id);
  writeAll([next, ...others]);
  setActiveEventRecordId(next.id);
  return next;
}

/**
 * Soft-remove an Event from Active Work without making it the active record.
 */
export function cancelEventRecord(eventId: string | null | undefined): void {
  const id = eventId?.trim();
  if (!id) return;
  const existing = getEventRecord(id);
  if (!existing) return;
  if (existing.runtimeState === "CANCELED") return;
  const next: EventRecord = {
    ...existing,
    runtimeState: "CANCELED",
    updatedAt: new Date().toISOString(),
  };
  const others = readAll().filter((r) => r.id !== next.id);
  writeAll([next, ...others]);
  if (typeof window !== "undefined") {
    try {
      const active =
        sessionStorage.getItem(ACTIVE_KEY) ?? localStorage.getItem(ACTIVE_KEY);
      if (active === id) {
        setActiveEventRecordId(null);
      }
    } catch {
      /* never crash Creation */
    }
  }
}

export function clearActiveEventRecord(): void {
  setActiveEventRecordId(null);
}

/** 074 — confirm Event Record exists in durable storage. */
export function verifyEventRecordDurable(eventId: string): boolean {
  const id = eventId.trim();
  if (!id || typeof window === "undefined") return Boolean(getEventRecord(id));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as EventRecord[];
    return Array.isArray(parsed) && parsed.some((r) => r?.id === id);
  } catch {
    return false;
  }
}
