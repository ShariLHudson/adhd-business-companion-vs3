/**
 * Process-wide Layered Audio session — survives Estate route remounts.
 * Does not autoplay after refresh.
 */

import { LayeredAudioEngine } from "./engine";
import type { LayeredAudioSnapshot } from "./types";

let engine: LayeredAudioEngine | null = null;
let stopperRegistered = false;

export function getLayeredAudioEngine(): LayeredAudioEngine {
  if (!engine) {
    engine = new LayeredAudioEngine();
  }
  return engine;
}

export function subscribeLayeredAudio(listener: () => void): () => void {
  return getLayeredAudioEngine().subscribe(listener);
}

export function getLayeredAudioSnapshot(): LayeredAudioSnapshot {
  return getLayeredAudioEngine().getSnapshot();
}

export function stopLayeredAudioAll(): void {
  if (!engine) return;
  engine.stopAll();
}

/** Register once with Stop All Sound — safe to call from a host component. */
export function ensureLayeredAudioStopperRegistered(
  register: (stop: () => void) => () => void,
): () => void {
  if (stopperRegistered) {
    return () => {};
  }
  stopperRegistered = true;
  // Pause (do not clear) so Estate Sounds Off / Stop All can Turn On again
  // with the same selected mix. Explicit Remove/Change Sounds still clears tracks.
  const unregister = register(() => {
    void getLayeredAudioEngine().pauseAllLayers();
  });
  return () => {
    unregister();
    stopperRegistered = false;
  };
}

/** Test helper — replace singleton between cases. */
export function __resetLayeredAudioSessionForTests(
  next?: LayeredAudioEngine | null,
): void {
  if (engine) {
    engine.stopAll();
  }
  engine = next ?? null;
  stopperRegistered = false;
}
