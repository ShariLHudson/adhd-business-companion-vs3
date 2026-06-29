/**
 * Asset Library store — one copy per asset, many references elsewhere.
 */

import type { AssetCategory, AssetRecord, AssetReference } from "./types";

const ASSETS_KEY = "companion-asset-library-v1";
const REFS_KEY = "companion-asset-library-refs-v1";

export const ASSET_LIBRARY_UPDATED_EVENT = "companion-asset-library-updated";

function newAssetId(): string {
  return `ast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function newRefId(): string {
  return `aref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAssets(): AssetRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ASSETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is AssetRecord =>
        a && typeof a.id === "string" && typeof a.url === "string",
    );
  } catch {
    return [];
  }
}

function writeAssets(list: AssetRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(ASSET_LIBRARY_UPDATED_EVENT));
  } catch {
    /* quota */
  }
}

function readRefs(): AssetReference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REFS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is AssetReference =>
        r && typeof r.id === "string" && typeof r.assetId === "string",
    );
  } catch {
    return [];
  }
}

function writeRefs(list: AssetReference[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REFS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(ASSET_LIBRARY_UPDATED_EVENT));
  } catch {
    /* quota */
  }
}

export function getAssetRecords(): AssetRecord[] {
  return readAssets().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAssetById(id: string): AssetRecord | null {
  return readAssets().find((a) => a.id === id) ?? null;
}

export function findAssetByContentHash(hash: string): AssetRecord | null {
  if (!hash) return null;
  return readAssets().find((a) => a.contentHash === hash) ?? null;
}

export type CreateAssetInput = {
  filename: string;
  title?: string;
  description?: string;
  tags?: string[];
  category: AssetCategory;
  mimeType: string;
  url: string;
  contentHash?: string;
};

export function createAssetRecord(input: CreateAssetInput): AssetRecord {
  const now = new Date().toISOString();
  const asset: AssetRecord = {
    id: newAssetId(),
    filename: input.filename,
    title: input.title?.trim() || input.filename,
    description: input.description?.trim() || "",
    tags: input.tags ?? [],
    category: input.category,
    mimeType: input.mimeType,
    url: input.url,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    contentHash: input.contentHash,
  };
  writeAssets([asset, ...readAssets()]);
  return asset;
}

export function updateAssetRecord(
  id: string,
  patch: Partial<
    Pick<AssetRecord, "title" | "description" | "tags" | "favorite" | "category">
  >,
): AssetRecord | null {
  const list = readAssets();
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const updated: AssetRecord = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  writeAssets(list);
  return updated;
}

export function deleteAssetRecord(id: string): void {
  writeAssets(readAssets().filter((a) => a.id !== id));
  writeRefs(readRefs().filter((r) => r.assetId !== id));
}

export function getAssetReferences(assetId?: string): AssetReference[] {
  const refs = readRefs();
  if (!assetId) return refs;
  return refs.filter((r) => r.assetId === assetId);
}

export function getReferencesForRecord(
  recordId: string,
  recordKind?: AssetReference["recordKind"],
): AssetReference[] {
  return readRefs().filter(
    (r) =>
      r.recordId === recordId &&
      (recordKind == null || r.recordKind === recordKind),
  );
}

export function addAssetReference(input: {
  assetId: string;
  recordId: string;
  recordKind: AssetReference["recordKind"];
  recordObjectKind?: AssetReference["recordObjectKind"];
}): AssetReference {
  const existing = readRefs().find(
    (r) =>
      r.assetId === input.assetId &&
      r.recordId === input.recordId &&
      r.recordKind === input.recordKind,
  );
  if (existing) return existing;

  const ref: AssetReference = {
    id: newRefId(),
    assetId: input.assetId,
    recordId: input.recordId,
    recordKind: input.recordKind,
    recordObjectKind: input.recordObjectKind,
    createdAt: new Date().toISOString(),
  };
  writeRefs([ref, ...readRefs()]);
  return ref;
}

export function removeReferencesForRecord(recordId: string): void {
  writeRefs(readRefs().filter((r) => r.recordId !== recordId));
}

export function getReferencedAssetIds(recordId: string): string[] {
  return getReferencesForRecord(recordId).map((r) => r.assetId);
}

export function getUnattachedAssets(): AssetRecord[] {
  const referenced = new Set(readRefs().map((r) => r.assetId));
  return getAssetRecords().filter((a) => !referenced.has(a.id));
}

export function getRecentlyUploadedAssets(limit = 20): AssetRecord[] {
  return getAssetRecords().slice(0, limit);
}

export function getAssetsByCategory(category: AssetCategory): AssetRecord[] {
  return getAssetRecords().filter((a) => a.category === category);
}

export function getFavoriteAssets(): AssetRecord[] {
  return getAssetRecords().filter((a) => a.favorite);
}
