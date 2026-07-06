/**
 * Estate Ambient Sound Engine™ — Layer 1 place ambience with crossfade.
 * One place at a time — never overlapping place identities.
 */

import { effectiveAmbienceVolume } from "@/lib/estate/estateAmbienceVolume";
import { isEstateAmbienceEnabled } from "@/lib/estate/estateAmbiencePreference";
import {
  isEstateSilenced,
} from "@/lib/estate/estateAudioSettings";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";
import { refreshEstateSoundscapeOverlayVolume } from "@/lib/estate/estateSoundscapeOverlay";
import { fadeAudioVolumeAsync } from "@/lib/welcomeAudio/fadeVolume";
import {
  ESTATE_AMBIENCE_FALLBACK_MP3,
  GREENHOUSE_BIRDS_AMBIENCE_MP3,
  OCEAN_CONSERVATORY_AMBIENCE_MP3,
  ORCHARD_BIRDS_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";
import type { EstateArrivalAmbienceProfile } from "./estateArrivalExperience";

const CROSSFADE_MS = 650;
const FADE_OUT_MS = 480;

let slotA: HTMLAudioElement | null = null;
let slotB: HTMLAudioElement | null = null;
let activeSlot: "a" | "b" | null = null;
let currentRoomId: string | null = null;
let activeAmbienceSrc: string | null = null;
let transitionInFlight: string | null = null;
let fadeToken = 0;

export type EstateRoomAmbienceStartOptions = {
  /** Member clicked Sound on — unlock autoplay; skip reduced-motion block. */
  userInitiated?: boolean;
};

function ensureSlot(slot: "a" | "b"): HTMLAudioElement {
  const existing = slot === "a" ? slotA : slotB;
  if (existing) return existing;
  const audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";
  if (slot === "a") slotA = audio;
  else slotB = audio;
  return audio;
}

function otherSlot(slot: "a" | "b"): "a" | "b" {
  return slot === "a" ? "b" : "a";
}

function resolveAmbienceSrc(src: string): string {
  return new URL(src, window.location.origin).href;
}

function sameAmbienceSrc(a: string, b: string): boolean {
  return resolveAmbienceSrc(a) === resolveAmbienceSrc(b);
}

function ambienceSrcCandidates(primarySrc: string): string[] {
  if (primarySrc === OCEAN_CONSERVATORY_AMBIENCE_MP3) {
    return [primarySrc];
  }
  if (primarySrc === GREENHOUSE_BIRDS_AMBIENCE_MP3) {
    return [primarySrc, ORCHARD_BIRDS_AMBIENCE_MP3];
  }
  if (primarySrc === ORCHARD_BIRDS_AMBIENCE_MP3) {
    return [
      primarySrc,
      GREENHOUSE_BIRDS_AMBIENCE_MP3,
      ESTATE_AMBIENCE_FALLBACK_MP3,
    ];
  }
  const list = [primarySrc, ESTATE_AMBIENCE_FALLBACK_MP3];
  return [...new Set(list)];
}

async function fadeOutSlot(audio: HTMLAudioElement, token: number): Promise<void> {
  await fadeAudioVolumeAsync(audio, 0, FADE_OUT_MS);
  if (token !== fadeToken) return;
  audio.pause();
}

function assignAmbienceSrc(audio: HTMLAudioElement, src: string): void {
  const resolved = resolveAmbienceSrc(src);
  if (audio.src !== resolved) {
    audio.src = src;
    audio.currentTime = 0;
  }
}

function playAmbienceWithFallback(
  audio: HTMLAudioElement,
  candidates: string[],
  candidateIndex = 0,
): Promise<void> {
  if (candidateIndex >= candidates.length) {
    return Promise.reject(new Error("estate_ambience_unavailable"));
  }

  assignAmbienceSrc(audio, candidates[candidateIndex]!);
  audio.volume = 0;

  return audio.play().catch((error: unknown) => {
    if (candidateIndex + 1 < candidates.length) {
      return playAmbienceWithFallback(audio, candidates, candidateIndex + 1);
    }
    throw error;
  });
}

function continueSameAmbienceLoop(
  roomId: string,
  profile: EstateArrivalAmbienceProfile,
): void {
  currentRoomId = roomId;
  activeAmbienceSrc = profile.src;
  if (!activeSlot) return;
  const playing = ensureSlot(activeSlot);
  const target = effectiveAmbienceVolume(profile.volume);
  void fadeAudioVolumeAsync(playing, target, 300);
}

/**
 * Start room ambience from a member click — call synchronously inside onClick
 * so the browser keeps the user-gesture unlock for audio.play().
 */
export function kickstartEstateRoomAmbience(
  roomId: string,
  profile: EstateArrivalAmbienceProfile,
): void {
  if (typeof window === "undefined") return;

  if (transitionInFlight === roomId) return;

  if (currentRoomId === roomId && activeSlot) {
    continueSameAmbienceLoop(roomId, profile);
    return;
  }

  if (
    activeSlot &&
    activeAmbienceSrc &&
    sameAmbienceSrc(activeAmbienceSrc, profile.src)
  ) {
    continueSameAmbienceLoop(roomId, profile);
    return;
  }

  const token = ++fadeToken;
  transitionInFlight = roomId;

  const nextSlot = activeSlot ? otherSlot(activeSlot) : "a";
  const incoming = ensureSlot(nextSlot);
  const outgoing = activeSlot ? ensureSlot(activeSlot) : null;
  const candidates = ambienceSrcCandidates(profile.src);

  void playAmbienceWithFallback(incoming, candidates)
    .then(async () => {
      if (token !== fadeToken) return;
      transitionInFlight = null;
      currentRoomId = roomId;
      activeAmbienceSrc = profile.src;
      activeSlot = nextSlot;

      const target = effectiveAmbienceVolume(profile.volume);
      if (outgoing && outgoing !== incoming) {
        void fadeOutSlot(outgoing, token);
      }
      await fadeAudioVolumeAsync(incoming, target, CROSSFADE_MS);
    })
    .catch(() => {
      if (token !== fadeToken) return;
      transitionInFlight = null;
    });
}

export async function startEstateRoomAmbience(
  roomId: string,
  profile: EstateArrivalAmbienceProfile,
  options?: EstateRoomAmbienceStartOptions,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!options?.userInitiated) {
    // Place ambience is hospitality — not gated by prefers-reduced-motion (visual motion only).
    if (!isEstateAmbienceEnabled()) return;
  }

  if (currentRoomId === roomId && activeSlot) {
    const playing = ensureSlot(activeSlot);
    const target = effectiveAmbienceVolume(profile.volume);
    if (Math.abs(playing.volume - target) > 0.02) {
      await fadeAudioVolumeAsync(playing, target, 400);
    }
    return;
  }

  if (
    activeSlot &&
    activeAmbienceSrc &&
    sameAmbienceSrc(activeAmbienceSrc, profile.src)
  ) {
    continueSameAmbienceLoop(roomId, profile);
    return;
  }

  kickstartEstateRoomAmbience(roomId, profile);
}

