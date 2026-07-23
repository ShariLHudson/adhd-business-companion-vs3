/**
 * Library favorites — page-local durable preference (not domain archive).
 * Storage is shared across Create/Projects library surfaces.
 */

import type { LibraryRecordKind } from "./types";

const STORAGE_KEY = "spark.libraryFavorites.v1";

type FavoritesStore = {
  creation: string[];
  project: string[];
};

function emptyStore(): FavoritesStore {
  return { creation: [], project: [] };
}

function readStore(): FavoritesStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<FavoritesStore>;
    return {
      creation: Array.isArray(parsed.creation) ? parsed.creation : [],
      project: Array.isArray(parsed.project) ? parsed.project : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: FavoritesStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

export function isLibraryFavorite(
  kind: LibraryRecordKind,
  id: string,
): boolean {
  const store = readStore();
  return store[kind].includes(id);
}

export function setLibraryFavorite(
  kind: LibraryRecordKind,
  id: string,
  favorite: boolean,
): void {
  const trimmed = id.trim();
  if (!trimmed) return;
  const store = readStore();
  const set = new Set(store[kind]);
  if (favorite) set.add(trimmed);
  else set.delete(trimmed);
  store[kind] = [...set];
  writeStore(store);
}

export function toggleLibraryFavorite(
  kind: LibraryRecordKind,
  id: string,
): boolean {
  const next = !isLibraryFavorite(kind, id);
  setLibraryFavorite(kind, id, next);
  return next;
}

export function clearLibraryFavoritesForTests(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
