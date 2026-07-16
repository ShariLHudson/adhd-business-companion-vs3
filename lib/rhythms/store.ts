/**
 * Adaptive Rhythms — persistence (Phase 1).
 * Migrates companion-my-rhythms-v1 → companion-rhythms-v1.
 */

import {
  reclaimCompanionStorageHeadroom,
  safeLocalStorageSet,
} from "@/lib/companionStorageRecovery";
import { getPlanDayOwnerUserId } from "@/lib/planMyDay/planDayOwner";
import { updateReminder } from "@/lib/reminderStore";
import {
  resolveNextDueAt,
} from "./scheduling";
import type {
  MemberRhythm,
  RhythmCadence,
  RhythmCategory,
  RhythmPriority,
  RhythmSchedule,
  RhythmSource,
  RhythmStatus,
  RhythmTimeWindow,
} from "./types";
import { RHYTHM_CADENCE_OPTIONS } from "./types";

export { RHYTHM_CADENCE_OPTIONS };
export type { MemberRhythm, RhythmCadence } from "./types";

const LEGACY_STORE_KEY = "companion-my-rhythms-v1";
const STORE_KEY = "companion-rhythms-v1";
/** Marks that legacy → v1 migration has been applied for this owner scope. */
const MIGRATION_FLAG_KEY = "companion-rhythms-migrated-from-v1";

function storeKey(): string {
  const owner = getPlanDayOwnerUserId();
  return owner ? `${STORE_KEY}:${owner}` : STORE_KEY;
}

function legacyKey(): string {
  const owner = getPlanDayOwnerUserId();
  return owner ? `${LEGACY_STORE_KEY}:${owner}` : LEGACY_STORE_KEY;
}

function migrationFlagKey(): string {
  const owner = getPlanDayOwnerUserId();
  return owner ? `${MIGRATION_FLAG_KEY}:${owner}` : MIGRATION_FLAG_KEY;
}

