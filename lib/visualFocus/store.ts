import type { VisualFocusMap, VisualFocusMode } from "./types";
import type { VisualFocusSaveDestinationId } from "./types";
import { normalizeBusinessCanvasWorkflow } from "./businessCanvas/workflowTypes";
import { beginVisualThinkingSession } from "./companionIntelligence";
import { captureVisualThinkingLifecycleEvent } from "./companionIntelligence/lifecycleLearning";
import { createBusinessCanvasVersionRecord } from "./businessCanvas/impactModel/versionReadiness";
import { createVisualFocusMap } from "./templates";
import type { CreateVisualFocusMapOptions } from "./templates";
import {
  applyMapSnapshot,
  createMapSnapshot,
  formatVersionLabel,
  isActiveLifecycleMap,
  isArchivedLifecycleMap,
  newVersionId,
  normalizeLifecycleStatus,
} from "./lifecycle";

const STORE_KEY = "companion-visual-focus-maps-v1";
const PENDING_OPEN_KEY = "companion-visual-focus-pending-open-v1";
export const VISUAL_FOCUS_UPDATED = "companion-visual-focus-updated";
/** Studio hub only — maps open only via explicit user action or pending open. */
export const VISUAL_FOCUS_SHOW_STUDIO = "companion-visual-focus-show-studio";
export const VISUAL_FOCUS_OPEN_REQUESTED = "companion-visual-focus-open-requested";

export type VisualFocusPendingOpen = {
  mapId: string;
  preferGenerated: boolean;
};

type Store = {
  maps: VisualFocusMap[];
  activeMapId: string | null;
};

function normalizeMap(map: VisualFocusMap): VisualFocusMap {
  const base = {
    ...map,
    workflowStage: map.workflowStage ?? (map.generatedAt ? "generated" : "build"),
    saveStatus: map.saveStatus ?? "saved",
    pinned: map.pinned ?? false,
    intentionallySaved: map.intentionallySaved ?? false,
    lifecycleStatus: normalizeLifecycleStatus(map),
    versions: map.versions ?? [],
  };
  if (map.mode === "business-canvas") {
    return {
      ...base,
      businessCanvasWorkflow: normalizeBusinessCanvasWorkflow(
        map.businessCanvasWorkflow,
        base.workflowStage === "generated",
      ),
    };
  }
  return base;
}

