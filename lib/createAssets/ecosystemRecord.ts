/**
 * 047 — Living creation ecosystem attached to one Creation Record
 */

import { getCreateAssetById, listCreateAssets } from "./assetRegistry";
import { getCreationEcosystemForBlueprint } from "./ecosystems";
import { connectGeneratedAssetToEcosystem } from "@/lib/creationEcosystem/connectAsset";
import type {
  CreationAssetInstance,
  CreationEcosystemRecord,
} from "./types";

const STORAGE_KEY = "companion-creation-ecosystem-v1";

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readAll(): CreationEcosystemRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreationEcosystemRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: CreationEcosystemRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* quota */
  }
}

export function listCreationEcosystemRecords(): CreationEcosystemRecord[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getCreationEcosystemRecord(
  id: string,
): CreationEcosystemRecord | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function findEcosystemByEventRecord(
  eventRecordId: string,
): CreationEcosystemRecord | null {
  return readAll().find((r) => r.eventRecordId === eventRecordId) ?? null;
}

export function findEcosystemByCanonicalWork(
  canonicalWorkId: string,
): CreationEcosystemRecord | null {
  return readAll().find((r) => r.canonicalWorkId === canonicalWorkId) ?? null;
}

export function upsertCreationEcosystemRecord(
  record: CreationEcosystemRecord,
): CreationEcosystemRecord {
  const next = { ...record, updatedAt: new Date().toISOString() };
  writeAll([next, ...readAll().filter((r) => r.id !== next.id)]);
  return next;
}

/**
 * Start ecosystem for a blueprint — primary asset instance only (not a dump).
 */
export function startCreationEcosystem(input: {
  blueprintId: string;
  title: string;
  canonicalWorkId?: string | null;
  projectHomeId?: string | null;
  eventRecordId?: string | null;
}): CreationEcosystemRecord | null {
  const existing = input.eventRecordId
    ? findEcosystemByEventRecord(input.eventRecordId)
    : input.canonicalWorkId
      ? findEcosystemByCanonicalWork(input.canonicalWorkId)
      : null;
  if (existing) return existing;

  const eco = getCreationEcosystemForBlueprint(input.blueprintId);
  if (!eco) return null;

  const now = new Date().toISOString();
  const primary = getCreateAssetById(eco.primaryAssetId);
  const instances: CreationAssetInstance[] = primary
    ? [
        {
          assetId: primary.id,
          label: primary.name,
          status: "drafting",
          createdAt: now,
          updatedAt: now,
        },
      ]
    : [];

  const started = upsertCreationEcosystemRecord({
    id: newId("eco"),
    ecosystemId: eco.id,
    blueprintId: input.blueprintId,
    title: input.title,
    canonicalWorkId: input.canonicalWorkId ?? null,
    projectHomeId: input.projectHomeId ?? null,
    eventRecordId: input.eventRecordId ?? null,
    completedSignals: ["ecosystem_started"],
    instances,
    createdAt: now,
    updatedAt: now,
  });

  // 049 — primary asset is never an orphan
  if (primary) {
    connectGeneratedAssetToEcosystem({
      ecosystem: started,
      assetDefId: primary.id,
      createdBy: primary.primaryChamberMemberId ?? "events",
    });
  }

  return started;
}

export function mergeEcosystemSignals(
  record: CreationEcosystemRecord,
  signals: readonly string[],
): CreationEcosystemRecord {
  const completedSignals = [
    ...new Set([...record.completedSignals, ...signals]),
  ];
  return upsertCreationEcosystemRecord({ ...record, completedSignals });
}

export function setPendingSuggestions(
  record: CreationEcosystemRecord,
  assetIds: readonly string[],
): CreationEcosystemRecord {
  return upsertCreationEcosystemRecord({
    ...record,
    pendingSuggestionIds: [...assetIds],
  });
}

/**
 * One-click generate — creates a connected asset instance (builder scaffold).
 * Never invents tasks unless projectWorkMode requires later confirmation.
 */
export function acceptGeneratedAsset(
  record: CreationEcosystemRecord,
  assetId: string,
): CreationEcosystemRecord {
  const def = getCreateAssetById(assetId);
  if (!def) return record;
  if (record.instances.some((i) => i.assetId === assetId)) return record;

  const now = new Date().toISOString();
  const instance: CreationAssetInstance = {
    assetId,
    label: def.name,
    status: "drafting",
    createdAt: now,
    updatedAt: now,
  };

  const pending = (record.pendingSuggestionIds ?? []).filter(
    (id) => id !== assetId,
  );

  const next = upsertCreationEcosystemRecord({
    ...record,
    instances: [...record.instances, instance],
    pendingSuggestionIds: pending,
  });

  // 049 — connect into Relationship Registry (never orphan)
  connectGeneratedAssetToEcosystem({
    ecosystem: next,
    assetDefId: assetId,
    createdBy: def.primaryChamberMemberId ?? "events",
  });

  return next;
}

/**
 * Resolve named / explicit accept from pending suggestions or registry names.
 * Bare "yes" alone is never enough while foundation Q&A may still be open —
 * callers pass `allowBareYes` only when no active foundation question.
 */
export function resolveAssetAcceptFromUserText(
  record: CreationEcosystemRecord,
  userText: string,
  options?: { allowBareYes?: boolean },
): string | null {
  const lower = userText.trim().toLowerCase();
  if (!lower) return null;

  const pending = record.pendingSuggestionIds ?? [];

  const named = (assetId: string): boolean => {
    const def = getCreateAssetById(assetId);
    if (!def) return false;
    const name = def.name.toLowerCase();
    const short = name.replace(
      /\s+(form|worksheet|notes|list|packet|email|guide|plan|checklist)$/i,
      "",
    );
    return (
      lower.includes(name) ||
      lower.includes(short) ||
      lower.includes(assetId.replace(/^asset-/, "").replace(/-/g, " "))
    );
  };

  for (const id of pending) {
    if (named(id)) return id;
  }

  // Explicit build-one phrasing → first pending
  if (
    pending.length &&
    /\b(?:build one|create (?:it|one|that)|make (?:it|one|that)|do (?:it|that)|yes,? (?:build|create|make))\b/i.test(
      lower,
    )
  ) {
    return pending[0] ?? null;
  }

  if (
    options?.allowBareYes &&
    pending.length &&
    /^(yes|yeah|yep|sure|ok|okay|please)\.?$/i.test(lower)
  ) {
    return pending[0] ?? null;
  }

  // Named asset with build/create verb (even without pending)
  if (/\b(?:build|create|make|generate)\b/i.test(lower)) {
    for (const a of listCreateAssets()) {
      if (named(a.id) && !record.instances.some((i) => i.assetId === a.id)) {
        return a.id;
      }
    }
  }

  return null;
}