function uid(): string {
  return `rhythm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultSchedule(cadence: RhythmCadence): RhythmSchedule {
  return { cadence };
}

function dedupeById(items: MemberRhythm[]): MemberRhythm[] {
  const map = new Map<string, MemberRhythm>();
  for (const item of items) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values());
}

function parseRhythmList(raw: string): MemberRhythm[] {
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return dedupeById(
      parsed
        .map((row) =>
          normalizeMemberRhythm(
            row as Partial<MemberRhythm> & { title?: string },
          ),
        )
        .filter((r): r is MemberRhythm => Boolean(r)),
    );
  } catch {
    return [];
  }
}

/**
 * Idempotent migration from companion-my-rhythms-v1 → companion-rhythms-v1.
 * Safe to call repeatedly: never duplicates by id; never re-imports once v1 exists.
 */
export function migrateLegacyMyRhythmsOnce(): {
  migrated: boolean;
  count: number;
} {
  if (typeof window === "undefined") return { migrated: false, count: 0 };
  try {
    const key = storeKey();
    const existingRaw = localStorage.getItem(key);
    if (existingRaw) {
      const normalized = parseRhythmList(existingRaw);
      // Empty scoped store must still import unscoped/legacy candidates.
      if (normalized.length > 0) {
        localStorage.setItem(key, JSON.stringify(normalized));
        localStorage.setItem(migrationFlagKey(), "1");
        return { migrated: false, count: normalized.length };
      }
    }

    const candidates = [
      localStorage.getItem(legacyKey()),
      key !== STORE_KEY ? localStorage.getItem(STORE_KEY) : null,
      localStorage.getItem(LEGACY_STORE_KEY),
    ].filter((v): v is string => Boolean(v));

    if (candidates.length === 0) {
      localStorage.setItem(migrationFlagKey(), "1");
      return { migrated: false, count: 0 };
    }

    const merged = dedupeById(
      candidates.flatMap((raw) => parseRhythmList(raw)),
    );
    localStorage.setItem(key, JSON.stringify(merged));
    localStorage.setItem(migrationFlagKey(), "1");
    return { migrated: true, count: merged.length };
  } catch {
    return { migrated: false, count: 0 };
  }
}

/** Normalize legacy rows into full MemberRhythm. */
export function normalizeMemberRhythm(
  raw: Partial<MemberRhythm> & { title?: string; cadence?: RhythmCadence },
): MemberRhythm | null {
  if (!raw.id || !raw.title?.trim()) return null;
  const cadence = raw.cadence ?? raw.schedule?.cadence ?? "weekly";
  const schedule: RhythmSchedule = raw.schedule ?? defaultSchedule(cadence);
  const now = new Date().toISOString();
  return {
    id: raw.id,
    title: raw.title.trim(),
    details: raw.details?.trim() || undefined,
    cadence,
    customNote: raw.customNote?.trim() || undefined,
    sourcePlanItemId: raw.sourcePlanItemId,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    ownerUserId: raw.ownerUserId,
    category: raw.category ?? "personal",
    status: raw.status ?? "active",
    priority: raw.priority ?? "supportive",
    source: raw.source ?? (raw.sourcePlanItemId ? "plan_item" : "user"),
    schedule: { ...schedule, cadence },
    window: raw.window ?? (schedule.exactTime ? "exact" : "morning"),
    destinationId: raw.destinationId,
    deliveryMethods: raw.deliveryMethods?.length
      ? raw.deliveryMethods
      : ["in_app", "browser"],
    quietHoursBehavior: raw.quietHoursBehavior ?? "defer",
    snoozeDefaultsMinutes: raw.snoozeDefaultsMinutes?.length
      ? raw.snoozeDefaultsMinutes
      : [10, 30, 60],
    nextDueAt: raw.nextDueAt,
    lastPromptedAt: raw.lastPromptedAt,
    skippedOccurrenceDates: raw.skippedOccurrenceDates,
    linkedReminderId: raw.linkedReminderId,
    originatedFromId: raw.originatedFromId,
    originatedFromKind: raw.originatedFromKind,
  };
}

/**
 * Heal owner split-brain: when scoped storage is empty/missing but the
 * unscoped companion-rhythms-v1 key still has rows, import them once.
 */
function mergeUnscopedIntoOwnerStore(ownerScoped: MemberRhythm[]): MemberRhythm[] {
  const owner = getPlanDayOwnerUserId();
  if (!owner) return ownerScoped;
  if (storeKey() === STORE_KEY) return ownerScoped;
  try {
    const unscopedRaw = localStorage.getItem(STORE_KEY);
    if (!unscopedRaw) return ownerScoped;
    const unscoped = parseRhythmList(unscopedRaw).filter(
      (r) => !r.ownerUserId || r.ownerUserId === owner,
    );
    if (unscoped.length === 0) return ownerScoped;
    const merged = dedupeById([...ownerScoped, ...unscoped]);
    if (merged.length !== ownerScoped.length) {
      localStorage.setItem(storeKey(), JSON.stringify(merged));
    }
    return merged;
  } catch {
    return ownerScoped;
  }
}

function readAll(): MemberRhythm[] {
  if (typeof window === "undefined") return [];
  try {
    migrateLegacyMyRhythmsOnce();
    const key = storeKey();
    const raw = localStorage.getItem(key);
    const owner = getPlanDayOwnerUserId();
    const fromKey = raw ? parseRhythmList(raw) : [];
    const merged = mergeUnscopedIntoOwnerStore(fromKey);
    return merged.filter((r) => {
      if (!owner) return true;
      return !r.ownerUserId || r.ownerUserId === owner;
    });
  } catch {
    return [];
  }
}

function writeAll(items: MemberRhythm[]): boolean {
  if (typeof window === "undefined") return false;
  const key = storeKey();
  const payload = JSON.stringify(items);
  if (safeLocalStorageSet(key, payload)) {
    window.dispatchEvent(new CustomEvent("companion-rhythms-updated"));
    return true;
  }
  // Match Reminders: reclaim regenerable headroom, then retry once.
  reclaimCompanionStorageHeadroom();
  if (!safeLocalStorageSet(key, payload)) return false;
  window.dispatchEvent(new CustomEvent("companion-rhythms-updated"));
  return true;
}

/** Scheduling must never block persistence. */
function safeNextDueAt(rhythm: MemberRhythm): string | undefined {
  if (rhythm.status !== "active") return undefined;
  try {
    return resolveNextDueAt(rhythm, new Date());
  } catch {
    return undefined;
  }
}

export function listMemberRhythms(ownerUserId?: string | null): MemberRhythm[] {
  const all = readAll();
  if (!ownerUserId) return all;
  return all.filter((r) => !r.ownerUserId || r.ownerUserId === ownerUserId);
}

export function listActiveRhythms(ownerUserId?: string | null): MemberRhythm[] {
  return listMemberRhythms(ownerUserId).filter((r) => r.status === "active");
}

export function getMemberRhythm(id: string): MemberRhythm | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function updateMemberRhythm(
  id: string,
  patch: Partial<MemberRhythm>,
): MemberRhythm | null {
  const all = readAll();
  const index = all.findIndex((r) => r.id === id);
  if (index < 0) return null;
  const current = all[index]!;
  const merged = normalizeMemberRhythm({
    ...current,
    ...patch,
    id: current.id,
    title: (patch.title ?? current.title).trim(),
    details:
      patch.details !== undefined
        ? patch.details.trim() || undefined
        : current.details,
    customNote:
      patch.customNote !== undefined
        ? patch.customNote.trim() || undefined
        : current.customNote,
    cadence: patch.schedule?.cadence ?? patch.cadence ?? current.cadence,
    /**
     * Replace schedule on edit — shallow-merge kept stale weekdays/interval
     * when cadence changed (e.g. Weekly → Daily).
     */
    schedule: patch.schedule
      ? {
          ...patch.schedule,
          cadence:
            patch.schedule.cadence ?? patch.cadence ?? current.cadence,
        }
      : current.schedule,
    updatedAt: new Date().toISOString(),
  });
  if (!merged) return null;
  if (
    patch.schedule ||
    patch.window ||
    patch.status === "active" ||
    !merged.nextDueAt
  ) {
    merged.nextDueAt = safeNextDueAt(merged);
  }
  const list = [...all];
  list[index] = merged;
  if (!writeAll(list)) {
    throw new Error("RHYTHM_PERSIST_FAILED");
  }
  return merged;
}

export function deleteMemberRhythm(id: string): void {
  if (!writeAll(readAll().filter((r) => r.id !== id))) {
    throw new Error("RHYTHM_PERSIST_FAILED");
  }
}

export function createMemberRhythm(input: {
  title: string;
  details?: string;
  cadence: RhythmCadence;
  customNote?: string;
  sourcePlanItemId?: string;
  ownerUserId?: string | null;
  category?: RhythmCategory;
  status?: RhythmStatus;
  priority?: RhythmPriority;
  source?: RhythmSource;
  schedule?: Partial<RhythmSchedule>;
  window?: RhythmTimeWindow;
  destinationId?: string;
  deliveryMethods?: MemberRhythm["deliveryMethods"];
  quietHoursBehavior?: MemberRhythm["quietHoursBehavior"];
  snoozeDefaultsMinutes?: number[];
  originatedFromId?: string;
  originatedFromKind?: string;
}): MemberRhythm {
  const now = new Date().toISOString();
  const owner = input.ownerUserId ?? getPlanDayOwnerUserId();
  const schedule: RhythmSchedule = {
    ...input.schedule,
    cadence: input.schedule?.cadence ?? input.cadence,
  };
  const draft = normalizeMemberRhythm({
    id: uid(),
    title: input.title.trim(),
    details: input.details?.trim() || undefined,
    cadence: input.cadence,
    customNote: input.customNote?.trim() || undefined,
    sourcePlanItemId: input.sourcePlanItemId,
    createdAt: now,
    updatedAt: now,
    ownerUserId: owner ?? undefined,
    category: input.category,
    status: input.status ?? "active",
    priority: input.priority,
    source: input.source ?? (input.sourcePlanItemId ? "plan_item" : "user"),
    schedule,
    window: input.window,
    destinationId: input.destinationId,
    deliveryMethods: input.deliveryMethods,
    quietHoursBehavior: input.quietHoursBehavior,
    snoozeDefaultsMinutes: input.snoozeDefaultsMinutes,
    originatedFromId: input.originatedFromId,
    originatedFromKind: input.originatedFromKind,
  });
  if (!draft) {
    throw new Error("RHYTHM_INVALID");
  }
  draft.nextDueAt = safeNextDueAt(draft);
  const next = [...readAll(), draft];
  if (!writeAll(next)) {
    throw new Error("RHYTHM_PERSIST_FAILED");
  }
  return draft;
}

/**
 * Bidirectional link so load manager delivers once (reminder is the vehicle).
 */
export function linkRhythmAndReminder(
  rhythmId: string,
  reminderId: string,
): { rhythm: MemberRhythm | null; linked: boolean } {
  const rhythm = updateMemberRhythm(rhythmId, { linkedReminderId: reminderId });
  if (!rhythm) return { rhythm: null, linked: false };
  const updated = updateReminder(reminderId, {
    linkedRhythmId: rhythmId,
    source: "rhythm",
  });
  return { rhythm, linked: Boolean(updated) };
}
