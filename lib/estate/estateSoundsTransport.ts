/**
 * Canonical Estate Sounds transport — one On / Paused / Off home for all
 * intentional audio (Layer 2 soundscape + layered mix).
 */

import {
  activeSoundscapeLabel,
  isSoundscapePlaying,
  pauseSoundscapeOverlay,
  resumeSoundscapeOverlay,
  stopSoundscapeOverlay,
  subscribeSoundscapePlayback,
} from "@/lib/estate/estateAudioService";
import {
  getEstateAudioSettings,
  setEstateSilenced,
  subscribeEstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import { stopAllAudio } from "@/lib/estate/stopAllAudio";
import {
  getLayeredAudioEngine,
  getLayeredAudioSnapshot,
  subscribeLayeredAudio,
} from "@/lib/layeredAudio/session";
import { layeredAudioPresetById } from "@/lib/layeredAudio/presets";

export type EstateSoundsPlaybackState = "on" | "paused" | "off";

export type EstateSoundsTransportSnapshot = {
  playbackState: EstateSoundsPlaybackState;
  /** Short mix summary for the panel, e.g. "Rain · Fireplace · Soft Piano". */
  mixSummary: string | null;
  /** Friendly title when a preset is active. */
  mixTitle: string | null;
  /** Accessible closed-control label. */
  closedLabel: string;
};

type Listener = () => void;

let memberPaused = false;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

function layeredPlaying(): boolean {
  try {
    return getLayeredAudioEngine().hasPlayingLayers();
  } catch {
    return false;
  }
}

function layeredSelected(): boolean {
  try {
    return getLayeredAudioEngine().hasSelectedMix();
  } catch {
    return false;
  }
}

function buildMixSummary(): {
  mixSummary: string | null;
  mixTitle: string | null;
} {
  const snap = getLayeredAudioSnapshot();
  const parts: string[] = [];
  for (const env of snap.environmentTracks) {
    parts.push(env.title);
  }
  if (snap.music) parts.push(snap.music.title);
  if (snap.voice) parts.push(snap.voice.title);

  const soundscape = activeSoundscapeLabel();
  if (soundscape && !parts.includes(soundscape)) {
    parts.unshift(soundscape);
  }

  let mixTitle: string | null = null;
  if (snap.activePresetId) {
    mixTitle = layeredAudioPresetById(snap.activePresetId)?.title ?? null;
  }
  if (!mixTitle && soundscape && parts.length === 1) {
    mixTitle = soundscape;
  }

  return {
    mixSummary: parts.length > 0 ? parts.join(" · ") : null,
    mixTitle,
  };
}

export function getEstateSoundsPlaybackState(): EstateSoundsPlaybackState {
  const silenced = getEstateAudioSettings().silenced;
  if (silenced) return "off";
  if (memberPaused) return "paused";
  if (isSoundscapePlaying() || layeredPlaying()) return "on";
  if (layeredSelected() || activeSoundscapeLabel()) {
    // Selected but not currently audible — treat as paused if member paused,
    // otherwise Off/ready. Prefer "off" when nothing is playing and not paused.
    return "off";
  }
  return "off";
}

export function getEstateSoundsTransportSnapshot(): EstateSoundsTransportSnapshot {
  const playbackState = getEstateSoundsPlaybackState();
  const { mixSummary, mixTitle } = buildMixSummary();
  const closedLabel =
    playbackState === "on"
      ? "Sounds On"
      : playbackState === "paused"
        ? "Sounds Paused"
        : "Sounds Off";
  return {
    playbackState,
    mixSummary,
    mixTitle,
    closedLabel,
  };
}

export function subscribeEstateSoundsTransport(listener: Listener): () => void {
  listeners.add(listener);
  const unsubSettings = subscribeEstateAudioSettings(() => notify());
  const unsubSoundscape = subscribeSoundscapePlayback(() => notify());
  const unsubLayered = subscribeLayeredAudio(() => notify());
  return () => {
    listeners.delete(listener);
    unsubSettings();
    unsubSoundscape();
    unsubLayered();
  };
}

/** Pause every active intentional sound; preserve selection + positions. */
export async function pauseEstateSounds(): Promise<void> {
  memberPaused = true;
  setEstateSilenced(false);
  await pauseSoundscapeOverlay();
  try {
    await getLayeredAudioEngine().pauseAllLayers();
  } catch {
    /* engine optional in tests */
  }
  notify();
}

/** Resume the same selected mix without duplicating instances. */
export async function resumeEstateSounds(): Promise<void> {
  memberPaused = false;
  setEstateSilenced(false);
  await resumeSoundscapeOverlay();
  try {
    await getLayeredAudioEngine().resumeAllLayers();
  } catch {
    /* engine optional */
  }
  // If the browser could not restart audio, keep Paused so the UI stays honest.
  if (
    !isSoundscapePlaying() &&
    !layeredPlaying() &&
    (layeredSelected() || activeSoundscapeLabel())
  ) {
    memberPaused = true;
  }
  notify();
}

/**
 * Stop all audio and silence Estate sounds.
 * Selected layered mix is paused (not cleared) so Turn On can resume.
 * Soundscape overlay is stopped (Layer 2 has no durable selection store).
 */
export async function turnOffEstateSounds(): Promise<void> {
  memberPaused = false;
  try {
    await getLayeredAudioEngine().pauseAllLayers();
  } catch {
    /* optional */
  }
  await stopSoundscapeOverlay();
  await stopAllAudio({ silenceEstate: true });
  // Authoritative Off — do not rely solely on stopAllAudio side effects.
  setEstateSilenced(true);
  // Re-pause layered after stopAll may have cleared via stopper — if cleared,
  // Off still succeeded; Turn On starts from whatever remains selected.
  try {
    if (getLayeredAudioEngine().hasSelectedMix()) {
      await getLayeredAudioEngine().pauseAllLayers();
    }
  } catch {
    /* optional */
  }
  notify();
}

/** Clear silence so Estate can play again; resume paused mix when present. */
export async function turnOnEstateSounds(): Promise<void> {
  setEstateSilenced(false);
  if (memberPaused || layeredSelected() || activeSoundscapeLabel()) {
    await resumeEstateSounds();
    return;
  }
  memberPaused = false;
  notify();
}

/** Called when a contextual Play starts audio — clears paused/off silence. */
export function noteEstateSoundsStarted(): void {
  memberPaused = false;
  if (getEstateAudioSettings().silenced) {
    setEstateSilenced(false);
  }
  notify();
}

/** Test helper. */
export function __resetEstateSoundsTransportForTests(): void {
  memberPaused = false;
  notify();
}
