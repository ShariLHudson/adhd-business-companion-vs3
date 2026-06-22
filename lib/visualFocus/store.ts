import type { VisualFocusMap, VisualFocusMode } from "./types";
import { createVisualFocusMap } from "./templates";

const STORE_KEY = "companion-visual-focus-maps-v1";
export const VISUAL_FOCUS_UPDATED = "companion-visual-focus-updated";

type Store = {
  maps: VisualFocusMap[];
  activeMapId: string | null;
};

function readStore(): Store {
  if (typeof window === "undefined") return { maps: [], activeMapId: null };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { maps: [], activeMapId: null };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      maps: Array.isArray(parsed.maps) ? parsed.maps : [],
      activeMapId: parsed.activeMapId ?? null,
    };
  } catch {
    return { maps: [], activeMapId: null };
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(VISUAL_FOCUS_UPDATED));
  } catch {
    /* quota */
  }
}

export function listVisualFocusMaps(): VisualFocusMap[] {
  return readStore().maps;
}

export function getActiveVisualFocusMap(): VisualFocusMap | null {
  const store = readStore();
  if (!store.activeMapId) return store.maps[0] ?? null;
  return store.maps.find((m) => m.id === store.activeMapId) ?? store.maps[0] ?? null;
}

export function saveVisualFocusMap(map: VisualFocusMap): VisualFocusMap {
  const store = readStore();
  const next = {
    ...map,
    updatedAt: new Date().toISOString(),
  };
  const maps = store.maps.some((m) => m.id === next.id)
    ? store.maps.map((m) => (m.id === next.id ? next : m))
    : [...store.maps, next];
  writeStore({ maps, activeMapId: next.id });
  return next;
}

export function createAndActivateMap(mode: VisualFocusMode): VisualFocusMap {
  const map = createVisualFocusMap(mode);
  const store = readStore();
  writeStore({
    maps: [...store.maps, map],
    activeMapId: map.id,
  });
  return map;
}

export function setActiveVisualFocusMap(id: string): void {
  const store = readStore();
  if (!store.maps.some((m) => m.id === id)) return;
  writeStore({ ...store, activeMapId: id });
}

export function deleteVisualFocusMap(id: string): void {
  const store = readStore();
  const maps = store.maps.filter((m) => m.id !== id);
  writeStore({
    maps,
    activeMapId:
      store.activeMapId === id ? (maps[0]?.id ?? null) : store.activeMapId,
  });
}
