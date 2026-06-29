import { fadeAudioVolumeAsync } from "@/lib/welcomeAudio/fadeVolume";
import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";
import { gardenDestinationCardFor } from "./gardenDestinationCards";

const CROSSFADE_MS = 460;
const FADE_OUT_MS = 420;
const HOVER_VOLUME = 0.11;

type AudioSlot = "a" | "b";

let slotA: HTMLAudioElement | null = null;
let slotB: HTMLAudioElement | null = null;
let activeSlot: AudioSlot | null = null;
let currentCardId: string | null = null;
let fadeToken = 0;

function ensureSlot(slot: AudioSlot): HTMLAudioElement {
  const existing = slot === "a" ? slotA : slotB;
  if (existing) return existing;

  const audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";

  if (slot === "a") {
    slotA = audio;
  } else {
    slotB = audio;
  }
  return audio;
}

function otherSlot(slot: AudioSlot): AudioSlot {
  return slot === "a" ? "b" : "a";
}

function resolveSrc(audio: HTMLAudioElement, src: string): void {
  const resolved = new URL(src, window.location.origin).href;
  if (audio.src !== resolved) {
    audio.src = src;
    audio.currentTime = 0;
  }
}

async function fadeOutSlot(audio: HTMLAudioElement, token: number): Promise<void> {
  await fadeAudioVolumeAsync(audio, 0, FADE_OUT_MS);
  if (token !== fadeToken) return;
  audio.pause();
  audio.currentTime = 0;
}

/** Soft ambient preview when hovering a destination invitation card. */
export async function crossfadeGardenCardAmbience(
  cardId: string | null,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (prefersReducedMotion()) {
    if (!cardId) await stopGardenCardAmbience();
    return;
  }

  if (cardId === currentCardId) return;

  const token = ++fadeToken;
  currentCardId = cardId;

  if (!cardId) {
    const playing = activeSlot ? ensureSlot(activeSlot) : null;
    activeSlot = null;
    if (playing) {
      await fadeOutSlot(playing, token);
    }
    return;
  }

  const src = gardenDestinationCardFor(cardId)?.hoverAmbienceUrl;
  if (!src) {
    await stopGardenCardAmbience();
    return;
  }

  const nextSlot: AudioSlot = activeSlot ? otherSlot(activeSlot) : "a";
  const next = ensureSlot(nextSlot);
  const prev = activeSlot ? ensureSlot(activeSlot) : null;

  resolveSrc(next, src);
  next.volume = 0;

  try {
    await next.play();
  } catch {
    return;
  }

  if (token !== fadeToken) return;

  activeSlot = nextSlot;

  await Promise.all([
    fadeAudioVolumeAsync(next, HOVER_VOLUME, CROSSFADE_MS),
    prev && prev !== next ? fadeAudioVolumeAsync(prev, 0, CROSSFADE_MS) : Promise.resolve(),
  ]);

  if (token !== fadeToken) return;

  if (prev && prev !== next) {
    prev.pause();
    prev.currentTime = 0;
  }
}

export async function stopGardenCardAmbience(): Promise<void> {
  if (typeof window === "undefined") return;
  currentCardId = null;
  const token = ++fadeToken;
  const playing = activeSlot ? ensureSlot(activeSlot) : null;
  activeSlot = null;
  if (playing) {
    await fadeOutSlot(playing, token);
  }
}
