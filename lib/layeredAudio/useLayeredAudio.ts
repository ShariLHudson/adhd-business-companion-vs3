"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ensureLayeredAudioStopperRegistered,
  getLayeredAudioEngine,
  getLayeredAudioSnapshot,
  subscribeLayeredAudio,
} from "./session";
import { registerEstateMediaStopper } from "@/lib/estate/stopAllAudio";
import type { LayeredAudioSnapshot } from "./types";

function subscribe(listener: () => void): () => void {
  return subscribeLayeredAudio(listener);
}

function getSnapshot(): LayeredAudioSnapshot {
  return getLayeredAudioSnapshot();
}

const EMPTY_SNAPSHOT: LayeredAudioSnapshot = {
  voice: null,
  music: null,
  environmentTracks: [],
  environmentMasterVolume: 1,
  environmentDuckingMultiplier: 1,
  musicDuckingMultiplier: 1,
  customized: false,
  activePresetId: null,
  environmentLimitMessage: null,
  higherPrioritySpeechActive: false,
};

function getServerSnapshot(): LayeredAudioSnapshot {
  return EMPTY_SNAPSHOT;
}

/** React binding — engine is module-scoped; remounts do not duplicate Audio. */
export function useLayeredAudio() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const engine = getLayeredAudioEngine();

  useEffect(() => {
    return ensureLayeredAudioStopperRegistered(registerEstateMediaStopper);
  }, []);

  return { snapshot, engine };
}

/** Lightweight open-state for the mixer panel (UI only). */
export function useLayeredAudioMixerOpen() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
