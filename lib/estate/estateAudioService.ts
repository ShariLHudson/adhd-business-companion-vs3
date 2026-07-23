/**
 * Estate Audio Service — one facade for master audio + intentional playback.
 *
 * Master control lives only in the header GlobalSoundControl (Sound On/Off).
 * Experiences call playback helpers (play / pause / stop / volume) — never a
 * second global mute.
 */

import {
  getEstateAudioSettings,
  getEstateMasterVolume,
  isEstateSilenced,
  patchEstateAudioSettings,
  setEstateSilenced,
  subscribeEstateAudioSettings,
  type EstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import {
  registerEstateMediaStopper,
  stopAllAudio,
} from "@/lib/estate/stopAllAudio";
import { patchEstateRuntimeState } from "@/lib/estate/estateRuntimeState";
import {
  activeEstateSoundscapeOverlayId,
  isEstateSoundscapeOverlayPlaying,
  pauseEstateSoundscapeOverlay,
  resumeEstateSoundscapeOverlay,
  startEstateSoundscapeOverlayFromUrl,
  stopEstateSoundscapeOverlay,
  subscribeEstateSoundscapeOverlay,
} from "@/lib/estate/estateSoundscapeOverlay";
import {
  experienceSoundscapeTrackById,
  type ExperienceSoundscapeTrack,
} from "@/lib/soundscapes/experienceSoundscapesMenu";

export type EstateAudioPlayFailureReason =
  | "invalid_url"
  | "play_rejected"
  | "not_started"
  | "unknown";

export type EstateAudioPlayResult =
  | { ok: true; trackId: string }
  | {
      ok: false;
      trackId: string;
      reason: EstateAudioPlayFailureReason;
      message: string;
    };

/** True when the header master allows sound (Sound On). */
export function isMasterSoundOn(): boolean {
  return !isEstateSilenced();
}

export function getMasterAudioSettings(): EstateAudioSettings {
  return getEstateAudioSettings();
}

export function subscribeMasterAudio(
  listener: () => void,
): () => void {
  return subscribeEstateAudioSettings(listener);
}

/** Header Sound Off — stop everything and persist silence. */
export async function masterSoundOff(): Promise<void> {
  await stopAllAudio({ silenceEstate: true });
}

/** Header Sound On — allow playback; does not auto-resume a track. */
export function masterSoundOn(): void {
  setEstateSilenced(false);
}

export function setMasterVolume(volume: number): EstateAudioSettings {
  return patchEstateAudioSettings({ masterVolume: volume });
}

export function getMasterVolume(): number {
  return getEstateMasterVolume();
}

/**
 * Explicit Play always clears silence so choosing a track is enough.
 * Sound Off remains available in the header afterward.
 */
export function allowIntentionalPlayback(): EstateAudioSettings {
  return patchEstateAudioSettings({
    silenced: false,
    soundscapeOverlayEnabled: true,
  });
}

export function registerPlaybackStopper(stop: () => void): () => void {
  return registerEstateMediaStopper(stop);
}

export async function stopAllEstateAudio(opts?: {
  silenceEstate?: boolean;
}): Promise<void> {
  await stopAllAudio(opts);
}

/**
 * Soundscapes menu / Experience Play path.
 * Enables overlay, clears silence, loads URL, and verifies playback started.
 */
export async function playSoundscapeTrack(
  track: ExperienceSoundscapeTrack,
): Promise<EstateAudioPlayResult> {
  if (!track?.src || !/\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?|$)/i.test(track.src)) {
    return {
      ok: false,
      trackId: track?.id ?? "unknown",
      reason: "invalid_url",
      message:
        "That soundscape could not be loaded. Try another one, or try again in a moment.",
    };
  }

  allowIntentionalPlayback();
  patchEstateRuntimeState({ activeSoundscape: track.id });

  const result = await startEstateSoundscapeOverlayFromUrl(track.id, track.src);
  if (!result.ok) {
    return {
      ok: false,
      trackId: track.id,
      reason: result.reason,
      message: result.message,
    };
  }

  if (activeEstateSoundscapeOverlayId() !== track.id) {
    return {
      ok: false,
      trackId: track.id,
      reason: "not_started",
      message:
        "That soundscape did not start. Turn Sound On in the header, then try Play again.",
    };
  }

  return { ok: true, trackId: track.id };
}

export async function stopSoundscapeOverlay(): Promise<void> {
  await stopEstateSoundscapeOverlay();
  patchEstateRuntimeState({ activeSoundscape: null });
}

/** Pause without losing the track — Play resumes rather than restarting. */
export async function pauseSoundscapeOverlay(): Promise<void> {
  await pauseEstateSoundscapeOverlay();
}

export async function resumeSoundscapeOverlay(): Promise<EstateAudioPlayResult> {
  const result = await resumeEstateSoundscapeOverlay();
  if (!result.ok) {
    return {
      ok: false,
      trackId: result.overlayId,
      reason: result.reason,
      message: result.message,
    };
  }
  return { ok: true, trackId: result.overlayId };
}

/**
 * True global "Now Playing" state for the persistent soundscape layer —
 * survives navigation until the member explicitly stops it (Spec: Peaceful
 * Moments continuity). Any surface (mini player, Music Room, header sound
 * control) can subscribe instead of owning a second audio engine.
 */
export function subscribeSoundscapePlayback(listener: () => void): () => void {
  return subscribeEstateSoundscapeOverlay(listener);
}

export function activeSoundscapeTrackId(): string | null {
  return activeEstateSoundscapeOverlayId();
}

export function isSoundscapePlaying(): boolean {
  return isEstateSoundscapeOverlayPlaying();
}

/** Friendly label for whatever is currently playing, when known. */
export function activeSoundscapeLabel(): string | null {
  const id = activeEstateSoundscapeOverlayId();
  if (!id) return null;
  return experienceSoundscapeTrackById(id)?.title ?? "Peaceful Moments";
}
