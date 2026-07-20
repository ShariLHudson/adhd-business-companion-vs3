/**
 * Universal navigation stack — sessionStorage, TTL, push/pop/jump/clear.
 */

import {
  NAVIGATION_STACK_CHANGE_EVENT,
  NAVIGATION_STACK_MAX_DEPTH,
  NAVIGATION_STACK_STORAGE_KEY,
  NAVIGATION_STACK_TTL_MS,
  type NavigationFrame,
  type NavigationFrameKind,
  type NavigationStackState,
} from "./types";
import { labelForDestinationId } from "./destinationLabels";

let memoryStack: NavigationStackState = { frames: [] };

function canUseStorage(): boolean {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage != null;
  } catch {
    return false;
  }
}

function notify(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NAVIGATION_STACK_CHANGE_EVENT));
  }
}

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isFrameExpired(frame: NavigationFrame, now: number): boolean {
  const exp = Date.parse(frame.expiresAt);
  return !Number.isFinite(exp) || exp <= now;
}

function pruneExpired(
  state: NavigationStackState,
  now = Date.now(),
): NavigationStackState {
  return {
    ...state,
    frames: state.frames.filter((f) => !isFrameExpired(f, now)),
  };
}

function persist(state: NavigationStackState): void {
  memoryStack = state;
  if (!canUseStorage()) return;
  try {
    sessionStorage.setItem(NAVIGATION_STACK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function getNavigationStack(now = Date.now()): NavigationStackState {
  let state: NavigationStackState = { frames: [] };
  if (canUseStorage()) {
    try {
      const raw = sessionStorage.getItem(NAVIGATION_STACK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as NavigationStackState;
        if (parsed && Array.isArray(parsed.frames)) {
          state = parsed;
        }
      } else {
        // Storage cleared externally (tests / logout) — drop memory too.
        memoryStack = { frames: [] };
      }
    } catch {
      state = memoryStack;
    }
  } else {
    state = memoryStack;
  }
  const pruned = pruneExpired(state, now);
  if (
    pruned.frames.length !== state.frames.length ||
    pruned.current !== state.current
  ) {
    persist(pruned);
  } else {
    memoryStack = pruned;
  }
  return {
    frames: pruned.frames.map((f) => ({ ...f })),
    current: pruned.current ? { ...pruned.current } : undefined,
  };
}

export function createNavigationFrame(
  input: Omit<NavigationFrame, "id" | "openedAt" | "expiresAt" | "label"> & {
    label?: string;
  },
): NavigationFrame {
  const now = Date.now();
  return {
    id: uid(),
    destinationId: input.destinationId,
    label: input.label ?? labelForDestinationId(input.destinationId),
    kind: input.kind,
    tab: input.tab,
    section: input.section,
    accordion: input.accordion,
    step: input.step,
    selectedId: input.selectedId,
    scrollY: input.scrollY,
    editingFieldId: input.editingFieldId,
    draftKey: input.draftKey,
    filters: input.filters,
    sort: input.sort,
    search: input.search,
    meta: input.meta,
    openedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + NAVIGATION_STACK_TTL_MS).toISOString(),
  };
}

/** Push origin frame before navigating to a nested/opened destination. */
export function pushNavigationFrame(
  input: Omit<NavigationFrame, "id" | "openedAt" | "expiresAt" | "label"> & {
    label?: string;
  },
  current?: NavigationStackState["current"],
): NavigationStackState {
  const state = getNavigationStack();
  const frame = createNavigationFrame(input);
  let frames = [...state.frames, frame];
  if (frames.length > NAVIGATION_STACK_MAX_DEPTH) {
    frames = frames.slice(frames.length - NAVIGATION_STACK_MAX_DEPTH);
  }
  const next: NavigationStackState = {
    frames,
    current: current ?? state.current,
  };
  persist(next);
  notify();
  return getNavigationStack();
}

export function setNavigationCurrent(current: {
  destinationId: string;
  label?: string;
  kind: NavigationFrameKind;
}): NavigationStackState {
  const state = getNavigationStack();
  const next: NavigationStackState = {
    ...state,
    current: {
      destinationId: current.destinationId,
      label: current.label ?? labelForDestinationId(current.destinationId),
      kind: current.kind,
    },
  };
  persist(next);
  notify();
  return getNavigationStack();
}

export function peekNavigationFrame(): NavigationFrame | null {
  const { frames } = getNavigationStack();
  return frames[frames.length - 1] ?? null;
}

export function peekNavigationOriginLabel(): string | null {
  return peekNavigationFrame()?.label ?? null;
}

/** Pop one level — returns the frame to restore, or null. */
export function popNavigationFrame(): NavigationFrame | null {
  const state = getNavigationStack();
  if (state.frames.length === 0) return null;
  const frame = state.frames[state.frames.length - 1]!;
  const next: NavigationStackState = {
    frames: state.frames.slice(0, -1),
    current: {
      destinationId: frame.destinationId,
      label: frame.label,
      kind: frame.kind,
    },
  };
  persist(next);
  notify();
  return { ...frame };
}

/**
 * Jump to stack index (inclusive) — truncates frames above index,
 * returns the frame at that index to restore.
 */
export function jumpToNavigationIndex(index: number): NavigationFrame | null {
  const state = getNavigationStack();
  if (index < 0 || index >= state.frames.length) return null;
  const frame = state.frames[index]!;
  const next: NavigationStackState = {
    frames: state.frames.slice(0, index),
    current: {
      destinationId: frame.destinationId,
      label: frame.label,
      kind: frame.kind,
    },
  };
  persist(next);
  notify();
  return { ...frame };
}

export function clearNavigationStack(): void {
  persist({ frames: [] });
  notify();
}

/** True when leave from a Living Place should restore a destination (not Welcome Home). */
export function hasDestinationOriginBeneath(): boolean {
  const top = peekNavigationFrame();
  if (!top) return false;
  return top.kind === "destination" || top.kind === "nested" || top.kind === "overlay";
}

export function subscribeNavigationStack(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => listener();
  window.addEventListener(NAVIGATION_STACK_CHANGE_EVENT, onChange);
  window.addEventListener("storage", (event) => {
    if (event.key === NAVIGATION_STACK_STORAGE_KEY) onChange();
  });
  return () => window.removeEventListener(NAVIGATION_STACK_CHANGE_EVENT, onChange);
}

export function clearNavigationStackForTests(): void {
  memoryStack = { frames: [] };
  clearNavigationStack();
}
