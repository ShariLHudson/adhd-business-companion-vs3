/**
 * Global estate room scene transitions — hold outgoing plate until incoming is ready.
 *
 * @see docs/estate/PHASE_D_UNIFIED_ESTATE_SHELL.md (EstateSceneLayer)
 */

import { estateEntryIdForSection } from "@/lib/estateMemory/estateSectionMap";
import { resolveEstateRoomBackgroundImage } from "@/lib/estate/estateRoomBackground";
import type { AppSection } from "@/lib/companionUi";
import {
  awaitRoomBackgroundReady,
  preloadRoomBackground,
} from "@/lib/roomBackgroundPreload";

export type EstateScenePlate = {
  roomId: string;
  imageUrl: string;
};

export type EstateSceneTransitionPhase =
  | "idle"
  | "preparing"
  | "crossfading"
  | "ready";

export type EstateSceneTransitionState = {
  /** Last fully visible plate */
  active: EstateScenePlate | null;
  /** Outgoing plate during crossfade */
  outgoing: EstateScenePlate | null;
  /** Incoming plate loading or fading in */
  incoming: EstateScenePlate | null;
  phase: EstateSceneTransitionPhase;
  preparingVisible: boolean;
  /** contain = full room plate (Change background); cover = cinematic crop */
  plateObjectFit: "contain" | "cover";
};

const CROSSFADE_MS = 620;
const PREPARING_DELAY_MS = 480;

let state: EstateSceneTransitionState = {
  active: null,
  outgoing: null,
  incoming: null,
  phase: "idle",
  preparingVisible: false,
  plateObjectFit: "cover",
};

const listeners = new Set<() => void>();
let preparingTimer: ReturnType<typeof setTimeout> | null = null;
let crossfadeTimer: ReturnType<typeof setTimeout> | null = null;
let transitionGeneration = 0;

function notify() {
  for (const listener of listeners) listener();
}

function clearTimers() {
  if (preparingTimer) {
    clearTimeout(preparingTimer);
    preparingTimer = null;
  }
  if (crossfadeTimer) {
    clearTimeout(crossfadeTimer);
    crossfadeTimer = null;
  }
}

function commitIncoming() {
  if (!state.incoming) return;
  state = {
    active: state.incoming,
    outgoing: null,
    incoming: null,
    phase: "ready",
    preparingVisible: false,
    plateObjectFit: state.plateObjectFit,
  };
  notify();
}

function startCrossfade() {
  state = {
    ...state,
    outgoing: state.active,
    phase: "crossfading",
    preparingVisible: false,
  };
  notify();

  crossfadeTimer = setTimeout(() => {
    commitIncoming();
    crossfadeTimer = null;
  }, CROSSFADE_MS);
}

export function getEstateSceneTransitionState(): EstateSceneTransitionState {
  return state;
}

export function subscribeEstateSceneTransition(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Register the visible room plate without a transition (e.g. Welcome Home on first paint). */
export function syncEstateSceneActivePlate(input: {
  toRoomId?: string;
  imageUrl: string;
}): void {
  const roomId = input.toRoomId ?? "estate";
  const imageUrl = input.imageUrl;
  if (!imageUrl) return;
  if (state.active?.imageUrl === imageUrl && state.phase === "ready") return;
  if (state.phase === "preparing" || state.phase === "crossfading") return;

  clearTimers();
  state = {
    active: { roomId, imageUrl },
    outgoing: null,
    incoming: null,
    phase: "ready",
    preparingVisible: false,
    plateObjectFit: state.plateObjectFit,
  };
  notify();
}

export function resolveScenePlateForSection(
  section: AppSection,
): EstateScenePlate | null {
  const roomId = estateEntryIdForSection(section) ?? section;
  const imageUrl = resolveEstateRoomBackgroundImage(roomId);
  if (!imageUrl) return null;
  return { roomId, imageUrl };
}

/** Preload destination art and update the persistent scene layer. */
export async function prepareEstateSceneTransition(input: {
  toSection?: AppSection;
  toRoomId?: string;
  imageUrl?: string | null;
  /** Skip "Preparing the room…" status — use for in-place environment swaps. */
  silent?: boolean;
  /** Show the full room plate without cropping (Change background). */
  showFullPlate?: boolean;
}): Promise<void> {
  const roomId =
    input.toRoomId ??
    (input.toSection ? estateEntryIdForSection(input.toSection) : null) ??
    input.toSection ??
    "estate";
  const imageUrl =
    input.imageUrl ?? resolveEstateRoomBackgroundImage(roomId) ?? null;
  if (!imageUrl) return;

  if (
    state.active?.imageUrl === imageUrl &&
    state.phase !== "preparing" &&
    !state.incoming
  ) {
    return;
  }

  const generation = ++transitionGeneration;
  clearTimers();
  const plateObjectFit = input.showFullPlate ? "contain" : "cover";

  preloadRoomBackground(imageUrl);

  state = {
    ...state,
    incoming: { roomId, imageUrl },
    phase: "preparing",
    preparingVisible: false,
    plateObjectFit,
  };
  notify();

  preparingTimer = setTimeout(() => {
    if (generation !== transitionGeneration) return;
    if (state.phase === "preparing" && !input.silent) {
      state = { ...state, preparingVisible: true };
      notify();
    }
  }, PREPARING_DELAY_MS);

  const ready = await awaitRoomBackgroundReady(imageUrl);
  if (generation !== transitionGeneration) return;

  if (!ready && !state.active) {
    state = {
      active: { roomId, imageUrl },
      outgoing: null,
      incoming: null,
      phase: "ready",
      preparingVisible: false,
      plateObjectFit,
    };
    notify();
    return;
  }

  if (!ready) {
    state = {
      ...state,
      phase: "crossfading",
      preparingVisible: false,
    };
    startCrossfade();
    return;
  }

  if (state.active?.imageUrl === imageUrl) {
    state = {
      active: state.active,
      outgoing: null,
      incoming: null,
      phase: "ready",
      preparingVisible: false,
      plateObjectFit: state.plateObjectFit,
    };
    notify();
    return;
  }

  if (!state.active) {
    state = {
      active: { roomId, imageUrl },
      outgoing: null,
      incoming: null,
      phase: "ready",
      preparingVisible: false,
      plateObjectFit,
    };
    notify();
    return;
  }

  state = {
    ...state,
    incoming: { roomId, imageUrl },
    preparingVisible: false,
  };
  startCrossfade();
}

export function prepareEstateSceneTransitionFireAndForget(
  input: Parameters<typeof prepareEstateSceneTransition>[0],
): void {
  void prepareEstateSceneTransition(input);
}

export const ESTATE_SCENE_CROSSFADE_MS = CROSSFADE_MS;
