/**
 * EstateRuntimeState™ — single source of truth for cross-system runtime flags.
 * Modules read/write through this store — no duplicated mic/place/soundscape state.
 */

export type EstateRuntimeState = {
  currentPlaceId: string | null;
  activeConversationMode: boolean;
  /** Layer 2 overlay id or legacy category id when active. */
  activeSoundscape: string | null;
  micActive: boolean;
  inputBuffer: string;
};

const DEFAULT_STATE: EstateRuntimeState = {
  currentPlaceId: null,
  activeConversationMode: true,
  activeSoundscape: null,
  micActive: false,
  inputBuffer: "",
};

let runtimeState: EstateRuntimeState = { ...DEFAULT_STATE };

export function getEstateRuntimeState(): Readonly<EstateRuntimeState> {
  return runtimeState;
}

export function patchEstateRuntimeState(
  patch: Partial<EstateRuntimeState>,
): EstateRuntimeState {
  runtimeState = { ...runtimeState, ...patch };
  return runtimeState;
}

export function resetEstateRuntimeState(): EstateRuntimeState {
  runtimeState = { ...DEFAULT_STATE };
  return runtimeState;
}