function readStore(): Store {
  if (typeof window === "undefined") return { maps: [], activeMapId: null };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { maps: [], activeMapId: null };
    const parsed = JSON.parse(raw) as Partial<Store>;
    const maps = Array.isArray(parsed.maps)
      ? parsed.maps.map((m) => normalizeMap(m as VisualFocusMap))
      : [];
    return {
      maps,
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

export function listActiveVisualFocusMaps(): VisualFocusMap[] {
  return listVisualFocusMaps().filter(isActiveLifecycleMap);
}

export function listArchivedVisualFocusMaps(): VisualFocusMap[] {
  return listVisualFocusMaps().filter(isArchivedLifecycleMap);
}

export function getVisualFocusMapById(id: string): VisualFocusMap | null {
  return readStore().maps.find((m) => m.id === id) ?? null;
}

export function getActiveVisualFocusMap(): VisualFocusMap | null {
  const store = readStore();
  if (!store.activeMapId) return null;
  return store.maps.find((m) => m.id === store.activeMapId) ?? null;
}

/** Leave studio hub without an implied open map. */
export function clearActiveVisualFocusMapSelection(): void {
  const store = readStore();
  if (!store.activeMapId) return;
  writeStore({ ...store, activeMapId: null });
}

export function saveVisualFocusMap(
  map: VisualFocusMap,
  options?: { saveStatus?: VisualFocusMap["saveStatus"] },
): VisualFocusMap {
  const store = readStore();
  const now = new Date().toISOString();
  const next = normalizeMap({
    ...map,
    updatedAt: now,
    saveStatus: options?.saveStatus ?? map.saveStatus ?? "saved",
    lastSavedAt: now,
  });
  const maps = store.maps.some((m) => m.id === next.id)
    ? store.maps.map((m) => (m.id === next.id ? next : m))
    : [...store.maps, next];
  writeStore({ maps, activeMapId: next.id });
  return next;
}

export function markVisualFocusMapSaving(map: VisualFocusMap): VisualFocusMap {
  return saveVisualFocusMap({ ...map, saveStatus: "saving" });
}

export function createAndActivateMap(
  mode: VisualFocusMode,
  purposeAnswerOrOptions?: string | CreateVisualFocusMapOptions,
): VisualFocusMap {
  const map = createVisualFocusMap(mode, purposeAnswerOrOptions);
  const store = readStore();
  const next = { ...map, saveStatus: "saved" as const, workflowStage: "build" as const };
  writeStore({
    maps: [...store.maps, next],
    activeMapId: map.id,
  });
  beginVisualThinkingSession(next);
  return next;
}

export function duplicateVisualFocusMap(id: string): VisualFocusMap | null {
  const store = readStore();
  const source = store.maps.find((m) => m.id === id);
  if (!source) return null;
  const now = new Date().toISOString();
  const copy: VisualFocusMap = {
    ...JSON.parse(JSON.stringify(source)) as VisualFocusMap,
    id: `vf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: `${source.title} (copy)`,
    createdAt: now,
    updatedAt: now,
    lastSavedAt: now,
    saveStatus: "saved",
    lifecycleStatus: "active",
    archivedAt: undefined,
    versions: [],
    currentVersionId: undefined,
  };
  writeStore({
    maps: [...store.maps, copy],
    activeMapId: copy.id,
  });
  captureVisualThinkingLifecycleEvent(copy, "map_duplicated", {
    source_map_id: source.id,
  });
  return copy;
}

export function renameVisualFocusMap(id: string, title: string): VisualFocusMap | null {
  const store = readStore();
  const map = store.maps.find((m) => m.id === id);
  if (!map) return null;
  const renamed = saveVisualFocusMap({ ...map, title: title.trim() || map.title });
  captureVisualThinkingLifecycleEvent(renamed, "map_renamed");
  return renamed;
}

export function setActiveVisualFocusMap(id: string): void {
  const store = readStore();
  if (!store.maps.some((m) => m.id === id)) return;
  writeStore({ ...store, activeMapId: id });
}

/** Permanent removal — learning metadata retained anonymously. */
export function deleteVisualFocusMap(id: string): void {
  const store = readStore();
  const map = store.maps.find((m) => m.id === id);
  if (map) {
    captureVisualThinkingLifecycleEvent(map, "map_deleted", {
      version_count: map.versions?.length ?? 0,
      was_archived: map.lifecycleStatus === "archived",
    });
  }
  const maps = store.maps.filter((m) => m.id !== id);
  writeStore({
    maps,
    activeMapId: store.activeMapId === id ? null : store.activeMapId,
  });
}

export function archiveVisualFocusMap(id: string): VisualFocusMap | null {
  const store = readStore();
  const map = store.maps.find((m) => m.id === id);
  if (!map) return null;
  const now = new Date().toISOString();
  const archived = saveVisualFocusMap({
    ...map,
    lifecycleStatus: "archived",
    archivedAt: now,
    intentionallySaved: true,
    saveDestination: map.saveDestination ?? "visual-thinking",
  });
  captureVisualThinkingLifecycleEvent(archived, "map_archived");
  return archived;
}

export function unarchiveVisualFocusMap(id: string): VisualFocusMap | null {
  const store = readStore();
  const map = store.maps.find((m) => m.id === id);
  if (!map || map.lifecycleStatus !== "archived") return null;
  const restored = saveVisualFocusMap({
    ...map,
    lifecycleStatus: "active",
    archivedAt: undefined,
  });
  captureVisualThinkingLifecycleEvent(restored, "map_unarchived");
  return restored;
}

export function saveVisualFocusMapVersion(
  id: string,
  labelSuffix?: string,
): VisualFocusMap | null {
  const store = readStore();
  const map = store.maps.find((m) => m.id === id);
  if (!map) return null;
  const now = new Date().toISOString();
  const version = {
    id: newVersionId(),
    label: formatVersionLabel(
      now,
      labelSuffix ?? (map.versions?.length ? "Version" : "Initial Version"),
    ),
    savedAt: now,
    snapshot: createMapSnapshot(map),
  };
  const versions = [...(map.versions ?? []), version];
  const updated = saveVisualFocusMap({
    ...map,
    versions,
    currentVersionId: version.id,
    intentionallySaved: true,
    saveDestination: map.saveDestination ?? "visual-thinking",
  });
  if (map.mode === "business-canvas" && map.businessCanvas) {
    const bcRecord = createBusinessCanvasVersionRecord({
      map: updated,
      versionName: version.label,
      createdFrom: "manual",
      canvasData: map.businessCanvas,
    });
    if (bcRecord) {
      captureVisualThinkingLifecycleEvent(updated, "map_version_saved", {
        version_count: versions.length,
        business_canvas_version: true,
      });
      return saveVisualFocusMap({
        ...updated,
        businessCanvasVersionRecords: [
          bcRecord,
          ...(map.businessCanvasVersionRecords ?? []),
        ].slice(0, 20),
      });
    }
  }
  captureVisualThinkingLifecycleEvent(updated, "map_version_saved", {
    version_count: versions.length,
  });
  return updated;
}

export function restoreVisualFocusMapVersion(
  mapId: string,
  versionId: string,
): VisualFocusMap | null {
  const store = readStore();
  const map = store.maps.find((m) => m.id === mapId);
  if (!map) return null;
  const target = map.versions?.find((v) => v.id === versionId);
  if (!target) return null;

  const now = new Date().toISOString();
  const preRestoreVersion = {
    id: newVersionId(),
    label: formatVersionLabel(now, "Pre-restore snapshot"),
    savedAt: now,
    snapshot: createMapSnapshot(map),
  };
  const restored = applyMapSnapshot(map, target.snapshot);
  const versions = [...(map.versions ?? []), preRestoreVersion];
  const updated = saveVisualFocusMap({
    ...restored,
    versions,
    currentVersionId: versionId,
  });
  captureVisualThinkingLifecycleEvent(updated, "map_version_restored", {
    restored_version_id: versionId,
    version_count: versions.length,
  });
  return updated;
}

export function listPinnedVisualFocusMaps(): VisualFocusMap[] {
  return listVisualFocusMaps().filter((m) => m.pinned);
}

export function listSavedVisualFocusMaps(): VisualFocusMap[] {
  return listVisualFocusMaps().filter(
    (m) =>
      m.pinned ||
      m.intentionallySaved ||
      m.lifecycleStatus === "archived" ||
      m.lifecycleStatus === "completed",
  );
}

export function togglePinVisualFocusMap(id: string): VisualFocusMap | null {
  const store = readStore();
  const map = store.maps.find((m) => m.id === id);
  if (!map) return null;
  return saveVisualFocusMap({ ...map, pinned: !map.pinned });
}

export function saveVisualFocusMapToDestination(
  id: string,
  destination: VisualFocusSaveDestinationId,
): VisualFocusMap | null {
  const store = readStore();
  const map = store.maps.find((m) => m.id === id);
  if (!map) return null;
  return saveVisualFocusMap({
    ...map,
    intentionallySaved: true,
    saveDestination: destination,
  });
}

export function queueVisualFocusOpen(
  mapId: string,
  preferGenerated = true,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    const payload: VisualFocusPendingOpen = { mapId, preferGenerated };
    sessionStorage.setItem(PENDING_OPEN_KEY, JSON.stringify(payload));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(VISUAL_FOCUS_OPEN_REQUESTED, { detail: payload }),
      );
    }
  } catch {
    /* ignore */
  }
}

export function peekVisualFocusPendingOpen(): VisualFocusPendingOpen | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_OPEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisualFocusPendingOpen;
  } catch {
    return null;
  }
}

export function requestVisualFocusStudio(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(VISUAL_FOCUS_SHOW_STUDIO));
  }
}

export function consumeVisualFocusOpen(): VisualFocusPendingOpen | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_OPEN_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_OPEN_KEY);
    return JSON.parse(raw) as VisualFocusPendingOpen;
  } catch {
    return null;
  }
}

