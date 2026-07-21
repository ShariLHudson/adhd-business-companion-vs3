/**
 * In-memory + localStorage identity map for canonical Work IDs and aliases.
 * Durable work rows continue to use creationDurable; this store prevents
 * competing master identities at runtime.
 */

import type {
  CanonicalWorkId,
  WorkIdAliasKind,
  WorkIdentityRecord,
  WorkOrigin,
} from "../types";

const STORAGE_KEY = "spark-uwe-work-identity-v1";

type StoreShape = {
  byWorkId: Record<string, WorkIdentityRecord>;
  /** alias → canonical workId */
  aliasToWorkId: Record<string, string>;
};

let memory: StoreShape = { byWorkId: {}, aliasToWorkId: {} };
let hydrated = false;

function nowIso(): string {
  return new Date().toISOString();
}

function readStorage(): StoreShape | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed?.byWorkId || !parsed?.aliasToWorkId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(store: StoreShape): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  const fromDisk = readStorage();
  if (fromDisk) memory = fromDisk;
}

function persist(): void {
  writeStorage(memory);
}

export function resetWorkIdentityStoreForTests(): void {
  memory = { byWorkId: {}, aliasToWorkId: {} };
  hydrated = true;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function getWorkIdentity(
  workId: CanonicalWorkId,
): WorkIdentityRecord | null {
  ensureHydrated();
  return memory.byWorkId[workId] ?? null;
}

export function lookupAlias(alias: string): CanonicalWorkId | null {
  ensureHydrated();
  const key = alias.trim();
  if (!key) return null;
  return memory.aliasToWorkId[key] ?? null;
}

export function putWorkIdentity(record: WorkIdentityRecord): void {
  ensureHydrated();
  memory.byWorkId[record.workId] = record;
  memory.aliasToWorkId[record.workId] = record.workId;
  for (const alias of record.aliases) {
    if (alias.trim()) memory.aliasToWorkId[alias.trim()] = record.workId;
  }
  persist();
}

export function registerAliasInStore(
  workId: CanonicalWorkId,
  alias: string,
  _kind: WorkIdAliasKind,
): void {
  ensureHydrated();
  const a = alias.trim();
  if (!a || !workId.trim()) return;
  const existing = memory.byWorkId[workId];
  const ts = nowIso();
  if (!existing) {
    putWorkIdentity({
      workId,
      origin: "migration",
      workTypeId: null,
      aliases: a === workId ? [] : [a],
      createdAt: ts,
      updatedAt: ts,
    });
    return;
  }
  if (a === workId || existing.aliases.includes(a)) {
    memory.aliasToWorkId[a] = workId;
    persist();
    return;
  }
  putWorkIdentity({
    ...existing,
    aliases: [...existing.aliases, a],
    updatedAt: ts,
  });
}

export function createIdentityRecord(input: {
  workId: CanonicalWorkId;
  origin: WorkOrigin;
  workTypeId?: string | null;
  aliases?: readonly string[];
}): WorkIdentityRecord {
  const ts = nowIso();
  const aliases = (input.aliases ?? []).filter(
    (a) => a.trim() && a.trim() !== input.workId,
  );
  const record: WorkIdentityRecord = {
    workId: input.workId,
    origin: input.origin,
    workTypeId: input.workTypeId ?? null,
    aliases,
    createdAt: ts,
    updatedAt: ts,
  };
  putWorkIdentity(record);
  return record;
}

export function listWorkIdentities(): WorkIdentityRecord[] {
  ensureHydrated();
  return Object.values(memory.byWorkId);
}
