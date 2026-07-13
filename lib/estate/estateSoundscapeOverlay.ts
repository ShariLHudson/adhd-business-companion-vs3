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

let overlayAudio: HTMLAudioElement | null = null;
let activeOverlayId: string | null = null;
let overlayFadeToken = 0;

function ensureOverlayAudio(): HTMLAudioElement {
  if (!overlayAudio) {
    overlayAudio = new Audio();
    overlayAudio.loop = true;
    overlayAudio.preload = "auto";
  }
  return overlayAudio;
}

export function activeEstateSoundscapeOverlayId(): string | null {
  return activeOverlayId;
}

export async function stopEstateSoundscapeOverlay(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = ++overlayFadeToken;
  activeOverlayId = null;
  clearActiveEnvironmentalAudioState();
  if (!overlayAudio) return;
  await fadeAudioVolumeAsync(overlayAudio, 0, OVERLAY_CROSSFADE_MS);
  if (token !== overlayFadeToken) return;
  overlayAudio.pause();
  overlayAudio.currentTime = 0;
}

async function startOverlayPlayback(
  overlayId: string,
  playbackUrl: string,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isEstateSoundscapeOverlayEnabled()) return;
  if (!/\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?|$)/i.test(playbackUrl)) {
    return;
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
    audio.src = playbackUrl;
    audio.currentTime = 0;
  }

  audio.volume = 0;
  try {
    await audio.play();
  } catch {
    return;
  }

  if (token !== overlayFadeToken) return;
  activeOverlayId = overlayId;
  const target = effectiveEstateLayerVolume(OVERLAY_BASE_VOLUME);
  await fadeAudioVolumeAsync(audio, target, OVERLAY_CROSSFADE_MS);
}

export async function startEstateSoundscapeOverlay(
  soundscapeId: string,
): Promise<void> {
  const soundscape = soundscapeById(soundscapeId);
  if (!soundscape) return;

  const playback: SoundscapePlayback = soundscapePlaybackFrom(soundscape);
  await startOverlayPlayback(soundscapeId, playback.playbackUrl);
}

export async function startEstateSoundscapeOverlayFromUrl(
  overlayId: string,
  playbackUrl: string,
): Promise<void> {
  await startOverlayPlayback(overlayId, playbackUrl);
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
