import { getAssetRecords, getAssetReferences } from "./assetLibraryStore";
import type { AssetRecord, AssetSearchFilters } from "./types";

function matchesQuery(asset: AssetRecord, query: string): boolean {
  const q = query.toLowerCase();
  if (asset.filename.toLowerCase().includes(q)) return true;
  if (asset.title.toLowerCase().includes(q)) return true;
  if (asset.description.toLowerCase().includes(q)) return true;
  if (asset.tags.some((t) => t.toLowerCase().includes(q))) return true;
  return false;
}

export function searchAssets(filters: AssetSearchFilters = {}): AssetRecord[] {
  let pool = getAssetRecords();

  if (filters.category) {
    pool = pool.filter((a) => a.category === filters.category);
  }
  if (filters.favorite) {
    pool = pool.filter((a) => a.favorite);
  }
  if (filters.recordKind && filters.recordId) {
    const refs = getAssetReferences().filter(
      (r) =>
        r.recordKind === filters.recordKind && r.recordId === filters.recordId,
    );
    const ids = new Set(refs.map((r) => r.assetId));
    pool = pool.filter((a) => ids.has(a.id));
  } else if (filters.recordId) {
    const refs = getAssetReferences().filter(
      (r) => r.recordId === filters.recordId,
    );
    const ids = new Set(refs.map((r) => r.assetId));
    pool = pool.filter((a) => ids.has(a.id));
  }
  if (filters.unattachedOnly) {
    const referenced = new Set(getAssetReferences().map((r) => r.assetId));
    pool = pool.filter((a) => !referenced.has(a.id));
  }
  if (filters.query?.trim()) {
    pool = pool.filter((a) => matchesQuery(a, filters.query!.trim()));
  }

  return pool;
}