export async function stopEstateRoomAmbience(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = ++fadeToken;
  currentRoomId = null;
  activeSlot = null;
  activeAmbienceSrc = null;
  transitionInFlight = null;

  const outs = [slotA, slotB].filter(Boolean) as HTMLAudioElement[];
  await Promise.all(
    outs.map(async (el) => {
      await fadeAudioVolumeAsync(el, 0, FADE_OUT_MS);
      if (token !== fadeToken) return;
      el.pause();
      el.currentTime = 0;
    }),
  );
}

export function activeEstateAmbienceRoomId(): string | null {
  return currentRoomId;
}

/**
 * Transition Layer 1 ambient sound on goToPlace — stops prior place, fades in new.
 * Keeps Layer 2 soundscape overlay if active.
 */
export async function transitionEstatePlaceAmbient(
  placeId: string,
  options?: EstateRoomAmbienceStartOptions,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (isEstateSilenced()) {
    await stopEstateRoomAmbience();
    return;
  }

  const profile = resolveEstatePlaceAmbientProfile(placeId);
  if (!profile) {
    // Place has no Layer 1 loop — still silence the previous room (one sound at a time).
    if (currentRoomId !== null && currentRoomId !== placeId) {
      await stopEstateRoomAmbience();
    }
    return;
  }

  await startEstateRoomAmbience(placeId, profile, options);
  void refreshEstateSoundscapeOverlayVolume();
}
