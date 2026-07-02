/**
 * Generic local collection store for collection rooms without a dedicated store yet.
 */

import type {
  EstateCollectionCaptureValues,
  EstateCollectionItem,
  EstateCollectionSaveOptions,
} from "./types";

function storageKey(roomKey: string): string {
  return `estate-collection-generic-v2-${roomKey}`;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type MapSaveOptions = {
  primaryFieldId: string;
  mapItem?: (
    capture: EstateCollectionCaptureValues,
    createdAt: string,
    id: string,
    updatedAt: string,
  ) => EstateCollectionItem | null;
};

export function createGenericCollectionStore(
  roomKey: string,
  eventName: string,
  options: MapSaveOptions,
) {
  function readAll(): EstateCollectionItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey(roomKey));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item): item is EstateCollectionItem =>
          item &&
          typeof item.id === "string" &&
          typeof item.body === "string" &&
          typeof item.createdAt === "string",
      );
    } catch {
      return [];
    }
  }

  function writeAll(items: EstateCollectionItem[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey(roomKey), JSON.stringify(items));
      window.dispatchEvent(new Event(eventName));
    } catch {
      /* noop */
    }
  }

  function listItems(): EstateCollectionItem[] {
    return readAll().sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    );
  }

  function saveItem(
    capture: EstateCollectionCaptureValues,
    saveOptions?: EstateCollectionSaveOptions,
  ): boolean {
    const now = new Date().toISOString();
    const editId = saveOptions?.editId;
    const all = readAll();

    if (editId) {
      const index = all.findIndex((item) => item.id === editId);
      if (index < 0) return false;
      const existing = all[index]!;
      const item = options.mapItem
        ? options.mapItem(capture, existing.createdAt, existing.id, now)
        : defaultMapItem(capture, existing.createdAt, existing.id, now, options.primaryFieldId);
      if (!item) return false;
      const next = [...all];
      next[index] = {
        ...item,
        favorite: existing.favorite,
        captureValues: { ...capture },
      };
      writeAll(next);
      return true;
    }

    const id = newId(roomKey);
    const item = options.mapItem
      ? options.mapItem(capture, now, id, now)
      : defaultMapItem(capture, now, id, now, options.primaryFieldId);
    if (!item) return false;
    writeAll([
      { ...item, captureValues: { ...capture } },
      ...all,
    ]);
    return true;
  }

  function removeItem(id: string): void {
    writeAll(readAll().filter((item) => item.id !== id));
  }

  function getItemCapture(id: string): EstateCollectionCaptureValues | null {
    const item = readAll().find((entry) => entry.id === id);
    if (!item) return null;
    return item.captureValues ?? null;
  }

  function toggleFavorite(id: string): void {
    writeAll(
      readAll().map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      ),
    );
  }

  return {
    eventName,
    listItems,
    saveItem,
    removeItem,
    getItemCapture,
    toggleFavorite,
  };
}

function defaultMapItem(
  capture: EstateCollectionCaptureValues,
  createdAt: string,
  id: string,
  updatedAt: string,
  primaryFieldId: string,
): EstateCollectionItem | null {
  const body = capture[primaryFieldId]?.trim();
  if (!body) return null;
  const title = capture.title?.trim() || capture.chapterTitle?.trim();
  return {
    id,
    body,
    createdAt,
    updatedAt,
    ...(title ? { title } : {}),
    ...(capture.category?.trim() ? { category: capture.category.trim() } : {}),
  };
}
