/**
 * Estate Soundscapes — Layer 2 optional overlay on place ambience.
 * Never replaces Layer 1 — layers over it.
 */

import { soundscapeById, soundscapePlaybackFrom } from "@/lib/soundscapes";
import type { SoundscapePlayback } from "@/lib/soundscapes/types";
import {
  effectiveEstateLayerVolume,
  isEstateSoundscapeOverlayEnabled,
} from "./estateAudioSettings";
import {
  clearActiveEnvironmentalAudioState,
  isAudioPlaybackGuardEnabled,
  prepareSingleTrackPlayback,
} from "./audioPlaybackGuard";
import { fadeAudioVolumeAsync } from "@/lib/welcomeAudio/fadeVolume";

const OVERLAY_CROSSFADE_MS = 650;
const OVERLAY_BASE_VOLUME = 0.22;

export type EstateSoundscapeOverlayPlayResult =
  | { ok: true; overlayId: string }
  | {
      ok: false;
      overlayId: string;
      reason: "invalid_url" | "play_rejected" | "not_started";
      message: string;
    };

let overlayAudio: HTMLAudioElement | null = null;
let activeOverlayId: string | null = null;
let overlayFadeToken = 0;

/**
 * Now Playing / persistence subscribers — mini players, GlobalSoundControl,
 * and any room UI that needs to reflect Layer 2 overlay state reactively.
 * Module-scoped Audio() survives React unmounts; this pub/sub lets components
 * stay in sync without owning a second copy of the audio element.
 */
const overlayListeners = new Set<() => void>();

function notifyOverlayListeners(): void {
  for (const listener of [...overlayListeners]) {
    try {
      listener();
    } catch {
      /* ignore */
    }
  }
}

export function subscribeEstateSoundscapeOverlay(
  listener: () => void,
): () => void {
  overlayListeners.add(listener);
  return () => {
    overlayListeners.delete(listener);
  };
}

function ensureOverlayAudio(): HTMLAudioElement {
  if (!overlayAudio) {
    overlayAudio = new Audio();
    overlayAudio.loop = true;
    overlayAudio.preload = "auto";
    overlayAudio.addEventListener("play", notifyOverlayListeners);
    overlayAudio.addEventListener("pause", notifyOverlayListeners);
    overlayAudio.addEventListener("ended", notifyOverlayListeners);
  }
  return overlayAudio;
}

export function activeEstateSoundscapeOverlayId(): string | null {
  return activeOverlayId;
}

/** True only while the overlay has an active track and is not paused. */
export function isEstateSoundscapeOverlayPlaying(): boolean {
  return Boolean(activeOverlayId && overlayAudio && !overlayAudio.paused);
}

export async function stopEstateSoundscapeOverlay(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = ++overlayFadeToken;
  const hadActive = activeOverlayId !== null;
  activeOverlayId = null;
  clearActiveEnvironmentalAudioState();
  if (!overlayAudio) {
    if (hadActive) notifyOverlayListeners();
    return;
  }
  await fadeAudioVolumeAsync(overlayAudio, 0, OVERLAY_CROSSFADE_MS);
  if (token !== overlayFadeToken) return;
  overlayAudio.pause();
  overlayAudio.currentTime = 0;
  if (hadActive) notifyOverlayListeners();
}

/**
 * Pause without clearing the active track — Play/Pause from any surface can
 * resume the same soundscape rather than restarting it.
 */
export async function pauseEstateSoundscapeOverlay(): Promise<void> {
  if (!overlayAudio || !activeOverlayId) return;
  overlayAudio.pause();
}

/** Resume a previously paused overlay track. No-op if nothing is loaded. */
export async function resumeEstateSoundscapeOverlay(): Promise<EstateSoundscapeOverlayPlayResult> {
  if (!overlayAudio || !activeOverlayId) {
    return {
      ok: false,
      overlayId: activeOverlayId ?? "unknown",
      reason: "not_started",
      message: "Choose a track, then press Play.",
    };
  }
  const overlayId = activeOverlayId;
  try {
    await overlayAudio.play();
  } catch {
    return {
      ok: false,
      overlayId,
      reason: "play_rejected",
      message:
        "The browser blocked playback. Click Play again, or turn Sound On in the header first.",
    };
  }
  return { ok: true, overlayId };
}

async function startOverlayPlayback(
  overlayId: string,
  playbackUrl: string,
): Promise<EstateSoundscapeOverlayPlayResult> {
  if (typeof window === "undefined") {
    return {
      ok: false,
      overlayId,
      reason: "not_started",
      message: "Soundscapes can only play in the browser.",
    };
  }
  if (!/\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?|$)/i.test(playbackUrl)) {
    return {
      ok: false,
      overlayId,
      reason: "invalid_url",
      message:
        "That soundscape could not be loaded. Try another one, or try again in a moment.",
    };
  }

  // Intentional Play must work even if the overlay pref was previously off.
  if (!isEstateSoundscapeOverlayEnabled()) {
    const { patchEstateAudioSettings } = await import("./estateAudioSettings");
    patchEstateAudioSettings({
      silenced: false,
      soundscapeOverlayEnabled: true,
    });
  }

  if (isAudioPlaybackGuardEnabled()) {
    await prepareSingleTrackPlayback(`overlay:${overlayId}`);
    const { stopEstateRoomAmbience } = await import("./estateRoomAmbience");
    await stopEstateRoomAmbience();
  }

  const token = ++overlayFadeToken;
  const audio = ensureOverlayAudio();
  const resolved = new URL(playbackUrl, window.location.origin).href;
  if (audio.src !== resolved) {
    audio.src = resolved;
    try {
      audio.load();
    } catch {
      /* ignore */
    }
    audio.currentTime = 0;
  }

  audio.volume = 0;
  try {
    await audio.play();
  } catch {
    return {
      ok: false,
      overlayId,
      reason: "play_rejected",
      message:
        "The browser blocked playback. Click Play again, or turn Sound On in the header first.",
    };
  }

  if (token !== overlayFadeToken) {
    return {
      ok: false,
      overlayId,
      reason: "not_started",
      message: "Another soundscape started instead. Try Play once more.",
    };
  }
  activeOverlayId = overlayId;
  notifyOverlayListeners();
  const target = effectiveEstateLayerVolume(OVERLAY_BASE_VOLUME);
  await fadeAudioVolumeAsync(audio, target, OVERLAY_CROSSFADE_MS);
  return { ok: true, overlayId };
}

export async function startEstateSoundscapeOverlay(
  soundscapeId: string,
): Promise<EstateSoundscapeOverlayPlayResult> {
  const soundscape = soundscapeById(soundscapeId);
  if (!soundscape) {
    return {
      ok: false,
      overlayId: soundscapeId,
      reason: "invalid_url",
      message: "That soundscape is not available right now.",
    };
  }

  const playback: SoundscapePlayback = soundscapePlaybackFrom(soundscape);
  return startOverlayPlayback(soundscapeId, playback.playbackUrl);
}

export async function startEstateSoundscapeOverlayFromUrl(
  overlayId: string,
  playbackUrl: string,
): Promise<EstateSoundscapeOverlayPlayResult> {
  return startOverlayPlayback(overlayId, playbackUrl);
}

export async function refreshEstateSoundscapeOverlayVolume(): Promise<void> {
  if (!overlayAudio || !activeOverlayId) return;
  if (!isEstateSoundscapeOverlayEnabled()) {
    await stopEstateSoundscapeOverlay();
    return;
  }
  const target = effectiveEstateLayerVolume(OVERLAY_BASE_VOLUME);
  await fadeAudioVolumeAsync(overlayAudio, target, 320);
}
