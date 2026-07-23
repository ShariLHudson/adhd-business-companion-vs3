import {
  DEFAULT_LIBRARY_PAGE_SIZE,
  type LibraryFilterId,
  type LibrarySortId,
  type LibraryUiState,
  type LibraryViewMode,
  type SparkLibraryCollectionSurface,
} from "./types";

const STORAGE_KEY = "spark.libraryUiState.v1";

type StateMap = Record<string, LibraryUiState>;

function readMap(): StateMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StateMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: StateMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

export function defaultLibraryUiState(
  surface: SparkLibraryCollectionSurface,
  defaults?: Partial<LibraryUiState>,
): LibraryUiState {
  return {
    surface,
    search: "",
    filter: "all",
    sort: "recently_updated",
    view: "comfortable",
    scrollTop: 0,
    pageSize: DEFAULT_LIBRARY_PAGE_SIZE,
    visibleCount: DEFAULT_LIBRARY_PAGE_SIZE,
    ...defaults,
  };
}

export function loadLibraryUiState(
  surface: SparkLibraryCollectionSurface,
  defaults?: Partial<LibraryUiState>,
): LibraryUiState {
  const fallback = defaultLibraryUiState(surface, defaults);
  const stored = readMap()[surface];
  if (!stored) return fallback;
  return {
    ...fallback,
    ...stored,
    surface,
    search: typeof stored.search === "string" ? stored.search : "",
    filter: (stored.filter as LibraryFilterId) || "all",
    sort: (stored.sort as LibrarySortId) || "recently_updated",
    view: (stored.view as LibraryViewMode) || "comfortable",
    pageSize: stored.pageSize || DEFAULT_LIBRARY_PAGE_SIZE,
    visibleCount: stored.visibleCount || DEFAULT_LIBRARY_PAGE_SIZE,
    scrollTop: stored.scrollTop ?? 0,
  };
}

export function saveLibraryUiState(state: LibraryUiState): void {
  const map = readMap();
  map[state.surface] = state;
  writeMap(map);
}

export function clearLibraryUiStateForTests(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
